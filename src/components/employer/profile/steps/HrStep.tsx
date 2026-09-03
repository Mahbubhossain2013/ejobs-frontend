"use client";

import { Field, TextInput } from "../shared";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileState } from "../types";

export default function HrStep({ state, isBn }: { state: ProfileState; isBn: boolean }) {
  const s = state;
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="HR Manager"><TextInput value={s.hrName} onChange={s.setHrName} /></Field>
        <Field label="HR Phone"><TextInput value={s.hrPhone} onChange={s.setHrPhone} /></Field>
        <Field label="HR Email"><TextInput type="email" value={s.hrEmail} onChange={s.setHrEmail} /></Field>
      </div>
      <Field label={isBn ? "নিয়োগ নীতি" : "Recruitment Policy"}><Textarea value={s.recruitmentPolicy} onChange={(e) => s.setRecruitmentPolicy(e.target.value)} rows={3} /></Field>
      <Field label={isBn ? "নিয়োগ প্রক্রিয়া" : "Hiring Process"}><Textarea value={s.hiringProcess} onChange={(e) => s.setHiringProcess(e.target.value)} rows={3} /></Field>
    </div>
  );
}