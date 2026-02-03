interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }: LoadingSpinnerProps) => {
  const containerClass = fullScreen 
    ? "min-h-screen bg-black flex items-center justify-center"
    : "py-12 flex items-center justify-center";

  return (
    <div className={containerClass}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mb-4"></div>
        <p className="text-green-300/60 font-mono">{message}</p>
      </div>
    </div>
  );
};
