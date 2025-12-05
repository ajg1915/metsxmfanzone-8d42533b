import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SectionScrollIndicatorProps {
  className?: string;
}

const SectionScrollIndicator = ({ className }: SectionScrollIndicatorProps) => {
  return (
    <div className={cn("flex justify-center py-2 md:hidden", className)}>
      <div className="flex flex-col items-center gap-1 animate-bounce">
        <div className="rounded-full bg-primary/10 border border-primary/40 p-2 shadow-md shadow-primary/30">
          <ChevronDown className="w-10 h-10 text-primary" />
        </div>
        <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
          Scroll
        </span>
      </div>
    </div>
  );
};

export default SectionScrollIndicator;
