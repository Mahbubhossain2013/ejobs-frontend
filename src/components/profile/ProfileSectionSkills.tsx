"use client";

import React from "react";
import Field from "./Field";
import { Input } from "@/components/ui/input";

interface Props {
  isBn: boolean;
  skills: string;
  setSkills: (v: string) => void;
}

export default function ProfileSectionSkills({ isBn, skills, setSkills }: Props) {
  return (
    <div className="space-y-4">
      <Field label={isBn ? "দক্ষতা (কমা দিয়ে)" : "Skills (comma-separated)"}>
        <Input value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, Node.js, Python..." />
      </Field>
    </div>
  );
}