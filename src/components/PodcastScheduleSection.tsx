import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Radio, Zap, Tv, Play } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/metsxmfanzone-logo.png";
import GlassCard from "@/components/GlassCard";

interface UpcomingShow {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  type: "regular" | "pregame" | "weekend";
  thumbnailUrl?: string;
  isLive?: boolean;
}

// Schedule configuration based on user requirements
const SHOW_SCHEDULE = {
  regular: {
    monday: { time: "17:30", label: "5:30 PM" },
    tuesday: { time: "17:30", label: "5:30 PM" },
    friday: { time: "17:30", label: "5:30 PM" },
  },
  weekend: {
    saturday: { time: "14:00", label: "2:00 PM" },
    sunday: { time: "14:00", label: "2:00 PM" },
  },
  pregame: {
    earlyGame: { offset: -60, label: "1 hour before" }, // Game at 1pm = show at 12pm
    eveningGame: { time: "17:30", label: "5:30 PM" }, // Game at 7:10pm = show at 5:30pm
  }
};

const CREATIVE_TITLES = [
  "🔥 Hot Stove Report Live",
  "⚾ Mets Daily Rundown",
  "🎙️ The FanZone Hour",
  "📊 Stats & Analysis Live",
  "💪 Amazin' Update",
  "🏟️ Citi Field Breakdown",
  "🎯 Mets Spotlight Show",
  "⭐ All-Star Talk Live",
  "🚀 Pregame Countdown",
  "📺 MetsXMFanZone Tonight",
  "🔵 Blue & Orange Live",
  "⚡ Quick Takes Live",
];

const SHOW_DESCRIPTIONS = [
  "Join us for live Mets analysis, hot takes, and fan interaction!",
  "Breaking down all the latest Mets news and roster updates.",
  "Your daily dose of Mets content with special guest appearances.",
  "Pre-game predictions, lineup analysis, and betting insights.",
  "Fan call-ins, Q&A, and community discussions.",
  "Deep dive into stats, projections, and player performance.",
];

// Gradient backgrounds for thumbnails
const THUMBNAIL_GRADIENTS = [
  "from-blue-600 via-blue-800 to-orange-500",
  "from-orange-500 via-orange-600 to-blue-700",
  "from-blue-700 via-purple-600 to-orange-400",
  "from-orange-600 via-red-500 to-blue-600",
  "from-blue-500 via-indigo-600 to-orange-500",
];

const PodcastScheduleSection = () => {
  const [upcomingShows, setUpcomingShows] = useState<UpcomingShow[]>([]);
  const [isLiveNow, setIsLiveNow] = useState(false);

  useEffect(() => {
    generateUpcomingShows();
    checkIfLive();
  }, []);

  const checkIfLive = async () => {
    const { data } = await supabase
      .from("podcast_live_stream")
      .select("is_live")
      .eq("is_live", true)
      .limit(1);
    
    setIsLiveNow(data && data.length > 0);
  };

  const generateUpcomingShows = () => {
    const shows: UpcomingShow[] = [];
    const now = new Date();
    const daysToGenerate = 7;

    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      const dayName = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"][dayOfWeek];

      let showTime: string | null = null;
      let showType: "regular" | "pregame" | "weekend" = "regular";

      // Check regular weekday schedule
      if (dayName === "monday" || dayName === "tuesday" || dayName === "friday") {
        showTime = SHOW_SCHEDULE.regular[dayName as keyof typeof SHOW_SCHEDULE.regular]?.time;
        showType = "regular";
      }
      // Check weekend schedule
      else if (dayName === "saturday" || dayName === "sunday") {
        showTime = SHOW_SCHEDULE.weekend[dayName as keyof typeof SHOW_SCHEDULE.weekend]?.time;
        showType = "weekend";
      }

      if (showTime) {
        const [hours, minutes] = showTime.split(":").map(Number);
        const showDate = new Date(date);
        showDate.setHours(hours, minutes, 0, 0);

        // Only include future shows
        if (showDate > now) {
          const titleIndex = (date.getDate() + dayOfWeek) % CREATIVE_TITLES.length;
          const descIndex = (date.getDate() + dayOfWeek) % SHOW_DESCRIPTIONS.length;

          shows.push({
            id: `show-${date.toISOString()}`,
            title: CREATIVE_TITLES[titleIndex],
            description: SHOW_DESCRIPTIONS[descIndex],
            date: showDate,
            time: formatTime(showDate),
            type: showType,
            isLive: false,
          });
        }
      }
    }

    // Sort by date and limit to 4 shows
    shows.sort((a, b) => a.date.getTime() - b.date.getTime());
    setUpcomingShows(shows.slice(0, 4));
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const getGradient = (index: number) => {
    return THUMBNAIL_GRADIENTS[index % THUMBNAIL_GRADIENTS.length];
  };

  return (
    <section className="py-10 sm:py-12 md:py-16 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-10"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 rounded-xl glass-card">
              <img src={logo} alt="MetsXMFanZone" className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold">
              Live Podcast Schedule
            </h2>
            {isLiveNow && (
              <Badge className="bg-red-500 text-white animate-pulse">
                <Radio className="w-3 h-3 mr-1" />
                LIVE NOW
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Catch us live on Mondays, Tuesdays & Fridays at 5:30 PM • Weekends at 2:00 PM • Game days with special pregame shows!
          </p>
        </motion.div>

        {/* Live Now Banner */}
        {isLiveNow && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <GlassCard variant="interactive" glow="orange" className="p-6 border-2 border-red-500/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-pulse">
                      <Radio className="w-8 h-8 text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-foreground">We're Live Right Now!</h3>
                    <p className="text-muted-foreground">Join the show and be part of the conversation</p>
                  </div>
                </div>
                <Button asChild size="lg" className="bg-red-500 hover:bg-red-600">
                  <Link to="/podcast">
                    <Play className="w-5 h-5 mr-2" fill="currentColor" />
                    Watch Live
                  </Link>
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Upcoming Shows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcomingShows.map((show, index) => (
            <motion.div
              key={show.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <GlassCard variant="interactive" glow="blue" className="h-full overflow-hidden">
                {/* AI-Generated Thumbnail */}
                <div className={`relative h-32 bg-gradient-to-br ${getGradient(index)} p-4 flex flex-col justify-between`}>
                  <div className="flex items-start justify-between">
                    <Badge className="bg-black/40 text-white border-0">
                      {show.type === "weekend" ? "Weekend Show" : show.type === "pregame" ? "Pregame" : "Live Show"}
                    </Badge>
                    <img src={logo} alt="MetsXMFanZone" className="w-10 h-10 opacity-90" />
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <div className="flex items-center gap-2 text-white/90 text-sm">
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">{formatDate(show.date)}</span>
                      <span className="mx-1">•</span>
                      <Clock className="w-4 h-4" />
                      <span className="font-medium">{show.time}</span>
                    </div>
                  </div>
                </div>

                {/* Show Info */}
                <div className="p-4">
                  <h3 className="font-bold text-foreground text-lg mb-1 line-clamp-1">
                    {show.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {show.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                      <Tv className="w-3 h-3 mr-1" />
                      MetsXMFanZone
                    </Badge>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* Schedule Info & CTA */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <Badge variant="secondary" className="px-4 py-2 bg-primary/10 text-primary">
              <Calendar className="w-4 h-4 mr-2" />
              Mon • Tue • Fri @ 5:30 PM
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 bg-orange-500/10 text-orange-500">
              <Zap className="w-4 h-4 mr-2" />
              Weekends @ 2:00 PM
            </Badge>
            <Badge variant="secondary" className="px-4 py-2 bg-secondary/10 text-secondary">
              <Radio className="w-4 h-4 mr-2" />
              Game Day Pregame Shows
            </Badge>
          </div>

          <Button asChild size="lg" className="glass-card border-primary/30 hover:border-primary/50">
            <Link to="/podcast">
              <Radio className="w-5 h-5 mr-2" />
              View All Shows & Listen Live
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default PodcastScheduleSection;
