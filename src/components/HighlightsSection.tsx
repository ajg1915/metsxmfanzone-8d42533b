import { Play } from "lucide-react";
import { cn } from "@/lib/utils";
import highlightImage from "@/assets/highlight-1.jpg";

interface HighlightsSectionProps {
  className?: string;
}

const HighlightsSection = ({ className }: HighlightsSectionProps) => {
  return (
    <section className={cn("hidden lg:block container mx-auto px-4", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Play className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-bold">Highlights</h2>
      </div>
      
      <div className="relative aspect-video rounded-lg overflow-hidden border border-border/50 bg-muted">
        <img 
          src={highlightImage}
          alt="Mets Highlights"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <Play className="w-8 h-8 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
        
        {/* Title overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          <p className="text-lg font-semibold text-foreground">Latest Mets Highlights</p>
          <p className="text-sm text-muted-foreground">Watch the best plays and moments</p>
        </div>
      </div>
    </section>
  );
};

export default HighlightsSection;
