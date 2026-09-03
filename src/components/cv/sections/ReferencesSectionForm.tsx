"use client";

import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toSafeStrings } from "./utils";

export default function ReferencesSectionForm({ data, onChange, isBn }: { data: any[]; onChange: (d: any) => void; isBn: boolean }) {
  const addEntry = () => onChange(toSafeStrings([...data, { name: "", designation: "", organization: "", phone: "", email: "" }]));
  const remove = (i: number) => onChange(toSafeStrings(data.filter((_, idx) => idx !== i)));
  const update = (i: number, key: string, val: string) => { const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(toSafeStrings(n)); };

  return (
    <div className="space-y-4">
      {data.map((ref, i) => (
        <div key={i} className="p-3 border rounded-lg space-y-2 relative">
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(i)}><X className="h-3 w-3" /></Button>
          <Input value={ref.name || ""} onChange={(e) => update(i, "name", e.target.value)} placeholder={isBn ? "নাম" : "Name"} className="h-8 text-sm" />
          <Input value={ref.designation || ""} onChange={(e) => update(i, "designation", e.target.value)} placeholder={isBn ? "পদবি" : "Designation"} className="h-8 text-sm" />
          <Input value={ref.organization || ""} onChange={(e) => update(i, "organization", e.target.value)} placeholder={isBn ? "প্রতিষ্ঠান" : "Organization"} className="h-8 text-sm" />
          <div className="grid grid-cols-2 gap-2">
            <Input value={ref.phone || ""} onChange={(e) => update(i, "phone", e.target.value)} placeholder={isBn ? "ফোন" : "Phone"} className="h-8 text-sm" />
            <Input value={ref.email || ""} onChange={(e) => update(i, "email", e.target.value)} placeholder={isBn ? "ইমেইল" : "Email"} className="h-8 text-sm" />
          </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addEntry} className="w-full"><Plus className="h-3.5 w-3.5 mr-1" />{isBn ? "রেফারেন্স যোগ" : "Add Reference"}</Button>
    </div>
  );
}
