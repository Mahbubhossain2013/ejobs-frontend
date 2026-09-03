"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye, TrendingUp, Users, Target, Briefcase, FileText, MessageSquare,
  Bookmark, Clock, Star, ArrowUpRight, ArrowDownRight, BarChart3,
  Zap, Crown, Calendar, Award, CheckCircle2, AlertCircle, Download,
} from "lucide-react";
import { toast } from "sonner";

interface AnalyticsData {
  profile_views: number;
  profile_views_change: number;
  search_appearances: number;
  search_change: number;
  match_score: number;
  applications_sent: number;
  applications_change: number;
  saved_jobs: number;
  messages_count: number;
  interviews: number;
  offers_received: number;
  response_rate: number;
  avg_response_time: string;
  top_skills: string[];
  recent_activity: { type: string; title: string; date: string }[];
  monthly_views: number[];
  application_status: { applied: number; reviewed: number; shortlisted: number; rejected: number };
  completeness: number;
}

const EMPTY_DATA: AnalyticsData = {
  profile_views: 0,
  profile_views_change: 0,
  search_appearances: 0,
  search_change: 0,
  match_score: 0,
  applications_sent: 0,
  applications_change: 0,
  saved_jobs: 0,
  messages_count: 0,
  interviews: 0,
  offers_received: 0,
  response_rate: 0,
  avg_response_time: "-",
  top_skills: [],
  recent_activity: [],
  monthly_views: [],
  application_status: { applied: 0, reviewed: 0, shortlisted: 0, rejected: 0 },
  completeness: 0,
};

export default function AnalyticsPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [data, setData] = useState<AnalyticsData>(EMPTY_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/candidate/analytics")
      .then((res) => {
        const d = res.data?.data || res.data;
        if (d && typeof d === "object") {
          setData((prev) => ({ ...prev, ...d }));
        }
      })
      .catch(() => {
        // Analytics endpoint may not exist yet — use defaults silently
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { title: isBn ? "প্রোফাইল ভিউ" : "Profile Views", value: data.profile_views || 0, change: data.profile_views_change || 0, icon: Eye, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "সার্চ উপস্থিতি" : "Search Appearances", value: data.search_appearances || 0, change: data.search_change || 0, icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "AI ম্যাচ স্কোর" : "AI Match Score", value: `${data.match_score || 0}%`, icon: Target, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "আবেদন পাঠানো" : "Applications Sent", value: data.applications_sent || 0, change: data.applications_change || 0, icon: FileText, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  ];

  const detailCards = [
    { title: isBn ? "সংরক্ষিত চাকরি" : "Saved Jobs", value: data.saved_jobs || 0, icon: Bookmark, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "বার্তা" : "Messages", value: data.messages_count || 0, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "সাক্ষাৎকার" : "Interviews", value: data.interviews || 0, icon: Calendar, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
    { title: isBn ? "অফার প্রাপ্ত" : "Offers Received", value: data.offers_received || 0, icon: Award, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950" },
  ];

  const statusCards = [
    { title: isBn ? "আবেদন" : "Applied", value: data.application_status?.applied || 0, color: "bg-blue-500" },
    { title: isBn ? "পর্যালোচিত" : "Reviewed", value: data.application_status?.reviewed || 0, color: "bg-amber-500" },
    { title: isBn ? "শর্টলিস্ট" : "Shortlisted", value: data.application_status?.shortlisted || 0, color: "bg-green-500" },
    { title: isBn ? "বাতিল" : "Rejected", value: data.application_status?.rejected || 0, color: "bg-red-500" },
  ];

  const totalApplications = statusCards.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "বিশ্লেষণ" : "Analytics"}</h1>
          <p className="text-sm text-muted-foreground">
            {isBn ? "আপনার ক্যারিয়ার পারফরম্যান্স ট্র্যাক করুন" : "Track your career performance"}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href="/dashboard/profile">
            <Zap className="h-4 w-4 mr-1" />
            {isBn ? "প্রোফাইল আপডেট" : "Update Profile"}
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

      {/* Profile Completeness */}
      {!loading && data.completeness !== undefined && data.completeness > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium">{isBn ? "প্রোফাইল সম্পূর্ণতা" : "Profile Completeness"}</span>
              </div>
              <span className="text-sm font-bold">{data.completeness}%</span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  data.completeness >= 80 ? "bg-green-500" : data.completeness >= 50 ? "bg-amber-500" : "bg-red-500"
                }`}
                style={{ width: `${data.completeness}%` }}
              />
            </div>
            {data.completeness < 80 && (
              <p className="text-xs text-muted-foreground mt-2">
                {isBn ? "প্রোফাইল 80% সম্পূর্ণ করুন — এটি আপনাকে আরও নোটিশেবল করবে" : "Complete your profile to 80% — it makes you more visible"}
              </p>
            )}
          </CardContent>
        </Card>
      )}

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

      {/* Application Status Funnel */}
      {!loading && totalApplications > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              {isBn ? "আবেদন ফানেল" : "Application Funnel"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {statusCards.map((s, i) => (
              <div key={s.title} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-24 shrink-0">{s.title}</span>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${s.color}`}
                    style={{ width: `${totalApplications > 0 ? (s.value / totalApplications) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-10 text-right">{s.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Response Rate & Top Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!loading && (
          <>
            {/* Response Rate */}
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
                <div className="w-full h-3 bg-blue-100 dark:bg-blue-900/40 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${Math.min(data.response_rate || 0, 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Top Skills */}
            <Card className="bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800">
              <CardHeader>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/60">
                    <Star className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  {isBn ? "শীর্ষ দক্ষতা" : "Top Skills"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {(data.top_skills?.length ?? 0) > 0 && data ? (
                  <div className="flex flex-wrap gap-2">
                    {data.top_skills!.map((skill, i) => (
                      <Badge key={i} className="bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700 text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-bold text-amber-700/70 dark:text-amber-300/70">
                    {isBn ? "প্রোফাইলে দক্ষতা যোগ করুন" : "Add skills to your profile"}
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
              { label: isBn ? "চাকরি খুঁজুন" : "Find Jobs", href: "/jobs", icon: Briefcase },
              { label: isBn ? "সিভি বিল্ডার" : "CV Builder", href: "/resume-builder", icon: FileText },
              { label: isBn ? "AI সহকারী" : "AI Assistant", href: "/ai-assistant", icon: Zap },
              { label: isBn ? "AI ক্যারিয়ার" : "AI Career", href: "/ai-career", icon: Target },
              { label: isBn ? "আমার আবেদন" : "My Applications", href: "/dashboard/applied-jobs", icon: FileText },
              { label: isBn ? "বার্তা" : "Messages", href: "/messages", icon: MessageSquare },
            ].map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 hover:shadow-sm transition-all text-center">
                  <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/60">
                    <action.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
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