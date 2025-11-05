import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import heroImage from "@/assets/hero-mets.png";

const Hero = () => {
  return (
    <section className="relative min-h-[350px] sm:min-h-[400px] md:min-h-[450px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-8 sm:py-12 md:py-16">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-3 sm:mb-4 animate-fade-in">
          Welcome to MetsXMFanZone
        </h1>
        <p className="text-sm sm:text-base md:text-lg text-foreground mb-4 sm:mb-6 max-w-2xl mx-auto px-4">
          Connect with thousands of passionate Mets fans. Share your thoughts, predictions, 
          and game reactions the all new Live Home for Mets Fans
        </p>
        
        <div className="flex items-center justify-center px-4">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 border-2 border-primary rounded-md bg-background/50 backdrop-blur-sm max-w-full">
            <span className="text-xs text-foreground text-center">
              ⚡ Start your <span className="text-primary font-semibold">7-day FREE trial</span> for unlimited access. Then $12.99/month
            </span>
          </div>
        </div>

        <div className="flex gap-2 justify-center mt-4">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <div className="w-2 h-2 rounded-full bg-muted"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
