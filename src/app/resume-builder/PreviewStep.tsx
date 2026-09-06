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

  // Use ref so that buildPayload is always current without causing useEffect re-runs
  const dataRef = useRef(data);
  useEffect(() => { dataRef.current = data; }, [data]);

  const buildPayload = useCallback(() => {
    const d = dataRef.current;
    const fullName =
      d.personal.full_name ||
      `${d.personal.first_name || ""} ${d.personal.last_name || ""}`.trim() ||
      "Your Name";

    return {
      personal: {
        full_name: fullName,
        first_name: d.personal.first_name,
        last_name: d.personal.last_name,
        title: d.personal.current_position || "",
        current_position: d.personal.current_position || "",
        email: d.personal.email,
        phone: d.personal.phone,
        alt_phone: (d.personal as any).alt_phone || "",
        address: d.personal.address,
        permanent_address: (d.personal as any).permanent_address || "",
        city: d.personal.city,
        location: d.personal.city || d.personal.address,
        photo_url: d.personal.photo_url,
        dob: d.personal.dob,
        place_of_birth: d.personal.place_of_birth,
        driving_license: d.personal.driving_license,
        gender: d.personal.gender,
        nationality: d.personal.nationality,
        marital_status: d.personal.marital_status,
        father_name: (d.personal as any).father_name || "",
        mother_name: (d.personal as any).mother_name || "",
        religion: (d.personal as any).religion || "",
        blood_group: (d.personal as any).blood_group || "",
        nid: (d.personal as any).nid || "",
        linkedin: d.personal.linkedin,
        github: d.personal.github,
        website: d.personal.website,
        additional_info: d.personal.additional_info,
        zip_code: d.personal.zip_code,
      },
      summary: d.resume_objective?.description || "",
      experience: (d.work_experience || []).map((w) => ({
        company: w.employer,
        position: w.job_title,
        location: w.city,
        start_date: w.start_date,
        end_date: w.end_date,
        description: w.description,
        is_current: w.is_current,
        employment_type: w.employment_type,
      })),
      education: (d.education || []).map((e) => ({
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
      skills: (d.skills || []).map((s) => ({
        name: s.skill,
        level: s.level ? Number(s.level) : null,
      })),
      languages: (d.languages || []).map((l) => ({
        name: l.language,
        proficiency: l.level,
      })),
      certifications: (d.certifications || [])
        .filter((c) => c.name?.trim())
        .map((c) => ({ name: c.name, issuer: c.issuer, date: c.date })),
      awards: (d.achievements || [])
        .filter((a) => a.description?.trim())
        .map((a) => ({ name: a.description })),
      projects: (d.projects || [])
        .filter((p) => p.name?.trim())
        .map((p) => ({
          name: p.name,
          description: p.description,
          url: p.url,
        })),
      hobbies: (d.interests || []).map((i) => i.hobby),
      references: (d.references || [])
        .filter((r) => r.name?.trim())
        .map((r) => ({
          name: r.name,
          designation: r.designation,
          organization: r.organization,
          phone: r.phone,
          email: r.email,
          relation: r.relation,
        })),
      training: (d.training || [])
        .filter((t) => t.title?.trim())
        .map((t) => ({
          title: t.title,
          institute: t.institute,
          duration: t.duration,
        })),
      social_links: {
        linkedin: d.personal.linkedin,
        github: d.personal.github,
        portfolio: d.personal.website,
      },
    };
  }, []); // stable - reads from dataRef


  useEffect(() => {
    if (!selectedSlug) return;
    setPreviewLoading(true);

    const payload = buildPayload();

    // Use plain fetch via Next.js proxy rewrite /api/* → backend
    fetch(`/api/cv/live-preview/${selectedSlug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/html,*/*" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("CV preview error:", res.status, text.slice(0, 300));
          throw new Error(`HTTP ${res.status}`);
        }
        return res.text();
      })
      .then((html) => {
        setPreviewHtml(html);
      })
      .catch((err) => {
        console.error("CV preview fetch failed:", err);
        setPreviewHtml("<p style='padding:20px;color:red;'>Preview unavailable: " + err.message + "</p>");
      })
      .finally(() => setPreviewLoading(false));
  }, [selectedSlug, buildPayload]);

  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdResumeUuid, setCreatedResumeUuid] = useState<string | null>(null);

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handlePrint = () => {
    if (!previewHtml) {
      toast.error(isBn ? "প্রিভিউ প্রস্তুত হয়নি" : "Preview is not ready yet");
      return;
    }

    try {
      let printFrame = document.getElementById("cv-print-frame") as HTMLIFrameElement;
      if (!printFrame) {
        printFrame = document.createElement("iframe");
        printFrame.id = "cv-print-frame";
        printFrame.style.position = "fixed";
        printFrame.style.right = "0";
        printFrame.style.bottom = "0";
        printFrame.style.width = "0";
        printFrame.style.height = "0";
        printFrame.style.border = "0";
        document.body.appendChild(printFrame);
      }

      const frameDoc = printFrame.contentWindow?.document;
      if (frameDoc) {
        frameDoc.open();
        frameDoc.write(previewHtml);
        frameDoc.close();
        setTimeout(() => {
          try {
            printFrame.contentWindow?.focus();
            printFrame.contentWindow?.print();
          } catch {
            window.print();
          }
        }, 500);
        return;
      }
    } catch {
      // Fallback
    }

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(previewHtml);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 500);
    } else {
      window.print();
    }
  };

  const handleDownloadPdf = async () => {
    if (!previewHtml) {
      toast.error(isBn ? "প্রিভিউ প্রস্তুত হয়নি" : "Preview is not ready yet");
      return;
    }

    setDownloadingPdf(true);
    try {
      if (createdResumeUuid) {
        const token = (() => {
          try {
            const raw = localStorage.getItem("auth-storage");
            return JSON.parse(raw || "")?.state?.token || "";
          } catch { return ""; }
        })();
        const url = `/api/cv/resumes/${createdResumeUuid}/download${token ? `?token=${encodeURIComponent(token)}` : ""}`;
        const res = await fetch(url);
        if (res.ok) {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("pdf") || ct.includes("octet-stream")) {
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `${data.personal.full_name || "My_CV"}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);
            toast.success(isBn ? "🎉 PDF ডাউনলোড সম্পন্ন হয়েছে!" : "PDF downloaded successfully!");
            return;
          }
        }
      }

      // If no uuid or direct endpoint didn't return PDF, trigger print-to-PDF dialog
      handlePrint();
      toast.info(isBn ? "প্রিন্ট ডায়ালগ থেকে 'Save as PDF' নির্বাচন করে সেভ করুন।" : "Select 'Save as PDF' in the destination list.");
    } catch {
      handlePrint();
    } finally {
      setDownloadingPdf(false);
    }
  };

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
      // Guest User can directly print their CV
      setSuccessModalOpen(true);
      toast.success(
        isBn ? "সিভি প্রস্তুত! নিচে PDF ডাউনলোড বা প্রিন্ট অপশন নির্বাচন করুন।" : "CV is ready! Choose Print or Download below."
      );
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

      const uuid = res.data?.data?.uuid || res.data?.uuid || null;
      setCreatedResumeUuid(uuid);
      setSuccessModalOpen(true);
      toast.success(
        isBn ? "🎉 সিভি সফলভাবে তৈরি ও সংরক্ষিত হয়েছে!" : "CV created successfully!"
      );
    } catch (e: any) {
      // Even if API save throws, open success dialog for direct printing
      setSuccessModalOpen(true);
      toast.info(
        isBn ? "সিভি প্রস্তুত! নিচে PDF ডাউনলোড বা প্রিন্ট অপশন নির্বাচন করুন।" : "CV is ready! Choose Print or Download below."
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
              ? "নিচে আপনার পূরণকৃত তথ্য দিয়ে রেন্ডার করা পূর্ণাঙ্গ সিভি দেখতে পাচ্ছেন।"
              : "Review your full resume design with your filled details."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={onPrev} className="gap-1.5">
            <Edit3 className="w-4 h-4" />
            {isBn ? "তথ্য সম্পাদন" : "Edit Details"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-bold hover:bg-blue-100"
          >
            <Download className="w-4 h-4" />
            {isBn ? "প্রিন্ট / PDF" : "Print / PDF"}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFullModalOpen(true)}
            className="gap-1.5"
          >
            <Maximize2 className="w-4 h-4" />
            {isBn ? "বড় পর্দা" : "Full Screen"}
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
            {isBn ? "সিভি সাবমিট করুন" : "Submit CV"}
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
                    ? "আপনার তথ্যানুযায়ী পূর্ণাঙ্গ সিভি প্রস্তুত হচ্ছে..."
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
                    sandbox="allow-same-origin allow-scripts allow-modals"
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

        <div className="flex items-center gap-3">
          <Button
            size="lg"
            variant="outline"
            onClick={handlePrint}
            className="gap-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950 font-black px-5 shadow-md"
          >
            <Download className="w-5 h-5" />
            {isBn ? "প্রিন্ট / PDF" : "Print / PDF"}
          </Button>

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
            {isBn ? "সিভি সাবমিট করুন" : "Submit CV"}
          </Button>
        </div>
      </div>

      {/* Success Dialog after Submit */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className="max-w-lg p-6 bg-card border-2 shadow-2xl rounded-2xl text-center">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl shadow-inner font-bold">
            ✓
          </div>
          <DialogTitle className="text-2xl font-black text-foreground">
            {isBn ? "🎉 আপনার সিভি সম্পন্ন হয়েছে!" : "🎉 CV Created Successfully!"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {isBn
              ? "আপনার সিভি প্রস্তুত। নিচের অপশনগুলো থেকে সরাসরি PDF ডাউনলোড অথবা প্রিন্ট করুন।"
              : "Your custom CV is ready. Download it as PDF or print directly."}
          </p>

          <div className="flex flex-col gap-3 mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Button
                size="lg"
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg h-12"
              >
                {downloadingPdf ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                {isBn ? "PDF ডাউনলোড করুন" : "Download PDF"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={handlePrint}
                className="gap-2 border-2 border-primary text-primary hover:bg-primary/10 font-bold h-12"
              >
                <FileCheck className="w-5 h-5" />
                {isBn ? "সরাসরি প্রিন্ট করুন" : "Direct Print"}
              </Button>
            </div>

            <Button
              size="default"
              variant="ghost"
              onClick={() => {
                setSuccessModalOpen(false);
                router.push("/dashboard/resume");
              }}
              className="text-xs text-muted-foreground hover:text-foreground mt-1"
            >
              {isBn ? "আমার সিভি ড্যাশবোর্ডে যান →" : "Go to CV Dashboard →"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Preview Modal */}
      <Dialog open={fullModalOpen} onOpenChange={setFullModalOpen}>
        <DialogContent className="max-w-6xl w-[95vw] h-[92vh] flex flex-col p-0 overflow-hidden bg-slate-900 text-white">
          <DialogHeader className="p-4 bg-slate-950 border-b border-slate-800 flex flex-row items-center justify-between shrink-0">
            <div>
              <DialogTitle className="text-white text-lg font-bold">
                {currentTemplate?.name || "CV"} -{" "}
                {isBn ? "সম্পূর্ণ প্রিভিউ" : "Full Resolution Preview"}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handlePrint}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0 font-bold"
              >
                <Download className="w-4 h-4 mr-1.5" />
                {isBn ? "প্রিন্ট / PDF" : "Print / PDF"}
              </Button>
              <Button
                size="sm"
                onClick={handleSubmitCv}
                disabled={submitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
              >
                <FileCheck className="w-4 h-4 mr-1.5" />
                {isBn ? "সাবমিট করুন" : "Submit CV"}
              </Button>
            </div>
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
