import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface OnboardingStep {
  page: string;
  title: string;
  description: string;
  route: string;
}

export const onboardingSteps: OnboardingStep[] = [
  {
    page: 'datasets',
    title: 'Welcome to My Datasets',
    description: 'This is where you can upload and manage your datasets. Simply drag and drop CSV files or click to browse. Once uploaded, you can select any dataset to preview or analyze it with AI.',
    route: '/dashboard/datasets'
  },
  {
    page: 'overview',
    title: 'Dataset Overview',
    description: 'The Overview page provides automatic insights about your selected dataset including statistical summaries, key metrics, and intelligent visualizations to help you understand your data at a glance.',
    route: '/dashboard/overview'
  },
  {
    page: 'preview',
    title: 'Data Preview',
    description: 'Here you can view your dataset in a table format with detailed statistics for each column. Use this page to explore your data structure, check data types, and understand distributions.',
    route: '/dashboard/preview'
  },
  {
    page: 'chat',
    title: 'AI Chat',
    description: 'Ask questions about your data in natural language! The AI can help you analyze trends, create custom visualizations, and extract insights. Just type your question and let AI do the work.',
    route: '/dashboard/chat'
  }
];

interface OnboardingContextType {
  isActive: boolean;
  currentStep: number;
  currentStepData: OnboardingStep | undefined;
  totalSteps: number;
  nextStep: () => void;
  skipOnboarding: () => void;
  restartOnboarding: () => void;
  isLastStep: boolean;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding) {
      setIsActive(true);
    }
  }, []);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const completeOnboarding = () => {
    localStorage.setItem('onboarding_completed', 'true');
    setIsActive(false);
    setCurrentStep(0);
  };

  const restartOnboarding = () => {
    localStorage.removeItem('onboarding_completed');
    setIsActive(true);
    setCurrentStep(0);
  };

  const value = {
    isActive,
    currentStep,
    currentStepData: onboardingSteps[currentStep],
    totalSteps: onboardingSteps.length,
    nextStep,
    skipOnboarding,
    restartOnboarding,
    isLastStep: currentStep === onboardingSteps.length - 1
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
};
