import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Radio, Zap, Tv, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/metsxmfanzone-logo.png";
import GlassCard from "@/components/GlassCard";
interface PodcastShow {
  id: string;
  title: string;
  description: string | null;
  show_date: string;
  show_type: string;
  thumbnail_gradient: string | null;
  thumbnail_url: string | null;
  is_featured: boolean;
  is_live: boolean;
}

// Fallback data generation for when no shows are in database
const FALLBACK_TITLES = ["🔥 Hot Stove Report Live", "⚾ Mets Daily Rundown", "🎙️ The FanZone Hour", "📊 Stats & Analysis Live"];
const FALLBACK_DESCRIPTIONS = ["Join us for live Mets analysis, hot takes, and fan interaction!", "Breaking down all the latest Mets news and roster updates.", "Your daily dose of Mets content with special guest appearances.", "Pre-game predictions, lineup analysis, and betting insights."];
const FALLBACK_GRADIENTS = ["from-[#002D72] via-[#003087] to-[#FF5910]", "from-[#FF5910] via-[#FF8C00] to-[#FFD700]", "from-[#002D72] via-[#0047AB] to-[#6495ED]", "from-[#6366f1] via-[#8b5cf6] to-[#a855f7]"];
const PodcastScheduleSection = () => {
  const [shows, setShows] = useState<PodcastShow[]>([]);
  const [isLiveNow, setIsLiveNow] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchShows();
  }, []);
  const fetchShows = async () => {
    setLoading(true);

    // Fetch upcoming shows from database
    const now = new Date().toISOString();
    // Fetch all shows for the next 2 weeks (no limit to show full weekly schedule)
    const twoWeeksFromNow = new Date();
    twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
    const {
      data,
      error
    } = await supabase.from("podcast_shows").select("id, title, description, show_date, show_type, thumbnail_gradient, thumbnail_url, is_featured, is_live").eq("published", true).gte("show_date", now).lte("show_date", twoWeeksFromNow.toISOString()).order("show_date", {
      ascending: true
    });
    if (error) {
      console.error("Error fetching podcast shows:", error);
      // Use fallback generated shows
      generateFallbackShows();
    } else if (data && data.length > 0) {
      setShows(data);
      setIsLiveNow(data.some(show => show.is_live));
    } else {
      // No shows in database, try to generate weekly shows automatically
      try {
        console.log("No upcoming shows found, triggering weekly generation...");
        const {
          data: generatedData,
          error: genError
        } = await supabase.functions.invoke("generate-weekly-podcast-shows");
        if (genError) {
          console.error("Error generating weekly shows:", genError);
          generateFallbackShows();
        } else {
          console.log("Weekly shows generated:", generatedData);
          // Re-fetch after generation - get all shows for 2 weeks
          const refetchTwoWeeks = new Date();
          refetchTwoWeeks.setDate(refetchTwoWeeks.getDate() + 14);
          const {
            data: refetchData
          } = await supabase.from("podcast_shows").select("id, title, description, show_date, show_type, thumbnail_gradient, thumbnail_url, is_featured, is_live").eq("published", true).gte("show_date", now).lte("show_date", refetchTwoWeeks.toISOString()).order("show_date", {
            ascending: true
          });
          if (refetchData && refetchData.length > 0) {
            setShows(refetchData);
          } else {
            generateFallbackShows();
          }
        }
      } catch (err) {
        console.error("Failed to generate weekly shows:", err);
        generateFallbackShows();
      }
    }

    // Also check for any live shows
    const {
      data: liveData
    } = await supabase.from("podcast_shows").select("is_live").eq("is_live", true).limit(1);
    if (liveData && liveData.length > 0) {
      setIsLiveNow(true);
    }
    setLoading(false);
  };
  const generateFallbackShows = () => {
    const fallbackShows: PodcastShow[] = [];
    const now = new Date();
    const scheduleDays = [1, 2, 5, 6]; // Mon, Tue, Fri, Sat

    for (let i = 0; i < 7 && fallbackShows.length < 4; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() + i);
      const dayOfWeek = date.getDay();
      if (scheduleDays.includes(dayOfWeek)) {
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
        date.setHours(isWeekend ? 14 : 17, isWeekend ? 0 : 30, 0, 0);
        if (date > now) {
          const idx = fallbackShows.length;
          fallbackShows.push({
            id: `fallback-${i}`,
            title: FALLBACK_TITLES[idx % FALLBACK_TITLES.length],
            description: FALLBACK_DESCRIPTIONS[idx % FALLBACK_DESCRIPTIONS.length],
            show_date: date.toISOString(),
            show_type: isWeekend ? "weekend" : "regular",
            thumbnail_gradient: FALLBACK_GRADIENTS[idx % FALLBACK_GRADIENTS.length],
            thumbnail_url: null,
            is_featured: idx === 0,
            is_live: false
          });
        }
      }
    }
    setShows(fallbackShows);
  };
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  };
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
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
      day: "numeric"
    });
  };
  if (loading) {
    return <section className="py-10 sm:py-12 md:py-16 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-64 mx-auto" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-muted rounded-xl" />)}
            </div>
          </div>
        </div>
      </section>;
  }
  return <section className="py-10 sm:py-12 md:py-16 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl glass-card">
              <img src={logo} alt="MetsXMFanZone" className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">
              Live Podcast Schedule
            </h2>
            {isLiveNow && <Badge className="bg-red-500 text-white animate-pulse text-[10px] sm:text-xs">
                <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                LIVE NOW
              </Badge>}
          </div>
          <p className="text-muted-foreground max-w-xl sm:max-w-2xl mx-auto text-xs sm:text-sm md:text-base leading-relaxed px-2 text-center font-thin">
            Catch us live on Mon, Tue & Fri @ 5:30 PM • Weekends @ 2:00 PM • Game day pregame shows!
          </p>
        </div>

        {/* Live Now Banner */}
        {isLiveNow && <div className="mb-8 animate-fade-in">
            <GlassCard variant="interactive" glow="orange" className="p-4 sm:p-6 border-2 border-red-500/50">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center animate-pulse">
                      <Radio className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <span className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full animate-ping" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h3 className="text-lg sm:text-xl font-bold text-foreground">We're Live Right Now!</h3>
                    <p className="text-sm text-muted-foreground">Join the show and be part of the conversation</p>
                  </div>
                </div>
                <Button asChild size="lg" className="bg-red-500 hover:bg-red-600 w-full sm:w-auto">
                  <Link to="/podcast">
                    <Play className="w-5 h-5 mr-2" fill="currentColor" />
                    Watch Live
                  </Link>
                </Button>
              </div>
            </GlassCard>
          </div>}

        {/* Upcoming Shows Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {shows.map(show => <GlassCard key={show.id} variant="interactive" glow="blue" className="h-full overflow-hidden">
              {/* Thumbnail - AI Image or Gradient Fallback */}
              <div className="relative h-24 sm:h-28 md:h-32 overflow-hidden">
                {show.thumbnail_url ? <img src={show.thumbnail_url} alt={show.title} className="w-full h-full object-cover" /> : <div className={`w-full h-full bg-gradient-to-br ${show.thumbnail_gradient || 'from-primary to-orange-500'}`} />}
                
                {/* Overlay Content */}
                <div className="absolute inset-0 p-2 sm:p-3 flex flex-col justify-between">
                  <div className="flex items-start justify-between gap-1">
                    <Badge className="bg-black/50 backdrop-blur-sm text-white border-0 text-[9px] sm:text-[10px] md:text-xs px-1.5 sm:px-2 py-0.5">
                      {show.show_type === "weekend" ? "Weekend" : show.show_type === "pregame" ? "Pregame" : "Live"}
                    </Badge>
                    <img src={logo} alt="MetsXMFanZone" className="w-6 h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 opacity-90 drop-shadow-lg" />
                  </div>
                  {show.is_live && <Badge className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white animate-pulse text-[10px] sm:text-xs">
                      <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                      LIVE
                    </Badge>}
                </div>
                
                {/* Bottom Gradient with Date/Time */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 sm:p-2">
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-white/95 text-[10px] sm:text-xs">
                    <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="font-medium truncate">{formatDate(show.show_date)}</span>
                    <span className="opacity-70">•</span>
                    <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                    <span className="font-medium">{formatTime(show.show_date)}</span>
                  </div>
                </div>
              </div>

              {/* Show Info */}
              <div className="p-2 sm:p-3">
                <h3 className="font-bold text-foreground text-xs sm:text-sm md:text-base mb-0.5 sm:mb-1 line-clamp-1 leading-tight">
                  {show.title}
                </h3>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground line-clamp-2 leading-snug">
                  {show.description}
                </p>

                <div className="mt-1.5 sm:mt-2 flex items-center">
                  <Badge variant="outline" className="text-[9px] sm:text-[10px] md:text-xs border-primary/30 text-primary px-1.5 sm:px-2 py-0.5">
                    <Tv className="w-2 h-2 sm:w-2.5 sm:h-2.5 mr-0.5 sm:mr-1" />
                    MetsXMFanZone
                  </Badge>
                </div>
              </div>
            </GlassCard>)}
        </div>

        {/* Schedule Info & CTA */}
        <div className="mt-6 sm:mt-8 text-center">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4 md:mb-6 px-2">
            <Badge variant="secondary" className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-primary/10 text-primary text-[10px] sm:text-xs md:text-sm">
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 sm:mr-1" />
              Mon•Tue•Fri 5:30PM
            </Badge>
            <Badge variant="secondary" className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-orange-500/10 text-orange-500 text-[10px] sm:text-xs md:text-sm">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 sm:mr-1" />
              Weekends 2PM
            </Badge>
            <Badge variant="secondary" className="px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 bg-secondary/10 text-secondary text-[10px] sm:text-xs md:text-sm">
              <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 mr-0.5 sm:mr-1" />
              Pregame
            </Badge>
          </div>

          <Button asChild size="default" className="glass-card border-primary/30 hover:border-primary/50 text-xs sm:text-sm md:text-base h-9 sm:h-10 px-3 sm:px-4 md:px-6">
            <Link to="/podcast">
              <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              View All Shows
            </Link>
          </Button>
        </div>
      </div>
    </section>;
};
export default PodcastScheduleSection;