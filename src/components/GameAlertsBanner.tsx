import { useState, useEffect, useRef } from "react";
import { Bell, X, AlertTriangle, Info, Siren, ChevronRight, Volume2, VolumeX } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { generateAlertSound } from "@/utils/alertSounds";
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
  image_url: string | null;
  alert_sound: string | null;
  created_at: string;
  expires_at: string | null;
}

const ALERT_SOUNDS: Record<string, string> = {
  default: "/sounds/alert-default.mp3",
  chime: "/sounds/alert-chime.mp3",
  urgent: "/sounds/alert-urgent.mp3",
  horn: "/sounds/alert-horn.mp3",
  bell: "/sounds/alert-bell.mp3",
};

const severityConfig = {
  info: {
    bg: "bg-primary/90",
    icon: Info,
    border: "border-primary/50",
  },
  warning: {
    bg: "bg-amber-600/90",
    icon: AlertTriangle,
    border: "border-amber-500/50",
  },
  urgent: {
    bg: "bg-red-600/90",
    icon: Siren,
    border: "border-red-500/50",
  },
};

const GameAlertsBanner = () => {
  const [alerts, setAlerts] = useState<GameAlert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [soundMuted, setSoundMuted] = useState(() => {
    return localStorage.getItem("alertSoundMuted") === "true";
  });
  const playedAlertIds = useRef<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    const dismissed = JSON.parse(sessionStorage.getItem("dismissedGameAlerts") || "[]");
    setDismissedIds(dismissed);
    fetchAlerts();

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
      const newAlerts = data as GameAlert[];
      // Play sound for new alerts
      newAlerts.forEach((alert) => {
        if (!playedAlertIds.current.has(alert.id)) {
          playedAlertIds.current.add(alert.id);
          playAlertSound(alert.alert_sound);
        }
      });
      setAlerts(newAlerts);
    }
  };

  const playAlertSound = (soundKey: string | null) => {
    if (soundMuted) return;
    try {
      const soundUrl = soundKey && soundKey.startsWith("http")
        ? soundKey // Custom uploaded sound
        : ALERT_SOUNDS[soundKey || "default"] || ALERT_SOUNDS.default;
      
      const audio = new Audio(soundUrl);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Autoplay blocked - ignore
      });
    } catch {
      // Sound playback failed - ignore
    }
  };

  const toggleMute = () => {
    const newMuted = !soundMuted;
    setSoundMuted(newMuted);
    localStorage.setItem("alertSoundMuted", String(newMuted));
  };

  const handleDismiss = (id: string) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    sessionStorage.setItem("dismissedGameAlerts", JSON.stringify(updated));
  };

  const visibleAlerts = alerts.filter((a) => !dismissedIds.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="space-y-0.5">
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
              className={`${config.bg} text-white relative overflow-hidden`}
            >
              <div className="container mx-auto flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <img src={logo} alt="" className="w-4 h-4 sm:w-5 sm:h-5" />
                    {alert.severity === "urgent" ? (
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-pulse" />
                    ) : (
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] sm:text-sm font-semibold mr-1">
                      {alert.title}
                    </span>
                    <span className="text-[10px] sm:text-sm opacity-90 hidden sm:inline">
                      {alert.message}
                    </span>
                    {/* Show message on mobile below title */}
                    <p className="text-[10px] opacity-80 line-clamp-1 sm:hidden">
                      {alert.message}
                    </p>
                  </div>
                  {alert.image_url && (
                    <img src={alert.image_url} alt="" className="h-7 w-7 sm:h-10 sm:w-10 rounded object-cover flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {alert.link_url && (
                    <button
                      onClick={() => navigate(alert.link_url!)}
                      className="text-[10px] sm:text-xs bg-white/20 hover:bg-white/30 rounded px-1.5 sm:px-2.5 py-0.5 sm:py-1 transition-colors flex items-center gap-0.5"
                    >
                      View <ChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  )}
                  <button
                    onClick={toggleMute}
                    className="hover:bg-white/20 rounded p-0.5 transition-colors"
                    aria-label={soundMuted ? "Unmute alerts" : "Mute alerts"}
                  >
                    {soundMuted ? <VolumeX className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Volume2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="hover:bg-white/20 rounded p-0.5 transition-colors"
                    aria-label="Dismiss alert"
                  >
                    <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
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
