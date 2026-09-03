"use client";

import React from "react";
import Field from "./Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { CandidateTrainingEntry } from "@/types";

interface Props {
  isBn: boolean;
  trainings: CandidateTrainingEntry[];
  onUpdate: (i: number, field: string, value: any) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}

export default function ProfileSectionTraining({ isBn, trainings, onUpdate, onRemove, onAdd }: Props) {
  return (
    <div className="space-y-4">
      {trainings.length === 0 && <p className="text-sm text-muted-foreground">No training entries</p>}
      {trainings.map((t, i) => (
        <div key={i} className="p-4 rounded-lg border space-y-3 relative">
          <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-7 w-7 p-0" onClick={() => onRemove(i)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Training Title" required><Input value={t.title} onChange={(e) => onUpdate(i, "title", e.target.value)} /></Field>
            <Field label="Institute"><Input value={t.institute_name || ""} onChange={(e) => onUpdate(i, "institute_name", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Duration"><Input value={t.duration || ""} onChange={(e) => onUpdate(i, "duration", e.target.value)} placeholder="e.g. 3 months" /></Field>
            <Field label="Year"><Input type="number" value={t.year || ""} onChange={(e) => onUpdate(i, "year", parseInt(e.target.value) || undefined)} /></Field>
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1" /> {isBn ? "প্রশিক্ষণ যোগ করুন" : "Add Training"}
      </Button>
    </div>
  );
}