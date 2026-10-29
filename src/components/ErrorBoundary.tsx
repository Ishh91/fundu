import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

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
    console.error('ErrorBoundary caught unhandled error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#f4f7f8] flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-8 bg-white rounded-3xl border border-ink-100 shadow-soft text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-black text-ink-900">Something went wrong</h2>
            <p className="text-xs font-semibold text-ink-500 leading-relaxed">
              The page encountered a temporary display or version mismatch issue. A quick refresh will load the latest version.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={this.handleReload}
                className="btn btn-primary text-xs font-bold w-full sm:w-auto px-6 py-2.5 rounded-full flex items-center justify-center gap-2"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="btn btn-secondary text-xs font-bold w-full sm:w-auto px-6 py-2.5 rounded-full flex items-center justify-center gap-2"
              >
                <Home className="h-3.5 w-3.5" /> Back to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
