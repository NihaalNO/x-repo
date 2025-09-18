// types/supabase.ts

// --- User Profile Type --- 
export interface UserProfile {
  id: string;
  username: string;
  display_name: string;
  email: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

// --- Algorithm Type ---
export interface Algorithm {
  id: string;
  user_id: string;
  name: string;
  description: string;
  version: string;
  stars: number;
  lastUpdated: string;
  language: string;
  complexity: string;
  tags: string; // comma separated
  code: string;
  public: boolean;
}

// --- Joined Type for convenience (used in Repository/Page UI) ---
export type AlgorithmWithUser = Algorithm & { user: UserProfile };

// --- (Optional) Table Mapping for Supabase Generic Helpers ---
export interface Database {
  public: {
    Tables: {
      users: {
        Row: UserProfile;
        Insert: Omit<UserProfile, 'id' | 'created_at'> & Partial<Pick<UserProfile, 'id' | 'created_at'>>;
        Update: Partial<UserProfile>;
      };
      algorithms: {
        Row: Algorithm;
        Insert: Omit<Algorithm, 'id'> & Partial<Pick<Algorithm, 'id'>>;
        Update: Partial<Algorithm>;
      };
    };
  };
}
