---
phase: 02-core-training-loop
plan: 01
subsystem: database
tags: [supabase, postgresql, rls, rpc, typescript, zod, tanstack-query, react-hook-form, date-fns, youtube]

# Dependency graph
requires:
  - phase: 01-foundation-and-exercise-library
    provides: Supabase client singleton, Database type, exercise library schema, exerciseKeys query pattern
provides:
  - Phase 2 SQL migration with 5 tables, RLS policies, 3 RPC functions, performance indexes
  - Updated Database type with all Phase 2 tables and function signatures
  - Plan types, Zod 4 schemas, query hooks, and mutation hooks
  - Workout types, schemas, query hooks (with pre-fill), and mutation hooks (with optimistic updates)
  - Dashboard types and query hooks (RPC-based)
  - YouTube URL parsing utility and training cycle date utilities
affects: [02-02, 02-03, 02-04, all-phase-2-plans]

# Tech tracking
tech-stack:
  added: [react-hook-form@7.71.2, zod@4.3.6, "@hookform/resolvers@5.2.2", react-lite-youtube-embed@3.5.1, date-fns@4.1.0]
  patterns: [immutable-plan-versioning, plan-group-id-lineage, query-key-factory, optimistic-update-set-logging, rpc-dashboard-lateral-join, zod4-form-validation, security-definer-rls-helpers]

key-files:
  created: [supabase/migrations/00002_training_loop_schema.sql, src/features/plans/types.ts, src/features/plans/schemas.ts, src/features/plans/hooks/usePlans.ts, src/features/plans/hooks/usePlanMutations.ts, src/features/workouts/types.ts, src/features/workouts/schemas.ts, src/features/workouts/hooks/useWorkouts.ts, src/features/workouts/hooks/useWorkoutMutations.ts, src/features/dashboard/types.ts, src/features/dashboard/hooks/useDashboard.ts, src/lib/utils/youtube.ts, src/lib/utils/cycle.ts]
  modified: [src/types/database.ts, package.json, pnpm-lock.yaml]

key-decisions:
  - "Separate RLS policies per operation for trainer (SELECT, INSERT, UPDATE, DELETE) instead of FOR ALL to follow Phase 1 convention of never using FOR ALL for mixed-role policies"
  - "is_trainer() SECURITY DEFINER helper function wraps JWT check for reuse across all Phase 2 RLS policies"
  - "Plan mutations use sequential inserts (plan -> days -> exercises) instead of batch to maintain FK integrity"
  - "useUpdateDraftPlan deletes and re-inserts training days/exercises rather than patching to simplify diff logic"
  - "useLogSet implements full optimistic update pattern (onMutate/onError/onSettled) for responsive gym-floor logging"
  - "useLastSessionValues returns Map<planExerciseId, setValues[]> for efficient pre-fill lookup by the workout logger"
  - "Dashboard RPC uses LATERAL JOINs to compute today_workout_status and last_workout_at in a single query"

patterns-established:
  - "Pattern: planKeys/workoutKeys/dashboardKeys query key factories follow exerciseKeys convention from Phase 1"
  - "Pattern: Mutation hooks accept {entityId, clientId} objects to enable cache invalidation by clientId"
  - "Pattern: Nested Supabase select with sort-after-fetch for ordered plan data"
  - "Pattern: Zod 4 schemas shared between form validation and type inference via z.infer"
  - "Pattern: RPC function signatures typed in Database.public.Functions for Supabase typed client"
  - "Pattern: Optimistic updates for high-frequency mutations (set logging) with rollback on error"

requirements-completed: [PLAN-01, PLAN-02, PLAN-03, PLAN-05, PLAN-06, WLOG-01, WLOG-02, WLOG-03, WLOG-04, DASH-01, DASH-02]

# Metrics
duration: 9min
completed: 2026-02-28
---

# Phase 2 Plan 1: Phase 2 Data Layer Summary

**Complete Phase 2 data layer with immutable plan versioning schema, 24 RLS policies, 3 RPC functions, Zod 4 validation schemas, TanStack Query hooks with optimistic updates, and date-fns/YouTube utilities**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-28T16:09:31Z
- **Completed:** 2026-02-28T16:18:33Z
- **Tasks:** 2
- **Files modified:** 16

## Accomplishments
- SQL migration with 5 tables implementing immutable plan versioning (plan_group_id + version + status pattern)
- 24 RLS policies enforcing trainer/client data isolation with is_trainer() SECURITY DEFINER helper and initPlan optimization
- 3 RPC functions: create_plan_version (deep copy), activate_plan_version (atomic transition), get_client_dashboard (LATERAL JOINs)
- Complete TypeScript types for plans, workouts, and dashboard with Database type updated for 5 new tables + 3 functions
- Zod 4 schemas (planSchema, exerciseSchema, trainingDaySchema, setLogSchema) ready for React Hook Form integration
- TanStack Query hooks with query key factories for plans, workouts, and dashboard
- Mutation hooks with optimistic updates for set logging (onMutate/onError/onSettled pattern)
- Pre-fill hook (useLastSessionValues) fetching last completed session's actual values per locked decision
- YouTube URL parser supporting 4 formats and training cycle date utilities using date-fns

## Task Commits

Each task was committed atomically:

1. **Task 1: Create Phase 2 database migration with tables, RLS, RPC functions, and indexes** - `afc6554` (feat)
2. **Task 2: Create TypeScript types, Zod schemas, TanStack Query hooks, and utility functions** - `c56013a` (feat)

## Files Created/Modified
- `supabase/migrations/00002_training_loop_schema.sql` - Complete Phase 2 schema (5 tables, 24 RLS policies, 3 RPC functions, 8 indexes)
- `src/types/database.ts` - Updated Database type with all Phase 2 tables and function signatures
- `src/features/plans/types.ts` - TrainingPlan, TrainingDay, PlanExercise, PlanWithDays types
- `src/features/plans/schemas.ts` - planSchema, trainingDaySchema, exerciseSchema (Zod 4)
- `src/features/plans/hooks/usePlans.ts` - planKeys factory, useActivePlan, useClientPlans, usePlanDetail
- `src/features/plans/hooks/usePlanMutations.ts` - useCreatePlan, useUpdateDraftPlan, useCreatePlanVersion, useActivatePlan, useDeleteDraftPlan
- `src/features/workouts/types.ts` - WorkoutSession, WorkoutSet, SessionWithSets, LastSessionValues
- `src/features/workouts/schemas.ts` - setLogSchema for set logging validation
- `src/features/workouts/hooks/useWorkouts.ts` - workoutKeys factory, useWorkoutHistory, useLastSessionValues, useSessionSets
- `src/features/workouts/hooks/useWorkoutMutations.ts` - useStartSession, useLogSet (optimistic), useCompleteSession
- `src/features/dashboard/types.ts` - ClientDashboardRow interface
- `src/features/dashboard/hooks/useDashboard.ts` - dashboardKeys factory, useClientDashboard (RPC), useClientDetail
- `src/lib/utils/youtube.ts` - extractYouTubeVideoId (4 URL formats), getYouTubeThumbnailUrl
- `src/lib/utils/cycle.ts` - calculateCycleEnd, formatSessionDuration, formatRelativeDate
- `package.json` - Added react-hook-form, zod, @hookform/resolvers, react-lite-youtube-embed, date-fns
- `pnpm-lock.yaml` - Updated lockfile

## Decisions Made
- Used separate RLS policies per operation for trainer role (not FOR ALL) to match Phase 1 security convention
- Created is_trainer() helper as SECURITY DEFINER to centralize JWT role checks and avoid RLS on joined tables
- Plan mutations use sequential inserts (plan -> days -> exercises) for FK integrity
- useUpdateDraftPlan deletes and re-inserts days/exercises rather than diffing (simpler, works well for form-based editing)
- Implemented full optimistic update pattern for useLogSet (gym-floor responsiveness)
- useLastSessionValues returns Map for O(1) lookup by plan_exercise_id during pre-fill
- Dashboard RPC computes all client status in single query with LATERAL JOINs (avoids N+1)

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**The SQL migration must be applied to the Supabase database.**
1. Open Supabase Dashboard -> SQL Editor
2. Paste and run `supabase/migrations/00002_training_loop_schema.sql`
3. Verify tables created: training_plans, training_days, plan_exercises, workout_sessions, workout_sets

## Next Phase Readiness
- All Phase 2 data layer components ready for UI implementation
- Plan builder (02-02) can use planSchema, useCreatePlan, useActivatePlan
- Workout logger (02-03) can use useLastSessionValues, useLogSet (optimistic), useCompleteSession
- Trainer dashboard (02-04) can use useClientDashboard (RPC), useClientDetail
- SQL migration ready to be applied in Supabase SQL Editor

## Self-Check: PASSED

- All 14 key files exist
- Both task commits verified (afc6554, c56013a)
- Build passes with zero TypeScript errors

---
*Phase: 02-core-training-loop*
*Completed: 2026-02-28*
