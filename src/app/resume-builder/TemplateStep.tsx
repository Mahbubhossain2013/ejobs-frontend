"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import type { useResumeWizard } from "@/hooks/use-resume-wizard";
import { useThemeStore } from "@/store/theme-store";
import { resumeService, DEFAULT_FALLBACK_TEMPLATES } from "@/services/resume.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  Loader2,
  Check,
  Eye,
  Maximize2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { formatCurrency } from "@/lib/utils";
import TemplateThumbnail from "@/components/cv/TemplateThumbnail";
import type { CvTemplate } from "@/types";
import { getTemplateDownloadCount, formatDownloadCount } from "@/lib/cv-download-tracker";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = Math.round(A4_WIDTH_PX * 1.414);

export default function TemplateStep({
  wizard,
  onNext,
}: {
  wizard: ReturnType<typeof useResumeWizard>;
  onNext: () => void;
}) {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();
  const { data, setSectionData } = wizard;
  const [templates, setTemplates] = useState<CvTemplate[]>(DEFAULT_FALLBACK_TEMPLATES);
  const [loading, setLoading] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    data.template_slug || "modern-twocol"
  );
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Modal full preview state
  const [zoomTemplate, setZoomTemplate] = useState<CvTemplate | null>(null);
  const [zoomHtml, setZoomHtml] = useState<string>("");
  const [zoomLoading, setZoomLoading] = useState<boolean>(false);

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

  const [templateDemos, setTemplateDemos] = useState<Record<string, string>>({});

  useEffect(() => {
    resumeService
      .getTemplates()
      .then((t) => {
        const list = t && t.length > 0 ? t : DEFAULT_FALLBACK_TEMPLATES;
        setTemplates(list);
        if (!selectedSlug && list.length > 0) {
          setSelectedSlug(list[0].slug);
        }
        setLoading(false);

        // Prefetch demo HTML for all templates so each card renders its full visual design instantly
        list.forEach((tpl) => {
          resumeService
            .getPreviewDemo(tpl.slug)
            .then((html) => {
              if (html) {
                setTemplateDemos((prev) => ({ ...prev, [tpl.slug]: html }));
              }
            })
            .catch(() => {});
        });
      })
      .catch(() => {
        setTemplates(DEFAULT_FALLBACK_TEMPLATES);
        if (!selectedSlug && DEFAULT_FALLBACK_TEMPLATES.length > 0) {
          setSelectedSlug(DEFAULT_FALLBACK_TEMPLATES[0].slug);
        }
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedSlug) return;
    setPreviewLoading(true);

    const hasUserData =
      data.personal.first_name ||
      data.personal.full_name ||
      data.personal.email;

    if (hasUserData) {
      const userPreviewPayload = {
        personal: {
          full_name:
            data.personal.full_name ||
            (data.personal.first_name + " " + data.personal.last_name).trim(),
          title: data.personal.current_position || "",
          email: data.personal.email,
          phone: data.personal.phone,
          address: data.personal.address,
          city: data.personal.city,
          location: data.personal.city || data.personal.address,
          photo_url: data.personal.photo_url,
          dob: data.personal.dob,
          place_of_birth: data.personal.place_of_birth,
          driving_license: data.personal.driving_license,
          gender: data.personal.gender,
          nationality: data.personal.nationality,
          marital_status: data.personal.marital_status,
          linkedin: data.personal.linkedin,
          github: data.personal.github,
          website: data.personal.website,
        },
        summary: data.resume_objective?.description || "",
        experience: (data.work_experience || []).map((w) => ({
          company: w.employer,
          position: w.job_title,
          location: w.city,
          start_date: w.start_date,
          end_date: w.end_date,
          description: w.description,
        })),
        education: (data.education || []).map((e) => ({
          institution: e.school,
          degree: e.degree,
          location: e.city,
          start_date: e.start_date,
          end_date: e.end_date,
          description: e.description,
        })),
        skills: (data.skills || []).map((s) => ({
          name: s.skill,
          level: s.level || null,
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
            relation: (r as any).relation || "",
          })),
        training: (data.training || [])
          .filter((t) => t.title?.trim())
          .map((t) => ({
            title: t.title,
            institute: t.institute,
            duration: t.duration,
          })),
      };

      resumeService
        .getLivePreviewWithData(selectedSlug, userPreviewPayload)
        .then((html) => {
          if (html) setPreviewHtml(html);
        })
        .catch(() => {
          resumeService
            .getPreviewDemo(selectedSlug)
            .then((html) => {
              if (html) setPreviewHtml(html);
            })
            .catch(() => {});
        })
        .finally(() => setPreviewLoading(false));
    } else {
      resumeService
        .getPreviewDemo(selectedSlug)
        .then((html) => {
          if (html) setPreviewHtml(html);
        })
        .catch(() => {})
        .finally(() => setPreviewLoading(false));
    }
  }, [selectedSlug, data]);

  const selectedTemplate = templates.find((t) => t.slug === selectedSlug);

  const openZoomModal = (t: CvTemplate, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setZoomTemplate(t);
    setZoomLoading(true);

    const hasUserData =
      data.personal.first_name ||
      data.personal.full_name ||
      data.personal.email;

    if (hasUserData) {
      const userPreviewPayload = {
        personal: {
          full_name:
            data.personal.full_name ||
            (data.personal.first_name + " " + data.personal.last_name).trim(),
          title: data.personal.current_position || "",
          email: data.personal.email,
          phone: data.personal.phone,
          address: data.personal.address,
          city: data.personal.city,
          location: data.personal.city || data.personal.address,
          photo_url: data.personal.photo_url,
          linkedin: data.personal.linkedin,
          github: data.personal.github,
          website: data.personal.website,
        },
        summary: data.resume_objective?.description || "",
        experience: (data.work_experience || []).map((w) => ({
          company: w.employer,
          position: w.job_title,
          location: w.city,
          start_date: w.start_date,
          end_date: w.end_date,
          description: w.description,
        })),
        education: (data.education || []).map((e) => ({
          institution: e.school,
          degree: e.degree,
          location: e.city,
          start_date: e.start_date,
          end_date: e.end_date,
          description: e.description,
        })),
        skills: (data.skills || []).map((s) => ({
          name: s.skill,
          level: s.level || null,
        })),
        languages: (data.languages || []).map((l) => ({
          name: l.language,
          proficiency: l.level,
        })),
        references: (data.references || []).map((r) => ({
          name: r.name,
          designation: r.designation,
          organization: r.organization,
          phone: r.phone,
        })),
      };

      resumeService
        .getLivePreviewWithData(t.slug, userPreviewPayload)
        .then((html) => {
          if (html) setZoomHtml(html);
        })
        .catch(() => {
          resumeService
            .getPreviewDemo(t.slug)
            .then((html) => {
              if (html) setZoomHtml(html);
            })
            .catch(() => {});
        })
        .finally(() => setZoomLoading(false));
    } else {
      resumeService
        .getPreviewDemo(t.slug)
        .then((html) => {
          if (html) setZoomHtml(html);
        })
        .catch(() => {})
        .finally(() => setZoomLoading(false));
    }
  };

  const handleCreateAndDownload = async () => {
    if (!selectedSlug) {
      toast.error(isBn ? "অনুগ্রহ করে একটি টেমপ্লেট নির্বাচন করুন" : "Please select a template");
      return;
    }
    setCreating(true);
    try {
      const fullName = (
        data.personal.full_name ||
        data.personal.first_name + " " + data.personal.last_name
      ).trim();
      await resumeService.updateProfile({
        personal_info: {
          full_name: fullName,
          first_name: data.personal.first_name,
          last_name: data.personal.last_name,
          title: data.personal.current_position || "",
          current_position: data.personal.current_position || "",
          email: data.personal.email,
          phone: data.personal.phone,
          address: data.personal.address,
          city: data.personal.city,
          location: data.personal.city || data.personal.address,
          photo_url: data.personal.photo_url,
          dob: data.personal.dob,
          place_of_birth: data.personal.place_of_birth,
          driving_license: data.personal.driving_license,
          gender: data.personal.gender,
          nationality: data.personal.nationality,
          marital_status: data.personal.marital_status,
          linkedin: data.personal.linkedin,
          github: data.personal.github,
          website: data.personal.website,
          additional_info: data.personal.additional_info,
          zip_code: data.personal.zip_code,
        },
        summary: data.resume_objective.description,
        experience: data.work_experience.map((w) => ({
          company: w.employer,
          position: w.job_title,
          employment_type: (w as any).employment_type || "Full-time",
          location: w.city,
          start_date: w.start_date,
          end_date: (w as any).is_current ? "Present" : w.end_date,
          is_current: (w as any).is_current,
          description: w.description,
        })),
        education: data.education.map((e) => ({
          institution: e.school,
          degree: e.degree,
          field_of_study: (e as any).field_of_study || "",
          board: (e as any).board || "",
          grade: (e as any).grade || "",
          location: e.city,
          start_date: e.start_date,
          end_date: e.end_date,
          description: e.description,
        })),
        skills: data.skills.map((s) => ({
          name: s.skill,
          level: s.level || null,
          category: null,
        })),
        languages: data.languages.map((l) => ({
          name: l.language,
          proficiency: l.level,
        })),
        certifications: (data.certifications || [])
          .filter((c) => c.name?.trim())
          .map((c) => ({ name: c.name, issuer: c.issuer, date: c.date })),
        awards: data.achievements
          .filter((a) => a.description?.trim())
          .map((a) => ({ name: a.description })),
        projects: (data.projects || [])
          .filter((p) => p.name?.trim())
          .map((p) => ({
            name: p.name,
            description: p.description,
            url: p.url,
          })),
        hobbies: data.interests.map((i) => i.hobby),
        references: (data.references || [])
          .filter((r) => r.name?.trim())
          .map((r) => ({
            name: r.name,
            designation: r.designation,
            organization: r.organization,
            phone: r.phone,
            email: r.email,
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
      });
      const fullSnapshot = {
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
        experience: data.work_experience.map((w) => ({
          company: w.employer,
          position: w.job_title,
          location: w.city,
          start_date: w.start_date,
          end_date: w.end_date,
          description: w.description,
        })),
        education: data.education.map((e) => ({
          institution: e.school,
          degree: e.degree,
          location: e.city,
          start_date: e.start_date,
          end_date: e.end_date,
          description: e.description,
        })),
        skills: data.skills.map((s) => ({
          name: s.skill,
          level: s.level || null,
          category: null,
        })),
        languages: data.languages.map((l) => ({
          name: l.language,
          proficiency: l.level,
        })),
        certifications: (data.certifications || [])
          .filter((c) => c.name?.trim())
          .map((c) => ({ name: c.name, issuer: c.issuer, date: c.date })),
        awards: data.achievements
          .filter((a) => a.description?.trim())
          .map((a) => ({ name: a.description })),
        projects: (data.projects || [])
          .filter((p) => p.name?.trim())
          .map((p) => ({
            name: p.name,
            description: p.description,
            url: p.url,
          })),
        hobbies: data.interests.map((i) => i.hobby),
        references: (data.references || [])
          .filter((r) => r.name?.trim())
          .map((r) => ({
            name: r.name,
            designation: r.designation,
            organization: r.organization,
            phone: r.phone,
            email: r.email,
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

      const resume = await resumeService.createResume({
        title: (fullName || "My") + " CV",
        template_slug: selectedSlug,
        data_snapshot: fullSnapshot,
      });
      const uuid = (resume as any)?.uuid || (resume as any)?.data?.uuid;
      toast.success(isBn ? "সিভি সফলভাবে তৈরি হয়েছে!" : "CV created successfully!");
      setSectionData("template_slug", selectedSlug);
      if (uuid) router.push(`/cv/preview/${uuid}`);
    } catch (e: any) {
      toast.error(
        e?.response?.data?.message || (isBn ? "সিভি তৈরিতে ব্যর্থ হয়েছে" : "Failed to create CV")
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-tight">
            {isBn ? "সিভি টেমপ্লেট বেছে নিন" : "Choose a CV Template"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {isBn
              ? "নিচের কার্ডগুলো থেকে আপনার পছন্দের সিভির ডিজাইন দেখুন এবং সিলেক্ট করুন। ক্লিক করলে বড় আকারে প্রিভিউ দেখতে পাবেন।"
              : "Browse real visual formats of all templates. Click to preview in high resolution or select for your resume."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-semibold px-2.5 py-1">
            <Sparkles className="w-3.5 h-3.5 mr-1 text-primary" />
            {templates.length} {isBn ? "টি টেমপ্লেট উপলব্ধ" : "Templates Available"}
          </Badge>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {templates.map((t) => {
            const isSelected = selectedSlug === t.slug;
            return (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedSlug(t.slug);
                  setSectionData("template_slug", t.slug);
                }}
                className={`group relative text-left rounded-xl border-2 overflow-hidden transition-all duration-200 cursor-pointer bg-card hover:shadow-xl flex flex-col ${
                  isSelected
                    ? "border-primary ring-4 ring-primary/20 shadow-lg"
                    : "border-border hover:border-primary/50"
                }`}
              >
                {/* Real Visual CV Template Design Thumbnail */}
                <div className="relative w-full overflow-hidden border-b bg-slate-100 dark:bg-slate-900" style={{ height: "290px" }}>
                  <TemplateThumbnail template={t} demoHtml={templateDemos[t.slug]} />

                  {/* Selected Indicator Pill */}
                  {isSelected && (
                    <div className="absolute top-2 left-2 z-10 bg-primary text-primary-foreground px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-md flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      {isBn ? "সিলেক্টেড" : "Selected"}
                    </div>
                  )}

                  {/* Download Count Pill on Thumbnail */}
                  {!isSelected && (
                    <div className="absolute top-2 left-2 z-10 bg-slate-900/80 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 shadow-sm border border-white/10">
                      <Download className="w-3 h-3 text-emerald-400" />
                      <span>{formatDownloadCount(getTemplateDownloadCount(t.slug, t.download_count), isBn)}</span>
                    </div>
                  )}

                  {/* Top-Right Badge */}
                  <div className="absolute top-2 right-2 z-10">
                    {t.is_premium ? (
                      <Badge className="text-[10px] bg-amber-500 text-white shadow">
                        {formatCurrency(t.price || 0)}
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-500 text-white shadow">
                        {isBn ? "ফ্রি" : "Free"}
                      </Badge>
                    )}
                  </div>

                  {/* Hover Overlay with Preview Zoom Action */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-20 backdrop-blur-[2px]">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 text-xs font-semibold shadow-lg bg-white/95 text-black hover:bg-white"
                      onClick={(e) => openZoomModal(t, e)}
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      {isBn ? "বড় করে দেখুন" : "View Large"}
                    </Button>
                  </div>
                </div>

                {/* Card Footer Info */}
                <div className="p-3 bg-card flex-1 flex flex-col justify-between">
                  <div>
                    <p className="font-bold text-sm truncate text-foreground group-hover:text-primary transition-colors">
                      {t.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                      {t.category} {isBn ? "স্টাইল" : "Style"}
                    </p>

                    {/* Dedicated Download Count Row (exact location requested by user in red box) */}
                    <div className="mt-2 p-1.5 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        <Download className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                        <span>{isBn ? "মোট ডাউনলোড:" : "Downloads:"}</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/15 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                        {formatDownloadCount(getTemplateDownloadCount(t.slug, t.download_count), isBn)} {isBn ? "বার" : ""}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t text-xs">
                    <span className="text-[11px] text-muted-foreground font-medium">
                      {isSelected ? (
                        <span className="text-primary font-bold">● {isBn ? "সক্রিয়" : "Active"}</span>
                      ) : (
                        <span>{isBn ? "বাছাই করুন" : "Click to select"}</span>
                      )}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-primary"
                      onClick={(e) => openZoomModal(t, e)}
                      title={isBn ? "বড় প্রিভিউ" : "Zoom preview"}
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Template Live Preview Area */}
      {selectedTemplate && (
        <div className="flex flex-col lg:flex-row gap-6 pt-6 border-t">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <span>{isBn ? "লাইভ সিভি প্রিভিউ:" : "Live CV Preview:"}</span>
                  <span className="text-primary font-black">{selectedTemplate.name}</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  {isBn
                    ? "আপনার তথ্যানুযায়ী সিভিটি যেভাবে রেন্ডার হবে তা নিচে সরাসরি দেখানো হচ্ছে।"
                    : "This live preview shows exactly how your information renders in this template."}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => openZoomModal(selectedTemplate)}
              >
                <Maximize2 className="w-4 h-4" />
                {isBn ? "বড় আকারে দেখুন (Full Screen)" : "View Full Size"}
              </Button>
            </div>

            <Card className="overflow-hidden border-2 shadow-xl bg-slate-900/5 dark:bg-slate-950">
              <CardContent className="p-4 sm:p-6 flex justify-center">
                {previewLoading ? (
                  <div className="flex flex-col items-center justify-center h-[520px] gap-2">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-xs text-muted-foreground">
                      {isBn ? "সিভি প্রিভিউ লোড হচ্ছে..." : "Loading live template preview..."}
                    </p>
                  </div>
                ) : previewHtml ? (
                  <div
                    ref={wrapperRef}
                    className="bg-white rounded-lg shadow-2xl overflow-hidden w-full max-w-[794px]"
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
                        sandbox="allow-same-origin"
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
                  <div className="flex items-center justify-center h-[520px] text-muted-foreground text-sm">
                    {isBn ? "প্রিভিউ দেখতে একটি টেমপ্লেট নির্বাচন করুন" : "Select a template to preview"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action Sidebar */}
          <div className="lg:w-80 space-y-4">
            <Card className="border-2 shadow-md">
              <CardContent className="p-5 space-y-4">
                <div>
                  <h4 className="font-bold text-base text-foreground">
                    {selectedTemplate.name}
                  </h4>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">
                    {selectedTemplate.category} {isBn ? "ডিজাইন" : "Design"}
                  </p>
                </div>

                <div className="p-3 bg-muted/50 rounded-lg text-xs space-y-1.5 border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isBn ? "মূল্য:" : "Price:"}</span>
                    <span className="font-bold">
                      {selectedTemplate.is_premium
                        ? formatCurrency(selectedTemplate.price || 0)
                        : isBn ? "বিনামূল্যে (Free)" : "Free"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{isBn ? "এটিএস ফ্রেন্ডলি:" : "ATS Compatible:"}</span>
                    <span className="font-semibold text-emerald-600">
                      {selectedTemplate.is_ats_friendly || selectedTemplate.ats_compatible
                        ? isBn ? "হ্যাঁ (Yes)" : "Yes"
                        : isBn ? "হ্যাঁ (Yes)" : "Yes"}
                    </span>
                  </div>
                </div>

                <Button
                  className="w-full h-11 text-sm font-bold shadow-lg gap-2 bg-primary hover:bg-primary/90"
                  onClick={onNext}
                >
                  <ArrowRight className="h-4 w-4" />
                  {isBn ? "পরবর্তী ধাপ: ব্যক্তিগত তথ্য পূরণ করুন" : "Next: Fill Personal Details"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex justify-end pt-6 border-t">
        <Button size="lg" className="gap-2 font-bold px-8 shadow-md" onClick={onNext}>
          {isBn ? "পরবর্তী ধাপ: ব্যক্তিগত তথ্য পূরণ করুন" : "Next: Fill Personal Details"}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* High-Resolution Full Size Zoom Modal */}
      <Dialog
        open={!!zoomTemplate}
        onOpenChange={(open) => {
          if (!open) {
            setZoomTemplate(null);
            setZoomHtml("");
          }
        }}
      >
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-700">
          <DialogHeader className="p-4 bg-slate-900 text-white border-b border-slate-800 flex flex-row items-center justify-between">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <span>{zoomTemplate?.name}</span>
              <Badge variant="outline" className="text-xs border-slate-600 text-slate-300">
                {zoomTemplate?.category}
              </Badge>
              {zoomTemplate && (
                <Badge variant="secondary" className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 gap-1 px-2 py-0.5">
                  <Download className="w-3 h-3" />
                  {getTemplateDownloadCount(zoomTemplate.slug).toLocaleString()} {isBn ? "বার ডাউনলোড" : "downloads"}
                </Badge>
              )}
            </DialogTitle>
            {zoomTemplate && (
              <Button
                size="sm"
                className="gap-1.5 mr-6 font-bold"
                onClick={() => {
                  setSelectedSlug(zoomTemplate.slug);
                  setSectionData("template_slug", zoomTemplate.slug);
                  setZoomTemplate(null);
                  toast.success(
                    isBn
                      ? `${zoomTemplate.name} টেমপ্লেটটি সিলেক্ট করা হয়েছে`
                      : `${zoomTemplate.name} selected`
                  );
                  onNext();
                }}
              >
                <Check className="w-4 h-4" />
                {isBn ? "এই টেমপ্লেট নিয়ে তথ্য পূরণ শুরু করুন" : "Select & Continue"}
              </Button>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-auto p-4 sm:p-8 flex items-center justify-center bg-slate-950">
            {zoomLoading ? (
              <div className="flex flex-col items-center justify-center gap-2 text-white">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="text-sm text-slate-400">
                  {isBn ? "বড় প্রিভিউ লোড হচ্ছে..." : "Loading high-resolution preview..."}
                </p>
              </div>
            ) : zoomHtml ? (
              <div className="bg-white shadow-2xl rounded overflow-hidden max-w-[794px] w-full">
                <iframe
                  srcDoc={zoomHtml}
                  title="Zoom Preview"
                  sandbox="allow-same-origin"
                  className="w-full border-0"
                  style={{
                    width: "794px",
                    height: "1123px",
                    maxWidth: "100%",
                  }}
                />
              </div>
            ) : (
              <iframe
                src={`/cv/demo/${zoomTemplate?.slug}`}
                title="Zoom Preview"
                className="w-full h-full bg-white rounded border-0 max-w-[794px]"
                style={{ minHeight: "800px" }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
