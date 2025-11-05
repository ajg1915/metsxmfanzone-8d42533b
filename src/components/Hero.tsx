import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import heroImage from "@/assets/hero-stadium.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[400px] sm:min-h-[500px] md:min-h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background"></div>
      </div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center py-12 sm:py-16 md:py-20">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary mb-4 sm:mb-6 animate-fade-in">
          Join the Community
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-foreground mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
          Connect with thousands of passionate Mets fans. Share your thoughts, predictions, 
          and game reactions the all new Live Home for Mets Fans
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-6 sm:mb-8 px-4">
          <Button size="lg" className="gap-2 w-full sm:w-auto">
            <Play className="w-4 h-4 sm:w-5 sm:h-5" />
            Join Community
          </Button>
          <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
            More Info
          </Button>
        </div>

        <div className="flex items-center justify-center px-4">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-3 border-2 border-primary rounded-md bg-background/50 backdrop-blur-sm max-w-full">
            <span className="text-xs sm:text-sm text-foreground text-center">
              ⚡ Start your <span className="text-primary font-semibold">7-day FREE trial</span> for unlimited access. Then $12.99/month
            </span>
          </div>
        </div>

        <div className="flex gap-2 justify-center mt-6">
          <div className="w-2 h-2 rounded-full bg-primary"></div>
          <div className="w-2 h-2 rounded-full bg-muted"></div>
          <div className="w-2 h-2 rounded-full bg-muted"></div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
