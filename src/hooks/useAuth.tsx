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
        console.log('🔐 Auth state changed:', {
          event,
          userId: session?.user?.id,
          email: session?.user?.email,
          hasSession: !!session
        });
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('🔐 Initial session check:', {
        userId: session?.user?.id,
        email: session?.user?.email,
        hasSession: !!session
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    // Clear local state immediately to prevent multiple calls
    const wasSignedIn = !!session;
    setSession(null);
    setUser(null);
    
    // Only attempt sign out if there was a session
    if (wasSignedIn) {
      try {
        const { error } = await supabase.auth.signOut();
        
        // Ignore session_not_found errors as the user is already signed out
        if (error && !error.message.includes('session_not_found')) {
          console.error('Sign out error:', error);
        }
      } catch (error) {
        console.error('Unexpected sign out error:', error);
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