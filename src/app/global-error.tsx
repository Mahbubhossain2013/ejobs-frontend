"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="text-muted-foreground text-center max-w-md">
            {error.message || "An unexpected error occurred."}
          </p>
          {error.digest && (
            <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => {
                try {
                  reset();
                } catch {
                  window.location.reload();
                }
              }}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-4 py-2 border border-border rounded-md text-sm font-medium"
            >
              Go Home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
