import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-stadium.jpg";

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

  useEffect(() => {
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
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('walkthroughLastSeen', Date.now().toString());
    setOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('walkthroughLastSeen', Date.now().toString());
    setOpen(false);
    onComplete();
  };

  if (loading || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl p-0 gap-0">
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-10 bg-background/80 hover:bg-background"
            onClick={handleSkip}
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="aspect-video overflow-hidden rounded-t-lg">
            <img 
              src={step.image_url || heroImage} 
              alt={step.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-4 space-y-3">
            <div className="text-center">
              <h2 className="text-xl font-bold text-primary mb-2">
                {step.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {step.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3">
              <Button
                variant="ghost"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <div className="flex gap-2">
                {steps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentStep ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                className="gap-2"
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>

            <div className="text-center">
              <Button
                variant="link"
                onClick={handleSkip}
                className="text-muted-foreground"
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
