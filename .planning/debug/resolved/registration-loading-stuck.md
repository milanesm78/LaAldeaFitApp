---
status: resolved
trigger: "The user is trying to register an account in the JavierFitnessApp and the UI gets stuck in 'Creando cuenta...' (Creating account...) — the loading state never resolves."
created: 2026-02-25T00:00:00Z
updated: 2026-02-28T12:10:00Z
---

## Current Focus

hypothesis: CONFIRMED — supabase.auth.signUp() does not return until _notifyAllSubscribers resolves, which awaits the onAuthStateChange callback, which awaits processSession -> fetchActivationStatus (a DB query). If that query hangs or the entire chain is slow, isSubmitting stays true forever.
test: Traced complete call stack from handleSubmit through supabase-js internals
expecting: Root cause confirmed by code reading
next_action: Report to user

## Symptoms

expected: Registration form submits, account is created or an error is shown, loading state clears
actual: UI gets stuck in "Creando cuenta..." — loading state never resolves
errors: Unknown — loading spinner never stops
reproduction: Attempt to register an account
started: Unknown

## Eliminated

- hypothesis: Missing .env.local / unconfigured env vars
  evidence: .env.local exists with real Supabase URL and anon key; REST API confirmed reachable
  timestamp: 2026-02-25T16:40:00Z

- hypothesis: Error swallowed in catch block not resetting isSubmitting
  evidence: RegisterForm.handleSubmit has correct try/catch/finally at lines 56-69; finally always runs setIsSubmitting(false)
  timestamp: 2026-02-25T16:41:00Z

- hypothesis: Component unmounts before finally block runs
  evidence: /register route has no ProtectedRoute wrapper; no redirect-on-auth logic affects /register; component stays mounted
  timestamp: 2026-02-25T16:42:00Z

- hypothesis: Supabase backend unreachable or returning errors
  evidence: curl to /auth/v1/signup returned HTTP 200 with valid session; curl to /rest/v1/ returned OpenAPI spec; custom_access_token_hook works correctly (user_role='client' in JWT)
  timestamp: 2026-02-25T16:43:00Z

- hypothesis: handle_new_user trigger fails, causing profile to not exist
  evidence: Profile for test user exists in DB after signup (curl confirmed); fetchActivationStatus returns null on error anyway due to try/catch
  timestamp: 2026-02-25T16:44:00Z

## Evidence

- timestamp: 2026-02-25T16:35:00Z
  checked: RegisterForm.tsx lines 49-70
  found: handleSubmit sets isSubmitting=true at line 54, calls await signUp() at line 57, has finally block at line 67 that calls setIsSubmitting(false)
  implication: Loading state SHOULD clear via finally. The bug must be inside signUp() itself never resolving.

- timestamp: 2026-02-25T16:36:00Z
  checked: AuthProvider.tsx lines 90-110
  found: signUp wraps supabase.auth.signUp() and throws on error. No isLoading involvement.
  implication: The AuthProvider signUp is not managing isSubmitting at all; that's local state in RegisterForm.

- timestamp: 2026-02-25T16:37:00Z
  checked: AuthProvider.tsx lines 64-80
  found: onAuthStateChange callback is async and calls await processSession(newSession) before setIsLoading(false)
  implication: The onAuthStateChange callback is async and awaits database operations.

- timestamp: 2026-02-25T16:38:00Z
  checked: GoTrueClient.js lines 419-422 (signUp) and 2010-2037 (_notifyAllSubscribers)
  found: Inside signUp(), after saving session, it calls `await this._notifyAllSubscribers('SIGNED_IN', session)`. _notifyAllSubscribers does `await Promise.all(promises)` where each promise awaits `x.callback(event, session)` — i.e., it AWAITS the registered onAuthStateChange callback.
  implication: supabase.auth.signUp() does NOT return until all onAuthStateChange callbacks have fully resolved. This is a synchronous chain: signUp -> _notifyAllSubscribers -> onAuthStateChange callback -> processSession -> fetchActivationStatus (DB query) -> supabase.auth.signUp() finally returns.

- timestamp: 2026-02-25T16:39:00Z
  checked: AuthProvider.tsx fetchActivationStatus (lines 24-37)
  found: Makes a supabase DB query (supabase.from("profiles").select("is_active").single()), wrapped in try/catch that returns null on error. No timeout is set.
  implication: If this DB query hangs (no timeout configured), the entire chain from supabase.auth.signUp() through to setIsSubmitting(false) is blocked indefinitely.

- timestamp: 2026-02-25T16:40:00Z
  checked: .env.local and Supabase endpoint
  found: Real credentials present. API is reachable. Profile exists after signup.
  implication: Under normal conditions the chain resolves. Bug manifests when the DB query is slow (e.g., cold start, network latency) or when the signup itself is re-attempted (second signup for same email returns a session-like response that also triggers the full callback chain).

- timestamp: 2026-02-25T16:44:00Z
  checked: supabase/config.toml lines 263-265
  found: [auth.hook.custom_access_token] enabled = true, uri = "pg-functions://postgres/public/custom_access_token_hook"
  implication: The hook runs server-side during token issuance. If the hook fails or is misconfigured on hosted Supabase (not local), signUp could return an error OR could return without a session (session = null), in which case _notifyAllSubscribers is NOT called and the form would show the error or complete normally. However if hook runs fine (confirmed), this isn't the blocker.

## Resolution

root_cause: |
  The root cause is an architectural coupling in @supabase/auth-js v2.97.0's signUp() implementation:
  supabase.auth.signUp() internally calls `await this._notifyAllSubscribers('SIGNED_IN', session)`,
  which AWAITS every registered onAuthStateChange callback. AuthProvider.tsx registers an async
  callback that awaits processSession() -> fetchActivationStatus() — a full database round-trip
  (supabase.from("profiles").select("is_active").single()). Because supabase.auth.signUp() does not
  return until that DB query completes, the await signUp() in RegisterForm.handleSubmit is blocked.
  If that DB query is slow, errors silently (the PostgREST client has no timeout), or if the Supabase
  project has a cold DB connection, the promise hangs indefinitely. Since the finally block only runs
  after signUp() resolves, setIsSubmitting(false) is never called, leaving the button in
  "Creando cuenta..." forever.

fix: |
  Applied via the login-fails-after-registration debug session. The ROOT CAUSE 1 fix (decoupling
  onAuthStateChange callback from _notifyAllSubscribers) applies identically to signUp:
  - The callback uses `void processSession(...)` to return undefined instead of a promise
  - signUp() no longer blocks on processSession -> fetchProfile DB query
  - setIsSubmitting(false) in RegisterForm.finally runs promptly

verification: Same as login-fails-after-registration -- TypeScript + Vite build pass, code trace confirmed.
files_changed:
  - src/features/auth/context/AuthProvider.tsx
