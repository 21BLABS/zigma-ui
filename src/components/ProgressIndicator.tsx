import { useState, useEffect } from "react";

interface ProgressIndicatorProps {
  progress: number; // 0-100
  message?: string;
  status?: 'loading' | 'processing' | 'uploading' | 'analyzing';
  showPercentage?: boolean;
}

export function ProgressIndicator({ 
  progress, 
  message = "Processing...", 
  status = 'processing',
  showPercentage = true 
}: ProgressIndicatorProps) {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayProgress(progress);
    }, 50);
    return () => clearTimeout(timer);
  }, [progress]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
      case 'uploading':
        return (
          <svg className="animate-bounce h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        );
      case 'analyzing':
        return (
          <svg className="animate-pulse h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        );
      default:
        return (
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="text-green-400">
            {getStatusIcon()}
          </div>
          <span className="text-sm text-green-100">{message}</span>
        </div>
        {showPercentage && (
          <span className="text-sm font-mono text-green-400">
            {displayProgress.toFixed(0)}%
          </span>
        )}
      </div>
      
      <div className="w-full bg-gray-800 rounded-full overflow-hidden">
        <div
          className="h-2 bg-gradient-to-r from-green-500 to-green-400 transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, displayProgress))}%` }}
        >
          <div className="h-full w-full animate-pulse bg-green-300/30" />
        </div>
      </div>
    </div>
  );
}

interface ProgressModalProps {
  isOpen: boolean;
  onClose?: () => void;
  progress: number;
  message?: string;
  status?: 'loading' | 'processing' | 'uploading' | 'analyzing';
  title?: string;
}

export function ProgressModal({ 
  isOpen, 
  onClose, 
  progress, 
  message, 
  status = 'processing',
  title = 'Processing' 
}: ProgressModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black border border-green-500/30 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-green-400">{title}</h3>
          {onClose && (
            <button
              onClick={onClose}
              className="text-green-400 hover:text-green-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        
        <ProgressIndicator
          progress={progress}
          message={message}
          status={status}
          showPercentage
        />
        
        {progress >= 100 && (
          <div className="mt-4 text-center">
            <p className="text-sm text-green-400">Complete!</p>
          </div>
        )}
      </div>
    </div>
  );
}
