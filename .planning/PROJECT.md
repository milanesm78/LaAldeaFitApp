# JavierFitness

## What This Is

A web-based fitness coaching platform where personal trainer Javier manages his 20-50 clients. Clients log in to see their personalized training plans with video guidance, log every set of every workout, and fill monthly body measurements. Javier logs in to build plans, manage his exercise library, and track each client's body and strength progress over time. The core goal is client retention through a seamless training experience.

## Core Value

Clients always have their personalized training plan at their fingertips — with video guidance, easy workout logging, and visible progress that keeps them engaged and coming back.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Two separate portals: trainer login and client login
- [ ] Client self-registration with email, trainer assigns/manages them
- [ ] Monthly body measurement form (weight, height, skin folds, bone diameters, circumferences)
- [ ] Trainer builds reusable exercise library (exercise name + YouTube video link)
- [ ] Trainer creates personalized training plans per client (organized by training days)
- [ ] Trainer prescribes sets, reps, and starting weight per exercise in a plan
- [ ] Plan changes only take effect between training cycles (cycle length varies per client)
- [ ] Client dashboard showing progress summary, next workout, recent measurements
- [ ] Client views their plan with exercises grouped by training day
- [ ] Client clicks an exercise to watch the YouTube video with execution guidance
- [ ] Client logs weight and reps per set for each exercise
- [ ] Auto-progression suggestion: when client hits 15+ reps, app suggests +2.5kg for next session
- [ ] Line chart progress views for body measurements over time
- [ ] Line chart progress views for strength (weight/reps per exercise over time)
- [ ] Trainer can view any client's body and strength progress
- [ ] Bilingual interface: Spanish and English

### Out of Scope

- In-app payments — payments handled outside the app (cash, Bizum, etc.)
- Multi-trainer support — Javier is the only trainer for now
- Mobile native app — web app only, accessible from any device browser
- Reminders/notifications — retention comes from the product itself, not push notifications
- Real-time chat between trainer and client

## Context

- Javier is a personal trainer in Spain with 20-50 active clients
- Clients train 3-5 days per week depending on the individual
- Training cycles vary per client (some 4 weeks, some 6-8 weeks)
- Standard anthropometric measurement protocol: ~6-8 skin fold sites (triceps, subscapular, suprailiac, abdominal, thigh, calf), bone diameters (biepicondilar humeral, biepicondilar femoral, bistyloidal), and circumferences (arm, chest, waist, hip, thigh, calf)
- Exercise videos are sourced from YouTube — Javier links existing videos, doesn't host his own
- The auto-progression is a suggestion, not automatic — client or trainer confirms the weight increase

## Constraints

- **Language**: Spanish and English support required — client base is primarily Spanish-speaking
- **Platform**: Web application only — must work well on mobile browsers (responsive)
- **Scale**: 20-50 concurrent clients, single trainer — no need for enterprise-grade infrastructure
- **Data**: Body measurements and workout logs must be stored persistently for long-term progress tracking

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app, not native mobile | Simpler to build and maintain, accessible from any device | — Pending |
| YouTube links for exercise videos | Avoids video hosting costs, leverages existing content | — Pending |
| Auto-progression as suggestion, not automatic | Trainer and client maintain control over weight changes | — Pending |
| Single trainer architecture | Javier is the only user for now, simplifies auth and data model | — Pending |
| Per-set workout logging | Detailed tracking enables meaningful strength progress analysis | — Pending |

---
*Last updated: 2026-02-21 after initialization*
