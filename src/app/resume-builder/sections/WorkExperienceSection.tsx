"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save, Briefcase } from "lucide-react";
import { toast } from "sonner";

const EMPTY = { job_title: "", employment_type: "Full-time", city: "", employer: "", start_date: "", end_date: "", is_current: false, description: "" };
const MAX = { job_title: 100, city: 100, employer: 100 };
interface Props { data: any[]; onChange: (d: any[]) => void; isBn: boolean; }

export default function WorkExperienceSection({ data, onChange, isBn }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(data.length > 0 ? 0 : null);

  const update = (i: number, key: string, val: any) => {
    const n = [...data]; n[i] = { ...n[i], [key]: val }; onChange(n);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-base font-bold flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-primary" />
          <span>{isBn ? "কাজের অভিজ্ঞতা (Work Experience)" : "Work Experience"}</span>
        </h3>
        <Button variant="outline" size="sm" onClick={() => { onChange([...data, { ...EMPTY }]); setOpenIdx(data.length); }}>
          <Plus className="h-4 w-4 mr-1" />{isBn ? "অভিজ্ঞতা যোগ করুন" : "Add Experience"}
        </Button>
      </div>

      {data.length === 0 && (
        <p className="text-sm text-muted-foreground italic py-2">{isBn ? "কোনো কাজের অভিজ্ঞতা যোগ করা হয়নি (নতুনদের জন্য এটি ঐচ্ছিক)।" : "No work experience added yet (optional for freshers)."}</p>
      )}

      {data.map((exp, i) => (
        <div key={i} className="border rounded-xl overflow-hidden bg-card shadow-sm">
          <button onClick={() => setOpenIdx(openIdx === i ? null : i)} className="w-full flex items-center justify-between p-3.5 hover:bg-muted/50 text-left transition-colors">
            <div>
              <span className="text-sm font-semibold truncate block">{exp.job_title || exp.employer || (isBn ? "নতুন কাজের অভিজ্ঞতা" : "Work entry")}</span>
              <span className="text-xs text-muted-foreground">{exp.employer ? exp.employer + " • " : ""}{exp.city || ""}</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
              {exp.start_date || "—"} - {exp.is_current ? (isBn ? "বর্তমান" : "Present") : (exp.end_date || "—")}
            </span>
          </button>

          {openIdx === i && (
            <div className="p-4 border-t space-y-3 bg-muted/10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "পদবী / চাকরির শিরোনাম" : "Job Title / Designation"} <span className="text-destructive">*</span></Label>
                  <div className="relative"><Input value={exp.job_title} onChange={(e) => update(i, "job_title", e.target.value)} placeholder={isBn ? "যেমন: সিনিয়র সফটওয়্যার ডেভেলপার" : "e.g. Lead Software Engineer"} className="h-9 text-sm" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{(exp.job_title || "").length}/{MAX.job_title}</span></div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "কোম্পানি / প্রতিষ্ঠানের নাম" : "Company / Employer"} <span className="text-destructive">*</span></Label>
                  <div className="relative"><Input value={exp.employer} onChange={(e) => update(i, "employer", e.target.value)} placeholder={isBn ? "যেমন: ব্রেন স্টেশন ২৩ / গ্রামীণফোন" : "e.g. Google / Brain Station 23"} className="h-9 text-sm" /><span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground">{(exp.employer || "").length}/{MAX.employer}</span></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "কর্মস্থলের অবস্থান (শহর/দেশ)" : "Location (City, Country)"}</Label>
                  <Input value={exp.city} onChange={(e) => update(i, "city", e.target.value)} placeholder={isBn ? "যেমন: ঢাকা, বাংলাদেশ (বা Remote)" : "e.g. Dhaka, Bangladesh (or Remote)"} className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "চাকরির ধরন" : "Employment Type"}</Label>
                  <Input value={exp.employment_type || "Full-time"} onChange={(e) => update(i, "employment_type", e.target.value)} placeholder="Full-time / Part-time / Contract / Remote" className="h-9 text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div className="space-y-1">
                  <Label className="text-xs font-medium">{isBn ? "শুরুর তারিখ / বছর" : "Start Date"}</Label>
                  <Input type="text" value={exp.start_date} onChange={(e) => update(i, "start_date", e.target.value)} placeholder="YYYY-MM or Year (e.g. 2021-03)" className="h-9 text-sm" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium">{isBn ? "সমাপ্তির তারিখ" : "End Date"}</Label>
                    <label className="text-xs flex items-center gap-1.5 cursor-pointer text-primary font-medium">
                      <input type="checkbox" checked={!!exp.is_current} onChange={(e) => update(i, "is_current", e.target.checked)} className="rounded" />
                      {isBn ? "বর্তমানে কর্মরত" : "Currently working here"}
                    </label>
                  </div>
                  <Input type="text" disabled={!!exp.is_current} value={exp.is_current ? (isBn ? "বর্তমান (Present)" : "Present") : exp.end_date} onChange={(e) => update(i, "end_date", e.target.value)} placeholder="YYYY-MM or Year" className="h-9 text-sm" />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">{isBn ? "কাজের দায়িত্ব ও অর্জনসমূহ" : "Responsibilities & Key Achievements"}</Label>
                <Textarea value={exp.description} onChange={(e) => update(i, "description", e.target.value)} rows={3} placeholder={isBn ? "• টিম লিড হিসেবে সিস্টেম আর্কিটেকচার ডিজাইন করেছি\n• পারফরম্যান্স ৩০% বৃদ্ধি করেছি..." : "• Led the design of cloud architecture\n• Increased user engagement by 35%..."} className="text-sm" />
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
