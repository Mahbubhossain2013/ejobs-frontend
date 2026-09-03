"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import BoostJobDialog from "@/components/jobs/BoostJobDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus, Briefcase, Zap, Search, Edit, Pause, Play, Trash2,
  Users, TrendingUp, Clock, XCircle, Loader2, Copy, CheckCircle,
} from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";

interface PromotionInfo {
  id: number;
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

/** Extract job type from various possible API response shapes */
function getJobType(job: any): string {
  const raw = job.job_type || job.employment_type || job.type || "";
  if (!raw) return "";
  return raw.replace(/_/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
}

function toMidnight(dateStr: string): number {
  const d = new Date(dateStr);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export default function ManageJobsPage() {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

  useEffect(() => {
    document.title = isBn ? `চাকরি পরিচালনা | ${siteName}` : `Manage Jobs | ${siteName}`;
  }, [isBn, siteName]);

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [boostJobId, setBoostJobId] = useState<number | null>(null);
  const [boostJobTitle, setBoostJobTitle] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; jobId: number | null; jobTitle: string }>({
    open: false, jobId: null, jobTitle: "",
  });
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [now, setNow] = useState(Date.now());

  const [promoMap, setPromoMap] = useState<Map<number, PromotionInfo>>(new Map());
  const [hasBoostAccess, setHasBoostAccess] = useState(false);

  useEffect(() => { const iv = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(iv); }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter && statusFilter !== "all") params.append("status", statusFilter);

      const [jobsRes, promosRes, subRes] = await Promise.all([
        api.get(`/employer/jobs${params.toString() ? `?${params}` : ""}`),
        api.get("/employer/promotions").catch(() => ({ data: { data: [] } })),
        api.get("/subscriptions/my-subscription").catch(() => ({ data: {} })),
      ]);

      // Check if subscription includes job_boosts feature
      const subData = subRes.data;
      const subscription = subData?.subscription || subData?.active_subscription;
      const quotas = subData?.quotas || {};
      const boostQuota = quotas?.job_boosts;
      // Allow boost if subscription exists with boost quota, or if plan has unlimited (-1)
      setHasBoostAccess(
        !!subscription && (
          (boostQuota && boostQuota.max_limit > 0) ||
          (boostQuota && boostQuota.max_limit === -1) ||
          (subscription.plan?.features_mapped?.job_boosts ?? false) === true ||
          (subscription.plan_name && !["Free", "free", "ফ্রি"].includes(subscription.plan_name))
        )
      );

      const data = jobsRes.data.data;
      const list = Array.isArray(data) ? data : (data?.data || []);
      setJobs(list);

      const promoList: PromotionInfo[] = promosRes.data?.data?.data || promosRes.data?.data || [];
      const map = new Map<number, PromotionInfo>();
      for (const p of promoList) {
        if (!map.has(p.job_id) || (p.status === "active" && map.get(p.job_id)?.status !== "active")) {
          map.set(p.job_id, p);
        }
      }
      setPromoMap(map);
    } catch {
      toast.error(isBn ? "লোড করতে ব্যর্থ" : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [searchQuery, statusFilter]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const [searchDebounce, setSearchDebounce] = useState("");
  useEffect(() => { const t = setTimeout(() => setSearchQuery(searchDebounce), 400); return () => clearTimeout(t); }, [searchDebounce]);

  const handleToggleStatus = async (job: any) => {
    setTogglingId(job.id);
    try {
      await api.patch(`/employer/jobs/${job.id}/toggle`);
      toast.success(isBn ? `চাকরি ${job.is_active ? "নিষ্ক্রিয়" : "সক্রিয়"} করা হয়েছে` : `Job ${job.is_active ? "paused" : "resumed"}`);
      fetchAll();
    } catch {
      toast.error(isBn ? "সমস্যা হয়েছে" : "Failed");
    } finally { setTogglingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteDialog.jobId) return;
    setDeleting(true);
    try {
      await api.delete(`/employer/jobs/${deleteDialog.jobId}`);
      toast.success(isBn ? "মুছে ফেলা হয়েছে" : "Deleted");
      setDeleteDialog({ open: false, jobId: null, jobTitle: "" });
      fetchAll();
    } catch {
      toast.error(isBn ? "ব্যর্থ" : "Failed");
    } finally { setDeleting(false); }
  };

  const handleCopyLink = async (job: any) => {
    const url = `${window.location.origin}/jobs/${job.id}`;
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(url);
      else { const ta = document.createElement("textarea"); ta.value = url; ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); document.body.removeChild(ta); }
      toast.success(isBn ? "লিংক কপি" : "Link copied");
    } catch { toast.error(isBn ? "কপি ব্যর্থ" : "Copy failed"); }
  };

  const getStatusBadge = (job: any) => {
    const status = job.status || (job.is_active ? "active" : "inactive");
    const variants: Record<string, string> = { active: "success", inactive: "warning", paused: "warning", closed: "destructive", draft: "secondary" };
    const labels: Record<string, { en: string; bn: string }> = {
      active: { en: "Active", bn: "সক্রিয়" }, inactive: { en: "Paused", bn: "বিরতি" }, paused: { en: "Paused", bn: "বিরতি" },
      closed: { en: "Closed", bn: "বন্ধ" }, draft: { en: "Draft", bn: "খসড়া" },
    };
    const label = labels[status] || { en: status, bn: status };
    return <Badge variant={(variants[status] as any) || "outline"} className="capitalize">{isBn ? label.bn : label.en}</Badge>;
  };

  const getBoostInfo = (jobId: number): PromotionInfo | null => promoMap.get(jobId) || null;

  const getBoostTimeRemaining = (promo: PromotionInfo) => {
    const endMs = toMidnight(promo.end_date) + 86400000; // include end day fully
    const now2 = new Date();
    now2.setHours(0, 0, 0, 0);

    const isActive = promo.status === "active";
    if (!isActive || now2.getTime() > endMs) return { days: 0, percent: 100, label: promo.status, color: "text-muted-foreground" };

    const endDate = new Date(promo.end_date);
    endDate.setHours(23, 59, 59, 999);
    const diffMs = endDate.getTime() - Date.now();
    const days = Math.max(0, Math.ceil(diffMs / 86400000));

    const startMs = toMidnight(promo.start_date);
    const total = Math.max(endMs - startMs, 1);
    const elapsed = Math.max(0, Date.now() - startMs);
    const percent = Math.min(100, Math.round((elapsed / total) * 100));

    if (days <= 1) return { days, percent, label: `${days}d left`, color: "text-red-500" };
    if (days <= 3) return { days, percent, label: `${days}d left`, color: "text-amber-500" };
    return { days, percent, label: `${days}d left`, color: "text-green-500" };
  };

  const boostTypeLabel = (type: string) => {
    const map: Record<string, string> = { sponsored_job: isBn ? "স্পনসরড" : "Sponsored", awareness_ad: isBn ? "ব্র্যান্ড" : "Awareness" };
    return map[type] || type;
  };

  const stats = {
    total: jobs.length,
    active: jobs.filter((j) => j.status === "active" || (j.is_active && j.status !== "paused" && j.status !== "closed")).length,
    paused: jobs.filter((j) => j.status === "paused" || j.status === "inactive").length,
    closed: jobs.filter((j) => j.status === "closed").length,
    boosted: jobs.filter((j) => promoMap.has(j.id)).length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "চাকরি পরিচালনা" : "Manage Jobs"}</h1>
          <p className="text-muted-foreground mt-1">{isBn ? "আপনার সব চাকরি পোস্ট দেখুন ও পরিচালনা করুন" : "View and manage all your job postings"}</p>
        </div>
        <Button asChild><Link href="/employer/post-job"><Plus className="h-4 w-4 mr-2" />{isBn ? "নতুন চাকরি পোস্ট" : "Post New Job"}</Link></Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">{[...Array(5)].map((_, i) => <Card key={i} className="p-4"><Skeleton className="h-5 w-20 mb-2" /><Skeleton className="h-7 w-12" /></Card>)}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: isBn ? "মোট" : "Total", value: stats.total, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950", icon: Briefcase },
            { label: isBn ? "সক্রিয়" : "Active", value: stats.active, color: "text-green-600", bg: "bg-green-50 dark:bg-green-950", icon: TrendingUp },
            { label: isBn ? "বিরতি" : "Paused", value: stats.paused, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-950", icon: Clock },
            { label: isBn ? "বন্ধ" : "Closed", value: stats.closed, color: "text-red-600", bg: "bg-red-50 dark:bg-red-950", icon: XCircle },
            { label: isBn ? "বুস্টেড" : "Boosted", value: stats.boosted, color: "text-purple-600", bg: "bg-purple-50 dark:bg-purple-950", icon: Zap },
          ].map((s) => (
            <Card key={s.label}><CardContent className="p-4"><div className="flex items-center gap-3"><div className={`p-2 rounded-lg ${s.bg}`}><s.icon className={`h-4 w-4 ${s.color}`} /></div><div><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-bold">{s.value}</p></div></div></CardContent></Card>
          ))}
        </div>
      )}

      <Card><CardContent className="p-4"><div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder={isBn ? "চাকরি খুঁজুন..." : "Search jobs..."} value={searchDebounce} onChange={(e) => setSearchDebounce(e.target.value)} className="pl-9" /></div>
        <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-full sm:w-[180px]"><SelectValue /></SelectTrigger><SelectContent>
          <SelectItem value="all">{isBn ? "সব" : "All"}</SelectItem><SelectItem value="active">{isBn ? "সক্রিয়" : "Active"}</SelectItem><SelectItem value="inactive">{isBn ? "বিরতি" : "Paused"}</SelectItem><SelectItem value="closed">{isBn ? "বন্ধ" : "Closed"}</SelectItem><SelectItem value="draft">{isBn ? "খসড়া" : "Draft"}</SelectItem>
        </SelectContent></Select>
      </div></CardContent></Card>

      {loading ? (
        <div className="space-y-3">{[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
      ) : !jobs.length ? (
        <div className="text-center py-16">
          <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{isBn ? "কোনো চাকরি পোস্ট নেই" : "No jobs found"}</h3>
          <Button asChild><Link href="/employer/post-job"><Plus className="h-4 w-4 mr-2" />{isBn ? "প্রথম চাকরি পোস্ট" : "Post First Job"}</Link></Button>
        </div>
      ) : (
        <Card><CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader><TableRow>
              <TableHead>{isBn ? "শিরোনাম" : "Title"}</TableHead>
              <TableHead className="hidden sm:table-cell">{isBn ? "ধরন" : "Type"}</TableHead>
              <TableHead className="text-center">{isBn ? "আবেদন" : "Apps"}</TableHead>
              <TableHead className="hidden md:table-cell">{isBn ? "বুস্ট" : "Boost"}</TableHead>
              <TableHead>{isBn ? "অবস্থা" : "Status"}</TableHead>
              <TableHead className="hidden md:table-cell">{isBn ? "তারিখ" : "Date"}</TableHead>
              <TableHead className="text-right">{isBn ? "কার্যক্রম" : "Actions"}</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {jobs.map((job: any) => {
                const promo = getBoostInfo(job.id);
                const boost = promo ? getBoostTimeRemaining(promo) : null;
                const typeLabel = getJobType(job);
                const boostLocked = !!(promo && (promo.status === "active" || promo.status === "pending_review"));
                return (
                  <TableRow key={job.id}>
                    <TableCell>
                      <div className="font-medium">{job.title}</div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {job.job_type && <span className="capitalize">{String(job.job_type).replace(/-/g, " ")}</span>}
                        {job.location && <span>{job.location}</span>}
                        {job.salary_min && <span>৳{Number(job.salary_min).toLocaleString()}{job.salary_max ? ` - ৳${Number(job.salary_max).toLocaleString()}` : "+"}</span>}
                        {job.deadline && <span>{isBn ? "শেষ" : "Due"}: {new Date(job.deadline).toLocaleDateString()}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">{typeLabel || "—"}</TableCell>
                    <TableCell className="text-center"><span className="text-sm text-muted-foreground">{job.applications_count || 0}</span></TableCell>
                    <TableCell className="hidden md:table-cell">
                      {promo && boost ? (
                        <div className="min-w-[160px]">
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="h-3 w-3 text-amber-500" />
                            <span className="text-xs font-medium">{boostTypeLabel(promo.type)}</span>
                            <Badge variant="outline" className={`text-[9px] px-1 py-0 ${promo.status === "active" ? "text-green-600 border-green-300" : "text-muted-foreground"}`}>{promo.status}</Badge>
                          </div>
                          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-amber-500 transition-all" style={{ width: `${boost.percent}%` }} />
                          </div>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className={`text-[10px] ${boost.color}`}>{boost.label}</span>
                            <span className="text-[10px] text-muted-foreground">{formatCurrency(promo.spent_amount)} / {formatCurrency(promo.total_budget)}</span>
                          </div>
                        </div>
                      ) : <span className="text-xs text-muted-foreground">—</span>}
                    </TableCell>
                    <TableCell>{getStatusBadge(job)}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">{job.created_at && formatDate(job.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {hasBoostAccess && (
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-950" onClick={() => { setBoostJobId(job.id); setBoostJobTitle(job.title); }} disabled={(job.status !== "active" && !job.is_active) || boostLocked} title={boostLocked ? (isBn ? "ইতিমধ্যে বুস্টেড" : "Already boosted") : isBn ? "বুস্ট" : "Boost"}>
                            {boostLocked ? <CheckCircle className="h-4 w-4" /> : <Zap className="h-4 w-4" />}
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950" onClick={() => handleCopyLink(job)} title="Copy Link"><Copy className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" asChild title="Edit"><Link href={`/employer/manage-jobs/${job.id}/edit`}><Edit className="h-4 w-4" /></Link></Button>
                        <Button variant="ghost" size="icon" className={`h-8 w-8 ${job.is_active || job.status === "active" ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-950" : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"}`} onClick={() => handleToggleStatus(job)} disabled={togglingId === job.id}>
                          {togglingId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : job.is_active || job.status === "active" ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950" onClick={() => setDeleteDialog({ open: true, jobId: job.id, jobTitle: job.title })}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent></Card>
      )}

      {boostJobId && <BoostJobDialog jobId={boostJobId} jobTitle={boostJobTitle} open={!!boostJobId} onOpenChange={(open) => { if (!open) { setBoostJobId(null); setBoostJobTitle(""); } }} onComplete={fetchAll} />}

      <Dialog open={deleteDialog.open} onOpenChange={(open) => { if (!open) setDeleteDialog({ open: false, jobId: null, jobTitle: "" }); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isBn ? "মুছে ফেলুন?" : "Delete?"}</DialogTitle>
            <DialogDescription>{isBn ? `"${deleteDialog.jobTitle}" মুছে ফেলবেন?` : `Delete "${deleteDialog.jobTitle}"?`}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, jobId: null, jobTitle: "" })}>{isBn ? "বাতিল" : "Cancel"}</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>{deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{isBn ? "মুছুন" : "Delete"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}