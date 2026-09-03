"use client";

import { FileText, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function ResumeEditNotFound() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
        <p className="text-lg font-semibold">Template not found</p>
        <Button onClick={() => router.push("/resume-builder")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </Button>
      </div>
    </div>
  );
}