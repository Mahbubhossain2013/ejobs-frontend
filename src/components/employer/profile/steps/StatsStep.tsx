"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function StatsStep({ stats, isBn }: { stats: any; isBn: boolean }) {
  const items = [
    { label: isBn ? "মোট চাকরি" : "Total Jobs", value: stats?.total_jobs || 0, color: "text-blue-600" },
    { label: isBn ? "সক্রিয়" : "Active", value: stats?.active_jobs || 0, color: "text-green-600" },
    { label: isBn ? "আবেদন" : "Applications", value: stats?.total_applications || 0, color: "text-purple-600" },
    { label: isBn ? "শর্টলিস্ট" : "Shortlisted", value: stats?.shortlisted || 0, color: "text-amber-600" },
  ];
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((s) => (
        <Card key={s.label}><CardContent className="p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p></CardContent></Card>
      ))}
    </div>
  );
}