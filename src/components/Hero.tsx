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
    <section className="relative min-h-[300px] sm:min-h-[350px] md:min-h-[400px] overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div key={index} className="flex-[0_0_100%] min-w-0 relative">
              <div className="relative min-h-[300px] sm:min-h-[350px] md:min-h-[400px] flex items-center justify-center">
                <div 
                  className="absolute inset-0 bg-cover bg-center z-0"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background"></div>
                </div>
                
                <div className="container mx-auto px-3 sm:px-6 lg:px-8 relative z-10 text-center py-6 sm:py-10 md:py-14 max-w-7xl">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <img src={logo} alt="MetsXMFanZone" className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain" />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2 sm:mb-3 animate-fade-in px-2">
                    {slide.title}
                  </h1>
                  <p className="text-xs sm:text-sm md:text-base text-foreground mb-3 sm:mb-5 max-w-2xl mx-auto px-2">
                    {slide.description}
                  </p>
                  
                  <div className="flex items-center justify-center px-2">
                    <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 border-2 border-primary rounded-md bg-background/50 backdrop-blur-sm max-w-full">
                      <span className="text-[10px] sm:text-xs text-foreground text-center leading-tight">
                        ⚡ Start your <span className="text-primary font-semibold">7-day FREE trial</span> for unlimited access. Then $12.99/month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              selectedIndex === index ? "bg-primary w-6" : "bg-muted hover:bg-muted-foreground"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
