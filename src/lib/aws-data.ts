import awsData from "@/data/aws-services.json";
import type { AWSData, AWSService, CategoryInfo } from "@/types/aws";

const data = awsData as AWSData;

// Category icons and descriptions for the home page grid
const categoryMeta: Record<string, { icon: string; description: string }> = {
  "Compute": {
    icon: "⚡",
    description: "Run code and applications at any scale"
  },
  "Storage": {
    icon: "📦",
    description: "Store and retrieve any amount of data"
  },
  "Database": {
    icon: "🗄️",
    description: "Managed relational and NoSQL databases"
  },
  "Networking & Content Delivery": {
    icon: "🌐",
    description: "Connect, deliver, and protect your apps"
  },
  "Security, Identity & Compliance": {
    icon: "🔐",
    description: "Protect your data and manage access"
  },
  "Management & Governance": {
    icon: "📊",
    description: "Monitor, manage, and optimize resources"
  },
  "Application Integration": {
    icon: "🔗",
    description: "Decouple and connect your applications"
  },
  "Analytics & Business Intelligence": {
    icon: "📈",
    description: "Process and analyze data at scale"
  },
  "AI & Machine Learning": {
    icon: "🧠",
    description: "Add intelligence to your applications"
  },
  "Developer Tools": {
    icon: "🛠️",
    description: "Build, test, and deploy faster"
  },
  "Containers & Orchestration": {
    icon: "🐳",
    description: "Run and manage containerized apps"
  },
  "Migration & Transfer": {
    icon: "🚛",
    description: "Move data and workloads into AWS at any scale"
  },
};

export function getCategories(): CategoryInfo[] {
  return data.metadata.categories.map((name) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
    const services = data.services.filter((s) => s.category === name);
    const meta = categoryMeta[name] || { icon: "📁", description: "AWS services" };
    
    return {
      name,
      slug,
      serviceCount: services.length,
      description: meta.description,
      icon: meta.icon,
    };
  });
}

export function getServicesByCategory(categorySlug: string): AWSService[] {
  const categories = getCategories();
  const category = categories.find((c) => c.slug === categorySlug);
  if (!category) return [];
  
  return data.services.filter((s) => s.category === category.name);
}

export function getCategoryBySlug(slug: string): CategoryInfo | undefined {
  return getCategories().find((c) => c.slug === slug);
}

export function getServiceBySlug(serviceSlug: string): AWSService | undefined {
  return data.services.find(
    (s) => s.service_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "") === serviceSlug
  );
}

export function getServiceSlug(serviceName: string): string {
  return serviceName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
}

export function getAllServices(): AWSService[] {
  return data.services;
}

function normalizeSearch(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ")
}

export function searchServices(query: string): AWSService[] {
  const q = normalizeSearch(query)
  if (!q) return []

  const seen = new Set<string>()
  return data.services
    .map((service, index) => {
      const name = normalizeSearch(service.service_name)
      const names = [name, name.replace(/^(amazon|aws) /, "")]
      const rank = names.includes(q) ? 0
        : names.some((value) => value.startsWith(q)) ? 1
        : names.some((value) => value.includes(q)) ? 2
        : (service.search_keywords ?? []).some((value) => normalizeSearch(value).includes(q)) ? 3
        : [service.description, service.category].some((value) => normalizeSearch(value).includes(q)) ? 4
        : -1

      return { service, index, name, rank }
    })
    .filter(({ name, rank }) => {
      if (rank < 0 || seen.has(name)) return false
      seen.add(name)
      return true
    })
    .sort((a, b) => a.rank - b.rank || a.index - b.index)
    .map(({ service }) => service)
}

export function getMetadata() {
  return data.metadata;
}
