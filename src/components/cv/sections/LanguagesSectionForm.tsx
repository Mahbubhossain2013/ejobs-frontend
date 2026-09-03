"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toSafeStrings } from "./utils";

const proficiencies = [
  { value: "basic", en: "Basic", bn: "মৌলিক" },
  { value: "conversational", en: "Conversational", bn: "কথোপকথন" },
  { value: "professional", en: "Professional", bn: "পেশাদার" },
  { value: "native", en: "Native", bn: "মাতৃভাষী" },
];

export default function LanguagesSectionForm({ data, onChange, isBn }: { data: any[]; onChange: (d: any) => void; isBn: boolean }) {
  const addEntry = () => onChange(toSafeStrings([...data, { name: "", proficiency: "intermediate" }]));
  const update = (i: number, key: string, val: string) => { const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(toSafeStrings(n)); };
  const remove = (i: number) => onChange(toSafeStrings(data.filter((_, idx) => idx !== i)));

  return (
    <div className="space-y-3">
      {data.map((lang, i) => (
        <div key={i} className="flex items-center gap-2 p-2 border rounded-lg relative">
          <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-5 w-5" onClick={() => remove(i)}><X className="h-3 w-3" /></Button>
          <Input value={lang.name || ""} onChange={(e) => update(i, "name", e.target.value)} placeholder={isBn ? "ভাষা" : "Language"} className="h-8 text-sm flex-1" />
          <Select value={lang.proficiency || "intermediate"} onValueChange={(v) => update(i, "proficiency", v)}>
            <SelectTrigger className="w-[110px] h-8 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent>{proficiencies.map((p) => <SelectItem key={p.value} value={p.value}>{isBn ? p.bn : p.en}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addEntry} className="w-full"><Plus className="h-3.5 w-3.5 mr-1" />{isBn ? "ভাষা যোগ" : "Add Language"}</Button>
    </div>
  );
}