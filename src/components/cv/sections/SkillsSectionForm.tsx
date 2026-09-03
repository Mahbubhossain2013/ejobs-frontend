"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toSafeStrings } from "./utils";

export default function SkillsSectionForm({ data, onChange, isBn }: { data: any[]; onChange: (d: any) => void; isBn: boolean }) {
  const [newSkill, setNewSkill] = useState("");
  const [newLevel, setNewLevel] = useState("intermediate");
  const addSkill = () => { if (!newSkill.trim()) return; onChange(toSafeStrings([...data, { name: newSkill.trim(), level: newLevel }])); setNewSkill(""); };
  const removeSkill = (i: number) => onChange(toSafeStrings(data.filter((_, idx) => idx !== i)));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 min-h-[40px]">
        {data.map((skill, i) => (
          <Badge key={i} variant="secondary" className="text-xs gap-1">
            {typeof skill === "string" ? skill : skill.name}
            {!false && <button onClick={() => removeSkill(i)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>}
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder={isBn ? "দক্ষতা..." : "Skill..."} className="h-8 text-sm flex-1" onKeyDown={(e) => e.key === "Enter" && addSkill()} />
        <Select value={newLevel} onValueChange={setNewLevel}>
          <SelectTrigger className="w-[120px] h-8 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="beginner">{isBn ? "শিক্ষানবিস" : "Beginner"}</SelectItem>
            <SelectItem value="intermediate">{isBn ? "মধ্যম" : "Intermediate"}</SelectItem>
            <SelectItem value="advanced">{isBn ? "উন্নত" : "Advanced"}</SelectItem>
            <SelectItem value="expert">{isBn ? "বিশেষজ্ঞ" : "Expert"}</SelectItem>
          </SelectContent>
        </Select>
        <Button size="sm" onClick={addSkill}><Plus className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}