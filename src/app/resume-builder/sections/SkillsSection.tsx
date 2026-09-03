"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Expert"];
interface Props { data: any[]; onChange: (d: any[]) => void; isBn: boolean; }

export default function SkillsSection({ data, onChange, isBn }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">Skills</h3>
      {data.map((skill, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between p-3 hover:bg-muted/50 text-left">
            <span className="text-sm font-medium">{skill.skill || "Skill entry"}</span>
            <span className="text-xs text-muted-foreground">{skill.level}</span>
          </button>
          {openIdx === i && (
            <div className="p-3 border-t space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Skill</Label><div className="relative"><Input value={skill.skill} onChange={(e) => { const n = [...data]; n[i] = { ...n[i], skill: e.target.value }; onChange(n); }} placeholder="e.g. Microsoft Word" className="h-8 text-sm" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{(skill.skill || "").length}/50</span></div></div>
                <div className="space-y-1"><Label className="text-xs">Level</Label>
                  <Select value={skill.level || ""} onValueChange={(v) => { const n = [...data]; n[i] = { ...n[i], level: v }; onChange(n); }}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select level" /></SelectTrigger>
                    <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onChange(data.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5 mr-1" />Delete</Button>
                <Button size="sm" onClick={() => toast.success("Saved!")}><Save className="h-3.5 w-3.5 mr-1" />Save</Button>
              </div>
            </div>
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => { onChange([...data, { skill: "", level: "" }]); setOpenIdx(data.length); }}><Plus className="h-4 w-4 mr-1" />Add another skill</Button>
    </div>
  );
}