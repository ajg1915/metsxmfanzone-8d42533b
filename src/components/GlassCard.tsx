import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "strong" | "interactive";
  hover?: boolean;
  glow?: "none" | "blue" | "orange";
  delay?: number;
}

const GlassCard = ({ 
  children, 
  className, 
  variant = "default",
  hover = true,
  glow = "none",
  delay = 0,
}: GlassCardProps) => {
  const variants = {
    default: "glass-card glow-blue",
    subtle: "glass-light glow-blue",
    strong: "glass-strong glow-blue-strong",
    interactive: "glass-card hover-lift glow-blue",
  };
  
  const glowStyles = {
    none: "",
    blue: "glow-blue",
    orange: "glow-orange",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ 
        duration: 0.6, 
        delay,
        ease: [0.16, 1, 0.3, 1] 
      }}
      whileHover={hover ? { 
        y: -4,
        transition: { duration: 0.3 }
      } : undefined}
      className={cn(
        "rounded-2xl overflow-hidden",
        variants[variant],
        glowStyles[glow],
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default GlassCard;
