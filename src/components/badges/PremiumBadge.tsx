"use client";

import { Crown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PremiumBadgeProps {
  plan?: string | null;
  className?: string;
}

export default function PremiumBadge({ plan, className }: PremiumBadgeProps) {
  const planLower = (plan || "").toLowerCase();
  const isPro = planLower.includes("pro");
  const label = isPro ? "Pro" : "Premium";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-sm",
        isPro
          ? "bg-gradient-to-r from-violet-500 to-purple-600"
          : "bg-gradient-to-r from-amber-400 to-orange-500",
        className
      )}
      title={`${label} Member`}
    >
      {isPro ? (
        <Sparkles className="h-2.5 w-2.5" />
      ) : (
        <Crown className="h-2.5 w-2.5" />
      )}
      {label}
    </span>
  );
}
