"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Target, TrendingUp, Award, Code, Zap } from "lucide-react";
import CircularScoreCard from "./CircularScoreCard";

interface Props {
  matchScore: number;
  profileStrength: number;
  skills: string[];
  isBn: boolean;
}

export default function AiProfileInsightsCard({ matchScore, profileStrength, skills, isBn }: Props) {
  const getLabel = (score: number) => {
    if (score >= 70) return isBn ? "দারুণ ম্যাচ!" : "Great match!";
    if (score >= 40) return isBn ? "ভালো ম্যাচ" : "Good Match";
    return isBn ? "দুর্বল ম্যাচ" : "Weak Match";
  };

  const getScoreText = (score: number) => {
    if (score >= 70) return isBn ? "দারুণ ম্যাচ!" : "Great Match";
    if (score >= 40) return isBn ? "ভালো ম্যাচ" : "Good Match";
    return isBn ? "দুর্বল ম্যাচ" : "Weak Match";
  };

  const improvementTips = [
    isBn ? "আপনার লক্ষ্য পদের সাথে সম্পর্কিত আরও স্কিল যোগ করুন" : "Add more skills relevant to your target role",
    isBn ? "চাহিদার স্কিলে সার্টিফিকেশন অর্জন করুন" : "Get certified in in-demand skills",
    isBn ? "আপনার কাজ প্রদর্শন করতে প্রজেক্ট লিংক আপলোড করুন" : "Upload project links to showcase your work",
  ];

  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-bold">{isBn ? "AI প্রোফাইল অন্তর্দৃষ্টি" : "AI Profile Insights"}</h3>
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="shrink-0">
              <CircularScoreCard score={matchScore} size={90} strokeWidth={7} />
            </div>
            <div>
              <p className="text-sm font-semibold">{getScoreText(matchScore)}</p>
              <p className="text-xs text-muted-foreground">
                {isBn ? "আপনার প্রোফাইল অনেক চাকরির সাথে মিলেছে" : "Your profile matches well with many jobs."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h4 className="text-sm font-bold mb-3">{isBn ? "স্কোর উন্নত করুন" : "Improve Your Score"}</h4>
          <div className="space-y-2.5">
            {improvementTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Zap className="h-3 w-3 text-primary" />
                </div>
                <p className="text-xs text-muted-foreground">{tip}</p>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="w-full mt-4" asChild>
            <Link href="/ai-career">
              {isBn ? "AI পরামর্শ পান" : "Get AI Suggestions"}
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}