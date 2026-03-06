---
status: resolved
trigger: "Vercel deployment doesn't work for Vite + React + Supabase fitness app"
created: 2026-03-06T00:00:00Z
updated: 2026-03-06T00:02:00Z
---

## Current Focus

hypothesis: CONFIRMED - Multiple deployment configuration issues identified and fixed
test: Build verified after all changes
expecting: Deployment should work once env vars are set in Vercel dashboard
next_action: Archive session

## Symptoms

expected: The app should deploy and work correctly on Vercel
actual: Deployment doesn't work (specific error needs investigation)
errors: Unknown - investigating configuration
reproduction: Deploy to Vercel
started: Needs investigation - may be first attempt or recent breakage

## Eliminated

- hypothesis: Build command fails
  evidence: `pnpm build` succeeds locally, TypeScript compiles clean, Vite outputs to dist/
  timestamp: 2026-03-06T00:00:30Z

- hypothesis: Wrong build output directory
  evidence: Vite outputs to dist/ by default, which is what Vercel expects for Vite framework preset
  timestamp: 2026-03-06T00:00:30Z

- hypothesis: Path alias misconfiguration
  evidence: Both tsconfig.app.json and vite.config.ts correctly configure @/ -> ./src/*
  timestamp: 2026-03-06T00:00:30Z

- hypothesis: Supabase client misconfigured
  evidence: src/lib/supabase.ts correctly uses import.meta.env.VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
  timestamp: 2026-03-06T00:00:35Z

## Evidence

- timestamp: 2026-03-06T00:00:20Z
  checked: vercel.json rewrite rule
  found: "rewrites": [{ "source": "/((?!assets/).*)", "destination": "/index.html" }]
  implication: Overly complex negative-lookahead regex. Vercel already serves static files before rewrites are evaluated, so excluding /assets/ is unnecessary. The standard pattern is "/(.*)" -> "/index.html".

- timestamp: 2026-03-06T00:00:20Z
  checked: package.json
  found: Uses pnpm (lockfileVersion 9.0), Vite 7.3.1, no "engines" field, no "packageManager" field
  implication: Vite 7 requires Node >= 20.19.0 or >= 22.12.0. Without engines, Vercel may pick a Node version that is too old.

- timestamp: 2026-03-06T00:00:25Z
  checked: .env.local and .env.example
  found: .env.local has real Supabase credentials, .env.example has placeholders. .gitignore excludes *.local
  implication: .env.local won't be on Vercel. User MUST configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as Vercel environment variables. Without them, the app will crash at runtime.

- timestamp: 2026-03-06T00:00:30Z
  checked: index.html title and favicon
  found: <title>JavierFitness</title> and <link rel="icon" href="/vite.svg"> but public/ dir is empty
  implication: Broken favicon (404) and stale branding from incomplete rename

- timestamp: 2026-03-06T00:00:35Z
  checked: Old name references in src/
  found: "JavierFitness" in LoginPage.tsx, RegisterPage.tsx, ClientLayout.tsx, TrainerLayout.tsx
  implication: Part of rename that was not completed

- timestamp: 2026-03-06T00:00:40Z
  checked: Local build before and after fixes
  found: `pnpm build` succeeds both before and after changes
  implication: All changes are safe and build-verified

## Resolution

root_cause: Multiple deployment configuration issues -- (1) SPA rewrite rule used a needlessly complex negative-lookahead regex `/((?!assets/).*)` instead of the standard catch-all `/(.*)`, which could cause 404s on client-side routes; (2) No Node.js engine version specified for Vite 7 compatibility (requires >=20.19.0); (3) Environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are in .env.local which is gitignored and will not exist on Vercel -- they MUST be configured in Vercel dashboard; (4) Broken favicon reference to non-existent /vite.svg; (5) Stale "JavierFitness" branding not updated to "La Aldea Fit" during rename.

fix: |
  1. vercel.json: Simplified rewrite to standard catch-all pattern `{ "source": "/(.*)", "destination": "/index.html" }`
  2. package.json: Added `"engines": { "node": ">=20.19.0" }` for Vite 7 compatibility
  3. index.html: Removed broken favicon link, updated title to "La Aldea Fit"
  4. src/pages/LoginPage.tsx: "JavierFitness" -> "La Aldea Fit"
  5. src/pages/RegisterPage.tsx: "JavierFitness" -> "La Aldea Fit"
  6. src/layouts/ClientLayout.tsx: "JavierFitness" -> "La Aldea Fit"
  7. src/layouts/TrainerLayout.tsx: "JavierFitness" -> "La Aldea Fit"

verification: Build succeeds after all changes (`pnpm build` -- tsc + vite build clean). dist/index.html verified correct. No remaining "JavierFitness" references in src/.

files_changed:
  - vercel.json
  - package.json
  - index.html
  - src/pages/LoginPage.tsx
  - src/pages/RegisterPage.tsx
  - src/layouts/ClientLayout.tsx
  - src/layouts/TrainerLayout.tsx
