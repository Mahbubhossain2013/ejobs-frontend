"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save } from "lucide-react";
import { toast } from "sonner";

const LEVELS = ["Elementary", "Conversational", "Professional", "Native"];
interface Props { data: any[]; onChange: (d: any[]) => void; isBn: boolean; }

export default function LanguagesSection({ data, onChange, isBn }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">Languages</h3>
      {data.map((lang, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between p-3 hover:bg-muted/50 text-left">
            <span className="text-sm font-medium">{lang.language || "Language entry"}</span>
            <span className="text-xs text-muted-foreground">{lang.level}</span>
          </button>
          {openIdx === i && (
            <div className="p-3 border-t space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs">Language</Label><Input value={lang.language} onChange={(e) => { const n = [...data]; n[i] = { ...n[i], language: e.target.value }; onChange(n); }} placeholder="e.g. Spanish" className="h-8 text-sm" /></div>
                <div className="space-y-1"><Label className="text-xs">Level</Label>
                  <Select value={lang.level || ""} onValueChange={(v) => { const n = [...data]; n[i] = { ...n[i], level: v }; onChange(n); }}>
                    <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
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
      <Button variant="outline" size="sm" onClick={() => { onChange([...data, { language: "", level: "" }]); setOpenIdx(data.length); }}><Plus className="h-4 w-4 mr-1" />Add another language</Button>
    </div>
  );
}