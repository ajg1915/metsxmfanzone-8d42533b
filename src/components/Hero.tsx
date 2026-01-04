import heroImage from "@/assets/hero-mets.png";
import logo from "@/assets/metsxmfanzone-logo.png";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useCallback, useEffect, useState, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Plus, Info, Tv, Radio, Users } from "lucide-react";

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
  const autoplayRef = useRef(Autoplay({ delay: 10000, stopOnInteraction: false }));

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      dragFree: false,
      containScroll: "trimSnaps",
      align: "center",
    },
    [autoplayRef.current],
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();
  const [memberSlides, setMemberSlides] = useState<HeroSlide[]>([]);
  const navigate = useNavigate();

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
      show_watch_live: true,
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
      description:
        "Your Go to Stop For Live exclusive content, and community discussions. Dive into today's action!",
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
      link_url: "/plans",
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
          badges: ["MEMBER", "EXCLUSIVE"],
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

  const handleSlideClick = (linkUrl: string | null) => {
    if (linkUrl) {
      if (linkUrl.startsWith("http")) {
        window.open(linkUrl, "_blank");
      } else {
        navigate(linkUrl);
      }
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Info },
    { id: "live", label: "Live Streams", icon: Tv },
    { id: "podcasts", label: "Podcasts", icon: Radio },
    { id: "community", label: "Community", icon: Users },
  ];

  return (
    <section className="relative min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px] overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full touch-pan-y">
          {slidesToShow.map((slide, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0 relative"
              style={{
                opacity: selectedIndex === index ? 1 : 0,
                transition: "opacity 0.5s ease-in-out",
              }}
            >
              <div className="relative min-h-[500px] sm:min-h-[550px] md:min-h-[600px] lg:min-h-[650px]">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                  style={{
                    backgroundImage: `url(${slide.image})`,
                    transform: selectedIndex === index ? "scale(1)" : "scale(1.05)",
                    transition: "transform 0.7s ease-out",
                  }}
                />

                {/* Netflix-style gradient overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />

                {/* Content - Left Aligned */}
                <div
                  className="absolute inset-0 flex flex-col justify-center px-6 sm:px-8 md:px-12 lg:px-16 pt-8 pb-24"
                  style={{
                    opacity: selectedIndex === index ? 1 : 0,
                    transform: selectedIndex === index ? "translateX(0)" : "translateX(-30px)",
                    transition: "opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s",
                  }}
                >
                  {/* Logo */}
                  <div className="mb-4">
                    <img
                      src={logo}
                      alt="MetsXMFanZone"
                      className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 object-contain"
                    />
                  </div>

                  {/* Subtitle */}
                  <span className="text-primary font-bold text-xs sm:text-sm tracking-widest mb-2">
                    {slide.subtitle}
                  </span>

                  {/* Title */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-foreground mb-3 max-w-2xl leading-tight uppercase tracking-tight">
                    {slide.title}
                  </h1>

                  {/* Badges */}
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 flex-wrap">
                    <span className="text-primary font-semibold text-sm">98% Match</span>
                    {slide.badges?.map((badge, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[10px] sm:text-xs font-bold border border-border/50 rounded text-muted-foreground"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm md:text-base text-foreground/80 mb-5 max-w-md leading-relaxed">
                    {slide.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {slide.show_watch_live && (
                      <Button
                        onClick={() => navigate("/live")}
                        size="lg"
                        className="gap-2 bg-foreground text-background hover:bg-foreground/90 font-bold px-6 sm:px-8"
                      >
                        <Play className="w-5 h-5 fill-current" />
                        Watch Live
                      </Button>
                    )}
                    <Button
                      onClick={() => navigate(user ? "/community" : "/auth")}
                      size="lg"
                      variant="secondary"
                      className="gap-2 bg-muted/80 hover:bg-muted text-foreground font-bold px-6 sm:px-8"
                    >
                      <Plus className="w-5 h-5" />
                      {user ? "Community" : "Join Free"}
                    </Button>
                    {slide.link_url && slide.link_text && (
                      <Button
                        onClick={() => handleSlideClick(slide.link_url)}
                        size="lg"
                        variant="outline"
                        className="gap-2 border-border/50 bg-background/20 hover:bg-background/40"
                      >
                        <Info className="w-5 h-5" />
                        {slide.link_text}
                      </Button>
                    )}
                  </div>

                  {/* Free Trial Banner for non-users */}
                  {!user && (
                    <div className="mt-6">
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary/20 border border-primary/40">
                        <span className="text-xs sm:text-sm text-foreground">
                          ⚡ Start your <span className="text-primary font-bold">7-day FREE trial</span> for unlimited
                          access
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

      {/* Bottom Navigation Tabs */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="flex items-center justify-center gap-1 sm:gap-2 px-4 pb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "live") navigate("/metsxmfanzone-tv");
                  if (tab.id === "podcasts") navigate("/podcast");
                  if (tab.id === "community") navigate("/community");
                }}
                className={`
                  flex items-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-all
                  ${
                    activeTab === tab.id
                      ? "text-foreground border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 pb-4">
          {slidesToShow.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              className={`h-1 rounded-full transition-all duration-300 ${
                selectedIndex === index ? "w-8 bg-primary" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
