export type UserRole = "trainer" | "client";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  preferred_language: string;
  theme: string;
  created_at: string;
  updated_at: string;
}

export interface UserRoleRecord {
  id: number;
  user_id: string;
  role: UserRole;
}

export interface Exercise {
  id: string;
  name: string;
  youtube_url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at" | "updated_at"> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, "id">>;
      };
      user_roles: {
        Row: UserRoleRecord;
        Insert: Omit<UserRoleRecord, "id"> & { id?: number };
        Update: Partial<Omit<UserRoleRecord, "id">>;
      };
      exercises: {
        Row: Exercise;
        Insert: Omit<Exercise, "id" | "created_at" | "updated_at" | "created_by"> & {
          id?: string;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Exercise, "id" | "created_by" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
    };
  };
}
