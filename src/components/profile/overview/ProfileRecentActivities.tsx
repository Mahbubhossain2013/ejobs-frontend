"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import {
  Send, CheckCircle, Calendar, Eye, ArrowRight,
} from "lucide-react";

interface Props {
  applications: any[];
  profileViews: any[];
  isBn: boolean;
}

const ACTIVITY_ICONS: Record<string, any> = {
  application: Send,
  shortlisted: CheckCircle,
  interview: Calendar,
  assessment: CheckCircle,
  profile_view: Eye,
};

const ACTIVITY_COLORS: Record<string, string> = {
  application: "text-blue-500 bg-blue-50 dark:bg-blue-950/40",
  shortlisted: "text-green-500 bg-green-50 dark:bg-green-950/40",
  interview: "text-purple-500 bg-purple-50 dark:bg-purple-950/40",
  assessment: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
  profile_view: "text-gray-500 bg-gray-50 dark:bg-gray-950/40",
};

export default function ProfileRecentActivities({ applications, profileViews, isBn }: Props) {
  const activities: { type: string; text: string; time: string }[] = [];

  if (Array.isArray(applications)) {
    applications.slice(0, 3).forEach((app: any) => {
      if (app.job?.title) {
        const action = app.status === "shortlisted" ? (isBn ? "শর্টলিস্টেড" : "Shortlisted for") : (isBn ? "আবেদন করেছেন" : "Applied for");
        activities.push({ type: app.status === "shortlisted" ? "shortlisted" : "application", text: `${action} ${app.job.title} ${app.job.company?.name ? `at ${app.job.company.name}` : ""}`, time: app.created_at });
      }
    });
  }

  if (Array.isArray(profileViews)) {
    profileViews.slice(0, 2).forEach((view: any) => {
      activities.push({ type: "profile_view", text: `${isBn ? "প্রোফাইল দেখেছে" : "Profile viewed by"} ${view.company_name || (isBn ? "একটি কোম্পানি" : "a company")}`, time: view.timestamp || view.created_at });
    });
  }

  if (!activities.length) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{isBn ? "সাম্প্রতিক কার্যক্রম" : "Recent Activities"}</h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/dashboard/applied-jobs">
              {isBn ? "সব দেখুন" : "View All"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        <div className="space-y-3">
          {activities.slice(0, 5).map((activity, i) => {
            const Icon = ACTIVITY_ICONS[activity.type] || Eye;
            const color = ACTIVITY_COLORS[activity.type] || "text-gray-500 bg-gray-50";
            return (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time && formatRelativeTime(activity.time)}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}