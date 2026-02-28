---
phase: 02-core-training-loop
plan: 02
subsystem: ui
tags: [react-hook-form, useFieldArray, zod, shadcn-ui, react-router, i18n, mobile-first, plan-builder]

# Dependency graph
requires:
  - phase: 02-core-training-loop
    plan: 01
    provides: Plan types, Zod schemas (planSchema), query hooks (useActivePlan, usePlanDetail, useClientPlans), mutation hooks (useCreatePlan, useUpdateDraftPlan, useCreatePlanVersion, useActivatePlan), dashboard hooks (useClientDashboard, useClientDetail), YouTube utility
provides:
  - PlanForm component with nested useFieldArray for days and exercises
  - ExercisePickerDialog to search/select exercises from library
  - PlanCard read-only plan display with expandable training days
  - PlanVersionBanner for draft version management and activation flow
  - ClientsPage with search, status badges, workout indicators, and activation toggles
  - ClientPlanPage showing active plan, draft banner, create/edit actions
  - PlanEditPage wrapping PlanForm for create and edit modes
  - Trainer route registration and bottom nav update
  - Full bilingual (EN/ES) translation keys for plan builder
affects: [02-03, 02-04, all-phase-2-ui]

# Tech tracking
tech-stack:
  added: []
  patterns: [nested-useFieldArray-form, exercise-name-tracking-via-local-state, normalize-order-on-submit, plan-versioning-ux-flow, client-search-filter]

key-files:
  created: [src/features/plans/components/plan-form.tsx, src/features/plans/components/training-day-card.tsx, src/features/plans/components/exercise-row.tsx, src/features/plans/components/exercise-picker-dialog.tsx, src/features/plans/components/plan-card.tsx, src/features/plans/components/plan-version-banner.tsx, src/pages/trainer/ClientsPage.tsx, src/pages/trainer/ClientPlanPage.tsx, src/pages/trainer/PlanEditPage.tsx]
  modified: [src/App.tsx, src/layouts/TrainerLayout.tsx, src/locales/en/translation.json, src/locales/es/translation.json]

key-decisions:
  - "Exercise names tracked via local state map in TrainingDayCard since planSchema only stores exercise_id (not name)"
  - "Day/exercise orders normalized to sequential values on form submit, not during editing (avoids re-render complexity)"
  - "ClientsPage uses useClientDashboard RPC hook instead of raw profile query, gaining workout status and plan info in single call"
  - "ClientPlanPage uses useClientDetail instead of separate useActivePlan to get profile + plan + sessions in one query"
  - "Exercise reordering via useFieldArray move() with up/down buttons (not drag-and-drop) per plan spec for mobile-first v1"
  - "Delete day confirmation only shown when day has exercises, instant delete for empty days"

patterns-established:
  - "Pattern: Nested useFieldArray (days -> exercises) with field.id as key for React Hook Form correctness"
  - "Pattern: DecimalInput (type=text+inputMode=decimal) for weight fields in form context via useController"
  - "Pattern: Exercise picker dialog with client-side search filter and YouTube thumbnails"
  - "Pattern: Plan versioning UX: Edit -> createPlanVersion RPC -> navigate to edit draft -> Activate -> activatePlanVersion RPC"
  - "Pattern: StatusBadge with color-coded styles for draft/active/archived plan states"

requirements-completed: [PLAN-01, PLAN-02, PLAN-03, PLAN-05, PLAN-06]

# Metrics
duration: 26min
completed: 2026-02-28
---

# Phase 2 Plan 2: Plan Builder UI Summary

**Nested plan builder form with dual-level useFieldArray (days/exercises), exercise picker dialog, trainer client management pages, and plan versioning UX flow**

## Performance

- **Duration:** 26 min
- **Started:** 2026-02-28T16:27:00Z
- **Completed:** 2026-02-28T16:53:00Z
- **Tasks:** 2
- **Files modified:** 13

## Accomplishments
- Plan builder form with two levels of nested useFieldArray: training days and exercises within each day
- Exercise picker dialog with search, YouTube thumbnails, and default prescription values (3 sets, 10 reps, 0 kg)
- Exercise reordering via up/down buttons with 48px touch targets for gym use
- Read-only PlanCard with expandable training days showing exercise prescriptions
- PlanVersionBanner with draft detection, edit/activate actions, and confirmation dialog
- ClientsPage with RPC-based dashboard data, search filter, workout status indicators (color-coded dots), and activation toggles
- ClientPlanPage with active plan display, draft version management, create/edit navigation
- PlanEditPage wrapping PlanForm for both create (empty defaults) and edit (pre-populated from draft) modes
- Four new trainer routes registered: /trainer/clients, /trainer/clients/:clientId, /trainer/clients/:clientId/plan/new, /trainer/clients/:clientId/plan/:planId/edit
- TrainerLayout bottom nav updated from Dashboard to Clients with Users icon
- 40+ translation keys added to both EN and ES translation files

## Task Commits

Each task was committed atomically:

1. **Task 1: Create plan builder form components with nested useFieldArray and exercise picker** - `8193327` (feat)
2. **Task 2: Create trainer plan pages, version management banner, routes, and navigation** - `69f9058` (feat)

## Files Created/Modified
- `src/features/plans/components/plan-form.tsx` - Main plan builder form with zodResolver(planSchema), top-level useFieldArray for days
- `src/features/plans/components/training-day-card.tsx` - Single training day card with nested useFieldArray for exercises
- `src/features/plans/components/exercise-row.tsx` - Exercise prescription row with sets/reps/weight inputs and reorder buttons
- `src/features/plans/components/exercise-picker-dialog.tsx` - Dialog to search and select exercises from library with YouTube thumbnails
- `src/features/plans/components/plan-card.tsx` - Read-only plan display with expandable training days and status badges
- `src/features/plans/components/plan-version-banner.tsx` - Banner for draft version with edit/activate actions and confirmation dialog
- `src/pages/trainer/ClientsPage.tsx` - Client list page with search, status badges, workout indicators, activation toggles
- `src/pages/trainer/ClientPlanPage.tsx` - Client plan page showing active plan, draft banner, create/edit actions
- `src/pages/trainer/PlanEditPage.tsx` - Plan editor page wrapping PlanForm for create and edit modes
- `src/App.tsx` - Added 4 trainer routes, redirect /trainer to /trainer/clients
- `src/layouts/TrainerLayout.tsx` - Updated nav from Dashboard to Clients, Users icon
- `src/locales/en/translation.json` - Added plans.*, status.*, trainer.clientPlan, common.back/move_up/move_down
- `src/locales/es/translation.json` - Added Spanish translations for all new keys

## Decisions Made
- Used local state map in TrainingDayCard to track exercise names since Zod schema only stores exercise_id
- Orders are normalized to sequential values on submit (not during editing) to avoid unnecessary re-renders
- ClientsPage uses useClientDashboard RPC for efficient single-query data fetching
- ClientPlanPage uses useClientDetail which fetches profile, active plan, and recent sessions in one call
- Exercise reordering via useFieldArray move() with ChevronUp/ChevronDown buttons per mobile-first constraint
- Delete day confirmation shown only when day has exercises (empty days delete instantly)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused handleActivateDraft function**
- **Found during:** Task 2 (ClientPlanPage)
- **Issue:** TypeScript error TS6133: handleActivateDraft declared but never read (activation handled internally by PlanVersionBanner)
- **Fix:** Removed the unused function and useActivatePlan import from ClientPlanPage
- **Files modified:** src/pages/trainer/ClientPlanPage.tsx
- **Verification:** Build passes with zero TypeScript errors
- **Committed in:** 69f9058 (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 bug)
**Impact on plan:** Minor cleanup, no scope change.

## Issues Encountered

- External linter/agent created additional commits (02-03 components, quick-3 tasks) interleaved with plan execution, modifying App.tsx and translation files. Task 2 files were committed as part of the quick-3 commit (69f9058) rather than as a standalone commit.

## User Setup Required

None - no external service configuration required. Phase 2 SQL migration from plan 02-01 must already be applied.

## Next Phase Readiness
- Plan builder UI complete, ready for client-side workout logging (02-03)
- Trainer dashboard with client plan management ready for enhancement (02-04)
- All plan versioning UX (create -> draft -> activate) wired to the RPC functions from 02-01
- Translation infrastructure expanded with plan/status keys ready for workout and dashboard strings

## Self-Check: PASSED

- All 9 key files exist
- Both task commits verified (8193327, 69f9058)
- Build passes with zero TypeScript errors

---
*Phase: 02-core-training-loop*
*Completed: 2026-02-28*
