# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Code Generation Guidelines

Before generating any code, first check the relevant doc file(s) in the `/docs` directory for guidance, conventions, and constraints specific to this project. Read the applicable doc(s) before writing code — do not skip this step even for small changes:

- /docs/ui.md
- /docs/data-fetching.md
- /docs/auth.md
- /docs/data-mutations.md
- /docs/routing.md

## Project state

This is a freshly bootstrapped Next.js app (App Router) with no custom features built yet — `src/app/page.tsx` is still the default `create-next-app` starter. Treat this as a greenfield project.

## Commands

- `npm run dev` — start the dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run the production build
- `npm run lint` — ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next` core-web-vitals + typescript)

There is no test runner configured yet.

## Stack

- Next.js 16.3.0 (App Router, `src/app/`), React 19.2.8
- TypeScript, strict mode, path alias `@/*` → `./src/*`
- Tailwind CSS v4 via `@tailwindcss/postcss` (no `tailwind.config.*` — v4 uses CSS-based config in `src/app/globals.css`)

## Important: Next.js 16 breaking changes

Per `AGENTS.md`, this Next.js version has breaking API/convention changes vs. training data. Before writing any Next.js code (routing, data fetching, config, server/client components, etc.), read the relevant guide under `node_modules/next/dist/docs/` (`01-app/`, `02-pages/`, `03-architecture/`) — do not assume older Next.js patterns apply.

## test
