import { Button } from "@/components/ui/button";
import { Play, Info } from "lucide-react";
import heroImage from "@/assets/hero-stadium.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/80 to-background"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10 text-center py-20">
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 animate-fade-in">
          Join the Community
        </h1>
        <p className="text-lg md:text-xl text-foreground mb-8 max-w-3xl mx-auto">
          Connect with thousands of passionate Mets fans. Share your thoughts, predictions, 
          and game reactions the all new Live Home for Mets Fans
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button size="lg" className="gap-2">
            <Play className="w-5 h-5" />
            Join Community
          </Button>
          <Button size="lg" variant="outline" className="gap-2">
            <Info className="w-5 h-5" />
            More Info
          </Button>
        </div>

        <div className="inline-flex items-center gap-2 px-6 py-3 border-2 border-primary rounded-md bg-background/50 backdrop-blur-sm">
          <span className="text-sm text-foreground">
            ⚡ Start your <span className="text-primary font-semibold">7-day FREE trial</span> for unlimited access. Then $12.99/month
          </span>
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
