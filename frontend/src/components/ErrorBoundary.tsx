import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { translate } from "../i18n";
import { useCVStore } from "../store/useCVStore";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const lang = (useCVStore.getState().cv?.language || "tr") as "tr" | "en";
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <div className="max-w-2xl w-full glass-panel border border-rose-500/30 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-orange-500"></div>
            
            <div className="flex items-start gap-5">
              <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
                <AlertCircle className="w-8 h-8" />
              </div>
              
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-white mb-2 font-['Outfit']">
                  {translate("app.errorBoundaryTitle", lang)}
                </h1>
                <p className="text-slate-400 mb-6 text-sm leading-relaxed">
                  {translate("app.errorBoundaryDesc", lang)}
                </p>
                
                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 mb-6 overflow-auto max-h-64">
                  <p className="text-rose-400 font-mono text-xs font-semibold mb-2">
                    {this.state.error?.toString()}
                  </p>
                  <pre className="text-slate-500 font-mono text-[10px] whitespace-pre-wrap">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-rose-500/20 active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{translate("app.errorBoundaryReload", lang)}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
