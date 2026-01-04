import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface BackButtonProps {
  fallbackPath?: string;
  className?: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "lg" | "icon";
  showLabel?: boolean;
}

export function BackButton({ 
  fallbackPath = "/", 
  className = "",
  variant = "ghost",
  size = "sm",
  showLabel = true
}: BackButtonProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleGoBack = () => {
    // Check if there's history to go back to
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      // Fallback to a default path
      navigate(fallbackPath);
    }
  };

  // Don't show on home page
  if (location.pathname === "/" || location.pathname === "/admin") {
    return null;
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleGoBack}
      className={`gap-1.5 ${className}`}
    >
      <ArrowLeft className="h-4 w-4" />
      {showLabel && <span className="hidden sm:inline">Back</span>}
    </Button>
  );
}
