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
    if (previewMode && previewSteps.length > 0) {
      setSteps(previewSteps);
      setOpen(true);
      setLoading(false);
    } else {
      checkForUpdatesAndFetch();
    }
  }, [previewMode, previewSteps]);

  const checkForUpdatesAndFetch = async () => {
    try {
      const { data, error } = await supabase
        .from("tutorial_steps")
        .select("*")
        .eq("is_active", true)
        .order("step_number", { ascending: true });

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Get the most recent update time from tutorial steps
        const latestUpdate = data.reduce((latest, step) => {
          const stepTime = new Date(step.updated_at).getTime();
          return stepTime > latest ? stepTime : latest;
        }, 0);

        // Check if user has seen this version
        const lastSeenTime = localStorage.getItem('tutorialLastSeen');
        const lastSeen = lastSeenTime ? parseInt(lastSeenTime, 10) : 0;

        if (latestUpdate > lastSeen) {
          setSteps(data as OnboardingStep[]);
          setOpen(true);
        }
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
    localStorage.setItem('tutorialLastSeen', Date.now().toString());
    onComplete();
    setOpen(false);
  };

  const handleSkip = () => {
    localStorage.setItem('tutorialLastSeen', Date.now().toString());
    onComplete();
    setOpen(false);
  };

  if (loading || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <Dialog open={open} onOpenChange={() => handleSkip()}>
      <DialogContent 
        className="max-w-[75vw] sm:max-w-[280px] p-0 gap-0 overflow-hidden border-2 border-primary rounded-lg [&>button]:hidden"
        onPointerDownOutside={() => handleSkip()}
        onEscapeKeyDown={() => handleSkip()}
      >
        <div className="relative">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 z-20">
            <Progress value={progress} className="h-0.5 rounded-none bg-muted" />
          </div>

          {/* Close button - larger touch target */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-30 bg-background hover:bg-destructive hover:text-destructive-foreground h-8 w-8 rounded-full shadow-md border border-border"
            onClick={() => handleSkip()}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Image section */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img 
              src={step.image_url || heroImage} 
              alt={step.title}
              className={`w-full h-full object-cover transition-all duration-200 ${isAnimating ? 'scale-105 opacity-80' : 'scale-100 opacity-100'}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
            
            {/* Logo badge */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-background border-2 border-primary flex items-center justify-center shadow-md overflow-hidden">
              <img src={logoIcon} alt="MetsXMFanZone" className="w-5 h-5 object-contain" />
            </div>
          </div>

          {/* Content */}
          <div className="p-2.5 space-y-1.5">
            {/* Title and description */}
            <div className={`text-center space-y-0.5 transition-all duration-200 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
              <h2 className="text-xs font-semibold text-primary">
                {step.title}
              </h2>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-2">
                {step.description}
              </p>
            </div>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-1 py-0.5">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => !isAnimating && setCurrentStep(index)}
                  className={`transition-all duration-200 rounded-full ${
                    index === currentStep 
                      ? 'w-3 h-1 bg-primary' 
                      : index < currentStep
                        ? 'w-1 h-1 bg-primary/60'
                        : 'w-1 h-1 bg-muted hover:bg-muted-foreground'
                  }`}
                  aria-label={`Go to step ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0 || isAnimating}
                className="flex-1 h-6 text-[10px]"
                size="sm"
              >
                <ChevronLeft className="w-2.5 h-2.5 mr-0.5" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={isAnimating}
                className="flex-1 h-6 text-[10px]"
                size="sm"
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    <span>View Site</span>
                    <Sparkles className="w-2.5 h-2.5 ml-0.5" />
                  </>
                ) : (
                  <>
                    <span>Next</span>
                    <ChevronRight className="w-2.5 h-2.5 ml-0.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Skip */}
            <div className="text-center">
              <Button
                variant="link"
                onClick={handleSkip}
                className="text-[9px] text-muted-foreground hover:text-foreground h-auto p-0"
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
