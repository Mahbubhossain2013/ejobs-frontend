"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface Props {
  data: { name: string; description: string; url: string }[];
  onChange: (d: { name: string; description: string; url: string }[]) => void;
  isBn: boolean;
}

export default function ProjectsSection({ data, onChange, isBn }: Props) {
  const add = () => onChange([...data, { name: "", description: "", url: "" }]);
  const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
  const update = (i: number, key: string, val: string) => {
    const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(n);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-semibold">Projects</h3>
        <Button size="sm" variant="outline" onClick={add}><Plus className="h-3.5 w-3.5 mr-1" />Add</Button>
      </div>
      {data.length === 0 && <p className="text-sm text-muted-foreground">No projects added yet.</p>}
      {data.map((proj, i) => (
        <div key={i} className="p-3 border rounded-lg space-y-2 relative">
          <button onClick={() => remove(i)} className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
          <div className="space-y-1.5"><Label className="text-xs">Project Name</Label><Input value={proj.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="e.g. E-Commerce Platform" className="text-sm" /></div>
          <div className="space-y-1.5"><Label className="text-xs">Description</Label><Textarea value={proj.description} onChange={(e) => update(i, "description", e.target.value)} rows={3} className="text-sm" /></div>
          <div className="space-y-1.5"><Label className="text-xs">URL (optional)</Label><Input value={proj.url} onChange={(e) => update(i, "url", e.target.value)} placeholder="https://..." className="text-sm" /></div>
        </div>
      ))}
    </div>
  );
}
