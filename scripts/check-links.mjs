import fs from "fs";
import path from "path";

// Checks that every aws_user_guide_documentation URL in the dataset is still reachable.
//
// Network-dependent, so this is NOT part of the build/deploy path. Run it manually or in
// CI, e.g. as part of a periodic (biannual) content review:
//
//   npm run check:links
//
// Exits non-zero if any link is broken, so it can gate a CI job.

const rootDir = process.cwd();
const dataPath = path.join(rootDir, "src", "data", "aws-services.json");

const CONCURRENCY = 6;
const TIMEOUT_MS = 15000;

const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

// Deduplicate URLs, remembering which services use each one.
const urlToServices = new Map();
for (const service of data.services ?? []) {
  const url = service.aws_user_guide_documentation;
  if (typeof url !== "string" || url.trim() === "") continue;
  if (!urlToServices.has(url)) urlToServices.set(url, []);
  urlToServices.get(url).push(service.service_name);
}

const urls = [...urlToServices.keys()];

const checkOne = async (url) => {
  const attempt = async (method) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        signal: controller.signal,
        headers: { "User-Agent": "aggyswebservices-link-checker" },
      });
      return { status: res.status, ok: res.ok };
    } finally {
      clearTimeout(timer);
    }
  };

  try {
    // Prefer HEAD; some AWS docs endpoints reject it, so fall back to GET.
    let result = await attempt("HEAD");
    if (result.status === 405 || result.status === 403 || result.status === 501) {
      result = await attempt("GET");
    }
    return { url, ...result };
  } catch (e) {
    return { url, status: 0, ok: false, error: e.name === "AbortError" ? "timeout" : e.message };
  }
};

// Simple bounded-concurrency pool.
const runPool = async (items, worker, size) => {
  const results = [];
  let i = 0;
  const runners = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await worker(items[idx]);
    }
  });
  await Promise.all(runners);
  return results;
};

console.log(`Checking ${urls.length} unique documentation links...\n`);

const results = await runPool(urls, checkOne, CONCURRENCY);
const broken = results.filter((r) => !r.ok);

for (const r of results.sort((a, b) => a.url.localeCompare(b.url))) {
  const tag = r.ok ? "OK  " : "FAIL";
  const detail = r.error ? r.error : r.status;
  if (!r.ok) {
    console.log(`${tag} ${detail}  ${r.url}`);
    for (const name of urlToServices.get(r.url)) console.log(`       used by: ${name}`);
  }
}

console.log(
  `\n${results.length} links checked: ${results.length - broken.length} OK, ${broken.length} broken.`
);

if (broken.length > 0) process.exit(1);
