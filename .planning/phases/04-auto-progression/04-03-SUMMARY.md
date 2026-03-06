---
phase: 04-auto-progression
plan: 03
subsystem: ui
tags: [i18n, react-i18next, toast, progression]

# Dependency graph
requires:
  - phase: 04-auto-progression
    provides: "Progression hooks (useAcceptSuggestion, useDismissSuggestion) and suggestion UI components"
provides:
  - "Correctly interpolated accepted_toast with exercise name and weight"
  - "Aligned i18n error keys (accept_error, dismiss_error) between hooks and JSON locale files"
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Mutation context object pattern: pass display data alongside IDs for toast interpolation"

key-files:
  created: []
  modified:
    - src/features/progression/hooks/useProgression.ts
    - src/features/progression/components/ProgressionSuggestionCard.tsx
    - src/locales/en/translation.json
    - src/locales/es/translation.json

key-decisions:
  - "Mutation accepts context object {suggestionId, exerciseName, suggestedWeight} so onSuccess can interpolate toast without refetching"
  - "Renamed JSON keys (error_accept -> accept_error) rather than changing hook references, since hook naming convention (verb_noun) is more natural"

patterns-established:
  - "Mutation context pattern: when onSuccess needs display data not in the mutation response, include it in the mutation variables object"

requirements-completed: [PROG-01, PROG-02]

# Metrics
duration: 3min
completed: 2026-02-28
---

# Phase 4 Plan 3: Progression i18n Gap Closure Summary

**Fixed accepted_toast interpolation with exercise name/weight and aligned error key names across hooks and locale JSON files**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-01T03:35:17Z
- **Completed:** 2026-03-01T03:38:15Z
- **Tasks:** 1
- **Files modified:** 4

## Accomplishments
- Fixed accepted_toast to display actual exercise name and weight instead of literal {{weight}} and {{exercise}} placeholder text
- Renamed error_accept/error_dismiss to accept_error/dismiss_error in both en and es locale files to match hook key references
- Spanish users now see correctly localized error messages for accept/dismiss failures

## Task Commits

Each task was committed atomically:

1. **Task 1: Fix accepted_toast interpolation and error key mismatches** - `f55a9d6` (fix)

**Plan metadata:** `1294199` (docs: complete plan)

## Files Created/Modified
- `src/features/progression/hooks/useProgression.ts` - Changed useAcceptSuggestion mutationFn to accept context object with exerciseName and suggestedWeight; onSuccess uses variables for toast interpolation
- `src/features/progression/components/ProgressionSuggestionCard.tsx` - Updated acceptMutation.mutate() call to pass context object instead of plain suggestion ID
- `src/locales/en/translation.json` - Renamed error_accept to accept_error, error_dismiss to dismiss_error in progression namespace
- `src/locales/es/translation.json` - Renamed error_accept to accept_error, error_dismiss to dismiss_error in progression namespace

## Decisions Made
- Changed mutation to accept a context object `{suggestionId, exerciseName, suggestedWeight}` so `onSuccess` can interpolate the toast without re-fetching data
- Renamed JSON keys to match hook references (error_accept -> accept_error) rather than the reverse, since hook naming convention (verb_noun) is more natural and changing JSON is less risky

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All Phase 4 progression feature gaps are now closed
- All i18n keys are aligned between hooks and locale JSON files
- Production build passes with zero TypeScript errors

## Self-Check: PASSED

All files verified present. All commits verified in git log.

---
*Phase: 04-auto-progression*
*Completed: 2026-02-28*
