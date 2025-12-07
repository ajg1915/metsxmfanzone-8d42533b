import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import heroImage from "@/assets/hero-mets.png";
import logo from "@/assets/metsxmfanzone-logo.png";
import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";

const Hero = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  const scrollTo = useCallback(
    (index: number) => emblaApi && emblaApi.scrollTo(index),
    [emblaApi]
  );

  const slides = [
    {
      title: "Welcome to MetsXMFanZone",
      description: "Connect with thousands of passionate Mets fans. Share your thoughts, predictions, and game reactions the all new Live Home for Mets Fans",
      image: heroImage
    },
    {
      title: "Live Game Coverage",
      description: "Watch exclusive live streams, game highlights, and expert analysis. Never miss a moment of Mets action",
      image: heroImage
    },
    {
      title: "Premium Content",
      description: "Access exclusive podcasts, behind-the-scenes content, and premium features with your membership",
      image: heroImage
    }
  ];

  return (
    <section className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[380px] lg:min-h-[420px] overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {slides.map((slide, index) => (
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
                      className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 lg:w-24 lg:h-24 object-contain animate-scale-in" 
                    />
                  </div>
                  <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-bold text-primary mb-2 sm:mb-3 animate-fade-in px-2 leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-foreground/90 mb-4 sm:mb-5 max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-4 leading-relaxed">
                    {slide.description}
                  </p>
                  
                  <div className="flex items-center justify-center px-4">
                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border-2 border-primary/80 rounded-lg bg-background/60 backdrop-blur-md hover-lift">
                      <span className="text-[11px] sm:text-xs md:text-sm text-foreground text-center leading-snug">
                        ⚡ Start your <span className="text-primary font-bold">7-day FREE trial</span> for unlimited access
                      </span>
                    </div>
                  </div>
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
