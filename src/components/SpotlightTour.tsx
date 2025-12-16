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
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Track window size
  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

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

  const updateTargetPosition = useCallback(() => {
    if (steps.length === 0) return;
    
    const step = steps[currentStep];
    if (!step?.target_selector) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.target_selector);
    if (element) {
      setTargetRect(element.getBoundingClientRect());
    } else {
      setTargetRect(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    if (steps.length > 0 && isOpen) {
      setIsTransitioning(true);
      scrollToTarget(steps[currentStep]);
      
      const timeout = setTimeout(() => {
        updateTargetPosition();
        setIsTransitioning(false);
      }, 500);
      
      return () => clearTimeout(timeout);
    }
  }, [currentStep, steps, isOpen, scrollToTarget, updateTargetPosition]);

  useEffect(() => {
    if (!isTransitioning && isOpen) {
      window.addEventListener('scroll', updateTargetPosition, { passive: true });
      return () => window.removeEventListener('scroll', updateTargetPosition);
    }
  }, [updateTargetPosition, isTransitioning, isOpen]);

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

  if (loading || steps.length === 0 || !isOpen || windowSize.width === 0) {
    return null;
  }

  const step = steps[currentStep];
  const isMobile = windowSize.width < 640;
  const spotlightPadding = isMobile ? 8 : 12;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Dark overlay */}
      <div 
        className="absolute inset-0 bg-black/80 transition-opacity duration-300"
        onClick={handleComplete}
      />

      {/* Spotlight highlight on target */}
      {targetRect && !isTransitioning && (
        <>
          {/* Glowing border around target */}
          <div
            className="absolute pointer-events-none transition-all duration-500 ease-out rounded-lg"
            style={{
              left: targetRect.left - spotlightPadding,
              top: targetRect.top - spotlightPadding,
              width: targetRect.width + spotlightPadding * 2,
              height: targetRect.height + spotlightPadding * 2,
              boxShadow: `
                0 0 0 3px hsl(var(--primary)),
                0 0 0 6px hsl(var(--primary) / 0.3),
                0 0 30px 10px hsl(var(--primary) / 0.4),
                inset 0 0 0 9999px transparent
              `,
              background: 'transparent',
            }}
          />
          
          {/* "NEW" badge */}
          <div 
            className="absolute flex items-center gap-1 bg-mets-orange text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10 animate-bounce"
            style={{
              left: Math.min(targetRect.right - 30, windowSize.width - 60),
              top: targetRect.top - 20,
              animationDuration: '2s'
            }}
          >
            <Star className="w-3 h-3 fill-current" />
            NEW
          </div>
        </>
      )}

      {/* Tooltip Card - Fixed position at bottom on mobile, floating on desktop */}
      <div
        className={cn(
          "fixed bg-card border-2 border-primary/50 rounded-2xl shadow-2xl transition-all duration-500 ease-out z-10",
          isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100",
          isMobile 
            ? "left-3 right-3 bottom-3" 
            : "left-1/2 -translate-x-1/2 bottom-6 w-full max-w-md"
        )}
        style={{
          boxShadow: '0 0 40px hsl(var(--primary) / 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        {/* Gradient top border */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-mets-orange to-primary rounded-t-2xl" />
        
        <div className="p-4 sm:p-5">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 h-8 w-8 rounded-full bg-background/80 border border-border hover:bg-destructive hover:text-destructive-foreground transition-colors z-20"
            onClick={(e) => {
              e.stopPropagation();
              handleComplete();
            }}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Step counter and progress */}
          <div className="flex items-center justify-between mb-4 pr-8">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-primary-foreground">{currentStep + 1}</span>
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                of {steps.length}
              </span>
            </div>
            
            {/* Progress dots */}
            <div className="flex gap-1.5">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isTransitioning && setCurrentStep(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    index === currentStep 
                      ? "bg-primary w-8" 
                      : index < currentStep 
                        ? "bg-primary/60 w-2.5 hover:bg-primary/80" 
                        : "bg-muted w-2.5 hover:bg-muted-foreground/50"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className={cn(
            "transition-all duration-300 mb-4",
            isTransitioning ? "opacity-0 translate-y-2" : "opacity-100 translate-y-0"
          )}>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-mets-orange flex-shrink-0" />
              <span className="line-clamp-2">{step.title}</span>
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              {step.description}
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0 || isTransitioning}
              className="flex-1 h-11 text-sm font-medium"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isTransitioning}
              className="flex-1 h-11 text-sm font-medium bg-primary hover:bg-primary/90"
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
            <button
              onClick={handleComplete}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors underline-offset-2 hover:underline"
            >
              Skip tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightTour;