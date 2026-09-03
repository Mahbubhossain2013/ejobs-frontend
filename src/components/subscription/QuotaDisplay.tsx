"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, Zap } from "lucide-react";

interface QuotaItem {
  name: string;
  used: number;
  limit: number;
  remaining: number;
}

interface SubscriptionData {
  plan_name: string;
  quotas: QuotaItem[];
}

function ProgressBar({ used, limit }: { used: number; limit: number }) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const isHigh = percentage >= 80;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground capitalize">{used} / {limit}</span>
        <span className={isHigh ? "text-destructive font-medium" : "text-muted-foreground"}>
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            isHigh ? "bg-destructive" : "bg-primary"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function formatQuotaName(key: string, isBn: boolean): string {
  const nameMap: Record<string, { en: string; bn: string }> = {
    ai_career_tools: { en: "AI Career Tools", bn: "AI ক্যারিয়ার টুলস" },
    ai_chat_messages: { en: "AI Chat Messages", bn: "AI চ্যাট মেসেজ" },
    ai_cover_letters: { en: "AI Cover Letters", bn: "AI কভার লেটার" },
    ai_job_descriptions: { en: "AI Job Descriptions", bn: "AI চাকরি বর্ণনা" },
    ai_cv_builder: { en: "AI CV Builder", bn: "AI সিভি বিল্ডার" },
    ai_skill_assessment: { en: "AI Skill Assessment", bn: "AI দক্ষতা মূল্যায়ন" },
    certificate_generation: { en: "Certificate Generation", bn: "সার্টিফিকেট তৈরি" },
    ai_interview_prep: { en: "AI Interview Prep", bn: "AI সাক্ষাৎকার প্রস্তুতি" },
    job_applications: { en: "Job Applications", bn: "চাকরি আবেদন" },
    job_posts: { en: "Job Posts", bn: "চাকরি পোস্ট" },
    job_post_limit: { en: "Job Post Limit", bn: "চাকরি পোস্ট সীমা" },
    resume_downloads: { en: "Resume Downloads", bn: "সিভি ডাউনলোড" },
    ats_score_checks: { en: "ATS Score Checks", bn: "ATS স্কোর চেক" },
    candidate_database_access: { en: "Candidate Database", bn: "প্রার্থী ডাটাবেস" },
    job_boosts: { en: "Job Boosts", bn: "চাকরি বুস্ট" },
    promoted_listings: { en: "Promoted Listings", bn: "প্রমোটেড লিস্টিং" },
    messages_per_day: { en: "Messages per Day", bn: "দৈনিক মেসেজ" },
    ai_resume_scoring: { en: "AI Resume Scoring", bn: "AI সিভি স্কোরিং" },
  };
  const names = nameMap[key];
  if (names) return isBn ? names.bn : names.en;
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function QuotaDisplay() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/subscriptions/my-subscription")
      .then((res) => {
        const sub = res.data.subscription ?? res.data.active_subscription;
        const rawQuotas = res.data.quotas;
        if (sub && sub.plan_name && rawQuotas) {
          const quotas: QuotaItem[] = Object.entries(rawQuotas)
            .filter(([, q]: [string, any]) => (q.max_limit ?? 0) > 0)
            .map(([key, q]: [string, any]) => ({
              name: key,
              used: q.used ?? 0,
              limit: q.max_limit ?? 0,
              remaining: q.remaining ?? Math.max(0, (q.max_limit ?? 0) - (q.used ?? 0)),
            }));
          setData({ plan_name: sub.plan_name, quotas });
        }
      })
      .catch(() => { /* subscription data not critical - show empty state */ })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-4 border-t space-y-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-full" />
      </div>
    );
  }

  if (!data || data.quotas.length === 0) return null;

  return (
    <div className="p-4 border-t space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {isBn ? "কোটা" : "Quotas"}
          </p>
        </div>
        <span className="text-xs font-medium text-primary">{data.plan_name}</span>
      </div>
      <div className="space-y-2">
        {data.quotas.map((quota) => (
          <div key={quota.name} className="space-y-1">
            <p className="text-xs font-medium text-foreground">
              {formatQuotaName(quota.name, isBn)}
            </p>
            <div className="flex items-center gap-2">
              <ProgressBar used={quota.used} limit={quota.limit} />
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                {isBn ? "বাকি" : "left"}: {quota.remaining}
              </span>
            </div>
          </div>
        ))}
      </div>
      <Button variant="outline" size="sm" className="w-full" asChild>
        <Link href="/employer/subscription">
          {isBn ? "আপগ্রেড" : "Upgrade"}
          <ArrowUpRight className="h-3 w-3 ml-1" />
        </Link>
      </Button>
    </div>
  );
}
