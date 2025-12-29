import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook that automatically fetches Mets lineup data on game days.
 * Runs every 30 minutes to check for lineup updates from MLB API.
 */
export function useAutoLineupFetch() {
  useEffect(() => {
    const fetchLineup = async () => {
      try {
        console.log("Auto-fetching Mets lineup...");
        const { data, error } = await supabase.functions.invoke("fetch-mets-lineup");
        
        if (error) {
          console.error("Error fetching lineup:", error);
          return;
        }
        
        console.log("Lineup fetch result:", data);
      } catch (err) {
        console.error("Failed to fetch lineup:", err);
      }
    };

    // Fetch immediately on mount
    fetchLineup();

    // Set up interval to fetch every 30 minutes
    const interval = setInterval(fetchLineup, 30 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
}
