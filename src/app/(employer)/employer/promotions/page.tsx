"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Megaphone, Plus, Eye, MousePointerClick, Star, Wallet, Loader2,
  Pause, Play, BarChart3, TrendingUp, Users, DollarSign, Calendar,
  Target, Zap, Clock, ArrowRight, Sparkles, Trophy,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { Job } from "@/types";

interface Promotion {
  id: number;
  title: string;
  type: string;
  status: string;
  daily_budget: number;
  total_budget: number;
  spent_amount: number;
  impressions: number;
  clicks: number;
  start_date: string;
  end_date: string;
  job_id: number;
}

interface CampaignAnalytics {
  impressions: number;
  clicks: number;
  applications: number;
  ctr: number;
  cvr: number;
  cpa: number;
  remaining_budget: number;
}

/* ── Helpers ── */
function toMidnight(dateStr: string): number {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function getTimeRemaining(start: string, end: string) {
  const now = Date.now();
  const startMs = toMidnight(start);
  const endMs = toMidnight(end) + 86400000; // include the end day fully
  const total = Math.max(endMs - startMs, 1);
  const elapsed = Math.max(0, now - startMs);
  const remaining = Math.max(0, endMs - now);
  const percent = Math.min(100, Math.round((elapsed / total) * 100));

  // Calendar days remaining
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endDate = new Date(end);
  endDate.setHours(23, 59, 59, 999);
  const diffMs = endDate.getTime() - today.getTime();
  const days = Math.max(0, Math.ceil(diffMs / 86400000));

  const isActive = new Date().getTime() <= endMs;
  return { percent, days, isExpired: !isActive, isActive };
}

function getBoostLabel(type: string, isBn: boolean) {
  const map: Record<string, string> = { sponsored_job: isBn ? "স্পনসরড চাকরি" : "Sponsored Job", awareness_ad: isBn ? "ব্র্যান্ড অ্যাওয়্যারনেস" : "Brand Awareness" };
  return map[type] || type;
}

function getStatusColor(s: string) {
  if (s === "active") return "success";
  if (s === "paused") return "warning";
  if (s === "completed" || s === "expired") return "secondary";
  return "outline";
}

/* ── Stat Card ── */
function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string | number; sub?: string; color: string }) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-950/20`}><Icon className={`h-4 w-4 text-${color}-600 dark:text-${color}-400`} /></div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-xl font-bold">{value}</p>
          {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Main ── */
export default function PromotionsPage() {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState("all");

  // Refresh every 60s for live timers
  useEffect(() => { const iv = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(iv); }, []);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [boostType, setBoostType] = useState("sponsored_job");
  const [duration, setDuration] = useState("7");
  const [dailyBudget, setDailyBudget] = useState("");
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [loadingWallet, setLoadingWallet] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Analytics
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [analytics, setAnalytics] = useState<CampaignAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsPromo, setAnalyticsPromo] = useState<Promotion | null>(null);

  const totalBudget = dailyBudget ? parseFloat(dailyBudget) * parseInt(duration, 10) : 0;

  const fetchPromotions = useCallback(() => {
    setLoading(true);
    api.get("/employer/promotions")
      .then((res) => setPromotions(res.data.data?.data || res.data.data || []))
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPromotions(); }, [fetchPromotions]);

  useEffect(() => {
    if (createOpen) {
      setLoadingJobs(true); setLoadingWallet(true);
      api.get("/employer/jobs").then((res) => { const data = res.data.data?.data || res.data.data || []; setJobs(Array.isArray(data) ? data : []); }).catch(() => setJobs([])).finally(() => setLoadingJobs(false));
      api.get("/employer/wallet").then((res) => { const raw = res.data; setWalletBalance(Number(raw?.wallet?.balance ?? raw?.data?.balance ?? raw?.balance ?? 0)); }).catch(() => setWalletBalance(0)).finally(() => setLoadingWallet(false));
    }
  }, [createOpen]);

  const resetCreateForm = () => { setSelectedJobId(""); setBoostType("sponsored_job"); setDuration("7"); setDailyBudget(""); };

  const handleCreate = async () => {
    if (!selectedJobId) { toast.error(isBn ? "চাকরি নির্বাচন করুন" : "Select a job"); return; }
    if (!dailyBudget || parseFloat(dailyBudget) <= 0) { toast.error(isBn ? "দৈনিক বাজেট দিন" : "Enter daily budget"); return; }
    if (walletBalance !== null && totalBudget > walletBalance) { toast.error(isBn ? "অপর্যাপ্ত ব্যালেন্স" : "Insufficient balance"); return; }
    setSubmitting(true);
    const now = new Date(); const endDate = new Date(now); endDate.setDate(endDate.getDate() + parseInt(duration, 10));
    const job = jobs.find((j) => String(j.id) === selectedJobId);
    try {
      await api.post("/employer/promotions", {
        title: `${job?.title || "Job"} - ${getBoostLabel(boostType, isBn)}`, job_id: parseInt(selectedJobId, 10), type: boostType,
        daily_budget: parseFloat(dailyBudget), total_budget: totalBudget, start_date: now.toISOString().split("T")[0], end_date: endDate.toISOString().split("T")[0],
      });
      toast.success(isBn ? "প্রচারণা তৈরি!" : "Promotion created!"); setCreateOpen(false); resetCreateForm(); fetchPromotions();
    } catch { toast.error(isBn ? "ব্যর্থ" : "Failed"); } finally { setSubmitting(false); }
  };

  const handleToggle = async (p: Promotion) => {
    try {
      await api.patch(`/employer/promotions/${p.id}/toggle`);
      toast.success(isBn ? `প্রচারণা ${p.status === "active" ? "বিরতি" : "সক্রিয়"}` : `Campaign ${p.status === "active" ? "paused" : "activated"}`);
      fetchPromotions();
    } catch { toast.error(isBn ? "ব্যর্থ" : "Failed"); }
  };

  const handleViewAnalytics = async (p: Promotion) => {
    setAnalyticsPromo(p); setAnalyticsOpen(true); setAnalyticsLoading(true);
    try { const res = await api.get(`/employer/promotions/${p.id}/analytics`); setAnalytics(res.data.data?.metrics || res.data.metrics || null); } catch { setAnalytics(null); } finally { setAnalyticsLoading(false); }
  };

  // Filter promotions
  const filtered = promotions.filter((p) => filter === "all" || p.status === filter);

  // Aggregate stats
  const totalSpent = promotions.reduce((s, p) => s + (p.spent_amount || 0), 0);
  const totalBudgetSum = promotions.reduce((s, p) => s + (p.total_budget || 0), 0);
  const totalImpressions = promotions.reduce((s, p) => s + (p.impressions || 0), 0);
  const totalClicks = promotions.reduce((s, p) => s + (p.clicks || 0), 0);
  const activeCount = promotions.filter((p) => p.status === "active").length;

  const boostTypes = [
    { value: "sponsored_job", label: isBn ? "স্পনসরড চাকরি" : "Sponsored Job", description: isBn ? "সার্চে শীর্ষে" : "Top search placement", icon: Star },
    { value: "awareness_ad", label: isBn ? "ব্র্যান্ড অ্যাওয়্যারনেস" : "Brand Awareness", description: isBn ? "বিজ্ঞাপন ব্যানার" : "Ad banner placement", icon: Megaphone },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "প্রচারণা" : "Promotions"}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{isBn ? "আপনার বিজ্ঞাপন প্রচারণা পরিচালনা করুন" : "Manage your ad campaigns and track performance"}</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />{isBn ? "নতুন প্রচারণা" : "New Promotion"}</Button>
      </div>

      {/* Summary Stats */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <StatCard icon={Megaphone} label={isBn ? "মোট" : "Total"} value={promotions.length} sub={`${activeCount} ${isBn ? "সক্রিয়" : "active"}`} color="blue" />
          <StatCard icon={DollarSign} label={isBn ? "ব্যয়" : "Spent"} value={formatCurrency(totalSpent)} sub={`${formatCurrency(totalBudgetSum)} ${isBn ? "বাজেট" : "budget"}`} color="amber" />
          <StatCard icon={Eye} label={isBn ? "ইম্প্রেশন" : "Impressions"} value={totalImpressions.toLocaleString()} color="purple" />
          <StatCard icon={MousePointerClick} label={isBn ? "ক্লিক" : "Clicks"} value={totalClicks.toLocaleString()} color="blue" />
          <StatCard icon={TrendingUp} label={isBn ? "সিটিআর" : "CTR"} value={totalImpressions > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(1)}%` : "0%"} color="green" />
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {["all", "active", "paused", "completed"].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter === f ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
            {f === "all" ? (isBn ? "সব" : "All") : f === "active" ? (isBn ? "সক্রিয়" : "Active") : f === "paused" ? (isBn ? "বিরতি" : "Paused") : (isBn ? "সম্পন্ন" : "Completed")}
          </button>
        ))}
      </div>

      {/* Promotion Cards */}
      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-8 text-center">
          <Megaphone className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
          <h3 className="font-semibold mb-2">{isBn ? "কোনো প্রচারণা নেই" : "No promotions"}</h3>
          <p className="text-sm text-muted-foreground mb-4">{isBn ? "আপনার চাকরি পোস্ট প্রচার করুন" : "Promote your job posts to reach more candidates"}</p>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-2" />{isBn ? "প্রথম প্রচারণা তৈরি করুন" : "Create First Promotion"}</Button>
        </CardContent></Card>
      ) : (
        <div className="space-y-4">
          {filtered.map((p) => {
            const tr = getTimeRemaining(p.start_date, p.end_date);
            const isExpired = tr.isExpired;
            const isPaused = p.status === "paused";
            const progressColor = isExpired || isPaused ? "bg-muted" : tr.days <= 3 ? "bg-amber-500" : "bg-primary";

            return (
              <Card key={p.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg ${p.status === "active" ? "bg-green-50 dark:bg-green-950/30" : "bg-muted"}`}>
                        {p.status === "active" ? <Zap className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-sm truncate">{p.title || getBoostLabel(p.type, isBn)}</h3>
                          <Badge variant={getStatusColor(p.status)} className="text-[10px] shrink-0">{p.status}</Badge>
                          <Badge variant="outline" className="text-[10px] shrink-0">{getBoostLabel(p.type, isBn)}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(p.start_date)} → {formatDate(p.end_date)}
                          {p.status === "active" && !isExpired && (
                            <span className="ml-2 text-amber-600 font-medium">
                              {tr.days > 0 ? `${tr.days} ${isBn ? "দিন বাকি" : "days left"}` : (isBn ? "আজ শেষ" : "Ends today")}
                            </span>
                          )}
                          {(isExpired || isPaused) && p.status === "active" && <span className="ml-2 text-red-500 font-medium">{isBn ? "মেয়াদোত্তীর্ণ" : "Expired"}</span>}
                          {isPaused && <span className="ml-2 text-muted-foreground font-medium">{isBn ? "বিরতি" : "Paused"}</span>}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewAnalytics(p)} title={isBn ? "বিশ্লেষণ" : "Analytics"}>
                        <BarChart3 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggle(p)}
                        title={p.status === "active" ? (isBn ? "বিরতি" : "Pause") : (isBn ? "সক্রিয়" : "Resume")}>
                        {p.status === "active" ? <Pause className="h-4 w-4 text-amber-500" /> : <Play className="h-4 w-4 text-green-500" />}
                      </Button>
                    </div>
                  </div>

                  {/* Time Progress Bar */}
                  {p.status === "active" && !isExpired && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                        <span className="flex items-center gap-1"><Clock className="h-2.5 w-2.5" />{isBn ? "সময়কাল" : "Duration"}</span>
                        <span>{isBn ? "ব্যয় হয়েছে" : "Elapsed"}</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-500 ${progressColor}`} style={{ width: `${tr.percent}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-[10px] mt-0.5">
                        <span className="text-muted-foreground">{Math.round(tr.percent)}%</span>
                        <span className={tr.days <= 3 ? "text-amber-500" : "text-green-500"}>
                          {isBn ? `${tr.days} দিন বাকি` : `${tr.days}d remaining`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Metrics Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-3 pt-3 border-t">
                    <div className="text-center">
                      <p className="text-lg font-bold">{formatCurrency(p.daily_budget)}</p>
                      <p className="text-[10px] text-muted-foreground">{isBn ? "দৈনিক" : "Daily"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{formatCurrency(p.total_budget)}</p>
                      <p className="text-[10px] text-muted-foreground">{isBn ? "মোট বাজেট" : "Total Budget"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{formatCurrency(p.spent_amount)}</p>
                      <p className="text-[10px] text-muted-foreground">{isBn ? "ব্যয়" : "Spent"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{p.impressions?.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{isBn ? "ইম্প্রেশন" : "Views"}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold">{p.clicks?.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">{isBn ? "ক্লিক" : "Clicks"}</p>
                    </div>
                  </div>

                  {/* Budget Spend Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                      <span>{isBn ? "বাজেট ব্যবহার" : "Budget Usage"}</span>
                      <span>{formatCurrency(p.spent_amount)} / {formatCurrency(p.total_budget)}</span>
                    </div>
                    <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${p.total_budget > 0 ? Math.min((p.spent_amount / p.total_budget) * 100, 100) : 0}%` }} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* ─── Create Dialog ─── */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" />{isBn ? "নতুন প্রচারণা" : "New Promotion"}</DialogTitle>
            <DialogDescription>{isBn ? "আপনার চাকরি পোস্ট প্রচার করুন" : "Promote your job post to reach more candidates"}</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 text-sm"><Wallet className="h-4 w-4 text-muted-foreground" /><span className="text-muted-foreground">{isBn ? "ওয়ালেট ব্যালেন্স" : "Wallet Balance"}</span></div>
            <span className="font-semibold">{loadingWallet ? <Loader2 className="h-4 w-4 animate-spin" /> : walletBalance !== null ? formatCurrency(walletBalance) : "--"}</span>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isBn ? "চাকরি নির্বাচন" : "Select Job"}</Label>
              {loadingJobs ? <Skeleton className="h-9 w-full" /> : (
                <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                  <SelectTrigger><SelectValue placeholder={isBn ? "চাকরি বাছাই করুন" : "Choose a job"} /></SelectTrigger>
                  <SelectContent>
                    {jobs.length === 0 ? <SelectItem value="none" disabled>{isBn ? "কোনো চাকরি নেই" : "No jobs"}</SelectItem> : jobs.filter((j) => j.status === "active").map((job) => <SelectItem key={job.id} value={String(job.id)}>{job.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2">
              <Label>{isBn ? "প্রচারণার ধরন" : "Type"}</Label>
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
              <Label>{isBn ? "দৈনিক বাজেট (BDT)" : "Daily Budget (BDT)"}</Label>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }} disabled={submitting}>{isBn ? "বাতিল" : "Cancel"}</Button>
            <Button onClick={handleCreate} disabled={submitting || !selectedJobId || !dailyBudget || parseFloat(dailyBudget) <= 0}>
              {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{isBn ? "তৈরি করুন" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Analytics Dialog ─── */}
      <Dialog open={analyticsOpen} onOpenChange={setAnalyticsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary" />{isBn ? "প্রচারণার বিশ্লেষণ" : "Campaign Analytics"}</DialogTitle>
            <DialogDescription>{analyticsPromo?.title}</DialogDescription>
          </DialogHeader>
          {analyticsLoading ? (
            <div className="grid grid-cols-2 gap-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
          ) : analytics ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: Eye, label: isBn ? "ইম্প্রেশন" : "Impressions", value: analytics.impressions },
                  { icon: MousePointerClick, label: isBn ? "ক্লিক" : "Clicks", value: analytics.clicks },
                  { icon: Users, label: isBn ? "আবেদন" : "Applications", value: analytics.applications },
                  { icon: TrendingUp, label: "CTR", value: `${analytics.ctr}%` },
                  { icon: Target, label: "CVR", value: `${analytics.cvr}%` },
                  { icon: DollarSign, label: "CPA", value: formatCurrency(analytics.cpa) },
                ].map((item, i) => (
                  <Card key={i}><CardContent className="p-3 text-center">
                    <item.icon className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
                    <p className="text-xl font-bold">{item.value}</p>
                    <p className="text-[10px] text-muted-foreground">{item.label}</p>
                  </CardContent></Card>
                ))}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
                <span className="text-sm text-muted-foreground">{isBn ? "বাকি বাজেট" : "Remaining Budget"}</span>
                <span className="font-semibold text-green-600">{formatCurrency(analytics.remaining_budget)}</span>
              </div>
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">{isBn ? "তথ্য নেই" : "No data"}</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}