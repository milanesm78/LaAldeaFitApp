# Phase 1: Foundation and Exercise Library - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Trainer and clients can register, log in, and reach their respective portals. Trainer can build an exercise library (create, edit, delete exercises with YouTube links). App works bilingually (Spanish/English) and is fully usable on mobile browsers. Training plans, workout logging, and progress tracking are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Registration & Activation Flow
- Client self-registers with email and password, lands in a pending state until trainer activates
- Pending clients see a friendly waiting screen after login: "Your account is pending approval. Your trainer will activate it soon." — they can log in but can't access training features
- Language toggle and theme toggle available on the waiting screen so clients can customize while waiting

### Claude's Discretion: Registration & Activation
- Whether trainer account is pre-seeded or created via one-time registration (single-trainer architecture — Javier only)
- How trainer activates clients (client list with approve button, notification badge, or similar)
- Exact wording and design of the pending activation screen

### Portal Landing Pages
- Dark and light theme support with user toggle — let users choose their preference
- Both themes should feel appropriate for a fitness app

### Claude's Discretion: Portal Landing Pages
- Trainer home screen layout (client list focused vs dashboard overview — only exercise library and client management exist in Phase 1)
- Client home screen for Phase 1 (friendly placeholder since training plans come in Phase 2)
- Navigation style (bottom tabs vs side menu — should be optimized for mobile-first gym use)

### Exercise Library Interface
- Exercises consist of: name + YouTube video link

### Claude's Discretion: Exercise Library
- Display format (simple list vs cards with thumbnails — pick what works best for a manageable library)
- Whether to show YouTube preview in the create/edit form after pasting a link
- Whether to add muscle group tags or keep it as a flat list with search (consider likely library size)
- Delete confirmation approach (dialog vs swipe-to-delete with undo)

### Language & Mobile Experience
- Full Spanish and English support with a toggle
- Both comma and period accepted as decimal separators for all weight inputs

### Claude's Discretion: Language & Mobile
- Default language strategy (Spanish default vs browser detection with Spanish fallback)
- Language toggle placement (always visible in header vs tucked in settings)
- Whether language preference is stored per-account or per-device
- Mobile UX optimizations for gym use (large tap targets, minimal scrolling, one-handed operation)

</decisions>

<specifics>
## Specific Ideas

- This is a personal trainer app for Javier — single trainer, small client base (likely under 30 clients)
- Clients will primarily use the app at the gym on their phones — gym conditions (sweaty hands, one hand free, quick glances) should inform mobile UX
- Dark/light mode toggle is a user preference, not just a nice-to-have

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation-and-exercise-library*
*Context gathered: 2026-02-23*
