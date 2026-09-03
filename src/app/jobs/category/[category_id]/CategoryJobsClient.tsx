"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DefaultAvatar, CompanyLogo } from "@/components/ui/default-avatar";
import { toast } from "sonner";
import {
  Search, Globe, Send, ChevronLeft, ChevronRight, Briefcase, MapPin,
  Users, Clock, Star, Building2, ChevronDown, ChevronUp, Zap, Target,
  Eye, Bookmark, ShieldCheck, CheckCircle2, Award, CreditCard,
  MessageSquare, Banknote, TrendingUp, Tag, ArrowRight, Filter, Mail,
} from "lucide-react";
import { formatCurrency, truncate, stripHtml } from "@/lib/utils";

interface CategoryInfo {
  id: number;
  name_en: string;
  name_bn: string;
  icon: string | null;
  jobs_count: number;
  children?: { id: number; name_en: string; name_bn: string; jobs_count: number }[];
}

interface CategoryStats {
  total_jobs: number;
  companies: number;
  avg_salary: number;
  remote_jobs: number;
}

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

const HOW_IT_WORKS = [
  { icon: Search, text: "Company কাজ পোস্ট করে" },
  { icon: Users, text: "Company প্রয়োজনীয় তথ্য দেখায়" },
  { icon: Send, text: "Candidates Apply করে" },
  { icon: MessageSquare, text: "Company Candidate দেখে ও শুরু করে" },
  { icon: CheckCircle2, text: "Company কাজ রিভিউ করে" },
  { icon: CreditCard, text: "Payment Release হয়" },
  { icon: Star, text: "eJob reviews jobs" },
];

export default function CategoryJobsClient({ categoryId }: { categoryId: string }) {
  const { language, settings } = useThemeStore();
  const { isAuthenticated } = useAuth();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

  const [category, setCategory] = useState<CategoryInfo | null>(null);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [popularSkills, setPopularSkills] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategory, setLoadingCategory] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [selectedSalary, setSelectedSalary] = useState(0);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [experienceLevel, setExperienceLevel] = useState("all");
  const [showAllSkills, setShowAllSkills] = useState(false);

  // Sidebar collapse
  const [leftOpen, setLeftOpen] = useState(true);
  const [rightOpen, setRightOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  // Featured companies (dynamic)
  const [featuredCompanies, setFeaturedCompanies] = useState<any[]>([]);

  useEffect(() => {
    const lv = localStorage.getItem("jobs-left-open");
    if (lv !== null) setLeftOpen(lv === "true");
    const rv = localStorage.getItem("jobs-right-open");
    if (rv !== null) setRightOpen(rv === "true");
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      localStorage.setItem("jobs-left-open", String(leftOpen));
      localStorage.setItem("jobs-right-open", String(rightOpen));
    }
  }, [leftOpen, rightOpen, hydrated]);

  // Fetch featured companies from API
  useEffect(() => {
    api.get("/companies/featured").then((res) => setFeaturedCompanies(res.data?.data || [])).catch(() => {});
  }, []);

  // Load category details
  useEffect(() => {
    setLoadingCategory(true);
    api.get(`/categories/${categoryId}`)
      .then((res) => {
        const d = res.data.data;
        setCategory(d.category);
        setStats(d.stats);
        setPopularSkills(d.popular_skills || []);
      })
      .catch(() => setCategory(null))
      .finally(() => setLoadingCategory(false));
  }, [categoryId]);

  // Load all categories for sidebar
  useEffect(() => {
    api.get("/categories").then((res) => {
      setCategories(res.data.data || []);
    }).catch(() => { /* categories sidebar - non-critical */ });
  }, []);

  // Fetch jobs
  const fetchJobs = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      params.append("category_id", categoryId);
      if (searchQuery) params.append("search", searchQuery);
      if (selectedJobType !== "all") params.append("job_type", selectedJobType);
      if (budgetMin) params.append("budget_min", budgetMin);
      if (budgetMax) params.append("budget_max", budgetMax);

      const res = await api.get(`/jobs?${params.toString()}`);
      const payload = res.data.data;

      if (Array.isArray(payload)) {
        setJobs(payload);
        setTotalPages(1);
        setTotalJobs(payload.length);
      } else if (payload?.data) {
        setJobs(payload.data);
        setTotalPages(payload.last_page || 1);
        setTotalJobs(payload.total || 0);
      } else {
        setJobs([]);
        setTotalPages(1);
        setTotalJobs(0);
      }
    } catch {
      toast.error(isBn ? "চাকরি লোড করতে ব্যর্থ" : "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [categoryId, searchQuery, selectedJobType, budgetMin, budgetMax, isBn]);

  useEffect(() => { fetchJobs(currentPage); }, [currentPage, fetchJobs]);

  const handleSalarySelect = (idx: number) => {
    setSelectedSalary(idx);
    setBudgetMin(SALARY_RANGES[idx].min);
    setBudgetMax(SALARY_RANGES[idx].max);
    setCurrentPage(1);
  };

  const handleSearch = () => setCurrentPage(1);

  const catName = category?.name_en || "Category";
  const catNameBn = category?.name_bn || catName;

  if (loadingCategory && !category) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center py-20">
          <div className="animate-pulse text-center">
            <div className="h-8 w-48 bg-muted rounded mx-auto mb-4" />
            <div className="h-4 w-64 bg-muted rounded mx-auto" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!category) {
    return (
      <PublicLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Briefcase className="h-16 w-16 text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">{isBn ? "ক্যাটাগরি পাওয়া যায়নি" : "Category Not Found"}</h1>
          <p className="text-muted-foreground mb-4">{isBn ? "এই ক্যাটাগরি বিদ্যমান নেই" : "This category does not exist or has been removed."}</p>
          <Button asChild><Link href="/jobs">{isBn ? "সব চাকরি দেখুন" : "Browse All Jobs"}</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      {/* ═══ HERO / CATEGORY HEADER ═══ */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                <Link href="/" className="hover:text-primary">{isBn ? "হোম" : "Home"}</Link>
                <span>/</span>
                <Link href="/jobs" className="hover:text-primary">{isBn ? "চাকরি" : "Jobs"}</Link>
                <span>/</span>
                <span className="text-foreground">{catNameBn}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-1">{catNameBn} ({catName})</h1>
              <p className="text-muted-foreground text-sm max-w-xl mb-4">
                {isBn
                  ? `${catNameBn} ক্যাটাগরিতে সকল প্রকার চাকরি খুঁজে নিন। ${stats?.total_jobs || 0}+টি চাকরি এখনই অপেক্ষা করছে।`
                  : `Find all types of ${catName} jobs here. ${stats?.total_jobs || 0}+ jobs are waiting for you.`}
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: isBn ? "মোট চাকরি" : "Total Jobs", value: stats?.total_jobs || 0, icon: Briefcase },
                  { label: isBn ? "কোম্পানি" : "Companies", value: stats?.companies || 0, icon: Building2 },
                  { label: isBn ? "গড় বেতন" : "Avg Salary", value: stats?.avg_salary ? `৳${Math.round(stats.avg_salary / 1000)}K+` : "—", icon: Banknote },
                  { label: isBn ? "রিমোট" : "Remote Jobs", value: stats?.remote_jobs || 0, icon: Globe },
                ].map((s) => (
                  <div key={s.label} className="flex items-center gap-2 bg-white dark:bg-card rounded-lg px-3 py-2 border">
                    <s.icon className="h-4 w-4 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-bold">{s.value}</p>
                      <p className="text-[11px] text-muted-foreground">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* CTA Card - only for guests */}
            {!isAuthenticated && (
              <Card className="w-full lg:w-72 shrink-0 border-primary/20">
                <CardContent className="p-5 text-center space-y-3">
                  <Zap className="h-8 w-8 mx-auto text-primary" />
                  <p className="text-sm font-medium">{isBn ? "আপনার প্রোফাইল তৈরি করুন" : "Create Your Profile"}</p>
                  <p className="text-xs text-muted-foreground">{isBn ? "নতুন কাজের সুযোগ সরাসরি পান" : "Get new job opportunities directly"}</p>
                  <Button size="sm" className="w-full" asChild><Link href="/register">{isBn ? "ফ্রি অ্যাকাউন্ট খুঁজুন" : "Create Free Account"}</Link></Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Search Bar */}
          <div className="mt-6 bg-white dark:bg-card rounded-xl p-2 flex flex-col sm:flex-row gap-2 shadow-sm border max-w-3xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder={isBn ? "পজিশন, কীওয়ার্ড খুঁজুন..." : "Search position, keywords..."} className="pl-10 h-10 border-0 bg-transparent" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch()} />
            </div>
            <Select defaultValue="dhaka">
              <SelectTrigger className="w-full sm:w-36 h-10 border-0 bg-muted/50"><SelectValue placeholder={isBn ? "স্থান" : "Location"} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dhaka">{isBn ? "ঢাকা" : "Dhaka"}</SelectItem>
                <SelectItem value="chittagong">{isBn ? "চট্টগ্রাম" : "Chittagong"}</SelectItem>
                <SelectItem value="sylhet">{isBn ? "সিলেট" : "Sylhet"}</SelectItem>
                <SelectItem value="rajshahi">{isBn ? "রাজশাহী" : "Rajshahi"}</SelectItem>
                <SelectItem value="remote">{isBn ? "রিমোট" : "Remote"}</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-36 h-10 border-0 bg-muted/50"><SelectValue placeholder={isBn ? "অভিজ্ঞতা" : "Experience"} /></SelectTrigger>
              <SelectContent>
                {["all", "entry", "mid", "senior", "executive"].map((l) => (
                  <SelectItem key={l} value={l}>{l === "all" ? (isBn ? "সব" : "All") : l.charAt(0).toUpperCase() + l.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} className="h-10 px-6 bg-primary hover:bg-primary/90">
              <Search className="h-4 w-4 mr-1" /> {isBn ? "খুঁজুন" : "Search"}
            </Button>
          </div>
        </div>
      </section>

      {/* ═══ MAIN 3-COLUMN LAYOUT ═══ */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">

          {/* ── LEFT SIDEBAR TOGGLE ── */}
          <button onClick={() => setLeftOpen(!leftOpen)} className="hidden lg:flex items-center justify-center w-6 h-6 shrink-0 mt-2 text-muted-foreground hover:text-foreground" title={leftOpen ? "Hide sidebar" : "Show sidebar"}>
            {leftOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>

          {/* ── LEFT SIDEBAR ── */}
          {leftOpen && (
            <aside className="hidden lg:block w-[220px] shrink-0 space-y-5">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-primary" />
                <h3 className="font-semibold text-sm">{isBn ? "ফিল্টার" : "Filter"}</h3>
                <button onClick={() => { setSelectedJobType("all"); setSelectedSalary(0); setBudgetMin(""); setBudgetMax(""); setExperienceLevel("all"); setCurrentPage(1); }} className="ml-auto text-xs text-primary hover:underline">{isBn ? "সব মুছুন" : "All Clear"}</button>
              </div>

              {/* Job Type */}
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "চাকরির ধরন" : "Job Type"}</p>
                <div className="space-y-1.5">
                  {JOB_TYPES.map((t) => (
                    <label key={t.value} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                      <input type="radio" name="jobType" checked={selectedJobType === t.value} onChange={() => { setSelectedJobType(t.value); setCurrentPage(1); }} className="accent-primary" />
                      {t.label}
                    </label>
                  ))}
                </div>
              </div>
              <Separator />

              {/* Employment */}
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "চুক্তির ধরন" : "Employment Type"}</p>
                <div className="space-y-1.5">
                  {["All", "Permanent", "Contractual", "Full Time", "Part Time"].map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                      <input type="radio" name="empType" className="accent-primary" /> {t}
                    </label>
                  ))}
                </div>
              </div>
              <Separator />

              {/* Salary Range */}
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "বেতন" : "Salary"}</p>
                <div className="space-y-1.5">
                  {SALARY_RANGES.map((s, i) => (
                    <label key={i} className="flex items-center gap-2 text-sm cursor-pointer hover:text-primary">
                      <input type="radio" name="salary" checked={selectedSalary === i} onChange={() => handleSalarySelect(i)} className="accent-primary" />
                      {s.label}
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input type="number" placeholder="Min" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} className="h-8 text-xs" />
                  <Input type="number" placeholder="Max" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} className="h-8 text-xs" />
                </div>
              </div>
              <Separator />

              {/* Sort */}
              <div>
                <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "সাজানো" : "Sort"}</p>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">{isBn ? "সাম্প্রতিক" : "Most Recent"}</SelectItem>
                    <SelectItem value="salary_high">{isBn ? "বেশি বেতন" : "Salary: High-Low"}</SelectItem>
                    <SelectItem value="salary_low">{isBn ? "কম বেতন" : "Salary: Low-High"}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Separator />

              {/* Sub-categories */}
              {category.children && category.children.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs font-semibold mb-2 uppercase tracking-wider text-muted-foreground">{isBn ? "সাব-ক্যাটাগরি" : "Sub-categories"}</p>
                    <div className="space-y-1.5">
                      {category.children.map((child) => (
                        <Link key={child.id} href={`/jobs/category/${child.id}`} className="flex items-center justify-between text-sm hover:text-primary group">
                          <span className="group-hover:underline">{isBn ? child.name_bn : child.name_en}</span>
                          <span className="text-xs text-muted-foreground">{child.jobs_count}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </aside>
          )}

          {/* ── CENTER: Job Listings ── */}
          <main className="flex-1 min-w-0 space-y-4">
            {/* Job count & sort */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {isBn ? "মোট" : "Total"} <span className="font-semibold text-foreground">{totalJobs}</span> {isBn ? "টি কাজ" : "jobs found"}
              </p>
            </div>

            {/* Loading */}
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="p-5">
                    <div className="animate-pulse space-y-3">
                      <div className="h-5 w-3/4 bg-muted rounded" />
                      <div className="h-4 w-1/2 bg-muted rounded" />
                      <div className="h-10 w-full bg-muted rounded" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="text-center py-16">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">{isBn ? "কোনো চাকরি পাওয়া যায়নি" : "No jobs found"}</h3>
                <p className="text-muted-foreground text-sm">{isBn ? "অন্য ফিল্টার বা কীওয়ার্ড দিয়ে খুঁজে দেখুন" : "Try different filters or keywords"}</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {jobs.map((job: any) => {
                    const comp = typeof job.company === "object" ? job.company : null;
                    const desc = stripHtml(job.description || "");
                    const skills = (job.skills || []).filter(Boolean);
                    const timeLeft = job.deadline ? Math.max(0, Math.ceil((new Date(job.deadline).getTime() - Date.now()) / 86400000)) : null;

                    return (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-5">
                          <div className="flex gap-4">
                            {/* Logo */}
                            <div className="shrink-0 hidden sm:block">
                              <CompanyLogo src={comp?.logo} name={comp?.name} className="w-12 h-12 rounded-lg object-cover border">
                                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                                  {comp?.name?.charAt(0) || "C"}
                                </div>
                              </CompanyLogo>
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <Link href={`/jobs/${job.id}`} className="font-semibold text-base hover:text-primary transition-colors line-clamp-1">{job.title}</Link>
                                  <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                                    <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" /> {comp?.name || "Company"}</span>
                                    {comp?.rating != null && comp.rating > 0 && <span className="flex items-center gap-0.5 text-amber-500"><Star className="h-3.5 w-3.5 fill-amber-500" /> {comp.rating}</span>}
                                    {job.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-lg font-bold text-primary">
                                    {job.salary_min ? `${formatCurrency(job.salary_min)}${job.salary_max ? ` - ${formatCurrency(job.salary_max)}` : ""}` : job.budget ? formatCurrency(job.budget) : (isBn ? "বার্তা" : "Negotiable")}
                                  </p>
                                  <p className="text-xs text-muted-foreground">{isBn ? "মাসিক" : "Monthly"}</p>
                                </div>
                              </div>

                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{truncate(desc, 180)}</p>

                              {/* Tags */}
                              <div className="flex flex-wrap gap-1.5 mt-3">
                                {skills.slice(0, 4).map((s: any, idx: number) => {
                                  const label = typeof s === "string" ? s : s?.name || "";
                                  if (!label) return null;
                                  return <Badge key={idx} variant="secondary" className="text-xs">{label}</Badge>;
                                })}
                                {job.is_remote_project || job.is_remote ? <Badge variant="outline" className="text-xs border-green-300 text-green-600"><Globe className="h-3 w-3 mr-1" />Remote</Badge> : null}
                              </div>

                              {/* Meta */}
                              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
                                {timeLeft != null && <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {timeLeft} {isBn ? "দিন বাকি" : "Days Left"}</span>}
                                <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {job.applications_count || 0} {isBn ? "আবেদন" : "Applications"}</span>
                                {job.vacancies && <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.vacancies} {isBn ? "পদ" : "Vacancies"}</span>}
                              </div>

                              <div className="flex items-center gap-2 mt-3">
                                <Button size="sm" className="h-8" asChild><Link href={`/jobs/${job.id}`}><Eye className="h-3.5 w-3.5 mr-1" /> {isBn ? "বিস্তারিত" : "Details"}</Link></Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><Bookmark className="h-3.5 w-3.5" /></Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
                      <Button key={p} variant={p === currentPage ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setCurrentPage(p)}>{p}</Button>
                    ))}
                    {totalPages > 7 && <span className="text-muted-foreground">...</span>}
                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>

          {/* ── RIGHT SIDEBAR TOGGLE ── */}
          <button onClick={() => setRightOpen(!rightOpen)} className="hidden lg:flex items-center justify-center w-6 h-6 shrink-0 mt-2 text-muted-foreground hover:text-foreground" title={rightOpen ? "Hide sidebar" : "Show sidebar"}>
            {rightOpen ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>

          {/* ── RIGHT SIDEBAR ── */}
          {rightOpen && (
            <aside className="hidden lg:block w-[280px] shrink-0 space-y-6">
              {/* How It Works */}
              <Card>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-sm mb-4">{isBn ? "কিভাবে কাজ করে" : "How It Works"}</h3>
                  <div className="space-y-3">
                    {HOW_IT_WORKS.map((step, i) => {
                      const stepText = i === 6
                        ? (isBn ? `${siteName === "eJobs" ? "ই-জবস" : siteName} রিভিউ দেয়` : `${siteName} reviews jobs`)
                        : step.text;
                      return (
                        <div key={i} className="flex items-start gap-3">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <step.icon className="h-3.5 w-3.5 text-primary" />
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed">{stepText}</p>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Popular Skills */}
              {popularSkills.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-sm mb-3">{isBn ? "জনপ্রিয় স্কিল" : "Popular Skills (Top 10)"}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {(showAllSkills ? popularSkills : popularSkills.slice(0, 8)).map((skill, i) => (
                        <Badge key={i} variant="secondary" className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors">{skill}</Badge>
                      ))}
                    </div>
                    {popularSkills.length > 8 && (
                      <button onClick={() => setShowAllSkills(!showAllSkills)} className="text-xs text-primary mt-2 flex items-center gap-1 hover:underline">
                        {showAllSkills ? <><ChevronUp className="h-3 w-3" /> {isBn ? "কম" : "Less"}</> : <><ChevronDown className="h-3 w-3" /> {isBn ? "আরও" : "More"}</>}
                      </button>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* CTA - only for guests */}
              {!isAuthenticated && (
                <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                  <CardContent className="p-5 text-center space-y-3">
                    <Zap className="h-8 w-8 mx-auto" />
                    <h3 className="font-semibold">{isBn ? "আপনার প্রোফাইল তৈরি করুন" : "Create Your Profile"}</h3>
                    <p className="text-xs text-primary-foreground/80">{isBn ? "এখনই শুরু করুন এবং চাকরি পান" : "Start now and get matched with jobs"}</p>
                    <Button variant="secondary" size="sm" className="w-full" asChild><Link href="/register">{isBn ? "ফ্রি অ্যাকাউন্ট খুঁজুন" : "Create Free Account"}</Link></Button>
                  </CardContent>
                </Card>
              )}

              {/* Featured Companies */}
              {featuredCompanies.length > 0 && (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-sm">{isBn ? "শীর্ষ কোম্পানি" : "Top Companies"}</h3>
                      <Link href="/companies" className="text-xs text-primary hover:underline">{isBn ? "সব দেখুন" : "View All"}</Link>
                    </div>
                    <div className="space-y-3">
                      {featuredCompanies.map((c: any) => (
                        <Link key={c.id || c.slug} href={`/companies/${c.slug || c.id || ""}`} className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-1 -m-1 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0 overflow-hidden">
                            <CompanyLogo src={c.logo} name={c.name}>
                              {c.name?.charAt(0) || "C"}
                            </CompanyLogo>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{c.name}</p>
                            <p className="text-xs text-muted-foreground">{c.jobs_count || 0} {isBn ? "জব" : "jobs"}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </aside>
          )}
        </div>
      </div>

      {/* ═══ RELATED CATEGORIES ═══ */}
      <section className="border-t bg-muted/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h2 className="text-lg font-bold mb-1">{isBn ? "আপনার পছন্দের ক্যাটাগরি বেছে নিন" : "Find Jobs by Category"}</h2>
          <p className="text-sm text-muted-foreground mb-6">{isBn ? "আপনার স্কিল অনুযায়ী চাকরি খুঁজুন" : "Find jobs matching your skills"}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {categories.filter((c) => c.id !== Number(categoryId)).slice(0, 7).map((c) => (
              <Link key={c.id} href={`/jobs/category/${c.id}`} className="flex flex-col items-center gap-2 p-4 rounded-xl border bg-card hover:shadow-md hover:border-primary/30 transition-all text-center group">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Briefcase className="h-5 w-5 text-primary" />
                </div>
                <p className="text-xs font-medium leading-tight">{isBn ? c.name_bn : c.name_en}</p>
                <p className="text-[11px] text-muted-foreground">{c.jobs_count || 0} {isBn ? "জব" : "Jobs"}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-4">
            <Button variant="outline" size="sm" asChild><Link href="/jobs">{isBn ? "আরও ক্যাটাগরি দেখুন →" : "More Categories →"}</Link></Button>
          </div>
        </div>
      </section>

      {/* ═══ NEWSLETTER ═══ */}
      <section className="border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold">{isBn ? "নতুন চাকরি আপডেট পান" : "Stay Updated with New Jobs"}</h3>
              <p className="text-sm text-muted-foreground">{isBn ? "আপনার ইমেইল দিন এবং নতুন চাকরি সম্পর্কে জানুন" : "Subscribe to get the latest job alerts"}</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={isBn ? "ইমেইল লিখুন" : "Enter your email"} className="pl-10 h-10" />
              </div>
              <Button className="h-10">{isBn ? "সাবস্ক্রাইব" : "Subscribe"}</Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
