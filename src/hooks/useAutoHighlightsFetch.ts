import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that automatically fetches Mets highlights from MLB API.
 * Runs on mount and can be manually triggered.
 */
export function useAutoHighlightsFetch() {
  const fetchHighlights = useCallback(async () => {
    try {
      console.log("Auto-fetching Mets highlights from MLB API...");
      const { data, error } = await supabase.functions.invoke("fetch-mets-highlights", {
        body: { lookbackDays: 30 }
      });
      
      if (error) {
        console.error("Error fetching MLB highlights:", error);
        return { success: false, error };
      }
      
      console.log("MLB highlights fetch result:", data);
      return { success: true, data };
    } catch (err) {
      console.error("Failed to fetch MLB highlights:", err);
      return { success: false, error: err };
    }
  }, []);

  useEffect(() => {
    // Defer initial fetch by 8 seconds to avoid blocking page load
    const timer = setTimeout(fetchHighlights, 8000);
    return () => clearTimeout(timer);
  }, [fetchHighlights]);

  return { fetchHighlights };
}
