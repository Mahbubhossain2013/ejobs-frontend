"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface Props { data: { description: string }; onChange: (d: { description: string }) => void; }

export default function ResumeObjectiveSection({ data, onChange }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">Resume objective</h3>
      <div className="space-y-1.5">
        <Label>Description</Label>
        <Textarea
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Write a brief summary of your career goals and qualifications..."
          rows={5}
          className="text-sm"
        />
      </div>
    </div>
  );
}