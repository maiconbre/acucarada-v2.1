import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UserProfile, UserContextType } from '@/types/user';

const UserContext = createContext<UserContextType | undefined>(undefined);



interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [cachedIP, setCachedIP] = useState<string | null>(null);
  const [ipCacheTime, setIpCacheTime] = useState<number>(0);
  
  // Cache duration in milliseconds (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Get current user (cached)
  const getCurrentUser = useCallback(async (): Promise<User | null> => {
    if (user) return user;
    
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      return currentUser;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }, [user]);

  // Get user IP address with persistent cache
  const getUserIP = useCallback(async (): Promise<string | null> => {
    const now = Date.now();
    const IP_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours cache
    
    // Check localStorage first
    const storedIP = localStorage.getItem('user_ip');
    const storedTime = localStorage.getItem('user_ip_time');
    
    if (storedIP && storedTime) {
      const cacheTime = parseInt(storedTime);
      if ((now - cacheTime) < IP_CACHE_DURATION) {
        setCachedIP(storedIP);
        setIpCacheTime(cacheTime);
        return storedIP;
      }
    }
    
    // Return memory cached IP if still valid
    if (cachedIP && (now - ipCacheTime) < IP_CACHE_DURATION) {
      return cachedIP;
    }
    
    try {
      // Use api64.ipify.org which supports CORS
      const response = await fetch('https://api64.ipify.org?format=json');
      const data = await response.json();
      
      // Cache the IP in memory and localStorage
      setCachedIP(data.ip);
      setIpCacheTime(now);
      localStorage.setItem('user_ip', data.ip);
      localStorage.setItem('user_ip_time', now.toString());
      
      return data.ip;
    } catch (error) {
      console.error('Error getting IP:', error);
      // Return cached IP if available, even if expired
      return cachedIP || storedIP;
    }
  }, [cachedIP, ipCacheTime]);

  // Get user agent
  const getUserAgent = useCallback((): string => {
    return navigator.userAgent;
  }, []);

  // Fetch user profile with caching
  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    // Check cache validity
    const now = Date.now();
    if (profile && (now - lastFetch) < CACHE_DURATION) {
      return; // Use cached data
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const userProfile = data || {
        id: user.id,
        user_id: user.id,
        email: user.email || '',
        username: '',
        full_name: '',
        avatar_url: '',
        role: 'user',
        created_at: new Date().toISOString()
      };

      setProfile(userProfile);
      setLastFetch(now);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao carregar dados do perfil"
      });
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, profile, lastFetch, toast, CACHE_DURATION]);

  // Update user profile
  const updateProfile = useCallback(async (data: Partial<UserProfile>): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) {
      return { success: false, error: 'Usuário não autenticado' };
    }

    try {
      setLoading(true);
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', user.id)
        .single();

      const profileData = {
        user_id: user.id,
        email: user.email,
        updated_at: new Date().toISOString(),
        ...data
      };

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id);
      } else {
        // Create new profile
        result = await supabase
          .from('profiles')
          .insert([{ ...profileData, created_at: new Date().toISOString() }]);
      }

      if (result.error) throw result.error;

      // Refresh profile data
      await fetchProfile();
      
      toast({
        title: "Sucesso",
        description: "Perfil atualizado com sucesso"
      });
      
      return { success: true };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar perfil';
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage
      });
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.email, fetchProfile, toast]);

  // Refresh user data (force refresh)
  const refreshUserData = useCallback(async () => {
    setLastFetch(0); // Reset cache
    await fetchProfile();
  }, [fetchProfile]);

  // Clear cache
  const clearCache = useCallback(() => {
    setLastFetch(0);
    setProfile(null);
    setCachedIP(null);
    setIpCacheTime(0);
    localStorage.removeItem('user_ip');
    localStorage.removeItem('user_ip_time');
  }, []);

  // Auto-fetch profile when user changes
  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      clearCache();
    }
  }, [user, fetchProfile, clearCache]);

  const value: UserContextType = {
    user,
    profile,
    loading,
    fetchProfile,
    updateProfile,
    getCurrentUser,
    getUserIP,
    getUserAgent,
    refreshUserData,
    clearCache
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext };