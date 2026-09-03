"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toSafeStrings } from "./utils";

export default function ExperienceSectionForm({ data, onChange, isBn }: { data: any[]; onChange: (d: any) => void; isBn: boolean }) {
  const addEntry = () => onChange(toSafeStrings([...data, { company: "", position: "", location: "", department: "", start_date: "", end_date: "", is_current: false, description: "" }]));
  const remove = (i: number) => onChange(toSafeStrings(data.filter((_, idx) => idx !== i)));
  const update = (i: number, key: string, val: any) => {
    const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(toSafeStrings(n));
  };

  return (
    <div className="space-y-4">
      {data.map((exp, i) => (
        <div key={i} className="p-3 border rounded-lg space-y-2 relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(i)}><X className="h-3 w-3" /></Button>
          <Input value={exp.position || exp.job_title || ""} onChange={(e) => update(i, "position", e.target.value)} placeholder={isBn ? "পদবি / শিরোনাম" : "Job Title / Position"} className="h-8 text-sm" />
          <Input value={exp.company || exp.company_name || ""} onChange={(e) => update(i, "company", e.target.value)} placeholder={isBn ? "কোম্পানি / প্রতিষ্ঠান" : "Company / Organization"} className="h-8 text-sm" />
          <Input value={exp.department || ""} onChange={(e) => update(i, "department", e.target.value)} placeholder={isBn ? "বিভাগ (ঐচ্ছিক)" : "Department (optional)"} className="h-8 text-sm" />
          <Input value={exp.location || ""} onChange={(e) => update(i, "location", e.target.value)} placeholder={isBn ? "স্থান (ঐচ্ছিক)" : "Location (optional)"} className="h-8 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-[10px] text-muted-foreground">{isBn ? "শুরু" : "Start"}</Label>
              <Input type="date" value={exp.start_date || ""} onChange={(e) => update(i, "start_date", e.target.value)} className="h-8 text-sm" />
            </div>
            <div>
              <Label className="text-[10px] text-muted-foreground">{isBn ? "শেষ" : "End"}</Label>
              <Input type="date" value={exp.end_date || ""} onChange={(e) => update(i, "end_date", e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
          <Textarea value={exp.description || ""} onChange={(e) => update(i, "description", e.target.value)} placeholder={isBn ? "দায়িত্ব / অর্জন..." : "Responsibilities / Achievements..."} className="min-h-[60px] text-sm" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addEntry} className="w-full"><Plus className="h-3.5 w-3.5 mr-1" />{isBn ? "অভিজ্ঞতা যোগ" : "Add Experience"}</Button>
    </div>
  );
}