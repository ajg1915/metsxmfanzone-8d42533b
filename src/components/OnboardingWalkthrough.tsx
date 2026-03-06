import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X, Sparkles, Rocket, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import heroImage from "@/assets/hero-stadium.jpg";
import logoIcon from "@/assets/metsxmfanzone-logo.png";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

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
  const { user } = useAuth();
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
      // If user is signed in, never show the popup
      if (user) {
        setLoading(false);
        return;
      }

      // Show once per page view for logged-out users (no session persistence)
      fetchAndShow();
    }
  }, [previewMode, previewSteps, user]);

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
        className="max-w-[90vw] sm:max-w-[380px] p-0 gap-0 overflow-hidden border-0 rounded-2xl bg-transparent shadow-2xl [&>button]:hidden"
        onPointerDownOutside={() => handleSkip()}
        onEscapeKeyDown={() => handleSkip()}
      >
        {/* Outer glow effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 via-blue-500/30 to-primary/30 rounded-2xl blur-xl opacity-60" />
        
        <div className="relative bg-gradient-to-b from-background/95 to-background backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden">
          {/* Animated progress bar */}
          <div className="absolute top-0 left-0 right-0 z-20 h-1 bg-muted/30">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary via-orange-400 to-primary"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-3 top-3 z-30 bg-black/40 hover:bg-black/60 text-white h-8 w-8 rounded-full backdrop-blur-sm border border-white/10 transition-all hover:scale-105"
            onClick={() => handleSkip()}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Step counter */}
          <div className="absolute left-3 top-3 z-30 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            <span className="text-xs font-medium text-white/90">
              {currentStep + 1} / {steps.length}
            </span>
          </div>

          {/* Image section with animation */}
          <div className="relative h-48 sm:h-56 overflow-hidden">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <img 
                  src={step.image_url || heroImage} 
                  alt={step.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </AnimatePresence>
            
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent h-20" />
            
            {/* Floating logo */}
            <motion.div 
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 z-10"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-orange-600 p-0.5 shadow-lg shadow-primary/30">
                <div className="w-full h-full rounded-2xl bg-background flex items-center justify-center overflow-hidden">
                  <img src={logoIcon} alt="MetsXMFanZone" className="w-9 h-9 object-contain" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-5 pt-10 pb-5 space-y-4">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div 
                key={`content-${currentStep}`}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="text-center space-y-2"
              >
                <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary via-orange-400 to-primary bg-clip-text text-transparent">
                  {step.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                  {step.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Step indicators */}
            <div className="flex items-center justify-center gap-2 py-2">
              {steps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToStep(index)}
                  className="group relative p-1"
                  aria-label={`Go to step ${index + 1}`}
                >
                  <motion.div
                    className={`rounded-full transition-all duration-300 ${
                      index === currentStep 
                        ? 'w-6 h-2 bg-gradient-to-r from-primary to-orange-400' 
                        : index < currentStep
                          ? 'w-2 h-2 bg-primary/50 group-hover:bg-primary/70'
                          : 'w-2 h-2 bg-muted-foreground/30 group-hover:bg-muted-foreground/50'
                    }`}
                    layout
                    transition={{ duration: 0.2 }}
                  />
                </button>
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex-1 h-11 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                className={`flex-1 h-11 rounded-xl font-medium transition-all ${
                  isLastStep 
                    ? 'bg-gradient-to-r from-primary via-orange-500 to-primary hover:opacity-90 shadow-lg shadow-primary/30' 
                    : 'bg-gradient-to-r from-primary to-orange-500 hover:opacity-90'
                }`}
              >
                {isLastStep ? (
                  <>
                    <Rocket className="w-4 h-4 mr-1.5" />
                    Login
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </div>

            {/* Sign Up link */}
            <button
              onClick={handleSignUp}
              className="w-full flex items-center justify-center gap-1.5 text-xs text-muted-foreground/80 hover:text-primary transition-colors py-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New here? <span className="font-medium text-primary hover:underline">Sign Up</span></span>
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingWalkthrough;
