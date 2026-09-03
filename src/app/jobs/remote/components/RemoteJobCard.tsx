"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Star, MapPin, Send, Eye, Bookmark, Clock, Users, Briefcase, Globe, DollarSign } from "lucide-react";
import { formatCurrency, truncate, stripHtml } from "@/lib/utils";
import type { Job } from "@/types";

interface Props {
  job: any;
  isBn: boolean;
  onApply: (job: Job) => void;
}

export default function RemoteJobCard({ job, isBn, onApply }: Props) {
  const comp = typeof job.company === "object" ? job.company : null;
  const description = stripHtml(job.description || "");
  const tags = (job.skills || []).filter(Boolean);
  const timeLeft = job.deadline ? Math.max(0, Math.ceil((new Date(job.deadline).getTime() - Date.now()) / 86400000)) : null;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Link href={`/jobs/${job.id}`} className="font-semibold text-base hover:text-primary transition-colors line-clamp-1">{job.title}</Link>
              <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {comp?.name || "Company"}</span>
                {comp?.rating != null && comp.rating > 0 && (
                  <span className="flex items-center gap-0.5 text-amber-500">
                    <Star className="h-3.5 w-3.5 fill-amber-500" /> {comp.rating}
                    <span className="text-muted-foreground">({comp.reviews_count || 0})</span>
                  </span>
                )}
                {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-primary">{formatCurrency(job.budget || job.salary_min || 0)}</p>
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const typeMap: Record<string, { en: string; bn: string }> = {
                    fixed: { en: "Fixed Price", bn: "ফিক্সড" },
                    hourly: { en: "Hourly", bn: "প্রতি ঘণ্টা" },
                    daily: { en: "Daily", bn: "প্রতি দিন" },
                    monthly: { en: "Monthly", bn: "প্রতি মাস" },
                    "6_months": { en: "6 Months", bn: "৬ মাস" },
                    "1_year": { en: "1 Year", bn: "১ বছর" },
                    full_project: { en: "Full Project", bn: "ফুল প্রজেক্ট" },
                  };
                  const t = typeMap[job.budget_type] || typeMap[job.job_type] || { en: "Fixed Price", bn: "ফিক্সড" };
                  return isBn ? t.bn : t.en;
                })()}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{truncate(description, 200)}</p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.slice(0, 5).map((t: any, idx: number) => {
              const label = typeof t === "string" ? t : (t?.name || t?.name_en || String(t || ""));
              if (!label) return null;
              return <Badge key={label || idx} variant="secondary" className="text-xs">{label}</Badge>;
            })}
            {job.is_remote_project && <Badge variant="outline" className="text-xs border-green-300 text-green-600"><Globe className="h-3 w-3 mr-1" />{isBn ? "রিমোট" : "Remote"}</Badge>}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
            {timeLeft != null && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{timeLeft} {isBn ? "দিন বাকি" : "Days Left"}</span>}
            <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{job.applications_count || 0} {isBn ? "প্রপোজাল" : "Proposals"}</span>
            {job.vacancies && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{job.vacancies} {isBn ? "পদ" : "Vacancies"}</span>}
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Button size="sm" onClick={() => onApply(job)} className="h-8"><Send className="h-3.5 w-3.5 mr-1" /> {isBn ? "আবেদন করুন" : "Apply"}</Button>
            <Button size="sm" variant="outline" className="h-8" asChild><Link href={`/jobs/${job.id}`}><Eye className="h-3.5 w-3.5 mr-1" /> {isBn ? "বিস্তারিত" : "Details"}</Link></Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" aria-label="Save"><Bookmark className="h-3.5 w-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}