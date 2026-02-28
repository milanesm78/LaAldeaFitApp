---
phase: quick-3
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - src/features/auth/components/RegisterForm.tsx
autonomous: true
requirements: [QUICK-3]
must_haves:
  truths:
    - "After successful registration, user is automatically redirected to their role-appropriate portal"
    - "Trainer registration lands on /trainer/clients"
    - "Client registration lands on /client (if active) or /client/pending (if inactive)"
  artifacts:
    - path: "src/features/auth/components/RegisterForm.tsx"
      provides: "Post-registration navigation"
      contains: "navigate"
  key_links:
    - from: "src/features/auth/components/RegisterForm.tsx"
      to: "RootRedirect in App.tsx"
      via: "navigate('/', { replace: true })"
      pattern: "navigate.*replace"
---

<objective>
After successful account creation, automatically redirect the user to their role-appropriate portal instead of leaving them on the registration page.

Purpose: Currently, after signUp succeeds the user sees a toast but stays on /register. Since email confirmation is disabled, Supabase auto-creates a session on signup, so the user is already logged in -- they just need to be navigated away.
Output: Updated RegisterForm.tsx with post-signup navigation
</objective>

<execution_context>
@/Users/macbookpro/.claude/get-shit-done/workflows/execute-plan.md
@/Users/macbookpro/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/features/auth/components/RegisterForm.tsx
@src/features/auth/components/LoginForm.tsx (reference pattern -- already does navigate("/", { replace: true }) after signIn)
@src/App.tsx (RootRedirect handles role-based routing at "/")
@src/features/auth/context/AuthProvider.tsx (signUp creates session when email confirmation is off)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add post-registration navigation to RegisterForm</name>
  <files>src/features/auth/components/RegisterForm.tsx</files>
  <action>
Mirror the LoginForm pattern exactly:

1. Import `useNavigate` from "react-router" (already imported Link from same package).
2. Add `const navigate = useNavigate();` inside RegisterForm, alongside existing hooks.
3. In `handleSubmit`, after the successful `await signUp(...)` call (line 57) and before/instead of the toast calls, add `navigate("/", { replace: true });`.
4. Remove the two toast calls after signUp (toast.success and toast.info for client note) since the user will be immediately navigated away and won't see them. The RootRedirect component at "/" will route them to the correct portal based on their resolved role.

The flow after this change:
- signUp() calls supabase.auth.signUp() which creates a session (email confirmation disabled)
- onAuthStateChange fires in AuthProvider, setting session/user/userRole
- navigate("/") triggers RootRedirect which reads userRole and redirects to /trainer or /client
- ProtectedRoute on client routes handles the is_active check, sending inactive clients to /client/pending

Do NOT add any loading spinner or intermediate state -- the existing RootRedirect and ProtectedRoute loading states handle the brief role-resolution period.
  </action>
  <verify>
1. `npx tsc --noEmit` passes with no type errors
2. `npx eslint src/features/auth/components/RegisterForm.tsx` passes
3. Manual verification: open /register, fill form, submit -- user should be redirected to their portal (not stay on /register)
  </verify>
  <done>
After successful registration, user is immediately navigated to "/" which routes them to their role-appropriate portal. No toast messages are shown (user leaves the page instantly). The RegisterForm follows the same navigate pattern as LoginForm.
  </done>
</task>

</tasks>

<verification>
- TypeScript compiles without errors
- RegisterForm imports and uses useNavigate from react-router
- handleSubmit calls navigate("/", { replace: true }) after successful signUp
- No orphaned toast calls that would flash before navigation
</verification>

<success_criteria>
A new user who completes registration is immediately redirected: trainers land on /trainer/clients, clients land on /client or /client/pending based on activation status. Users never remain stuck on the /register page after creating an account.
</success_criteria>

<output>
After completion, create `.planning/quick/3-when-an-account-is-created-log-the-user-/3-SUMMARY.md`
</output>
