"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle } from "lucide-react";

interface Section { label: string; done: boolean; }

interface Props {
  strengthPercent: number;
  sections: Section[];
  isBn: boolean;
}

export default function ProfileStrength({ strengthPercent, sections, isBn }: Props) {
  if (strengthPercent >= 80) return null;

  return (
    <Card className="border-0 shadow-sm border-l-4 border-l-amber-400">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-bold">{isBn ? "প্রোফাইল শক্তি" : "Profile Strength"}</h2>
          </div>
          <span className="text-2xl font-bold text-primary">{strengthPercent}%</span>
        </div>
        <Progress value={strengthPercent} className="h-2 mb-4" />
        <div className="grid grid-cols-2 gap-2">
          {sections.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              {s.done ? (
                <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border-2 border-muted-foreground/30 shrink-0" />
              )}
              <span className={s.done ? "text-foreground" : "text-muted-foreground"}>{s.label}</span>
            </div>
          ))}
        </div>
        <Button variant="outline" size="sm" className="w-full mt-4" asChild>
          <Link href="/dashboard/profile">{isBn ? "প্রোফাইল উন্নত করুন" : "Complete Profile"}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}