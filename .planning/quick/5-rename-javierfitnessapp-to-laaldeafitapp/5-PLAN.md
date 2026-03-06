---
phase: quick
plan: 5
type: execute
wave: 1
depends_on: []
files_modified:
  - package.json
  - src/components/ThemeProvider.tsx
autonomous: true
requirements: [QUICK-5]

must_haves:
  truths:
    - "package.json name field reflects the new project identity (la-aldea-fit-app)"
    - "Theme localStorage key uses new name so branding is consistent"
    - "No active source code or config references the old javier-fitness name"
    - "Historical planning/debug docs are left unchanged (they are records, not config)"
  artifacts:
    - path: "package.json"
      provides: "npm package name"
      contains: "la-aldea-fit-app"
    - path: "src/components/ThemeProvider.tsx"
      provides: "Theme storage key"
      contains: "la-aldea-fit-app-theme"
  key_links: []
---

<objective>
Rename remaining "javier-fitness" references in active project files to "la-aldea-fit-app" to complete the rebranding started in quick-4.

Purpose: Quick-4 renamed the GitHub repo and supabase config, but explicitly left package.json and source code references untouched. This task completes the rename in project metadata and runtime code.
Output: package.json and ThemeProvider.tsx updated with new name.
</objective>

<execution_context>
@/Users/macbookpro/.claude/get-shit-done/workflows/execute-plan.md
@/Users/macbookpro/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/quick/4-change-the-github-repo-s-name-to-laaldea/4-SUMMARY.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Rename javier-fitness to la-aldea-fit-app in active project files</name>
  <files>package.json, src/components/ThemeProvider.tsx</files>
  <action>
1. In `package.json` line 2: change `"name": "javier-fitness"` to `"name": "la-aldea-fit-app"`.

2. In `src/components/ThemeProvider.tsx` line 20: change `const STORAGE_KEY = "javier-fitness-theme"` to `const STORAGE_KEY = "la-aldea-fit-app-theme"`.

IMPORTANT: Do NOT modify any files under `.planning/` -- these are historical records:
- `.planning/debug/` files contain absolute paths and old names as debug context
- `.planning/quick/1-*`, `.planning/quick/2-*`, `.planning/quick/4-*` are historical plans/summaries
- `.planning/research/STACK.md` and `.planning/phases/01-*/01-RESEARCH.md` document original project setup commands

NOTE on localStorage: Existing users who have a theme preference stored under the old key "javier-fitness-theme" will lose it and fall back to the default dark theme. This is acceptable -- the app is pre-launch with no real users, and dark is the preferred default anyway.
  </action>
  <verify>
1. Run: `grep -r "javier-fitness" package.json src/` -- should return zero matches.
2. Run: `grep "la-aldea-fit-app" package.json` -- should show the new name.
3. Run: `grep "la-aldea-fit-app-theme" src/components/ThemeProvider.tsx` -- should show the new storage key.
4. Run: `npm run build` (or `pnpm build`) -- should succeed with no errors.
  </verify>
  <done>package.json name is "la-aldea-fit-app" and ThemeProvider storage key is "la-aldea-fit-app-theme". No active source or config files reference the old name. Build passes.</done>
</task>

</tasks>

<verification>
- `grep -ri "javier-fitness" package.json src/ vite.config.ts index.html` returns no matches
- `pnpm build` completes successfully
- `.planning/` files are unchanged (git diff should show no changes in .planning/)
</verification>

<success_criteria>
All active project files (package.json, source code) use "la-aldea-fit-app" instead of "javier-fitness". Historical planning docs remain untouched. Build passes.
</success_criteria>

<output>
After completion, create `.planning/quick/5-rename-javierfitnessapp-to-laaldeafitapp/5-SUMMARY.md`
</output>
