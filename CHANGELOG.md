# Changelog

## Unreleased - 2026-07-21

- Redesigned the UI from neo-brutal hard borders/shadows to a flat, compact, full-bleed layout: PDF on the left, controls on the right, no card frames.
- Shared component tokens for buttons, fields, and modals.
- Multi-provider profiles with a two-column Settings modal (list + detail, add custom providers); homepage row switches provider and models together.
- Removed the knowledge board feature (UI drawer, generate-board API, graph layout utils, and roughjs dependency).

## Unreleased - 2026-05-19

- Removed upstream marketing, SEO, analytics, site-verification, demo, and sponsor material from the fork.
- Added development-focused documentation, environment template, and `justfile` command entrypoints.
- Pointed repository links at the fork and removed hard-coded production CORS origins.
- Declared the root package in `pnpm-workspace.yaml` so pnpm can install with the existing patch configuration.
- Moved the `pdf-lib` patch declaration to `package.json` for pnpm 9 compatibility.
- Documented the current `svelte-check` type debt and kept `build` as the active verification gate.
- Added File System Access based PDF opening so full-PDF export can ask to replace the original file, while Save As starts from the source file location when available.
- Fixed direct replacement by requesting source-file write permission before PDF generation consumes browser user activation.
- Added configurable text and vision models for AI providers, plus custom OpenAI-compatible provider settings.
- Cleared production build warnings from Svelte accessibility checks, pdf.js SSR imports, Upstash initialization, Browserslist data, and unused imports.
- Added provider model-list fetching so API settings can populate text and vision model choices from Gemini or OpenAI-compatible `/models` endpoints.
- Fixed browser PDF loading by configuring the pdf.js worker source before calling `getDocument`.
- Kept the production adapter on Vercel and documented the Vercel deployment configuration.
