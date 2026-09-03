"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Search, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Briefcase, Users, Shield, Target, Globe as GlobeIcon } from "lucide-react";
import type { Job } from "@/types";
import RemoteFilters from "./components/RemoteFilters";
import RemoteJobCard from "./components/RemoteJobCard";
import RemoteSidebar from "./components/RemoteSidebar";
import ApplyDialog from "./components/ApplyDialog";

const HOW_IT_WORKS = [
  { step: 1, text: "Company remotely posts a job" },
  { step: 2, text: "Candidates apply with proposals" },
  { step: 3, text: "Company reviews and starts work" },
  { step: 4, text: "Work delivered and approved" },
  { step: 5, text: "Payment released from escrow" },
];

export default function RemoteJobsClient() {
  const { isAuthenticated, user } = useAuth();
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [activeTab, setActiveTab] = useState("all");
  const [categories, setCategories] = useState<{ value: string; label: string; count?: number }[]>([]);
  const [platformStats, setPlatformStats] = useState({ total_jobs: 0, remote_jobs: 0, total_companies: 0, total_candidates: 0, total_applications: 0, avg_salary: 0 });
  const [topSkills, setTopSkills] = useState<{ skill: string; count: number }[]>([]);

  // Filters
  const [selectedJobType, setSelectedJobType] = useState("All Types");
  const [selectedExperience, setSelectedExperience] = useState("All Levels");
  const [selectedBudget, setSelectedBudget] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState("Any Duration");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [showAllSkills, setShowAllSkills] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [leftOpen, setLeftOpen] = useState(() => { if (typeof window === "undefined") return true; return localStorage.getItem("remote-jobs-left-open") !== "false"; });
  const [rightOpen, setRightOpen] = useState(() => { if (typeof window === "undefined") return true; return localStorage.getItem("remote-jobs-right-open") !== "false"; });

  useEffect(() => { localStorage.setItem("remote-jobs-left-open", String(leftOpen)); }, [leftOpen]);
  useEffect(() => { localStorage.setItem("remote-jobs-right-open", String(rightOpen)); }, [rightOpen]);

  // Apply
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeFromProfile, setResumeFromProfile] = useState<string | null>(null);

  useEffect(() => { if (user?.profile?.resume_path) setResumeFromProfile(user.profile.resume_path); }, [user]);

  const fetchJobs = useCallback(async (page: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("page", String(page));
      if (searchQuery) params.append("search", searchQuery);
      if (category !== "all") params.append("category_id", category);
      if (budgetMin) params.append("budget_min", budgetMin);
      if (budgetMax) params.append("budget_max", budgetMax);
      if (selectedExperience !== "All Levels") params.append("experience_level", selectedExperience);
      if (selectedDuration !== "Any Duration") params.append("project_duration", selectedDuration);
      if (selectedSkills.length > 0) params.append("skills", selectedSkills.join(","));
      if (sortBy) params.append("sort", sortBy);
      const res = await api.get(`/jobs/remote?${params.toString()}`);
      const payload = res.data.data;
      if (Array.isArray(payload)) { setJobs(payload); setTotalPages(1); setTotalJobs(payload.length); }
      else if (payload?.data) { setJobs(payload.data); setTotalPages(payload.last_page || 1); setTotalJobs(payload.total || 0); }
      else { setJobs([]); setTotalPages(1); setTotalJobs(0); }
    } catch { toast.error(isBn ? "চাকরি লোড করতে ব্যর্থ" : "Failed to load remote jobs"); }
    finally { setLoading(false); }
  }, [searchQuery, category, budgetMin, budgetMax, selectedExperience, selectedDuration, selectedSkills, sortBy, isBn]);

  useEffect(() => { fetchJobs(currentPage); }, [currentPage, fetchJobs]);
  useEffect(() => { setCurrentPage(1); }, [selectedExperience, selectedDuration, selectedSkills, sortBy, category]);

  useEffect(() => {
    api.get("/categories").then((res) => setCategories((res.data?.data || []).filter((c: any) => c.is_remote).map((c: any) => ({ value: c.id.toString(), label: c.name_en || c.name, count: c.jobs_count || 0 })))).catch(() => {});
    api.get("/jobs/stats").then((res: any) => setPlatformStats(res.data?.data || res.data || {})).catch(() => {});
    api.get("/jobs/popular-skills").then((res: any) => setTopSkills(res.data?.data || [])).catch(() => {});
  }, []);

  const toggleSkill = (s: string) => setSelectedSkills((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  const clearFilters = () => { setSelectedJobType("All Types"); setSelectedExperience("All Levels"); setSelectedBudget(0); setSelectedDuration("Any Duration"); setSelectedSkills([]); setBudgetMin(""); setBudgetMax(""); setCurrentPage(1); };

  const handleApply = (job: Job) => {
    if (!isAuthenticated) { toast.error(isBn ? "লগইন করুন" : "Please login first"); return; }
    setSelectedJob(job);
    setApplyDialogOpen(true);
  };

  const filteredJobs = jobs.filter((j) => { if (activeTab === "fixed" && j.job_type !== "fixed_price") return false; if (activeTab === "hourly" && j.job_type !== "hourly") return false; return true; });
  const allCats = [{ value: "all", label: isBn ? "সব ক্যাটাগরি" : "All Categories", count: totalJobs }, ...categories];
  const stats = [
    { icon: GlobeIcon, label: "Remote Jobs", value: platformStats.remote_jobs || platformStats.total_jobs || 0 },
    { icon: Target, label: "Active Projects", value: platformStats.total_applications || 0 },
    { icon: Briefcase, label: "Avg Salary", value: platformStats.avg_salary ? `৳${Number(platformStats.avg_salary).toLocaleString()}` : "৳0" },
    { icon: Users, label: "Freelancers", value: platformStats.total_candidates || 0 },
    { icon: Shield, label: "Payment Protected", value: "100%" },
  ];

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-800 to-purple-600">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 relative z-10">
          <div className="text-white space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1 rounded-full"><Shield className="h-3.5 w-3.5" /> 100% Secure — {siteName}</div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">{isBn ? "রিমোট কাজ, নিরাপদ পেমেন্ট" : "Remote Work, Secure Payment"}</h1>
            <p className="text-white/80 text-lg">{isBn ? "যেকোনো জায়গা থেকে কাজ করুন, নিরাপদে বেতন পান" : "Work from anywhere, get paid safely"}</p>
            <div className="bg-white text-foreground rounded-xl p-2 flex flex-col sm:flex-row gap-2 shadow-lg max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={isBn ? "চাকরি খুঁজুন..." : "Search job title or keywords..."} className="pl-10 h-11 border-0 bg-transparent" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && setCurrentPage(1)} />
              </div>
              <Select value={category} onValueChange={(v) => { setCategory(v); setCurrentPage(1); }}>
                <SelectTrigger className="w-full sm:w-40 h-11 border-0 bg-muted/50"><SelectValue placeholder={isBn ? "ক্যাটাগরি" : "All Categories"} /></SelectTrigger>
                <SelectContent>{allCats.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
              </Select>
              <Button onClick={() => setCurrentPage(1)} className="h-11 px-6 bg-purple-600 hover:bg-purple-700 text-white"><Search className="h-4 w-4 mr-1" /> {isBn ? "খুঁজুন" : "Search Jobs"}</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="border-b bg-white dark:bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto py-3">
            {(showAllCategories ? allCats : allCats.slice(0, 6)).map((c) => (
              <button key={c.value} onClick={() => { setCategory(c.value); setCurrentPage(1); }} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === c.value ? "bg-primary text-primary-foreground" : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground"}`}>
                {c.label}{c.count != null && <span className="text-xs opacity-70">{c.count.toLocaleString()}</span>}
              </button>
            ))}
            {allCats.length > 6 && <button onClick={() => setShowAllCategories(!showAllCategories)} className="flex items-center gap-1 px-3 py-2 text-sm text-primary">{showAllCategories ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}{showAllCategories ? "Less" : "More"}</button>}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-muted/30 border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><s.icon className="h-5 w-5 text-primary" /></div>
                <div><p className="text-sm font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main 3-column */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[var(--left)_1fr_var(--right)] lg:gap-6" style={{ '--left': leftOpen ? '240px' : '36px', '--right': rightOpen ? '280px' : '36px' } as React.CSSProperties}>
          <RemoteFilters open={leftOpen} onToggle={() => setLeftOpen(!leftOpen)} isBn={isBn} jobType={selectedJobType} setJobType={setSelectedJobType} experience={selectedExperience} setExperience={setSelectedExperience} budget={selectedBudget} setBudget={setSelectedBudget} setBudgetMin={setBudgetMin} setBudgetMax={setBudgetMax} duration={selectedDuration} setDuration={setSelectedDuration} skills={selectedSkills} toggleSkill={toggleSkill} topSkills={topSkills} showAllSkills={showAllSkills} setShowAllSkills={setShowAllSkills} onClearAll={clearFilters} />

          <main className="space-y-4">
            <div className="flex gap-2 lg:hidden">
              <Button variant="outline" size="sm" onClick={() => setLeftOpen(!leftOpen)} className="flex-1 text-xs">{leftOpen ? (isBn ? "ফিল্টার লুকান" : "Hide Filters") : (isBn ? "ফিল্টার দেখান" : "Show Filters")}</Button>
              <Button variant="outline" size="sm" onClick={() => setRightOpen(!rightOpen)} className="flex-1 text-xs">{rightOpen ? (isBn ? "সাইডবার লুকান" : "Hide Sidebar") : (isBn ? "সাইডবার দেখান" : "Show Sidebar")}</Button>
            </div>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                {[
                  { key: "all", label: `All Jobs (${totalJobs})` },
                  { key: "fixed", label: `Fixed Price (${jobs.filter((j) => j.job_type === "fixed_price").length || 0})` },
                  { key: "hourly", label: `Hourly (${jobs.filter((j) => j.job_type === "hourly").length || 0})` },
                ].map((tab) => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? "bg-white dark:bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{tab.label}</button>)}
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{isBn ? "সাম্প্রতিক" : "Most Recent"}</SelectItem>
                  <SelectItem value="budget_high">{isBn ? "বেশি বাজেট" : "Budget: High to Low"}</SelectItem>
                  <SelectItem value="budget_low">{isBn ? "কম বাজেট" : "Budget: Low to High"}</SelectItem>
                  <SelectItem value="proposals">{isBn ? "কম প্রপোজাল" : "Least Proposals"}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {loading ? (
              <div className="space-y-4">{[...Array(5)].map((_, i) => <Card key={i} className="p-5"><div className="animate-pulse space-y-3"><div className="h-5 w-3/4 bg-muted rounded" /><div className="h-4 w-1/2 bg-muted rounded" /><div className="h-12 w-full bg-muted rounded" /></div></Card>)}</div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-16"><Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" /><h3 className="text-lg font-semibold mb-2">{isBn ? "কোনো চাকরি পাওয়া যায়নি" : "No remote jobs found"}</h3><p className="text-muted-foreground">{isBn ? "অন্য কীওয়ার্ড দিয়ে খুঁজুন" : "Try different keywords"}</p></div>
            ) : (
              <>
                <div className="space-y-4">{filteredJobs.map((job) => <RemoteJobCard key={job.id} job={job} isBn={isBn} onApply={handleApply} />)}</div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1.5 mt-8">
                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => p - 1)}><ChevronLeft className="h-4 w-4" /></Button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => <Button key={p} variant={p === currentPage ? "default" : "outline"} size="icon" className="h-9 w-9" onClick={() => setCurrentPage(p)}>{p}</Button>)}
                    {totalPages > 7 && <span className="text-muted-foreground">...</span>}
                    <Button variant="outline" size="icon" className="h-9 w-9" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => p + 1)}><ChevronRight className="h-4 w-4" /></Button>
                  </div>
                )}
              </>
            )}
          </main>

          <RemoteSidebar open={rightOpen} onToggle={() => setRightOpen(!rightOpen)} isBn={isBn} siteName={siteName} isAuthenticated={isAuthenticated} />
        </div>
      </div>

      <ApplyDialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen} job={selectedJob} isBn={isBn} resumeFromProfile={resumeFromProfile} onSuccess={() => fetchJobs(currentPage)} />
    </PublicLayout>
  );
}