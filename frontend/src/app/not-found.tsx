import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-6">
      <div className="max-w-md w-full rounded-xl border border-neutral-800 bg-neutral-950 p-6 text-center shadow-2xl">
        <span className="text-xs font-mono text-neutral-500 uppercase tracking-widest">404 Error</span>
        <h1 className="mt-2 text-xl font-bold text-neutral-100">Page Not Found</h1>
        <p className="mt-2 text-sm text-neutral-400">
          The requested page or resource does not exist in the automation platform.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center px-4 py-2 text-xs font-medium bg-white text-black hover:bg-neutral-200 rounded-lg transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
