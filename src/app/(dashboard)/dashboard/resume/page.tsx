"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import TemplateCard from "@/components/cv/TemplateCard";
import { useAuth } from "@/hooks/use-auth";
import { resumeService } from "@/services/resume.service";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TemplatePurchaseDialog from "@/components/cv/TemplatePurchaseDialog";
import TemplateThumbnail from "@/components/cv/TemplateThumbnail";
import {
  FileText,
  Plus,
  Download,
  Trash2,
  Copy,
  Share2,
  Sparkles,
  LayoutGrid,
  CreditCard,
  Clock,
  LinkIcon,
  Eye,
  X,
  CheckCircle,
  Loader2,
  Upload,
  FileUp,
  ExternalLink,
  Printer,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency, formatDate, getStorageUrl } from "@/lib/utils";
import { getApiErrorMessage } from "@/lib/api-client";
import type { CvTemplate, Resume } from "@/types";

const RESUME_STORAGE_KEY = "user_resumes";

function getStoredResumes(): Resume[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RESUME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function storeResumes(resumes: Resume[]) {
  try {
    localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resumes));
  } catch {
    // ignore
  }
}

export default function ResumePage() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();
  const { user } = useAuth();

  const [templates, setTemplates] = useState<CvTemplate[]>([]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchaseTemplate, setPurchaseTemplate] = useState<CvTemplate | null>(
    null
  );
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [selectedTemplateSlug, setSelectedTemplateSlug] = useState("");
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [shareTarget, setShareTarget] = useState<Resume | null>(null);
  const [copying, setCopying] = useState(false);
  const [uploadedResume, setUploadedResume] = useState<{ path: string; url: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
    if (user?.profile?.resume_path) {
      const p = user.profile.resume_path;
      setUploadedResume({
        path: p,
        url: getStorageUrl(p) || p,
      });
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const stored = getStoredResumes();

      let apiResumes: Resume[] = [];
      try {
        apiResumes = await resumeService.getResumes();
      } catch {
        // user might be offline or guest
      }

      const mergedMap = new Map<string, Resume>();
      if (Array.isArray(apiResumes)) {
        apiResumes.forEach((r) => {
          if (r?.uuid) mergedMap.set(r.uuid, r);
        });
      }
      if (Array.isArray(stored)) {
        stored.forEach((r) => {
          if (r?.uuid && !mergedMap.has(r.uuid)) {
            mergedMap.set(r.uuid, r);
          }
        });
      }

      const combined = Array.from(mergedMap.values()).sort(
        (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      );

      setResumes(combined);
      storeResumes(combined);

      const templatesData = await resumeService.getTemplates().catch(() => []);
      setTemplates(templatesData);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (file.type !== "application/pdf") {
      toast.error(isBn ? "শুধুমাত্র PDF ফাইল অনুমোদিত" : "Only PDF files are allowed");
      return;
    }
    if (file.size > 400 * 1024) {
      toast.error(isBn ? "ফাইল ৪০০KB এর কম হতে হবে" : "File must be under 400KB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const result = await resumeService.uploadResume(formData);
      setUploadedResume({ path: result.resume_path, url: result.resume_url });
      toast.success(isBn ? "সিভি আপলোড হয়েছে!" : "CV uploaded successfully!");
    } catch (e: any) {
      const msg = getApiErrorMessage(e, isBn ? "আপলোড ব্যর্থ" : "Upload failed");
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !selectedTemplateSlug) return;
    setCreating(true);
    try {
      const resume = await resumeService.createResume({
        title: newTitle.trim(),
        template_slug: selectedTemplateSlug,
      });
      const updated = [resume, ...resumes];
      setResumes(updated);
      storeResumes(updated);
      toast.success(isBn ? "সিভি তৈরি হয়েছে!" : "Resume created!");
      setCreateDialogOpen(false);
      setNewTitle("");
      setSelectedTemplateSlug("");
      router.push("/resume-builder");
    } catch (e: any) {
      if (e.response?.data?.action === 'redirect_to_builder') {
        toast.info(isBn ? "প্রথমে আপনার তথ্য পূরণ করুন" : "Please fill in your personal information first");
        router.push("/resume-builder");
        return;
      }
      toast.error(
        e.response?.data?.message || (isBn ? "ব্যর্থ হয়েছে" : "Failed")
      );
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await resumeService.deleteResume(deleteTarget.uuid);
      const updated = resumes.filter((r) => r.uuid !== deleteTarget.uuid);
      setResumes(updated);
      storeResumes(updated);
      toast.success(isBn ? "মুছে ফেলা হয়েছে" : "Deleted successfully");
    } catch {
      toast.error(isBn ? "মুছে ফেলা যায়নি" : "Delete failed");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (uuid: string) => {
    try {
      await resumeService.duplicateResume(uuid);
      toast.success(isBn ? "ডুপ্লিকেট তৈরি হয়েছে" : "Duplicated");
      loadData();
    } catch {
      toast.error(isBn ? "ব্যর্থ" : "Failed");
    }
  };

  const handleDownload = async (uuid: string) => {
    try {
      const blob = await resumeService.downloadResume(uuid);
      if (!blob || blob.size < 50) throw new Error("Empty PDF");
      const url = URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${uuid}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success(isBn ? "ডাউনলোড শুরু হয়েছে" : "Download started");
    } catch {
      toast.info(isBn ? "প্রিভিউ পেজ ওপেন হচ্ছে, সেখান থেকে সরাসরি প্রিন্ট বা PDF সেভ করুন" : "Opening preview to print/save");
      window.open(`/cv/preview/${uuid}`, "_blank");
    }
  };

  const handleShareToggle = async (resume: Resume) => {
    const newPublicState = !resume.is_public;
    try {
      const result = await resumeService.shareResume(resume.uuid, {
        is_public: newPublicState,
      });
      const updated = resumes.map((r) =>
        r.uuid === resume.uuid
          ? {
              ...r,
              is_public: newPublicState,
            }
          : r
      );
      setResumes(updated);
      storeResumes(updated);
      toast.success(
        newPublicState
          ? isBn
            ? "পাবলিক লিঙ্ক তৈরি হয়েছে"
            : "Share link created"
          : isBn
          ? "পাবলিক লিঙ্ক বন্ধ করা হয়েছে"
          : "Share link disabled"
      );
    } catch {
      toast.error(isBn ? "ব্যর্থ" : "Failed");
    }
  };

  const handleCopyLink = async (resume: Resume) => {
    const token = resume.uuid;
    const shareUrl = `${window.location.origin}/cv/share/${token}`;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(isBn ? "লিংক কপি হয়েছে" : "Link copied!");
    } catch {
      toast.error(isBn ? "কপি ব্যর্থ" : "Copy failed");
    } finally {
      setTimeout(() => setCopying(false), 1000);
    }
  };

  const getTemplatePreviewGradient = (index: number) => {
    const gradients = [
      "from-blue-500 to-purple-600",
      "from-emerald-500 to-teal-600",
      "from-orange-400 to-red-500",
      "from-pink-500 to-rose-600",
      "from-cyan-400 to-blue-500",
      "from-violet-500 to-indigo-600",
      "from-amber-400 to-orange-500",
      "from-teal-400 to-cyan-500",
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {isBn ? "আমার সিভি / রিজিউম" : "My Resumes"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isBn
              ? "আপনার সিভি পরিচালনা করুন"
              : "Manage and download your resumes"}
          </p>
        </div>
        <Button
          onClick={() => router.push("/resume-builder/template")}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {isBn ? "নতুন সিভি তৈরি করুন" : "Create New CV"}
        </Button>
      </div>

      {/* AI Resume Builder CTA */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {isBn ? "AI সিভি বিল্ডার" : "AI Resume Builder"}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">
                {isBn
                  ? "AI ব্যবহার করে পেশাদার সিভি তৈরি করুন"
                  : "Create a professional resume with AI assistance"}
              </p>
            </div>
          </div>
          <Button asChild>
            <a href="/resume-builder/template">
              <Sparkles className="h-4 w-4 mr-2" />
              {isBn ? "এখনই শুরু করুন" : "Get Started"}
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Upload CV Section */}
      <Card className="border-dashed border-2 border-muted-foreground/20">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">
                  {isBn ? "সিভি আপলোড করুন" : "Upload Your CV"}
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {isBn
                    ? "পিডিএফ ফরম্যাটে আপনার বিদ্যমান সিভি আপলোড করুন (সর্বোচ্চ ৪০০KB)"
                    : "Upload your existing CV in PDF format (max 400KB)"}
                </p>
              </div>
            </div>
          </div>

          {uploadedResume ? (
            <div className="mt-4 p-4 rounded-lg bg-primary/5 border border-primary/20 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <FileText className="h-8 w-8 text-primary shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {uploadedResume.path.split("/").pop() || "resume.pdf"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isBn ? "আপলোড করা সিভি" : "Uploaded CV"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={uploadedResume.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1.5" />
                    {isBn ? "দেখুন" : "View"}
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                  ) : (
                    <FileUp className="h-4 w-4 mr-1.5" />
                  )}
                  {isBn ? "বদলান" : "Replace"}
                </Button>
              </div>
            </div>
          ) : (
            <div
              className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                dragOver
                  ? "border-primary bg-primary/5"
                  : "border-muted-foreground/20 hover:border-muted-foreground/40 hover:bg-muted/30"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm font-medium mb-1">
                {isBn
                  ? "PDF ফাইল এখানে টেনে আনুন অথবা ক্লিক করুন"
                  : "Drag & drop your PDF here, or click to browse"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isBn ? "শুধুমাত্র PDF, সর্বোচ্চ ২MB" : "PDF only, up to 2MB"}
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>

      {/* Existing Resumes List */}
      <div>
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <h2 className="text-lg font-semibold">
            {isBn ? "আমার সিভি সমূহ" : "My Resumes"} ({resumes.length})
          </h2>
          <Button onClick={() => fileInputRef.current?.click()} size="sm">
            <Upload className="h-4 w-4 mr-2" />
            {isBn ? "সিভি আপলোড করুন" : "Upload CV"}
          </Button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : resumes.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-2">
                {isBn
                  ? "এখনো কোনো সিভি তৈরি করা হয়নি"
                  : "No resumes created yet"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {isBn
                  ? "আপনার প্রথম সিভি তৈরি করতে উপরের বোতামে ক্লিক করুন"
                  : "Click the button above to create your first resume"}
              </p>
              <Button
                onClick={() => {
                  setCreateDialogOpen(true);
                  setNewTitle(isBn ? "আমার সিভি" : "My Resume");
                }}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                {isBn ? "সিভি তৈরি করুন" : "Create Resume"}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumes.map((resume, idx) => (
              <Card
                key={resume.uuid}
                className="group hover:shadow-lg transition-all duration-200"
              >
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${getTemplatePreviewGradient(
                          idx
                        )} flex items-center justify-center shrink-0`}
                      >
                        <FileText className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm truncate">
                          {resume.title}
                        </h3>
                        <p className="text-xs text-muted-foreground capitalize">
                          {resume.template_name || resume.template_slug || "Template"}
                        </p>
                      </div>
                    </div>
                    {resume.is_public && (
                      <Badge
                        variant="secondary"
                        className="text-[10px] shrink-0"
                      >
                        <Eye className="h-2.5 w-2.5 mr-0.5" />
                        {isBn ? "পাবলিক" : "Public"}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {formatDate(resume.created_at)}
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                      className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium h-9 text-xs shadow-sm"
                    >
                      <a href={`/cv/preview/${resume.uuid}`} target="_blank" rel="noopener noreferrer">
                        <Printer className="h-3.5 w-3.5" />
                        {isBn ? "প্রিন্ট / প্রিভিউ" : "Print / View"}
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(resume.uuid)}
                      className="gap-1.5 font-medium h-9 text-xs"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {isBn ? "PDF ডাউনলোড" : "Download PDF"}
                    </Button>
                  </div>

                  {/* Utility icon buttons */}
                  <div className="flex items-center gap-1 pt-1 border-t">
                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs gap-1 text-muted-foreground hover:text-foreground"
                      asChild
                    >
                      <Link href={`/resume-builder/edit/${resume.template_slug || "modern-twocol"}`}>
                        <Pencil className="h-3 w-3" />
                        {isBn ? "এডিট" : "Edit"}
                      </Link>
                    </Button>

                    <div className="flex-1" />

                    {/* Share Toggle */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleShareToggle(resume)}
                      title={
                        resume.is_public
                          ? isBn
                            ? "পাবলিক লিঙ্ক বন্ধ করুন"
                            : "Disable share link"
                          : isBn
                          ? "পাবলিক লিঙ্ক তৈরি করুন"
                          : "Enable share link"
                      }
                    >
                      <Share2
                        className={`h-3.5 w-3.5 ${
                          resume.is_public ? "text-primary" : ""
                        }`}
                      />
                    </Button>

                    {/* Copy Link */}
                    {resume.is_public && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleCopyLink(resume)}
                        title={isBn ? "লিংক কপি করুন" : "Copy link"}
                      >
                        {copying ? (
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <LinkIcon className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}

                    {/* Duplicate */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDuplicate(resume.uuid)}
                      title={isBn ? "ডুপ্লিকেট" : "Duplicate"}
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => setDeleteTarget(resume)}
                      title={isBn ? "মুছুন" : "Delete"}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Templates Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <LayoutGrid className="h-5 w-5" />
            {isBn ? "টেমপ্লেট" : "Templates"}
          </h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                {isBn ? "কোনো টেমপ্লেট পাওয়া যায়নি" : "No templates available"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {templates.slice(0, 8).map((template, idx) => (
              <Card
                key={template.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer"
              >
                {/* Preview Image or Template Design Thumbnail */}
                <div className="relative h-44 overflow-hidden bg-slate-100 dark:bg-slate-900 border-b">
                  <TemplateThumbnail template={template} />
                  {template.is_premium && (
                    <Badge className="absolute top-2 right-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0">
                      <CreditCard className="h-3 w-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-sm">{template.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {template.category}
                    </Badge>
                    {template.is_premium && template.price ? (
                      <span className="text-sm font-semibold text-primary">
                        {formatCurrency(template.price)}
                      </span>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        {isBn ? "বিনামূল্যে" : "Free"}
                      </Badge>
                    )}
                  </div>
                  <Button
                    className="w-full mt-3"
                    size="sm"
                    variant={template.is_premium ? "outline" : "default"}
                    onClick={() => {
                      if (template.is_premium) {
                        setPurchaseTemplate(template);
                      } else {
                        setSelectedTemplateSlug(template.slug);
                        setNewTitle(
                          template.name +
                            " " +
                            (isBn ? "সিভি" : "CV")
                        );
                        setCreateDialogOpen(true);
                      }
                    }}
                  >
                    {template.is_premium
                      ? isBn
                        ? "কিনুন"
                        : "Purchase"
                      : isBn
                      ? "ব্যবহার করুন"
                      : "Use Template"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Resume Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isBn ? "নতুন সিভি তৈরি করুন" : "Create New Resume"}
            </DialogTitle>
            <DialogDescription>
              {isBn
                ? "একটি শিরোনাম এবং টেমপ্লেট নির্বাচন করুন"
                : "Enter a title and select a template"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{isBn ? "শিরোনাম" : "Title"}</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={isBn ? "সিভির শিরোনাম" : "Resume title"}
              />
            </div>
            <div className="space-y-2">
              <Label>{isBn ? "টেমপ্লেট" : "Template"}</Label>
              <Select
                value={selectedTemplateSlug}
                onValueChange={setSelectedTemplateSlug}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={isBn ? "টেমপ্লেট নির্বাচন করুন" : "Select a template"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.slug} value={t.slug}>
                      {t.name}
                      {t.is_premium ? " ★" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setCreateDialogOpen(false)}
                className="flex-1"
              >
                {isBn ? "বাতিল" : "Cancel"}
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newTitle.trim() || !selectedTemplateSlug || creating}
                className="flex-1"
              >
                {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isBn ? "তৈরি করুন" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{isBn ? "মুছে ফেলুন?" : "Delete Resume?"}</DialogTitle>
            <DialogDescription>
              {isBn
                ? "এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।"
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {deleteTarget?.title}
          </p>
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              className="flex-1"
            >
              {isBn ? "বাতিল" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="flex-1"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isBn ? "মুছুন" : "Delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Purchase Template Dialog */}
      {purchaseTemplate && (
        <TemplatePurchaseDialog
          template={purchaseTemplate}
          open={!!purchaseTemplate}
          onClose={() => setPurchaseTemplate(null)}
          onSuccess={() => loadData()}
        />
      )}
    </div>
  );
}
