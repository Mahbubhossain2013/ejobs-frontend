"use client";

import { Loader2 } from "lucide-react";

export default function ResumeEditLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-sm text-muted-foreground">Loading editor...</p>
      </div>
    </div>
  );
}