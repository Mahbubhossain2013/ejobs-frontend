"use client";

import { Label } from "@/components/ui/label";

interface FieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function Field({ label, required, children, className = "" }: FieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-sm font-medium">
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}