---
status: resolved
trigger: "i18n-locale-public-import-error — Vite is throwing errors because translation JSON files in the public directory are being imported from JavaScript"
created: 2026-02-25T00:00:00Z
updated: 2026-02-25T00:02:00Z
---

## Current Focus

hypothesis: CONFIRMED — src/lib/i18n.ts imports JSON from ../../public/locales/ using JS import statements, which Vite forbids for assets in the public directory
test: N/A — root cause confirmed by direct code reading
expecting: N/A
next_action: Move translation files to src/locales/ and update import paths in i18n.ts and i18next.d.ts

## Symptoms

expected: The app loads without errors and i18n translations work correctly
actual: Console errors from Vite — "Assets in public directory cannot be imported from JavaScript. If you intend to import that asset, put the file in the src directory, and use /src/locales/en/translation.json instead of /public/locales/en/translation.json."
errors: Same error for both /public/locales/en/translation.json and /public/locales/es/translation.json
reproduction: Start the dev server (npm run dev / vite dev)
started: Unknown — likely introduced when i18n was set up or files were moved

## Eliminated

(none yet)

## Evidence

- timestamp: 2026-02-25T00:01:00Z
  checked: src/lib/i18n.ts lines 6-7
  found: Direct JS imports — `import en from "../../public/locales/en/translation.json"` and `import es from "../../public/locales/es/translation.json"`
  implication: Vite rejects JS imports from the public directory; this is the exact source of the error

- timestamp: 2026-02-25T00:01:00Z
  checked: src/types/i18next.d.ts line 1
  found: Type import also references `../../public/locales/en/translation.json`
  implication: This file also needs its path updated after the fix

- timestamp: 2026-02-25T00:01:00Z
  checked: src/locales/ directory
  found: Does not exist — translation files are only in public/locales/
  implication: Fix requires creating src/locales/{en,es}/ and moving the JSON files there

- timestamp: 2026-02-25T00:01:00Z
  checked: vite.config.ts
  found: No publicDir override — default public/ is used; no special aliases for locales
  implication: Standard fix: move files to src/locales/ and use relative imports

## Resolution

root_cause: src/lib/i18n.ts imports translation JSON via JS import statements pointing at public/locales/, which Vite prohibits — the public directory is for static assets served over HTTP, not for module bundling
fix: Move translation files from public/locales/ to src/locales/ and update import paths in i18n.ts and i18next.d.ts to use the new src-relative paths
verification: Both import paths updated; no remaining references to public/locales in src/; src/locales/en/translation.json and src/locales/es/translation.json confirmed present; public/locales removed; Vite can now bundle the JSON as normal modules
files_changed:
  - src/lib/i18n.ts
  - src/types/i18next.d.ts
  - src/locales/en/translation.json (new location)
  - src/locales/es/translation.json (new location)
  - public/locales/en/translation.json (deleted)
  - public/locales/es/translation.json (deleted)
