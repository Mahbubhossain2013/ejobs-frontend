"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BadgeGrid } from "@/components/badges/BadgeDisplay";
import { Trophy } from "lucide-react";

interface Props {
  badges: any[];
  isBn: boolean;
}

export default function ProfileBadges({ badges, isBn }: Props) {
  if (!badges.length) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-amber-500" />
          <h2 className="text-lg font-bold">{isBn ? "অর্জিত ব্যাজ" : "Earned Badges"}</h2>
        </div>
        <BadgeGrid badges={badges} size="md" />
      </CardContent>
    </Card>
  );
}