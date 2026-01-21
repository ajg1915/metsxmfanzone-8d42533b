import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "corner" | "inline";
}

const PremiumBadge = ({ 
  className, 
  size = "sm",
  variant = "default" 
}: PremiumBadgeProps) => {
  const sizeClasses = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-2.5 py-1 gap-1.5",
    lg: "text-sm px-3 py-1.5 gap-2"
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-3.5 h-3.5",
    lg: "w-4 h-4"
  };

  const positionClasses = {
    default: "",
    corner: "absolute top-2 right-2 z-10",
    inline: "inline-flex"
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex items-center font-bold uppercase tracking-wider rounded-full",
        "bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500",
        "text-white shadow-lg",
        sizeClasses[size],
        positionClasses[variant],
        className
      )}
      style={{
        boxShadow: "0 0 15px rgba(255, 69, 0, 0.5), 0 0 30px rgba(255, 69, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)"
      }}
    >
      <motion.div
        animate={{ 
          rotate: [0, -10, 10, -5, 5, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2, 
          repeat: Infinity, 
          repeatDelay: 3,
          ease: "easeInOut"
        }}
      >
        <Crown className={iconSizes[size]} />
      </motion.div>
      <span>PRO</span>
      
      {/* Animated glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-500 -z-10"
        animate={{
          opacity: [0.5, 0.8, 0.5],
          scale: [1, 1.1, 1]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          filter: "blur(8px)"
        }}
      />
    </motion.div>
  );
};

export default PremiumBadge;
