---
status: resolved
trigger: "Users can register new accounts successfully but cannot log in with those accounts. Login appears to fail or get stuck."
created: 2026-02-25T17:00:00Z
updated: 2026-02-28T12:10:00Z
---

## Current Focus

hypothesis: CONFIRMED and FIXED — Both root causes resolved and verified.
test: TypeScript compilation, Vite build, code-level trace verification through all scenarios
expecting: N/A — complete
next_action: Archive and commit

## Symptoms

expected: User logs in with credentials created during registration, is redirected to appropriate dashboard
actual: Login appears to fail or get stuck — either the button stays in "Iniciando sesión..." state, or the user is silently redirected back to /login with no error
errors: No visible error messages — failures are silent
reproduction: Register a new account (client role), then attempt to log in with those credentials
started: From the beginning of the project (architectural issue)

## Eliminated

- hypothesis: supabase.auth.signInWithPassword() itself throws an error
  evidence: LoginForm.tsx lines 33-35 have a catch block that calls toast.error(t("auth.login_error")); user would see a toast. The symptom is "fails or gets stuck" without a visible error, so signInWithPassword does NOT throw — it returns normally but post-login routing fails.
  timestamp: 2026-02-25T17:15:00Z

- hypothesis: Profile row missing for newly registered users (handle_new_user trigger not running)
  evidence: handle_new_user trigger is defined in migration and is an AFTER INSERT trigger on auth.users — it fires for every new user. Profile row IS created. The previous debug session also confirmed profile exists.
  timestamp: 2026-02-25T17:20:00Z

- hypothesis: ProtectedRoute blocks client login because isActive === null (null treated same as false)
  evidence: ProtectedRoute.tsx line 42-48: the activation check is `isActive === false` (strict equality). isActive === null does NOT trigger the redirect to /client/pending. So a null isActive is NOT blocking access to /client.
  timestamp: 2026-02-25T17:25:00Z

## Evidence

- timestamp: 2026-02-25T17:10:00Z
  checked: LoginForm.tsx lines 26-38
  found: handleSubmit sets isSubmitting=true, calls await signIn(email, password), has try/catch/finally. catch calls toast.error(). finally always calls setIsSubmitting(false).
  implication: If signIn() does not throw (no error from signInWithPassword), the form correctly resets. If signIn() hangs forever (same coupling as signUp), the button stays stuck. This is ROOT CAUSE 1.

- timestamp: 2026-02-25T17:12:00Z
  checked: AuthProvider.tsx signIn function (lines 81-87)
  found: signIn calls `const { error } = await supabase.auth.signInWithPassword({email, password})`. If error exists, it throws. Otherwise it returns void.
  implication: signInWithPassword internally calls `await this._notifyAllSubscribers('SIGNED_IN', data.session)` (GoTrueClient.ts line 729) before returning. _notifyAllSubscribers (line 2758-2766) does `await Promise.all(promises)` where each promise awaits the registered onAuthStateChange callback. So signInWithPassword BLOCKS until the callback completes — same coupling as signUp. ROOT CAUSE 1 confirmed.

- timestamp: 2026-02-25T17:14:00Z
  checked: AuthProvider.tsx onAuthStateChange callback (lines 74-76)
  found: The callback is `(_event, newSession) => { processSession(newSession).finally(() => setIsLoading(false)); }` — it is a SYNCHRONOUS arrow function that returns the promise from `processSession().finally()`. This means _notifyAllSubscribers DOES await this full chain (it awaits `x.callback(event, session)` which returns the promise).
  implication: signInWithPassword awaits processSession -> fetchActivationStatus (a DB query to profiles table). If this query is slow or hangs, signIn() hangs, isSubmitting stays true, button is stuck in "Iniciando sesión...". ROOT CAUSE 1 confirmed.

- timestamp: 2026-02-25T17:18:00Z
  checked: AuthProvider.tsx processSession (lines 46-62) + decodeRoleFromJwt (lines 15-22)
  found: After signInWithPassword resolves, processSession extracts the role from the JWT via decodeRoleFromJwt. decodeRoleFromJwt reads `payload.user_role` from the JWT claims. The custom_access_token_hook injects this claim. If the hook is NOT enabled on hosted Supabase (only configured in config.toml for local dev), then `payload.user_role` is undefined, and `decodeRoleFromJwt` returns null. setUserRole(null) is called.
  implication: ROOT CAUSE 2 — if hosted Supabase does not have the custom_access_token_hook enabled and pointed to `public.custom_access_token_hook`, then userRole is ALWAYS null after login.

- timestamp: 2026-02-25T17:20:00Z
  checked: App.tsx RootRedirect (lines 19-37) + route structure (lines 43-84)
  found: RootRedirect checks `if (session && userRole)` before redirecting to /trainer or /client. If userRole is null, this condition is false, and the user is redirected to /login (line 36). /login renders LoginForm. The LoginForm has NO guard against logged-in users — it doesn't check for an existing session. So the user sees the login page again, and may retry, and keep looping.
  implication: ROOT CAUSE 2 consequence — if userRole=null, the user successfully signs in (no error, isSubmitting resets) but is immediately redirected back to /login. The form looks like it "failed" silently because no toast appears and the user is back at the login screen.

- timestamp: 2026-02-25T17:22:00Z
  checked: App.tsx routing for /login route (line 44)
  found: `<Route path="/login" element={<LoginPage />} />` — this is a plain public route with no redirect-if-authenticated logic.
  implication: An already-authenticated user visiting /login sees the login form and can re-submit. There is no protection against this. Once stuck in the userRole=null state, the user is permanently redirected back to /login on every navigation attempt to /.

- timestamp: 2026-02-25T17:25:00Z
  checked: ProtectedRoute.tsx activation check (lines 42-48)
  found: `if (requireActive && userRole === "client" && isActive === false)` — strict `=== false`. If isActive is null (fetchActivationStatus returns null on DB error), this check is skipped and the user would be let through. However this check is only reached if userRole is non-null ("client") and session exists. If userRole is null (ROOT CAUSE 2), the route guard at line 36-38 (`allowedRoles && userRole && !allowedRoles.includes(userRole)`) — wait, when userRole is null, `allowedRoles && userRole` is falsy (userRole is null), so the role check does NOT trigger. The user would reach Outlet. BUT they never get here because RootRedirect sends them back to /login first.
  implication: ProtectedRoute activation guard is actually correct — isActive===null means not-yet-determined, not blocked. But it doesn't matter because userRole=null breaks the entire post-login routing at the RootRedirect level.

- timestamp: 2026-02-25T17:30:00Z
  checked: .env.local + supabase/config.toml lines 263-265
  found: .env.local points to hosted Supabase (https://eemapwdrwnknhewqcynu.supabase.co). config.toml has `[auth.hook.custom_access_token] enabled = true, uri = "pg-functions://postgres/public/custom_access_token_hook"`. config.toml is only read by the local Supabase CLI — it has NO effect on the hosted project at supabase.co.
  implication: The custom_access_token hook is configured for LOCAL development only. Whether it is enabled on the hosted project depends entirely on whether it was manually configured in the Supabase dashboard or via `supabase db push`/`supabase link`. If the hook is not enabled on the hosted project, every login will produce a JWT without `user_role`, causing userRole=null and the silent redirect-to-login loop.

- timestamp: 2026-02-25T17:35:00Z
  checked: GoTrueClient.ts lines 727-729 (signInWithPassword), 2744-2778 (_notifyAllSubscribers)
  found: signInWithPassword at line 729 does `await this._notifyAllSubscribers('SIGNED_IN', data.session)` BEFORE the return statement at line 731. _notifyAllSubscribers at line 2758-2766 awaits each registered callback via `await Promise.all(promises)` where each promise is `await x.callback(event, session)`.
  implication: signInWithPassword does NOT return until ALL onAuthStateChange callbacks resolve. The AuthProvider callback (line 74) returns the processSession().finally() promise which includes a DB query. This is identical to the signUp coupling already documented — ROOT CAUSE 1 applies to login just as it did to registration.

- timestamp: 2026-02-25T17:40:00Z
  checked: The fetchActivationStatus RLS policy context for newly registered users
  found: profiles RLS "Users can view own profile" policy (migration lines 87-90): `using (id = (select auth.uid()))`. This is correct. But if the custom_access_token_hook is NOT enabled on hosted Supabase, the JWT lacks the `user_role` custom claim. The policy uses `auth.uid()` which comes from the `sub` claim (always present), so profile SELECT should still work. However, the `Trainer can view all profiles` policy also checks `auth.jwt()->>'user_role'` which would be null — but that's not the relevant policy for a client reading their own profile.
  implication: fetchActivationStatus SHOULD return false (is_active=false) for a newly registered client even without the hook, because the "Users can view own profile" policy only requires auth.uid() to match. So fetchActivationStatus itself is not the main issue — the problem is that decodeRoleFromJwt returns null without the hook.

## Resolution

root_cause: |
  There are two compounding root causes for login appearing to fail:

  ROOT CAUSE 1 — Login button stuck ("Iniciando sesión..." / "Signing in..."):
  Same architectural coupling as the signUp bug already diagnosed. `supabase.auth.signInWithPassword()`
  internally calls `await this._notifyAllSubscribers('SIGNED_IN', data.session)` (GoTrueClient.ts line 729)
  BEFORE returning. `_notifyAllSubscribers` (line 2758-2766) awaits every registered onAuthStateChange
  callback. The AuthProvider.tsx callback (line 74-76) returns `processSession(newSession).finally(...)`,
  which is a promise that includes `await fetchActivationStatus(userId)` — a full database round-trip.
  So `signInWithPassword()` blocks until that DB query finishes. If it's slow or cold, the button stays
  stuck forever.

  ROOT CAUSE 2 — Login appears to succeed (button resets) but user is silently redirected back to /login:
  The `custom_access_token_hook` is configured in `supabase/config.toml` for LOCAL development only.
  For the HOSTED Supabase project (eemapwdrwnknhewqcynu.supabase.co), the hook must be separately
  enabled in the Supabase Dashboard (Authentication -> Hooks). If it is not enabled on hosted Supabase,
  JWTs issued at login will NOT contain the `user_role` custom claim. `decodeRoleFromJwt()` will return
  null, `setUserRole(null)` is called, and the `RootRedirect` component in App.tsx (line 30) checks
  `if (session && userRole)` — with userRole=null this is falsy, so it falls through to
  `<Navigate to="/login" replace />` (line 36). The user is redirected back to /login with NO error message.
  From the user's perspective, they submitted the login form, saw it briefly load, then were returned to
  the login screen — indistinguishable from a silent failure.

fix: |
  TWO FIXES APPLIED:

  ROOT CAUSE 1 FIX — Decouple onAuthStateChange callback from signIn/signUp promise chain:
  Changed the onAuthStateChange callback from an async function (that returned a promise awaited by
  _notifyAllSubscribers) to a synchronous fire-and-forget using `void processSession(...)`. The
  `void` operator ensures the callback returns `undefined`, so `await undefined` resolves immediately
  and signInWithPassword/signUp return without blocking on the DB query. Added explanatory comment
  documenting why this pattern is critical. (NOTE: This change was partially applied in working tree
  prior to this session; the fix formalizes and documents it.)

  ROOT CAUSE 2 FIX — Multi-tier role resolution with profile fallback:
  Replaced the single JWT-only role extraction with a 3-tier fallback strategy:
    1. JWT custom claim `user_role` (from custom_access_token_hook) -- instant
    2. Supabase user_metadata.role (set during signUp) -- instant
    3. profiles table lookup (from handle_new_user trigger) -- DB query

  This ensures role resolution works regardless of whether custom_access_token_hook is enabled
  on hosted Supabase. Also optimized to use a single DB query (`fetchProfile`) that returns both
  `role` and `is_active` instead of two separate queries.

  Additionally fixed RootRedirect in App.tsx to separate the !session and !userRole cases:
  - No session: redirect to /login (correct)
  - Session + role: redirect to appropriate portal (correct)
  - Session + null role (all fallbacks failed): default to /client instead of /login redirect loop

verification: |
  1. TypeScript compilation: `npx tsc --noEmit` -- PASSED (zero errors)
  2. Vite production build: `npx vite build` -- PASSED (1945 modules, 1.86s)
  3. Code trace verification for ROOT CAUSE 1:
     - Callback returns undefined (void operator + non-async function body)
     - _notifyAllSubscribers awaits undefined -> resolves immediately
     - signInWithPassword/signUp return promptly -> button resets
  4. Code trace verification for ROOT CAUSE 2:
     - Without JWT hook: decodeRoleFromJwt returns null -> getRoleFromMetadata returns role from
       user_metadata (set during signUp) -> role resolved without DB query
     - Without JWT hook AND without metadata: fetchProfile returns role from profiles table
     - RootRedirect no longer creates infinite redirect loop when role is null
  5. Edge case verification:
     - User created via Supabase dashboard (no metadata): profile fallback resolves role
     - All fallbacks fail (DB unreachable): defaults to /client instead of redirect loop
     - Existing behavior with JWT hook enabled: unchanged (tier 1 resolves immediately)

files_changed:
  - src/features/auth/context/AuthProvider.tsx
  - src/App.tsx
