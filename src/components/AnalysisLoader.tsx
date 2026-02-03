import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AnalysisLoaderProps {
  isVisible: boolean;
  isMultiOutcome?: boolean;
  isUserAnalysis?: boolean;
}

const MARKET_ANALYSIS_STAGES = [
  'Initiating agent comms...',
  'Hydrating market...',
  'Checking rules and resolutions...',
  'Analyzing liquidity...',
  'Checking for insiders...',
  'Fetching news...',
  'Running Google queries...',
  'Bucketing data...',
  'Analyzing with LLM...',
  'Summarizing...',
  'Limiting data...',
  'Presenting soon...',
];

const USER_ANALYSIS_STAGES = [
  'Fetching user portfolio...',
  'Analyzing trading history...',
  'Computing win rate...',
  'Calculating P&L metrics...',
  'Evaluating risk patterns...',
  'Identifying top markets...',
  'Assessing diversification...',
  'Analyzing category performance...',
  'Detecting trading style...',
  'Generating insights...',
  'Compiling recommendations...',
  'Finalizing report...',
];

export const AnalysisLoader = ({ isVisible, isMultiOutcome = false, isUserAnalysis = false }: AnalysisLoaderProps) => {
  const [currentStage, setCurrentStage] = useState(0);
  const stages = isUserAnalysis ? USER_ANALYSIS_STAGES : MARKET_ANALYSIS_STAGES;

  useEffect(() => {
    if (!isVisible) {
      setCurrentStage(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStage((prev) => (prev + 1) % stages.length);
    }, 1200); // Change stage every 1.2 seconds

    return () => clearInterval(interval);
  }, [isVisible, stages.length]);

  if (!isVisible) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 py-8 justify-center">
        <div className="relative">
          <Loader2 className="w-5 h-5 text-green-400 animate-spin" />
          <div className="absolute inset-0 bg-green-400/20 blur-lg animate-pulse" />
        </div>
        <p className="text-green-300 font-medium animate-pulse">
          {stages[currentStage]}
        </p>
      </div>
      {isMultiOutcome && (
        <p className="text-center text-xs text-green-300/60 italic">
          Multi-outcome event detected • Analyzing all outcomes (~90 seconds)
        </p>
      )}
    </div>
  );
};
