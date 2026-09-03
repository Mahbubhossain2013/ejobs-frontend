"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toSafeStrings } from "./utils";

export default function AwardsSectionForm({ data, onChange, isBn }: { data: any[]; onChange: (d: any) => void; isBn: boolean }) {
  const addEntry = () => onChange(toSafeStrings([...data, { title: "", issuer: "", date: "" }]));
  const update = (i: number, key: string, val: string) => { const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(toSafeStrings(n)); };
  const remove = (i: number) => onChange(toSafeStrings(data.filter((_, idx) => idx !== i)));

  return (
    <div className="space-y-3">
      {data.map((award, i) => (
        <div key={i} className="p-3 border rounded-lg space-y-2 relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(i)}><X className="h-3 w-3" /></Button>
          <Input value={award.title || ""} onChange={(e) => update(i, "title", e.target.value)} placeholder={isBn ? "পুরস্কার" : "Award"} className="h-8 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={award.issuer || ""} onChange={(e) => update(i, "issuer", e.target.value)} placeholder={isBn ? "প্রদানকারী" : "Issuer"} className="h-8 text-sm" />
            <div>
              <Label className="text-[10px] text-muted-foreground">{isBn ? "তারিখ" : "Date"}</Label>
              <Input type="date" value={award.date || ""} onChange={(e) => update(i, "date", e.target.value)} className="h-8 text-sm" />
            </div>
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addEntry} className="w-full"><Plus className="h-3.5 w-3.5 mr-1" />{isBn ? "পুরস্কার যোগ" : "Add Award"}</Button>
    </div>
  );
}