import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface BackgroundSetting {
  id: string;
  page_type: string;
  background_type: string;
  background_value: string;
  is_active: boolean;
  name: string;
}

export const useBackgroundSettings = (pageType: "auth" | "welcome") => {
  return useQuery({
    queryKey: ["active-background", pageType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("background_settings")
        .select("*")
        .eq("page_type", pageType)
        .eq("is_active", true)
        .single();
      
      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine
        throw error;
      }
      
      return data as BackgroundSetting | null;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
