import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles } from 'lucide-react';
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingTour = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isActive,
    currentStep,
    currentStepData,
    totalSteps,
    nextStep,
    skipOnboarding,
    isLastStep
  } = useOnboarding();

  useEffect(() => {
    if (isActive && currentStepData) {
      // Navigate to the current step's route
      if (location.pathname !== currentStepData.route) {
        navigate(currentStepData.route);
      }
    }
  }, [currentStep, isActive, currentStepData, navigate, location.pathname]);

  if (!isActive || !currentStepData) return null;

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <Dialog open={isActive} onOpenChange={(open) => !open && skipOnboarding()}>
      <DialogContent 
        className="sm:max-w-[500px]"
        aria-describedby="onboarding-description"
      >
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <DialogTitle className="text-xl">
              {currentStepData.title}
            </DialogTitle>
          </div>
          <DialogDescription id="onboarding-description" className="text-base">
            {currentStepData.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <DialogFooter className="flex-row justify-between sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={skipOnboarding}
            className="text-muted-foreground"
          >
            Skip Tour
          </Button>
          <Button onClick={nextStep}>
            {isLastStep ? "Get Started!" : "Next"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingTour;
