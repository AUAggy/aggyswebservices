import { describe, it, expect } from "vitest";
import {
  getAllServices,
  getCategories,
  getCategoryBySlug,
  getServiceBySlug,
  searchServices,
} from "@/lib/aws-data";

const cloudhsm = getServiceBySlug("aws-cloudhsm");
if (!cloudhsm) throw new Error("AWS CloudHSM entry missing from the catalog");

describe("catalog constraints after the EMR to CloudHSM replacement", () => {
  it("keeps exactly 69 services across 12 categories", () => {
    expect(getAllServices()).toHaveLength(69);
    expect(getCategories()).toHaveLength(12);
  });

  it("lists AWS CloudHSM under Security, Identity & Compliance with 11 services", () => {
    expect(cloudhsm.category).toBe("Security, Identity & Compliance");
    expect(getCategoryBySlug("security-identity-compliance")?.serviceCount).toBe(11);
  });

  it("removes Amazon EMR and keeps Analytics & Business Intelligence at 5 services", () => {
    expect(getServiceBySlug("amazon-emr")).toBeUndefined();
    expect(getCategoryBySlug("analytics-business-intelligence")?.serviceCount).toBe(5);
  });
});

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
