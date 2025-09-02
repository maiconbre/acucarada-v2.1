import { useState, useEffect } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AuthContext } from "@/contexts/auth-context";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      // 1. Check for an existing session
      const { data: { session: initialSession } } = await supabase.auth.getSession();

      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
      } else {
        // 2. If no session, sign in anonymously
        const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
        if (anonError) {
          console.error("Erro ao iniciar sessão anônima:", anonError);
        } else if (anonData.session) {
          setSession(anonData.session);
          setUser(anonData.session.user);
        }
      }
      setLoading(false);
    };

    initializeAuth();

    // 3. Listen for auth state changes (e.g., sign in, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user signs out, we might want to re-establish an anonymous session
        if (_event === 'SIGNED_OUT') {
          supabase.auth.signInAnonymously();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (emailOrUsername: string, password: string) => {
    try {
      // First, try to get the actual email if username was provided
      const { data: emailResult, error: emailError } = await supabase
        .rpc('get_email_by_username', {
          input_username: emailOrUsername
        });
      
      if (emailError) {
        console.warn('Error getting email by username, trying direct login:', emailError);
      }
      
      // Use the resolved email or the original input
      // If emailResult is null/undefined, use the original input (assuming it's an email)
      const emailToUse = (emailResult as string) || emailOrUsername;
      
      const { error } = await supabase.auth.signInWithPassword({
        email: emailToUse,
        password,
      });
      
      return { error };
    } catch (err) {
      console.error('Sign in error:', err);
      return { error: err as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signUp,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.displayName = 'AuthProvider';