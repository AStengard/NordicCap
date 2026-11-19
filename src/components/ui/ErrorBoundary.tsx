import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('NordicCap Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0D1F18] text-[#F6F4EF] p-8 flex flex-col items-center justify-center font-sans">
          <div className="max-w-xl w-full bg-[#18221E] border border-[#8C6D46] rounded-xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <h1 className="text-lg font-semibold text-[#FCFBF9]">
                NordicCap Runtime Notice
              </h1>
            </div>
            <p className="text-xs text-[#D8D1C3]">
              An unhandled exception occurred during application rendering:
            </p>
            <pre className="p-3 bg-[#0D1F18] border border-[#8C6D46]/40 rounded text-xs font-mono text-red-300 overflow-x-auto whitespace-pre-wrap">
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#8C6D46] hover:bg-[#A38054] text-white text-xs font-semibold rounded transition-colors"
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
