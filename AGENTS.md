# Repository Guidelines

## Project Structure & Module Organization
- App source lives in `src/`.
- Route pages are in `src/pages/` (`Index.tsx`, `Category.tsx`, `ServiceDetail.tsx`).
- Reusable UI is in `src/components/`, with shared shadcn/Radix primitives in `src/components/ui/`.
- Domain data and helpers are in `src/data/`, `src/lib/`, `src/types/`, and hooks in `src/hooks/`.
- Test files are colocated using `*.test.ts(x)`/`*.spec.ts(x)` and shared setup is in `src/test/setup.ts`.
- Static assets and metadata are in `public/`; production output is generated to `dist/`.

## Build, Test, and Development Commands
- `npm run dev`: starts Vite dev server at `http://localhost:5173`.
- `npm run build`: creates a production bundle in `dist/`.
- `npm run build:dev`: builds using development mode flags.
- `npm run preview`: serves the built app locally for final checks.
- `npm run test`: runs Vitest once in CI-style mode.
- `npm run test:watch`: runs Vitest in watch mode while developing.
- `npm run lint`: runs ESLint across the repository.

## Coding Style & Naming Conventions
- Language stack: TypeScript + React 18, Vite, Tailwind.
- Use 2-space indentation and keep semicolon-free style consistent with existing files.
- Components/pages/hooks use `PascalCase` file names (`CategoryCard.tsx`, `use-mobile.tsx` follows existing convention for this repo).
- Prefer path alias imports via `@/` (configured in `vite.config.ts`).
- Run `npm run lint` before opening a PR; no Prettier config is currently enforced.

## Testing Guidelines
- Framework: Vitest with `jsdom` and Testing Library (`@testing-library/jest-dom`).
- Test pattern: `src/**/*.{test,spec}.{ts,tsx}`.
- Add or update tests for changed rendering logic, utilities, and hooks.
- No explicit coverage threshold is configured; keep tests focused on behavior, not implementation details.

## Commit & Pull Request Guidelines
- Follow the existing Conventional Commit pattern: `feat:`, `fix:`, `chore:` (e.g., `fix: correct AWS service data typo`).
- Avoid vague commit titles like `Changes`; use clear, scoped summaries.
- PRs should include:
  - concise description of what changed and why,
  - linked issue/ticket (if available),
  - screenshots for UI/layout changes,
  - confirmation that `npm run lint`, `npm run test`, and `npm run build` pass.
