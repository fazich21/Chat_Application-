import { Component } from "react";

/**
 * Catches render-time errors anywhere below it in the tree and shows a
 * readable message instead of a blank screen. Without this, any thrown
 * error (bad Supabase config, a hook crash, a malformed prop) unmounts
 * the entire app silently — exactly what was happening before this was added.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary] Caught an error:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center
                        bg-surface-base px-6 text-center">
          <div className="max-w-md space-y-4">
            <div className="mx-auto flex size-14 items-center justify-center
                            rounded-2xl bg-red-500/10">
              <svg className="size-7 text-red-400" fill="none" viewBox="0 0 24 24"
                   stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-8.625 6.375h.008v.008h-.008z" />
              </svg>
            </div>
            <h1 className="text-lg font-semibold text-white">Something went wrong</h1>
            <p className="text-sm text-gray-400 leading-relaxed">
              {this.state.error?.message ?? "An unexpected error occurred."}
            </p>
            <p className="text-xs text-gray-500">
              Check your browser console (F12) for more details.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-medium
                         text-white hover:bg-brand-700 transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
