import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "free" | "premium" | "annual";

export const useSubscription = () => {
  const { user } = useAuth();
  const [tier, setTier] = useState<SubscriptionTier>("free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setTier("free");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("plan_type, status, end_date")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!error && data) {
          // Check if subscription is still valid
          const endDate = data.end_date ? new Date(data.end_date) : null;
          const isActive = !endDate || endDate > new Date();
          
          if (isActive) {
            setTier(data.plan_type as SubscriptionTier);
          } else {
            setTier("free");
          }
        } else {
          setTier("free");
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        setTier("free");
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const hasAccess = (requiredTier: "free" | "premium") => {
    if (requiredTier === "free") return true;
    if (tier === "premium" || tier === "annual") return true;
    return false;
  };

  const isPremium = tier === "premium" || tier === "annual";

  return {
    tier,
    loading,
    hasAccess,
    isPremium,
  };
};
