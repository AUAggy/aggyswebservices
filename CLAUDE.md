# CLAUDE.md — Project Context for AI Assistants

## What this project is

A static React site (Vite + SSR prerendering) deployed to S3 + CloudFront at `site.aggyswebservices.com`. It explains 69 AWS services in plain English — Feynman-style analogies, technical deep dives, gotchas, and real-world scenarios. KISS principle: simple, no analytics, no auth, no backend.

## Deploy

```bash
./deploy.sh
```

Runs lint, build, `aws s3 sync dist/ s3://site.aggyswebservices.com --delete`, and CloudFront invalidation (distribution ID: `E2PUPT7XFLCVDU`).

## Current state

- **69 services, 12 categories** — intentional constraint, do not exceed without explicit instruction
- All 69 services have `key_capabilities` arrays populated and rendering in the UI
- IoT category was replaced with **Migration & Transfer** (icon 🚛)
- Most recently added: Amazon OpenSearch Service (Analytics), AWS DataSync, Amazon Transfer Family, Amazon Connect, Amazon Q Developer
- Most recently removed: Amazon Comprehend (fading: key features closed to new customers, remaining NLP now Bedrock territory), Amazon Lex, Amazon Detective, AWS IoT Core, AWS IoT Analytics
- Search matches on `service_name`, `description`, `category`, and the optional `search_keywords` array (curated terms that live in deep dives but not the name/description, e.g. Trino, SFTP, Valkey, Kiro)
- Some display names intentionally keep a legacy slug to preserve URLs even after an AWS rename (e.g. `AWS Transform MGN` note in prose; renames that change `service_name` also change the URL)

## Key files

| File | Purpose |
|------|---------|
| `src/data/aws-services.json` | All service content — single source of truth |
| `src/lib/aws-data.ts` | Data access functions + category metadata (icons, descriptions) |
| `src/types/aws.ts` | TypeScript interfaces |
| `src/components/ServiceAccordion.tsx` | Service detail page accordion UI |
| `scripts/generate-meta.mjs` | Prebuild script — generates sitemap.xml, rss.xml, feed.json |
| `scripts/validate-data.mjs` | Prebuild gate — validates the dataset; errors block the build, style drift warns. Run `npm run validate:data` for full warnings |
| `scripts/check-links.mjs` | `npm run check:links` — checks every doc URL is reachable. Not in the build path (network-dependent); part of the biannual review |
| `deploy.sh` | One-command deploy to S3 + CloudFront |

## Service data schema

```json
{
  "service_name": "Amazon Example",
  "category": "Compute",
  "description": "One-line description",
  "feynman_definition": "Plain English analogy. No jargon. No em-dashes.",
  "key_capabilities": ["Capability one", "Capability two"],
  "architectural_deep_dive": "150-180 words. How it works, 2 gotchas, constraints. No em-dashes.",
  "scenario_example": "Real company, specific numbers. Ends with Result: ...",
  "aws_user_guide_documentation": "https://docs.aws.amazon.com/...",
  "search_keywords": ["Optional array", "curated extra search terms"]
}
```

Style rules:
- `feynman_definition`: Plain English analogy, no jargon, no em-dashes. Lead with the most common misconception or gotcha concept.
- `key_capabilities`: 5-6 concise strings. Lead with the capability, not the benefit.
- `architectural_deep_dive`: 150-180 words. How it works, 2 gotchas, constraints. No em-dashes. Not a comprehensive breakdown — point to AWS docs for deeper reading.
- `scenario_example`: Real company, specific numbers, believable detail. Ends with `Result: ...`. The company names and numbers are illustrative, not real or current; keep the deep-dive facts current, not the scenario figures.
- `search_keywords` (optional): a few curated terms users would search that are not already in the name, description, or category (product aliases, embedded tech, old names). Keep short and precise to avoid noisy matches.
- No em-dashes anywhere in any field. The validator (`scripts/validate-data.mjs`) enforces this and other structural rules as build-blocking errors; word-count and capability-count targets are soft warnings.

## Automated — no manual updates needed

RSS feeds, sitemap, and SEO meta tags are fully data-driven via `scripts/generate-meta.mjs` (runs as a prebuild hook). Adding a service to `aws-services.json` automatically includes it everywhere on the next build/deploy. `prebuild` also runs `scripts/validate-data.mjs`, so malformed data (missing fields, em-dashes, bad category, duplicate slug, dead-looking doc URL) blocks the build before anything ships.

## Content review cadence

`metadata.review_due` holds the next review date. Once it passes, the validator prints a (non-blocking) reminder on every build. When you review: run `npm run check:links`, re-verify the deep-dive facts most prone to drift (service names/rebrands, limits, availability changes), fix as needed, then bump `metadata.review_due` about six months out. Scenario dollar figures are illustrative and do not need per-number maintenance.
