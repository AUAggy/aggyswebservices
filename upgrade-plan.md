# Dependency Upgrade Plan

> Upgrade path for site.aggyswebservices.com from current dependency versions to latest major releases.
> Each stage runs on its own git branch, has a dedicated PR, and must pass all checks before the next stage begins.

---

## Prerequisites

Before starting any stage:

1. Ensure `main` is clean: `git status` should show no uncommitted changes.
2. Confirm the baseline passes: run `npm run build` and `npm test` on `main` and verify both succeed.
3. Have the Playwright MCP available for browser smoke tests at each stage.
4. Use Context7 MCP (`/mcp context7`) when looking up migration guides or new API signatures — it returns current documentation rather than training-data snapshots.

---

## Stage 0: Baseline Test Coverage

**Branch:** `upgrade/0-baseline-tests`

The existing test suite contains one placeholder test (`example.test.ts`). Before any upgrade touches the codebase, write meaningful tests that will catch regressions throughout the upgrade process. These tests become the acceptance criteria for every subsequent PR.

### Tests to write

Create the following test files:

**`src/test/data.test.ts`** — data integrity
- JSON loads without error
- All 69 services are present
- Every service has `service_name`, `category`, `description`, `feynman_definition`, `architectural_deep_dive`, `scenario_example`, `aws_user_guide_documentation`
- All categories match the 12 known category names
- No service has an empty string for any required field

**`src/test/lib.test.ts`** — data helpers
- `getCategories()` returns 12 categories
- `getServicesByCategory(category)` returns the correct count for at least 3 categories
- `getServiceBySlug(slug)` returns the correct service
- Search function returns results for known terms (`s3`, `database`, `lambda`) and returns empty for nonsense input

**`src/test/components.test.tsx`** — component rendering
- `SearchBar` renders with the correct placeholder text
- `CategoryCard` renders a category name and description
- `ServiceListItem` renders a service name
- `Header` renders without crashing
- `SiteFooter` renders without crashing

**`src/test/routes.test.tsx`** — routing
- Index page renders without crashing
- Category page renders with a valid category slug
- ServiceDetail page renders with a valid service slug
- NotFound page renders for an unknown route

### Tools to use

- Run tests: use the `test-runner` agent after writing each file
- After all tests pass: run `/simplify` on each new test file to check for quality and redundancy

### Gate before PR

```
npm test        — all tests pass
npm run build   — build succeeds
```

**PR title:** `test: add baseline test coverage before upgrade`
**Merge to:** `main`

---

## Stage 1: TypeScript 6

**Branch:** `upgrade/1-typescript-6`
**Branch from:** `main` (after Stage 0 PR is merged)

### Why first

TypeScript is a dev-only tool. Upgrading it cannot break the runtime. It surfaces latent type errors now, before runtime changes complicate the picture.

### Steps

1. `npm install typescript@6 --save-dev`
2. Run `npm run build` and collect all type errors.
3. Fix each type error. Common TypeScript 6 breaking changes to watch for:
   - Stricter `strictNullChecks` enforcement
   - Removal of deprecated `importsNotUsedAsValues` config option (replace with `verbatimModuleSyntax`)
   - Stricter handling of `any` in generics
4. Run `npm test` — all Stage 0 tests must pass.
5. Run `npm run lint` — fix any new ESLint errors surfaced by the TS upgrade.

### Tools to use

- Use Context7 MCP to look up the TypeScript 6 migration guide: query `typescript 6 breaking changes migration`
- After fixes: run `/simplify` on any files that were significantly changed
- Run the `test-runner` agent to confirm the full suite passes

### Gate before PR

```
npm run build   — zero type errors
npm test        — all tests pass
npm run lint    — zero errors
```

**PR title:** `chore: upgrade TypeScript 5 to 6`
**Merge to:** `main`

---

## Stage 2: React 19 + @types/react 19

**Branch:** `upgrade/2-react-19`
**Branch from:** `main` (after Stage 1 PR is merged)

### Why second

React 19 is runtime code. TypeScript must already be stable so that new React 19 type signatures are correctly understood by the compiler.

### Steps

1. `npm install react@19 react-dom@19`
2. `npm install @types/react@19 @types/react-dom@19 --save-dev`
3. Run `npm run build` and address breaking changes. Key React 19 changes to audit:

   **`forwardRef`** — React 19 deprecates `forwardRef`. Refs are now passed as regular props. Search for all uses:
   ```
   grep -r "forwardRef" src/
   ```
   Rewrite affected components to accept `ref` as a prop directly.

   **`createContext`** — The default value requirement is stricter. Search:
   ```
   grep -r "createContext" src/
   ```

   **`react-helmet-async`** — Verify compatibility with React 19. Check the library's changelog via Context7 MCP. If incompatible, a patch or alternative (`@unhead/react`) may be required.

   **`@testing-library/react`** — Version 16 supports React 19. No change needed.

4. Run `npm test` — all Stage 0 tests must pass.
5. Use Playwright MCP to run a browser smoke test:
   - Navigate to the homepage
   - Confirm the search bar renders with correct placeholder
   - Navigate to a category page (e.g. `/category/compute`)
   - Navigate to a service detail page
   - Confirm no console errors

### Tools to use

- Context7 MCP: query `react 19 migration guide breaking changes forwardRef`
- Playwright MCP: full browser smoke test after build (`npm run build && npm run preview`)
- `test-runner` agent: run full suite
- `security-reviewer` agent: flag any auth or session-related component changes

### Gate before PR

```
npm run build   — zero errors
npm test        — all tests pass
Playwright      — homepage, category page, service detail page load without console errors
```

**PR title:** `chore: upgrade React 18 to 19`
**Merge to:** `main`

---

## Stage 3: React Router 7

**Branch:** `upgrade/3-react-router-7`
**Branch from:** `main` (after Stage 2 PR is merged)

### Why third

React Router 7 is the most disruptive upgrade. It must run on top of stable React 19. Isolating it makes routing regressions easy to identify.

### Steps

1. `npm install react-router-dom@7`
2. Run `npm run build` and address breaking changes. Key React Router 7 changes:

   **`useNavigate` / `<Link>`** — largely compatible, but verify all usage:
   ```
   grep -r "useNavigate\|useParams\|useLocation\|<Link\|<NavLink" src/
   ```

   **Loader/action patterns** — React Router 7 pushes the Remix-style loader model. This project uses client-side routing only, so loaders are not required — but check that no v6 data APIs are in use:
   ```
   grep -r "loader\|action\|defer\|Await" src/
   ```

   **`<Routes>` and `<Route>`** — verify the router structure in the app entry point still matches v7 API. Check `src/App.tsx` or equivalent.

   **`createBrowserRouter`** — if used, the options object signature changed in v7.

3. Run `npm test` — all Stage 0 tests must pass. Pay particular attention to route tests in `src/test/routes.test.tsx`.
4. Use Playwright MCP to test every route:
   - `/` — homepage
   - `/category/compute` — category page
   - `/service/amazon-ec2` — service detail page
   - `/nonexistent` — 404 page
   - Browser back/forward navigation between pages

### Tools to use

- Context7 MCP: query `react-router v7 migration from v6 breaking changes`
- Playwright MCP: full route navigation test including back/forward
- `test-runner` agent: full suite with focus on route tests

### Gate before PR

```
npm run build       — zero errors
npm test            — all tests pass (especially routes.test.tsx)
Playwright          — all 4 routes load correctly, back/forward navigation works
```

**PR title:** `chore: upgrade React Router 6 to 7`
**Merge to:** `main`

---

## Stage 4: Tailwind CSS 4

**Branch:** `upgrade/4-tailwind-4`
**Branch from:** `main` (after Stage 3 PR is merged)

### Why last

Tailwind 4 is a CSS/config-only change with no JavaScript runtime impact. Saving it for last means any visual regressions are unambiguously caused by Tailwind and nothing else. It is also the most visually disruptive upgrade, so Playwright screenshot comparisons are essential.

### Steps

1. Before upgrading, take Playwright screenshots of key pages as a visual baseline:
   - Homepage
   - A category page
   - A service detail page
   - Mobile viewport (375px) of each

2. `npm install tailwindcss@4 --save-dev`

3. Tailwind 4 removes `tailwind.config.js`. The configuration moves into the main CSS file using `@theme`. Migrate the config:
   - Read the existing `tailwind.config.js` (or `tailwind.config.ts`)
   - Use Context7 MCP to look up the v4 migration guide: query `tailwind css 4 migration from v3 config`
   - Rewrite custom theme tokens (colors, fonts, spacing) as CSS variables inside `@theme {}` in the main CSS file
   - Remove `tailwind.config.js`

4. Tailwind 4 also changes some utility class names and removes deprecated utilities. Audit:
   ```
   grep -r "overflow-ellipsis\|flex-grow\|flex-shrink\|decoration-slice\|decoration-clone" src/
   ```
   Replace with v4 equivalents (`text-ellipsis`, `grow`, `shrink`, etc.).

5. Update `postcss.config.js` if present — Tailwind 4 ships its own PostCSS plugin.

6. Run `npm run build` — fix any remaining errors.

7. Use Playwright MCP to take after-upgrade screenshots of the same pages. Compare against the baseline screenshots from step 1. Any unexpected visual differences need investigation before merging.

8. Run `npm test` — all Stage 0 tests must pass.

### Tools to use

- Context7 MCP: query `tailwind css 4 upgrade guide v3 to v4 breaking changes`
- Playwright MCP: screenshot comparison (before vs. after) on homepage, category page, service detail page, and mobile viewports
- `/simplify` on any heavily modified CSS files

### Gate before PR

```
npm run build       — zero errors
npm test            — all tests pass
Playwright          — visual comparison passes, no unintended layout changes
Mobile viewport     — responsive layout intact at 375px
```

**PR title:** `chore: upgrade Tailwind CSS 3 to 4`
**Merge to:** `main`

---

## Stage 5: Secondary Dependencies

**Branch:** `upgrade/5-secondary-deps`
**Branch from:** `main` (after Stage 4 PR is merged)

Handle the remaining major version bumps together, since they are lower risk and scoped to specific parts of the UI.

### Packages to upgrade

| Package | Current | Target | Area affected |
|---|---|---|---|
| `lucide-react` | 0.462.0 | 1.0.x | Icons throughout the UI |
| `date-fns` | 3.6.0 | 4.x | Any date formatting |
| `recharts` | 2.15.4 | 3.x | Charts (if used) |
| `next-themes` | 0.3.0 | 0.4.x | Theme toggle (if present) |
| `react-day-picker` | 8.10.1 | 9.x | Date picker (if used) |

### Steps

1. Upgrade one package at a time. For each:
   - `npm install <package>@latest`
   - Run `npm run build` — fix any errors
   - Run `npm test`

2. For `lucide-react` specifically: icon names changed in v1.0. Search for all icon imports and cross-reference against the v1 icon list via Context7 MCP:
   ```
   grep -r "from 'lucide-react'" src/
   ```

3. For `date-fns 4`: the function import style changed. Use Context7 MCP to check: query `date-fns 4 migration breaking changes`.

4. Use Playwright MCP for a final full smoke test across all pages after all secondary deps are upgraded.

### Tools to use

- Context7 MCP: per-package migration queries as needed
- `test-runner` agent: after each individual package upgrade
- Playwright MCP: final smoke test across all pages

### Gate before PR

```
npm run build       — zero errors
npm test            — all tests pass
Playwright          — all pages load, icons render, no console errors
```

**PR title:** `chore: upgrade secondary dependencies (lucide, date-fns, recharts, next-themes)`
**Merge to:** `main`

---

## Rollback Procedure

Each stage has its own PR. If a stage introduces a regression that cannot be quickly fixed:

1. Close the PR without merging.
2. Delete the branch: `git branch -D upgrade/N-stage-name`
3. `main` remains at the last known good state.
4. Investigate the issue, create a new branch from `main`, and retry.

Because stages are sequential and each builds on a merged `main`, rolling back to any previous state means checking out the commit just before the problematic PR was merged:

```bash
git log --oneline main          # find the commit hash before the bad merge
git checkout -b hotfix/rollback <commit-hash>
```

---

## Summary Checklist

| Stage | Branch | Description | Key Gate |
|---|---|---|---|
| 0 | `upgrade/0-baseline-tests` | Write test coverage | `npm test` passes |
| 1 | `upgrade/1-typescript-6` | TypeScript 5 to 6 | Zero type errors |
| 2 | `upgrade/2-react-19` | React 18 to 19 | Playwright smoke test |
| 3 | `upgrade/3-react-router-7` | React Router 6 to 7 | All routes work |
| 4 | `upgrade/4-tailwind-4` | Tailwind 3 to 4 | Visual comparison passes |
| 5 | `upgrade/5-secondary-deps` | lucide, date-fns, recharts | Final smoke test |

**Total estimated PRs:** 6
**Recommended cadence:** one stage per sitting, not all in one day.
