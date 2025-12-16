import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Sparkles, Rocket, PartyPopper } from "lucide-react";
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

  useEffect(() => {
    if (steps.length > 0 && isOpen) {
      setIsAnimating(true);
      scrollToTarget(steps[currentStep]);
      
      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, 400);
      
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
    sessionStorage.setItem('spotlightTourDismissed', 'true');
    setIsOpen(false);
    onComplete();
  };

  if (loading || steps.length === 0 || !isOpen) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-black/90 via-primary/20 to-black/90 backdrop-blur-sm animate-fade-in"
        onClick={handleComplete}
      />
      
      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-primary/30 rounded-full animate-pulse"
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.3}s`,
              animationDuration: '3s'
            }}
          />
        ))}
      </div>

      {/* Main card */}
      <div
        className={cn(
          "relative w-full max-w-lg bg-gradient-to-b from-card to-card/95 rounded-3xl shadow-2xl overflow-hidden transition-all duration-500",
          isAnimating ? "scale-95 opacity-80" : "scale-100 opacity-100"
        )}
        style={{
          boxShadow: '0 0 60px hsl(var(--primary) / 0.3), 0 25px 50px -12px rgba(0, 0, 0, 0.6)'
        }}
      >
        {/* Top gradient accent */}
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-mets-blue via-primary to-mets-orange" />
        
        {/* Progress bar */}
        <div className="absolute inset-x-0 top-1.5 h-1 bg-muted/30">
          <div 
            className="h-full bg-gradient-to-r from-primary to-mets-orange transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Close button */}
        <button
          onClick={handleComplete}
          className="absolute right-4 top-4 w-10 h-10 rounded-full bg-muted/50 hover:bg-destructive hover:text-destructive-foreground flex items-center justify-center transition-all duration-200 z-20 backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content area */}
        <div className="pt-8 pb-6 px-6">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex items-center gap-1 bg-primary/10 px-4 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-mets-orange" />
              <span className="text-sm font-bold text-primary">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
          </div>

          {/* Image area */}
          {step.image_url && (
            <div className={cn(
              "relative mb-6 rounded-2xl overflow-hidden bg-muted/20 aspect-video transition-all duration-400",
              isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            )}>
              <img 
                src={step.image_url} 
                alt={step.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>
          )}

          {/* Title with icon */}
          <div className={cn(
            "flex items-start gap-3 mb-4 transition-all duration-400",
            isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
          )}
          style={{ transitionDelay: '100ms' }}
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-mets-orange flex items-center justify-center flex-shrink-0 shadow-lg">
              {isFirstStep ? (
                <Rocket className="w-6 h-6 text-white" />
              ) : isLastStep ? (
                <PartyPopper className="w-6 h-6 text-white" />
              ) : (
                <span className="text-xl font-bold text-white">{currentStep + 1}</span>
              )}
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                {step.title}
              </h2>
            </div>
          </div>

          {/* Description */}
          <p 
            className={cn(
              "text-muted-foreground text-base sm:text-lg leading-relaxed mb-8 transition-all duration-400",
              isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
            )}
            style={{ transitionDelay: '200ms' }}
          >
            {step.description}
          </p>

          {/* Step dots */}
          <div className="flex justify-center gap-2 mb-6">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => !isAnimating && setCurrentStep(index)}
                className={cn(
                  "h-2.5 rounded-full transition-all duration-300 hover:scale-110",
                  index === currentStep 
                    ? "bg-primary w-10" 
                    : index < currentStep 
                      ? "bg-primary/50 w-2.5" 
                      : "bg-muted w-2.5 hover:bg-muted-foreground/40"
                )}
              />
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstStep || isAnimating}
              className="flex-1 h-12 text-base font-semibold rounded-xl border-2 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isAnimating}
              className={cn(
                "flex-1 h-12 text-base font-semibold rounded-xl transition-all",
                isLastStep 
                  ? "bg-gradient-to-r from-mets-orange to-primary hover:opacity-90" 
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              {isLastStep ? (
                <>
                  Get Started
                  <PartyPopper className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-5 h-5 ml-1" />
                </>
              )}
            </Button>
          </div>

          {/* Skip option */}
          <button
            onClick={handleComplete}
            className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
};

export default SpotlightTour;