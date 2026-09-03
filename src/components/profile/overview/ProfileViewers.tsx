"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatRelativeTime } from "@/lib/utils";
import { Eye } from "lucide-react";

interface Props {
  views: any[];
  isBn: boolean;
}

export default function ProfileViewers({ views, isBn }: Props) {
  if (!views.length) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Eye className="h-4 w-4 text-muted-foreground" />
            {isBn ? "কে দেখেছে" : "Who Viewed My Profile"}
          </h3>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground text-xs">
            <Link href="/dashboard/analytics">{isBn ? "সব দেখুন" : "View all"}</Link>
          </Button>
        </div>
        <div className="space-y-2">
          {views.slice(0, 5).map((v: any, i: number) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">
                {(v.company_name || "A")[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate text-xs">{v.company_name || (isBn ? "অজ্ঞাত" : "Anonymous")}</p>
                <p className="text-[10px] text-muted-foreground">{v.timestamp ? formatRelativeTime(v.timestamp) : ""}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}