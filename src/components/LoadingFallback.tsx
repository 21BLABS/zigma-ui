import * as React from 'react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
        <h2 className="text-2xl font-bold mb-2 text-foreground">Loading Zigma</h2>
        <p className="text-muted-foreground">Initializing platform...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
