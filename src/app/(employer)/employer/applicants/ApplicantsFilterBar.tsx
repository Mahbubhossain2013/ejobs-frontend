"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "all", key: "all" },
  { value: "pending", key: "pending" },
  { value: "reviewed", key: "reviewed" },
  { value: "shortlisted", key: "shortlisted" },
  { value: "rejected", key: "rejected" },
  { value: "hired", key: "hired" },
] as const;

interface Props {
  statusFilter: string;
  statusCounts: Record<string, number>;
  searchQuery: string;
  isBn: boolean;
  onStatusChange: (v: string) => void;
  onSearchChange: (v: string) => void;
}

const LABELS: Record<string, { en: string; bn: string }> = {
  all: { en: "All", bn: "সব" },
  pending: { en: "Pending", bn: "পেন্ডিং" },
  reviewed: { en: "Reviewed", bn: "রিভিউ" },
  shortlisted: { en: "Shortlisted", bn: "শর্টলিস্ট" },
  rejected: { en: "Rejected", bn: "প্রত্যাখ্যাত" },
  hired: { en: "Hired", bn: "নিয়োগ" },
};

export default function ApplicantsFilterBar({
  statusFilter,
  statusCounts,
  searchQuery,
  isBn,
  onStatusChange,
  onSearchChange,
}: Props) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <div className="flex gap-1 flex-wrap">
          {STATUS_OPTIONS.map((opt) => (
            <Button
              key={opt.value}
              variant={statusFilter === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => onStatusChange(opt.value)}
              className="h-8 text-xs"
            >
              {isBn ? LABELS[opt.value].bn : LABELS[opt.value].en}
              <Badge variant="secondary" className="ml-1 text-[10px] px-1 py-0">
                {statusCounts[opt.value] ?? 0}
              </Badge>
            </Button>
          ))}
        </div>
      </div>
      <input
        type="text"
        placeholder={isBn ? "নাম বা চাকরি খুঁজুন..." : "Search by name or job..."}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="h-8 px-3 rounded-md border bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-ring w-full sm:w-64"
      />
    </div>
  );
}