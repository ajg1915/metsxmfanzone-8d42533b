import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface MaintenanceSettings {
  isEnabled: boolean;
  message: string;
}

export const useMaintenanceMode = () => {
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>({
    isEnabled: false,
    message: "",
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMaintenanceSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("setting_key, setting_value")
          .in("setting_key", ["maintenance_enabled", "maintenance_message"]);

        if (error) {
          console.error("Error fetching maintenance settings:", error);
          setIsLoading(false);
          return;
        }

        const settings: MaintenanceSettings = {
          isEnabled: false,
          message: "We're currently performing scheduled maintenance. Please check back soon!",
        };

        data?.forEach((setting) => {
          if (setting.setting_key === "maintenance_enabled") {
            settings.isEnabled = setting.setting_value === true;
          }
          if (setting.setting_key === "maintenance_message" && setting.setting_value) {
            settings.message = String(setting.setting_value);
          }
        });

        setMaintenance(settings);
      } catch (err) {
        console.error("Error fetching maintenance settings:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMaintenanceSettings();

    // Subscribe to realtime changes
    const channel = supabase
      .channel("maintenance-settings")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_settings",
          filter: "setting_key=in.(maintenance_enabled,maintenance_message)",
        },
        () => {
          fetchMaintenanceSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { ...maintenance, isLoading };
};
