"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target, MessageSquare, DollarSign, Route,
} from "lucide-react";

interface Props {
  isBn: boolean;
}

export default function ProfileQuickActions({ isBn }: Props) {
  const actions = [
    { icon: Target, label: isBn ? "AI জব ম্যাচ" : "AI Job Match", desc: isBn ? "প্রতিদিন সেরা চাকরির ম্যাচ পান" : "Get best job matches daily", href: "/ai-career", color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40", iconBg: "bg-blue-100 dark:bg-blue-900/60" },
    { icon: MessageSquare, label: isBn ? "সাক্ষাৎকার সহকারী" : "Interview Assistant", desc: isBn ? "AI দিয়ে সাক্ষাৎকারের প্রস্তুতি নিন" : "Prepare for interviews with AI", href: "/ai-mock-interview", color: "text-purple-600 bg-purple-50 dark:bg-purple-950/40", iconBg: "bg-purple-100 dark:bg-purple-900/60" },
    { icon: DollarSign, label: isBn ? "বেতন পূর্বাভাস" : "Salary Predictor", desc: isBn ? "আপনার বাজার মূল্য যাচাই করুন" : "Check your market value", href: "/ai-career", color: "text-green-600 bg-green-50 dark:bg-green-950/40", iconBg: "bg-green-100 dark:bg-green-900/60" },
    { icon: Route, label: isBn ? "ক্যারিয়ার রোডম্যাপ" : "Career Roadmap", desc: isBn ? "AI দিয়ে আপনার ক্যারিয়ার পরিকল্পনা করুন" : "Plan your career with AI", href: "/ai-career", color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40", iconBg: "bg-indigo-100 dark:bg-indigo-900/60" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {actions.map((action, i) => (
        <Link key={i} href={action.href}>
          <Card className={`h-full hover:shadow-md transition-shadow cursor-pointer ${action.color} border-transparent`}>
            <CardContent className="p-4 text-center">
              <div className={`w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center ${action.iconBg}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <p className="font-semibold text-sm mb-0.5">{action.label}</p>
              <p className="text-[11px] text-muted-foreground">{action.desc}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}