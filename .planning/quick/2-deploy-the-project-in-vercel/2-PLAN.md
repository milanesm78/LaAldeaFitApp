---
phase: quick-2
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - vercel.json
autonomous: false
requirements: [QUICK-2]
must_haves:
  truths:
    - "Project is deployed and accessible via a Vercel URL"
    - "SPA client-side routing works on direct URL access (no 404 on refresh)"
    - "Supabase env vars are configured in Vercel so auth and data work in production"
  artifacts:
    - path: "vercel.json"
      provides: "SPA rewrite rules and Vite framework config"
      contains: "rewrites"
  key_links:
    - from: "vercel.json"
      to: "Vercel deployment"
      via: "rewrites config"
      pattern: "rewrites.*index.html"
---

<objective>
Deploy the Javier Fitness App to Vercel with proper SPA routing and Supabase environment variables.

Purpose: Get the app live on a public URL so it can be tested on real devices and shared with Javier.
Output: A working Vercel deployment with a live URL.
</objective>

<execution_context>
@/Users/macbookpro/.claude/get-shit-done/workflows/execute-plan.md
@/Users/macbookpro/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@package.json
@vite.config.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Configure and deploy to Vercel</name>
  <files>vercel.json</files>
  <action>
1. Create `vercel.json` in project root with SPA rewrite rules. This is a Vite React SPA using BrowserRouter, so all non-file requests must fall back to /index.html:

```json
{
  "rewrites": [
    { "source": "/((?!assets/).*)", "destination": "/index.html" }
  ]
}
```

The pattern excludes `/assets/` (Vite's static output directory) from rewrites so hashed JS/CSS files load correctly. Everything else falls back to index.html for client-side routing.

2. Run `pnpm build` to verify the production build succeeds before deploying.

3. Deploy to Vercel using the CLI. Run from project root:
   ```
   vercel --yes --prod
   ```
   The `--yes` flag accepts all defaults (framework auto-detected as Vite). The `--prod` flag deploys directly to the production URL.

   If vercel prompts for project linking (first deploy), accept defaults:
   - Set up and deploy: Y
   - Which scope: default (milanesm78-8692)
   - Link to existing project: N (create new)
   - Project name: javier-fitness (or default)
   - Directory where code is located: ./ (default)

4. After deploy succeeds, capture the production URL from CLI output.

5. Set Supabase environment variables in Vercel for production (the anon key is safe to expose -- it is a public client key gated by RLS):
   ```
   vercel env add VITE_SUPABASE_URL production < <(echo "https://eemapwdrwnknhewqcynu.supabase.co")
   vercel env add VITE_SUPABASE_ANON_KEY production < <(echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlbWFwd2Ryd25rbmhld3FjeW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NzU0MjMsImV4cCI6MjA4NzU1MTQyM30.OogpACDVBXRps-5shMcKTdf2PgT-sqR0p-KOJbFcZyI")
   ```

6. Redeploy after setting env vars so the build picks them up:
   ```
   vercel --yes --prod
   ```

IMPORTANT: Vite requires env vars at BUILD time (they are inlined into the bundle via `import.meta.env`). The env vars MUST be set before the production build runs on Vercel. If the first deploy did not have them, this second deploy is essential.
  </action>
  <verify>
- `pnpm build` completes without errors locally
- `vercel --yes --prod` outputs a production URL
- `curl -s -o /dev/null -w "%{http_code}" <PRODUCTION_URL>` returns 200
- `curl -s <PRODUCTION_URL>/trainer/exercises` returns HTML (not 404) -- confirms SPA rewrite works
  </verify>
  <done>App is deployed to Vercel with a production URL, SPA routing works, and Supabase env vars are configured.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 2: Verify live deployment</name>
  <what-built>Production Vercel deployment of the Javier Fitness App with Supabase integration</what-built>
  <how-to-verify>
    1. Open the Vercel production URL in your browser
    2. Confirm the login page loads correctly (not a blank page)
    3. Try navigating to a deep route (e.g., append /trainer/exercises to the URL) -- it should load the app, not show a 404
    4. Try logging in with existing credentials -- Supabase auth should work (not "missing env" errors)
    5. Check browser console for any errors related to VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY being undefined
  </how-to-verify>
  <resume-signal>Type "approved" or describe any issues</resume-signal>
</task>

</tasks>

<verification>
- Production URL accessible and returns 200
- Client-side routing works (deep links don't 404)
- Supabase connection works (auth flow functional)
- vercel.json committed to repo
</verification>

<success_criteria>
The Javier Fitness App is live on a Vercel production URL with working SPA routing and Supabase integration. The URL can be shared and accessed from any device.
</success_criteria>

<output>
After completion, create `.planning/quick/2-deploy-the-project-in-vercel/2-SUMMARY.md`
</output>
