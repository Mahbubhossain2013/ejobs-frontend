"use client";

import { Award, Shield, Zap, Star, CheckCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface BadgeData {
  badge_key?: string;
  name?: string;
  icon?: string;
  color?: string;
  rarity?: string;
  description?: string;
  earned_at?: string;
}

interface BadgeDisplayProps {
  badge: BadgeData;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  showRarity?: boolean;
  className?: string;
}

const RARITY_STYLES: Record<string, string> = {
  common: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  rare: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  legendary: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-400",
};

const ICON_MAP: Record<string, any> = {
  verified: CheckCircle,
  premium: Zap,
  pro: Star,
  employer_verified: Shield,
  featured: Award,
  top_employer: Trophy,
  nid_verified: Shield,
  trusted_recruiter: Shield,
  phone_verified: CheckCircle,
  email_verified: CheckCircle,
};

function getBadgeColor(color?: string, badgeKey?: string): string {
  if (color && color.startsWith("#")) {
    return `bg-[${color}]/10 text-[${color}] border-[${color}]/20`;
  }

  const keyColorMap: Record<string, string> = {
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    premium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    pro: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800",
    employer_verified: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    featured: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    top_employer: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    nid_verified: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    trusted_recruiter: "bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800",
    phone_verified: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    email_verified: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
  };

  return keyColorMap[badgeKey || ""] || "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
}

export default function BadgeDisplay({
  badge,
  size = "sm",
  showName = true,
  showRarity = false,
  className,
}: BadgeDisplayProps) {
  const IconComponent = ICON_MAP[badge.badge_key || ""] || Award;
  const colorClass = getBadgeColor(badge.color, badge.badge_key);
  const rarityClass = RARITY_STYLES[badge.rarity || "common"] || RARITY_STYLES.common;

  const sizeConfig = {
    sm: { icon: "h-3 w-3", text: "text-[10px]", padding: "px-2 py-0.5", gap: "gap-1" },
    md: { icon: "h-3.5 w-3.5", text: "text-xs", padding: "px-2.5 py-1", gap: "gap-1.5" },
    lg: { icon: "h-4 w-4", text: "text-sm", padding: "px-3 py-1.5", gap: "gap-2" },
  };

  const config = sizeConfig[size];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        config.padding,
        config.gap,
        colorClass,
        className
      )}
      title={badge.description || badge.name}
    >
      <IconComponent className={config.icon} />
      {showName && <span className={config.text}>{badge.name || badge.badge_key}</span>}
      {showRarity && badge.rarity && badge.rarity !== "common" && (
        <span className={cn("ml-0.5 text-[8px] uppercase tracking-wider opacity-70", rarityClass)}>
          {badge.rarity}
        </span>
      )}
    </span>
  );
}

export function BadgeGrid({
  badges,
  size = "md",
  emptyText = "No badges earned yet",
}: {
  badges: BadgeData[];
  size?: "sm" | "md" | "lg";
  emptyText?: string;
}) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center py-4 text-sm text-muted-foreground">
        <Award className="h-8 w-8 mx-auto mb-2 opacity-30" />
        {emptyText}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, i) => (
        <BadgeDisplay key={badge.badge_key || i} badge={badge} size={size} showRarity />
      ))}
    </div>
  );
}
