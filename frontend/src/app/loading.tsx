export default function Loading() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-700 border-t-white" />
        <span className="text-xs font-mono text-neutral-400">Loading application...</span>
      </div>
    </div>
  );
}
