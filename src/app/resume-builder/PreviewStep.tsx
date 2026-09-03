"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { useResumeWizard } from "@/hooks/use-resume-wizard";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { resumeService } from "@/services/resume.service";
import api from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
  Check,
  Eye,
  Maximize2,
  Sparkles,
  Palette,
  FileCheck,
  Edit3,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { CvTemplate } from "@/types";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = Math.round(A4_WIDTH_PX * 1.414);

export default function PreviewStep({
  wizard,
  onPrev,
}: {
  wizard: ReturnType<typeof useResumeWizard>;
  onPrev: () => void;
}) {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const { user } = useAuth();
  const router = useRouter();
  const { data, setSectionData } = wizard;

  const [templates, setTemplates] = useState<CvTemplate[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>(
    data.template_slug || "modern-twocol"
  );
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fullModalOpen, setFullModalOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    if (!wrapperRef.current) return;
    setScale(Math.min(1, wrapperRef.current.clientWidth / A4_WIDTH_PX));
  }, []);

  useEffect(() => {
    updateScale();
    const obs = new ResizeObserver(updateScale);
    if (wrapperRef.current) obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, [updateScale, selectedSlug]);

  useEffect(() => {
    resumeService
      .getTemplates()
      .then((t) => {
        setTemplates(t);
        if (!data.template_slug && t.length > 0) {
          setSelectedSlug(t[0].slug);
          setSectionData("template_slug", t[0].slug);
        }
      })
      .catch(() => {});
  }, []);

  const buildPayload = useCallback(() => {
    const fullName =
      data.personal.full_name ||
      `${data.personal.first_name || ""} ${data.personal.last_name || ""}`.trim() ||
      "Your Name";

    return {
      personal: {
        full_name: fullName,
        first_name: data.personal.first_name,
        last_name: data.personal.last_name,
        title: data.personal.current_position || "",
        current_position: data.personal.current_position || "",
        email: data.personal.email,
        phone: data.personal.phone,
        alt_phone: (data.personal as any).alt_phone || "",
        address: data.personal.address,
        permanent_address: (data.personal as any).permanent_address || "",
        city: data.personal.city,
        location: data.personal.city || data.personal.address,
        photo_url: data.personal.photo_url,
        dob: data.personal.dob,
        place_of_birth: data.personal.place_of_birth,
        driving_license: data.personal.driving_license,
        gender: data.personal.gender,
        nationality: data.personal.nationality,
        marital_status: data.personal.marital_status,
        father_name: (data.personal as any).father_name || "",
        mother_name: (data.personal as any).mother_name || "",
        religion: (data.personal as any).religion || "",
        blood_group: (data.personal as any).blood_group || "",
        nid: (data.personal as any).nid || "",
        linkedin: data.personal.linkedin,
        github: data.personal.github,
        website: data.personal.website,
        additional_info: data.personal.additional_info,
        zip_code: data.personal.zip_code,
      },
      summary: data.resume_objective?.description || "",
      experience: (data.work_experience || []).map((w) => ({
        company: w.employer,
        position: w.job_title,
        location: w.city,
        start_date: w.start_date,
        end_date: w.end_date,
        description: w.description,
        is_current: w.is_current,
        employment_type: w.employment_type,
      })),
      education: (data.education || []).map((e) => ({
        institution: e.school,
        degree: e.degree,
        location: e.city,
        start_date: e.start_date,
        end_date: e.end_date,
        description: e.description,
        field_of_study: e.field_of_study,
        board: e.board,
        grade: e.grade,
      })),
      skills: (data.skills || []).map((s) => ({
        name: s.skill,
        level: s.level ? Number(s.level) : null,
      })),
      languages: (data.languages || []).map((l) => ({
        name: l.language,
        proficiency: l.level,
      })),
      certifications: (data.certifications || [])
        .filter((c) => c.name?.trim())
        .map((c) => ({ name: c.name, issuer: c.issuer, date: c.date })),
      awards: (data.achievements || [])
        .filter((a) => a.description?.trim())
        .map((a) => ({ name: a.description })),
      projects: (data.projects || [])
        .filter((p) => p.name?.trim())
        .map((p) => ({
          name: p.name,
          description: p.description,
          url: p.url,
        })),
      hobbies: (data.interests || []).map((i) => i.hobby),
      references: (data.references || [])
        .filter((r) => r.name?.trim())
        .map((r) => ({
          name: r.name,
          designation: r.designation,
          organization: r.organization,
          phone: r.phone,
          email: r.email,
          relation: r.relation,
        })),
      training: (data.training || [])
        .filter((t) => t.title?.trim())
        .map((t) => ({
          title: t.title,
          institute: t.institute,
          duration: t.duration,
        })),
      social_links: {
        linkedin: data.personal.linkedin,
        github: data.personal.github,
        portfolio: data.personal.website,
      },
    };
  }, [data]);

  useEffect(() => {
    if (!selectedSlug) return;
    setPreviewLoading(true);

    const payload = buildPayload();

    api
      .post(`/cv/live-preview/${selectedSlug}`, payload, {
        headers: { "Content-Type": "application/json" },
        responseType: "text",
      })
      .then((res) => {
        setPreviewHtml(res.data);
      })
      .catch(() => {
        fetch(`https://admin.ejobs.bd/cv/demo/${selectedSlug}`)
          .then((r) => r.text())
          .then((html) => setPreviewHtml(html))
          .catch(() => setPreviewHtml("<p>Preview unavailable</p>"));
      })
      .finally(() => setPreviewLoading(false));
  }, [selectedSlug, buildPayload]);

  const handleSelectTemplate = (slug: string) => {
    setSelectedSlug(slug);
    setSectionData("template_slug", slug);
  };

  const handleSubmitCv = async () => {
    const hasAuth = (() => {
      if (typeof window === "undefined") return false;
      try {
        const raw = localStorage.getItem("auth-storage");
        if (!raw) return false;
        return !!JSON.parse(raw)?.state?.token;
      } catch {
        return false;
      }
    })();

    if (!hasAuth) {
      toast.info(
        isBn
          ? "সিভি সংরক্ষণ করতে লগইন করুন"
          : "Please log in to save and finalize your CV"
      );
      router.push("/login?redirect=" + encodeURIComponent("/resume-builder/preview"));
      return;
    }

    setSubmitting(true);
    try {
      const fullSnapshot = buildPayload();
      const res = await api.post("/cv/create", {
        template_slug: selectedSlug,
        data_snapshot: fullSnapshot,
        title: `${fullSnapshot.personal.full_name || "My"} CV`,
      });

      if (res.data?.status || res.data?.uuid || res.data?.data) {
        toast.success(
          isBn ? "🎉 সিভি সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!" : "CV created successfully!"
        );
        router.push("/dashboard/resume");
      } else {
        toast.error(res.data?.message || (isBn ? "সিভি তৈরি ব্যর্থ হয়েছে" : "Failed to create CV"));
      }
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message ||
          (isBn ? "সিভি তৈরিতে সমস্যা হয়েছে" : "Error creating CV")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const currentTemplate = templates.find((t) => t.slug === selectedSlug);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-2xl border-2 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-primary/10 text-primary border-primary/20">
              <Eye className="w-3.5 h-3.5 mr-1" />
              {isBn ? "ধাপ ৪: লাইভ সিভি প্রিভিউ" : "Step 4: Live CV Preview"}
            </Badge>
          </div>
          <h2 className="text-2xl font-black tracking-tight">
            {isBn ? "আপনার সিভির প্রিভিউ ও ফাইনাল সাবমিশন" : "Review & Submit Your CV"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {isBn
              ? "নিচে আপনার পূরণকৃত তথ্য দিয়ে রেন্ডার করা সিভি দেখতে পাচ্ছেন। ডিজাইন পছন্দ হলে সাবমিট বাটনে ক্লিক করুন।"
              : "Review your full resume design with your filled details. When ready, click Submit to finalize."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onPrev} className="gap-1.5">
            <Edit3 className="w-4 h-4" />
            {isBn ? "তথ্য পরিবর্তন করুন" : "Edit Details"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullModalOpen(true)}
            className="gap-1.5"
          >
            <Maximize2 className="w-4 h-4" />
            {isBn ? "বড় পর্দায় দেখুন" : "Full Screen"}
          </Button>

          <Button
            size="default"
            onClick={handleSubmitCv}
            disabled={submitting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileCheck className="w-4 h-4" />
            )}
            {isBn ? "সিভি সাবমিট ও সংরক্ষণ করুন" : "Submit & Save CV"}
          </Button>
        </div>
      </div>

      <div className="bg-muted/40 p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-primary shrink-0" />
          <span className="text-sm font-semibold">
            {isBn ? "ডিজাইন পরিবর্তন করুন:" : "Quick Change Design:"}
          </span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-bold">
            {currentTemplate?.name || selectedSlug}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          {templates.slice(0, 10).map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTemplate(t.slug)}
              className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap ${
                selectedSlug === t.slug
                  ? "bg-primary text-primary-foreground border-primary shadow-sm"
                  : "bg-background hover:bg-muted border-border text-foreground"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <Card className="overflow-hidden border-2 shadow-2xl bg-slate-900/5 dark:bg-slate-950 w-full max-w-4xl">
          <CardContent className="p-4 sm:p-8 flex justify-center">
            {previewLoading ? (
              <div className="flex flex-col items-center justify-center h-[600px] gap-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  {isBn
                    ? "আপনার তথ্যানুযায়ী সিভি প্রস্তুত হচ্ছে..."
                    : "Rendering your customized CV..."}
                </p>
              </div>
            ) : previewHtml ? (
              <div
                ref={wrapperRef}
                className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-[794px]"
              >
                <div
                  style={{
                    height: `${A4_HEIGHT_PX * scale}px`,
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <iframe
                    srcDoc={previewHtml}
                    title="Live CV Preview"
                    sandbox="allow-same-origin allow-scripts"
                    style={{
                      width: `${A4_WIDTH_PX}px`,
                      height: `${A4_HEIGHT_PX}px`,
                      border: "none",
                      transform: `scale(${scale})`,
                      transformOrigin: "top left",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
                <p>{isBn ? "প্রিভিউ লোড করা যায়নি।" : "Preview could not be loaded."}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="sticky bottom-4 z-30 bg-card/95 backdrop-blur-md p-4 rounded-2xl border-2 shadow-2xl flex items-center justify-between gap-4 max-w-4xl mx-auto">
        <Button variant="outline" onClick={onPrev} className="gap-2 font-semibold">
          <ArrowLeft className="w-4 h-4" />
          {isBn ? "আগের ধাপ (তথ্য সম্পাদন)" : "Previous Step"}
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="lg"
            onClick={handleSubmitCv}
            disabled={submitting}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 shadow-xl text-base"
          >
            {submitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Check className="w-5 h-5" />
            )}
            {isBn ? "সিভি কনফার্ম ও সাবমিট করুন" : "Confirm & Submit CV"}
          </Button>
        </div>
      </div>

      <Dialog open={fullModalOpen} onOpenChange={setFullModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[92vh] flex flex-col p-0 overflow-hidden bg-slate-900 text-white">
          <DialogHeader className="p-4 bg-slate-950 border-b border-slate-800 flex flex-row items-center justify-between shrink-0">
            <div>
              <DialogTitle className="text-white text-lg font-bold">
                {currentTemplate?.name || "CV"} -{" "}
                {isBn ? "সম্পূর্ণ প্রিভিউ" : "Full Resolution Preview"}
              </DialogTitle>
            </div>
            <Button
              size="sm"
              onClick={handleSubmitCv}
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              <FileCheck className="w-4 h-4 mr-1.5" />
              {isBn ? "সাবমিট করুন" : "Submit CV"}
            </Button>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-6 flex justify-center bg-slate-900">
            <div className="shadow-2xl rounded-lg overflow-hidden bg-white max-w-full">
              <iframe
                srcDoc={previewHtml}
                title="Full Preview"
                className="w-[794px] h-[1123px] max-w-full border-0"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
