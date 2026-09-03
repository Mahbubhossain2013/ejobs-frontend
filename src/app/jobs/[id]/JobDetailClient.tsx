"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useJob, useApplyToJob, useSavedJobs, useAiMatchScore } from "@/hooks/use-jobs";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  MapPin, Briefcase, DollarSign, Calendar, ArrowLeft, Share2,
  Building2, CheckCircle, Clock, Send, ExternalLink, Sparkles, Loader2,
  AlertTriangle, Shield, Flag, Target, Users, Star, Zap,
  Globe, Award, Rocket, Megaphone, Bookmark, Search, Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import { aiService } from "@/services/ai.service";
import { trackBehavior } from "@/hooks/use-behavior-tracker";
import DOMPurify from "dompurify";

interface Props { jobId: string; }

function getPromotionInfo(job: any) {
  if (job.promotion) return job.promotion;
  if (job.is_promoted) return { type: job.promotion_type || "sponsored_job", status: "active" };
  return null;
}

function getPromotionBadgeConfig(type: string, isBn: boolean) {
  const map: Record<string, { label: string; color: string; desc: string; icon: any }> = {
    sponsored_job: { label: isBn ? "স্পনসরড চাকরি" : "Sponsored Job", color: "bg-gradient-to-r from-amber-500 to-orange-500", desc: isBn ? "এই চাকরিটি সার্চে শীর্ষে প্রদর্শিত" : "This job is featured at the top of search results", icon: Sparkles },
    awareness_ad: { label: isBn ? "ব্র্যান্ড অ্যাওয়্যারনেস" : "Brand Awareness", color: "bg-gradient-to-r from-purple-500 to-pink-500", desc: isBn ? "এই চাকরিটি বিজ্ঞাপন ব্যানারে প্রদর্শিত" : "This job is promoted across ad banners", icon: Megaphone },
    featured: { label: isBn ? "বৈশিষ্ট্যযুক্ত চাকরি" : "Featured Job", color: "bg-gradient-to-r from-blue-500 to-indigo-500", desc: isBn ? "এই চাকরিটি বৈশিষ্ট্যযুক্ত" : "This job is featured", icon: Star },
  };
  return map[type] || map.sponsored_job;
}

export default function JobDetailClient({ jobId }: Props) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const { language } = useThemeStore();
  const isBn = language === "bn";

  const { data: job, isLoading } = useJob(jobId);
  const { data: matchData } = useAiMatchScore(Number(jobId));
  const applyMutation = useApplyToJob();
  const { data: savedJobsData, refetch: refetchSavedJobs } = useSavedJobs();
  const savedJobIds = new Set((savedJobsData as any)?.map?.((j: any) => String(j.id)) ?? []);
  const [savingJob, setSavingJob] = useState(false);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [deliveryDays, setDeliveryDays] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [generatingCover, setGeneratingCover] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "requirements" | "company">("overview");

  useEffect(() => {
    if (isAuthenticated) {
      trackBehavior("job_view", { targetId: Number(jobId) });
    }
  }, [jobId, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && user?.role === "candidate") {
      api.get("/candidate/wallet").then((r) => {
        const d = r.data;
        setWalletBalance(Number(d.wallet?.balance ?? d.balance ?? d.data?.balance ?? 0));
      }).catch(() => {});
    }
  }, [isAuthenticated, user]);

  const handleApply = () => {
    if (!coverLetter.trim()) { toast.error(isBn ? "কভার লেটার লিখুন" : "Please write a cover letter"); return; }
    if (coverLetter.trim().length < 10) { toast.error(isBn ? "কভার লেটার কমপক্ষে ১০ অক্ষর হতে হবে" : "Cover letter must be at least 10 characters"); return; }
    const data: Record<string, any> = { cover_letter: coverLetter };
    if (portfolioLink) data.portfolio_link = portfolioLink;
    if (job?.is_remote_project) data.delivery_days = Number(deliveryDays) || 7;
    applyMutation.mutate({ jobId: Number(jobId), data }, {
      onSuccess: () => { setShowApplyDialog(false); setCoverLetter(""); setDeliveryDays(""); setPortfolioLink(""); },
    });
  };

  const handleApplyClick = () => {
    if (!user?.is_verified) {
      toast.warning(isBn ? "আগে যাচাই করুন" : "Verify your profile first", {
        action: { label: isBn ? "যাচাই" : "Verify", onClick: () => router.push("/dashboard/verify") },
      });
      return;
    }
    setShowApplyDialog(true);
  };

  const handleGenerateCoverLetter = async () => {
    setGeneratingCover(true);
    try {
      const res = await aiService.generateCoverLetter({
        job_title: job?.title || "",
        company_name: (typeof job?.company === "object" ? job?.company?.name : job?.company) || "",
        job_description: job?.description || "",
      });
      if (res.cover_letter) { setCoverLetter(res.cover_letter); toast.success(isBn ? "কভার লেটার তৈরি!" : "Cover letter generated!"); }
      if (res.fallback) toast.info(isBn ? "টেমপ্লেট ব্যবহার করা হয়েছে (AI অনুপলব্ধ)" : "Template used (AI unavailable)");
    } catch { toast.error(isBn ? "কভার লেটার তৈরি করতে ব্যর্থ" : "Failed to generate cover letter"); }
    finally { setGeneratingCover(false); }
  };

  const handleSave = async () => {
    if (!isAuthenticated) { toast.error(isBn ? "লগইন করুন" : "Please login first"); return; }
    setSavingJob(true);
    try {
      const res = await api.post(`/candidate/toggle-save/${jobId}`);
      const saved = res.data?.data?.saved ?? res.data?.saved;
      toast.success(saved ? (isBn ? "সেভ" : "Saved") : (isBn ? "আনসেভ" : "Unsaved"));
      refetchSavedJobs();
    } catch { toast.error(isBn ? "সেভ করতে ব্যর্থ" : "Failed to save job"); }
    finally { setSavingJob(false); }
  };

  const handleReport = async () => {
    if (!isAuthenticated) { toast.error(isBn ? "লগইন করুন" : "Please login to report"); return; }
    if (!reportReason) { toast.error(isBn ? "কারণ নির্বাচন করুন" : "Select a reason"); return; }
    setSubmittingReport(true);
    try {
      await api.post("/reports", { reportable_type: "job", reportable_id: Number(jobId), reason: reportReason, description: reportDescription });
      toast.success(isBn ? "রিপোর্ট জমা!" : "Report submitted!");
      setShowReportDialog(false); setReportReason(""); setReportDescription("");
    } catch (err: any) { toast.error(err.response?.data?.message || (isBn ? "ব্যর্থ" : "Failed")); }
    finally { setSubmittingReport(false); }
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-background py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Skeleton className="h-6 w-32 mb-4" /><Skeleton className="h-10 w-2/3 mb-3" /><Skeleton className="h-5 w-1/2" />
          </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6">
            <div className="space-y-4"><Skeleton className="h-64 w-full" /><Skeleton className="h-48 w-full" /></div>
            <div className="space-y-4"><Skeleton className="h-8 w-1/2" /><Skeleton className="h-64 w-full" /></div>
            <div className="space-y-4"><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!job) {
    return (
      <PublicLayout>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-2xl font-bold mb-4">{isBn ? "চাকরি পাওয়া যায়নি" : "Job not found"}</h2>
          <Button asChild><Link href="/jobs"><ArrowLeft className="h-4 w-4 mr-2" />Back</Link></Button>
        </div>
      </PublicLayout>
    );
  }

  const promoInfo = getPromotionInfo(job);
  const promoBadge = promoInfo ? getPromotionBadgeConfig(promoInfo.type, isBn) : null;
  const matchScore = matchData?.score || matchData?.match_score;
  const matchedSkills = matchData?.matched_skills || matchData?.analysis?.matched_skills || [];
  const missingSkills = matchData?.missing_skills || matchData?.analysis?.missing_skills || [];
  const companyName = typeof job.company === "object" ? job.company?.name : job.company;
  const companySlug = typeof job.company === "object" ? (job.company?.slug || job.company?.id || "") : "";
  const companyLogo = typeof job.company === "object" ? job.company?.logo : null;
  const companyLocation = typeof job.company === "object" ? job.company?.location : null;
  const skills = (job.required_skills || []).filter(Boolean);
  const salaryDisplay = job.salary_range || (job.salary_min ? `${formatCurrency(job.salary_min)}${job.salary_max ? ` - ${formatCurrency(job.salary_max)}` : ""}` : null);

  return (
    <PublicLayout>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "JobPosting", title: job.title, description: job.description, datePosted: job.created_at, validThrough: job.deadline, employmentType: job.job_type?.toUpperCase()?.replace("-", "_"), hiringOrganization: { "@type": "Organization", name: companyName, logo: companyLogo }, jobLocation: { "@type": "Place", address: { "@type": "PostalAddress", addressLocality: job.location } } }) }} />

      {/* Hero */}
      <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" asChild className="mb-3"><Link href="/jobs"><ArrowLeft className="h-4 w-4 mr-1" />{isBn ? "ফিরে যান" : "Back to Jobs"}</Link></Button>

          {promoBadge && (
            <div className={`flex items-center gap-3 p-3 rounded-xl mb-4 ${promoBadge.color} text-white shadow-md`}>
              <promoBadge.icon className="h-5 w-5 shrink-0" />
              <div className="flex-1"><p className="font-bold text-sm">{promoBadge.label}</p><p className="text-xs text-white/80">{promoBadge.desc}</p></div>
              <Badge className="bg-white/20 text-white border-0 text-[10px] shrink-0">{isBn ? "প্রচারিত" : "Promoted"}</Badge>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-start gap-4">
              {companyLogo && <img src={companyLogo} alt={companyName || ""} className="w-14 h-14 rounded-xl object-cover border shadow-sm" />}
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                  {companyName && <Link href={`/companies/${companySlug}`} className="flex items-center gap-1 hover:text-primary font-medium"><Building2 className="h-4 w-4" />{companyName}</Link>}
                  {job.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{job.location}</span>}
                  <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{formatDate(job.created_at || "")}</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant="secondary" className="gap-1"><Briefcase className="h-3 w-3" />{job.job_type}</Badge>
                  {job.experience_level && <Badge variant="secondary" className="gap-1"><Target className="h-3 w-3" />{job.experience_level}</Badge>}
                  {job.is_remote_project && <Badge variant="secondary" className="gap-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"><Globe className="h-3 w-3" />Remote</Badge>}
                  {salaryDisplay && <Badge variant="secondary" className="gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"><DollarSign className="h-3 w-3" />{salaryDisplay}</Badge>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="icon" onClick={handleSave} disabled={savingJob}><Bookmark className={`h-4 w-4 ${savedJobIds.has(String(jobId)) ? "fill-primary text-primary" : ""}`} /></Button>
              <DropdownMenu open={showShareMenu} onOpenChange={setShowShareMenu}>
                <DropdownMenuTrigger asChild><Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success(isBn ? "লিংক কপি" : "Link copied!"); setShowShareMenu(false); }}>Copy Link</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank'); setShowShareMenu(false); }}>Facebook</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { window.open(`https://wa.me/?text=${encodeURIComponent(`${job?.title || ''} ${window.location.href}`)}`, '_blank'); setShowShareMenu(false); }}>WhatsApp</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="outline" size="icon" onClick={() => setShowReportDialog(true)}><Flag className="h-4 w-4 text-muted-foreground" /></Button>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr_300px] gap-6">
          {/* Left: Job Info */}
          <div className="space-y-4 order-3 lg:order-3">
            <Card className="border-primary/20 shadow-md">
              <CardContent className="p-6 space-y-4">
                {isAuthenticated && user?.role === "candidate" && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">{isBn ? "AI ম্যাচ স্কোর" : "AI Match Score"}</span></div>
                      {matchData ? <span className={`text-lg font-bold ${(matchScore || 0) >= 70 ? "text-emerald-600" : (matchScore || 0) >= 40 ? "text-amber-600" : "text-red-500"}`}>{matchScore || 0}%</span> : <span className="text-lg font-bold text-muted-foreground">--%</span>}
                    </div>
                  </div>
                )}
                {isAuthenticated && user?.role === "candidate" ? (
                  <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
                    <Button className="w-full" size="lg" onClick={handleApplyClick}><Send className="h-4 w-4 mr-2" />{isBn ? "এখনই আবেদন করুন" : "Apply Now"}</Button>
                    <DialogContent>
                      <DialogHeader><DialogTitle>{isBn ? "আবেদন জমা" : "Apply"}</DialogTitle></DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between"><Label>{isBn ? "কভার লেটার" : "Cover Letter"}</Label><Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={handleGenerateCoverLetter} disabled={generatingCover}>{generatingCover ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}{isBn ? "AI তৈরি" : "AI Generate"}</Button></div>
                          <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} rows={5} className="mt-1" />
                        </div>
                        {job?.is_remote_project && <div><Label>{isBn ? "ডেলিভারি দিন" : "Delivery Days"}</Label><Input type="number" value={deliveryDays} onChange={(e) => setDeliveryDays(e.target.value)} min="1" className="mt-1" /></div>}
                        <div><Label>{isBn ? "পোর্টফোলিও" : "Portfolio Link"}</Label><Input placeholder="https://..." value={portfolioLink} onChange={(e) => setPortfolioLink(e.target.value)} className="mt-1" /></div>
                        <Button onClick={handleApply} disabled={applyMutation.isPending} className="w-full">{applyMutation.isPending ? (isBn ? "জমা দিচ্ছে..." : "Submitting...") : (isBn ? "জমা দিন" : "Submit")}</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : !isAuthenticated ? (
                  <Button className="w-full" size="lg" asChild><Link href="/login">{isBn ? "আবেদন করুন" : "Apply"}</Link></Button>
                ) : null}
                {salaryDisplay && <div className="text-center"><p className="text-xs text-muted-foreground">{isBn ? "বেতন" : "Salary"}</p><p className="text-lg font-bold text-primary">{salaryDisplay}</p></div>}
              </CardContent>
            </Card>

            {skills.length > 0 && <Card><CardHeader className="pb-3"><CardTitle className="text-base">{isBn ? "প্রয়োজনীয় দক্ষতা" : "Required Skills"}</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{skills.map((skill: string, i: number) => <Badge key={i} variant="secondary" className="text-xs">{skill}</Badge>)}</div></CardContent></Card>}

            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-5 space-y-3">
                <h3 className="font-semibold text-sm flex items-center gap-2"><Zap className="h-4 w-4 text-primary" />{isBn ? "দ্রুত তথ্য" : "Quick Facts"}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><CheckCircle className="h-3.5 w-3.5 text-emerald-500" />{isBn ? "সক্রিয় পোস্ট" : "Active posting"}</div>
                  {promoBadge && <div className="flex items-center gap-2"><Rocket className="h-3.5 w-3.5 text-amber-500" />{isBn ? "প্রচারিত চাকরি" : "Promoted job"}</div>}
                  {job.is_remote_project && <div className="flex items-center gap-2"><Globe className="h-3.5 w-3.5 text-purple-500" />{isBn ? "রিমোট কাজ" : "Remote friendly"}</div>}
                  <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-amber-500" />{isBn ? "দ্রুত প্রতিক্রিয়া" : "Quick response"}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center: Job Content */}
          <div className="space-y-6 order-1 lg:order-2">
            <div className="flex gap-1 p-1 bg-muted rounded-lg">
              {[
                { key: "overview" as const, label: isBn ? "ওভারভিউ" : "Overview" },
                { key: "requirements" as const, label: isBn ? "যোগ্যতা" : "Requirements" },
                { key: "company" as const, label: isBn ? "কোম্পানি" : "Company" },
              ].map((tab) => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all cursor-pointer ${activeTab === tab.key ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}>{tab.label}</button>))}
            </div>
            {activeTab === "overview" && (<div className="space-y-6">
              {job.job_summary && <Card><CardHeader><CardTitle>{isBn ? "সারসংক্ষেপ" : "Summary"}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.job_summary}</p></CardContent></Card>}
              <Card><CardHeader><CardTitle>{isBn ? "বিবরণ" : "Description"}</CardTitle></CardHeader><CardContent><div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.description || "") }} /></CardContent></Card>
              {job.responsibilities && <Card><CardHeader><CardTitle>{isBn ? "দায়িত্ব" : "Responsibilities"}</CardTitle></CardHeader><CardContent><div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.responsibilities) }} /></CardContent></Card>}
              {job.benefits && <Card><CardHeader><CardTitle>{isBn ? "সুবিধা" : "Benefits"}</CardTitle></CardHeader><CardContent><div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.benefits) }} /></CardContent></Card>}
              {(job.contact_person_name || job.contact_email || job.contact_phone) && (
                <Card><CardHeader><CardTitle>{isBn ? "যোগাযোগের তথ্য" : "Contact Info"}</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {job.contact_person_name && <p><span className="text-muted-foreground">{isBn ? "যোগাযোগকারী" : "Contact"}:</span> {job.contact_person_name}</p>}
                    {job.contact_email && <p><span className="text-muted-foreground">Email:</span> {job.contact_email}</p>}
                    {job.contact_phone && <p><span className="text-muted-foreground">{isBn ? "ফোন" : "Phone"}:</span> {job.contact_phone}</p>}
                  </CardContent>
                </Card>
              )}
              {(job.application_method || job.application_url || job.application_email) && (
                <Card><CardHeader><CardTitle>{isBn ? "আবেদনের পদ্ধতি" : "How to Apply"}</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    <p><span className="text-muted-foreground">{isBn ? "পদ্ধতি" : "Method"}:</span> {job.application_method === 'external' ? (isBn ? "বহিঃস্থ লিংক" : "External Link") : job.application_method === 'email' ? "Email" : (isBn ? "প্ল্যাটফর্মের মাধ্যমে" : "Via Platform")}</p>
                    {job.application_url && <p><span className="text-muted-foreground">URL:</span> <a href={job.application_url} target="_blank" rel="noreferrer" className="text-primary underline">{job.application_url}</a></p>}
                    {job.application_email && <p><span className="text-muted-foreground">Email:</span> {job.application_email}</p>}
                  </CardContent>
                </Card>
              )}
            </div>)}
            {activeTab === "requirements" && (<div className="space-y-6">
              {job.experience_requirements && <Card><CardHeader><CardTitle>{isBn ? "অভিজ্ঞতার প্রয়োজনীয়তা" : "Experience Requirements"}</CardTitle></CardHeader><CardContent><div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.experience_requirements) }} /></CardContent></Card>}
              {job.education_requirements && <Card><CardHeader><CardTitle>{isBn ? "শিক্ষাগত যোগ্যতা" : "Education Requirements"}</CardTitle></CardHeader><CardContent><div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.education_requirements) }} /></CardContent></Card>}
              {job.additional_requirements && <Card><CardHeader><CardTitle>{isBn ? "অতিরিক্ত প্রয়োজনীয়তা" : "Additional Requirements"}</CardTitle></CardHeader><CardContent><div className="prose prose-sm dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(job.additional_requirements) }} /></CardContent></Card>}
              {skills.length > 0 && <Card><CardHeader><CardTitle>{isBn ? "দক্ষতা" : "Skills"}</CardTitle></CardHeader><CardContent><div className="flex flex-wrap gap-2">{skills.map((s: string, i: number) => <Badge key={i} variant="secondary">{s}</Badge>)}</div></CardContent></Card>}
              {(job.min_age || job.max_age || job.gender_preference) && (
                <Card><CardHeader><CardTitle>{isBn ? "প্রার্থীর সংক্রান্ত" : "Candidate Criteria"}</CardTitle></CardHeader>
                  <CardContent className="text-sm space-y-1">
                    {(job.min_age || job.max_age) && <p><span className="text-muted-foreground">{isBn ? "বয়স" : "Age"}:</span> {job.min_age || "?"} - {job.max_age || "?"} {isBn ? "বছর" : "years"}</p>}
                    {job.gender_preference && job.gender_preference !== 'any' && <p><span className="text-muted-foreground">{isBn ? "লিঙ্গ" : "Gender"}:</span> {job.gender_preference}</p>}
                  </CardContent>
                </Card>
              )}
              {job.language_skills && job.language_skills.length > 0 && (
                <Card><CardHeader><CardTitle>{isBn ? "ভাষা দক্ষতা" : "Language Skills"}</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">{job.language_skills.map((lang: string, i: number) => <Badge key={i} variant="secondary">{lang}</Badge>)}</div></CardContent>
                </Card>
              )}
              {job.required_certifications && job.required_certifications.length > 0 && (
                <Card><CardHeader><CardTitle>{isBn ? "প্রয়োজনীয় সার্টিফিকেট" : "Required Certifications"}</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">{job.required_certifications.map((cert: string, i: number) => <Badge key={i} variant="outline">{cert}</Badge>)}</div></CardContent>
                </Card>
              )}
              {job.driving_license_required && <p className="text-xs text-muted-foreground flex items-center gap-1"><Shield className="h-3 w-3" />{isBn ? "ড্রাইভিং লাইসেন্স প্রয়োজন" : "Driving license required"}</p>}
              {job.required_documents && job.required_documents.length > 0 && (
                <Card><CardHeader><CardTitle>{isBn ? "প্রয়োজনীয় ডকুমেন্ট" : "Required Documents"}</CardTitle></CardHeader>
                  <CardContent><div className="flex flex-wrap gap-2">{job.required_documents.map((doc: string, i: number) => <Badge key={i} variant="secondary">{doc}</Badge>)}</div></CardContent>
                </Card>
              )}
            </div>)}
            {activeTab === "company" && (<div className="space-y-6">
              {typeof job.company === "object" && job.company ? (
                <Card><CardContent className="p-6"><div className="flex items-start gap-4">
                  {companyLogo && <img src={companyLogo} alt={companyName || ""} className="w-16 h-16 rounded-xl object-cover border" />}
                  <div className="flex-1"><h3 className="text-lg font-bold">{companyName}</h3>{companyLocation && <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1"><MapPin className="h-3.5 w-3.5" />{companyLocation}</p>}
                    <div className="flex gap-2 mt-4"><Button variant="outline" size="sm" asChild><Link href={`/companies/${companySlug}`}><ExternalLink className="h-3.5 w-3.5 mr-1" />{isBn ? "প্রোফাইল" : "View Profile"}</Link></Button></div>
                  </div>
                </div></CardContent></Card>
              ) : <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">{companyName || "—"}</p></CardContent></Card>}
            </div>)}
            {isAuthenticated && user?.role === "candidate" && matchData && (
              <Card className="border-primary/20"><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-base"><Sparkles className="h-4 w-4 text-primary" />{isBn ? "AI ম্যাচ স্কোর" : "AI Match Score"}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center border-4 ${(matchScore || 0) >= 70 ? "border-emerald-500 bg-emerald-50" : (matchScore || 0) >= 40 ? "border-amber-500 bg-amber-50" : "border-red-500 bg-red-50"}`}><span className={`text-xl font-bold ${(matchScore || 0) >= 70 ? "text-emerald-600" : (matchScore || 0) >= 40 ? "text-amber-600" : "text-red-600"}`}>{matchScore || 0}%</span></div>
                    <div className="flex-1"><p className="text-sm font-semibold">{(matchScore || 0) >= 70 ? "Great match!" : (matchScore || 0) >= 40 ? "Good match" : "Weak match"}</p></div>
                  </div>
                  {matchedSkills.length > 0 && <div><p className="text-xs font-medium text-emerald-600 mb-2 flex items-center gap-1"><CheckCircle className="h-3 w-3" />Matching skills</p><div className="flex flex-wrap gap-1.5">{matchedSkills.map((s: string) => <Badge key={s} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">{s}</Badge>)}</div></div>}
                  {missingSkills.length > 0 && <div><p className="text-xs font-medium text-amber-600 mb-2 flex items-center gap-1"><AlertTriangle className="h-3 w-3" />Missing skills</p><div className="flex flex-wrap gap-1.5">{missingSkills.map((s: string) => <Badge key={s} variant="outline" className="text-xs border-amber-300 text-amber-600">{s}</Badge>)}</div></div>}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right: Company + Stats */}
          <div className="space-y-4 order-1 lg:order-1">
            {typeof job.company === "object" && job.company && (
              <Card><CardContent className="p-5"><h3 className="font-semibold mb-3 text-sm">{isBn ? "কোম্পানি" : "Company"}</h3><Link href={`/companies/${companySlug}`} className="flex items-center gap-3 group">
                {companyLogo && <img src={companyLogo} alt={companyName || ""} className="w-12 h-12 rounded-lg object-cover border" />}
                <div className="flex-1 min-w-0"><p className="font-medium text-sm group-hover:text-primary transition-colors truncate">{companyName}</p>{companyLocation && <p className="text-xs text-muted-foreground">{companyLocation}</p>}</div>
                <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link></CardContent></Card>
            )}
            <Card><CardContent className="p-5">
              <h3 className="font-semibold mb-3 text-sm">{isBn ? "কিভাবে কাজ করে" : "How it Works"}</h3>
              <div className="space-y-3">{[{ icon: Search, text: isBn ? "চাকরি খুঁজুন" : "Find a job" }, { icon: Send, text: isBn ? "আবেদন করুন" : "Apply" }, { icon: CheckCircle, text: isBn ? "নিয়োগ পান" : "Get hired" }].map((step, i) => <div key={i} className="flex items-center gap-3"><div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0"><step.icon className="h-3.5 w-3.5 text-primary" /></div><span className="text-sm text-muted-foreground">{step.text}</span></div>)}</div>
            </CardContent></Card>
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <CardContent className="p-5 text-center space-y-2">
                <Shield className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
                <h3 className="font-semibold text-sm">{isBn ? "নিরাপদ প্ল্যাটফর্ম" : "Secure Platform"}</h3>
                <p className="text-xs text-muted-foreground">{isBn ? "সকল তথ্য এনক্রিপ্টেড" : "All data encrypted"}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{isBn ? "রিপোর্ট" : "Report Job"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>{isBn ? "কারণ" : "Reason"} *</Label><select value={reportReason} onChange={(e) => setReportReason(e.target.value)} className="w-full h-9 rounded-md border bg-background px-3 text-sm"><option value="">{isBn ? "নির্বাচন" : "Select"}</option><option value="spam">Spam</option><option value="scam">Scam</option><option value="fake">Fake</option><option value="duplicate">Duplicate</option><option value="other">Other</option></select></div>
            <div><Label>{isBn ? "বিস্তারিত" : "Description"}</Label><Textarea rows={3} value={reportDescription} onChange={(e) => setReportDescription(e.target.value)} /></div>
            <div className="flex gap-2 justify-end"><Button variant="outline" onClick={() => setShowReportDialog(false)}>{isBn ? "বাতিল" : "Cancel"}</Button><Button variant="destructive" onClick={handleReport} disabled={submittingReport || !reportReason}>{isBn ? "জমা দিন" : "Submit"}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </PublicLayout>
  );
}