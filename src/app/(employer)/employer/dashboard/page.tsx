"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Plus,
  ArrowRight,
} from "lucide-react";

interface EmployerDashboardData {
  jobs_count: number;
  active_jobs: number;
  total_applicants: number;
  total_views: number;
  wallet_balance: number;
  recent_applications: {
    id: number;
    candidate_name: string;
    job_title: string;
    status: string;
    created_at: string;
  }[];
}

export default function EmployerDashboardPage() {
  const { user } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [data, setData] = useState<EmployerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/employer/dashboard")
      .then((res) => {
        const d = res.data;
        setData({
          jobs_count: d.stats?.total_jobs || 0,
          active_jobs: d.stats?.active_jobs || 0,
          total_applicants: d.stats?.total_applicants || 0,
          total_views: 0,
          wallet_balance: 0,
          recent_applications: d.recent_applications || [],
        });
      })
      .catch((err) => toast.error(err?.response?.data?.message || "Failed to load dashboard data"))
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    {
      title: isBn ? "মোট পোস্ট" : "Total Jobs",
      value: data?.jobs_count || 0,
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: isBn ? "সক্রিয়" : "Active Jobs",
      value: data?.active_jobs || 0,
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: isBn ? "আবেদনকারী" : "Applicants",
      value: data?.total_applicants || 0,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: isBn ? "ভিউ" : "Total Views",
      value: data?.total_views || 0,
      icon: Eye,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-950",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isBn ? `স্বাগতম, ${user?.name ?? "সদস্য"}` : `Welcome${user?.name ? `, ${user.name}` : ""}`}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isBn ? "আপনার নিয়োগকর্তা ড্যাশবোর্ড" : "Employer Dashboard Overview"}
          </p>
        </div>
        <Button asChild>
          <Link href="/employer/post-job">
            <Plus className="h-4 w-4 mr-2" />
            {isBn ? "নতুন পোস্ট" : "Post Job"}
          </Link>
        </Button>
      </div>

      {/* Stats */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-5"><Skeleton className="h-8 w-24" /></Card>
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
                  <div className="p-3 rounded-xl bg-white/60 dark:bg-white/10">
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
            <Link href="/employer/post-job" className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60">
                  <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-bold text-foreground">{isBn ? "নতুন চাকরি পোস্ট" : "Post a Job"}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <Link href="/employer/applicants" className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-bold text-foreground">{isBn ? "আবেদনকারী দেখুন" : "View Applicants"}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow">
          <CardContent className="p-5">
            <Link href="/employer/manage-jobs" className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/60">
                  <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-bold text-foreground">{isBn ? "চাকরি পরিচালনা" : "Manage Jobs"}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{isBn ? "সাম্প্রতিক আবেদন" : "Recent Applications"}</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/employer/applicants">
              {isBn ? "সব দেখুন" : "View All"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : !data?.recent_applications?.length ? (
            <p className="text-muted-foreground text-center py-4">
              {isBn ? "এখনো কোনো আবেদন নেই" : "No applications yet"}
            </p>
          ) : (
            <div className="space-y-3">
              {data.recent_applications.map((app) => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{app.candidate_name}</p>
                    <p className="text-sm text-muted-foreground">{app.job_title}</p>
                  </div>
                  <Badge variant="outline" className="capitalize">{app.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
