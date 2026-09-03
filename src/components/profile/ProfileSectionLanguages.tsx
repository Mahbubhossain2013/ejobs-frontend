"use client";

import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { LanguageProficiency } from "@/types";

const LANGUAGE_LIST = ["Bengali", "English", "Hindi", "Arabic", "Chinese", "Japanese", "Korean", "French", "German", "Spanish"];

interface Props {
  isBn: boolean;
  languages: LanguageProficiency[];
  onToggle: (lang: string) => void;
  onUpdate: (lang: string, field: "read" | "write" | "speak", value: boolean) => void;
}

export default function ProfileSectionLanguages({ languages, onToggle, onUpdate }: Props) {
  return (
    <div className="space-y-4">
      {LANGUAGE_LIST.map((lang) => {
        const entry = languages.find((l) => l.name === lang);
        const active = !!entry;
        return (
          <div key={lang} className="flex items-center gap-4 p-2 rounded-lg border">
            <div className="flex items-center gap-2 w-32">
              <Checkbox id={`lang-${lang}`} checked={active} onCheckedChange={() => onToggle(lang)} />
              <Label htmlFor={`lang-${lang}`} className="cursor-pointer text-sm font-medium">{lang}</Label>
            </div>
            {active && (
              <div className="flex gap-4">
                {(["read", "write", "speak"] as const).map((skill) => (
                  <div key={skill} className="flex items-center gap-1">
                    <Checkbox id={`${lang}-${skill}`} checked={entry![skill]} onCheckedChange={(c) => onUpdate(lang, skill, !!c)} />
                    <Label htmlFor={`${lang}-${skill}`} className="cursor-pointer text-xs capitalize">{skill}</Label>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}