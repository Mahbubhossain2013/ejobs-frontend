"use client";

import React from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TimelineItem {
  title: string;
  subtitle: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  extra?: string;
  description?: string;
  is_current?: boolean;
}

interface Props {
  icon: React.ElementType;
  title: string;
  items: TimelineItem[];
  editHref: string;
  isBn: boolean;
}

export default function ProfileTimeline({ icon: Icon, title, items, editHref, isBn }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <Icon className="h-5 w-5 text-muted-foreground" />
            {title}
          </h2>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground">
            <Link href={editHref}>
              <Plus className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
        {!items.length ? (
          <div className="text-center py-6">
            <Icon className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              {isBn ? "এখনো কোনো তথ্য যোগ করা হয়নি" : "No information added yet"}
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link href={editHref}>
                <Plus className="h-3.5 w-3.5 mr-1" /> {isBn ? "যোগ করুন" : "Add Now"}
              </Link>
            </Button>
          </div>
        ) : (
        <div className="space-y-0">
          {items.map((item, i) => (
            <div key={i} className="relative pl-8 pb-6 last:pb-0">
              <div className="absolute left-0 top-1.5 w-[18px] flex flex-col items-center">
                <div className="h-[18px] w-[18px] rounded-full bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-400 dark:border-blue-500 flex items-center justify-center">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                </div>
                {i < items.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
              </div>
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-sm text-foreground">{item.subtitle}</p>
                    {item.location && (
                      <p className="text-xs text-muted-foreground mt-0.5">{item.location}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {item.startDate}{item.endDate ? ` - ${item.endDate}` : ""}
                      {item.extra ? ` (${item.extra})` : ""}
                    </span>
                    {item.is_current && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {isBn ? "বর্তমান" : "Present"}
                      </span>
                    )}
                  </div>
                </div>
                {item.description && (
                  <p className="text-sm text-muted-foreground mt-2 leading-relaxed whitespace-pre-line">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
}