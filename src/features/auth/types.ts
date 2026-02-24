import type { Session, User } from "@supabase/supabase-js";

export type UserRole = "trainer" | "client";

export interface AuthState {
  session: Session | null;
  user: User | null;
  userRole: UserRole | null;
  isActive: boolean | null;
  isLoading: boolean;
}

export interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole
  ) => Promise<void>;
  signOut: () => Promise<void>;
}
