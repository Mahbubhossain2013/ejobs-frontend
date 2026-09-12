"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/theme-store";
import { resumeService, DEFAULT_FALLBACK_TEMPLATES } from "@/services/resume.service";
import { subscriptionService, type QuotaInfo } from "@/services/subscription.service";
import api from "@/lib/api-client";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TemplatePurchaseDialog from "@/components/cv/TemplatePurchaseDialog";
import PersonalInfoModal from "@/components/cv/PersonalInfoModal";
import TemplateCard from "@/components/cv/TemplateCard";
import {
  FileText, Download, Sparkles, Plus, Loader2, Copy, Share2,
  Trash2, Clock, Eye, Crown, Zap, Shield,
  ArrowRight, Wallet, Bot, ChevronDown, ChevronUp,
  Briefcase, BookOpen, Languages, PenTool,
  Check, X,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { CvProfile, CvTemplate, Resume, Subscription } from "@/types";
import { TEMPLATE_GRADIENTS, FAQ_ITEMS } from "@/constants/cv-builder";
import TemplateThumbnail from "@/components/cv/TemplateThumbnail";
import { downloadCvAsPdf } from "@/lib/cv-pdf-generator";
import { getStoredResumes, storeResumes, profileDataToEditorData } from "@/lib/cv-builder-utils";

export default function CvBuilderClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();

  useEffect(() => {
    document.title = isBn ? "CV বিল্ডার | জব পোর্টাল" : "CV Builder | Job Portal";
  }, [isBn]);

  const [templates, setTemplates] = useState<CvTemplate[]>(DEFAULT_FALLBACK_TEMPLATES);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [profile, setProfile] = useState<CvProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [quota, setQuota] = useState<QuotaInfo | null>(null);

  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<CvProfile | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [purchaseTemplate, setPurchaseTemplate] = useState<CvTemplate | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [pendingTemplateSlug, setPendingTemplateSlug] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [templatesData, profileData] = await Promise.all([
        resumeService.getTemplates().catch(() => []),
        resumeService.getProfile().catch(() => null),
      ]);
      setTemplates(templatesData);
      if (profileData) setProfile(profileData);

      let apiResumes: any[] = [];
      try {
        const result = await resumeService.getResumes();
        apiResumes = Array.isArray(result) ? result : [];
      } catch { apiResumes = []; }

      const stored = getStoredResumes();
      const apiMap = new Map(apiResumes.map((r: any) => [r.uuid, r]));
      const merged = [...apiMap.values(), ...stored.filter((r) => !apiMap.has(r.uuid))];
      setResumes(merged);
      storeResumes(merged);
    } catch {} finally { setLoading(false); }
  }, []);

  const loadSubscription = useCallback(async () => {
    try {
      const result = await subscriptionService.getMySubscriptionWithQuotas();
      setSubscription(result.subscription);
      if (result.quotas.ai_career_tools) setQuota(result.quotas.ai_career_tools);
    } catch {}
  }, []);

  const purchasedTemplateSlugs = React.useMemo(
    () => new Set(resumes.map((r) => r.template_slug).filter(Boolean)),
    [resumes]
  );

  useEffect(() => { loadData(); loadSubscription(); }, [loadData, loadSubscription]);

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    setAiResult(null);
    try {
      const result = await resumeService.generateWithAi(aiPrompt);
      if (result.status) {
        setAiResult(result.data);
        toast.success(isBn ? "সিভি প্রোফাইল তৈরি হয়েছে!" : "CV profile generated!");
      } else {
        toast.error(result.message || (isBn ? "ব্যর্থ" : "Generation failed"));
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || (isBn ? "ব্যর্থ" : "Generation failed"));
    } finally { setGenerating(false); }
  };

  const handleSaveProfile = async () => {
    const profileToSave = aiResult || profile;
    if (!profileToSave) return;
    try {
      await resumeService.updateProfile(profileToSave);
      setProfile(profileToSave);
      setAiResult(null);
      toast.success(isBn ? "প্রোফাইল সংরক্ষিত হয়েছে" : "Profile saved!");
    } catch { toast.error(isBn ? "সংরক্ষণ ব্যর্থ" : "Save failed"); }
  };

  const handleUseTemplate = async (template: CvTemplate) => {
    if (template.is_premium && !purchasedTemplateSlugs.has(template.slug)) {
      setPurchaseTemplate(template);
      return;
    }
    const hasAuth = (() => {
      if (typeof window === "undefined") return false;
      try {
        const raw = localStorage.getItem("auth-storage");
        if (!raw) return false;
        return !!JSON.parse(raw)?.state?.token;
      } catch { return false; }
    })();
    if (!hasAuth) {
      router.push("/login?redirect=" + encodeURIComponent("/resume-builder"));
      return;
    }
    const hasProfile = profile && (
      profile.personal_info?.full_name ||
      profile.personal_info?.email ||
      (profile.skills && profile.skills.length > 0) ||
      (profile.experience && profile.experience.length > 0)
    );
    if (!hasProfile) {
      setPendingTemplateSlug(template.slug);
      setShowPersonalInfoModal(true);
      return;
    }
    router.push(`/resume-builder/edit/${template.slug}`);
  };

  const handlePersonalInfoModalComplete = async () => {
    setShowPersonalInfoModal(false);
    try {
      const profileData = await resumeService.getProfile();
      if (profileData) setProfile(profileData);
    } catch {}
    if (pendingTemplateSlug) {
      const slug = pendingTemplateSlug;
      setPendingTemplateSlug(null);
      router.push(`/resume-builder/edit/${slug}`);
    }
  };

  const handleDownloadPdf = async (uuid: string) => {
    try {
      toast.info(isBn ? "উচ্চমানের PDF তৈরি হচ্ছে..." : "Preparing high-quality PDF...");
      let html = "";
      try {
        html = await resumeService.renderPreview(uuid);
      } catch {}

      if (html && html.length > 50) {
        await downloadCvAsPdf(html, `resume-${uuid}`);
        toast.success(isBn ? "🎉 PDF ডাউনলোড সম্পন্ন হয়েছে!" : "🎉 PDF downloaded successfully!");
        return;
      }

      window.open(`/cv/preview/${uuid}`, "_blank");
    } catch {
      window.open(`/cv/preview/${uuid}`, "_blank");
    }
  };

  const handleShareToggle = async (resume: Resume) => {
    const newPublicState = !resume.is_public;
    try {
      const result = await resumeService.shareResume(resume.uuid, { is_public: newPublicState });
      const updated = resumes.map((r) => r.uuid === resume.uuid ? { ...r, is_public: newPublicState } : r);
      setResumes(updated); storeResumes(updated);
      toast.success(newPublicState ? (isBn ? "পাবলিক লিঙ্ক তৈরি হয়েছে" : "Share link created") : (isBn ? "পাবলিক লিঙ্ক বন্ধ হয়েছে" : "Share link disabled"));
    } catch { toast.error(isBn ? "ব্যর্থ" : "Failed"); }
  };

  const handleCopyLink = async (resume: Resume) => {
    try { await navigator.clipboard.writeText(`${window.location.origin}/cv/share/${resume.uuid}`); toast.success(isBn ? "লিঙ্ক কপি হয়েছে" : "Link copied!"); }
    catch { toast.error(isBn ? "কপি ব্যর্থ" : "Copy failed"); }
  };

  const handleGetShareLink = async (resume: Resume) => {
    try {
      const result = await resumeService.getShareLink(resume.uuid);
      if (result?.share_url) {
        await navigator.clipboard.writeText(result.share_url);
        const updated = resumes.map((r) => r.uuid === resume.uuid ? { ...r, is_public: true, share_url: result.share_url } : r);
        setResumes(updated); storeResumes(updated);
        toast.success(isBn ? "শেয়ার লিঙ্ক তৈরি ও কপি হয়েছে!" : "Share link created and copied!");
      }
    } catch { toast.error(isBn ? "শেয়ার লিঙ্ক তৈরি ব্যর্থ" : "Failed"); }
  };

  const handleDeleteResume = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await resumeService.deleteResume(deleteTarget.uuid);
      const updated = resumes.filter((r) => r.uuid !== deleteTarget.uuid);
      setResumes(updated); storeResumes(updated);
      toast.success(isBn ? "মুছে ফেলা হয়েছে" : "Deleted");
    } catch { toast.error(isBn ? "মুছে ফেলা যায়নি" : "Delete failed"); }
    finally { setDeleting(false); setDeleteTarget(null); }
  };

  const handleEditTemplate = (template: CvTemplate) => {
    router.push(`/resume-builder/edit/${template.slug}`);
  };

  const quotaReached = quota && quota.max_limit > 0 && quota.remaining <= 0;

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-background border-b">
          <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge variant="secondary" className="mb-4 px-4 py-1.5 text-sm">
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                {isBn ? "AI-চালিত সিভি বিল্ডার" : "AI-Powered CV Builder"}
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                {isBn ? "তৈরি করুন একটি" : "Build a"}{" "}
                <span className="text-primary">{isBn ? "পেশাদার" : "Professional"}</span>{" "}
                {isBn ? "সিভি মিনিটে" : "Resume in Minutes"}
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                {isBn ? "আমাদের প্রিমিয়াম টেমপ্লেট, AI-চালিত টুলস এবং সহজ ইনলাইন এডিটর দিয়ে ATS-বান্ধব CV তৈরি করুন।" : "Create an ATS-friendly resume using our premium templates, AI-powered tools, and easy inline editor."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button size="lg" className="px-8 text-base" onClick={() => { document.getElementById("templates-section")?.scrollIntoView({ behavior: "smooth" }); }}>
                  <FileText className="h-5 w-5 mr-2" />{isBn ? "এখনই শুরু করুন" : "Start Building"}<ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button size="lg" variant="outline" className="px-8 text-base" onClick={() => { document.getElementById("my-cvs-section")?.scrollIntoView({ behavior: "smooth" }); }}>
                  <Eye className="h-5 w-5 mr-2" />{isBn ? "আমার সিভি" : "My CVs"} ({resumes.length})
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 border-b bg-muted/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">{isBn ? "কিভাবে কাজ করে" : "How It Works"}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{isBn ? "মাত্র ৩টি সহজ ধাপে আপনার পেশাদার CV তৈরি করুন" : "Create your professional CV in just 3 simple steps"}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: "1", icon: FileText, t_en: "Choose Template", t_bn: "টেমপ্লেট বাছুন", d_en: "Pick from ATS-friendly templates", d_bn: "পেশাদার, ATS-বান্ধব টেমপ্লেট থেকে বাছুন" },
                { step: "2", icon: PenTool, t_en: "Fill Your Details", t_bn: "তথ্য পূরণ করুন", d_en: "Use the smart form or AI assistant", d_bn: "আমাদের স্মার্ট ফর্ম বা AI সহকারী ব্যবহার করে তথ্য যোগ করুন" },
                { step: "3", icon: Download, t_en: "Download & Share", t_bn: "ডাউনলোড ও শেয়ার", d_en: "Export as PDF or get a shareable link", d_bn: "PDF হিসেবে এক্সপোর্ট করুন বা শেয়ারযোগ্য লিঙ্ক পান" },
              ].map((item, i) => (
                <div key={i} className="relative text-center p-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><item.icon className="h-7 w-7 text-primary" /></div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">{item.step}</div>
                  <h3 className="font-semibold text-lg mb-2">{isBn ? item.t_bn : item.t_en}</h3>
                  <p className="text-sm text-muted-foreground">{isBn ? item.d_bn : item.d_en}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Templates */}
        <section id="templates-section" className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">{isBn ? "টেমপ্লেট বাছাই করুন" : "Choose a Template"}</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">{isBn ? "সকল টেমপ্লেট ATS-বান্ধব" : "All templates are ATS-friendly"}</p>
            </div>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}</div>
            ) : templates.length === 0 ? (
              <Card><CardContent className="p-12 text-center"><FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground text-lg">{isBn ? "কোনো টেমপ্লেট পাওয়া যায়নি" : "No templates found"}</p></CardContent></Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {templates.map((template, idx) => (
                  <TemplateCard key={template.id} template={template} index={idx} isBn={isBn} isPurchased={purchasedTemplateSlugs.has(template.slug)} creating={creating} onUse={handleUseTemplate} onStartEdit={handleEditTemplate} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Why Use */}
        <section className="py-16 bg-muted/30 border-y">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12"><h2 className="text-2xl md:text-3xl font-bold mb-3">{isBn ? "কেন আমাদের CV বিল্ডার" : "Why Use Our CV Builder"}</h2></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {[
                { icon: Sparkles, t: isBn ? "AI-চালিত" : "AI-Powered", d: isBn ? "AI দিয়ে CV তৈরি করুন।" : "Generate CV content with AI." },
                { icon: Shield, t: isBn ? "ATS-বান্ধব" : "ATS-Friendly", d: isBn ? "টেমপ্লেট ATS পাস করে।" : "Templates pass ATS." },
                { icon: Eye, t: isBn ? "লাইভ প্রিভিউ" : "Live Preview", d: isBn ? "রিয়েল-টাইমে পরিবর্তন দেখুন।" : "See changes in real-time." },
                { icon: Download, t: isBn ? "PDF এক্সপোর্ট" : "PDF Export", d: isBn ? "PDF ডাউনলোড করুন।" : "Download as print-ready PDF." },
                { icon: Share2, t: isBn ? "শেয়ারযোগ্য লিঙ্ক" : "Shareable Links", d: isBn ? "রিক্রুটারদের সাথে শেয়ার করুন।" : "Share CV with recruiters." },
                { icon: Languages, t: isBn ? "দ্বিভাষিক" : "Bilingual", d: isBn ? "ইংরেজি ও বাংলায়।" : "English & Bengali CV." },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-xl bg-background border hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4"><item.icon className="h-6 w-6 text-primary" /></div>
                  <h3 className="font-semibold text-lg mb-2">{item.t}</h3>
                  <p className="text-sm text-muted-foreground">{item.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Generate */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
              <Card className="border-primary/20 shadow-lg">
                <CardHeader><CardTitle className="flex items-center gap-2 text-xl"><Bot className="h-6 w-6 text-primary" />{isBn ? "AI দিয়ে CV তৈরি করুন" : "Generate CV with AI"}</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {quota && <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"><div className="flex items-center gap-2"><Zap className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{isBn ? "AI ব্যবহার" : "AI Usage"}</span></div><div className="text-sm text-muted-foreground">{quota.used}/{quota.max_limit} {isBn ? "ব্যবহৃত" : "used"}</div></div>}
                  <p className="text-sm text-muted-foreground">{isBn ? "আপনার অভিজ্ঞতা লিখুন। AI CV তৈরি করবে।" : "Describe your experience. AI will build your CV."}</p>
                  <Textarea className="min-h-[120px]" placeholder={isBn ? "আমি ৩ বছরের React Developer..." : "I'm a React developer with 3 years experience..."} value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} disabled={generating} />
                  <Button onClick={handleAiGenerate} disabled={generating || !aiPrompt.trim() || !!quotaReached} className="w-full" size="lg">
                    {generating ? <><Loader2 className="h-5 w-5 mr-2 animate-spin" />{isBn ? "তৈরি হচ্ছে..." : "Generating..."}</> : <><Sparkles className="h-5 w-5 mr-2" />{isBn ? "সিভি তৈরি করুন" : "Generate CV"}</>}
                  </Button>
                  {generating && <div className="flex flex-col items-center py-8"><div className="relative"><div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><Sparkles className="h-8 w-8 text-primary animate-pulse" /></div><div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" /></div><p className="text-sm text-muted-foreground mt-3">{isBn ? "AI তৈরি করছে..." : "AI generating..."}</p></div>}
                  {aiResult && (
                    <Card className="border-green-200 dark:border-green-800">
                      <CardHeader><CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400"><Check className="h-5 w-5" />{isBn ? "জেনারেটেড প্রোফাইল" : "Generated Profile"}</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {aiResult.personal_info && <div><h3 className="font-semibold text-lg">{aiResult.personal_info.full_name}</h3><p className="text-sm text-muted-foreground">{aiResult.personal_info.title}</p></div>}
                        <div className="flex gap-2"><Button onClick={handleSaveProfile}><Check className="h-4 w-4 mr-2" />{isBn ? "সংরক্ষণ ও এডিট" : "Save & Edit"}</Button><Button variant="outline" onClick={() => setAiResult(null)}><X className="h-4 w-4 mr-2" />{isBn ? "বাতিল" : "Discard"}</Button></div>
                      </CardContent>
                    </Card>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* My CVs */}
        {resumes.length > 0 && (
          <section id="my-cvs-section" className="py-16 bg-muted/30 border-y">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-8"><h2 className="text-2xl font-bold">{isBn ? `আমার সিভি (${resumes.length})` : `My CVs (${resumes.length})`}</h2></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {resumes.map((resume, idx) => (
                  <Card key={resume.uuid} className="group hover:shadow-lg transition-all duration-200">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${TEMPLATE_GRADIENTS[idx % TEMPLATE_GRADIENTS.length]} flex items-center justify-center shrink-0`}><FileText className="h-5 w-5 text-white" /></div>
                          <div className="min-w-0"><h3 className="font-medium text-sm truncate">{resume.title}</h3><p className="text-xs text-muted-foreground capitalize">{resume.template_name || resume.template_slug || "Template"}</p></div>
                        </div>
                        {resume.is_public && <Badge variant="secondary" className="text-[10px] shrink-0"><Eye className="h-2.5 w-2.5 mr-0.5" />{isBn ? "পাবলিক" : "Public"}</Badge>}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{formatDate(resume.created_at)}</div>
                      <div className="flex items-center gap-1 pt-1 border-t">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/cv/preview/${resume.uuid}`)} title="View"><Eye className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownloadPdf(resume.uuid)} title="PDF"><Download className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleGetShareLink(resume)} title="Share"><Share2 className={`h-3.5 w-3.5 ${resume.is_public ? "text-primary" : ""}`} /></Button>
                        {resume.is_public && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyLink(resume)} title="Copy"><Copy className="h-3.5 w-3.5" /></Button>}
                        <div className="flex-1" />
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => setDeleteTarget(resume)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12"><h2 className="text-2xl md:text-3xl font-bold mb-3">{isBn ? "সচরাচর জিজ্ঞাসা" : "FAQ"}</h2></div>
            <div className="max-w-2xl mx-auto space-y-3">
              {FAQ_ITEMS.map((item, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className="border rounded-xl overflow-hidden">
                    <button className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                      <span className="font-medium text-sm pr-4">{isBn ? item.q_bn : item.q_en}</span>
                      {isOpen ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
                    </button>
                    {isOpen && <div className="px-4 pb-4 text-sm text-muted-foreground border-t"><p className="pt-3">{isBn ? item.a_bn : item.a_en}</p></div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{isBn ? "আজই CV তৈরি শুরু করুন" : "Start Building Today"}</h2>
            <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">{isBn ? "হাজারো ব্যবহারকারী আমাদের CV বিল্ডার ব্যবহার করছেন।" : "Thousands of users are building their resumes with our CV builder."}</p>
            <Button size="lg" variant="secondary" className="px-8" onClick={() => { document.getElementById("templates-section")?.scrollIntoView({ behavior: "smooth" }); }}>{isBn ? "এখনই শুরু করুন" : "Get Started Free"}<ArrowRight className="h-5 w-5 ml-2" /></Button>
          </div>
        </section>
      </div>

      {/* Template Modal */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{isBn ? "টেমপ্লেট বাছুন" : "Choose Template"}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
            {templates.map((template) => (
              <div key={template.id} className={`rounded-xl border-2 p-3 cursor-pointer transition-all hover:shadow-md ${selectedTemplate === template.slug ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`} onClick={() => setSelectedTemplate(template.slug)}>
                <div className="relative w-full overflow-hidden rounded-lg border bg-slate-100 dark:bg-slate-900 mb-2 shadow-inner" style={{ height: "180px" }}>
                  <TemplateThumbnail template={template} />
                </div>
                <p className="font-medium text-sm truncate">{template.name}</p>
                <div className="flex items-center justify-between mt-1"><Badge variant="outline" className="text-[10px] capitalize">{template.category}</Badge>{template.is_premium ? <Badge className="text-[10px] bg-amber-100 text-amber-700">{formatCurrency(template.price || 0)}</Badge> : <Badge className="text-[10px] bg-green-100 text-green-700">{isBn ? "ফ্রি" : "Free"}</Badge>}</div>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>{isBn ? "বাতিল" : "Cancel"}</Button>
            <Button disabled={!selectedTemplate || creating} onClick={() => { const t = templates.find((t) => t.slug === selectedTemplate); if (t) { setShowTemplateModal(false); handleUseTemplate(t); } }}>{creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{isBn ? "টেমপ্লেট বাছাই" : "Select"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>{isBn ? "মুছে ফেলুন?" : "Delete?"}</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{deleteTarget?.title}</p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="flex-1">{isBn ? "বাতিল" : "Cancel"}</Button>
            <Button variant="destructive" onClick={handleDeleteResume} disabled={deleting} className="flex-1">{deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{isBn ? "মুছুন" : "Delete"}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {purchaseTemplate && <TemplatePurchaseDialog template={purchaseTemplate} open={!!purchaseTemplate} onClose={() => setPurchaseTemplate(null)} onSuccess={loadData} />}
      <PersonalInfoModal open={showPersonalInfoModal} onClose={() => { setShowPersonalInfoModal(false); setPendingTemplateSlug(null); }} onComplete={handlePersonalInfoModalComplete} />
    </PublicLayout>
  );
}