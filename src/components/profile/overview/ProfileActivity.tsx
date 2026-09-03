"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, ArrowRight } from "lucide-react";

interface Props {
  applications: any[];
  isBn: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  shortlisted: "bg-emerald-100 text-emerald-700",
  rejected: "bg-red-100 text-red-700",
};

export default function ProfileActivity({ applications, isBn }: Props) {
  if (!applications.length) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">{isBn ? "সাম্প্রতিক কার্যক্রম" : "Activity"}</h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/dashboard/applied-jobs">{isBn ? "সব দেখুন" : "See all"} <ArrowRight className="h-3.5 w-3.5 ml-0.5" /></Link>
          </Button>
        </div>
        <div className="space-y-3">
          {applications.slice(0, 3).map((app: any, i: number) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors">
              <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                <Briefcase className="h-5 w-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{app.job?.title || "Job"}</p>
                <p className="text-xs text-muted-foreground">
                  {app.job?.company?.name || ""} {app.job?.location ? `· ${app.job.location}` : ""}
                </p>
              </div>
              <Badge variant="outline" className={`text-[10px] capitalize shrink-0 ${STATUS_COLORS[app.status] || ""}`}>
                {app.status || "Applied"}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}