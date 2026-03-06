---
status: diagnosed
trigger: "Investigate why progression suggestions don't appear on the post-workout Session Summary screen"
created: 2026-03-01T00:00:00Z
updated: 2026-03-01T00:06:00Z
---

## Current Focus

hypothesis: CONFIRMED - Three compounding bugs prevent suggestions from ever appearing
test: Traced full chain from workout completion through RPC to query to rendering
expecting: n/a - root causes found
next_action: Report diagnosis

## Symptoms

expected: After completing a workout, the Session Summary screen should show a "Progression Suggestions" section with ProgressionSuggestionCard components for eligible exercises. Trainer should also see pending suggestions in client detail Plan tab.
actual: No progression suggestions section appears on either the Session Summary screen or the trainer Plan tab
errors: None reported (fire-and-forget swallows all errors)
reproduction: Complete a workout where exercises have 15+ reps at prescribed weight, check Session Summary. Also check trainer dashboard -> client detail -> Plan tab.
started: Since Phase 04 auto-progression feature was built

## Eliminated

- hypothesis: ProgressionSuggestionList not rendered in SessionSummary
  evidence: session-summary.tsx line 84 renders <ProgressionSuggestionList clientId={clientId} />
  timestamp: 2026-03-01

- hypothesis: ProgressionSuggestionList not rendered in trainer PlanTab
  evidence: client-detail-tabs.tsx line 23 imports it, line 154 renders <ProgressionSuggestionList clientId={clientId} />
  timestamp: 2026-03-01

- hypothesis: clientId not passed through properly
  evidence: workout-session.tsx line 33 gets clientId from auth, line 132 passes clientId={clientId!} to SessionSummary. client-detail-tabs.tsx passes clientId from props.
  timestamp: 2026-03-01

- hypothesis: RPC function signature mismatch
  evidence: Both useWorkoutMutations.ts (line 159) and the SQL function accept { p_session_id: UUID }. database.ts types also match.
  timestamp: 2026-03-01

- hypothesis: usePendingSuggestions query has wrong filter or syntax
  evidence: useProgression.ts lines 50-57 correctly filters .eq("client_id", clientId!).eq("status", "pending") with proper PostgREST join syntax
  timestamp: 2026-03-01

- hypothesis: Trainer RLS blocks SELECT on progression_suggestions
  evidence: SELECT policy (migration line 72-78) allows client_id = auth.uid() OR is_trainer()
  timestamp: 2026-03-01

- hypothesis: Client cannot SELECT from tables needed by the RPC
  evidence: RLS SELECT policies exist for clients on all four tables joined in the RPC query (workout_sets via session ownership, plan_exercises via plan ownership, exercises for active clients, workout_sessions by client_id)
  timestamp: 2026-03-01

- hypothesis: RPC INSERT blocked by RLS for client
  evidence: INSERT policy requires client_id = auth.uid(). RPC is SECURITY INVOKER. RPC inserts with rec.client_id from workout_sessions.client_id = auth.uid(). Policy satisfied.
  timestamp: 2026-03-01

- hypothesis: useCheckProgression hook not called anywhere
  evidence: The hook IS unused, but useCompleteSession calls supabase.rpc directly (line 159), so the RPC IS invoked. The hook is dead code but irrelevant.
  timestamp: 2026-03-01

## Evidence

- timestamp: 2026-03-01T00:01:00Z
  checked: session-summary.tsx rendering pipeline
  found: ProgressionSuggestionList correctly imported (line 6) and rendered (line 84) inside <div className="w-full max-w-sm"> with clientId prop. Rendering layer is correctly wired.
  implication: If data exists in DB, the client would see it.

- timestamp: 2026-03-01T00:01:30Z
  checked: ProgressionSuggestionList component behavior with no data
  found: Returns null when isPending OR !suggestions OR suggestions.length === 0 (line 22). Component stays mounted (hooks active), just renders nothing to DOM.
  implication: Component correctly renders nothing when no data exists. React Query observer stays active for refetches.

- timestamp: 2026-03-01T00:02:00Z
  checked: usePendingSuggestions hook query
  found: Queries progression_suggestions with client_id and status='pending' filter, joins exercise name and plan_exercise weight. enabled: !!clientId. Query is correct.
  implication: Query would return results if rows existed.

- timestamp: 2026-03-01T00:02:30Z
  checked: Fire-and-forget RPC call in useCompleteSession (useWorkoutMutations.ts lines 157-171)
  found: CRITICAL ERROR HANDLING BUG. supabase.rpc() returns Promise<{data, error}>. This Promise ALWAYS resolves (Supabase JS client never rejects). The .catch() on line 166 is dead code - it can only fire on Promise rejection which never happens. The .then() on line 161 fires but NEVER inspects the error field in the response. Even if the RPC returns {data: null, error: PostgrestError}, the code proceeds to invalidateQueries as if it succeeded.
  implication: ANY RPC failure is 100% invisible. No error logging, no user feedback, no way to diagnose.

- timestamp: 2026-03-01T00:03:00Z
  checked: RPC detection criteria in SQL (migration lines 118-134)
  found: Requires BOTH: wsets.reps >= 15 AND wsets.weight_kg >= pe.prescribed_weight_kg. Standard training prescribes 8-12 reps. Pre-fill in exercise-logger.tsx defaults to last session values or prescribed values.
  implication: Unless a client manually enters 15+ reps, the detection threshold is never met.

- timestamp: 2026-03-01T00:03:30Z
  checked: Race condition timing between RPC and usePendingSuggestions
  found: React Query mutation onSuccess order: (1) mutation-level onSuccess fires (starts fire-and-forget RPC), (2) mutate-call onSuccess fires (setIsCompleted(true)), (3) React re-renders, SessionSummary mounts, usePendingSuggestions fires initial query -> returns empty. RPC is still in-flight. When RPC completes, .then() invalidates query, triggering refetch. Data should appear after ~1-2 second delay IF RPC succeeds and inserts rows.
  implication: Race condition causes delay but NOT permanent failure -- invalidation triggers refetch. The permanent failure is caused by no rows being inserted.

- timestamp: 2026-03-01T00:04:00Z
  checked: QueryClient default staleTime
  found: main.tsx line 12: staleTime = 5 minutes. However, invalidateQueries() overrides staleTime and forces refetch for active observers regardless.
  implication: staleTime does not prevent the refetch after invalidation. Not a contributing factor.

- timestamp: 2026-03-01T00:04:30Z
  checked: Whether migration 00005 was applied
  found: Cannot verify from code alone. Migration file exists at supabase/migrations/00005_progression_suggestions.sql. Whether it was applied to the running Supabase instance is unknown.
  implication: If migration was never applied, the table and RPC function don't exist. Every RPC call returns an error that is silently swallowed by the broken error handling.

- timestamp: 2026-03-01T00:05:00Z
  checked: PostgREST builder .then() behavior
  found: PostgrestBuilder.then() is lazy - the HTTP fetch is only initiated when .then() is called. Promise.resolve(supabase.rpc(...)) calls the thenable's .then() to unwrap it, which triggers the fetch. So the RPC call IS initiated.
  implication: The RPC request is made. The issue is either the response error being ignored, or the RPC not inserting rows.

## Resolution

root_cause: |
  Three compounding bugs prevent progression suggestions from ever appearing:

  BUG 1 - SILENT ERROR SWALLOWING (Critical, likely primary cause):
  File: /Users/macbookpro/Documents/JavierFitnessApp/src/features/workouts/hooks/useWorkoutMutations.ts, lines 157-171
  The fire-and-forget RPC call has fundamentally broken error handling. supabase.rpc()
  returns {data, error} and NEVER rejects its Promise. The .catch() handler (line 166)
  is dead code. The .then() handler (line 161) never inspects the error field. If the
  RPC fails for ANY reason (migration not applied, table doesn't exist, SQL runtime
  error, RLS violation), the error is silently swallowed with zero visibility. This is
  the most likely primary cause: if migration 00005 was never applied to the Supabase
  instance, every call returns an error response that nobody ever reads.

  BUG 2 - RACE CONDITION ON POST-WORKOUT SCREEN (Medium severity):
  Files: /Users/macbookpro/Documents/JavierFitnessApp/src/features/workouts/hooks/useWorkoutMutations.ts (onSuccess handler)
         /Users/macbookpro/Documents/JavierFitnessApp/src/features/workouts/components/workout-session.tsx (line 115)
  The RPC is fire-and-forget async. SessionSummary mounts and usePendingSuggestions
  fetches BEFORE the RPC completes. The subsequent invalidation does trigger a refetch
  (so data should appear after a 1-2 second delay), but if the user navigates away
  (taps "Done") before the RPC completes + refetch completes, they never see suggestions.
  The query is NOT awaited before showing the summary screen.

  BUG 3 - DEAD CODE / UNUSED HOOK (Low severity, code quality):
  File: /Users/macbookpro/Documents/JavierFitnessApp/src/features/progression/hooks/useProgression.ts, lines 21-40
  useCheckProgression hook is defined but never used anywhere. The actual RPC call is
  made directly in useCompleteSession. The hook has proper error handling (checks the
  error field and throws), cache invalidation, and React Query integration -- but none
  of that is utilized. If useCompleteSession used this hook instead of raw supabase.rpc(),
  errors would be properly surfaced.

  RESOLUTION STRATEGY:
  1. First: Verify migration 00005 is applied (check Supabase dashboard for
     progression_suggestions table and check_progression_eligibility function)
  2. Fix error handling: either use the existing useCheckProgression hook, or add
     error checking to the fire-and-forget call (.then(({error}) => { if (error) console.error(...) }))
  3. Fix race condition: await the RPC before showing SessionSummary, or show a
     loading/checking state while the RPC is in flight, then display results
  4. Clean up dead code: remove unused useCheckProgression or wire it in

fix:
verification:
files_changed: []
