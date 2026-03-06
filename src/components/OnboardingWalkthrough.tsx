import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Sparkles, Rocket, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-stadium.jpg";
import logoIcon from "@/assets/metsxmfanzone-logo.png";
import { motion, AnimatePresence } from "framer-motion";
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
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(false);
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (previewMode && previewSteps.length > 0) {
      setSteps(previewSteps);
      setOpen(true);
      setLoading(false);
    } else {
      fetchAndShow();
    }
  }, [previewMode, previewSteps]);

  const fetchAndShow = async () => {
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
      }
    } catch (error) {
      console.error("Error fetching tutorial steps:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      handleComplete();
      navigate('/auth?mode=login');
      return;
    }
    setDirection(1);
    setCurrentStep(currentStep + 1);
  };

  const handleSignUp = () => {
    handleSkip();
    navigate('/auth?mode=signup');
  };

  const handlePrevious = () => {
    if (currentStep === 0) return;
    setDirection(-1);
    setCurrentStep(currentStep - 1);
  };

  const handleComplete = () => {
    onComplete();
    setOpen(false);
  };

  const handleSkip = () => {
    onComplete();
    setOpen(false);
  };

  const goToStep = (index: number) => {
    setDirection(index > currentStep ? 1 : -1);
    setCurrentStep(index);
  };

  if (loading || steps.length === 0) {
    return null;
  }

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  return (
    <Dialog open={open} onOpenChange={() => handleSkip()}>
      <DialogContent 
        className="max-w-[82vw] sm:max-w-[320px] p-0 gap-0 border-0 rounded-2xl bg-transparent shadow-2xl [&>button]:hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        onPointerDownOutside={() => handleSkip()}
        onEscapeKeyDown={() => handleSkip()}
      >
        <div className="relative bg-gradient-to-b from-background/95 to-background backdrop-blur-xl rounded-2xl border border-white/10">
          {/* Progress bar */}
          <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-muted/30 rounded-t-2xl overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary via-orange-400 to-primary transition-all duration-400"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 z-30 bg-black/40 hover:bg-black/60 text-white h-7 w-7 rounded-full backdrop-blur-sm border border-white/10"
            onClick={() => handleSkip()}
          >
            <X className="w-3.5 h-3.5" />
          </Button>

          {/* Step counter */}
          <div className="absolute left-2 top-2 z-30 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <span className="text-[10px] font-medium text-white/90">
              {currentStep + 1} / {steps.length}
            </span>
          </div>

          {/* Image */}
          <div className="relative h-24 sm:h-28 overflow-hidden rounded-t-2xl">
            <img 
              src={step.image_url || heroImage} 
              alt={step.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            
            {/* Logo */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-orange-600 p-0.5 shadow-lg shadow-primary/30">
                <div className="w-full h-full rounded-xl bg-background flex items-center justify-center overflow-hidden">
                  <img src={logoIcon} alt="MetsXMFanZone" className="w-6 h-6 object-contain" />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-3 pt-7 pb-3 space-y-2">
            <div className="text-center space-y-1">
              <h2 className="text-sm sm:text-base font-bold bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">
                {step.title}
              </h2>
              <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                {step.description}
              </p>
            </div>

            {/* Dots */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className="p-0.5"
                  aria-label={`Go to step ${index + 1}`}
                >
                  <div
                    className={`rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'w-5 h-1.5 bg-gradient-to-r from-primary to-orange-400' 
                        : index < currentStep
                          ? 'w-1.5 h-1.5 bg-primary/50'
                          : 'w-1.5 h-1.5 bg-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex-1 h-8 rounded-lg border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30 text-[11px]"
              >
                <ChevronLeft className="w-3 h-3 mr-0.5" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                className={`flex-1 h-8 rounded-lg font-medium text-[11px] transition-all ${
                  isLastStep 
                    ? 'bg-gradient-to-r from-primary via-orange-500 to-primary hover:opacity-90 shadow-lg shadow-primary/30' 
                    : 'bg-gradient-to-r from-primary to-orange-500 hover:opacity-90'
                }`}
              >
                {isLastStep ? (
                  <>
                    <Rocket className="w-3 h-3 mr-1" />
                    Login
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-3 h-3 ml-0.5" />
                  </>
                )}
              </Button>
            </div>

            {/* Sign Up */}
            <button
              onClick={handleSignUp}
              className="w-full flex items-center justify-center gap-1 text-[10px] text-muted-foreground/80 hover:text-primary transition-colors py-0.5"
            >
              <UserPlus className="w-3 h-3" />
              <span>New here? <span className="font-medium text-primary hover:underline">Sign Up</span></span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWalkthrough;
