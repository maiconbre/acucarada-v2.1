import { User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserContextType {
  // User data
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  
  // Profile operations
  fetchProfile: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  
  // User utilities
  getCurrentUser: () => Promise<User | null>;
  getUserIP: () => Promise<string | null>;
  getUserAgent: () => string;
  
  // Cache management
  refreshUserData: () => Promise<void>;
  clearCache: () => void;
}