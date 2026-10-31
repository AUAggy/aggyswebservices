import { describe, it, expect, vi } from "vitest";
import {
  getAllServices,
  getCategories,
  getCategoryBySlug,
  getServiceBySlug,
  searchServices,
} from "@/lib/aws-data";

const cloudhsm = getServiceBySlug("aws-cloudhsm");
if (!cloudhsm) throw new Error("AWS CloudHSM entry missing from the catalog");

describe("catalog constraints", () => {
  it("keeps exactly 69 services across 12 categories", () => {
    expect(getAllServices()).toHaveLength(69);
    expect(getCategories()).toHaveLength(12);
  });

  it("lists AWS CloudHSM under Security, Identity & Compliance with 12 services", () => {
    expect(cloudhsm.category).toBe("Security, Identity & Compliance");
    expect(getCategoryBySlug("security-identity-compliance")?.serviceCount).toBe(12);
  });

  it("removes Amazon EMR and keeps Analytics & Business Intelligence at 5 services", () => {
    expect(getServiceBySlug("amazon-emr")).toBeUndefined();
    expect(getCategoryBySlug("analytics-business-intelligence")?.serviceCount).toBe(5);
  });
});

describe("Amazon Inspector replacing Amazon Rekognition", () => {
  const inspector = getServiceBySlug("amazon-inspector");
  if (!inspector) throw new Error("Amazon Inspector entry missing from the catalog");

  it("replaces Rekognition while retaining CodeCommit and S3 Glacier", () => {
    expect(inspector.category).toBe("Security, Identity & Compliance");
    expect(getServiceBySlug("amazon-rekognition")).toBeUndefined();
    expect(searchServices("Rekognition")).toEqual([]);
    expect(getCategoryBySlug("ai-machine-learning")?.serviceCount).toBe(5);
    expect(getServiceBySlug("aws-codecommit")?.service_name).toBe("AWS CodeCommit");
    expect(getServiceBySlug("amazon-s3-glacier")?.service_name).toBe("Amazon S3 Glacier");
  });

  it("keeps the reviewed entry format and accordion markers", () => {
    expect(inspector.key_capabilities).toHaveLength(6);
    const words = inspector.architectural_deep_dive.trim().split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(150);
    expect(words).toBeLessThanOrEqual(180);
    expect(inspector.architectural_deep_dive).toContain("Gotcha #1:");
    expect(inspector.architectural_deep_dive).toContain("Gotcha #2:");
    expect(inspector.architectural_deep_dive).toContain("Constraints:");
    expect(inspector.scenario_example).toMatch(/\bResult: .+$/);
    expect(inspector.aws_user_guide_documentation).toBe(
      "https://docs.aws.amazon.com/inspector/latest/user/what-is-inspector.html"
    );
  });

  it("is findable through its name and curated search terms", () => {
    for (const term of ["Inspector", "CVE", "enhanced scanning", "dependency scanning", "SAST", "IaC"]) {
      expect(searchServices(term)).toContain(inspector);
    }
  });
});

describe("search relevance and everyday terms", () => {
  it.each([
    ["queue", "Amazon SQS"],
    ["cloud watch", "Amazon CloudWatch"],
    ["elastic cache", "Amazon ElastiCache"],
    ["SFTP", "AWS Transfer Family"],
    ["SSO", "AWS IAM Identity Center"],
    ["Valkey", "Amazon ElastiCache"],
    ["CVE", "Amazon Inspector"],
    ["email", "Amazon SES"],
    ["monitoring", "Amazon CloudWatch"],
    ["Trino", "Amazon Athena"],
    ["SMTP", "Amazon SES"],
    ["serverless", "AWS Lambda"],
  ])("finds %s in %s", (query, name) => {
    expect(searchServices(query).map((service) => service.service_name)).toContain(name)
  })

  it("normalizes case and whitespace without discarding substring matches", () => {
    expect(searchServices(" s3 ")).toEqual(searchServices("S3"))
    expect(searchServices("S3")[0].service_name).toBe("Amazon S3")
    expect(searchServices("  CLOUD  \t WATCH  ")[0].service_name).toBe("Amazon CloudWatch")
    expect(searchServices("astiCa").some((service) => service.service_name === "Amazon ElastiCache")).toBe(true)
    expect(searchServices("#11")).toContain(cloudhsm)
    for (const query of ["", " \t \n", "s33"]) expect(searchServices(query)).toEqual([])
  })

  it("puts every exact full name first and never duplicates a service", () => {
    for (const service of getAllServices()) {
      expect(searchServices(service.service_name)[0]).toBe(service)
    }
    const results = searchServices("a")
    expect(new Set(results.map((service) => service.service_name)).size).toBe(results.length)
  })

  it("returns all 12 security services predictably without truncation", () => {
    const security = getAllServices().filter((service) => service.category === "Security, Identity & Compliance")
    const results = searchServices("security")
    expect(results).toHaveLength(12)
    expect(results).toEqual(expect.arrayContaining(security))
    expect(searchServices("security")).toEqual(results)
  })

  it("orders all five relevance tiers, keeps catalog ties, and deduplicates a small fixture", async () => {
    const entry = (service_name: string, fields = {}) => ({
      service_name, description: "Example", category: "Examples", ...fields,
    })
    const fixture = [
      entry("Amazon Rewidget"),
      entry("Keyword Service", { search_keywords: ["widget replacement"] }),
      entry("AWS Widget Pro"),
      entry("Description Service", { description: "Works with Amazon Widget" }),
      entry("Amazon Widget"),
      entry("AWS Widget"),
      entry("Category Service", { category: "Widget Category" }),
      entry("Amazon Widget"),
      entry("AWS Widget Toolkit"),
    ]
    vi.resetModules()
    vi.doMock("@/data/aws-services.json", () => ({ default: { services: fixture } }))
    try {
      const { searchServices: searchFixture, getAllServices: allFixture } = await import("@/lib/aws-data")
      expect(searchFixture("widget")).toEqual([
        fixture[4], fixture[5], fixture[2], fixture[8], fixture[0], fixture[1], fixture[3], fixture[6],
      ])
      expect(searchFixture("Amazon Widget")).toEqual([fixture[4], fixture[3]])
      expect(searchFixture("  WIDGET \t PRO  ")).toEqual([fixture[2]])
      expect(allFixture()).toEqual(fixture)
      expect(allFixture()[0]).toBe(fixture[0])
    } finally {
      vi.doUnmock("@/data/aws-services.json")
      vi.resetModules()
    }
  })
})

describe("AWS CloudHSM entry format", () => {
  it("has six capabilities and a 150-180 word technical field with parser markers", () => {
    expect(cloudhsm.key_capabilities).toHaveLength(6);
    const words = cloudhsm.architectural_deep_dive.trim().split(/\s+/).length;
    expect(words).toBeGreaterThanOrEqual(150);
    expect(words).toBeLessThanOrEqual(180);
    expect(cloudhsm.architectural_deep_dive).toContain("Gotcha #1:");
    expect(cloudhsm.architectural_deep_dive).toContain("Gotcha #2:");
    expect(cloudhsm.architectural_deep_dive).toContain("Constraints:");
  });

  it("ends the illustrative scenario with a Result summary and an AWS docs link", () => {
    expect(cloudhsm.scenario_example).toMatch(/\bResult: .+$/);
    expect(cloudhsm.aws_user_guide_documentation).toMatch(
      /^https:\/\/docs\.aws\.amazon\.com\/.*\.html$/
    );
  });

  it("ships a bundled icon reference for every service", () => {
    const slugify = (name: string) =>
      name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    for (const service of getAllServices()) {
      expect(service.icon).toBe(slugify(service.service_name));
    }
    expect(cloudhsm.icon).toBe("aws-cloudhsm");
  });

  it("is findable through name and curated search terms", () => {
    for (const term of [
      "CloudHSM",
      "hardware security module",
      "PKCS #11",
      "JCE",
      "TDE",
    ]) {
      expect(searchServices(term).some((s) => s.service_name === "AWS CloudHSM")).toBe(
        true
      );
    }
  });
});
