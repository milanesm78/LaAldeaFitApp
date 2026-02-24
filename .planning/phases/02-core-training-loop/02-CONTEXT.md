# Phase 2: Core Training Loop - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Trainer can build personalized training plans organized by training days with exercises prescribing sets, reps, and weight. Clients can view their plan, watch exercise videos, start workout sessions, and log every set at the gym. Trainer monitors all clients through a dashboard with color-coded completion indicators. Plans are versioned — edits create new versions for the next cycle while preserving historical workout data.

</domain>

<decisions>
## Implementation Decisions

### Workout logging flow
- Pre-fill set values from **last session's actual values** (not prescribed values). Falls back to prescribed values if no prior session exists
- Exercise view, video placement, and post-workout summary are Claude's discretion (see below)

### Plan builder experience
- Exercise picker, reorder mechanism, versioning UX, and day label format are Claude's discretion (see below)

### Training day navigation
- Day layout, next-day suggestion, session resume behavior, and history view are Claude's discretion (see below)

### Trainer dashboard
- Javier manages **20-50 clients** — scrollable list with search bar for quick access
- Dashboard layout, client detail view, and status indicator colors are Claude's discretion (see below)

### Claude's Discretion
The user delegated these choices — Claude has full flexibility during planning/implementation:

**Workout logging:**
- Exercise display: one at a time (focused) vs all visible (scrollable) — pick based on mobile gym UX
- YouTube video access: behind a tap icon vs always-visible thumbnail — pick for minimal distraction during logging
- Post-workout summary: show stats screen vs simple confirmation — pick what adds value without being annoying

**Plan builder:**
- Exercise picker: searchable dropdown vs browse dialog — pick based on library size and trainer speed
- Versioning UX: automatic draft on edit vs explicit "Create new version" button — pick the safest and simplest flow
- Exercise reordering: up/down arrow buttons vs drag-and-drop — pick for mobile-first v1 context
- Day label format: free text vs auto-letters with optional name — pick for best plan organization

**Training day navigation:**
- Day layout: tabs vs cards — pick based on typical number of training days (3-6)
- Next day suggestion: highlight suggested day vs always manual selection — pick for convenience vs simplicity
- Session resume: detect incomplete session and resume vs always start fresh — pick for gym usage patterns
- Workout history: simple date list vs calendar view — pick the simplest useful approach

**Trainer dashboard:**
- Dashboard home: client list first vs summary overview + list — pick for 20-50 client roster
- Client detail: tabbed view vs single scrollable page — pick for mobile usability with plan, logs, and progress data
- Status colors: green/yellow/gray vs green/blue/gray vs other — pick a clean scheme fitting the app design

</decisions>

<specifics>
## Specific Ideas

- Client count is 20-50 — dashboard must handle a medium-sized roster with search capability
- Pre-fill from last session is a firm decision — clients want to see what they actually lifted, not just what was prescribed
- This is a gym app used with sweaty hands on a phone — every UX choice should optimize for minimal taps and large touch targets

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-core-training-loop*
*Context gathered: 2026-02-23*
