import heroImage from "@/assets/hero-mets.png";
import logo from "@/assets/metsxmfanzone-logo.png";
import liveStreamIcon from "@/assets/live-streaming-icon.png";
import podcastIcon from "@/assets/podcast-icon.png";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { Play, Info, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
interface HeroSlide {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  link_url: string | null;
  link_text: string | null;
  show_watch_live: boolean | null;
}

const Hero = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    dragFree: false,
    watchDrag: false, // Disable drag for fade effect
    duration: 0, // Instant snap for fade transition
  });

  // Auto-advance slides every 10 seconds
  useEffect(() => {
    if (!emblaApi) return;
    
    const autoplay = setInterval(() => {
      emblaApi.scrollNext();
    }, 10000);
    
    return () => clearInterval(autoplay);
  }, [emblaApi]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const { isPremium, loading: subscriptionLoading } = useSubscription();
  const [memberSlides, setMemberSlides] = useState<HeroSlide[]>([]);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [isLiveNow, setIsLiveNow] = useState(false);
  const navigate = useNavigate();

  // Check if any live stream is currently active
  useEffect(() => {
    const checkLiveStreams = async () => {
      const { data } = await supabase
        .from('live_streams')
        .select('id')
        .eq('status', 'live')
        .eq('published', true)
        .limit(1);
      
      setIsLiveNow(data && data.length > 0);
    };

    checkLiveStreams();

    // Subscribe to live stream changes
    const channel = supabase
      .channel('hero-live-indicator')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'live_streams',
        },
        () => {
          checkLiveStreams();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Fetch member slides from database
  useEffect(() => {
    const fetchMemberSlides = async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_for_members", true)
        .eq("published", true)
        .order("display_order", { ascending: true });

      if (!error && data && data.length > 0) {
        setMemberSlides(data);
      }
    };

    if (user) {
      fetchMemberSlides();
    }
  }, [user]);

  const [publicSlides, setPublicSlides] = useState<HeroSlide[]>([]);

  // Fetch public slides from database
  useEffect(() => {
    const fetchPublicSlides = async () => {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .eq("is_for_members", false)
        .eq("published", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setPublicSlides(data);
      }
    };

    fetchPublicSlides();
  }, []);

  const defaultPublicSlides = [
    {
      title: "METSXMFANZONE.TV",
      subtitle: "LIVE HOME FOR METS FANS",
      description:
        "Connect with thousands of passionate Mets fans. Share your thoughts, predictions, and game reactions in the all new Live Home for Mets Fans.",
      image: heroImage,
      link_url: null,
      link_text: null,
      show_watch_live: true,
      badges: ["SNY", "2025", "Live"],
    },
    {
      title: "Live Game Coverage",
      subtitle: "STREAMING NOW",
      description:
        "Watch exclusive live streams, game highlights, and expert analysis. Never miss a moment of Mets action.",
      image: heroImage,
      link_url: "/metsxmfanzone-tv",
      link_text: "Watch Now",
      show_watch_live: false,
      badges: ["SNY", "HD", "4K"],
    },
    {
      title: "MetsXMFanZone Live Podcast",
      subtitle: "Join Like a Super Fan",
      description: "Access exclusive podcasts, behind-the-scenes content, and premium features with your membership.",
      image: heroImage,
      link_url: "/podcast",
      link_text: "Subscribe",
      show_watch_live: false,
      badges: ["MetsXMFanZoneTV", "Podcast"],
    },
  ];

  const defaultMemberSlides = [
    {
      title: "Welcome Back!",
      subtitle: "The Ultimate Destination Where the Fans Go!",
      description: "Your Go to Stop For Live exclusive content, and community discussions. Dive into today's action!",
      image: heroImage,
      link_url: null,
      link_text: null,
      show_watch_live: true,
      badges: ["MetsXMFanZoneTV", "LIVE"],
    },
    {
      title: "Live Now",
      subtitle: "MetsXMFanZone.TV Streams",
      description: "Check out our live streams, game highlights, and real-time updates. Stay connected to every play!",
      image: heroImage,
      link_url: "/live",
      link_text: "Watch",
      show_watch_live: true,
      badges: ["LIVE", "HD"],
    },
    {
      title: "Join Mets Fans Discusing Mets News Daily",
      description: "Join Anthony and The Mets Universe on his daily Show The MetsXMFanZone podcast",
      image: heroImage,
      link_url: "/pricing",
      link_text: "Membership",
      show_watch_live: false,
      badges: ["Podcasts", "UNLIMITED"],
    },
  ];

  // Use database slides if available, otherwise use defaults
  const slidesToShow = user
    ? memberSlides.length > 0
      ? memberSlides.map((s) => ({
          title: s.title,
          subtitle: "MEMBER CONTENT",
          description: s.description,
          image: s.image_url || heroImage,
          link_url: s.link_url,
          link_text: s.link_text,
          show_watch_live: s.show_watch_live ?? true,
          badges: ["MEtsXMFanTV", "Watch Live"],
        }))
      : defaultMemberSlides
    : publicSlides.length > 0
      ? publicSlides.map((s) => ({
          title: s.title,
          subtitle: "PUBLIC CONTENT",
          description: s.description,
          image: s.image_url || heroImage,
          link_url: s.link_url,
          link_text: s.link_text,
          show_watch_live: s.show_watch_live ?? true,
          badges: ["LIVE", "2025", "HD"],
        }))
      : defaultPublicSlides;

  // Check if a URL requires premium access
  const requiresPremium = (url: string) => {
    const premiumRoutes = ['/live', '/metsxmfanzone-tv', '/mlb-network', '/espn-network', '/pix11-network', '/spring-training-live'];
    return premiumRoutes.some(route => url.toLowerCase().includes(route.toLowerCase().replace('/', '')));
  };

  const handleProtectedNavigation = (linkUrl: string) => {
    // If not logged in, redirect to auth
    if (!user) {
      navigate("/auth");
      return;
    }
    // If logged in but not premium, show upgrade prompt
    if (!isPremium && requiresPremium(linkUrl)) {
      setShowUpgradePrompt(true);
      return;
    }
    // Otherwise, navigate
    if (linkUrl.startsWith("http")) {
      window.open(linkUrl, "_blank");
    } else {
      navigate(linkUrl);
    }
  };

  const handleSlideClick = (linkUrl: string | null) => {
    if (linkUrl) {
      handleProtectedNavigation(linkUrl);
    }
  };

  // Custom icon components for tabs
  const LogoIcon = ({ className }: { className?: string }) => <img src={logo} alt="" className={className} />;

  const LiveStreamIcon = ({ className }: { className?: string }) => (
    <img src={liveStreamIcon} alt="" className={className} />
  );

  const PodcastIcon = ({ className }: { className?: string }) => <img src={podcastIcon} alt="" className={className} />;

  const SocialIcon = ({ className }: { className?: string }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.82 3.98" />
    </svg>
  );

  const [showOverviewInfo, setShowOverviewInfo] = useState(false);

  const tabs = [
    { id: "overview", label: "Overview", icon: LogoIcon, isImage: true },
    { id: "live", label: "Live Streams", icon: LiveStreamIcon, isImage: true },
    { id: "podcasts", label: "Podcast", icon: PodcastIcon, isImage: true },
    { id: "community", label: "Community", icon: LogoIcon, isImage: true },
  ];

  return (
    <section className="group/hero relative min-h-[550px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px] overflow-hidden">
      {/* Immersive background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div 
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-30"
          style={{
            background: "radial-gradient(circle, hsl(220 80% 40% / 0.5), transparent 70%)",
            filter: "blur(100px)",
          }}
        />
        <div 
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(24 100% 50% / 0.4), transparent 70%)",
            filter: "blur(100px)",
          }}
        />
      </div>
      
      <div ref={emblaRef} className="overflow-hidden h-full absolute inset-0">
        <div className="flex h-full">
          {slidesToShow.map((slide, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 absolute inset-0"
              style={{
                opacity: selectedIndex === index ? 1 : 0,
                zIndex: selectedIndex === index ? 10 : 0,
                transition: "opacity 0.5s ease-out",
                pointerEvents: selectedIndex === index ? "auto" : "none",
              }}
            >
              <div className="relative min-h-[550px] sm:min-h-[600px] md:min-h-[650px] lg:min-h-[700px]">
                {/* Background Image with parallax effect */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                    transform: selectedIndex === index ? "scale(1)" : "scale(1.05)",
                    transition: "transform 0.6s ease-out",
                  }}
                />

                {/* Enhanced gradient overlays for glass depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent" />
                
                {/* Glass panel for content */}
                <div className="absolute inset-y-0 left-0 w-full lg:w-3/4 bg-gradient-to-r from-background/95 via-background/70 to-transparent" />

                {/* Content - Left Aligned */}
                <div
                  className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 pt-8 pb-28"
                  style={{
                    opacity: selectedIndex === index ? 1 : 0,
                    transform: selectedIndex === index ? "translateY(0)" : "translateY(20px)",
                    transition: "opacity 0.4s ease-out 0.1s, transform 0.4s ease-out 0.1s",
                  }}
                >
                  {/* Logo */}
                  <div className="mb-3 sm:mb-4">
                    <img
                      src={logo}
                      alt="MetsXMFanZone"
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 object-contain"
                    />
                  </div>

                  {/* Subtitle */}
                  <span className="text-primary font-bold text-[10px] sm:text-xs md:text-sm tracking-widest mb-1.5 sm:mb-2">
                    {slide.subtitle}
                  </span>

                  {/* Title */}
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-black text-foreground mb-2 sm:mb-3 max-w-2xl leading-tight uppercase tracking-tight">
                    {slide.title}
                  </h1>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 mb-3 sm:mb-4 flex-wrap">
                    <span className="text-primary font-semibold text-xs sm:text-sm">98% Match</span>
                    {slide.badges?.map((badge, i) => (
                      <span
                        key={i}
                        className="px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] md:text-xs font-bold border border-border/50 rounded text-muted-foreground"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-[11px] sm:text-xs md:text-sm lg:text-base text-foreground/80 mb-4 sm:mb-5 max-w-sm sm:max-w-md leading-relaxed">
                    {slide.description}
                  </p>

                  {/* Action Buttons - Glass styled */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    {slide.show_watch_live && (
                      <div className="relative">
                        {isLiveNow && (
                          <div className="absolute -inset-1.5 sm:-inset-2 rounded-lg sm:rounded-xl bg-[#ff4500]/40 blur-lg sm:blur-xl animate-pulse" />
                        )}
                        <Button
                          onClick={() => handleProtectedNavigation("/metsxmfanzone-tv")}
                          size="default"
                          className={`relative gap-1.5 sm:gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-bold px-4 sm:px-6 md:px-8 h-9 sm:h-10 md:h-11 text-xs sm:text-sm shadow-lg transition-all duration-300 ${
                            isLiveNow 
                              ? "shadow-[#ff4500]/50 hover:shadow-[#ff4500]/70 ring-2 ring-[#ff4500]/30" 
                              : "shadow-primary/30 hover:shadow-primary/50"
                          }`}
                        >
                          <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                          Watch Live
                        </Button>
                      </div>
                    )}
                    {slide.link_url && slide.link_text && (
                      <Button
                        onClick={() => handleSlideClick(slide.link_url)}
                        size="default"
                        variant="outline"
                        className="gap-1.5 sm:gap-2 glass-light border-border/30 hover:border-primary/50 transition-all duration-300 h-9 sm:h-10 md:h-11 text-xs sm:text-sm px-3 sm:px-4 md:px-6"
                      >
                        <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                        {slide.link_text}
                      </Button>
                    )}
                  </div>

                  {/* Free Trial Banner for non-users - Glass styled */}
                  {!user && (
                    <div className="mt-4 sm:mt-5 md:mt-6">
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-lg sm:rounded-xl glass-light glow-pulse">
                        <span className="text-[10px] sm:text-xs md:text-sm text-foreground">
                          ⚡ Start your <span className="text-primary font-bold">7-day FREE trial</span> for unlimited access
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrow Navigation - Show on hover only, positioned outside content area */}
      {slidesToShow.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute left-2 sm:left-3 top-1/3 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full glass-light flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/50 transition-all duration-300 opacity-0 group-hover/hero:opacity-100"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            className="absolute right-2 sm:right-3 top-1/3 -translate-y-1/2 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full glass-light flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/50 transition-all duration-300 opacity-0 group-hover/hero:opacity-100"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {/* Bottom Navigation Tabs - Glass styled */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        {/* Quick Access Header */}
        <div className="flex justify-center mb-2">
          <span className="text-[#ff4500] text-sm sm:text-base md:text-lg font-semibold border-b-2 border-[#ff4500] pb-0.5">
            Quick Access
          </span>
        </div>
        <div className="flex items-center justify-center gap-0.5 sm:gap-1 md:gap-2 px-2 sm:px-4 pb-3 sm:pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isLiveTab = tab.id === "live";
            const isOverviewTab = tab.id === "overview";
            
            const tabButton = (
              <button
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "overview") setShowOverviewInfo(true);
                  if (tab.id === "live") handleProtectedNavigation("/metsxmfanzone-tv");
                  if (tab.id === "podcasts") handleProtectedNavigation("/podcast");
                  if (tab.id === "community") handleProtectedNavigation("/community");
                }}
                className={`
                  relative flex flex-col sm:flex-row items-center gap-0.5 sm:gap-1 md:gap-1.5 px-2 sm:px-3 md:px-4 lg:px-5 py-1.5 sm:py-2 md:py-2.5 text-[11px] sm:text-xs md:text-sm lg:text-base font-medium transition-all duration-300 rounded-lg sm:rounded-xl
                  ${
                    activeTab === tab.id
                      ? "text-foreground glass-strong border-primary/50 shadow-lg"
                      : "text-muted-foreground hover:text-foreground glass-light hover:border-border/50"
                  }
                  ${isLiveTab && isLiveNow ? "ring-1 ring-[#ff4500]/40 shadow-[#ff4500]/20" : ""}
                `}
              >
                {/* Live indicator dot - left side */}
                {isLiveTab && isLiveNow && (
                  <span className="absolute -top-0.5 -left-0.5 sm:-top-1 sm:-left-1 flex h-2 w-2 sm:h-2.5 sm:w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4500] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 sm:h-2.5 sm:w-2.5 bg-[#ff4500]"></span>
                  </span>
                )}
                {tab.isImage ? (
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 object-contain" />
                ) : (
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8" />
                )}
                <span className="hidden xs:inline sm:inline">{tab.label}</span>
              </button>
            );

            return (
              <div key={tab.id} className="relative">
                {/* Orange glow for Live Streams tab when live */}
                {isLiveTab && isLiveNow && (
                  <div className="absolute -inset-1 rounded-xl bg-[#ff4500]/30 blur-md animate-pulse" />
                )}
                {isOverviewTab ? (
                  <Popover open={showOverviewInfo} onOpenChange={setShowOverviewInfo}>
                    <PopoverTrigger asChild>
                      {tabButton}
                    </PopoverTrigger>
                    <PopoverContent className="w-72 p-3 glass-strong border-primary/30">
                      <p className="text-sm text-foreground">
                        Here is a quick way to select your tabs quickly for Live Streams, Live Podcast and chat with your fellow fans daily!
                      </p>
                    </PopoverContent>
                  </Popover>
                ) : (
                  tabButton
                )}
              </div>
            );
          })}
        </div>

        {/* Slide Indicators - Enhanced */}
        <div className="flex justify-center gap-1.5 sm:gap-2 pb-4 sm:pb-5">
          {slidesToShow.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1 sm:h-1.5 rounded-full transition-all duration-300 ${
                selectedIndex === index 
                  ? "w-6 sm:w-8 bg-primary shadow-lg shadow-primary/50" 
                  : "w-1.5 sm:w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
              }`}
            />
          ))}
        </div>
      </div>

      <UpgradePrompt open={showUpgradePrompt} onOpenChange={setShowUpgradePrompt} />
    </section>
  );
};

export default Hero;
