"use client";

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorId: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  retry = () => {
    this.setState({ hasError: false, error: null, errorId: "" });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.retry);
      }
      return <DefaultErrorFallback error={this.state.error!} retry={this.retry} errorId={this.state.errorId} />;
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error: Error;
  retry: () => void;
  errorId: string;
}

export function DefaultErrorFallback({ error, retry, errorId }: DefaultErrorFallbackProps) {
  const isNetworkError = error.message.includes('fetch') || error.message.includes('network');
  const isGenerationError = error.message.includes('generation') || error.message.includes('API');

  const getErrorSuggestions = () => {
    if (isNetworkError) {
      return [
        "Check your internet connection",
        "Try refreshing the page",
        "Wait a moment and try again"
      ];
    }
    if (isGenerationError) {
      return [
        "Try simplifying your dream description",
        "Check if the service is available",
        "Try a different artistic style"
      ];
    }
    return [
      "Refresh the page to start over",
      "Clear your browser cache",
      "Try again in a few minutes"
    ];
  };

  const getErrorIcon = () => {
    if (isNetworkError) return "🌐";
    if (isGenerationError) return "🎨";
    return "⚠️";
  };

  const getErrorTitle = () => {
    if (isNetworkError) return "Connection Issue";
    if (isGenerationError) return "Generation Failed";
    return "Something Went Wrong";
  };

  return (
    <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 text-center backdrop-blur-sm">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
        <span className="text-3xl">{getErrorIcon()}</span>
      </div>
      
      <h3 className="mb-2 text-xl font-bold text-red-400">{getErrorTitle()}</h3>
      
      <p className="mb-6 text-red-300/80">
        We encountered an issue while processing your request. Don&apos;t worry, this happens sometimes!
      </p>

      {/* Error details (collapsible) */}
      <details className="mb-6 text-left">
        <summary className="cursor-pointer text-sm text-red-300/60 hover:text-red-300">
          Technical Details
        </summary>
        <div className="mt-2 rounded-lg bg-red-500/5 p-3 text-xs text-red-300/80 font-mono">
          <p><strong>Error ID:</strong> {errorId}</p>
          <p><strong>Message:</strong> {error.message}</p>
          {error.stack && (
            <pre className="mt-2 whitespace-pre-wrap text-xs opacity-70">
              {error.stack.split('\n').slice(0, 5).join('\n')}
            </pre>
          )}
        </div>
      </details>

      {/* Suggestions */}
      <div className="mb-6">
        <h4 className="mb-3 text-lg font-semibold text-red-300">Try these suggestions:</h4>
        <ul className="space-y-2">
          {getErrorSuggestions().map((suggestion, index) => (
            <li key={index} className="flex items-start gap-3 text-red-300/80">
              <span className="text-red-400 mt-0.5">•</span>
              {suggestion}
            </li>
          ))}
        </ul>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <button
          onClick={retry}
          className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-red-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105"
        >
          <span className="relative z-10">Try Again</span>
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="group relative overflow-hidden rounded-xl border border-red-400/30 bg-red-500/10 px-6 py-3 font-semibold text-red-300 transition-all duration-300 hover:bg-red-500/20 hover:border-red-400/50"
        >
          Refresh Page
        </button>
        
        <button
          onClick={() => {
            navigator.clipboard.writeText(`Error ID: ${errorId}\nMessage: ${error.message}`);
          }}
          className="group relative overflow-hidden rounded-xl border border-red-400/30 bg-red-500/10 px-6 py-3 font-semibold text-red-300 transition-all duration-300 hover:bg-red-500/20 hover:border-red-400/50"
        >
          Copy Error Info
        </button>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-4 left-4 w-2 h-2 bg-red-400/20 rounded-full animate-pulse" />
        <div className="absolute bottom-6 right-6 w-1 h-1 bg-red-400/20 rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-8 w-1.5 h-1.5 bg-red-400/20 rounded-full animate-pulse delay-500" />
      </div>
    </div>
  );
}

// Specific error components for different scenarios
export function NetworkErrorFallback({ retry }: { retry: () => void }) {
  return (
    <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-8 text-center backdrop-blur-sm">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10">
        <span className="text-3xl">📡</span>
      </div>
      
      <h3 className="mb-2 text-xl font-bold text-orange-400">Connection Lost</h3>
      
      <p className="mb-6 text-orange-300/80">
        Unable to connect to our dream generation service. Please check your internet connection.
      </p>

      <div className="flex justify-center gap-3">
        <button
          onClick={retry}
          className="rounded-xl bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(251,146,60,0.4)] hover:scale-105"
        >
          Reconnect
        </button>
      </div>
    </div>
  );
}

export function GenerationErrorFallback({ retry, onSimplify }: { retry: () => void; onSimplify?: () => void }) {
  return (
    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-8 text-center backdrop-blur-sm">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-purple-500/10">
        <span className="text-3xl">🎭</span>
      </div>
      
      <h3 className="mb-2 text-xl font-bold text-purple-400">Generation Failed</h3>
      
      <p className="mb-6 text-purple-300/80">
        We couldn&apos;t visualize your dream this time. Sometimes complex dreams need a simpler approach.
      </p>

      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <button
          onClick={retry}
          className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-semibold text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:scale-105"
        >
          Try Again
        </button>
        {onSimplify && (
          <button
            onClick={onSimplify}
            className="rounded-xl border border-purple-400/30 bg-purple-500/10 px-6 py-3 font-semibold text-purple-300 transition-all duration-300 hover:bg-purple-500/20"
          >
            Simplify Dream
          </button>
        )}
      </div>
    </div>
  );
}

// Loading error for when components fail to load
export function LoadingErrorFallback({ retry, componentName }: { retry: () => void; componentName?: string }) {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
        <span className="text-2xl">🔄</span>
      </div>
      
      <h4 className="mb-2 text-lg font-semibold text-blue-400">Loading Failed</h4>
      
      <p className="mb-4 text-blue-300/80">
        {componentName ? `The ${componentName} component failed to load.` : 'A component failed to load properly.'}
      </p>

      <button
        onClick={retry}
        className="rounded-lg bg-blue-500/20 px-4 py-2 text-sm font-medium text-blue-300 transition-all duration-300 hover:bg-blue-500/30"
      >
        Retry Loading
      </button>
    </div>
  );
}
