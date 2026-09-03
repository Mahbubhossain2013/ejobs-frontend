"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, CheckCircle } from "lucide-react";

interface Section {
  label: string;
  done: boolean;
}

interface Props {
  strengthPercent: number;
  sections: Section[];
  isBn: boolean;
}

export default function ProfileStrengthWidget({ strengthPercent, sections, isBn }: Props) {
  const getGrade = (pct: number) => {
    if (pct >= 80) return { label: isBn ? "সেরা" : "Excellent", color: "text-green-600" };
    if (pct >= 60) return { label: isBn ? "ভালো" : "Good", color: "text-blue-600" };
    if (pct >= 40) return { label: isBn ? "গড়" : "Average", color: "text-amber-600" };
    return { label: isBn ? "দুর্বল" : "Weak", color: "text-red-600" };
  };
  const grade = getGrade(strengthPercent);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6 text-center">
        <h3 className="text-sm font-bold mb-3">{isBn ? "প্রোফাইল শক্তি" : "Profile Strength"}</h3>
        <div className="relative w-24 h-24 mx-auto mb-3">
          <svg width={96} height={96} className="transform -rotate-90">
            <circle cx={48} cy={48} r={40} stroke="hsl(var(--muted))" strokeWidth={8} fill="transparent" />
            <circle cx={48} cy={48} r={40} stroke="hsl(var(--primary))" strokeWidth={8} fill="transparent" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 - (strengthPercent / 100) * 2 * Math.PI * 40} strokeLinecap="round" className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold">{strengthPercent}%</span>
          </div>
        </div>
        <p className={`text-sm font-semibold mb-1 ${grade.color}`}>{grade.label}</p>
        <p className="text-[11px] text-muted-foreground mb-3">
          {isBn ? "আপনার প্রোফাইল নিয়োগকর্তাদের কাছে দৃশ্যমান" : "Your profile is visible to employers"}
        </p>
        <div className="space-y-1.5 text-left">
          {sections.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {s.done ? (
                <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
              )}
              <span className={s.done ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
            </div>
          ))}
        </div>
        {strengthPercent < 80 && (
          <Button variant="outline" size="sm" className="w-full mt-4" asChild>
            <Link href="/dashboard/profile">{isBn ? "প্রোফাইল উন্নত করুন" : "Improve Profile"}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}