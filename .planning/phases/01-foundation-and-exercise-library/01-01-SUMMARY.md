---
phase: 01-foundation-and-exercise-library
plan: 01
subsystem: infra
tags: [vite, react, typescript, supabase, tailwindcss, shadcn-ui, i18next, tanstack-query, react-router, rls]

# Dependency graph
requires:
  - phase: none
    provides: first phase, no dependencies
provides:
  - Vite + React 19 + TypeScript project scaffold
  - Supabase client singleton with typed Database generic
  - i18next bilingual system (Spanish/English) with language detection
  - Tailwind CSS 4 + shadcn/ui component library (button, card, input, label, dialog, sonner)
  - Decimal normalization utilities (normalizeDecimal, formatWeight)
  - Complete Phase 1 database schema (profiles, user_roles, exercises) with RLS
  - Custom Access Token Hook for JWT role injection
  - Profile auto-creation trigger on user signup
affects: [01-02, 01-03, all-future-plans]

# Tech tracking
tech-stack:
  added: [react@19.2.4, vite@7.3.1, typescript@5.9.3, "@supabase/supabase-js@2.97.0", "@tanstack/react-query@5.90.21", react-router@7.13.1, i18next@25.8.13, react-i18next@16.5.4, tailwindcss@4.2.1, "shadcn/ui", clsx, tailwind-merge, class-variance-authority, lucide-react, sonner]
  patterns: [supabase-client-singleton, i18next-bundled-translations, path-alias-at, shadcn-ui-component-library, rls-separate-policies, custom-access-token-hook, profile-auto-creation-trigger]

key-files:
  created: [src/lib/supabase.ts, src/lib/i18n.ts, src/lib/utils.ts, src/types/database.ts, src/types/i18next.d.ts, src/main.tsx, src/App.tsx, src/index.css, public/locales/en/translation.json, public/locales/es/translation.json, supabase/migrations/00001_initial_schema.sql, vite.config.ts, tsconfig.json, tsconfig.app.json, tsconfig.node.json, components.json, .env.example]
  modified: []

key-decisions:
  - "Used @vitejs/plugin-react-swc for faster builds over standard Babel plugin"
  - "Bundled translations directly via import instead of HTTP lazy loading (only 2 languages)"
  - "Spanish as fallback language (primary user base)"
  - "Zinc color palette for shadcn/ui with dark/light theme CSS variables"
  - "Removed next-themes dependency from shadcn sonner component (not using Next.js)"
  - "10 granular RLS policies (separate per operation, never FOR ALL)"
  - "Custom Access Token Hook pattern for JWT role injection over user_metadata"

patterns-established:
  - "Pattern: Supabase client singleton typed with Database generic at src/lib/supabase.ts"
  - "Pattern: i18n initialized via side-effect import in main.tsx"
  - "Pattern: Path alias @/ -> src/ in both vite.config.ts and tsconfig.app.json"
  - "Pattern: shadcn/ui components in src/components/ui/ with cn() utility"
  - "Pattern: Decimal input normalization via normalizeDecimal() for European locale support"
  - "Pattern: RLS policies use (select auth.jwt()->>'user_role') for role checks"
  - "Pattern: Profile auto-created via trigger on auth.users insert"

requirements-completed: [INFR-01, INFR-02, INFR-03]

# Metrics
duration: 20min
completed: 2026-02-23
---

# Phase 1 Plan 1: Foundation Infrastructure Summary

**Vite + React 19 + TypeScript scaffold with Supabase client, i18next bilingual system, shadcn/ui component library, decimal utilities, and complete Phase 1 database schema with RLS policies and Custom Access Token Hook**

## Performance

- **Duration:** 20 min
- **Started:** 2026-02-24T02:34:19Z
- **Completed:** 2026-02-24T02:54:05Z
- **Tasks:** 2
- **Files modified:** 31

## Accomplishments
- Complete Vite + React 19 + TypeScript project that builds with zero errors
- Supabase client singleton typed with Database generic for all Phase 1 tables
- i18next configured with Spanish/English translations covering auth, exercises, nav, theme, and language keys
- shadcn/ui initialized with 6 core components (button, card, input, label, dialog, sonner)
- Decimal normalization utilities ready for weight inputs with European locale support
- Complete SQL migration with profiles, user_roles, exercises tables, 10 RLS policies, Custom Access Token Hook, profile auto-creation trigger, and updated_at trigger

## Task Commits

Each task was committed atomically:

1. **Task 1: Scaffold Vite project with all dependencies, Tailwind, shadcn/ui, i18n, and Supabase client** - `0415348` (feat)
2. **Task 2: Create Supabase database migration with complete Phase 1 schema** - `2d7abf9` (feat)

## Files Created/Modified
- `vite.config.ts` - Vite config with React SWC, Tailwind CSS, and path alias
- `tsconfig.json` / `tsconfig.app.json` / `tsconfig.node.json` - TypeScript project references with path alias
- `src/lib/supabase.ts` - Supabase client singleton with typed Database generic
- `src/lib/i18n.ts` - i18next configuration with bundled translations and browser language detection
- `src/lib/utils.ts` - cn(), normalizeDecimal(), formatWeight() utilities
- `src/types/database.ts` - TypeScript types for profiles, user_roles, exercises with Database type
- `src/types/i18next.d.ts` - Type-safe translation key declarations
- `src/main.tsx` - App entry with QueryClientProvider, BrowserRouter, i18n init
- `src/App.tsx` - Placeholder page with JavierFitness card and language toggle
- `src/index.css` - Tailwind CSS with shadcn/ui dark/light theme variables (zinc palette)
- `src/vite-env.d.ts` - Vite environment variable types
- `src/components/ui/*.tsx` - 6 shadcn/ui components (button, card, input, label, dialog, sonner)
- `public/locales/en/translation.json` - English translations
- `public/locales/es/translation.json` - Spanish translations
- `supabase/migrations/00001_initial_schema.sql` - Complete Phase 1 database schema
- `components.json` - shadcn/ui configuration
- `.env.example` - Supabase environment variable placeholders
- `index.html` - HTML entry point
- `package.json` - Project dependencies and scripts

## Decisions Made
- Used @vitejs/plugin-react-swc for faster builds over standard Babel plugin
- Bundled translations directly instead of HTTP lazy loading (only 2 languages, minimal bundle impact)
- Set Spanish as fallback language per project requirements (primary user base)
- Chose zinc color palette with shadcn/ui for a professional fitness app aesthetic
- Removed next-themes from sonner component since we are not using Next.js (will implement theme toggle via CSS class in Plan 02)
- Created 10 granular RLS policies with separate policies per operation (never FOR ALL) per security best practices
- Used Custom Access Token Hook pattern for JWT role injection instead of user_metadata (prevents privilege escalation)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed pnpm globally**
- **Found during:** Task 1 (project scaffolding)
- **Issue:** pnpm was not installed on the system, blocking all dependency installation
- **Fix:** Ran `npm install -g pnpm` to install pnpm 10.30.2
- **Files modified:** None (global install)
- **Verification:** `pnpm --version` returns 10.30.2
- **Committed in:** Part of Task 1 setup

**2. [Rule 3 - Blocking] Fixed Vite template scaffold**
- **Found during:** Task 1 (project scaffolding)
- **Issue:** `pnpm create vite@latest` interactive mode did not properly apply --template react-swc-ts; created vanilla TypeScript template instead
- **Fix:** Manually created package.json with React 19, @vitejs/plugin-react-swc, and proper React dependencies
- **Files modified:** package.json
- **Verification:** Build passes with React JSX, SWC transforms working
- **Committed in:** 0415348

**3. [Rule 1 - Bug] Fixed shadcn/ui component output directory**
- **Found during:** Task 1 (shadcn/ui init)
- **Issue:** `pnpm dlx shadcn@latest add` created components in literal `@/` directory instead of resolving the alias to `src/`
- **Fix:** Copied components from `@/components/ui/` to `src/components/ui/` and removed the erroneous directory
- **Files modified:** src/components/ui/*.tsx
- **Verification:** All 6 components importable, build passes
- **Committed in:** 0415348

**4. [Rule 1 - Bug] Fixed sonner component next-themes import**
- **Found during:** Task 1 (shadcn/ui component review)
- **Issue:** shadcn generated sonner.tsx with `import { useTheme } from "next-themes"` and a circular self-import; we are not using Next.js
- **Fix:** Rewrote sonner.tsx to import directly from `sonner` package, removed next-themes dependency and circular import
- **Files modified:** src/components/ui/sonner.tsx, package.json (removed next-themes)
- **Verification:** Build passes, Toaster component renders correctly
- **Committed in:** 0415348

---

**Total deviations:** 4 auto-fixed (2 blocking, 2 bugs)
**Impact on plan:** All auto-fixes necessary for the project to build and function. No scope creep.

## Issues Encountered
- Vite CLI interactive prompts required workarounds (piping empty input) for non-interactive execution
- shadcn/ui CLI does not properly resolve TypeScript path aliases when creating component files

## User Setup Required

**External services require manual configuration.** The following must be completed before Plan 02:

**Supabase Project Setup:**
1. Create a new Supabase project at https://supabase.com/dashboard -> New Project (free tier)
2. Copy Project URL and anon/public key from Supabase Dashboard -> Project Settings -> API
3. Update `.env.local` with real values:
   - `VITE_SUPABASE_URL=https://your-project-id.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=your-anon-key`
4. Run `supabase/migrations/00001_initial_schema.sql` in Supabase SQL Editor
5. Enable Custom Access Token Hook: Dashboard -> Authentication -> Hooks -> Custom Access Token Hook -> select `public.custom_access_token_hook`
6. Disable email confirmation: Dashboard -> Authentication -> Providers -> Email -> toggle off "Confirm email"

## Next Phase Readiness
- Project builds and dev server runs successfully
- All infrastructure utilities (supabase client, i18n, decimal normalization) are ready for Plan 02 (auth system)
- Database schema is ready to be applied to Supabase
- shadcn/ui components are available for building auth forms and exercise UI
- Blocker: Supabase project must be created and `.env.local` configured before auth features will work

## Self-Check: PASSED

- All 14 key files exist
- Both task commits verified (0415348, 2d7abf9)
- Build passes with zero errors

---
*Phase: 01-foundation-and-exercise-library*
*Completed: 2026-02-23*
