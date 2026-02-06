import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "strong" | "interactive";
  hover?: boolean;
  glow?: "none" | "blue" | "orange";
  delay?: number; // kept for API compatibility but not used
}

const GlassCard = ({ 
  children, 
  className, 
  variant = "default",
  hover = true,
  glow = "none",
}: GlassCardProps) => {
  const variants = {
    default: "glass-card glow-blue",
    subtle: "glass-light glow-blue",
    strong: "glass-strong glow-blue-strong",
    interactive: "glass-card glow-blue",
  };
  
  const glowStyles = {
    none: "",
    blue: "glow-blue",
    orange: "glow-orange",
  };

  return (
    <div
      className={cn(
        "rounded-2xl overflow-hidden transition-transform duration-300",
        hover && "hover:-translate-y-1",
        variants[variant],
        glowStyles[glow],
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
