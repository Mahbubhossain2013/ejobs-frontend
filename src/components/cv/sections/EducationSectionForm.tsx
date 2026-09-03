"use client";

import { useState } from "react";
import { X, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toSafeStrings } from "./utils";

export default function EducationSectionForm({ data, onChange, isBn }: { data: any[]; onChange: (d: any) => void; isBn: boolean }) {
  const addEntry = () => onChange(toSafeStrings([...data, {
    degree: "", institution: "", board: "", field: "",
    group_or_subject: "", start_date: "", end_date: "",
    year: "", result: "", gpa_or_cgpa: "", description: "",
    registration_number: "",
  }]));
  const remove = (i: number) => onChange(toSafeStrings(data.filter((_, idx) => idx !== i)));
  const update = (i: number, key: string, val: any) => {
    const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(toSafeStrings(n));
  };
  const updateMulti = (i: number, keys: Record<string, any>) => {
    const n = [...data]; n[i] = { ...n[i], ...keys }; onChange(toSafeStrings(n));
  };

  return (
    <div className="space-y-4">
      {data.map((edu, i) => {
        const level = edu.degree || edu.level || "";
        const isHigherEdu = level === "graduation" || level === "post_graduation" || level === "phd";
        const levelLabel = isHigherEdu ? (isBn ? "ডিগ্রি" : "Degree") : (isBn ? "পর্যায়" : "Level");

        return (
          <div key={i} className="p-3 border rounded-lg space-y-3 relative">
            <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-6 w-6" onClick={() => remove(i)}><X className="h-3 w-3" /></Button>

            <div>
              <Label className="text-[10px] text-muted-foreground">{levelLabel} *</Label>
              <Input value={edu.degree || ""} onChange={(e) => update(i, "degree", e.target.value)} placeholder={isBn ? "যেমন: SSC, HSC, B.Sc, M.Sc" : "e.g. SSC, HSC, B.Sc, M.Sc"} className="h-8 text-sm" />
            </div>

            {!isHigherEdu && (
              <div>
                <Label className="text-[10px] text-muted-foreground">{isBn ? "বোর্ড" : "Board"}</Label>
                <Input value={edu.board || ""} onChange={(e) => update(i, "board", e.target.value)} placeholder={isBn ? "যেমন: ঢাকা শিক্ষা বোর্ড" : "e.g. Dhaka Board"} className="h-8 text-sm" />
              </div>
            )}

            <div>
              <Label className="text-[10px] text-muted-foreground">{isBn ? "প্রতিষ্ঠান" : "Institution"} *</Label>
              <Input value={edu.institution || edu.school_name || ""} onChange={(e) => update(i, "institution", e.target.value)} placeholder={isBn ? "প্রতিষ্ঠানের নাম" : "School / College / University name"} className="h-8 text-sm" />
            </div>

            <div>
              <Label className="text-[10px] text-muted-foreground">{isBn ? "স্থান" : "Location"}</Label>
              <Input value={edu.location || ""} onChange={(e) => update(i, "location", e.target.value)} placeholder={isBn ? "যেমন: ঢাকা" : "e.g. Dhaka"} className="h-8 text-sm" />
            </div>

            <div>
              <Label className="text-[10px] text-muted-foreground">{isBn ? "বিষয় / গ্রুপ" : "Group / Subject / Field"}</Label>
              <Input value={edu.field || edu.group_or_subject || ""} onChange={(e) => updateMulti(i, { field: e.target.value, group_or_subject: e.target.value })} placeholder={isHigherEdu ? (isBn ? "বিষয় (যেমন: CSE)" : "Subject (e.g. CSE)") : (isBn ? "গ্রুপ (যেমন: বিজ্ঞান)" : "Group (e.g. Science)")} className="h-8 text-sm" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">{isBn ? "পাশের সাল" : "Passing Year"}</Label>
                <Input type="number" value={edu.year || edu.passing_year || ""} onChange={(e) => updateMulti(i, { year: e.target.value, passing_year: e.target.value })} placeholder={isBn ? "২০২২" : "2022"} className="h-8 text-sm" min="1950" max="2099" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">{isBn ? "বছর" : "Duration (Year)"}</Label>
                <Input value={edu.duration || ""} onChange={(e) => update(i, "duration", e.target.value)} placeholder={isBn ? "যেমন: ২০২০-২০২২" : "e.g. 2020-2022"} className="h-8 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[10px] text-muted-foreground">{isHigherEdu ? "CGPA" : "GPA"}</Label>
                <Input type="number" step="0.01" max="5" value={edu.gpa_or_cgpa || edu.gpa || ""} onChange={(e) => updateMulti(i, { gpa_or_cgpa: e.target.value, gpa: e.target.value, cgpa: e.target.value })} placeholder={isHigherEdu ? "CGPA (e.g. 3.80)" : "GPA (e.g. 5.00)"} className="h-8 text-sm" />
              </div>
              <div>
                <Label className="text-[10px] text-muted-foreground">{isBn ? "গ্রেড / ফলাফল" : "Grade / Result"}</Label>
                <Input value={edu.grade || edu.result || ""} onChange={(e) => updateMulti(i, { grade: e.target.value, result: e.target.value })} placeholder={isBn ? "যেমন: A+" : "e.g. A+, First Class"} className="h-8 text-sm" />
              </div>
            </div>

            <div>
              <Label className="text-[10px] text-muted-foreground">{isBn ? "রেজিস্ট্রেশন / আরএন নম্বর" : "Registration / RN Number"}</Label>
              <Input value={edu.registration_number || ""} onChange={(e) => update(i, "registration_number", e.target.value)} placeholder={isBn ? "যেমন: ৯০৬৭৫" : "e.g. 90675"} className="h-8 text-sm" />
            </div>

            <div>
              <Label className="text-[10px] text-muted-foreground">{isBn ? "অতিরিক্ত তথ্য" : "Additional Info"}</Label>
              <Textarea value={edu.description || ""} onChange={(e) => update(i, "description", e.target.value)} placeholder={isBn ? "অতিরিক্ত তথ্য (ঐচ্ছিক)" : "Any extra info (optional)"} className="min-h-[40px] text-sm" />
            </div>
          </div>
        );
      })}
      <Button variant="outline" size="sm" onClick={addEntry} className="w-full"><Plus className="h-3.5 w-3.5 mr-1" />{isBn ? "শিক্ষা যোগ" : "Add Education"}</Button>
    </div>
  );
}