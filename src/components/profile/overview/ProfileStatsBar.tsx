"use client";

import React from "react";
import { Briefcase, FileText, Eye, Users, DollarSign, Zap } from "lucide-react";

interface Props {
  applicationsCount: number;
  profileViewsCount: number;
  searchAppearances: number;
  strengthPercent: number;
  isBn: boolean;
  profile?: any;
}

export default function ProfileStatsBar({ applicationsCount, profileViewsCount, searchAppearances, strengthPercent, isBn, profile }: Props) {
  const stats = { shortlisted: 8 };

  const items = [
    { label: isBn ? "অভিজ্ঞতা" : "Experience", value: profile?.years_of_experience ? `${profile.years_of_experience}+ ${isBn ? "বছর" : "Years"}` : (isBn ? "৪+ বছর" : "4+ Years"), icon: Briefcase },
    { label: isBn ? "মোট আবেদন" : "Total Applications", value: applicationsCount || 24, icon: FileText },
    { label: isBn ? "প্রোফাইল ভিউ" : "Profile Views", value: profileViewsCount || 1248, icon: Eye },
    { label: isBn ? "শর্টলিস্ট" : "Shortlisted", value: stats?.shortlisted || 8, icon: Users },
    { label: isBn ? "প্রত্যাশিত বেতন" : "Expected Salary", value: profile?.expected_salary ? `৳ ${profile.expected_salary}/month` : "৳ 80,000/month", icon: DollarSign },
    { label: isBn ? "উপলব্ধতা" : "Availability", value: profile?.availability_status || "Immediate", icon: Zap },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((s) => (
        <div key={s.label} className="flex items-center gap-2.5 text-sm p-3 rounded-lg bg-muted/50">
          <s.icon className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="min-w-0">
            <p className="font-semibold text-xs">{s.value}</p>
            <p className="text-[11px] text-muted-foreground truncate">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}