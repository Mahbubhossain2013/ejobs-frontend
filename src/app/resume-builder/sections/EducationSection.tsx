"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, GraduationCap } from "lucide-react";
import { toast } from "sonner";

const EMPTY = { degree: "", field_of_study: "", school: "", board: "", grade: "", city: "", start_date: "", end_date: "", description: "" };
const MAX = { degree: 100, city: 100, school: 100 };

interface Props { data: any[]; onChange: (d: any[]) => void; isBn: boolean; }

export default function EducationSection({ data, onChange, isBn }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(data.length > 0 ? 0 : null);

  const update = (i: number, key: string, val: string) => {
    const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(n);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-base font-bold flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary" />
          <span>{isBn ? "শিক্ষাগত যোগ্যতা (Education)" : "Education and Qualifications"}</span>
        </h3>
        <Button variant="outline" size="sm" onClick={() => { onChange([...data, { ...EMPTY }]); setOpenIdx(data.length); }}>
          <Plus className="h-4 w-4 mr-1" />{isBn ? "শিক্ষা যোগ করুন" : "Add Education"}
        </Button>
      </div>

      {data.length === 0 && (
        <p className="text-sm text-muted-foreground italic py-2">{isBn ? "কোনো শিক্ষাগত যোগ্যতা যোগ করা হয়নি।" : "No education entries added yet."}</p>
      )}

      {data.map((edu, i) => (
        <div key={i} className="border rounded-xl overflow-hidden bg-card shadow-sm">
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between p-3.5 hover:bg-muted/50 text-left transition-colors">
            <div>
              <span className="text-sm font-semibold truncate block">{edu.degree || edu.school || (isBn ? "নতুন শিক্ষাগত যোগ্যতা" : "Education entry")}</span>
              <span className="text-xs text-muted-foreground">{edu.school ? edu.school + " • " : ""}{edu.field_of_study || ""}</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">{edu.start_date || "—"} - {edu.end_date || "—"}</span>
          </button>

          {openIdx === i && (
            <div className="p-4 border-t space-y-3 bg-muted/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "ডিগ্রি / সনদের নাম" : "Degree / Certificate"} <span className="text-destructive">*</span></Label>
                  <div className="relative"><Input value={edu.degree} onChange={(e) => update(i, "degree", e.target.value)} placeholder={isBn ? "যেমন: B.Sc in CSE / MBA / HSC / SSC" : "e.g. Bachelor of Science in CSE"} className="h-9 text-sm" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{edu.degree.length}/{MAX.degree}</span></div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "বিভাগ / প্রধান বিষয় (Major / Department)" : "Major / Field of Study"}</Label>
                  <Input value={edu.field_of_study || ""} onChange={(e) => update(i, "field_of_study", e.target.value)} placeholder={isBn ? "যেমন: Computer Science / Science / Business" : "e.g. Computer Science"} className="h-9 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "প্রতিষ্ঠান / বিশ্ববিদ্যালয়ের নাম" : "School / College / University"} <span className="text-destructive">*</span></Label>
                  <div className="relative"><Input value={edu.school} onChange={(e) => update(i, "school", e.target.value)} placeholder={isBn ? "যেমন: ঢাকা বিশ্ববিদ্যালয় / নর্থ সাউথ" : "e.g. University of Dhaka"} className="h-9 text-sm" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{edu.school.length}/{MAX.school}</span></div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "বোর্ড / বিশ্ববিদ্যালয় (ঐচ্ছিক)" : "Board / University"}</Label>
                  <Input value={edu.board || ""} onChange={(e) => update(i, "board", e.target.value)} placeholder={isBn ? "যেমন: Dhaka Board / National University" : "e.g. Dhaka Board"} className="h-9 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "ফলাফল / CGPA / GPA" : "Result / CGPA / Grade"}</Label>
                  <Input value={edu.grade || ""} onChange={(e) => update(i, "grade", e.target.value)} placeholder="e.g. CGPA 3.85 / GPA 5.00 / 1st Division" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "শুরুর তারিখ / বছর" : "Start Date / Year"}</Label>
                  <Input type="text" value={edu.start_date} onChange={(e) => update(i, "start_date", e.target.value)} placeholder="YYYY-MM or Year (e.g. 2018)" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "পাসের সন / সমাপ্তি" : "Passing Year / End Date"}</Label>
                  <Input type="text" value={edu.end_date} onChange={(e) => update(i, "end_date", e.target.value)} placeholder="YYYY-MM or Year (e.g. 2022)" className="h-9 text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">{isBn ? "বিবরণ / প্রধান অর্জনসমূহ (ঐচ্ছিক)" : "Description / Highlights (Optional)"}</Label>
                <Textarea value={edu.description} onChange={(e) => update(i, "description", e.target.value)} rows={2} placeholder={isBn ? "অনার্স থিসিস, প্রধান কোর্স বা অতিরিক্ত একাডেমিক অর্জন..." : "Thesis topic, major coursework, or academic achievements..."} className="text-sm" />
              </div>

              <div className="flex justify-between pt-2">
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => onChange(data.filter((_, idx) => idx !== i))}><Trash2 className="h-3.5 w-3.5 mr-1" />{isBn ? "মুছুন" : "Delete"}</Button>
                <Button size="sm" onClick={() => toast.success(isBn ? "সংরক্ষিত!" : "Saved!")}><Save className="h-3.5 w-3.5 mr-1" />{isBn ? "ঠিক আছে" : "Save"}</Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
