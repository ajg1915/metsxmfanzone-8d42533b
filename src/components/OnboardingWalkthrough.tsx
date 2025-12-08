import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-stadium.jpg";
import logoIcon from "@/assets/metsxmfanzone-logo.png";
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
    if (currentStep === steps.length - 1) {
      // Last step - close immediately
      handleComplete();
      return;
    }
    
    if (isAnimating) return;
    setIsAnimating(true);
    
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
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
    onComplete();
    setOpen(false);
  };

  const handleSkip = () => {
    sessionStorage.setItem('tutorialDismissed', 'true');
    onComplete();
    setOpen(false);
  };

  if (loading || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[90vw] sm:max-w-sm p-0 gap-0 overflow-hidden border border-primary/30 rounded-lg">
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <Progress value={progress} className="h-0.5 rounded-none bg-muted" />
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-2 z-10 bg-background/80 hover:bg-background h-6 w-6"
            onClick={handleSkip}
          >
            <X className="w-3 h-3" />
          </Button>

          {/* Image section */}
          <div className="relative aspect-[16/9] overflow-hidden">
            <img 
              src={step.image_url || heroImage} 
              alt={step.title}
              className={`w-full h-full object-cover transition-all duration-200 ${isAnimating ? 'scale-105 opacity-80' : 'scale-100 opacity-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            
            {/* Logo badge */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-md overflow-hidden">
              <img src={logoIcon} alt="MetsXMFanZone" className="w-7 h-7 object-contain" />
            </div>
          </div>

          {/* Content */}
          <div className="p-3 space-y-2">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
              <span className="font-medium text-primary">{currentStep + 1}</span>
              <span>/</span>
              <span>{steps.length}</span>
            </div>

            {/* Title and description */}
            <div className={`text-center space-y-1 transition-all duration-200 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
              <h2 className="text-sm font-semibold text-primary">
                {step.title}
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                {step.description}
              </p>
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isAnimating && setCurrentStep(index)}
                  className={`transition-all duration-200 rounded-full ${
                    index === currentStep 
                      ? 'w-4 h-1.5 bg-primary' 
                      : index < currentStep
                        ? 'w-1.5 h-1.5 bg-primary/60'
                        : 'w-1.5 h-1.5 bg-muted hover:bg-muted-foreground'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-2 pt-1">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isAnimating}
                className="flex-1 h-7 text-xs"
                size="sm"
              >
                <ChevronLeft className="w-3 h-3 mr-1" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={isAnimating}
                className="flex-1 h-7 text-xs"
                size="sm"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <span>Get Started</span>
                    <Sparkles className="w-3 h-3 ml-1" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight className="w-3 h-3 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip */}
            <div className="text-center">
              <Button
                variant="link"
                onClick={handleSkip}
                className="text-[10px] text-muted-foreground hover:text-foreground h-auto p-0"
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
