# AWS in Plain English

> Understanding AWS should not require a PhD.

A React + TypeScript site that explains 69 AWS services using plain-language analogies, practical gotchas, and real-world examples.

## What This Is

This project makes AWS services easier to understand through:
- Clear Feynman-style explanations
- Architecture and implementation gotchas
- Scenario-based examples
- Links to official AWS documentation

> Note: the company names, dollar figures, and metrics in the scenario examples are
> illustrative, not current AWS pricing or real customer data. They exist to make the
> examples concrete. Treat the deep-dive facts (service names, limits, availability) as
> the parts kept current; the scenario numbers are not maintained to the dollar.

## Features

- 69 AWS services across 12 categories
- Category pages and service detail pages
- Keyword search across service name, description, category, and curated search keywords
- Responsive UI for desktop and mobile
- Static deployment ready for S3 + CloudFront

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:8080` (configured in `vite.config.ts`).

## Project Structure

```text
.
├── src/
│   ├── components/        # App and UI components
│   ├── data/              # AWS dataset (aws-services.json)
│   ├── hooks/             # React hooks
│   ├── lib/               # Data helpers and utilities
│   ├── pages/             # Route-level pages
│   ├── test/              # Vitest setup
│   └── types/             # TypeScript types
├── public/                # Static assets + metadata (robots, sitemap, RSS, feed.json)
├── scripts/               # Build-time generators (sitemap, RSS, feeds)
├── dist/                  # Build output (generated)
└── deploy.sh              # S3 sync + CloudFront invalidation script
```

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS + Radix UI/shadcn-style components
- React Router
- react-helmet-async (SEO + JSON-LD)
- vite-prerender-plugin (static prerender)
- Vitest + Testing Library

## Service Categories (Validated Against `src/data/aws-services.json`)

1. Compute (5)
2. Storage (6)
3. Database (8)
4. Networking & Content Delivery (6)
5. Security, Identity & Compliance (9)
6. Management & Governance (7)
7. Application Integration (6)
8. Analytics & Business Intelligence (6)
9. AI & Machine Learning (7)
10. Developer Tools (4)
11. Containers & Orchestration (3)
12. Migration & Transfer (2)

Total: 69 services.

## Who This Is For

- AWS beginners who want plain-language explanations
- Engineers moving from other cloud platforms
- Certification learners
- Anyone seeking practical AWS understanding, including Sales teams

## Deployment

`deploy.sh` deploys to AWS:
- Sync `dist/` to appropriate AWS S3 bucket, and invalidates appropriate CloudFront distribution cache

For SPA routes, CloudFront should return `/index.html` for 403/404 deep-link refreshes.
