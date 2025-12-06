import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionScrollIndicatorProps {
  className?: string;
}

const SectionScrollIndicator = ({ className }: SectionScrollIndicatorProps) => {
  return (
    <div className={cn("flex justify-center py-3", className)}>
      <div className="flex flex-col items-center gap-1.5 animate-gentle-bounce">
        <div className="rounded-full bg-primary/10 border border-primary/30 p-1.5 shadow-sm">
          <ChevronDown className="w-5 h-5 text-primary" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          Scroll
        </span>
      </div>
    </div>
  );
};

export default SectionScrollIndicator;
