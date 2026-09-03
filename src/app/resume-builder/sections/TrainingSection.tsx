"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: { title: string; institute: string; duration: string }[];
  onChange: (d: { title: string; institute: string; duration: string }[]) => void;
  isBn: boolean;
}

export default function TrainingSection({ data, onChange, isBn }: Props) {
  const add = () => onChange([...data, { title: "", institute: "", duration: "" }]);
  const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
  const update = (i: number, key: string, val: string) => {
    const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(n);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Training</h3>
        <Button size="sm" variant="outline" onClick={add}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
      </div>
      {data.length === 0 && <p className="text-sm text-muted-foreground">No training added yet.</p>}
      {data.map((t, i) => (
        <div key={i} className="p-3 border rounded-lg space-y-2 relative">
          <button onClick={() => remove(i)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          <div className="space-y-1.5"><Label className="text-xs">Title</Label><Input value={t.title} onChange={(e) => update(i, "title", e.target.value)} placeholder="e.g. React Advanced Workshop" className="text-sm" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5"><Label className="text-xs">Institute</Label><Input value={t.institute} onChange={(e) => update(i, "institute", e.target.value)} className="text-sm" /></div>
            <div className="space-y-1.5"><Label className="text-xs">Duration</Label><Input value={t.duration} onChange={(e) => update(i, "duration", e.target.value)} placeholder="e.g. 3 months" className="text-sm" /></div>
          </div>
        </div>
      ))}
    </div>
  );
}
