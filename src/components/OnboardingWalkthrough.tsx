import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import heroImage from "@/assets/hero-stadium.jpg";
import liveImage from "@/assets/highlight-1.jpg";
import springTrainingImage from "@/assets/spring-training.jpg";

interface OnboardingStep {
  title: string;
  description: string;
  image: string;
  features: string[];
}

const steps: OnboardingStep[] = [
  {
    title: "Welcome to MetsXMFanZone! 🎉",
    description: "Your ultimate destination for New York Mets content, live streams, and community.",
    image: heroImage,
    features: [
      "Live game streams and replays",
      "Exclusive Mets content and analysis",
      "Active fan community",
      "Latest news and updates"
    ]
  },
  {
    title: "Live Streams & Premium Content",
    description: "Access live Mets games, spring training, and exclusive premium content with your subscription.",
    image: liveImage,
    features: [
      "HD live streaming",
      "Full game replays",
      "Multiple camera angles",
      "Ad-free experience"
    ]
  },
  {
    title: "Spring Training Coverage",
    description: "Get exclusive access to Mets spring training games from Clover Park, Port St. Lucie.",
    image: springTrainingImage,
    features: [
      "Live spring training games",
      "Player interviews",
      "Behind-the-scenes content",
      "Game highlights"
    ]
  }
];

interface OnboardingWalkthroughProps {
  onComplete: () => void;
}

const OnboardingWalkthrough = ({ onComplete }: OnboardingWalkthroughProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeenWalkthrough = localStorage.getItem('hasSeenWalkthrough');
    if (!hasSeenWalkthrough) {
      setOpen(true);
    }
  }, []);

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
    localStorage.setItem('hasSeenWalkthrough', 'true');
    setOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem('hasSeenWalkthrough', 'true');
    setOpen(false);
    onComplete();
  };

  const step = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl p-0 gap-0">
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
              src={step.image} 
              alt={step.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">
                {step.title}
              </h2>
              <p className="text-muted-foreground">
                {step.description}
              </p>
            </div>

            <Card className="border-2 border-primary bg-primary/5 p-4">
              <ul className="space-y-2">
                {step.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex items-center justify-between pt-4">
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
