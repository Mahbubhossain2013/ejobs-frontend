"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import {
  Trophy, Medal, Crown, Star, Briefcase, TrendingUp, CheckCircle,
  Users, Building2, ChevronLeft, ChevronRight,
} from "lucide-react";
import { getInitials, formatCurrency } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number | null;
  user_id: number;
  name: string;
  username?: string;
  slug?: string;
  avatar?: string | null;
  logo?: string | null;
  trust_score?: number;
  rating?: number;
  completed_jobs_count?: number;
  total_earnings?: number;
  total_spend?: number;
  active_jobs_count?: number;
  jobs_count?: number;
  total_applicants?: number;
}

interface Pagination {
  total: number;
  per_page: number;
  current_page: number;
  last_page: number;
}

const CATEGORIES = [
  { key: "trust", labelEn: "Trust Score", labelBn: "বিশ্বস্ততা", icon: Star },
  { key: "completions", labelEn: "Completions", labelBn: "সম্পন্ন", icon: CheckCircle },
  { key: "earnings", labelEn: "Earnings", labelBn: "আয়", icon: TrendingUp },
];

const COMPANY_CATEGORIES = [
  { key: "trust", labelEn: "Trust Score", labelBn: "বিশ্বস্ততা", icon: Star },
  { key: "completions", labelEn: "Active Jobs", labelBn: "সক্রিয় চাকরি", icon: Briefcase },
  { key: "applicants", labelEn: "Total Applicants", labelBn: "মোট আবেদনকারী", icon: Users },
  { key: "earnings", labelEn: "Total Spend", labelBn: "মোট খরচ", icon: TrendingUp },
];

const PER_PAGE = 100;

function getMetricDisplay(entry: LeaderboardEntry, key: string, isBn: boolean, isCompany: boolean) {
  switch (key) {
    case "trust":
      return { label: isBn ? "বিশ্বস্ততা স্কোর" : "Trust Score", value: String(entry.trust_score ?? 0), suffix: isBn ? "পয়েন্ট" : "points" };
    case "completions":
      if (isCompany) return { label: isBn ? "সক্রিয় চাকরি" : "Active Jobs", value: String(entry.active_jobs_count ?? entry.jobs_count ?? 0), suffix: isBn ? "টি চাকরি" : "jobs posted" };
      return { label: isBn ? "সম্পন্ন কাজ" : "Completed Jobs", value: String(entry.completed_jobs_count ?? 0), suffix: isBn ? "টি সম্পন্ন" : "completed" };
    case "applicants":
      return { label: isBn ? "মোট আবেদনকারী" : "Total Applicants", value: String(entry.total_applicants ?? 0), suffix: isBn ? "জন" : "applicants" };
    case "earnings":
      if (isCompany) return { label: isBn ? "মোট খরচ" : "Total Spend", value: formatCurrency(entry.total_spend ?? 0), suffix: "" };
      return { label: isBn ? "মোট আয়" : "Total Earnings", value: formatCurrency(entry.total_earnings ?? 0), suffix: "" };
    default:
      return { label: "", value: "0", suffix: "" };
  }
}

function PodiumCard({ entry, rank, isBn, metricKey, isCompany }: { entry: LeaderboardEntry; rank: 1 | 2 | 3; isBn: boolean; metricKey: string; isCompany: boolean }) {
  const styles = {
    1: { bg: "from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-950/40 dark:via-yellow-950/30 dark:to-amber-900/30", border: "border-amber-300 dark:border-amber-600/50", ring: "ring-amber-200 dark:ring-amber-700/40", shadow: "shadow-lg shadow-amber-200/40 dark:shadow-amber-900/20", medal: "text-amber-500", crown: true },
    2: { bg: "from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900/40 dark:via-gray-900/30 dark:to-slate-800/30", border: "border-slate-300 dark:border-slate-600/50", ring: "ring-slate-200 dark:ring-slate-700/40", shadow: "shadow-md shadow-slate-200/40 dark:shadow-slate-900/20", medal: "text-slate-400 dark:text-slate-300", crown: false },
    3: { bg: "from-orange-50 via-amber-50 to-orange-100 dark:from-orange-950/40 dark:via-amber-950/30 dark:to-orange-900/30", border: "border-orange-300 dark:border-orange-600/50", ring: "ring-orange-200 dark:ring-orange-700/40", shadow: "shadow-md shadow-orange-200/40 dark:shadow-orange-900/20", medal: "text-orange-500", crown: false },
  };
  const s = styles[rank];
  const avatarSrc = entry.avatar || entry.logo;
  const linkHref = entry.username ? `/profile/${entry.username}` : entry.slug ? `/company/${entry.slug}` : "#";
  const { label, value, suffix } = getMetricDisplay(entry, metricKey, isBn, isCompany);

  return (
    <Link href={linkHref} className="group block">
      <Card className={`relative overflow-hidden bg-gradient-to-b ${s.bg} ${s.border} ${s.shadow} ring-1 ${s.ring} border-2 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${rank === 1 ? "md:scale-[1.03] z-10" : ""}`}>
        <CardContent className="p-6 text-center">
          <div className="flex justify-center mb-3">
            {s.crown ? <Crown className="h-8 w-8 text-amber-500 drop-shadow-sm" /> : <Medal className={`h-7 w-7 ${s.medal} fill-current opacity-80`} />}
          </div>
          <div className="relative mx-auto mb-3 w-fit">
            <DefaultAvatar src={avatarSrc} name={entry.name} className="h-16 w-16 ring-4 ring-background shadow-md mx-auto" fallback={<span className="text-base font-semibold bg-primary/10 text-primary">{getInitials(entry.name)}</span>} />
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-foreground flex items-center justify-center text-xs font-bold text-background shadow-sm">{rank}</div>
          </div>
          <h3 className="font-bold text-sm truncate group-hover:text-primary transition-colors">{entry.name}</h3>
          <div className="mt-2">
            <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-xl font-extrabold tabular-nums text-primary">{value}</p>
            {suffix && <p className="text-[10px] text-muted-foreground mt-0.5">{suffix}</p>}
          </div>
          {entry.rating != null && entry.rating > 0 && (
            <div className="flex items-center justify-center gap-0.5 mt-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-2.5 w-2.5 ${i <= Math.round(entry.rating!) ? "fill-amber-400 text-amber-400" : "fill-muted/40 text-muted-foreground/30"}`} />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">({entry.rating})</span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

function ListCard({ entry, rank, isBn, metricKey, isCompany }: { entry: LeaderboardEntry; rank: number; isBn: boolean; metricKey: string; isCompany: boolean }) {
  const avatarSrc = entry.avatar || entry.logo;
  const linkHref = entry.username ? `/profile/${entry.username}` : entry.slug ? `/company/${entry.slug}` : "#";
  const { label, value, suffix } = getMetricDisplay(entry, metricKey, isBn, isCompany);

  return (
    <Link href={linkHref} className="group block">
      <Card className="transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="w-8 text-center shrink-0">
            <span className={`text-sm font-bold tabular-nums ${rank <= 3 ? "text-primary" : "text-muted-foreground"}`}>{rank}</span>
          </div>
          <DefaultAvatar src={avatarSrc} name={entry.name} className="h-10 w-10 ring-2 ring-background shadow-sm shrink-0" fallback={<span className="text-xs font-semibold bg-primary/10 text-primary">{getInitials(entry.name)}</span>} />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{entry.name}</p>
            <p className="text-xs text-muted-foreground">@{entry.username || entry.slug}</p>
          </div>
          <div className="flex items-center gap-5 shrink-0">
            {entry.rating != null && entry.rating > 0 && (
              <div className="hidden sm:flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-3 w-3 ${i <= Math.round(entry.rating!) ? "fill-amber-400 text-amber-400" : "fill-muted/40 text-muted-foreground/30"}`} />
                ))}
                <span className="text-[10px] text-muted-foreground ml-0.5">{entry.rating}</span>
              </div>
            )}
            <div className="text-right min-w-[100px]">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
              <p className="font-bold text-sm tabular-nums text-foreground">{value}</p>
              {suffix && <p className="text-[10px] text-muted-foreground">{suffix}</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function LeaderboardClient() {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";

  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<"candidate" | "employer">("candidate");
  const [category, setCategory] = useState<string>("trust");
  const [page, setPage] = useState(1);

  const isCompany = type === "employer";
  const currentCategories = isCompany ? COMPANY_CATEGORIES : CATEGORIES;

  const fetchData = useCallback(async (t: string, cat: string, p: number) => {
    setLoading(true);
    try {
      const res = await api.get("/leaderboard", { params: { type: t, category: cat, page: p, per_page: PER_PAGE } });
      setEntries(res.data.data || []);
      setPagination(res.data.pagination || null);
    } catch {
      setEntries([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(type, category, page); }, [fetchData, type, category, page]);

  const handleTypeChange = (newType: "candidate" | "employer") => {
    if (newType === type) return;
    setType(newType);
    setCategory("trust");
    setPage(1);
  };

  const handleCategoryChange = (newCat: string) => {
    if (newCat === category) return;
    setCategory(newCat);
    setPage(1);
  };

  const top3 = entries.slice(0, 3);

  return (
    <PublicLayout>
      <div className="min-h-screen bg-surface-page">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-background border-b border-border/50">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center relative">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/40 dark:shadow-amber-900/30 mb-4">
              <Trophy className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight mb-1.5">{isBn ? "লিডারবোর্ড" : "Leaderboard"}</h1>
            <p className="text-muted-foreground text-sm max-w-md mx-auto">{isBn ? "শীর্ষ প্রতিভা এবং নিয়োগকর্তাদের র‌্যাঙ্কিং" : "Top-ranked talent and employers in the community"}</p>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-5xl">
          <div className="flex items-center justify-center mb-6">
            <div className="inline-flex items-center bg-muted rounded-lg p-1 gap-0">
              <button onClick={() => handleTypeChange("candidate")} className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${type === "candidate" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <Users className="h-4 w-4" />{isBn ? "প্রার্থী" : "Candidates"}
              </button>
              <button onClick={() => handleTypeChange("employer")} className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${type === "employer" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
                <Building2 className="h-4 w-4" />{isBn ? "কোম্পানি" : "Companies"}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
            {currentCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <button key={cat.key} onClick={() => handleCategoryChange(cat.key)} className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${category === cat.key ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                  <Icon className="h-3.5 w-3.5" />{isBn ? cat.labelBn : cat.labelEn}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (<Card key={i} className="overflow-hidden"><CardContent className="p-6"><Skeleton className="h-6 w-6 mx-auto mb-3 rounded" /><Skeleton className="h-16 w-16 rounded-full mx-auto mb-3" /><Skeleton className="h-4 w-24 mx-auto mb-2" /><Skeleton className="h-3 w-32 mx-auto" /></CardContent></Card>))}
              </div>
              {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4"><Trophy className="h-8 w-8 text-muted-foreground" /></div>
              <h3 className="text-lg font-semibold mb-1.5">{isBn ? "কোনো তথ্য নেই" : "No entries yet"}</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">{isBn ? "লিডারবোর্ডে এখনও কেউ জায়গা করে নিতে পারেনি" : "The leaderboard is empty. Be the first to earn a spot!"}</p>
            </div>
          ) : (
            <>
              {page === 1 && top3.length > 0 && (
                <div className="mb-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end max-w-3xl mx-auto">
                    {top3[1] && <div className="order-2 md:order-1"><PodiumCard entry={top3[1]} rank={2} isBn={isBn} metricKey={category} isCompany={isCompany} /></div>}
                    {top3[0] && <div className="order-1 md:order-2"><PodiumCard entry={top3[0]} rank={1} isBn={isBn} metricKey={category} isCompany={isCompany} /></div>}
                    {top3[2] && <div className="order-3 md:order-3"><PodiumCard entry={top3[2]} rank={3} isBn={isBn} metricKey={category} isCompany={isCompany} /></div>}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {entries.map((entry, idx) => {
                  const globalRank = (page - 1) * PER_PAGE + idx + 1;
                  if (page === 1 && idx < 3) return null;
                  return <ListCard key={entry.user_id} entry={entry} rank={globalRank} isBn={isBn} metricKey={category} isCompany={isCompany} />;
                })}
              </div>

              {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-center gap-1 mt-8">
                  <Button variant="outline" size="icon" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-9 w-9"><ChevronLeft className="h-4 w-4" /></Button>
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === pagination.last_page || Math.abs(p - page) <= 1)
                    .map((p, idx, arr) => {
                      const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                      return (
                        <React.Fragment key={p}>
                          {showEllipsis && <span className="px-1 text-muted-foreground text-sm">...</span>}
                          <Button variant={p === page ? "default" : "outline"} size="icon" onClick={() => setPage(p)} className="h-9 w-9 text-xs">{p}</Button>
                        </React.Fragment>
                      );
                    })}
                  <Button variant="outline" size="icon" disabled={page >= pagination.last_page} onClick={() => setPage((p) => p + 1)} className="h-9 w-9"><ChevronRight className="h-4 w-4" /></Button>
                </div>
              )}

              {pagination && (
                <p className="text-xs text-muted-foreground text-center mt-4">
                  {isBn
                    ? `মোট ${pagination.total} জনের মধ্যে ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, pagination.total)} দেখানো হচ্ছে`
                    : `Showing ${(page - 1) * PER_PAGE + 1}–${Math.min(page * PER_PAGE, pagination.total)} of ${pagination.total}`}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}