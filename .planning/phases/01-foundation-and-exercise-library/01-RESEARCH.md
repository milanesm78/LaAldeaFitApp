# Phase 1: Foundation and Exercise Library - Research

**Researched:** 2026-02-23
**Domain:** Authentication, Exercise CRUD, i18n, Mobile-Responsive SPA
**Confidence:** HIGH

## Summary

Phase 1 establishes the entire application foundation: project scaffolding, authentication with role-based access (trainer vs client), an exercise library with CRUD for the trainer, bilingual support (Spanish/English), and mobile-responsive design. The standard stack for this type of application in 2026 is React 19 + Vite + TypeScript on the frontend, Supabase for authentication and PostgreSQL database with Row Level Security, Tailwind CSS + shadcn/ui for UI components, react-i18next for internationalization, React Router v7 for routing, and TanStack Query v5 for server state management.

The architecture is a single-page application (SPA) -- no server-side rendering needed given the scale (single trainer, 20-50 clients). Supabase handles authentication, session persistence (localStorage by default, survives browser refresh), and database access with RLS policies that enforce role-based permissions at the database level. The Custom Access Token Hook pattern in Supabase enables injecting a `user_role` claim into JWTs, which RLS policies then reference to distinguish trainer from client access.

The biggest technical risk in this phase is the decimal separator input handling for Spanish locale (comma vs period). The solution is well-established: use `<input type="text" inputmode="decimal">` instead of `<input type="number">`, with client-side normalization that accepts both comma and period. This avoids the well-documented cross-browser inconsistencies with `type="number"` in European locales.

**Primary recommendation:** Use Supabase (auth + database + RLS) as the complete backend, React 19 + Vite + TypeScript + shadcn/ui + Tailwind CSS for the frontend, React Router v7 in library mode for routing, TanStack Query v5 for data fetching/caching, and react-i18next for bilingual support. Do not hand-roll authentication, session management, or role-based access control.

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| AUTH-01 | User can create account with email and password | Supabase Auth `signUp` with email/password; see Auth Patterns section |
| AUTH-02 | User is assigned a role (trainer or client) upon registration | Custom Access Token Hook injects `user_role` claim from `user_roles` table into JWT |
| AUTH-03 | Client account requires trainer activation before accessing training features | `profiles.is_active` boolean column, RLS policies check activation status, trainer toggles via dashboard |
| AUTH-04 | User session persists across browser refresh | Supabase stores session in localStorage by default; `persistSession: true` (default); auto-refresh handles token renewal |
| AUTH-05 | Trainer and client are routed to their respective portals after login | Decode JWT `user_role` claim client-side via `onAuthStateChange`, route with React Router |
| EXER-01 | Trainer can create exercises with name and YouTube video link | `exercises` table with RLS policy restricting INSERT to trainer role; TanStack Query mutation |
| EXER-02 | Trainer can edit and delete exercises from the library | RLS policies for UPDATE/DELETE restricted to trainer role; TanStack Query mutations with cache invalidation |
| INFR-01 | App supports Spanish and English with language toggle | react-i18next with `i18next-browser-languagedetector`; JSON translation files in `public/locales/{en,es}/` |
| INFR-02 | App is fully responsive and usable on mobile browsers at the gym | Tailwind CSS mobile-first utilities; shadcn/ui responsive components; minimum 44px touch targets |
| INFR-03 | All weights accept both comma and period as decimal separators | `<input type="text" inputmode="decimal">` with normalization function replacing comma with period before storage |
</phase_requirements>

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.x | UI framework | Latest stable; production-ready since Dec 2024; universal ecosystem support |
| Vite | 7.x | Build tool / dev server | 40x faster than CRA; native ES modules; standard for new React projects in 2026 |
| TypeScript | 5.x | Type safety | Non-negotiable for production apps; catches errors at compile time |
| @supabase/supabase-js | 2.97.x | Backend client (auth, DB, storage) | Complete BaaS; handles auth, database, RLS in one SDK |
| Tailwind CSS | 4.x | Utility-first CSS | Mobile-first responsive design; tree-shaken production builds under 10KB |
| shadcn/ui | latest (CLI) | UI component library | Copy-paste components with full ownership; built on Radix + Tailwind; accessible by default |
| React Router | 7.x | Client-side routing | Mature, stable SPA routing; use in library mode (not framework mode) |
| @tanstack/react-query | 5.x | Server state management | Caching, background sync, optimistic updates for Supabase data; standard pairing |
| react-i18next | 16.x | Internationalization | 6M+ weekly downloads; React hooks integration; TypeScript support |
| i18next | 25.x | i18n core framework | Industry standard; namespace support; language detection |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| i18next-browser-languagedetector | 8.x | Auto-detect browser language | On app init to default to Spanish or English based on browser settings |
| Zustand | 5.x | Client-side state management | Only if React Context becomes insufficient for auth state; start without it |
| @tanstack/react-query-devtools | 5.x | Query debugging | Development only; inspect cache, refetch behavior |
| jwt-decode (or manual) | - | Decode JWT for role claim | Access `user_role` from Supabase access token client-side |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| React Router (library mode) | TanStack Router | Better type safety but steeper learning curve; React Router is simpler for this scale |
| shadcn/ui | DaisyUI | DaisyUI is simpler but less customizable; shadcn gives full component ownership |
| TanStack Query | Direct Supabase calls + useState | Works for tiny apps but loses caching, deduplication, and background refresh |
| Zustand | React Context | Context is sufficient for auth state; Zustand only if state complexity grows |
| Tailwind CSS | CSS Modules | Tailwind's utility classes are faster to develop with and inherently responsive |

**Installation:**
```bash
# Create project
pnpm create vite@latest javier-fitness -- --template react-swc-ts

# Core dependencies
pnpm add @supabase/supabase-js @tanstack/react-query react-router i18next react-i18next i18next-browser-languagedetector

# UI dependencies
pnpm add tailwindcss @tailwindcss/vite

# Dev dependencies
pnpm add -D @types/node @tanstack/react-query-devtools

# Initialize shadcn/ui
pnpm dlx shadcn@latest init
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/          # Shared UI components
│   └── ui/              # shadcn/ui generated components
├── features/            # Feature-based modules
│   ├── auth/            # Authentication feature
│   │   ├── components/  # LoginForm, RegisterForm, etc.
│   │   ├── hooks/       # useAuth, useSession
│   │   └── types.ts     # Auth-related types
│   └── exercises/       # Exercise library feature
│       ├── components/  # ExerciseForm, ExerciseList, ExerciseCard
│       ├── hooks/       # useExercises, useCreateExercise, etc.
│       └── types.ts     # Exercise-related types
├── layouts/             # Page layouts (TrainerLayout, ClientLayout)
├── lib/                 # Shared utilities
│   ├── supabase.ts      # Supabase client singleton
│   ├── i18n.ts          # i18next configuration
│   └── utils.ts         # Shared helpers (decimal normalization, etc.)
├── pages/               # Route-level page components
│   ├── trainer/         # Trainer portal pages
│   └── client/          # Client portal pages
├── types/               # Global TypeScript types
│   └── database.ts      # Supabase generated types
└── main.tsx             # App entry point
public/
└── locales/
    ├── en/
    │   └── translation.json
    └── es/
        └── translation.json
```

### Pattern 1: Supabase Auth with React Context
**What:** Centralized auth state using React Context + `onAuthStateChange`
**When to use:** Always -- this is the entry point for all authentication logic

```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react
// src/features/auth/hooks/useAuth.tsx

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

type UserRole = 'trainer' | 'client';

interface AuthContext {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Decode role from JWT custom claim
        const jwt = JSON.parse(atob(session.access_token.split('.')[1]));
        setUserRole(jwt.user_role ?? null);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        if (session) {
          const jwt = JSON.parse(atob(session.access_token.split('.')[1]));
          setUserRole(jwt.user_role ?? null);
        } else {
          setUserRole(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ... signIn, signUp, signOut methods
  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, userRole, isLoading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### Pattern 2: Protected Routes by Role
**What:** Route guards that redirect based on authentication state and user role
**When to use:** Every route that requires authentication

```typescript
// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface ProtectedRouteProps {
  allowedRoles?: ('trainer' | 'client')[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { session, userRole, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!session) return <Navigate to="/login" replace />;
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to={userRole === 'trainer' ? '/trainer' : '/client'} replace />;
  }

  return <Outlet />;
}
```

### Pattern 3: TanStack Query with Supabase
**What:** Wrapping Supabase queries in TanStack Query for caching and state management
**When to use:** All data fetching from Supabase

```typescript
// Source: https://makerkit.dev/blog/saas/supabase-react-query
// src/features/exercises/hooks/useExercises.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Exercise } from '@/types/database';

const exerciseKeys = {
  all: ['exercises'] as const,
  list: () => [...exerciseKeys.all, 'list'] as const,
  detail: (id: string) => [...exerciseKeys.all, 'detail', id] as const,
};

export function useExercises() {
  return useQuery({
    queryKey: exerciseKeys.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');
      if (error) throw error;
      return data as Exercise[];
    },
  });
}

export function useCreateExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exercise: { name: string; youtube_url: string }) => {
      const { data, error } = await supabase
        .from('exercises')
        .insert(exercise)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: exerciseKeys.list() });
    },
  });
}
```

### Pattern 4: Decimal Input Normalization
**What:** Cross-browser decimal input that accepts both comma and period
**When to use:** All weight/measurement numeric inputs

```typescript
// src/lib/utils.ts

/**
 * Normalize decimal input: replace comma with period for storage.
 * Accepts "75,5" or "75.5" and normalizes to "75.5"
 */
export function normalizeDecimal(value: string): number | null {
  const normalized = value.replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Format number for display based on locale
 */
export function formatWeight(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}
```

```tsx
// Usage in component -- NOT <input type="number">
<input
  type="text"
  inputMode="decimal"
  pattern="[0-9]*[,.]?[0-9]*"
  value={displayValue}
  onChange={(e) => {
    setDisplayValue(e.target.value);
    const num = normalizeDecimal(e.target.value);
    if (num !== null) onValueChange(num);
  }}
/>
```

### Pattern 5: i18next Configuration
**What:** Bilingual setup with language detection and toggle
**When to use:** App initialization

```typescript
// src/lib/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly (small app, no need for lazy loading)
import en from '../../public/locales/en/translation.json';
import es from '../../public/locales/es/translation.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    fallbackLng: 'es', // Spanish as default -- primary user base
    interpolation: {
      escapeValue: false, // React handles escaping
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
```

### Anti-Patterns to Avoid
- **Using `type="number"` for weight inputs:** Breaks with European decimal separator (comma). Use `type="text"` with `inputMode="decimal"` instead.
- **Calling `supabase.auth.getSession()` repeatedly:** Use `onAuthStateChange` listener instead; `getSession` reads from localStorage and doesn't verify with the server.
- **Trusting `getSession()` data on the server:** Session data from `getSession` can be tampered with. Use `getUser()` for server-side verification.
- **Storing user role in `user_metadata`:** Users can modify `user_metadata`. Store role in `app_metadata` or a separate `user_roles` table accessed via Custom Access Token Hook.
- **Using `FOR ALL` in RLS policies:** Always create separate policies for SELECT, INSERT, UPDATE, DELETE. Easier to reason about and debug.
- **Missing indexes on RLS-referenced columns:** Always index columns referenced in RLS policy conditions. This is the top RLS performance killer.
- **Deeply nested i18n keys:** Keep translation keys flat or max 2-3 levels deep. Use descriptive namespaced keys like `"exercises.form.name"` not `"pages.trainer.exercises.form.fields.name.label"`.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Authentication | Custom JWT, bcrypt, session store | Supabase Auth | Token refresh, session persistence, password reset, email verification -- hundreds of edge cases |
| Session persistence | Manual localStorage token management | Supabase Auth (default `persistSession: true`) | Auto-refresh, tab focus handling, race condition prevention built in |
| Role-based access at DB level | Application-layer permission checks | Supabase RLS + Custom Access Token Hook | RLS enforces at database level; cannot be bypassed by client manipulation |
| UI components (forms, dialogs, buttons) | Custom components from scratch | shadcn/ui + Radix primitives | Accessible by default (ARIA), keyboard navigation, focus management |
| Responsive breakpoints | Custom media query system | Tailwind CSS responsive prefixes | `sm:`, `md:`, `lg:` -- consistent, mobile-first, well-tested |
| Server state cache | useState + useEffect for API data | TanStack Query | Deduplication, background refresh, cache invalidation, loading/error states |
| Translation framework | Custom context + JSON loader | react-i18next | Pluralization, interpolation, language detection, namespace loading |
| Decimal formatting per locale | Custom number formatting | `Intl.NumberFormat` | Built into every browser; locale-aware; handles edge cases |

**Key insight:** This is a small app (single trainer, 20-50 clients) but the complexity of auth, session management, and RLS is not proportional to app size. These are security-critical domains where custom solutions consistently produce vulnerabilities. Use the standard tooling and focus implementation effort on the actual business logic (exercise library, training plans).

## Common Pitfalls

### Pitfall 1: Role Stored in Mutable Location
**What goes wrong:** User role stored in `user_metadata` which users can modify via `updateUser()`, allowing privilege escalation from client to trainer.
**Why it happens:** `user_metadata` is the first thing developers find in Supabase docs; `app_metadata` is less prominent.
**How to avoid:** Store role in a separate `user_roles` table. Use the Custom Access Token Hook to inject the role into the JWT. RLS policies read from the JWT claim, not from any client-writable field.
**Warning signs:** Any RLS policy that references `raw_user_meta_data` for authorization.

### Pitfall 2: Missing RLS on Public Schema Tables
**What goes wrong:** Table created without enabling RLS is fully accessible to any authenticated user via the auto-generated REST API.
**Why it happens:** Supabase auto-generates a REST API for the `public` schema. Without RLS, any authenticated client can read/write all rows.
**How to avoid:** Enable RLS on EVERY table immediately after creation. Create restrictive policies before inserting any data. Test policies from client SDK, not SQL Editor (which bypasses RLS).
**Warning signs:** Being able to query all rows of a table from the browser without any policy in place.

### Pitfall 3: Decimal Input Broken on European Mobile Browsers
**What goes wrong:** Spanish users type "75,5" (comma decimal) and the input either rejects it, shows validation errors, or stores NaN.
**Why it happens:** `<input type="number">` behavior with commas varies by browser and OS locale. Chrome on Android may accept comma, Chrome on desktop may not.
**How to avoid:** Use `<input type="text" inputMode="decimal">` with a normalization function that replaces comma with period before parsing/storing. Display values using `Intl.NumberFormat` with the user's locale.
**Warning signs:** Any use of `<input type="number">` for weight/measurement values, or `parseFloat()` without comma normalization.

### Pitfall 4: Auth State Race Condition on App Mount
**What goes wrong:** App renders login page briefly before session is restored from localStorage, causing a flash of unauthenticated content.
**Why it happens:** `getSession()` is async. If the app renders before the session check completes, it assumes no session.
**How to avoid:** Maintain an `isLoading` state that starts as `true`. Show a loading spinner until `getSession()` resolves and `onAuthStateChange` fires the initial event. Only render routes after auth state is known.
**Warning signs:** Brief flash of login page on browser refresh when user is already logged in.

### Pitfall 5: Translation Keys Missing for One Language
**What goes wrong:** UI shows raw keys like `"exercises.form.name_label"` instead of translated text in one language.
**Why it happens:** Developer adds keys to English file but forgets Spanish (or vice versa). No compile-time check by default.
**How to avoid:** Use TypeScript type generation for i18next (declare `CustomTypeOptions` with resource types). Maintain a script or CI check that compares key sets between language files. Set `fallbackLng` to ensure graceful degradation.
**Warning signs:** Untranslated key strings appearing in the UI during testing.

### Pitfall 6: TanStack Query Cache Stale After Mutation
**What goes wrong:** User creates/edits/deletes an exercise but the list doesn't update.
**Why it happens:** Mutation succeeds but the query cache still holds old data; developer forgot to invalidate.
**How to avoid:** Always call `queryClient.invalidateQueries()` in the `onSuccess` callback of mutations. Use consistent query key factories (the `exerciseKeys` pattern shown in Code Examples).
**Warning signs:** Data changes only visible after manual page refresh.

### Pitfall 7: Client Activation Check Only in Frontend
**What goes wrong:** Inactive client accesses training data by calling the Supabase API directly.
**Why it happens:** Activation check implemented only as a frontend route guard, not enforced at the database level.
**How to avoid:** Add `is_active` to the `profiles` table. Include `profiles.is_active = true` in RLS policies for client-accessible tables. The frontend check is for UX only; the RLS policy is for security.
**Warning signs:** RLS policies that don't reference activation status for client roles.

## Code Examples

Verified patterns from official sources:

### Supabase Client Singleton
```typescript
// Source: https://supabase.com/docs/guides/auth/quickstarts/react
// src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

### Database Schema for Phase 1
```sql
-- Source: Supabase RBAC docs + project requirements

-- User roles enum
create type public.user_role as enum ('trainer', 'client');

-- User profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  full_name text,
  role user_role not null default 'client',
  is_active boolean not null default false,  -- trainer must activate clients
  preferred_language text not null default 'es',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User roles table (for Custom Access Token Hook)
create table public.user_roles (
  id bigint generated by default as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  role user_role not null,
  unique (user_id, role)
);

-- Exercises library
create table public.exercises (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  youtube_url text not null,
  created_by uuid references auth.users not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for RLS performance
create index idx_profiles_role on public.profiles(role);
create index idx_user_roles_user_id on public.user_roles(user_id);
create index idx_exercises_created_by on public.exercises(created_by);

-- Enable RLS on ALL tables
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.exercises enable row level security;
```

### Custom Access Token Hook (Injects Role into JWT)
```sql
-- Source: https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  claims jsonb;
  user_role_value public.user_role;
begin
  -- Fetch the user's role from user_roles table
  select role into user_role_value
  from public.user_roles
  where user_id = (event->>'user_id')::uuid;

  claims := event->'claims';

  if user_role_value is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role_value));
  else
    claims := jsonb_set(claims, '{user_role}', 'null');
  end if;

  event := jsonb_set(event, '{claims}', claims);
  return event;
end;
$$;

-- Grant permissions for the hook
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
grant all on table public.user_roles to supabase_auth_admin;
revoke all on table public.user_roles from authenticated, anon, public;

-- RLS policy so only auth admin can read user_roles
create policy "Allow auth admin to read user roles"
on public.user_roles as permissive for select
to supabase_auth_admin using (true);
```

### RLS Policies for Exercises Table
```sql
-- Trainer can do everything with exercises
create policy "Trainer can view all exercises"
on public.exercises for select
to authenticated
using (
  (select auth.jwt()->>'user_role') = 'trainer'
);

create policy "Trainer can create exercises"
on public.exercises for insert
to authenticated
with check (
  (select auth.jwt()->>'user_role') = 'trainer'
);

create policy "Trainer can update exercises"
on public.exercises for update
to authenticated
using (
  (select auth.jwt()->>'user_role') = 'trainer'
)
with check (
  (select auth.jwt()->>'user_role') = 'trainer'
);

create policy "Trainer can delete exercises"
on public.exercises for delete
to authenticated
using (
  (select auth.jwt()->>'user_role') = 'trainer'
);

-- Active clients can view exercises (needed for Phase 2 workout view)
create policy "Active clients can view exercises"
on public.exercises for select
to authenticated
using (
  (select auth.jwt()->>'user_role') = 'client'
  and exists (
    select 1 from public.profiles
    where profiles.id = auth.uid()
    and profiles.is_active = true
  )
);
```

### RLS Policies for Profiles Table
```sql
-- Users can read their own profile
create policy "Users can view own profile"
on public.profiles for select
to authenticated
using (id = (select auth.uid()));

-- Trainer can view all profiles
create policy "Trainer can view all profiles"
on public.profiles for select
to authenticated
using (
  (select auth.jwt()->>'user_role') = 'trainer'
);

-- Trainer can update any profile (for activation)
create policy "Trainer can update profiles"
on public.profiles for update
to authenticated
using (
  (select auth.jwt()->>'user_role') = 'trainer'
)
with check (
  (select auth.jwt()->>'user_role') = 'trainer'
);

-- Users can update their own profile (name, language preference)
create policy "Users can update own profile"
on public.profiles for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));
```

### Profile Auto-Creation Trigger
```sql
-- Automatically create a profile when a user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role, is_active)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client'),
    -- Trainer is auto-activated; clients require trainer activation
    case when coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client') = 'trainer'
      then true
      else false
    end
  );

  -- Also insert into user_roles for the Custom Access Token Hook
  insert into public.user_roles (user_id, role)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'client')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Language Toggle Component
```tsx
// src/components/LanguageToggle.tsx
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';

export function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'es' ? 'en' : 'es';
    i18n.changeLanguage(newLang);
  };

  return (
    <Button variant="ghost" size="sm" onClick={toggleLanguage}>
      {i18n.language === 'es' ? 'EN' : 'ES'}
    </Button>
  );
}
```

### Translation File Structure
```json
// public/locales/es/translation.json
{
  "common": {
    "save": "Guardar",
    "cancel": "Cancelar",
    "delete": "Eliminar",
    "edit": "Editar",
    "loading": "Cargando...",
    "error": "Ha ocurrido un error",
    "confirm_delete": "¿Estás seguro de que quieres eliminar esto?"
  },
  "auth": {
    "login": "Iniciar sesión",
    "register": "Registrarse",
    "logout": "Cerrar sesión",
    "email": "Correo electrónico",
    "password": "Contraseña",
    "full_name": "Nombre completo"
  },
  "exercises": {
    "title": "Biblioteca de ejercicios",
    "add": "Añadir ejercicio",
    "name": "Nombre del ejercicio",
    "youtube_url": "Enlace de YouTube",
    "no_exercises": "No hay ejercicios todavía",
    "delete_confirm": "¿Eliminar este ejercicio?"
  },
  "nav": {
    "dashboard": "Panel",
    "exercises": "Ejercicios",
    "clients": "Clientes"
  }
}
```

### App Entry Point with Providers
```tsx
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { AuthProvider } from '@/features/auth/hooks/useAuth';
import App from './App';
import './lib/i18n'; // Initialize i18n
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,     // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Create React App | Vite | 2022-2023 | CRA is deprecated; Vite is 40x faster; official React docs recommend Vite |
| React Router v6 | React Router v7 (library mode) | 2024-2025 | v7 merged Remix patterns; use library mode for SPAs, not framework mode |
| Redux for all state | TanStack Query (server) + Context/Zustand (client) | 2023-2024 | Separation of server vs client state; Redux overkill for most apps |
| `react-router-dom` package | `react-router` package | 2024 (v7) | In v7, import everything from `react-router`; `react-router-dom` still works but is just a re-export |
| CSS Modules / styled-components | Tailwind CSS + shadcn/ui | 2023-2025 | Utility-first CSS won; shadcn/ui overtook MUI as most popular React component approach |
| `<input type="number">` | `<input type="text" inputMode="decimal">` | 2020+ (GOV.UK) | type="number" has cross-browser locale issues, accessibility problems, and silent data loss |
| Supabase custom claims via function | Custom Access Token Hook | 2024 | Hooks are the official way; old `set_claim` functions still work but hooks are preferred |
| i18next HTTP backend (lazy load) | Direct import for small apps | Ongoing | For 2 languages, bundling translations is simpler than HTTP lazy loading |

**Deprecated/outdated:**
- **Create React App:** Officially deprecated. Do not use.
- **`react-router-dom` as separate package:** In v7, use `react-router` directly. `react-router-dom` re-exports everything from `react-router`.
- **Supabase `set_claim` custom function:** Replaced by Custom Access Token Hook. The hook approach is officially documented and maintained.
- **`isLoading` in TanStack Query v5:** Renamed to `isPending`. `isLoading` now means `isPending && isFetching`.

## Open Questions

1. **Trainer Registration Security**
   - What we know: The first user (Javier) needs to be a trainer. Subsequent users default to client.
   - What's unclear: Should trainer registration be gated (invite-only, secret code) or should the first registered user automatically become trainer?
   - Recommendation: For simplicity, seed the trainer account via SQL migration. Disable public trainer registration entirely. Only client registration is public.

2. **Supabase Project Setup**
   - What we know: Need a Supabase project (free tier is sufficient for 20-50 users).
   - What's unclear: Whether to use Supabase CLI for local development or connect directly to hosted instance.
   - Recommendation: Use Supabase CLI with local Docker instance for development. This enables migration versioning and prevents accidental production changes during development.

3. **Email Confirmation Flow**
   - What we know: Supabase Auth supports email confirmation by default.
   - What's unclear: Whether to require email confirmation for client registration or allow immediate access.
   - Recommendation: Disable email confirmation for simplicity (clients are activated by trainer anyway). The trainer activation step serves as the trust gate.

## Sources

### Primary (HIGH confidence)
- [Supabase Auth React Quickstart](https://supabase.com/docs/guides/auth/quickstarts/react) - Auth setup, session management, onAuthStateChange
- [Supabase RBAC with Custom Claims](https://supabase.com/docs/guides/database/postgres/custom-claims-and-role-based-access-control-rbac) - Custom Access Token Hook, role injection, RLS
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security) - Policy syntax, auth.uid(), auth.jwt(), helper functions
- [Supabase Sessions](https://supabase.com/docs/guides/auth/sessions) - Session persistence, token refresh, localStorage behavior
- [shadcn/ui Vite Installation](https://ui.shadcn.com/docs/installation/vite) - Complete setup guide for Vite + React + TypeScript
- [GOV.UK Number Input Research](https://technology.blog.gov.uk/2020/02/24/why-the-gov-uk-design-system-team-changed-the-input-type-for-numbers/) - Why type="text" + inputMode is better than type="number"
- npm registry - Verified versions: React 19.2.4, Vite 7.3.1, @supabase/supabase-js 2.97.0, @tanstack/react-query 5.90.21, react-router 7.13.1, i18next 25.8.13, react-i18next 16.5.4, Tailwind CSS 4.2.1, Zustand 5.0.11

### Secondary (MEDIUM confidence)
- [TanStack Query + Supabase Integration](https://makerkit.dev/blog/saas/supabase-react-query) - Query key patterns, mutation patterns
- [react-i18next useTranslation Hook](https://react.i18next.com/latest/usetranslation-hook) - Hook API, namespace support
- [react-i18next TypeScript](https://react.i18next.com/latest/typescript) - CustomTypeOptions for type-safe translations
- [Supabase Custom Access Token Hook](https://supabase.com/docs/guides/auth/auth-hooks/custom-access-token-hook) - Hook setup and permissions
- [CSS-Tricks inputmode](https://css-tricks.com/finger-friendly-numerical-inputs-with-inputmode/) - inputMode="decimal" browser support
- [Cross-browser decimal input research](https://www.ctrl.blog/entry/html5-input-number-localization.html) - Browser inconsistencies with type="number" in European locales

### Tertiary (LOW confidence)
- Medium articles on TanStack Router vs React Router comparison - Used for ecosystem sentiment, not technical claims
- Medium articles on Zustand vs Context comparison - Validated against official Zustand docs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All versions verified via npm; all libraries are established, well-documented, and widely used
- Architecture: HIGH - Patterns sourced from official Supabase and React documentation; verified with official code examples
- Pitfalls: HIGH - Decimal separator issue verified with GOV.UK research and browser compat docs; auth pitfalls from official Supabase docs; RLS pitfalls from official security guides

**Research date:** 2026-02-23
**Valid until:** 2026-03-23 (30 days -- stable ecosystem, no major releases expected)
