"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Briefcase, Users, Eye, TrendingUp, Clock, BarChart3,
  DollarSign, MessageSquare, FileText, ArrowUpRight, ArrowDownRight,
  Zap, Target, Award, CheckCircle2, AlertCircle, Plus, Star, Globe,
} from "lucide-react";

interface AnalyticsData {
  total_jobs: number;
  active_jobs: number;
  total_applicants: number;
  total_views: number;
  views_change: number;
  applicants_change: number;
  jobs_change: number;
  response_rate: number;
  avg_response_time: string;
  hire_rate: number;
  total_hires: number;
  conversion_rate: number;
  budget_spent: number;
  budget_remaining: number;
  monthly_views: number[];
  monthly_applicants: number[];
  job_status: { active: number; paused: number; closed: number };
  top_jobs: { title: string; views: number; applicants: number }[];
  recent_applicants: { name: string; job: string; date: string; status: string }[];
  pending_actions: number;
}

const EMPTY_DATA: AnalyticsData = {
  total_jobs: 0,
  active_jobs: 0,
  total_applicants: 0,
  total_views: 0,
  views_change: 0,
  applicants_change: 0,
  jobs_change: 0,
  response_rate: 0,
  avg_response_time: "-",
  hire_rate: 0,
  total_hires: 0,
  conversion_rate: 0,
  budget_spent: 0,
  budget_remaining: 0,
  monthly_views: [],
  monthly_applicants: [],
  job_status: { active: 0, paused: 0, closed: 0 },
  top_jobs: [],
  recent_applicants: [],
  pending_actions: 0,
};

export default function EmployerAnalyticsPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [data, setData] = useState<AnalyticsData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/employer/analytics")
      .then((res) => {
        const d = res.data?.data || res.data;
        if (d && typeof d === "object") {
          setData((prev) => ({ ...prev, ...d }));
        }
      })
      .catch(() => {
        toast.error(isBn ? "অ্যানালিটিক্স লোড ব্যর্থ হয়েছে" : "Failed to load analytics", { duration: 3000 });
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: isBn ? "মোট পোস্ট" : "Total Jobs", value: data.total_jobs || 0, change: data.jobs_change || 0, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "সক্রিয়" : "Active Jobs", value: data.active_jobs || 0, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "আবেদনকারী" : "Applicants", value: data.total_applicants || 0, change: data.applicants_change || 0, icon: Users, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "ভিউ" : "Total Views", value: data.total_views || 0, change: data.views_change || 0, icon: Eye, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  ];

  const detailCards = [
    { title: isBn ? "হায়ার হার" : "Hire Rate", value: `${data.hire_rate || 0}%`, icon: Award, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "মোট হায়ার" : "Total Hires", value: data.total_hires || 0, icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "রূপান্তর হার" : "Conversion Rate", value: `${data.conversion_rate || 0}%`, icon: Target, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "অপেক্ষমান" : "Pending Actions", value: data.pending_actions || 0, icon: AlertCircle, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  ];

  const jobStatus = [
    { title: isBn ? "সক্রিয়" : "Active", value: data.job_status?.active || 0, color: "bg-green-500" },
    { title: isBn ? "বিরতি" : "Paused", value: data.job_status?.paused || 0, color: "bg-amber-500" },
    { title: isBn ? "বন্ধ" : "Closed", value: data.job_status?.closed || 0, color: "bg-red-500" },
  ];

  const totalJobs = jobStatus.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "বিশ্লেষণ" : "Analytics"}</h1>
          <p className="text-sm text-muted-foreground">
            {isBn ? "আপনার নিয়োগ পারফরম্যান্স ট্র্যাক করুন" : "Track your hiring performance"}
          </p>
        </div>
        <Button size="sm" asChild>
          <Link href="/employer/post-job">
            <Plus className="h-4 w-4 mr-1" />
            {isBn ? "নতুন পোস্ট" : "Post Job"}
          </Link>
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 w-full" />)
          : statCards.map((s) => (
              <Card key={s.title} className={`${s.bg} border-none hover:shadow-md transition-shadow`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-white/10">
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    {s.change !== undefined && s.change !== 0 && (
                      <Badge variant={s.change > 0 ? "default" : "destructive"} className="text-[10px]">
                        {s.change > 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                        {Math.abs(s.change)}%
                      </Badge>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs font-bold text-muted-foreground mt-1">{s.title}</p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Detail Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          : detailCards.map((s) => (
              <Card key={s.title} className={`${s.bg} border-none`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/60 dark:bg-white/10">
                      <s.icon className={`h-4 w-4 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{s.value}</p>
                      <p className="text-xs font-bold text-muted-foreground">{s.title}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Job Status Funnel */}
      {!loading && totalJobs > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {isBn ? "চাকরির অবস্থা" : "Job Status Overview"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {jobStatus.map((s) => (
              <div key={s.title} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20 shrink-0">{s.title}</span>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${s.color}`}
                    style={{ width: `${totalJobs > 0 ? (s.value / totalJobs) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-10 text-right">{s.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Response Rate & Top Jobs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!loading && (
          <>
            <Card className="bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/60">
                    <Clock className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                  </div>
                  {isBn ? "প্রতিক্রিয়ার হার" : "Response Rate"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold">{data.response_rate || 0}%</span>
                  <span className="text-sm font-bold text-muted-foreground">
                    {isBn ? "গড় সময়:" : "Avg time:"} {data.avg_response_time || "-"}
                  </span>
                </div>
                <div className="w-full h-3 bg-cyan-100 dark:bg-cyan-900/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-cyan-500 transition-all"
                    style={{ width: `${Math.min(data.response_rate || 0, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60">
                    <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  {isBn ? "শীর্ষ চাকরি" : "Top Performing Jobs"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(data.top_jobs?.length ?? 0) > 0 && data ? (
                  <div className="space-y-2">
                    {data.top_jobs!.slice(0, 5).map((job, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <span className="truncate max-w-[200px]">{job.title}</span>
                        <div className="flex items-center gap-3 text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />{job.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />{job.applicants}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {isBn ? "কোনো চাকরি পোস্ট করা হয়নি" : "No jobs posted yet"}
                  </p>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-surface-card hover:bg-surface-card-hover transition-colors">
        <CardHeader>
          <CardTitle className="text-base font-bold">{isBn ? "দ্রুত পদক্ষেপ" : "Quick Actions"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: isBn ? "চাকরি পোস্ট" : "Post Job", href: "/employer/post-job", icon: Plus, bg: "bg-blue-50 dark:bg-blue-950/40", iconBg: "bg-blue-100 dark:bg-blue-900/60", iconColor: "text-blue-600 dark:text-blue-400" },
              { label: isBn ? "প্রার্থী" : "Candidates", href: "/employer/candidates", icon: Users, bg: "bg-blue-50 dark:bg-blue-950/40", iconBg: "bg-blue-100 dark:bg-blue-900/60", iconColor: "text-blue-600 dark:text-blue-400" },
              { label: isBn ? "বিজ্ঞাপন" : "Promotions", href: "/employer/promotions", icon: Zap, bg: "bg-blue-50 dark:bg-blue-950/40", iconBg: "bg-blue-100 dark:bg-blue-900/60", iconColor: "text-blue-600 dark:text-blue-400" },
              { label: isBn ? "বার্তা" : "Messages", href: "/messages", icon: MessageSquare, bg: "bg-blue-50 dark:bg-blue-950/40", iconBg: "bg-blue-100 dark:bg-blue-900/60", iconColor: "text-blue-600 dark:text-blue-400" },
              { label: isBn ? "পেমেন্ট" : "Wallet", href: "/employer/wallet", icon: DollarSign, bg: "bg-blue-50 dark:bg-blue-950/40", iconBg: "bg-blue-100 dark:bg-blue-900/60", iconColor: "text-blue-600 dark:text-blue-400" },
              { label: isBn ? "সাপোর্ট" : "Support", href: "/support", icon: Globe, bg: "bg-blue-50 dark:bg-blue-950/40", iconBg: "bg-blue-100 dark:bg-blue-900/60", iconColor: "text-blue-600 dark:text-blue-400" },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className={`flex flex-col items-center gap-2 p-4 rounded-xl ${action.bg} border border-transparent hover:border-border hover:shadow-sm transition-all text-center`}>
                  <div className={`p-2.5 rounded-xl ${action.iconBg}`}>
                    <action.icon className={`h-5 w-5 ${action.iconColor}`} />
                  </div>
                  <span className="text-xs font-bold text-foreground">{action.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}