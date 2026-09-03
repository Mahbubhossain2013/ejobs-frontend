"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toSafeStrings } from "./utils";

export default function ProjectsSectionForm({ data, onChange, isBn }: { data: any[]; onChange: (d: any) => void; isBn: boolean }) {
  const addEntry = () => onChange(toSafeStrings([...data, { name: "", description: "", url: "", technologies: "", supervisor: "" }]));
  const update = (i: number, key: string, val: string) => { const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(toSafeStrings(n)); };
  const remove = (i: number) => onChange(toSafeStrings(data.filter((_, idx) => idx !== i)));

  return (
    <div className="space-y-4">
      {data.map((proj, i) => (
        <div key={i} className="p-3 border rounded-lg space-y-2 relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(i)}><X className="h-3 w-3" /></Button>
          <Input value={proj.name || proj.project_name || ""} onChange={(e) => update(i, "name", e.target.value)} placeholder={isBn ? "প্রকল্পের নাম" : "Project Name"} className="h-8 text-sm" />
          <Input value={proj.url || ""} onChange={(e) => update(i, "url", e.target.value)} placeholder={isBn ? "লিঙ্ক (ঐচ্ছিক)" : "URL (optional)"} className="h-8 text-sm" />
          <Input value={proj.technologies || ""} onChange={(e) => update(i, "technologies", e.target.value)} placeholder={isBn ? "প্রযুক্তি (কমা দিয়ে)" : "Technologies (comma-separated)"} className="h-8 text-sm" />
          <Input value={proj.supervisor || ""} onChange={(e) => update(i, "supervisor", e.target.value)} placeholder={isBn ? "সুপারভাইজার (ঐচ্ছিক)" : "Supervisor (optional)"} className="h-8 text-sm" />
          <Textarea value={proj.description || ""} onChange={(e) => update(i, "description", e.target.value)} placeholder={isBn ? "বিবরণ..." : "Description..."} className="min-h-[60px] text-sm" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addEntry} className="w-full"><Plus className="h-3.5 w-3.5 mr-1" />{isBn ? "প্রকল্প যোগ" : "Add Project"}</Button>
    </div>
  );
}