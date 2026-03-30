import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends (React.Component as any) {
  constructor(props: any) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    (this as any).setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if ((this as any).state.hasError) {
      let errorMessage = "An unexpected error occurred.";
      
      try {
        // Check if it's a Firestore JSON error
        const parsed = JSON.parse((this as any).state.error?.message || "");
        if (parsed.error && parsed.operationType) {
          errorMessage = `Database Error: ${parsed.error} during ${parsed.operationType} operation.`;
        }
      } catch (e) {
        // Not a JSON error
        errorMessage = (this as any).state.error?.message || errorMessage;
      }

      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 p-6 text-center">
          <div className="rounded-full bg-red-100 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-zinc-900">Something went wrong</h1>
          <p className="mt-2 max-w-md text-zinc-600">
            {errorMessage}
          </p>
          <button
            onClick={this.handleReset}
            className="mt-8 flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-all"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reload Application
          </button>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
