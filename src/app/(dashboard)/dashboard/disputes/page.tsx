"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { AlertTriangle, Clock, CheckCircle, XCircle, Shield } from "lucide-react";

interface Dispute {
  id: number;
  job_title?: string;
  reason: string;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  in_review: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  rejected: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
};

export default function DisputesPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/settings/financial")
      .then((res) => setDisputes(res.data?.data?.disputes || []))
      .catch(() => toast.error("Failed to load disputes"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {isBn ? "বিরোধ সমাধান" : "Disputes"}
        </h1>
        <p className="text-muted-foreground mt-1">
          {isBn ? "আপনার কাজ সংক্রান্ত বিরোধ দেখুন" : "View disputes related to your jobs"}
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">
            {isBn ? "কোনো বিরোধ নেই" : "No disputes found"}
          </p>
          <p className="text-sm mt-1">
            {isBn ? "আপনার সব কাজ সুষ্ঠুভাবে চলছে" : "All your jobs are running smoothly"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {disputes.map((d) => (
            <Card key={d.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-1">{d.reason}</h3>
                    {d.job_title && (
                      <p className="text-xs text-muted-foreground mb-1">{d.job_title}</p>
                    )}
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {d.created_at}
                    </p>
                  </div>
                  <span className={`shrink-0 px-2 py-1 rounded-full text-[10px] font-semibold ${STATUS_COLORS[d.status] || ""}`}>
                    {d.status.replace("_", " ")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
