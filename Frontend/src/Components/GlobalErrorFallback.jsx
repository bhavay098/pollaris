// GlobalErrorFallback: what the user sees when a runtime error crashes the app.
// Used as the FallbackComponent of the ErrorBoundary in App.jsx — it shows the
// error message plus a "Try again" (re-renders the app) and "Go to homepage".
import React from "react";

export default function GlobalErrorFallback({ error, resetErrorBoundary }) {
  return (
    // Centered card on a full-screen background.
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center border border-gray-100 dark:border-gray-700">
        {/* Red circular icon marking the failure. */}
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Something went wrong</h1>
        {/* Show the actual error when available; otherwise a generic message. */}
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          {error?.message || "An unexpected error occurred. Please try again."}
        </p>
        <div className="flex flex-col gap-3">
          {/* Calls resetErrorBoundary, which tells the boundary to re-render
              its children (effectively a reload of the crashed subtree). */}
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Try again
          </button>
          {/* Plain link to escape back to the landing page. */}
          <a
            href="/"
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-lg transition-colors cursor-pointer inline-block"
          >
            Go to homepage
          </a>
        </div>
      </div>
    </div>
  );
}
