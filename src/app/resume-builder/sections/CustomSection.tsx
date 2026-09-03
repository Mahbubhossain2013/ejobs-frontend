"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

interface Props { data: any[]; onChange: (d: any[]) => void; isBn: boolean; }

export default function CustomSection({ data, onChange, isBn }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">Custom section</h3>
      {data.map((sec, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between p-3 hover:bg-muted/50 text-left">
            <span className="text-sm font-medium">{sec.title || "Custom section"}</span>
          </button>
          {openIdx === i && (
            <div className="p-3 border-t space-y-3">
              <div className="space-y-1"><Label className="text-xs">Title</Label><Input value={sec.title} onChange={(e) => { const n = [...data]; n[i] = { ...n[i], title: e.target.value }; onChange(n); }} placeholder="Section title" className="h-8 text-sm" /></div>
              <div className="space-y-1"><Label className="text-xs">Description</Label><Textarea value={sec.description} onChange={(e) => { const n = [...data]; n[i] = { ...n[i], description: e.target.value }; onChange(n); }} rows={3} className="text-sm" /></div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onChange(data.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
                <Button size="sm" onClick={() => toast.success("Saved!")}><Save className="h-3.5 w-3.5 mr-1" />Save</Button>
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => { onChange([...data, { title: "", description: "" }]); setOpenIdx(data.length); }}><Plus className="h-4 w-4 mr-1" />Add extra section</Button>
    </div>
  );
}