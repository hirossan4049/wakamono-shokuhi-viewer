# Repository Guidelines

## Project Structure & Module Organization
- Source in `src/`: UI in `src/components/`, hooks in `src/hooks/`, types in `src/types/`, utilities (IndexedDB) in `src/utils/`.
- Entry points: `src/index.tsx` (bootstraps Mantine + App), `src/App.tsx` (main shell).
- Styling: Mantine components plus small CSS modules in `components/*.module.css`.
- Assets and static files in `public/` (includes `sample-data.json`). Build output in `build/`.
- Tests colocated under `src/*.test.tsx` and `src/**/__tests__/` if added later.

## Build, Test, and Development Commands
- `npm start` — Start local dev server at http://localhost:3000.
- `npm run build` — Production build to `build/` (minified, hashed assets).
- `npm test` — Run Jest + React Testing Library in watch mode.
- `npm run deploy` — Publish `build/` to GitHub Pages (also auto on `main` via Actions).

## Coding Style & Naming Conventions
- Language: TypeScript (strict types in `src/types/`). Prefer functional components with hooks.
- Indentation: 2 spaces; semicolons required; single quotes.
- Files: Components `PascalCase.tsx` (default export ok), hooks `useX.ts`, utilities `camelCase.ts`, types `PascalCase.ts`.
- React: Prefix hooks with `use*`; keep components presentational where possible; lift state to `App.tsx` or a hook.
- Linting: CRA ESLint config (`react-app`, `react-app/jest`). Run `npm test` or editor ESLint for feedback.

## Testing Guidelines
- Frameworks: Jest + React Testing Library + `@testing-library/jest-dom` (setup in `src/setupTests.ts`).
- Place tests next to source: `ComponentName.test.tsx` or under `__tests__/`.
- Test user-visible behavior (roles/text), not implementation details. Example: `screen.getByText(/大阪府若者食費支援検索/i)`.
- Aim to cover critical flows: data load (sample vs IndexedDB), filters, sorting, favorites, and modal open/close.

## Commit & Pull Request Guidelines
- Commits: Current history is mixed; prefer Conventional Commits going forward (e.g., `feat(filters): add price range slider`, `fix(test): wrap App in MantineProvider`).
- PRs: Include clear description, linked issues, before/after screenshots for UI, and test updates.
- CI: Ensure `npm run build` and `npm test` pass. Keep PRs focused and small.

## Security & Configuration Tips
- Do not commit secrets; this is a client-only app. `PUBLIC_URL` is used for Pages paths.
- Sample data in `public/` is world-readable; avoid sensitive content.
