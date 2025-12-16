import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Sparkles, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface TourStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  target_selector?: string | null;
  image_url?: string | null;
}

interface SpotlightTourProps {
  onComplete: () => void;
  previewMode?: boolean;
  previewSteps?: TourStep[];
}

const SpotlightTour = ({ onComplete, previewMode = false, previewSteps = [] }: SpotlightTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<TourStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number; placement: string }>({ 
    top: 0, 
    left: 0, 
    placement: 'bottom' 
  });

  useEffect(() => {
    const sessionDismissed = sessionStorage.getItem('spotlightTourDismissed');
    
    if (sessionDismissed === 'true' && !previewMode) {
      setLoading(false);
      return;
    }

    if (previewMode && previewSteps.length > 0) {
      setSteps(previewSteps);
      setIsOpen(true);
      setLoading(false);
    } else {
      fetchSteps();
    }
  }, [previewMode, previewSteps]);

  const fetchSteps = async () => {
    try {
      const { data, error } = await supabase
        .from("tutorial_steps")
        .select("*")
        .eq("is_active", true)
        .order("step_number", { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        setSteps(data as TourStep[]);
        setIsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching tour steps:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTargetPosition = useCallback(() => {
    if (steps.length === 0 || isTransitioning) return;
    
    const step = steps[currentStep];
    if (!step?.target_selector) {
      setTargetRect(null);
      // Center tooltip when no target
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        placement: 'center'
      });
      return;
    }

    const element = document.querySelector(step.target_selector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);
      
      // Calculate tooltip position
      const padding = 16;
      const tooltipHeight = 220;
      const tooltipWidth = Math.min(340, window.innerWidth - 32);
      
      let top = rect.bottom + padding;
      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      let placement = 'bottom';
      
      // Check if tooltip would go off screen bottom
      if (top + tooltipHeight > window.innerHeight - padding) {
        top = rect.top - tooltipHeight - padding;
        placement = 'top';
      }
      
      // Keep tooltip within horizontal bounds
      left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));
      
      setTooltipPosition({ top, left, placement });
    } else {
      setTargetRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        placement: 'center'
      });
    }
  }, [currentStep, steps, isTransitioning]);

  // Smooth scroll to target element
  const scrollToTarget = useCallback((step: TourStep) => {
    if (!step?.target_selector) return;
    
    const element = document.querySelector(step.target_selector);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center',
        inline: 'center'
      });
    }
  }, []);

  useEffect(() => {
    if (steps.length > 0 && isOpen) {
      setIsTransitioning(true);
      
      // Scroll to target
      scrollToTarget(steps[currentStep]);
      
      // Wait for scroll to complete before updating position
      const scrollTimeout = setTimeout(() => {
        updateTargetPosition();
        setIsTransitioning(false);
      }, 600);
      
      return () => clearTimeout(scrollTimeout);
    }
  }, [currentStep, steps, isOpen, scrollToTarget, updateTargetPosition]);

  useEffect(() => {
    if (!isTransitioning) {
      // Update on resize/scroll
      window.addEventListener('resize', updateTargetPosition);
      window.addEventListener('scroll', updateTargetPosition, { passive: true });
      
      return () => {
        window.removeEventListener('resize', updateTargetPosition);
        window.removeEventListener('scroll', updateTargetPosition);
      };
    }
  }, [updateTargetPosition, isTransitioning]);

  const handleNext = () => {
    if (isTransitioning) return;
    
    if (currentStep === steps.length - 1) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (isTransitioning || currentStep === 0) return;
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = () => {
    sessionStorage.setItem('spotlightTourDismissed', 'true');
    setIsOpen(false);
    onComplete();
  };

  if (loading || steps.length === 0 || !isOpen) {
    return null;
  }

  const step = steps[currentStep];
  const spotlightPadding = 12;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Animated overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && !isTransitioning && (
              <rect
                x={targetRect.left - spotlightPadding}
                y={targetRect.top - spotlightPadding}
                width={targetRect.width + spotlightPadding * 2}
                height={targetRect.height + spotlightPadding * 2}
                rx="12"
                fill="black"
                className="transition-all duration-500 ease-out"
              />
            )}
          </mask>
          {/* Gradient for more dramatic effect */}
          <radialGradient id="spotlight-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,0,0,0.6)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
          </radialGradient>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="url(#spotlight-gradient)"
          mask="url(#spotlight-mask)"
          style={{ pointerEvents: 'auto' }}
          onClick={handleComplete}
          className="transition-opacity duration-300"
        />
      </svg>

      {/* Animated spotlight border with glow */}
      {targetRect && !isTransitioning && (
        <div
          className="absolute border-2 border-primary rounded-xl pointer-events-none transition-all duration-500 ease-out"
          style={{
            left: targetRect.left - spotlightPadding,
            top: targetRect.top - spotlightPadding,
            width: targetRect.width + spotlightPadding * 2,
            height: targetRect.height + spotlightPadding * 2,
            boxShadow: `
              0 0 0 4px hsl(var(--primary) / 0.2),
              0 0 20px 8px hsl(var(--primary) / 0.3),
              inset 0 0 20px hsl(var(--primary) / 0.1)
            `,
          }}
        >
          {/* Animated pulse ring */}
          <div className="absolute inset-0 rounded-xl border-2 border-primary/50 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
      )}

      {/* "NEW" badge indicator */}
      {targetRect && !isTransitioning && (
        <div 
          className="absolute flex items-center gap-1 bg-mets-orange text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg transition-all duration-500 ease-out animate-bounce"
          style={{
            left: targetRect.left + targetRect.width - 20,
            top: targetRect.top - spotlightPadding - 12,
            animationDuration: '2s'
          }}
        >
          <Star className="w-3 h-3 fill-current" />
          NEW
        </div>
      )}

      {/* Tooltip with smooth transitions */}
      <div
        className={cn(
          "absolute bg-card/95 backdrop-blur-md border border-primary/30 rounded-xl shadow-2xl p-5 z-10 transition-all duration-500 ease-out",
          tooltipPosition.placement === 'center' && "-translate-x-1/2 -translate-y-1/2",
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
          width: Math.min(340, window.innerWidth - 32),
          maxWidth: '90vw',
        }}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-background border border-border shadow-md hover:bg-destructive hover:text-destructive-foreground transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleComplete();
          }}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Arrow pointer */}
        {targetRect && !isTransitioning && tooltipPosition.placement === 'bottom' && (
          <div 
            className="absolute -top-2 w-4 h-4 bg-card/95 border-l border-t border-primary/30 rotate-45 transition-all duration-500"
            style={{ left: 'calc(50% - 8px)' }}
          />
        )}
        {targetRect && !isTransitioning && tooltipPosition.placement === 'top' && (
          <div 
            className="absolute -bottom-2 w-4 h-4 bg-card/95 border-r border-b border-primary/30 rotate-45 transition-all duration-500"
            style={{ left: 'calc(50% - 8px)' }}
          />
        )}

        {/* Step counter with animated progress */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">{currentStep + 1}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              of {steps.length} features
            </span>
          </div>
          <div className="flex gap-1.5">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => !isTransitioning && setCurrentStep(index)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  index === currentStep 
                    ? "bg-primary w-6" 
                    : index < currentStep 
                      ? "bg-primary/60 w-2 hover:bg-primary/80" 
                      : "bg-muted w-2 hover:bg-muted-foreground"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content with fade animation */}
        <div className={cn(
          "transition-all duration-300",
          isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
        )}>
          <h3 className="text-lg font-bold text-primary mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-mets-orange" />
            {step.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
            {step.description}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isTransitioning}
            className="flex-1 h-10"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            disabled={isTransitioning}
            className="flex-1 h-10 bg-primary hover:bg-primary/90"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <span>Let's Go!</span>
                <Sparkles className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                <span>Next</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>

        {/* Skip link */}
        <div className="text-center mt-3">
          <Button
            variant="link"
            onClick={handleComplete}
            className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
          >
            Skip tour
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SpotlightTour;
