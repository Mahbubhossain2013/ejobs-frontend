"use client";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const handleRetry = () => {
    try {
      reset();
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <div className="flex gap-3">
        <button onClick={handleRetry} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm">
          Try Again
        </button>
        <a href="/" className="px-4 py-2 border rounded-md text-sm">
          Go Home
        </a>
      </div>
    </div>
  );
}
