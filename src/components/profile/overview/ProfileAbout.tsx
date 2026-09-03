"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, ChevronDown, ChevronUp, Check } from "lucide-react";

interface Props {
  bio: string;
  isBn: boolean;
}

export default function ProfileAbout({ bio, isBn }: Props) {
  const [expanded, setExpanded] = useState(false);

  if (!bio) return null;

  // Extract key strengths from bio or use defaults
  const keyStrengths = [
    "React.js & Next.js",
    "UI/UX Implementation",
    "RESTful API Integration",
    "Performance Optimization",
    "Team Collaboration",
    "Problem Solving",
  ];

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold">{isBn ? "আমার সম্পর্কে" : "About Me"}</h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href="/dashboard/profile"><Edit3 className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
        <p className={`text-sm text-muted-foreground leading-relaxed ${!expanded && bio.length > 200 ? "line-clamp-3" : ""}`}>
          {bio}
        </p>
        {bio.length > 200 && (
          <button onClick={() => setExpanded(!expanded)} className="text-sm font-medium text-primary hover:underline mt-1 flex items-center gap-1">
            {expanded ? (isBn ? "কম দেখুন" : "Show less") : (isBn ? "আরও দেখুন" : "Show more")}
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        )}

        {/* Key Strengths */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold mb-2">{isBn ? "মূল দক্ষতা" : "Key Strengths"}</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {keyStrengths.map((strength, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
                  <Check className="h-2.5 w-2.5 text-green-600" />
                </div>
                <span className="text-muted-foreground text-xs">{strength}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}