"use client";

import React, { useEffect, useMemo, useState } from "react";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle, Clock, Briefcase, Award, MapPin, Calendar,
  MessageSquare, Banknote, Building2, Star, Filter,
} from "lucide-react";
import { formatDate, getStorageUrl } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

type App = {
  id: number;
  status: string;
  created_at: string;
  job?: {
    id: number;
    title?: string;
    location?: string;
    job_type?: string;
    salary_min?: number;
    salary_max?: number;
    category?: { name?: string };
    company?: {
      id?: number;
      name?: string;
      logo?: string;
      user_id?: number;
      slug?: string;
    };
  };
  interview?: { scheduled_at?: string; type?: string; meeting_link?: string } | null;
};

const STATUS_TABS = ["all", "shortlisted", "interview", "offered", "hired"] as const;

const STATUS_CONFIG: Record<string, { color: string; bg: string; icon: any; label: string; labelBn: string }> = {
  shortlisted: { color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800", icon: Star, label: "Shortlisted", labelBn: "শর্টলিস্ট" },
  interview: { color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800", icon: Calendar, label: "Interview", labelBn: "সাক্ষাৎকার" },
  offered: { color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800", icon: Award, label: "Offered", labelBn: "অফারপ্রাপ্ত" },
  hired: { color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800", icon: CheckCircle, label: "Hired", labelBn: "নিয়োগপ্রাপ্ত" },
};

export default function CandidateAcceptedJobsPage() {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

  useEffect(() => {
    document.title = isBn ? `গৃহীত চাকরি | ${siteName}` : `Accepted Jobs | ${siteName}`;
  }, [isBn, siteName]);

  const [applications, setApplications] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    api
      .get("/candidate/accepted-jobs")
      .then((res) => {
        const raw = res.data.data;
        const list = Array.isArray(raw) ? raw : raw?.data && Array.isArray(raw.data) ? raw.data : [];
        setApplications(list);
      })
      .catch(() => toast.error(isBn ? "গৃহীত চাকরি লোড করতে ব্যর্থ" : "Failed to load accepted jobs"))
      .finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: applications.length, shortlisted: 0, interview: 0, offered: 0, hired: 0 };
    applications.forEach((a) => { if (c[a.status] !== undefined) c[a.status]++; });
    return c;
  }, [applications]);

  const filtered = useMemo(
    () => (activeTab === "all" ? applications : applications.filter((a) => a.status === activeTab)),
    [applications, activeTab]
  );

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
    if (min && max) return `৳${fmt(min)} - ৳${fmt(max)}`;
    if (min) return `৳${fmt(min)}+`;
    return `≤ ৳${fmt(max!)}`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isBn ? "গৃহীত চাকরি" : "Accepted Jobs"}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isBn ? "শর্টলিস্টেড ও নিয়োগপ্রাপ্ত চাকরিগুলো" : "Your shortlisted and hired jobs"}
        </p>
      </div>

      {/* Stats */}
      {applications.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STATUS_TABS.filter((t) => t !== "all").map((key) => {
            const cfg = STATUS_CONFIG[key];
            const Icon = cfg.icon;
            return (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border transition-all text-left ${
                  activeTab === key ? `${cfg.bg} ring-1 ring-current/10` : "bg-card hover:bg-muted/50 border-border"
                }`}>
                <div className={`p-1.5 sm:p-2 rounded-lg ${activeTab === key ? cfg.bg : "bg-muted"}`}>
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activeTab === key ? cfg.color : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-bold leading-none">{counts[key]}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5">{isBn ? cfg.labelBn : cfg.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((key) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}>
            {key === "all" ? (isBn ? "সব" : "All") : isBn ? STATUS_CONFIG[key].labelBn : STATUS_CONFIG[key].label}
            <span className="ml-1 opacity-70">{counts[key]}</span>
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800">
            <CardContent className="p-10 text-center">
              <CheckCircle className="h-14 w-14 text-blue-400 mx-auto mb-4" />
              <p className="text-lg font-semibold">
                {activeTab === "all"
                  ? (isBn ? "কোনো গৃহীত চাকরি নেই" : "No accepted jobs yet")
                  : (isBn ? `কোনো ${STATUS_CONFIG[activeTab]?.labelBn || ""} চাকরি নেই` : `No ${STATUS_CONFIG[activeTab]?.label || ""} jobs`)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isBn ? "শর্টলিস্ট হলে এখানে দেখাবে" : "Shortlisted jobs will appear here"}
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((app) => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.shortlisted;
            const Icon = cfg.icon;
            const salary = formatSalary(app.job?.salary_min, app.job?.salary_max);
            const logo = app.job?.company?.logo;

            return (
              <Card key={app.id} className={`border hover:shadow-md transition-all ${cfg.bg}`}>
                <CardContent className="p-3 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Company logo */}
                    <div className="shrink-0">
                      {logo ? (
                        <img src={getStorageUrl(logo)} alt="" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover border bg-background" />
                      ) : (
                        <DefaultAvatar name={app.job?.company?.name} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl text-base sm:text-lg" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Mobile: badge above title. Desktop: side-by-side */}
                      <div className="flex items-center gap-2 sm:hidden">
                        <Badge className={`gap-1 text-[10px] px-1.5 py-0.5 ${cfg.color} bg-transparent border-current/20`} variant="outline">
                          <Icon className="h-2.5 w-2.5" />
                          {isBn ? cfg.labelBn : cfg.label}
                        </Badge>
                      </div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-sm sm:text-base leading-snug">{app.job?.title}</h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                            <p className="text-[11px] sm:text-sm text-muted-foreground truncate">
                              {app.job?.company?.name}
                              {app.job?.category?.name && <span className="text-muted-foreground/60 hidden sm:inline"> · {app.job.category.name}</span>}
                            </p>
                          </div>
                        </div>
                        <Badge className={`shrink-0 gap-1 ${cfg.color} bg-transparent border-current/20 hidden sm:flex`} variant="outline">
                          <Icon className="h-3 w-3" />
                          {isBn ? cfg.labelBn : cfg.label}
                        </Badge>
                      </div>

                      {/* Meta row — 2-col grid on mobile */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 sm:mt-3 text-[11px] sm:text-xs text-muted-foreground">
                        {app.job?.location && (
                          <span className="flex items-center gap-1 min-w-0"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{app.job.location}</span></span>
                        )}
                        {app.job?.job_type && (
                          <span className="flex items-center gap-1 capitalize min-w-0"><Briefcase className="h-3 w-3 shrink-0" /><span className="truncate">{app.job.job_type}</span></span>
                        )}
                        {salary && (
                          <span className="flex items-center gap-1 font-medium text-foreground min-w-0"><Banknote className="h-3 w-3 shrink-0" /><span className="truncate">{salary}</span></span>
                        )}
                        <span className="flex items-center gap-1 min-w-0"><Clock className="h-3 w-3 shrink-0" /><span className="truncate">{formatDate(app.created_at)}</span></span>
                      </div>

                      {/* Interview info */}
                      {app.interview?.scheduled_at && (
                        <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-md bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-[10px] sm:text-xs font-medium w-fit">
                          <Calendar className="h-3 w-3 shrink-0" />
                          <span className="truncate">{formatDate(app.interview.scheduled_at)}</span>
                          {app.interview.type && <span className="opacity-70 hidden sm:inline">({app.interview.type})</span>}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-current/10">
                        {app.job?.company?.user_id && (
                          <Button asChild variant="outline" size="sm" className="h-8 sm:h-8 gap-1 sm:gap-1.5 text-[11px] sm:text-xs px-2 sm:px-3">
                            <Link href={`/dashboard/messages?employer=${app.job.company.user_id}`}>
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{isBn ? "বার্তা" : "Message"}</span>
                            </Link>
                          </Button>
                        )}
                        {app.job?.id && (
                          <Button asChild variant="outline" size="sm" className="h-8 sm:h-8 gap-1 sm:gap-1.5 text-[11px] sm:text-xs px-2 sm:px-3">
                            <Link href={`/jobs/${app.job.id}`}>
                              <Briefcase className="h-3.5 w-3.5" />
                              <span>{isBn ? "চাকরি" : "Job"}</span>
                            </Link>
                          </Button>
                        )}
                        {app.job?.company?.slug && (
                          <Button asChild variant="outline" size="sm" className="h-8 sm:h-8 gap-1 sm:gap-1.5 text-[11px] sm:text-xs px-2 sm:px-3">
                            <Link href={`/companies/${app.job.company.slug}`}>
                              <Building2 className="h-3.5 w-3.5" />
                              <span>{isBn ? "কোম্পানি" : "Company"}</span>
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
