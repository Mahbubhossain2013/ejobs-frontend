"use client";

import React, { useEffect, useState } from "react";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ShoppingBag,
  CreditCard,
  FileText,
  Filter,
} from "lucide-react";

interface Purchase {
  id: number;
  type: string;
  category: string;
  title: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  invoice_number?: string;
}

interface Summary {
  total_invoices: number;
  total_invoices_paid: number;
  total_spent: number;
  active_subscriptions: number;
  has_active_plan: boolean;
  plan_name: string | null;
}

export default function EmployerPurchasesPage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchPurchases = async (type = "all") => {
    setLoading(true);
    try {
      const res = await api.get(`/purchases?type=${type}&limit=50`);
      setPurchases(res.data?.data || []);
      setSummary(res.data?.summary || null);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases(filter);
  }, [filter]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "invoice": return <FileText className="h-4 w-4" />;
      case "subscription": return <CreditCard className="h-4 w-4" />;
      case "cv_template": return <FileText className="h-4 w-4" />;
      default: return <ShoppingBag className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid": case "completed": case "active": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "pending": case "draft": return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "overdue": case "failed": case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      case "refunded": return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default: return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400";
    }
  };

  const filters = [
    { value: "all", label: isBn ? "সব" : "All" },
    { value: "invoices", label: isBn ? "ইনভয়েস" : "Invoices" },
    { value: "subscriptions", label: isBn ? "সাবস্ক্রিপশন" : "Subscriptions" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isBn ? "আমার কেনাকাটা" : "My Purchases"}</h1>
        <p className="text-muted-foreground mt-1">
          {isBn ? "সব কেনাকাটা এবং লেনদেন দেখুন" : "View all your purchases and transactions"}
        </p>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{isBn ? "মোট খরচ" : "Total Spent"}</p>
              <p className="text-xl font-bold">{formatCurrency(summary.total_spent)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{isBn ? "পেইড ইনভয়েস" : "Paid Invoices"}</p>
              <p className="text-xl font-bold">{summary.total_invoices_paid}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{isBn ? "সক্রিয় সাবস্ক্রিপশন" : "Active Subscriptions"}</p>
              <p className="text-xl font-bold">{summary.active_subscriptions}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{isBn ? "বর্তমান প্ল্যান" : "Current Plan"}</p>
              <p className="text-xl font-bold">{summary.plan_name ?? (isBn ? "ফ্রি" : "Free")}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {filters.map((f) => (
          <Button
            key={f.value}
            variant={filter === f.value ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold">
            {isBn ? "কোনো কেনাকাটা নেই" : "No purchases yet"}
          </h3>
        </div>
      ) : (
        <div className="space-y-2">
          {purchases.map((p) => (
            <Card key={`${p.type}-${p.id}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                  {getTypeIcon(p.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.invoice_number && `${p.invoice_number} · `}
                    {new Date(p.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  {p.amount > 0 && (
                    <p className="font-medium text-sm">{formatCurrency(p.amount)}</p>
                  )}
                  <Badge className={`text-[10px] mt-1 ${getStatusColor(p.status)}`}>
                    {p.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
