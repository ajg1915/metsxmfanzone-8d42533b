import React from "react";
import { useTVFocusable } from "@/hooks/use-tv-navigation";
import { cn } from "@/lib/utils";

interface FocusableCardProps {
  id: string;
  row?: number;
  col?: number;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function FocusableCard({ 
  id, 
  row, 
  col, 
  children, 
  className,
  onClick 
}: FocusableCardProps) {
  const { ref, isFocused, tabIndex, onFocus } = useTVFocusable(id, row, col);

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      tabIndex={tabIndex}
      onFocus={onFocus}
      onClick={onClick}
      className={cn(
        "outline-none transition-all duration-300 cursor-pointer",
        isFocused && "tv-focus-ring scale-105 z-10",
        className
      )}
    >
      {children}
    </div>
  );
}
