"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="max-w-md w-full rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 text-center shadow-xl">
        <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
        <p className="mt-2 text-sm text-neutral-400">
          {error.message || "An unexpected error occurred in the application."}
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 px-4 py-2 text-xs font-medium bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg transition-colors border border-neutral-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
