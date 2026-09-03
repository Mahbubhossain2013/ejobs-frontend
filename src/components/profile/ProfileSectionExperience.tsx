"use client";

import React from "react";
import Field from "./Field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { CandidateExperienceEntry } from "@/types";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];

interface Props {
  isBn: boolean;
  experiences: CandidateExperienceEntry[];
  onUpdate: (i: number, field: string, value: any) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}

export default function ProfileSectionExperience({ isBn, experiences, onUpdate, onRemove, onAdd }: Props) {
  return (
    <div className="space-y-4">
      {experiences.length === 0 && <p className="text-sm text-muted-foreground">{isBn ? "কোনো অভিজ্ঞতা যোগ করা হয়নি" : "No experience entries yet"}</p>}
      {experiences.map((exp, i) => (
        <div key={i} className="p-4 rounded-lg border space-y-3 relative">
          <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-7 w-7 p-0" onClick={() => onRemove(i)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Company" required><Input value={exp.company_name} onChange={(e) => onUpdate(i, "company_name", e.target.value)} /></Field>
            <Field label="Designation" required><Input value={exp.designation} onChange={(e) => onUpdate(i, "designation", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Type">
              <Select value={exp.employment_type || ""} onValueChange={(v) => onUpdate(i, "employment_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{EMPLOYMENT_TYPES.map((t) => <SelectItem key={t} value={t.toLowerCase()}>{t}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Start Date" required><Input type="date" value={exp.start_date || ""} onChange={(e) => onUpdate(i, "start_date", e.target.value)} /></Field>
            <Field label="End Date"><Input type="date" value={exp.end_date || ""} onChange={(e) => onUpdate(i, "end_date", e.target.value)} disabled={exp.is_current} /></Field>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox id={`current-${i}`} checked={exp.is_current || false} onCheckedChange={(c) => onUpdate(i, "is_current", !!c)} />
            <Label htmlFor={`current-${i}`} className="cursor-pointer text-sm">{isBn ? "বর্তমানে কাজ করছেন" : "Currently working here"}</Label>
          </div>
          <Field label="Responsibilities"><Textarea value={exp.responsibilities || ""} onChange={(e) => onUpdate(i, "responsibilities", e.target.value)} rows={2} /></Field>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1" /> {isBn ? "অভিজ্ঞতা যোগ করুন" : "Add Experience"}
      </Button>
    </div>
  );
}