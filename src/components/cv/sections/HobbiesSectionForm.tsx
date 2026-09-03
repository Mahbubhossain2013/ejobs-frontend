"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toSafeStrings } from "./utils";

export default function HobbiesSectionForm({ data, onChange, isBn }: { data: any[]; onChange: (d: any) => void; isBn: boolean }) {
  const [newHobby, setNewHobby] = useState("");
  const addHobby = () => { if (!newHobby.trim()) return; onChange(toSafeStrings([...data, newHobby.trim()])); setNewHobby(""); };
  const removeHobby = (i: number) => onChange(toSafeStrings(data.filter((_, idx) => idx !== i)));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5 min-h-[40px]">
        {data.map((hobby, i) => (
          <Badge key={i} variant="secondary" className="text-xs gap-1">
            {typeof hobby === "string" ? hobby : hobby.name || hobby}
            <button onClick={() => removeHobby(i)} className="ml-0.5 hover:text-destructive"><X className="h-2.5 w-2.5" /></button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={newHobby} onChange={(e) => setNewHobby(e.target.value)} placeholder={isBn ? "শখ..." : "Hobby..."} className="h-8 text-sm flex-1" onKeyDown={(e) => e.key === "Enter" && addHobby()} />
        <Button size="sm" onClick={addHobby}><Plus className="h-3.5 w-3.5" /></Button>
      </div>
    </div>
  );
}