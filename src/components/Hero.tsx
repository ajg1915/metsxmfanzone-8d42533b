import heroImage from "@/assets/hero-mets.png";
import logo from "@/assets/metsxmfanzone-logo.png";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface HeroSlide {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  display_order: number;
  link_url: string | null;
  link_text: string | null;
}

const Hero = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);
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

  const publicSlides = [
    {
      title: "Welcome to MetsXMFanZone",
      description: "Connect with thousands of passionate Mets fans. Share your thoughts, predictions, and game reactions the all new Live Home for Mets Fans",
      image: heroImage,
      link_url: null,
      link_text: null
    },
    {
      title: "Live Game Coverage",
      description: "Watch exclusive live streams, game highlights, and expert analysis. Never miss a moment of Mets action",
      image: heroImage,
      link_url: null,
      link_text: null
    },
    {
      title: "Premium Content",
      description: "Access exclusive podcasts, behind-the-scenes content, and premium features with your membership",
      image: heroImage,
      link_url: null,
      link_text: null
    }
  ];

  const defaultMemberSlides = [
    {
      title: "Welcome Back, Fan!",
      description: "Your home for live Mets coverage, exclusive content, and community discussions. Dive into today's action!",
      image: heroImage,
      link_url: null,
      link_text: null
    },
    {
      title: "Live Now",
      description: "Check out our live streams, game highlights, and real-time updates. Stay connected to every play!",
      image: heroImage,
      link_url: null,
      link_text: null
    },
    {
      title: "Explore Your Benefits",
      description: "Enjoy your member-exclusive podcasts, behind-the-scenes content, and premium features",
      image: heroImage,
      link_url: null,
      link_text: null
    }
  ];

  // Use database slides if available, otherwise use defaults
  const slidesToShow = user 
    ? (memberSlides.length > 0 
        ? memberSlides.map(s => ({ 
            title: s.title, 
            description: s.description, 
            image: s.image_url || heroImage,
            link_url: s.link_url,
            link_text: s.link_text
          }))
        : defaultMemberSlides)
    : publicSlides;

  const handleSlideClick = (linkUrl: string | null) => {
    if (linkUrl) {
      if (linkUrl.startsWith('http')) {
        window.open(linkUrl, '_blank');
      } else {
        navigate(linkUrl);
      }
    }
  };

  return (
    <section className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px] overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {slidesToShow.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative">
              <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px] flex items-center justify-center">
                <div 
                  className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-700"
                  style={{ 
                    backgroundImage: `url(${slide.image})`,
                    transform: selectedIndex === index ? 'scale(1)' : 'scale(1.05)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/75 to-background"></div>
                </div>
                
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-8 sm:py-10 md:py-14 max-w-6xl">
                  <div className="flex justify-center mb-4 sm:mb-5">
                    <img 
                      src={logo} 
                      alt="MetsXMFanZone" 
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-contain animate-scale-in" 
                    />
                  </div>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary mb-2 sm:mb-3 animate-fade-in px-2 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-foreground/90 mb-4 sm:mb-5 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-4 leading-relaxed">
                    {slide.description}
                  </p>
                  
                  {slide.link_url && slide.link_text && (
                    <Button 
                      onClick={() => handleSlideClick(slide.link_url)}
                      className="gap-2"
                      size="sm"
                    >
                      {slide.link_text}
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  )}
                  
                  {!user && !slide.link_url && (
                    <div className="flex items-center justify-center px-4">
                      <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-primary/80 rounded-lg bg-background/60 backdrop-blur-md hover-lift">
                        <span className="text-[11px] sm:text-xs md:text-sm text-foreground text-center leading-snug">
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
    </section>
  );
};

export default Hero;
