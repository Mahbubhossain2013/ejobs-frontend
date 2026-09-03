"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Edit3, MapPin, DollarSign, Briefcase, Globe } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Props {
  profile: any;
  isBn: boolean;
}

export default function ProfileJobPreferences({ profile, isBn }: Props) {
  const p = profile;
  const hasData = p.current_profession || p.expected_job_category || p.preferred_location || p.expected_salary;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            {isBn ? "চাকরির পছন্দ" : "Job Preferences"}
          </h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/dashboard/profile">
              <Edit3 className="h-3.5 w-3.5" /> {isBn ? "এডিট" : "Edit"}
            </Link>
          </Button>
        </div>
        {hasData ? (
          <div className="space-y-3 text-sm">
            {p.current_profession && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Briefcase className="h-3.5 w-3.5" /> {isBn ? "পছন্দের পদবি" : "Preferred Roles"}</span>
                <span className="font-medium">{p.current_profession}</span>
              </div>
            )}
            {p.expected_job_category && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Target className="h-3.5 w-3.5" /> {isBn ? "ক্যাটাগরি" : "Preferred Categories"}</span>
                <span className="font-medium">{p.expected_job_category}</span>
              </div>
            )}
            {p.available_remote !== undefined && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><Globe className="h-3.5 w-3.5" /> {isBn ? "কাজের ধরন" : "Preferred Work Type"}</span>
                <span className="font-medium">{p.available_remote ? "Full Time" : "On-site"}</span>
              </div>
            )}
            {p.preferred_location && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5" /> {isBn ? "পছন্দের লোকেশন" : "Preferred Location"}</span>
                <span className="font-medium">{p.preferred_location}</span>
              </div>
            )}
            {p.expected_salary && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2"><DollarSign className="h-3.5 w-3.5" /> {isBn ? "প্রত্যাশিত বেতন" : "Expected Salary"}</span>
                <span className="font-medium">৳ {p.expected_salary}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">{isBn ? "এখনো তথ্য যোগ করা হয়নি" : "No preferences set yet"}</p>
        )}
      </CardContent>
    </Card>
  );
}