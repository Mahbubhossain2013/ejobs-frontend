"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Props { data: any[]; onChange: (d: any[]) => void; isBn: boolean; }

export default function AchievementsSection({ data, onChange, isBn }: Props) {
  const add = () => onChange([...data, { description: "" }]);
  const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
  const update = (i: number, val: string) => {
    const n = [...data]; n[i] = { ...n[i], description: val }; onChange(n);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Achievements</h3>
        <Button size="sm" variant="outline" onClick={add}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
      </div>
      {data.length === 0 && <p className="text-sm text-muted-foreground">No achievements added yet.</p>}
      {data.map((entry, i) => (
        <div key={i} className="space-y-1.5 relative">
          {data.length > 1 && (
            <button onClick={() => remove(i)} className="absolute top-1 right-1 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          )}
          <Label className="text-xs">Achievement {i + 1}</Label>
          <Textarea value={entry.description || ""} onChange={(e) => update(i, e.target.value)} rows={3} placeholder="List your key achievements..." className="text-sm" />
        </div>
      ))}
    </div>
  );
}
