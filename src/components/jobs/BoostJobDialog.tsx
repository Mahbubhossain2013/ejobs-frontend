"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Zap, Megaphone, Star, Wallet, CheckCircle, ArrowRight, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";

interface BoostJobDialogProps {
  jobId: number;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

type DialogView = "form" | "confirm" | "success";

export default function BoostJobDialog({
  jobId,
  jobTitle,
  open,
  onOpenChange,
  onComplete,
}: BoostJobDialogProps) {
  const { language } = useThemeStore();
  const isBn = language === "bn";

  const [duration, setDuration] = useState("7");
  const [boostType, setBoostType] = useState("sponsored_job");
  const [dailyBudget, setDailyBudget] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [view, setView] = useState<DialogView>("form");

  const totalBudget = dailyBudget
    ? parseFloat(dailyBudget) * parseInt(duration, 10)
    : 0;

  useEffect(() => {
    if (open) {
      setLoadingWallet(true);
      setDailyBudget("");
      setDuration("7");
      setBoostType("sponsored_job");
      setView("form");
      api
        .get("/employer/wallet")
        .then((res) => {
          const d = res.data;
          const raw = d?.wallet?.balance ?? d?.data?.balance ?? d?.balance ?? 0;
          setWalletBalance(Number(raw) || 0);
        })
        .catch(() => setWalletBalance(0))
        .finally(() => setLoadingWallet(false));
    }
  }, [open]);

  const boostTypes = [
    { value: "sponsored_job", label: isBn ? "স্পনসরড চাকরি" : "Sponsored Job", description: isBn ? "সার্চে শীর্ষে প্রদর্শন" : "Top placement in search results", icon: Star },
    { value: "awareness_ad", label: isBn ? "ব্র্যান্ড অ্যাওয়্যারনেস" : "Brand Awareness", description: isBn ? "বিজ্ঞাপন ব্যানার প্লেসমেন্ট" : "Ad banner across the platform", icon: Megaphone },
  ];

  const getBoostLabel = () => boostTypes.find((bt) => bt.value === boostType)?.label || "Promotion";

  const handleSubmit = async () => {
    if (!dailyBudget || parseFloat(dailyBudget) <= 0) {
      toast.error(isBn ? "দৈনিক বাজেট দিন" : "Please enter a daily budget");
      return;
    }

    if (walletBalance !== null && totalBudget > walletBalance) {
      toast.error(isBn ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient wallet balance");
      return;
    }

    setSubmitting(true);
    const now = new Date();
    const endDate = new Date(now);
    endDate.setDate(endDate.getDate() + parseInt(duration, 10));
    const title = `${jobTitle} - ${getBoostLabel()}`;

    try {
      await api.post("/employer/promotions", {
        title,
        job_id: jobId,
        type: boostType,
        daily_budget: parseFloat(dailyBudget),
        total_budget: totalBudget,
        start_date: now.toISOString().split("T")[0],
        end_date: endDate.toISOString().split("T")[0],
      });
      toast.success(isBn ? "চাকরি বুস্ট সফল!" : "Job boosted successfully!");
      setView("success");
      onComplete?.();
    } catch (err: any) {
      const msg = err?.response?.data?.message || (isBn ? "বুস্ট করতে ব্যর্থ" : "Failed to boost job");
      const reason = err?.response?.data?.reason;
      toast.error(reason ? (isBn ? `${msg} ${reason}` : `${msg} ${reason}`) : msg, { duration: 6000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {/* ─── SUCCESS VIEW ─── */}
        {view === "success" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isBn ? "বুস্ট সম্পন্ন!" : "Boost Activated!"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Success Icon */}
              <div className="flex flex-col items-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-center">
                  {isBn ? "সফলভাবে বুস্ট হয়েছে!" : "Successfully Boosted!"}
                </h3>
                <p className="text-sm text-muted-foreground text-center mt-1 max-w-xs">
                  {isBn
                    ? `"${jobTitle}" চাকরিটি এখন প্রচারণাধীন। আপনি পারফরম্যান্স ট্র্যাক করতে পারবেন।`
                    : `"${jobTitle}" is now promoted. Track its performance from the dashboard.`}
                </p>
              </div>

              {/* Summary */}
              <div className="p-3 rounded-lg bg-muted/50 border space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? "ধরন" : "Type"}</span>
                  <Badge variant="outline">{getBoostLabel()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{isBn ? "সময়কাল" : "Duration"}</span>
                  <span>{duration} {isBn ? "দিন" : "days"}</span>
                </div>
                <div className="flex justify-between font-semibold border-t pt-2">
                  <span>{isBn ? "মোট খরচ" : "Total Spent"}</span>
                  <span>{formatCurrency(totalBudget)}</span>
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-2">
                <Link
                  href="/employer/promotions"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                  onClick={() => onOpenChange(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{isBn ? "প্রচারণা ড্যাশবোর্ড" : "Ads Dashboard"}</p>
                      <p className="text-xs text-muted-foreground">{isBn ? "বিজ্ঞাপন ট্র্যাক ও পরিচালনা করুন" : "Track and manage all promotions"}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
                <Link
                  href="/employer/manage-jobs"
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors group"
                  onClick={() => onOpenChange(false)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Megaphone className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{isBn ? "চাকরি ব্যবস্থাপনা" : "Manage Jobs"}</p>
                      <p className="text-xs text-muted-foreground">{isBn ? "আপনার সব চাকরি দেখুন" : "View all your job posts"}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              </div>
            </div>
          </>
        )}

        {/* ─── CONFIRM VIEW ─── */}
        {view === "confirm" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isBn ? "বুস্ট নিশ্চিত করুন" : "Confirm Boost"}
              </DialogTitle>
              <DialogDescription>{jobTitle}</DialogDescription>
            </DialogHeader>
            <div className="space-y-3 p-3 rounded-lg border">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isBn ? "চাকরি" : "Job"}</span><span className="font-medium truncate max-w-[200px]">{jobTitle}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isBn ? "ধরন" : "Type"}</span><Badge variant="outline">{getBoostLabel()}</Badge></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isBn ? "সময়কাল" : "Duration"}</span><span>{duration} {isBn ? "দিন" : "days"}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">{isBn ? "দৈনিক বাজেট" : "Daily"}</span><span>{formatCurrency(parseFloat(dailyBudget || "0"))}</span></div>
              <div className="flex justify-between font-semibold border-t pt-2 text-sm"><span>{isBn ? "মোট" : "Total"}</span><span>{formatCurrency(totalBudget)}</span></div>
            </div>
          </>
        )}

        {/* ─── FORM VIEW ─── */}
        {view === "form" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                {isBn ? "চাকরি বুস্ট করুন" : "Boost Job"}
              </DialogTitle>
              <DialogDescription className="line-clamp-1">{jobTitle}</DialogDescription>
            </DialogHeader>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
              <div className="flex items-center gap-2 text-sm">
                <Wallet className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}</span>
              </div>
              <span className="font-semibold">
                {loadingWallet ? <Loader2 className="h-4 w-4 animate-spin" /> : walletBalance !== null ? formatCurrency(walletBalance) : "--"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>{isBn ? "সময়কাল" : "Duration"}</Label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">{isBn ? "৭ দিন" : "7 Days"}</SelectItem>
                    <SelectItem value="14">{isBn ? "১৪ দিন" : "14 Days"}</SelectItem>
                    <SelectItem value="30">{isBn ? "৩০ দিন" : "30 Days"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{isBn ? "প্রচারণার ধরন" : "Promotion Type"}</Label>
                <div className="grid grid-cols-1 gap-2">
                  {boostTypes.map((bt) => (
                    <button key={bt.value} type="button" onClick={() => setBoostType(bt.value)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${boostType === bt.value ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                      <bt.icon className={`h-5 w-5 shrink-0 ${boostType === bt.value ? "text-primary" : "text-muted-foreground"}`} />
                      <div><p className="text-sm font-medium">{bt.label}</p><p className="text-xs text-muted-foreground">{bt.description}</p></div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isBn ? "দৈনিক বাজেট" : "Daily Budget (BDT)"}</Label>
                <Input type="number" min="0" step="10" placeholder="0" value={dailyBudget} onChange={(e) => setDailyBudget(e.target.value)} />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <span className="text-sm text-muted-foreground">{isBn ? "মোট খরচ" : "Total Cost"}</span>
                <span className="font-semibold text-lg">{formatCurrency(totalBudget)}</span>
              </div>

              {walletBalance !== null && totalBudget > 0 && totalBudget > walletBalance && (
                <p className="text-sm text-destructive">{isBn ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient balance."}</p>
              )}
            </div>
          </>
        )}

        {/* ─── FOOTERS ─── */}
        <DialogFooter>
          {view === "success" && (
            <div className="w-full flex gap-3">
              <Link href="/employer/promotions" onClick={() => onOpenChange(false)} className="flex-1">
                <Button className="w-full gap-2"><BarChart3 className="h-4 w-4" />{isBn ? "ড্যাশবোর্ড" : "Dashboard"}</Button>
              </Link>
              <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">{isBn ? "বন্ধ করুন" : "Close"}</Button>
            </div>
          )}

          {view === "confirm" && (
            <>
              <Button variant="outline" onClick={() => setView("form")} disabled={submitting}>{isBn ? "ফিরুন" : "Back"}</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isBn ? "নিশ্চিত করুন" : "Confirm & Pay"}
              </Button>
            </>
          )}

          {view === "form" && (
            <Button onClick={() => { if (!dailyBudget || parseFloat(dailyBudget) <= 0) { toast.error(isBn ? "দৈনিক বাজেট দিন" : "Please enter a daily budget"); return; } if (walletBalance !== null && totalBudget > walletBalance) { toast.error(isBn ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient wallet balance"); return; } setView("confirm"); }}
              disabled={!dailyBudget || parseFloat(dailyBudget) <= 0}>
              {isBn ? "পরবর্তী" : "Next"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}