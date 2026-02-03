import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-green-400 flex items-center justify-center font-mono">
          <div className="text-center p-8 border border-green-500/30 rounded-lg max-w-md">
            <h1 className="text-2xl mb-4 text-red-400">⚠️ System Error</h1>
            <p className="text-green-300/60 mb-6">
              Something went wrong. The application encountered an unexpected error.
            </p>
            {this.state.error && (
              <pre className="text-xs text-left bg-gray-900 p-4 rounded mb-6 overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-green-500 text-black rounded hover:bg-green-600 transition-colors font-semibold"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
