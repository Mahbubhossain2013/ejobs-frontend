"use client";

import React, { useEffect, useMemo } from "react";
import Link from "next/link";
import { useAppliedJobs } from "@/hooks/use-jobs";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import {
  Send, MapPin, Briefcase, Clock, Banknote, Building2,
  MessageSquare, ArrowRight, CheckCircle, XCircle, Star, Calendar, Eye,
} from "lucide-react";
import { formatDate, getStorageUrl } from "@/lib/utils";

const STATUS_TABS = ["all", "pending", "shortlisted", "interview", "offered", "rejected"] as const;

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; icon: any; label: string; labelBn: string }> = {
  pending:     { color: "text-slate-600",    bg: "bg-slate-50 dark:bg-slate-950/40",     border: "border-slate-200 dark:border-slate-800",    icon: Clock,       label: "Pending",     labelBn: "বিবেচ্য" },
  shortlisted: { color: "text-blue-600",     bg: "bg-blue-50 dark:bg-blue-950/40",       border: "border-blue-200 dark:border-blue-800",      icon: Star,        label: "Shortlisted", labelBn: "শর্টলিস্ট" },
  interview:   { color: "text-purple-600",   bg: "bg-purple-50 dark:bg-purple-950/40",   border: "border-purple-200 dark:border-purple-800",  icon: Calendar,    label: "Interview",   labelBn: "সাক্ষাৎকার" },
  offered:     { color: "text-amber-600",    bg: "bg-amber-50 dark:bg-amber-950/40",     border: "border-amber-200 dark:border-amber-800",    icon: CheckCircle, label: "Offered",     labelBn: "অফারপ্রাপ্ত" },
  rejected:    { color: "text-red-600",      bg: "bg-red-50 dark:bg-red-950/40",         border: "border-red-200 dark:border-red-800",        icon: XCircle,     label: "Rejected",    labelBn: "বাতিল" },
};

export default function AppliedJobsPage() {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";
  const { data: rawJobs, isLoading } = useAppliedJobs();

  useEffect(() => {
    document.title = isBn ? `আমার আবেদন | ${siteName}` : `My Applications | ${siteName}`;
  }, [isBn, siteName]);

  const jobs = useMemo(() => {
    if (!rawJobs) return [];
    return rawJobs.map((application: any) => {
      const job = application.job || application;
      return {
        ...application,
        _job: job,
        _company: job.company || application.company,
        _category: job.category,
        _title: job.title,
        _location: job.location,
        _jobType: job.job_type,
        _salaryMin: job.salary_min,
        _salaryMax: job.salary_max,
        _logo: job.company?.logo || application.company?.logo,
        _companyId: job.company?.id || application.company?.id,
        _companySlug: job.company?.slug || application.company?.slug,
        _companyUserId: job.company?.user_id,
        _jobId: job.id,
      };
    });
  }, [rawJobs]);

  const [activeTab, setActiveTab] = React.useState<string>("all");

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: jobs.length };
    Object.keys(STATUS_CONFIG).forEach((k) => (c[k] = 0));
    jobs.forEach((j: any) => { if (c[j.status] !== undefined) c[j.status]++; });
    return c;
  }, [jobs]);

  const filtered = useMemo(
    () => (activeTab === "all" ? jobs : jobs.filter((j: any) => j.status === activeTab)),
    [jobs, activeTab]
  );

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);
    if (min && max) return `৳${fmt(min)} - ৳${fmt(max)}`;
    if (min) return `৳${fmt(min)}+`;
    return `≤ ৳${fmt(max!)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48" />
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 sm:h-20 rounded-xl" />)}
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-36 sm:h-40 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold">
          {isBn ? "আমার আবেদন" : "My Applications"}
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          {isBn ? "আপনার সব চাকরির আবেদন দেখুন" : "Track all your job applications"}
        </p>
      </div>

      {/* Stats */}
      {jobs.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
          {STATUS_TABS.filter((t) => t !== "all").map((key) => {
            const cfg = STATUS_CONFIG[key];
            const Icon = cfg.icon;
            return (
              <button key={key} onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-all text-left ${
                  activeTab === key ? `${cfg.bg} ${cfg.border} ring-1 ring-current/10` : "bg-card hover:bg-muted/50 border-border"
                }`}>
                <div className={`p-1.5 sm:p-2 rounded-lg ${activeTab === key ? cfg.bg : "bg-muted"}`}>
                  <Icon className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${activeTab === key ? cfg.color : "text-muted-foreground"}`} />
                </div>
                <div>
                  <p className="text-base sm:text-lg font-bold leading-none">{counts[key]}</p>
                  <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-0.5 hidden sm:block">{isBn ? cfg.labelBn : cfg.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 -mx-1 px-1">
        {STATUS_TABS.map((key) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-medium whitespace-nowrap transition-colors ${
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
      <div className="grid gap-3 sm:gap-4">
        {filtered.length === 0 ? (
          <Card className="bg-muted/30 border-border">
            <CardContent className="p-8 sm:p-10 text-center">
              <Send className="h-10 sm:h-14 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <p className="text-base sm:text-lg font-semibold">
                {activeTab === "all"
                  ? (isBn ? "এখনো কোনো আবেদন নেই" : "No applications yet")
                  : (isBn ? `কোনো ${STATUS_CONFIG[activeTab]?.labelBn || ""} আবেদন নেই` : `No ${STATUS_CONFIG[activeTab]?.label || ""} applications`)}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                {isBn ? "চাকরি খুঁজে আবেদন করুন" : "Start applying to jobs you like"}
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/jobs">
                  {isBn ? "চাকরি খুঁজুন" : "Browse Jobs"}
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          filtered.map((app: any) => {
            const cfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const Icon = cfg.icon;
            const salary = formatSalary(app._salaryMin, app._salaryMax);

            return (
              <Card key={app.id || app._jobId} className={`border hover:shadow-md transition-all ${cfg.bg} ${cfg.border}`}>
                <CardContent className="p-3 sm:p-5">
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* Logo */}
                    <div className="shrink-0">
                      {app._logo ? (
                        <img src={getStorageUrl(app._logo)} alt="" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-cover border bg-background" />
                      ) : (
                        <DefaultAvatar name={app._company?.name} className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl text-base sm:text-lg" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Mobile: badge above title */}
                      <div className="flex items-center gap-2 sm:hidden">
                        <Badge className={`gap-1 text-[10px] px-1.5 py-0.5 ${cfg.color} bg-transparent border-current/20`} variant="outline">
                          <Icon className="h-2.5 w-2.5" />
                          {isBn ? cfg.labelBn : cfg.label}
                        </Badge>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link href={`/jobs/${app._jobId}`} className="font-semibold text-sm sm:text-base leading-snug hover:text-primary transition-colors">
                            {app._title}
                          </Link>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                            <p className="text-[11px] sm:text-sm text-muted-foreground truncate">
                              {app._company?.name}
                              {app._category?.name && <span className="text-muted-foreground/60 hidden sm:inline"> · {app._category.name}</span>}
                            </p>
                          </div>
                        </div>
                        <Badge className={`shrink-0 gap-1 ${cfg.color} bg-transparent border-current/20 hidden sm:flex`} variant="outline">
                          <Icon className="h-3 w-3" />
                          {isBn ? cfg.labelBn : cfg.label}
                        </Badge>
                      </div>

                      {/* Meta — 2-col grid on mobile */}
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2 sm:mt-3 text-[11px] sm:text-xs text-muted-foreground">
                        {app._location && (
                          <span className="flex items-center gap-1 min-w-0"><MapPin className="h-3 w-3 shrink-0" /><span className="truncate">{app._location}</span></span>
                        )}
                        {app._jobType && (
                          <span className="flex items-center gap-1 capitalize min-w-0"><Briefcase className="h-3 w-3 shrink-0" /><span className="truncate">{app._jobType}</span></span>
                        )}
                        {salary && (
                          <span className="flex items-center gap-1 font-medium text-foreground min-w-0"><Banknote className="h-3 w-3 shrink-0" /><span className="truncate">{salary}</span></span>
                        )}
                        <span className="flex items-center gap-1 min-w-0"><Clock className="h-3 w-3 shrink-0" /><span className="truncate">{formatDate(app.created_at || app._job?.created_at)}</span></span>
                      </div>

                      {/* Actions */}
                      <div className="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2 mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-current/10">
                        {app._companyUserId && (
                          <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-[11px] sm:text-xs px-2">
                            <Link href={`/dashboard/messages?employer=${app._companyUserId}`}>
                              <MessageSquare className="h-3.5 w-3.5" />
                              <span>{isBn ? "বার্তা" : "Message"}</span>
                            </Link>
                          </Button>
                        )}
                        {app._jobId && (
                          <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-[11px] sm:text-xs px-2">
                            <Link href={`/jobs/${app._jobId}`}>
                              <Eye className="h-3.5 w-3.5" />
                              <span>{isBn ? "চাকরি" : "Job"}</span>
                            </Link>
                          </Button>
                        )}
                        {app._companySlug && (
                          <Button asChild variant="outline" size="sm" className="h-8 gap-1 text-[11px] sm:text-xs px-2">
                            <Link href={`/companies/${app._companySlug}`}>
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
