"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error("[Dashboard Error]", error);
    }
  }, [error]);

  const handleRetry = () => {
    try {
      reset();
    } catch {
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <h2 className="text-2xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      {error.digest && (
        <p className="text-xs text-muted-foreground">Error ID: {error.digest}</p>
      )}
      <div className="flex gap-3">
        <Button onClick={handleRetry}>Try Again</Button>
        <Button variant="outline" onClick={() => router.push("/")}>Go Home</Button>
      </div>
    </div>
  );
}
