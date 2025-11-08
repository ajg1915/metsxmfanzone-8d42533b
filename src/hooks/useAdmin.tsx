import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      console.log('useAdmin: Starting check for user:', user?.id);
      
      if (!user) {
        console.log('useAdmin: No user, setting isAdmin=false, loading=false');
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        console.log('useAdmin: Querying user_roles for user:', user.id);
        const { data, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        console.log('useAdmin: Query result:', { data, error });

        if (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } else {
          const adminStatus = !!data;
          console.log("useAdmin: Setting isAdmin to:", adminStatus);
          setIsAdmin(adminStatus);
        }
      } catch (err) {
        console.error("Admin check failed:", err);
        setIsAdmin(false);
      } finally {
        console.log('useAdmin: Setting loading to false');
        setLoading(false);
      }
    };

    checkAdmin();
  }, [user]);

  console.log('useAdmin: Current state:', { isAdmin, loading, userId: user?.id });
  return { isAdmin, loading };
};
