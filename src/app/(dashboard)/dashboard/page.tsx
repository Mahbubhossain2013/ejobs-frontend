"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import RecommendedJobs from "@/components/jobs/RecommendedJobs";
import VerificationWarningBanner from "@/components/verification-warning-banner";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Briefcase,
  Send,
  Bookmark,
  FileText,
  Eye,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

interface DashboardData {
  applied_jobs_count: number;
  saved_jobs_count: number;
  profile_views: number;
  match_score: number;
  wallet_balance: number;
}

export default function CandidateDashboardPage() {
  const { user, isAuthenticated, isLoading: authLoading, token } = useAuth();
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If auth state is still loading from storage, wait
    if (authLoading) return;

    // If unauthenticated, don't attempt to load protected dashboard data
    if (!isAuthenticated && !token) {
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);

    api
      .get("/candidate/dashboard")
      .then((res) => {
        if (!isMounted) return;
        const d = res.data;
        setData({
          applied_jobs_count: d.stats?.applied ?? d.applications?.length ?? 0,
          saved_jobs_count: d.stats?.saved ?? d.saved_jobs_count ?? d.user?.profile?.saved_jobs_count ?? 0,
          profile_views: d.user?.profile?.profile_views ?? 0,
          match_score: Math.round(d.user?.profile?.match_score ?? 0),
          wallet_balance: d.user?.profile?.wallet_balance ?? 0,
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        // Don't toast if request is unauthorized (handled by auth store / interceptor redirect)
        if (err?.response?.status === 401 || err?.response?.status === 419) {
          return;
        }
        toast.error(
          err?.response?.data?.message ||
            (isBn ? "ড্যাশবোর্ড ডেটা লোড করতে ব্যর্থ হয়েছে" : "Failed to load dashboard data")
        );
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [authLoading, isAuthenticated, token, isBn]);

  const stats = [
    {
      title: isBn ? "আবেদন" : "Applications",
      value: data?.applied_jobs_count || 0,
      icon: Send,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: isBn ? "সংরক্ষিত" : "Saved Jobs",
      value: data?.saved_jobs_count || 0,
      icon: Bookmark,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: isBn ? "প্রোফাইল ভিউ" : "Profile Views",
      value: data?.profile_views || 0,
      icon: Eye,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: isBn ? "AI ম্যাচ স্কোর" : "AI Match Score",
      value: `${data?.match_score || 0}%`,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">
          {isBn ? `স্বাগতম, ${user?.name ?? "সদস্য"}` : `Welcome back${user?.name ? `, ${user.name}` : ""}`}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isBn
            ? "আপনার কর্মজীবন ড্যাশবোর্ড"
            : "Here's an overview of your career dashboard"}
        </p>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5">
              <Skeleton className="h-5 w-24 mb-3" />
              <Skeleton className="h-8 w-16" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className={`${stat.bg} border-none`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">{stat.title}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl bg-white/60 dark:bg-white/10`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <Link href="/jobs" className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold text-foreground">{isBn ? "চাকরি খুঁজুন" : "Browse Jobs"}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <Link href="/dashboard/resume" className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold text-foreground">{isBn ? "সিভি আপডেট" : "Update Resume"}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <Link href="/ai-assistant" className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60">
                  <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold text-foreground">{isBn ? "AI ক্যারিয়ার" : "AI Career Coach"}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Verification banner between sections */}
      <VerificationWarningBanner mode="dashboard" />

      {/* Recommended Jobs */}
      <RecommendedJobs />

    </div>
  );
}
