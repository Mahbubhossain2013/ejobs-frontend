"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Users } from "lucide-react";

interface Props {
  data: { name: string; designation: string; organization: string; phone: string; email: string; relation?: string }[];
  onChange: (d: { name: string; designation: string; organization: string; phone: string; email: string; relation?: string }[]) => void;
  isBn: boolean;
}

export default function ReferencesSection({ data, onChange, isBn }: Props) {
  const add = () => onChange([...data, { name: "", designation: "", organization: "", phone: "", email: "", relation: "" }]);
  const remove = (i: number) => onChange(data.filter((_, idx) => idx !== i));
  const update = (i: number, key: string, val: string) => {
    const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(n);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <span>{isBn ? "রেফারেন্স / সুপারিশকারী (References)" : "References"}</span>
        </h3>
        <Button size="sm" variant="outline" onClick={add}>
          <Plus className="h-3.5 w-3.5 mr-1" />{isBn ? "রেফারেন্স যোগ করুন" : "Add Reference"}
        </Button>
      </div>

      {data.length === 0 && (
        <p className="text-sm text-muted-foreground italic py-2">{isBn ? "কোনো রেফারেন্স যোগ করা হয়নি (সাধারণত ২টি রেফারেন্স যোগ করা ভালো)।" : "No references added yet (2 professional references recommended)."}</p>
      )}

      {data.map((ref, i) => (
        <div key={i} className="p-4 border rounded-xl space-y-3 relative bg-card shadow-sm">
          <button onClick={() => remove(i)} className="absolute top-3 right-3 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pr-8">
            <div className="space-y-1">
              <Label className="text-xs font-medium">{isBn ? "রেফারেন্স ব্যক্তির নাম" : "Reference Name"} <span className="text-destructive">*</span></Label>
              <Input value={ref.name} onChange={(e) => update(i, "name", e.target.value)} placeholder={isBn ? "যেমন: ড. মো: আব্দুর রহিম" : "e.g. Dr. John Smith"} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">{isBn ? "সম্পর্ক (Relation)" : "Relation"}</Label>
              <Input value={ref.relation || ""} onChange={(e) => update(i, "relation", e.target.value)} placeholder={isBn ? "যেমন: প্রাক্তন ম্যানেজার / প্রফেসর" : "e.g. Former Manager / Academic Advisor"} className="h-9 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">{isBn ? "পদবী" : "Designation"}</Label>
              <Input value={ref.designation} onChange={(e) => update(i, "designation", e.target.value)} placeholder={isBn ? "যেমন: বিভাগীয় প্রধান / ডিরেক্টর" : "e.g. Head of Department / Director"} className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">{isBn ? "কোম্পানি / প্রতিষ্ঠান" : "Organization / Institution"}</Label>
              <Input value={ref.organization} onChange={(e) => update(i, "organization", e.target.value)} placeholder={isBn ? "যেমন: ঢাকা বিশ্ববিদ্যালয়" : "e.g. University of Dhaka"} className="h-9 text-sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-medium">{isBn ? "ফোন নম্বর" : "Phone Number"}</Label>
              <Input value={ref.phone} onChange={(e) => update(i, "phone", e.target.value)} placeholder="+880 17XXXXXXXX" className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-medium">{isBn ? "ইমেইল ঠিকানা" : "Email Address"}</Label>
              <Input type="email" value={ref.email} onChange={(e) => update(i, "email", e.target.value)} placeholder="ref.email@org.com" className="h-9 text-sm" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
