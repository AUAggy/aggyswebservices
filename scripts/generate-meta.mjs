import fs from "fs";
import path from "path";

const rootDir = process.cwd();
const publicDir = path.join(rootDir, "public");
const dataPath = path.join(rootDir, "src", "data", "aws-services.json");
const siteUrl = "https://aggyswebservices.com";

const raw = fs.readFileSync(dataPath, "utf-8");
const data = JSON.parse(raw);

// Deterministic build date: derive from the dataset's own last_updated so the
// generated meta files only change when the content does (no per-build timestamp
// churn). Falls back to the current time only if last_updated is missing/invalid.
const parsedLastUpdated = data.metadata?.last_updated
  ? new Date(data.metadata.last_updated)
  : null;
const buildDate = parsedLastUpdated && !Number.isNaN(parsedLastUpdated.getTime())
  ? parsedLastUpdated.toISOString()
  : new Date().toISOString();

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");

const categories = data.metadata.categories.map((name) => ({
  name,
  slug: slugify(name),
}));

const services = data.services.map((service) => ({
  name: service.service_name,
  description: service.description,
  category: service.category,
  categorySlug: slugify(service.category),
  slug: slugify(service.service_name),
}));

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir(publicDir);

const url = (pathname) => `${siteUrl}${pathname}`;

const routes = [
  { loc: url("/"), lastmod: buildDate },
  { loc: url("/terms/"), lastmod: buildDate },
  { loc: url("/license/"), lastmod: buildDate },
  ...categories.map((category) => ({
    loc: url(`/category/${category.slug}/`),
    lastmod: buildDate,
  })),
  ...services.map((service) => ({
    loc: url(`/category/${service.categorySlug}/${service.slug}/`),
    lastmod: buildDate,
  })),
];

const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  routes.map((route) => (
    `  <url>\n` +
    `    <loc>${route.loc}</loc>\n` +
    `    <lastmod>${route.lastmod}</lastmod>\n` +
    `  </url>`
  )).join("\n") +
  `\n</urlset>\n`;

fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemapXml);

const rssItems = services.slice(0, 200).map((service) => (
  `  <item>\n` +
  `    <title>${escapeXml(service.name)}</title>\n` +
  `    <link>${url(`/category/${service.categorySlug}/${service.slug}/`)}</link>\n` +
  `    <description>${escapeXml(service.description)}</description>\n` +
  `    <pubDate>${new Date(buildDate).toUTCString()}</pubDate>\n` +
  `    <guid isPermaLink="true">${url(`/category/${service.categorySlug}/${service.slug}/`)}</guid>\n` +
  `  </item>`
)).join("\n");

const rssXml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<rss version="2.0">\n` +
  `<channel>\n` +
  `  <title>AWS in Plain English — Service Catalog</title>\n` +
  `  <link>${siteUrl}/</link>\n` +
  `  <description>Plain-English explanations of AWS services.</description>\n` +
  `  <lastBuildDate>${new Date(buildDate).toUTCString()}</lastBuildDate>\n` +
  rssItems +
  `\n</channel>\n` +
  `</rss>\n`;

fs.writeFileSync(path.join(publicDir, "rss.xml"), rssXml);

const feedJson = {
  version: "https://jsonfeed.org/version/1.1",
  title: "AWS in Plain English — Service Catalog",
  home_page_url: `${siteUrl}/`,
  feed_url: `${siteUrl}/feed.json`,
  description: "Plain-English explanations of AWS services.",
  items: services.slice(0, 200).map((service) => ({
    id: url(`/category/${service.categorySlug}/${service.slug}/`),
    url: url(`/category/${service.categorySlug}/${service.slug}/`),
    title: service.name,
    summary: service.description,
    date_modified: buildDate,
  })),
};

fs.writeFileSync(path.join(publicDir, "feed.json"), JSON.stringify(feedJson, null, 2));

const robotsTxt = `# Global default: allow normal crawling\nUser-agent: *\nDisallow: /admin/\nDisallow: /internal/\nDisallow: /drafts/\nDisallow: /tmp/\nDisallow: /404.html\nDisallow: /thank-you/\nDisallow: /*?utm_*\nDisallow: /*?ref=*\n\n# IMPORTANT: do NOT block CSS/JS/fonts or core content directories\n\n# Major search engines (override defaults if needed)\nUser-agent: Googlebot\nAllow: /\nDisallow: /admin/\nDisallow: /internal/\n\nUser-agent: Bingbot\nAllow: /\nDisallow: /admin/\nDisallow: /internal/\n\n# AI / LLM crawlers\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: anthropic-ai\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: Meta-ExternalAgent\nAllow: /\n\n# Sitemaps\nSitemap: ${siteUrl}/sitemap.xml\n`;

fs.writeFileSync(path.join(publicDir, "robots.txt"), robotsTxt);

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

console.log("Generated sitemap.xml, rss.xml, feed.json, and robots.txt");
