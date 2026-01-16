import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OnboardingTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const steps = [
  {
    title: "Welcome to Agent Zigma",
    content: "Your AI-powered market oracle for Polymarket predictions. Zigma analyzes markets, generates signals, and helps you make informed trading decisions.",
    icon: "🤖"
  },
  {
    title: "Chat Interface",
    content: "Ask Zigma anything about markets, get predictions, analyze user profiles, or receive personalized trading recommendations. Just type your question in the chat!",
    icon: "💬"
  },
  {
    title: "Signal Performance",
    content: "Track how Zigma's predictions have performed historically. View accuracy, win rates, confidence levels, and edge metrics to understand Zigma's performance.",
    icon: "📊"
  },
  {
    title: "Watchlist",
    content: "Add markets you're interested in to your watchlist. Zigma will monitor these markets and alert you to significant changes or new signals.",
    icon: "👁️"
  },
  {
    title: "Analytics Dashboard",
    content: "Deep dive into performance metrics, category breakdowns, risk analysis, and calibration data to understand Zigma's strengths and weaknesses.",
    icon: "📈"
  },
  {
    title: "Ready to Start!",
    content: "You're all set! Start by asking Zigma about a market, or explore the analytics dashboard to see historical performance. Happy trading!",
    icon: "🚀"
  }
];

export function OnboardingTutorial({ isOpen, onClose, onComplete }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('zigma-tutorial-seen');
    if (hasSeenTutorial && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

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
    if (dontShowAgain) {
      localStorage.setItem('zigma-tutorial-seen', 'true');
    }
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    if (dontShowAgain) {
      localStorage.setItem('zigma-tutorial-seen', 'true');
    }
    onClose();
  };

  if (!isOpen) return null;

  const step = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="bg-black border-green-500/30 max-w-2xl w-full">
        <CardContent className="p-8">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-muted-foreground">
                Step {currentStep + 1} of {steps.length}
              </span>
              <button
                onClick={handleSkip}
                className="text-xs text-green-400 hover:text-green-300 underline"
              >
                Skip tutorial
              </button>
            </div>
            <div className="w-full bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-1 bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">{step.icon}</div>
            <h2 className="text-2xl font-bold text-green-400 mb-4">{step.title}</h2>
            <p className="text-green-100/80 text-lg leading-relaxed">{step.content}</p>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'bg-green-400 w-8'
                    : index < currentStep
                    ? 'bg-green-400/50'
                    : 'bg-gray-700'
                }`}
                aria-label={`Go to step ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10 disabled:opacity-50"
            >
              Previous
            </Button>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 border-green-500/30 bg-black/50 rounded"
              />
              <span className="text-sm text-muted-foreground">Don't show again</span>
            </label>

            <Button
              onClick={handleNext}
              className="bg-green-500 hover:bg-green-600 text-black"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function useOnboardingTutorial() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('zigma-tutorial-seen');
    if (!hasSeenTutorial) {
      // Show tutorial after a short delay
      const timer = setTimeout(() => setIsOpen(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  return {
    isOpen,
    setIsOpen
  };
}
