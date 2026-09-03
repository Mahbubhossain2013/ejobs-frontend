"use client";

import React from "react";
import Field from "./Field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { CandidateEducationEntry } from "@/types";

const EDUCATION_LEVELS = [
  { value: "ssc", label: "SSC / O-Level" },
  { value: "hsc", label: "HSC / A-Level" },
  { value: "graduation", label: "Bachelor's / Graduation" },
  { value: "post_graduation", label: "Master's / Post Graduation" },
  { value: "diploma", label: "Diploma" },
  { value: "phd", label: "PhD" },
];

interface Props {
  isBn: boolean;
  educations: CandidateEducationEntry[];
  onUpdate: (i: number, field: string, value: any) => void;
  onRemove: (i: number) => void;
  onAdd: () => void;
}

export default function ProfileSectionEducation({ isBn, educations, onUpdate, onRemove, onAdd }: Props) {
  return (
    <div className="space-y-4">
      {educations.length === 0 && <p className="text-sm text-muted-foreground">{isBn ? "কোনো শিক্ষা যোগ করা হয়নি" : "No education entries yet"}</p>}
      {educations.map((edu, i) => (
        <div key={i} className="p-4 rounded-lg border space-y-3 relative">
          <Button size="sm" variant="ghost" className="absolute top-2 right-2 h-7 w-7 p-0" onClick={() => onRemove(i)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Level" required>
              <Select value={edu.level} onValueChange={(v) => onUpdate(i, "level", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{EDUCATION_LEVELS.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={edu.level === "graduation" || edu.level === "post_graduation" ? "Degree" : "Board"}>
              <Input value={edu.level === "graduation" || edu.level === "post_graduation" ? (edu.degree_name || "") : (edu.board || "")}
                onChange={(e) => onUpdate(i, edu.level === "graduation" || edu.level === "post_graduation" ? "degree_name" : "board", e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label={edu.level === "graduation" || edu.level === "post_graduation" ? "Subject" : "Group"}>
              <Input value={edu.group_or_subject || ""} onChange={(e) => onUpdate(i, "group_or_subject", e.target.value)} />
            </Field>
            <Field label="Institute">
              <Input value={edu.institute_name || ""} onChange={(e) => onUpdate(i, "institute_name", e.target.value)} />
            </Field>
            <Field label="Year">
              <Input type="number" value={edu.passing_year || ""} onChange={(e) => onUpdate(i, "passing_year", parseInt(e.target.value) || undefined)} />
            </Field>
          </div>
          <div className="w-32">
            <Field label={edu.level === "graduation" || edu.level === "post_graduation" ? "CGPA" : "GPA"}>
              <Input type="number" step="0.01" max="5" value={edu.gpa_or_cgpa || ""}
                onChange={(e) => onUpdate(i, "gpa_or_cgpa", parseFloat(e.target.value) || undefined)} />
            </Field>
          </div>
        </div>
      ))}
      <Button size="sm" variant="outline" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1" /> {isBn ? "শিক্ষা যোগ করুন" : "Add Education"}
      </Button>
    </div>
  );
}