"use client";

import React, { useCallback, useEffect, useState } from "react";
import api from "@/lib/api-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Batch {
  id: number;
  channel: string;
  template: string;
  subject?: string;
  status_badge: string;
  total_recipients: number;
  sent_count: number;
  failed_count: number;
  sms_count?: number;
  sms_cost?: number;
  created_at: string;
}

interface RecipientRow {
  id: number;
  channel: string;
  recipient_email?: string;
  recipient_phone?: string;
  status: string;
  error?: string;
  attempts?: number;
  sent_at?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isBn: boolean;
}

const STATUS_LABEL: Record<string, [string, string, string]> = {
  pending: ["Pending", "secondary", "pending"],
  queued: ["Queued", "secondary", "queued"],
  sent: ["Sent", "success", "sent"],
  failed: ["Failed", "destructive", "failed"],
  skipped: ["Skipped", "secondary", "skipped"],
};

function statusBadgeLabel(b: string, isBn: boolean) {
  const map: Record<string, string> = {
    pending: isBn ? "বাকি" : "Pending",
    processing: isBn ? "প্রক্রিয়াধীন" : "Processing",
    completed: isBn ? "সম্পন্ন" : "Completed",
    partial_failed: isBn ? "আংশিক ব্যর্থ" : "Partial Failed",
  };
  return map[b] ?? b;
}

export function DeliveryMonitorDialog({ open, onOpenChange, isBn }: Props) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Batch | null>(null);
  const [recipients, setRecipients] = useState<RecipientRow[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [retrying, setRetrying] = useState<number | null>(null);

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/employer/bulk-messages");
      setBatches(res.data?.data ?? []);
    } catch {
      toast.error(isBn ? "লোড ব্যর্থ" : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [isBn]);

  useEffect(() => {
    if (open) fetchBatches();
  }, [open, fetchBatches]);

  const openBatch = async (b: Batch) => {
    setSelected(b);
    setRecLoading(true);
    setRecipients([]);
    try {
      const res = await api.get(`/employer/bulk-messages/${b.id}/recipients`);
      setRecipients(res.data?.data ?? []);
    } catch {
      toast.error(isBn ? "রেসিপিয়েন্ট লোড ব্যর্থ" : "Failed to load recipients");
    } finally {
      setRecLoading(false);
    }
  };

  const retry = async (recipientId: number) => {
    if (!selected) return;
    setRetrying(recipientId);
    try {
      const res = await api.post(`/employer/bulk-messages/${selected.id}/recipients/${recipientId}/retry`);
      toast.success(res.data?.message || (isBn ? "আবার পাঠানো হচ্ছে" : "Resent"));
      const updated = recipients.map((r) =>
        r.id === recipientId ? { ...r, status: "queued", error: undefined } : r
      );
      setRecipients(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (isBn ? "পাঠানো ব্যর্থ" : "Retry failed"));
    } finally {
      setRetrying(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isBn ? "ডেলিভারি মনিটর" : "Delivery Monitor"}</DialogTitle>
        </DialogHeader>

        {!selected ? (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button variant="outline" size="sm" onClick={fetchBatches} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
            {loading && !batches.length ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : batches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {isBn ? "কোনো বাল্ক বার্তা পাওয়া যায়নি" : "No bulk messages yet"}
              </p>
            ) : (
              batches.map((b) => (
                <button
                  key={b.id}
                  onClick={() => openBatch(b)}
                  className="w-full text-left rounded-lg border p-3 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {b.channel.toUpperCase()} · {b.template}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isBn ? "মোট" : "Total"}: {b.total_recipients} · {isBn ? "সফল" : "Sent"}: {b.sent_count} · {isBn ? "ব্যর্থ" : "Failed"}: {b.failed_count}
                        {b.sms_cost ? ` · ${b.sms_count} SMS = ${b.sms_cost} ৳` : ""}
                      </p>
                    </div>
                    <Badge variant="secondary">{statusBadgeLabel(b.status_badge, isBn)}</Badge>
                  </div>
                </button>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selected.id} · {selected.channel.toUpperCase()}
              </p>
              <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
                {isBn ? "ফিরুন" : "Back"}
              </Button>
            </div>
            {recLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : (
              <div className="divide-y rounded-lg border">
                {recipients.map((r) => {
                  const [label, variant, raw] = STATUS_LABEL[r.status] ?? [r.status, "secondary", r.status];
                  return (
                    <div key={r.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <div className="min-w-0">
                        <p className="truncate">{r.recipient_email || r.recipient_phone || `#${r.id}`}</p>
                        {r.error && <p className="text-xs text-red-500 truncate">{r.error}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={variant as any}>{label}</Badge>
                        {r.status === "failed" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => retry(r.id)}
                            disabled={retrying === r.id}
                          >
                            {retrying === r.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}