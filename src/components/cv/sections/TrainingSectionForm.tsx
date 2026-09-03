"use client";

import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toSafeStrings } from "./utils";

export default function TrainingSectionForm({ data, onChange, isBn }: { data: any[]; onChange: (d: any) => void; isBn: boolean }) {
  const addEntry = () => onChange(toSafeStrings([...data, { institute: "", title: "", duration: "" }]));
  const remove = (i: number) => onChange(toSafeStrings(data.filter((_, idx) => idx !== i)));
  const update = (i: number, key: string, val: string) => { const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(toSafeStrings(n)); };

  return (
    <div className="space-y-4">
      {data.map((t, i) => (
        <div key={i} className="p-3 border rounded-lg space-y-2 relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(i)}><X className="h-3 w-3" /></Button>
          <Input value={t.title || ""} onChange={(e) => update(i, "title", e.target.value)} placeholder={isBn ? "শিরোনাম" : "Training Title"} className="h-8 text-sm" />
          <Input value={t.institute || ""} onChange={(e) => update(i, "institute", e.target.value)} placeholder={isBn ? "প্রতিষ্ঠান" : "Institute"} className="h-8 text-sm" />
          <Input value={t.duration || ""} onChange={(e) => update(i, "duration", e.target.value)} placeholder={isBn ? "সময়কাল (যেমন: ৬ মাস)" : "Duration (e.g. 6 months)"} className="h-8 text-sm" />
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addEntry} className="w-full"><Plus className="h-3.5 w-3.5 mr-1" />{isBn ? "প্রশিক্ষণ যোগ" : "Add Training"}</Button>
    </div>
  );
}
