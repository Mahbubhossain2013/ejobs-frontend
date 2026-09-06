"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resumeService } from "@/services/resume.service";
import { useThemeStore } from "@/store/theme-store";
import { toast } from "sonner";
import {
  ArrowLeft, Download, Share2, LinkIcon, Loader2,
  Lock, Globe, Printer,
} from "lucide-react";

const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = Math.round(A4_WIDTH_PX * 1.414);

export default function CvPreviewClient() {
  const params = useParams();
  const uuid = params?.uuid as string;
  const router = useRouter();
  const { language } = useThemeStore();
  const isBn = language === "bn";

  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const updateScale = useCallback(() => {
    if (!wrapperRef.current) return;
    const w = wrapperRef.current.clientWidth;
    setScale(Math.min(1, w / A4_WIDTH_PX));
  }, []);

  useEffect(() => {
    updateScale();
    const obs = new ResizeObserver(updateScale);
    if (wrapperRef.current) obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, [updateScale, html]);

  useEffect(() => {
    if (!uuid) return;
    setLoading(true);
    setError(null);

    resumeService.getResume(uuid)
      .then(async (resume: any) => {
        setIsPublic(!!resume.is_public);
        setShareToken(resume.share_token || null);

        const slug = resume.template_slug;
        if (!slug) throw new Error("No template assigned to this resume");

        // Try renderPreview first — reads from the resume's frozen data_snapshot
        try {
          const snapshotHtml = await resumeService.renderPreview(uuid);
          if (snapshotHtml && snapshotHtml.length > 50) {
            setHtml(snapshotHtml);
            return;
          }
        } catch {
          // Fallback to live preview using current profile data
        }

        // Fallback: live preview (may show stale data if profile changed after resume creation)
        try {
          const previewHtml = await resumeService.getLivePreview(slug);
          if (previewHtml && previewHtml.length > 50) {
            setHtml(previewHtml);
            return;
          }
        } catch {
          // Fallback to demo
        }

        // Last resort: demo template
        try {
          const demoHtml = await resumeService.getPreviewDemo(slug);
          if (demoHtml && demoHtml.length > 50) {
            setHtml(demoHtml);
            return;
          }
        } catch {
          // give up
        }

        throw new Error("Preview not available for this template");
      })
      .catch((err: any) => {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load resume preview"
        );
      })
      .finally(() => setLoading(false));
  }, [uuid]);

  const handleDownloadPdf = async () => {
    setDownloading(true);
    try {
      const blob = await resumeService.downloadPdf(uuid);
      if (!blob || blob.size < 100) {
        throw new Error("Empty or invalid PDF");
      }
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `resume-${uuid}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success(isBn ? "PDF ডাউনলোড শুরু হয়েছে" : "PDF download started");
    } catch (err: any) {
      toast.error(isBn ? "ডাউনলোড ব্যর্থ হয়েছে" : "Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!html) return;
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      window.print();
    }
  };

  const handleShareToggle = async () => {
    try {
      const result = await resumeService.shareResume(uuid, { is_public: !isPublic });
      setIsPublic(!isPublic);
      if (result.share_token) setShareToken(result.share_token);
      toast.success(
        !isPublic
          ? isBn ? "পাবলিক লিঙ্ক তৈরি হয়েছে" : "Share link created"
          : isBn ? "পাবলিক লিঙ্ক বন্ধ করা হয়েছে" : "Share link disabled"
      );
    } catch {
      toast.error(isBn ? "ব্যর্থ" : "Failed");
    }
  };

  const handleCopyLink = async () => {
    const token = shareToken || uuid;
    const shareUrl = `${window.location.origin}/cv/share/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(isBn ? "লিঙ্ক কপি হয়েছে" : "Link copied!");
    } catch {
      toast.error(isBn ? "কপি ব্যর্থ" : "Copy failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      </div>
    );
  }

  if (error || !html) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4 max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="text-lg font-semibold">Preview Unavailable</p>
          <p className="text-sm text-muted-foreground">
            {error || (isBn ? "সিভির প্রিভিউ লোড করা যায়নি" : "Could not load CV preview")}
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" size="sm" onClick={() => router.push("/resume-builder")}>
              <ArrowLeft className="h-4 w-4 mr-1" />{isBn ? "ফিরে যান" : "Go Back"}
            </Button>
            <Button size="sm" onClick={handleDownloadPdf} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              {isBn ? "PDF ডাউনলোড" : "Download PDF"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="sticky top-0 z-50 bg-background border-b shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-2 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/resume")}>
              <ArrowLeft className="h-4 w-4 mr-1" />{isBn ? "সিভি ড্যাশবোর্ড" : "CV Dashboard"}
            </Button>
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${isPublic ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"}`}>
              {isPublic ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
              {isPublic ? (isBn ? "পাবলিক" : "Public") : (isBn ? "এই সিভি প্রাইভেট" : "This resume is private")}
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Button variant="default" size="sm" onClick={handlePrint} className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold">
              <Printer className="h-4 w-4" />
              {isBn ? "প্রিন্ট করুন" : "Print"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPdf} disabled={downloading}>
              {downloading ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Download className="h-4 w-4 mr-1" />}
              {isBn ? "PDF ডাউনলোড" : "Download PDF"}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShareToggle}>
              <Share2 className="h-4 w-4 mr-1" />
              {isPublic ? (isBn ? "আনপাবলিশ" : "Unpublish") : (isBn ? "শেয়ার করুন" : "Share")}
            </Button>
            {isPublic && (
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <LinkIcon className="h-4 w-4 mr-1" />{isBn ? "লিঙ্ক কপি" : "Copy Link"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto px-0 md:px-4 py-0 md:py-4">
        <div
          ref={wrapperRef}
          className="mx-auto bg-white shadow-lg md:rounded-lg overflow-hidden"
          style={{ maxWidth: "210mm", width: "100%" }}
        >
          <div style={{ height: `${A4_HEIGHT_PX * scale}px`, overflow: "hidden", position: "relative" }}>
            <iframe
              srcDoc={html}
              title="CV Preview"
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
      </div>
    </div>
  );
}