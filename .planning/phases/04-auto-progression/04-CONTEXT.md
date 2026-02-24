# Phase 4: Auto-Progression - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

The app intelligently suggests weight increases when clients demonstrate readiness. When a client logs 15+ reps on an exercise, the app suggests increasing the weight for the next session. The suggestion must be confirmed by client or trainer before taking effect. Detection logic, suggestion lifecycle, and presentation UI are in scope. Complex periodization algorithms, AI-based recommendations, and automatic (unconfirmed) weight changes are out of scope.

</domain>

<decisions>
## Implementation Decisions

### Detection Rule
- **Trigger threshold**: Any single set hitting 15+ reps on an exercise triggers a suggestion (not all sets, not last set only)
- **Re-suggestion after dismissal**: If a client dismisses a suggestion and continues hitting 15+ reps at the same weight, re-suggest after N sessions (not permanently dismissed, not every session). Exact N is Claude's discretion — recommend 3 sessions as a sensible default.

### Suggestion Visibility
- **Client sees suggestions on post-workout summary screen** — not inline during the workout. All suggestions for that session shown together after the workout is complete.
- **Trainer sees pending suggestions in client detail view** — when viewing a specific client's profile/plan, trainer can see and act on pending suggestions.
- **No dashboard-level indicator** for pending suggestions (trainer must drill into client detail to see them).

### Confirm/Dismiss Flow
- Confirmation step, stale suggestion handling, trainer override behavior, and cycle transition handling are all Claude's discretion (see below).

### Weight Increment
- **Per-exercise increments** — different exercises can have different progression increments (e.g., +5kg for deadlifts, +1.25kg for lateral raises, +2.5kg as default).
- Who sets the increment and how it's configured is Claude's discretion (see below).

### Claude's Discretion
- **Warm-up set filtering**: Whether to ignore sets at lighter-than-prescribed weight (recommend: ignore them — only evaluate sets at prescribed weight)
- **Detection timing**: Whether to run detection after full session or after each exercise (recommend: after session completion — simpler, no mid-workout interruptions)
- **Confirmation step**: One-tap accept vs. confirmation dialog (recommend: confirmation dialog for irreversible weight changes on mobile)
- **Trainer override power**: Whether trainer can override client's accept/dismiss decisions (recommend: independent actions — both can act on pending suggestions, neither undoes the other's resolved decisions. Trainer can always manually edit the plan)
- **Stale suggestion handling**: What happens when trainer manually changes weight and a pending suggestion references the old weight (recommend: auto-dismiss stale suggestions to prevent weight-reducing mistakes)
- **Cycle reset**: Whether pending suggestions clear when a new training cycle starts (recommend: clear all pending on new cycle — clean slate)
- **Increment default + override**: How per-exercise increments are configured (recommend: default 2.5kg, trainer can optionally override per exercise)
- **Suggestion display format**: Show exact new weight vs. just the increment (recommend: show both current and target weight for clarity)
- **Editable before accept**: Whether the target weight can be adjusted before confirming (recommend: accept as-is for simplicity — trainer can always edit plan manually for custom adjustments)
- **Acceptance feedback**: Toast vs. inline confirmation after accepting (recommend: toast notification — brief and non-blocking)

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches. The user wants per-exercise configurable increments and post-session summary presentation rather than inline mid-workout suggestions.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 04-auto-progression*
*Context gathered: 2026-02-23*
