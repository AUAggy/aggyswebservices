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
- Most recently added: AWS DataSync, Amazon Transfer Family, Amazon Connect, Amazon Q Developer
- Most recently removed: Amazon Lex, Amazon Detective, AWS IoT Core, AWS IoT Analytics
- Search matches on `service_name`, `description`, and `category` only — intentional, no plans to expand

## Key files

| File | Purpose |
|------|---------|
| `src/data/aws-services.json` | All service content — single source of truth |
| `src/lib/aws-data.ts` | Data access functions + category metadata (icons, descriptions) |
| `src/types/aws.ts` | TypeScript interfaces |
| `src/components/ServiceAccordion.tsx` | Service detail page accordion UI |
| `scripts/generate-meta.mjs` | Prebuild script — generates sitemap.xml, rss.xml, feed.json |
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
  "aws_user_guide_documentation": "https://docs.aws.amazon.com/..."
}
```

Style rules:
- `feynman_definition`: Plain English analogy, no jargon, no em-dashes. Lead with the most common misconception or gotcha concept.
- `key_capabilities`: 5-6 concise strings. Lead with the capability, not the benefit.
- `architectural_deep_dive`: 150-180 words. How it works, 2 gotchas, constraints. No em-dashes. Not a comprehensive breakdown — point to AWS docs for deeper reading.
- `scenario_example`: Real company, specific numbers, believable detail. Ends with `Result: ...`.
- No em-dashes anywhere in any field.

## Automated — no manual updates needed

RSS feeds, sitemap, and SEO meta tags are fully data-driven via `scripts/generate-meta.mjs` (runs as a prebuild hook). Adding a service to `aws-services.json` automatically includes it everywhere on the next build/deploy.
