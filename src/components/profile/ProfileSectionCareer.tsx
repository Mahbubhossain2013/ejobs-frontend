"use client";

import React from "react";
import Field from "./Field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Props {
  isBn: boolean;
  careerObjective: string; setCareerObjective: (v: string) => void;
  currentProfession: string; setCurrentProfession: (v: string) => void;
  expectedJobCategory: string; setExpectedJobCategory: (v: string) => void;
  preferredLocation: string; setPreferredLocation: (v: string) => void;
  expectedSalary: string; setExpectedSalary: (v: string) => void;
  availableRemote: boolean; setAvailableRemote: (v: boolean) => void;
  availableRelocation: boolean; setAvailableRelocation: (v: boolean) => void;
}

export default function ProfileSectionCareer({
  isBn, careerObjective, setCareerObjective,
  currentProfession, setCurrentProfession,
  expectedJobCategory, setExpectedJobCategory,
  preferredLocation, setPreferredLocation,
  expectedSalary, setExpectedSalary,
  availableRemote, setAvailableRemote,
  availableRelocation, setAvailableRelocation,
}: Props) {
  return (
    <div className="space-y-4">
      <Field label={isBn ? "ক্যারিয়ার উদ্দেশ্য" : "Career Objective"}>
        <Textarea value={careerObjective} onChange={(e) => setCareerObjective(e.target.value)} rows={3}
          placeholder={isBn ? "আপনার ক্যারিয়ার লক্ষ্য লিখুন..." : "Write your career objective..."} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "বর্তমান পেশা" : "Current Profession"}>
          <Input value={currentProfession} onChange={(e) => setCurrentProfession(e.target.value)} />
        </Field>
        <Field label={isBn ? "প্রত্যাশিত বেতন" : "Expected Salary (BDT)"}>
          <Input value={expectedSalary} onChange={(e) => setExpectedSalary(e.target.value)} placeholder="e.g. 25000-40000" />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={isBn ? "পছন্দের ক্যাটাগরি" : "Expected Job Category"}>
          <Input value={expectedJobCategory} onChange={(e) => setExpectedJobCategory(e.target.value)} />
        </Field>
        <Field label={isBn ? "পছন্দের লোকেশন" : "Preferred Location"}>
          <Input value={preferredLocation} onChange={(e) => setPreferredLocation(e.target.value)} />
        </Field>
      </div>
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Checkbox id="remote" checked={availableRemote} onCheckedChange={(c) => setAvailableRemote(!!c)} />
          <Label htmlFor="remote" className="cursor-pointer">{isBn ? "রিমোট কাজের জন্য প্রস্তুত" : "Available for Remote Work"}</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="reloc" checked={availableRelocation} onCheckedChange={(c) => setAvailableRelocation(!!c)} />
          <Label htmlFor="reloc" className="cursor-pointer">{isBn ? "স্থানান্তরের জন্য প্রস্তুত" : "Available for Relocation"}</Label>
        </div>
      </div>
    </div>
  );
}