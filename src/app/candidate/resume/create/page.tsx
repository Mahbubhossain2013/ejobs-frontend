"use client";

import { useEffect } from "react";

export default function CvRedirect() {
  useEffect(() => {
    window.location.href = "/resume-builder/template";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );
}
