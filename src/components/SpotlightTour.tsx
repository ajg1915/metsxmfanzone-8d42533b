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
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    if (steps.length > 0 && isOpen) {
      setIsAnimating(true);
      scrollToTarget(steps[currentStep]);
      
      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 300);
      
      return () => clearTimeout(timeout);
    }
  }, [currentStep, steps, isOpen, scrollToTarget]);

  const handleNext = () => {
    if (isAnimating) return;
    if (currentStep === steps.length - 1) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (isAnimating || currentStep === 0) return;
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = () => {
    setIsOpen(false);
    onComplete();
  };

  if (loading || steps.length === 0 || !isOpen) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3 sm:p-4">
      {/* Clickable backdrop to close */}
      <div 
        className="absolute inset-0 bg-black/70 cursor-pointer"
        onClick={handleComplete}
      />

      {/* Compact card */}
      <div
        className={cn(
          "relative w-full max-w-sm bg-card rounded-2xl shadow-xl overflow-hidden transition-all duration-300 mb-safe",
          isAnimating ? "scale-95 opacity-80" : "scale-100 opacity-100"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bar */}
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleComplete}
          className="absolute right-2 top-2 w-8 h-8 rounded-full bg-muted/80 hover:bg-destructive hover:text-white flex items-center justify-center transition-colors z-10"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="p-4">
          {/* Step counter */}
          <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="font-medium">{currentStep + 1} / {steps.length}</span>
          </div>

          {/* Title */}
          <h3 
            className={cn(
              "text-base font-bold text-foreground mb-2 pr-6 transition-all duration-200",
              isAnimating ? "opacity-0" : "opacity-100"
            )}
          >
            {step.title}
          </h3>

          {/* Description */}
          <p 
            className={cn(
              "text-sm text-muted-foreground leading-relaxed mb-4 transition-all duration-200",
              isAnimating ? "opacity-0" : "opacity-100"
            )}
          >
            {step.description}
          </p>

          {/* Dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => !isAnimating && setCurrentStep(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200",
                  index === currentStep 
                    ? "bg-primary w-6" 
                    : "bg-muted w-1.5 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                disabled={isAnimating}
                className="h-9 px-3"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              disabled={isAnimating}
              className="flex-1 h-9"
            >
              {currentStep === steps.length - 1 ? "Done" : "Next"}
              {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpotlightTour;