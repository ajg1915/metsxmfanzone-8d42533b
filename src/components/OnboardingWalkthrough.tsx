import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Sparkles, Zap, Trophy, Play } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-stadium.jpg";
import { Progress } from "@/components/ui/progress";

interface OnboardingStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  image_url?: string;
}

interface OnboardingWalkthroughProps {
  onComplete: () => void;
  previewMode?: boolean;
  previewSteps?: OnboardingStep[];
}

const stepIcons = [Sparkles, Zap, Trophy, Play];

const OnboardingWalkthrough = ({ onComplete, previewMode = false, previewSteps = [] }: OnboardingWalkthroughProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const sessionDismissed = sessionStorage.getItem('tutorialDismissed');
    
    if (sessionDismissed === 'true') {
      setLoading(false);
      return;
    }

    if (previewMode && previewSteps.length > 0) {
      setSteps(previewSteps);
      setOpen(true);
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
        setSteps(data as OnboardingStep[]);
        setOpen(true);
      } else {
        console.log("No active tutorial steps found in database");
      }
    } catch (error) {
      console.error("Error fetching tutorial steps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
      setIsAnimating(false);
    }, 150);
  };

  const handlePrevious = () => {
    if (isAnimating || currentStep === 0) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }, 150);
  };

  const handleComplete = () => {
    sessionStorage.setItem('tutorialDismissed', 'true');
    setOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    sessionStorage.setItem('tutorialDismissed', 'true');
    setOpen(false);
    onComplete();
  };

  if (loading || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const StepIcon = stepIcons[currentStep % stepIcons.length];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg p-0 gap-0 overflow-hidden border-2 border-primary/50">
        <div className="relative">
          {/* Progress bar at top */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <Progress value={progress} className="h-1 rounded-none bg-muted" />
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-4 z-10 bg-background/80 hover:bg-background h-8 w-8"
            onClick={handleSkip}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Image section with overlay */}
          <div className="relative aspect-[16/10] sm:aspect-video overflow-hidden">
            <img 
              src={step.image_url || heroImage} 
              alt={step.title}
              className={`w-full h-full object-cover transition-all duration-300 ${isAnimating ? 'scale-105 opacity-80' : 'scale-100 opacity-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
            
            {/* Floating icon badge */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary flex items-center justify-center shadow-lg animate-fade-in">
              <StepIcon className="w-6 h-6 sm:w-7 sm:h-7 text-primary-foreground" />
            </div>
          </div>

          {/* Content section */}
          <div className="p-4 sm:p-6 space-y-4">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <span className="font-medium text-primary">{currentStep + 1}</span>
              <span>/</span>
              <span>{steps.length}</span>
            </div>

            {/* Title and description */}
            <div className={`text-center space-y-2 transition-all duration-300 ${isAnimating ? 'opacity-50 translate-y-2' : 'opacity-100 translate-y-0'}`}>
              <h2 className="text-lg sm:text-xl font-bold text-primary">
                {step.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {step.description}
              </p>
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 py-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isAnimating && setCurrentStep(index)}
                  className={`transition-all duration-300 rounded-full ${
                    index === currentStep 
                      ? 'w-6 h-2 bg-primary' 
                      : index < currentStep
                        ? 'w-2 h-2 bg-primary/60'
                        : 'w-2 h-2 bg-muted hover:bg-muted-foreground'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isAnimating}
                className="flex-1 gap-2"
                size="sm"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back</span>
              </Button>

              <Button
                onClick={handleNext}
                disabled={isAnimating}
                className="flex-1 gap-2"
                size="sm"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <span>Get Started</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip link */}
            <div className="text-center">
              <Button
                variant="link"
                onClick={handleSkip}
                className="text-xs text-muted-foreground hover:text-foreground"
                size="sm"
              >
                Skip tutorial
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWalkthrough;
