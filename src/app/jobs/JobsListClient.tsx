"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CompanyLogo } from "@/components/ui/default-avatar";
import { toast } from "sonner";
import {
  Search, Globe, Send, ChevronLeft, ChevronRight, Briefcase, MapPin,
  Users, Clock, Star, Building2, ChevronDown, ChevronUp, Zap, Target,
  Eye, Bookmark, BookmarkCheck, ShieldCheck, CheckCircle2, Award, CreditCard,
  MessageSquare, Banknote, Filter, Mail, Rocket, Flame, Sparkles, DollarSign, Megaphone,
  Loader2,
} from "lucide-react";
import { formatCurrency, truncate, stripHtml } from "@/lib/utils";
import { trackBehavior } from "@/hooks/use-behavior-tracker";
import { DIVISIONS_EN, DISTRICTS_EN, THANAS_EN } from "@/lib/bd-data";
import { useAuth } from "@/hooks/use-auth";
import { useSavedJobs } from "@/hooks/use-jobs";

const JOB_TYPES = [
  { value: "all", label: "All Types" },
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
];

const SALARY_RANGES = [
  { label: "All Salary", min: "", max: "" },
  { label: "৳ 0 - 15,000", min: "0", max: "15000" },
  { label: "৳ 15,000 - 30,000", min: "15000", max: "30000" },
  { label: "৳ 30,000 - 50,000", min: "30000", max: "50000" },
  { label: "৳ 50,000 - 80,000", min: "50000", max: "80000" },
  { label: "৳ 80,000+", min: "80000", max: "" },
];

const EXPERIENCE_LEVELS = ["All Levels", "Entry Level", "1 - 2 Years", "3 - 5 Years", "5+ Years"];

const HOW_IT_WORKS = [
  { icon: Search, text: "Company কাজ পোস্ট করে" },
  { icon: Users, text: "Company প্রয়োজনীয় তথ্য দেখায়" },
  { icon: Send, text: "Candidates Apply করে" },
  { icon: MessageSquare, text: "Company Candidate দেখে" },
  { icon: CheckCircle2, text: "Company কাজ রিভিউ করে" },
  { icon: CreditCard, text: "Payment Release হয়" },
  { icon: Star, text: "eJob reviews jobs" },
];

function getPromotionBadge(job: any, isBn: boolean) {
  const promo = job.promotion || (job.is_promoted ? { type: job.promotion_type || "sponsored_job", status: "active" } : null);
  if (!promo) return null;
  const typeMap: Record<string, { label: string; color: string; icon: any }> = {
    sponsored_job: { label: isBn ? "স্পনসরড" : "Sponsored", color: "bg-amber-500 text-white", icon: Sparkles },
    awareness_ad: { label: isBn ? "ব্র্যান্ড" : "Awareness", color: "bg-purple-500 text-white", icon: Megaphone },
    featured: { label: isBn ? "বৈশিষ্ট্যযুক্ত" : "Featured", color: "bg-blue-500 text-white", icon: Star },
  };
  const config = typeMap[promo.type] || typeMap.sponsored_job;
  return config;
}

export default function JobsListClient() {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: savedJobsData, refetch: refetchSavedJobs } = useSavedJobs();
  const savedJobIds = new Set((savedJobsData as any)?.map?.((j: any) => String(j.id)) ?? []);
  const [savingJobId, setSavingJobId] = useState<string | number | null>(null);

  const handleToggleSave = async (jobId: string | number) => {
    if (!isAuthenticated) { toast.error(isBn ? "আগে লগইন করুন" : "Please login first"); return; }
    setSavingJobId(jobId);
    try {
      const res = await api.post(`/candidate/toggle-save/${jobId}`);
      const saved = res.data?.data?.saved ?? res.data?.saved;
      toast.success(saved ? (isBn ? "চাকরি সেভ হয়েছে" : "Job saved") : (isBn ? "চাকরি আনসেভ হয়েছে" : "Job unsaved"));
      refetchSavedJobs();
    } catch { toast.error(isBn ? "সেভ করতে ব্যর্থ" : "Failed to save job"); }
    finally { setSavingJobId(null); }
  };

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const initialKeyword = searchParams.get("keyword") || "";
  const [searchQuery, setSearchQuery] = useState(initialKeyword);
  const [category, setCategory] = useState("all");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [selectedExperience, setSelectedExperience] = useState("All Levels");
  const [selectedSalary, setSelectedSalary] = useState(0);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterDivision, setFilterDivision] = useState(searchParams.get("division") || "");
  const [filterDistrict, setFilterDistrict] = useState(searchParams.get("district") || "");
  const [filterUpazila, setFilterUpazila] = useState(searchParams.get("upazila") || "");
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const lv = localStorage.getItem("jobs-left-open"); if (lv !== null) setLeftOpen(lv === "true");
    const rv = localStorage.getItem("jobs-right-open"); if (rv !== null) setRightOpen(rv === "true");
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) { localStorage.setItem("jobs-left-open", String(leftOpen)); localStorage.setItem("jobs-right-open", String(rightOpen)); }
  }, [leftOpen, rightOpen, hydrated]);

  const [now, setNow] = useState(Date.now());
  useEffect(() => { setNow(Date.now()); }, []);

  const [platformStats, setPlatformStats] = useState<any>(null);
  const [featuredCompanies, setFeaturedCompanies] = useState<any[]>([]);

  useEffect(() => {
    api.get("/categories").then((res) => { const cats = (res.data?.data || []).map((c: any) => ({ value: c.id.toString(), label: c.name_en || c.name, count: c.jobs_count || 0 })); setCategories(cats); }).catch(() => {});
    api.get("/jobs/stats").then((res) => setPlatformStats(res.data?.data)).catch(() => {});
    api.get("/companies/featured").then((res) => setFeaturedCompanies(res.data?.data || [])).catch(() => {});
  }, []);

  const fetchJobs = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(); params.append("page", String(page));
      if (searchQuery) params.append("search", searchQuery);
      if (category && category !== "all") params.append("category_id", category);
      if (selectedJobType !== "all") params.append("job_type", selectedJobType);
      if (selectedExperience && selectedExperience !== "All Levels") params.append("experience_level", selectedExperience.toLowerCase().replace(" level", "").replace(" levels", ""));
      if (budgetMin) params.append("salary_min", budgetMin);
      if (budgetMax) params.append("salary_max", budgetMax);
      if (selectedSalary && !budgetMin && !budgetMax) {
        if (selectedSalary === 10000) params.append("salary_max", "10000");
        else if (selectedSalary === 30000) { params.append("salary_min", "10000"); params.append("salary_max", "30000"); }
        else if (selectedSalary === 50000) { params.append("salary_min", "30000"); params.append("salary_max", "50000"); }
        else if (selectedSalary === 100000) { params.append("salary_min", "50000"); params.append("salary_max", "100000"); }
        else if (selectedSalary === 999999) params.append("salary_min", "100000");
      }
      if (sortBy && sortBy !== "recent") params.append("sort", sortBy);
      if (filterDivision) params.append("division", filterDivision);
      if (filterDistrict) params.append("district", filterDistrict);
      if (filterUpazila) params.append("upazila", filterUpazila);

      const res = await api.get(`/jobs?${params.toString()}`);
      const payload = res.data.data;
      if (Array.isArray(payload)) { setJobs(payload); setTotalPages(1); setTotalJobs(payload.length); }
      else if (payload?.data) { setJobs(payload.data); setTotalPages(payload.last_page || 1); setTotalJobs(payload.total || 0); }
      else { setJobs([]); setTotalPages(1); setTotalJobs(0); }
    } catch { toast.error(isBn ? "চাকরি লোড করতে ব্যর্থ" : "Failed to load jobs"); }
    finally { setLoading(false); }
  }, [searchQuery, category, selectedJobType, selectedExperience, selectedSalary, sortBy, budgetMin, budgetMax, filterDivision, filterDistrict, filterUpazila, isBn]);

  useEffect(() => { fetchJobs(currentPage); }, [currentPage, fetchJobs]);
  useEffect(() => { setCurrentPage(1); }, [selectedExperience, selectedSalary, sortBy, category, selectedJobType, filterDivision, filterDistrict, filterUpazila]);

  const handleSearch = () => { if (searchQuery.trim()) trackBehavior("search_history", { metaData: { query: searchQuery, category, jobType: selectedJobType } }); const url = new URL(window.location.href); if (searchQuery.trim()) url.searchParams.set("keyword", searchQuery.trim()); else url.searchParams.delete("keyword"); router.replace(url.pathname + url.search, { scroll: false }); setSortBy("recent"); setCurrentPage(1); };
  const handleSalarySelect = (idx: number) => { setSelectedSalary(idx); setBudgetMin(SALARY_RANGES[idx].min); setBudgetMax(SALARY_RANGES[idx].max); setCurrentPage(1); };

  const allCats = [{ value: "all", label: isBn ? "সব ক্যাটাগরি" : "All Categories", count: totalJobs }, ...categories];

  return (
    <PublicLayout>
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-1">{isBn ? "চাকরি খুঁজুন" : "Find Jobs"}</h1>
          <p className="text-muted-foreground text-sm mb-4">{isBn ? "আপনার পছন্দের চাকরি খুঁজে নিন" : "Discover your next career opportunity"}</p>
          <div className="bg-white dark:bg-card rounded-xl p-2 flex flex-col sm:flex-row gap-2 shadow-sm border max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={isBn ? "চাকরি, কীওয়ার্ড, কোম্পানি..." : "Job title, keyword, company..."} className="pl-10 h-10 border-0 bg-transparent" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            </div>
            <Select value={category} onValueChange={(val) => { setCategory(val); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-40 h-10 border-0 bg-muted/50"><SelectValue placeholder={isBn ? "ক্যাটাগরি" : "All Categories"} /></SelectTrigger>
              <SelectContent>{allCats.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
            <Button onClick={handleSearch} className="h-10 px-6 bg-primary hover:bg-primary/90"><Search className="h-4 w-4 mr-1" /> {isBn ? "খুঁজুন" : "Search"}</Button>
          </div>
        </div>
      </section>

      <div className="border-b bg-white dark:bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
            {(showAllCategories ? allCats : allCats.slice(0, 7)).map((c) => (
              <button key={c.value} onClick={() => { setCategory(c.value); setCurrentPage(1); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === c.value ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
                {c.label}{c.count != null && <span className="text-xs opacity-70">{c.count.toLocaleString()}</span>}
              </button>
            ))}
            {allCats.length > 7 && <button onClick={() => setShowAllCategories(!showAllCategories)} className="flex items-center gap-1 px-3 py-2 text-sm text-primary">{showAllCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}{showAllCategories ? "Less" : "More"}</button>}
          </div>
        </div>
      </div>

      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {[
              { icon: Briefcase, value: platformStats?.total_jobs != null ? `${platformStats.total_jobs.toLocaleString()}+` : "—", label: "Active Jobs" },
              { icon: Building2, value: platformStats?.total_companies != null ? `${platformStats.total_companies.toLocaleString()}+` : "—", label: "Verified Companies" },
              { icon: DollarSign, value: platformStats?.avg_salary ? `৳${Math.round(platformStats.avg_salary / 1000)}K+` : "—", label: "Avg. Monthly Salary" },
              { icon: Users, value: platformStats?.total_candidates != null ? `${platformStats.total_candidates.toLocaleString()}+` : "—", label: "Registered Candidates" },
              { icon: CheckCircle2, value: platformStats?.total_applications ? `${Math.round(platformStats.total_applications / (platformStats.total_jobs || 1))}+` : "—", label: "Avg. Applications/Job" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><s.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[var(--left)_1fr_var(--right)] lg:gap-6" style={{ '--left': leftOpen ? '220px' : '36px', '--right': rightOpen ? '280px' : '36px' } as React.CSSProperties}>
          <aside className="space-y-5 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button onClick={() => setLeftOpen(!leftOpen)} className="shrink-0 h-6 w-6 rounded hover:bg-muted flex items-center justify-center">{leftOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</button>
                {leftOpen && <><Filter className="h-4 w-4 text-primary" /><h3 className="font-semibold text-sm whitespace-nowrap">{isBn ? "ফিল্টার" : "Filter"}</h3></>}
              </div>
              {leftOpen && <button onClick={() => { setSelectedJobType("all"); setSelectedExperience("All Levels"); setSelectedSalary(0); setBudgetMin(""); setBudgetMax(""); setCategory("all"); setFilterDivision(""); setFilterDistrict(""); setFilterUpazila(""); setCurrentPage(1); }} className="shrink-0 text-xs text-primary hover:underline">{isBn ? "সব মুছুন" : "Clear All"}</button>}
            </div>
            {leftOpen && (<>
              <div><p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "চাকরির ধরন" : "Job Type"}</p><div className="space-y-1.5">{JOB_TYPES.map((t) => (<label key={t.value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"><input type="radio" name="jobType" checked={selectedJobType === t.value} onChange={() => { setSelectedJobType(t.value); setCurrentPage(1); }} className="accent-primary" />{t.label}</label>))}</div></div>
              <Separator />
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "অবস্থান" : "Location"}</p>
                <div className="space-y-2">
                  <Select value={filterDivision || "all"} onValueChange={(v) => { const val = v === "all" ? "" : v; setFilterDivision(val); setFilterDistrict(""); setFilterUpazila(""); }}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={isBn ? "বিভাগ" : "Division"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isBn ? "সব বিভাগ" : "All Divisions"}</SelectItem>
                      {Object.entries(DIVISIONS_EN).map(([key, name]) => (
                        <SelectItem key={key} value={key}>{name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterDistrict || "all"} disabled={!filterDivision} onValueChange={(v) => { const val = v === "all" ? "" : v; setFilterDistrict(val); setFilterUpazila(""); }}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={isBn ? "জেলা" : "District"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isBn ? "সব জেলা" : "All Districts"}</SelectItem>
                      {(DISTRICTS_EN[filterDivision] || []).map((d) => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterUpazila || "all"} disabled={!filterDistrict} onValueChange={(v) => { setFilterUpazila(v === "all" ? "" : v); }}>
                    <SelectTrigger className="h-9 text-sm"><SelectValue placeholder={isBn ? "উপজেলা" : "Upazila"} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isBn ? "সব উপজেলা" : "All Upazilas"}</SelectItem>
                      {(THANAS_EN[filterDistrict] || []).map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Separator />
              <div><p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "অভিজ্ঞতা" : "Experience"}</p><div className="space-y-1.5">{EXPERIENCE_LEVELS.map((l) => (<label key={l} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"><input type="radio" name="experience" checked={selectedExperience === l} onChange={() => setSelectedExperience(l)} className="accent-primary" />{l}</label>))}</div></div>
              <Separator />
              <div><p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "বেতন" : "Salary Range"}</p><div className="space-y-1.5">{SALARY_RANGES.map((s, i) => (<label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary"><input type="radio" name="salary" checked={selectedSalary === i} onChange={() => handleSalarySelect(i)} className="accent-primary" />{s.label}</label>))}</div></div>
              <Separator />
              <div><p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "সাজানো" : "Sort"}</p><Select value={sortBy} onValueChange={setSortBy}><SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="recent">{isBn ? "সাম্প্রতিক" : "Most Recent"}</SelectItem><SelectItem value="salary_high">{isBn ? "বেশি বেতন" : "Salary: High-Low"}</SelectItem><SelectItem value="salary_low">{isBn ? "কম বেতন" : "Salary: Low-High"}</SelectItem></SelectContent></Select></div>
            </>)}
          </aside>

          <main className="space-y-4">
            <div className="flex gap-2 lg:hidden">
              <Button variant="outline" size="sm" onClick={() => setLeftOpen(!leftOpen)} className="flex-1 text-xs">{leftOpen ? (isBn ? "ফিল্টার লুকান" : "Hide Filters") : (isBn ? "ফিল্টার দেখান" : "Show Filters")}</Button>
              <Button variant="outline" size="sm" onClick={() => setRightOpen(!rightOpen)} className="flex-1 text-xs">{rightOpen ? (isBn ? "সাইডবার লুকান" : "Hide Sidebar") : (isBn ? "সাইডবার দেখান" : "Show Sidebar")}</Button>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{isBn ? "মোট" : "Total"} <span className="font-semibold text-foreground">{totalJobs}</span> {isBn ? "টি চাকরি" : "jobs found"}</p>
            </div>

            {loading ? (
              <div className="space-y-4">{[...Array(5)].map((_, i) => (<Card key={i} className="p-5"><div className="animate-pulse space-y-3"><div className="h-5 w-3/4 bg-muted rounded" /><div className="h-4 w-1/2 bg-muted rounded" /><div className="h-10 w-full bg-muted rounded" /></div></Card>))}</div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16"><Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">{isBn ? "কোনো চাকরি পাওয়া যায়নি" : "No jobs found"}</h3><p className="text-muted-foreground text-sm">{isBn ? "অন্য ফিল্টার দিয়ে খুঁজুন" : "Try different filters"}</p></div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job: any) => {
                  const comp = typeof job.company === "object" ? job.company : null;
                  const desc = stripHtml(job.description || "");
                  const skills = (job.skills || []).filter(Boolean);
                  const timeLeft = job.deadline && now ? Math.max(0, Math.ceil((new Date(job.deadline).getTime() - now) / 86400000)) : null;
                  const promoBadge = getPromotionBadge(job, isBn);
                  const isPromoted = job.is_promoted || !!job.promotion;

                  return (
                    <Card key={job.id} className={`hover:shadow-md transition-shadow ${isPromoted ? "border-amber-200 dark:border-amber-800/50 ring-1 ring-amber-100 dark:ring-amber-900/30" : ""}`}>
                      <CardContent className="p-5">
                        <div className="flex gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Link href={`/jobs/${job.id}`} className="font-semibold text-base hover:text-primary transition-colors line-clamp-1">
                                    {job.title}
                                  </Link>
                                  {isPromoted && <Rocket className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                                </div>
                                {promoBadge && (
                                  <Badge className={`text-[10px] px-1.5 py-0 mt-1 ${promoBadge.color} gap-1`}>
                                    <promoBadge.icon className="h-2.5 w-2.5" /> {promoBadge.label}
                                  </Badge>
                                )}
                                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                                  <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {comp?.name || "Company"}</span>
                                  {comp?.rating != null && comp.rating > 0 && <span className="flex items-center gap-0.5 text-amber-500"><Star className="h-3.5 w-3.5 fill-amber-500" /> {comp.rating}</span>}
                                  {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>}
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-lg font-bold text-primary">{job.salary_min ? `${formatCurrency(job.salary_min)}${job.salary_max ? ` - ${formatCurrency(job.salary_max)}` : ""}` : job.budget ? formatCurrency(job.budget) : (isBn ? "বার্তা" : "Negotiable")}</p>
                                <p className="text-xs text-muted-foreground">{isBn ? "মাসিক" : "Monthly"}</p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{truncate(desc, 180)}</p>
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {skills.slice(0, 4).map((s: any, idx: number) => { const label = typeof s === "string" ? s : s?.name || ""; if (!label) return null; return <Badge key={idx} variant="secondary" className="text-xs">{label}</Badge>; })}
                              {job.is_remote_project || job.is_remote ? <Badge variant="outline" className="text-xs border-green-300 text-green-600"><Globe className="h-3 w-3 mr-1" />Remote</Badge> : null}
                            </div>
                            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                              {timeLeft != null && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {timeLeft} {isBn ? "দিন বাকি" : "Days Left"}</span>}
                              <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {job.applications_count || 0} {isBn ? "আবেদন" : "Applications"}</span>
                              {job.vacancies && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.vacancies} {isBn ? "পদ" : "Vacancies"}</span>}
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Button size="sm" className="h-8" asChild><Link href={`/jobs/${job.id}`}><Eye className="h-3.5 w-3.5 mr-1" /> {isBn ? "বিস্তারিত" : "Details"}</Link></Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0" disabled={savingJobId === job.id} onClick={(e) => { e.preventDefault(); handleToggleSave(job.id); }}>
                                {savingJobId === job.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : savedJobIds.has(String(job.id)) ? <BookmarkCheck className="h-3.5 w-3.5 fill-primary text-primary" /> : <Bookmark className="h-3.5 w-3.5" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => <Button key={p} variant={p === currentPage ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setCurrentPage(p)}>{p}</Button>)}
                    {totalPages > 7 && <span className="text-muted-foreground">...</span>}
                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>
            )}
          </main>

          <aside className="space-y-6 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <button onClick={() => setRightOpen(!rightOpen)} className="shrink-0 h-6 w-6 rounded hover:bg-muted flex items-center justify-center">{rightOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</button>
              {rightOpen && <h3 className="font-semibold text-sm whitespace-nowrap">{isBn ? "সাইডবার" : "Sidebar"}</h3>}
            </div>
            {rightOpen && (<>
              <Card><CardContent className="p-5">
                <h3 className="font-semibold text-sm mb-4">{isBn ? "কিভাবে কাজ করে" : "How It Works"}</h3>
                <div className="space-y-3">{HOW_IT_WORKS.map((step, i) => <div key={i} className="flex items-start gap-3"><div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><step.icon className="h-3.5 w-3.5 text-primary" /></div><p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p></div>)}</div>
              </CardContent></Card>
              {!isAuthenticated && (<Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"><CardContent className="p-5 text-center space-y-3"><Zap className="h-8 w-8 mx-auto" /><h3 className="font-semibold">{isBn ? "এখনই শুরু করুন" : "Start Hiring Today"}</h3><Button variant="secondary" size="sm" className="w-full" asChild><Link href="/register">{isBn ? "ফ্রি অ্যাকাউন্ট" : "Create Free Account"}</Link></Button></CardContent></Card>)}
              <Card><CardContent className="p-5">
                <div className="flex items-center justify-between mb-3"><h3 className="font-semibold text-sm">{isBn ? "শীর্ষ কোম্পানি" : "Top Companies"}</h3><Link href="/companies" className="text-xs text-primary hover:underline">{isBn ? "সব দেখুন" : "View All"}</Link></div>
                <div className="space-y-3">{featuredCompanies.length > 0 ? featuredCompanies.map((c) => (<Link key={c.id || c.slug} href={`/companies/${c.slug || c.id || ""}`} className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-1 -m-1 transition-colors"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 overflow-hidden"><CompanyLogo src={c.logo} name={c.name}>{c.name?.charAt(0) || "C"}</CompanyLogo></div><div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{c.name}</p><p className="text-xs text-muted-foreground">{c.jobs_count || 0} {isBn ? "জব" : "jobs"}</p></div></Link>)) : <p className="text-xs text-muted-foreground text-center py-2">—</p>}</div>
              </CardContent></Card>
              <Card className="border-primary/20"><CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> {isBn ? "নিরাপদ প্ল্যাটফর্ম" : "Secure Platform"}</h3>
                <div className="space-y-2 text-xs text-muted-foreground">
                  {[{ icon: ShieldCheck, text: isBn ? "১০০% যাচাইকৃত কোম্পানি" : "100% Verified Companies" }, { icon: Award, text: isBn ? "AI-পাওয়ার্ড ম্যাচিং" : "AI-Powered Matching" }, { icon: CheckCircle2, text: isBn ? "২৪/৭ সাপোর্ট" : "24/7 Support" }].map((item) => <div key={item.text} className="flex items-center gap-2"><item.icon className="h-3.5 w-3.5 text-primary shrink-0" /><span>{item.text}</span></div>)}
                </div>
              </CardContent></Card>
            </>)}
          </aside>
        </div>
      </div>

      <section className="border-t bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-lg font-bold mb-1">{isBn ? "ক্যাটাগরি অনুযায়ী চাকরি" : "Browse by Category"}</h2>
          <p className="text-sm text-muted-foreground mb-6">{isBn ? "আপনার পছন্দের ক্যাটাগরি খুঁজুন" : "Find jobs in the right category"}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.slice(0, 7).map((c) => (<Link key={c.value} href={`/jobs/category/${c.value}`} className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all text-center group"><div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors"><Briefcase className="h-5 w-5 text-primary" /></div><p className="text-xs font-medium leading-tight">{c.label}</p><p className="text-[11px] text-muted-foreground">{c.count || 0} {isBn ? "জব" : "Jobs"}</p></Link>))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}