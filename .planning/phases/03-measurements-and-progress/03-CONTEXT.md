# Phase 3: Measurements and Progress - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Clients and trainer can track body composition over time and visualize strength and measurement progress through charts. This includes: monthly body measurement forms (full anthropometric protocol), measurement history views, strength progress charts (weight per exercise over time), and body composition charts (measurements over time). Trainer can view any client's data. Creating workout plans, logging workouts, and auto-progression are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Measurement form structure
- Multi-step wizard format — step through grouped sections one at a time (e.g., Basic info → Skin folds → Bone diameters → Circumferences)
- Each step shows previous measurement values as placeholder/reference so the trainer can see changes while entering new data
- Mobile-optimized steps with clear progress indicator

### Claude's Discretion
- **Anthropometric protocol fields** — Claude selects a common fitness professional protocol (likely based on standard practices: key skin folds, bone diameters, and circumferences). User will adjust specific fields later if needed
- **Who can enter measurements** — Claude decides based on real-world workflow (Javier measures clients in person, so trainer entry makes sense)
- **Exercise selection for strength charts** — Claude picks the best approach for mobile readability (single exercise at a time vs multi-select comparison)
- **Chart time range default** — Claude picks based on typical training cycle length
- **Body composition chart layout** — Claude decides how to organize charts per category vs summary view for clarity on mobile
- **Chart extras (trend lines, annotations)** — Claude picks the right balance of information vs clarity
- **Measurement history display format** — Claude picks the best format for mobile (cards vs table)
- **Change deltas in history** — Claude decides whether to show color-coded differences between entries
- **Edit/delete policy for past entries** — Claude picks the best approach for data integrity
- **Monthly cadence enforcement** — Claude decides between hard monthly limit or soft suggestion
- **Trainer access navigation** — Claude picks the best pattern (client drill-down vs separate analytics section)
- **Trainer vs client chart views** — Claude decides whether views are identical or trainer gets extras
- **Trainer measurement entry** — Claude decides based on real-world workflow
- **Trainer quick summary** — Claude decides whether to show a glanceable progress summary on client detail

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-measurements-and-progress*
*Context gathered: 2026-02-23*
