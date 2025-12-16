import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
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
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
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
      }
    } catch (error) {
      console.error("Error fetching tour steps:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateTargetPosition = useCallback(() => {
    if (steps.length === 0) return;
    
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
      const tooltipHeight = 200;
      const tooltipWidth = 320;
      
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
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
      setTooltipPosition({
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        placement: 'center'
      });
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateTargetPosition();
    
    // Update on resize/scroll
    window.addEventListener('resize', updateTargetPosition);
    window.addEventListener('scroll', updateTargetPosition);
    
    return () => {
      window.removeEventListener('resize', updateTargetPosition);
      window.removeEventListener('scroll', updateTargetPosition);
    };
  }, [updateTargetPosition]);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    sessionStorage.setItem('spotlightTourDismissed', 'true');
    onComplete();
  };

  if (loading || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const spotlightPadding = 8;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="spotlight-mask">
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {targetRect && (
              <rect
                x={targetRect.left - spotlightPadding}
                y={targetRect.top - spotlightPadding}
                width={targetRect.width + spotlightPadding * 2}
                height={targetRect.height + spotlightPadding * 2}
                rx="8"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.75)"
          mask="url(#spotlight-mask)"
          style={{ pointerEvents: 'auto' }}
          onClick={handleComplete}
        />
      </svg>

      {/* Spotlight border glow */}
      {targetRect && (
        <div
          className="absolute border-2 border-primary rounded-lg shadow-[0_0_0_4px_rgba(var(--primary),0.3)] animate-pulse pointer-events-none"
          style={{
            left: targetRect.left - spotlightPadding,
            top: targetRect.top - spotlightPadding,
            width: targetRect.width + spotlightPadding * 2,
            height: targetRect.height + spotlightPadding * 2,
          }}
        />
      )}

      {/* Tooltip */}
      <div
        className={cn(
          "absolute bg-card border border-border rounded-lg shadow-2xl p-4 w-80 max-w-[90vw] z-10",
          tooltipPosition.placement === 'center' && "-translate-x-1/2 -translate-y-1/2"
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute -right-2 -top-2 h-7 w-7 rounded-full bg-background border shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            handleComplete();
          }}
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Arrow pointer */}
        {targetRect && tooltipPosition.placement === 'bottom' && (
          <div 
            className="absolute -top-2 w-4 h-4 bg-card border-l border-t border-border rotate-45"
            style={{ left: 'calc(50% - 8px)' }}
          />
        )}
        {targetRect && tooltipPosition.placement === 'top' && (
          <div 
            className="absolute -bottom-2 w-4 h-4 bg-card border-r border-b border-border rotate-45"
            style={{ left: 'calc(50% - 8px)' }}
          />
        )}

        {/* Step counter */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">
            Step {currentStep + 1} of {steps.length}
          </span>
          <div className="flex gap-1">
            {steps.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-all",
                  index === currentStep ? "bg-primary w-4" : 
                  index < currentStep ? "bg-primary/60" : "bg-muted"
                )}
              />
            ))}
          </div>
        </div>

        {/* Content */}
        <h3 className="text-base font-semibold text-primary mb-1">{step.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{step.description}</p>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            size="sm"
            onClick={handleNext}
            className="flex-1"
          >
            {currentStep === steps.length - 1 ? (
              <>
                <span>Got it!</span>
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
        <div className="text-center mt-2">
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
