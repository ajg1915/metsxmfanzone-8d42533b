import { useState, useEffect } from "react";
import { Bell, X, AlertTriangle, Info, Siren, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import logo from "@/assets/metsxmfanzone-logo.png";

interface GameAlert {
  id: string;
  title: string;
  message: string;
  alert_type: string;
  severity: string;
  link_url: string | null;
  created_at: string;
  expires_at: string | null;
}

const severityConfig = {
  info: {
    bgStyle: { backgroundColor: "#ff4500" },
    icon: Info,
    border: "border-primary/50",
  },
  warning: {
    bgStyle: { backgroundColor: "#ff4500" },
    icon: AlertTriangle,
    border: "border-amber-500/50",
  },
  urgent: {
    bgStyle: { backgroundColor: "#ff4500" },
    icon: Siren,
    border: "border-red-500/50",
  },
};

const GameAlertsBanner = () => {
  const [alerts, setAlerts] = useState<GameAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = JSON.parse(sessionStorage.getItem("dismissedGameAlerts") || "[]");
    setDismissedIds(dismissed);
    fetchAlerts();

    // Subscribe to realtime alerts
    const channel = supabase
      .channel("game-alerts-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "game_alerts" },
        () => fetchAlerts()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  const fetchAlerts = async () => {
    const { data, error } = await supabase
      .from("game_alerts")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error && data) {
      setAlerts(data as GameAlert[]);
    }
  };

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    sessionStorage.setItem("dismissedGameAlerts", JSON.stringify(updated));
  };

  const visibleAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-1">
      <AnimatePresence>
        {visibleAlerts.map((alert) => {
          const config = severityConfig[alert.severity as keyof typeof severityConfig] || severityConfig.info;
          const Icon = config.icon;

          return (
            <motion.div
              key={alert.id}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-white relative overflow-hidden"
              style={config.bgStyle}
            >
              <div className="container mx-auto flex items-center justify-between gap-3 px-4 py-2.5">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <img src={logo} alt="" className="w-5 h-5" />
                    {alert.severity === "urgent" && (
                      <Icon className="w-4 h-4 animate-pulse" />
                    )}
                    {alert.severity !== "urgent" && <Icon className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs sm:text-sm font-semibold mr-1.5">
                      {alert.title}
                    </span>
                    <span className="text-xs sm:text-sm opacity-90 hidden sm:inline">
                      {alert.message}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {alert.link_url && (
                    <button
                      onClick={() => navigate(alert.link_url!)}
                      className="text-xs bg-white/20 hover:bg-white/30 rounded px-2.5 py-1 transition-colors flex items-center gap-1"
                    >
                      View <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="hover:bg-white/20 rounded p-0.5 transition-colors"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default GameAlertsBanner;
