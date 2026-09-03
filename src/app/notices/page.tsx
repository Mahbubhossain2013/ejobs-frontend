"use client";

import React, { useEffect, useState } from "react";
import { Bell, Clock, AlertCircle } from "lucide-react";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Notice {
  category: string;
  category_bn: string;
  title: string;
  title_bn: string;
  published_at: string;
}

export default function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useThemeStore();
  const isBn = language === "bn";

  useEffect(() => {
    api
      .get("/notices")
      .then((res) => setNotices(res.data?.data || []))
      .catch(() => { /* handled */ })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PublicLayout>
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            <Bell className="h-3 w-3 mr-1" />
            {isBn ? "নোটিশ বোর্ড" : "Notice Board"}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {isBn ? "সকল নোটিশ" : "All Notices"}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isBn ? "গুরুত্বপূর্ণ নোটিশ ও নিয়োগ বিজ্ঞপ্তি দেখুন" : "View important notices and recruitment announcements"}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
              ))}
            </div>
          ) : notices.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">
                {isBn ? "কোনো নোটিশ নেই" : "No notices yet"}
              </p>
              <p className="text-sm mt-1">
                {isBn ? "পরবরীতে আবার দেখুন" : "Check back later for updates."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notices.map((n, i) => (
                <Card key={i} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Bell className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Badge variant="secondary" className="text-[10px]">
                          {isBn ? n.category_bn : n.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {n.published_at}
                        </span>
                      </div>
                      <h3 className="font-semibold text-sm">
                        {isBn ? n.title_bn : n.title}
                      </h3>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
