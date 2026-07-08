import fs from "fs";
import path from "path";

// Validates src/data/aws-services.json against the project style guide (see CLAUDE.md).
//
// Two severity levels:
//   ERROR   -> exit code 1, blocks the build (structural / correctness problems)
//   WARNING -> printed only, never blocks (style drift worth a human look)
//
// Runs as part of `prebuild`, so a broken dataset stops `npm run build` (and deploy).

const rootDir = process.cwd();
const dataPath = path.join(rootDir, "src", "data", "aws-services.json");

// Errors are always shown (they block the build). Warnings are style drift: summarized
// during the build, shown in full only with --verbose (see the validate:data script).
const verbose = process.argv.includes("--verbose") || process.argv.includes("-v");

const REQUIRED_FIELDS = [
  "service_name",
  "category",
  "description",
  "feynman_definition",
  "key_capabilities",
  "architectural_deep_dive",
  "scenario_example",
  "aws_user_guide_documentation",
];

const DEEP_DIVE_MIN_WORDS = 150;
const DEEP_DIVE_MAX_WORDS = 180;
const CAPABILITIES_MIN = 5;
const CAPABILITIES_MAX = 6;

const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/-+$/, "");
const wordCount = (value) => value.trim().split(/\s+/).filter(Boolean).length;

const errors = [];
const warnings = [];
const err = (msg) => errors.push(msg);
const warn = (msg) => warnings.push(msg);

let data;
try {
  data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
} catch (e) {
  console.error(`ERROR: could not read/parse ${path.relative(rootDir, dataPath)}: ${e.message}`);
  process.exit(1);
}

const services = Array.isArray(data.services) ? data.services : [];
const validCategories = new Set(data.metadata?.categories ?? []);

if (services.length === 0) err("no services found in dataset");

// total_services metadata must match the actual array length
if (typeof data.metadata?.total_services === "number" && data.metadata.total_services !== services.length) {
  err(`metadata.total_services (${data.metadata.total_services}) != services.length (${services.length})`);
}

const slugs = new Map();

services.forEach((service, i) => {
  const label = service.service_name ? `"${service.service_name}"` : `service #${i}`;

  // Required fields present and non-empty
  for (const field of REQUIRED_FIELDS) {
    const value = service[field];
    const missing = value === undefined || value === null
      || (typeof value === "string" && value.trim() === "")
      || (Array.isArray(value) && value.length === 0);
    if (missing) err(`${label}: missing or empty required field "${field}"`);
  }

  // Category must be one of the declared categories
  if (service.category && validCategories.size > 0 && !validCategories.has(service.category)) {
    err(`${label}: category "${service.category}" is not in metadata.categories`);
  }

  // Slugs (and therefore URLs) must be unique
  if (service.service_name) {
    const slug = slugify(service.service_name);
    if (!slug) err(`${label}: service_name produces an empty slug`);
    if (slugs.has(slug)) {
      err(`duplicate slug "${slug}" from ${label} and "${slugs.get(slug)}"`);
    } else {
      slugs.set(slug, service.service_name);
    }
  }

  // No em-dashes or en-dashes anywhere in the text fields
  for (const field of REQUIRED_FIELDS) {
    const value = service[field];
    const strings = typeof value === "string" ? [value] : Array.isArray(value) ? value : [];
    for (const s of strings) {
      if (typeof s === "string" && /[—–]/.test(s)) {
        err(`${label}: field "${field}" contains an em-dash or en-dash`);
      }
    }
  }

  // Doc link must be an AWS docs HTTPS .html URL
  const doc = service.aws_user_guide_documentation;
  if (typeof doc === "string" && doc.trim() !== "") {
    if (!/^https:\/\/docs\.aws\.amazon\.com\/.*\.html(?:[?#].*)?$/.test(doc)) {
      err(`${label}: aws_user_guide_documentation is not an https docs.aws.amazon.com .html URL: ${doc}`);
    }
  }

  // Optional forward-compatible field: search_keywords must be an array of short strings
  if (service.search_keywords !== undefined) {
    if (!Array.isArray(service.search_keywords)) {
      err(`${label}: search_keywords must be an array`);
    } else {
      for (const kw of service.search_keywords) {
        if (typeof kw !== "string" || kw.trim() === "") err(`${label}: search_keywords contains an empty entry`);
        else if (kw.length > 40) warn(`${label}: search_keyword "${kw}" is unusually long (>40 chars)`);
      }
    }
  }

  // ---- warnings (style drift, non-blocking) ----
  if (typeof service.architectural_deep_dive === "string") {
    const words = wordCount(service.architectural_deep_dive);
    if (words < DEEP_DIVE_MIN_WORDS || words > DEEP_DIVE_MAX_WORDS) {
      warn(`${label}: deep dive is ${words} words (target ${DEEP_DIVE_MIN_WORDS}-${DEEP_DIVE_MAX_WORDS})`);
    }
  }
  if (Array.isArray(service.key_capabilities)) {
    const n = service.key_capabilities.length;
    if (n < CAPABILITIES_MIN || n > CAPABILITIES_MAX) {
      warn(`${label}: ${n} key_capabilities (target ${CAPABILITIES_MIN}-${CAPABILITIES_MAX})`);
    }
  }
  if (typeof service.scenario_example === "string" && !/Result:/.test(service.scenario_example)) {
    warn(`${label}: scenario_example does not contain a "Result:" summary`);
  }
});

// Biannual content-review nudge: warn (never block) once review_due has passed.
const reviewDue = data.metadata?.review_due;
if (reviewDue) {
  const due = new Date(reviewDue);
  if (Number.isNaN(due.getTime())) {
    err(`metadata.review_due is not a valid date: ${reviewDue}`);
  } else if (Date.now() > due.getTime()) {
    warn(`content review is overdue (metadata.review_due = ${reviewDue}); re-verify facts, run \`npm run check:links\`, then bump the date`);
  }
}

if (verbose) {
  for (const w of warnings) console.warn(`WARNING: ${w}`);
}
for (const e of errors) console.error(`ERROR: ${e}`);

const warnNote = warnings.length > 0 && !verbose
  ? " (run `npm run validate:data` for detail)"
  : "";
console.log(
  `Validated ${services.length} services: ${errors.length} error(s), ${warnings.length} warning(s).${warnNote}`
);

if (errors.length > 0) process.exit(1);
