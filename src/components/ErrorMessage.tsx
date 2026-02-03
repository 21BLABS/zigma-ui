interface ErrorMessageProps {
  message?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export const ErrorMessage = ({ 
  message = 'Failed to load data', 
  onRetry,
  fullScreen = false 
}: ErrorMessageProps) => {
  const containerClass = fullScreen 
    ? "min-h-screen bg-black flex items-center justify-center"
    : "py-12 flex items-center justify-center";

  return (
    <div className={containerClass}>
      <div className="text-center max-w-md">
        <div className="text-red-400 text-4xl mb-4">⚠️</div>
        <h3 className="text-white font-semibold mb-2">Error</h3>
        <p className="text-green-300/60 font-mono mb-6">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-green-500 text-black rounded hover:bg-green-600 transition-colors font-semibold"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};
