import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        console.log('useAdmin: Checking admin for user:', user.id);
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        console.log('useAdmin: Query result:', { data, error, isAdmin: !!data });

        const adminStatus = !error && !!data;
        
        // Set both states together to avoid race condition
        setIsAdmin(adminStatus);
        setLoading(false);
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  return { isAdmin, loading };
};
