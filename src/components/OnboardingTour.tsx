import { useState, useEffect } from "react";

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    target: '.executable-signals',
    title: '🟢 Executable Signals',
    content: 'These are markets with confirmed edge, liquidity, and survivability. Ready to trade with confidence.',
    position: 'bottom'
  },
  {
    target: '.watchlist-section',
    title: '🟡 Watchlist',
    content: 'High-confidence views for monitoring. Not yet executable due to liquidity, time decay, or volatility.',
    position: 'bottom'
  },
  {
    target: 'nav a[href="/analytics"]',
    title: '📊 Analytics Dashboard',
    content: 'View detailed risk metrics, performance history, and accuracy tracking for all signals.',
    position: 'bottom'
  },
  {
    target: 'nav a[href="/chat"]',
    title: '💬 AI Chat Terminal',
    content: 'Ask Zigma about any Polymarket bet. Paste a market link or ask a natural-language question.',
    position: 'bottom'
  }
];

export const OnboardingTour = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('zigma-onboarding-tour');
    if (!hasSeenTour) {
      setIsVisible(true);
    }
  }, []);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSkip();
    }
  };

  const handleSkip = () => {
    setIsVisible(false);
    localStorage.setItem('zigma-onboarding-tour', 'true');
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    if (!isVisible) return;

    const targetElement = document.querySelector(tourSteps[currentStep].target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 10,
        left: rect.left + rect.width / 2 - 150
      });
      
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      targetElement.classList.add('ring-2', 'ring-green-400', 'ring-offset-2', 'ring-offset-black');
      
      return () => {
        targetElement.classList.remove('ring-2', 'ring-green-400', 'ring-offset-2', 'ring-offset-black');
      };
    }
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const step = tourSteps[currentStep];

  return (
    <div
      className="fixed z-[100] w-80 bg-gray-900 border border-green-500/50 rounded-lg shadow-2xl"
      style={{ top: `${position.top}px`, left: `${Math.max(10, position.left)}px` }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-sm font-semibold text-green-400">{step.title}</h3>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-gray-300 leading-relaxed mb-4">{step.content}</p>
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            {tourSteps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentStep ? 'bg-green-400' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrevious}
                className="px-3 py-1 text-xs bg-gray-700 text-gray-200 rounded hover:bg-gray-600"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-500"
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      </div>
      <div className="px-4 pb-3">
        <button
          onClick={handleSkip}
          className="text-[10px] text-gray-500 hover:text-gray-400 underline"
        >
          Don't show this again
        </button>
      </div>
    </div>
  );
};
