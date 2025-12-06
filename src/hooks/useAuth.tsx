import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async (redirectToLogout = true) => {
    try {
      // Sign out from Supabase first
      const { error } = await supabase.auth.signOut();
      
      // Ignore "session_not_found" errors as the user is already signed out
      if (error && !error.message.includes('session_not_found')) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      // Clear local state after successful sign out
      setSession(null);
      setUser(null);
      
      // Redirect to logout page
      if (redirectToLogout && typeof window !== 'undefined') {
        window.location.href = '/logout';
      }
    } catch (error) {
      // Still clear local state even if there's an error
      setSession(null);
      setUser(null);
      console.error('Unexpected sign out error:', error);
      
      // Still redirect even on error
      if (redirectToLogout && typeof window !== 'undefined') {
        window.location.href = '/logout';
      }
    }
  };

  return {
    user,
    session,
    loading,
    signOut,
  };
};