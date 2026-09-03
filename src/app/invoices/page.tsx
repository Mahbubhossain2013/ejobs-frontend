"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";
import { formatCurrency, formatDate } from "@/lib/utils";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FileText,
  Search,
  AlertCircle,
  Receipt,
  Download,
  ArrowLeft,
  Loader2,
  Calendar,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

interface Invoice {
  id: number;
  invoice_number: string;
  subtotal: number;
  tax_amount: number;
  total: number;
  currency?: string;
  status: string;
  description?: string;
  notes?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

interface InvoiceDetail extends Invoice {
  items?: InvoiceItem[];
}

const STATUS_COLORS: Record<string, string> = {
  paid: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  overdue: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  draft: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  cancelled: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500",
};

const STATUS_LABELS: Record<string, Record<string, string>> = {
  paid: { en: "Paid", bn: "পরিশোধিত" },
  pending: { en: "Pending", bn: "মুলতুবি" },
  overdue: { en: "Overdue", bn: "বকেয়" },
  draft: { en: "Draft", bn: "খসড়া" },
  cancelled: { en: "Cancelled", bn: "বাতিল" },
};

function getCurrencySymbol(currency?: string): string {
  if (currency === "USD") return "$";
  return "৳";
}

export default function InvoicesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetail | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    api
      .get("/settings/financial")
      .then((res) => setInvoices(res.data?.data?.invoices || []))
      .catch(() => toast.error("Failed to load invoices"))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const fetchInvoiceDetail = useCallback(
    async (id: number) => {
      setDetailLoading(true);
      try {
        const res = await api.get(`/invoices/${id}`);
        setSelectedInvoice(res.data?.data || res.data);
      } catch {
        toast.error(
          isBn
            ? "ইনভয়েস বিস্তারিত লোড করা যায়নি"
            : "Failed to load invoice details",
        );
      } finally {
        setDetailLoading(false);
      }
    },
    [isBn],
  );

  const handleDownload = useCallback(
    async (id: number, invoiceNumber: string) => {
      setDownloadingId(id);
      try {
        const res = await api.get(`/invoices/${id}/download`, {
          responseType: "blob",
        });
        const blob = new Blob([res.data], { type: "application/pdf" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `invoice-${invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(
          isBn ? "ডাউনলোড শুরু হয়েছে" : "Download started",
        );
      } catch {
        toast.error(isBn ? "ডাউনলোড ব্যর্থ" : "Download failed");
      } finally {
        setDownloadingId(null);
      }
    },
    [isBn],
  );

  const filtered = invoices.filter(
    (inv) =>
      inv.invoice_number?.toLowerCase().includes(search.toLowerCase()) ||
      inv.description?.toLowerCase().includes(search.toLowerCase()),
  );

  const t = (en: string, bn: string) => (isBn ? bn : en);

  /* ── Detail view ── */
  if (selectedInvoice) {
    const inv = selectedInvoice;
    const symbol = getCurrencySymbol(inv.currency);
    const statusLabel =
      STATUS_LABELS[inv.status]?.[language] || inv.status;

    return (
      <PublicLayout>
        <section className="py-12 md:py-16 bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <Badge variant="secondary" className="mb-4">
              <Receipt className="h-3 w-3 mr-1" />
              {t("Invoice", "ইনভয়েস")}
            </Badge>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {t("Invoice Details", "ইনভয়েস বিস্তারিত")}
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {inv.invoice_number}
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <Button
              variant="ghost"
              className="mb-6 gap-2"
              onClick={() => setSelectedInvoice(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("Back to Invoices", "ইনভয়েসে ফিরে যান")}
            </Button>

            {detailLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-64 w-full rounded-lg" />
              </div>
            ) : (
              <Card>
                <CardContent className="p-6 space-y-6">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">
                          #{inv.invoice_number}
                        </h2>
                        <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(inv.created_at)}
                        </div>
                      </div>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[inv.status] || ""}`}
                    >
                      {statusLabel}
                    </span>
                  </div>

                  {/* Description & Notes */}
                  {inv.description && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">
                        {t("Description", "বিবরণ")}
                      </p>
                      <p className="text-sm">{inv.description}</p>
                    </div>
                  )}

                  {inv.notes && (
                    <div className="flex gap-2">
                      <StickyNote className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-muted-foreground mb-1">
                          {t("Notes", "নোট")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {inv.notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Line Items */}
                  {inv.items && inv.items.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold mb-3">
                        {t("Line Items", "লাইন আইটেম")}
                      </h3>
                      <div className="rounded-lg border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/50">
                              <TableHead className="text-xs">
                                {t("Description", "বিবরণ")}
                              </TableHead>
                              <TableHead className="text-xs text-center">
                                {t("Qty", "পরিমাণ")}
                              </TableHead>
                              <TableHead className="text-xs text-right">
                                {t("Unit Price", "একক মূল্য")}
                              </TableHead>
                              <TableHead className="text-xs text-right">
                                {t("Amount", "পরিমাণ")}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {inv.items.map((item) => (
                              <TableRow key={item.id}>
                                <TableCell className="text-sm">
                                  {item.description}
                                </TableCell>
                                <TableCell className="text-sm text-center">
                                  {item.quantity}
                                </TableCell>
                                <TableCell className="text-sm text-right">
                                  {symbol}
                                  {item.unit_price?.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-sm text-right font-medium">
                                  {symbol}
                                  {item.amount?.toLocaleString()}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Breakdown */}
                  <div className="border-t pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        {t("Subtotal", "উপমোট")}
                      </span>
                      <span>
                        {symbol}
                        {inv.subtotal?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t pt-2">
                      <span>{t("Total", "মোট")}</span>
                      <span>
                        {symbol}
                        {inv.total?.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Due date */}
                  {inv.due_date && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {t("Due", "বেতার তারিখ")}:
                        <span className="font-medium text-foreground ml-1">
                          {formatDate(inv.due_date)}
                        </span>
                      </span>
                    </div>
                  )}

                  {/* Download button */}
                  <Button
                    className="w-full gap-2"
                    onClick={() =>
                      handleDownload(inv.id, inv.invoice_number)
                    }
                    disabled={downloadingId === inv.id}
                  >
                    {downloadingId === inv.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {t("Download PDF", "পিডিএফ ডাউনলোড")}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </PublicLayout>
    );
  }

  /* ── List view ── */
  return (
    <PublicLayout>
      <section className="py-12 md:py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge variant="secondary" className="mb-4">
            <Receipt className="h-3 w-3 mr-1" />
            {t("Invoices", "ইনভয়েস")}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {t("Invoice History", "ইনভয়েস ইতিহাস")}
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t(
              "View and download all your payment invoices",
              "আপনার সকল পেমেন্ট ইনভয়েস দেখুন এবং ডাউনলোড করুন",
            )}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {!isAuthenticated ? (
            <div className="text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">
                {t("Login Required", "লগইন প্রয়োজন")}
              </p>
              <p className="text-sm mb-4">
                {t(
                  "Please login to view your invoices.",
                  "ইনভয়েস দেখতে লগইন করুন",
                )}
              </p>
              <Button onClick={() => router.push("/login")}>
                {t("Login", "লগইন")}
              </Button>
            </div>
          ) : (
            <>
              {invoices.length > 0 && (
                <div className="relative max-w-sm mb-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t(
                      "Search invoices...",
                      "ইনভয়েস খুঁজুন...",
                    )}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              )}

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full rounded-lg" />
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">
                    {t("No invoices found", "কোনো ইনভয়েস নেই")}
                  </p>
                  <p className="text-sm mt-1">
                    {search
                      ? t(
                          "Try a different search term.",
                          "অন্য কীওয়ার্ড দিয়ে খুঁজুন",
                        )
                      : t(
                          "You don't have any invoices yet.",
                          "আপনার কোনো ইনভয়েস এখনো নেই।",
                        )}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filtered.map((inv) => (
                    <Card
                      key={inv.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => fetchInvoiceDetail(inv.id)}
                    >
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-sm">
                              #{inv.invoice_number}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {inv.description ||
                                t("Payment", "পেমেন্ট")}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {formatDate(inv.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <p className="font-bold text-sm">
                              {getCurrencySymbol(inv.currency)}
                              {inv.total?.toLocaleString()}
                            </p>
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[inv.status] || ""}`}
                            >
                              {STATUS_LABELS[inv.status]?.[language] ||
                                inv.status}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownload(inv.id, inv.invoice_number);
                            }}
                            disabled={downloadingId === inv.id}
                            title={t(
                              "Download PDF",
                              "পিডিএফ ডাউনলোড",
                            )}
                          >
                            {downloadingId === inv.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </PublicLayout>
  );
}
