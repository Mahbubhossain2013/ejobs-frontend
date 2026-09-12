"use client";

import React, { useState } from "react";
import { Crown, Check, Eye, Maximize2, Loader2, Sparkles, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatCurrency } from "@/lib/utils";
import { getTemplateDownloadCount, formatDownloadCount } from "@/lib/cv-download-tracker";
import { Download } from "lucide-react";
import TemplateThumbnail from "@/components/cv/TemplateThumbnail";
import type { CvTemplate } from "@/types";

export default function TemplateCard({
  template,
  index,
  isBn,
  isPurchased,
  creating,
  onUse,
  onStartEdit,
}: {
  template: CvTemplate;
  index: number;
  isBn: boolean;
  isPurchased: boolean;
  creating: boolean;
  onUse: (t: CvTemplate) => void;
  onStartEdit: (t: CvTemplate) => void;
}) {
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  return (
    <>
      <div className="group relative bg-card border-2 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col hover:-translate-y-1 hover:border-primary/50">
        {/* Real Visual Scaled CV Template Thumbnail */}
        <div
          onClick={() => setShowPreviewModal(true)}
          className="relative w-full bg-white dark:bg-slate-100 overflow-hidden border-b cursor-pointer"
          style={{ height: "260px" }}
        >
          <TemplateThumbnail template={template} />

          {/* Download Count Pill on Thumbnail */}
          <div className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 z-10 shadow-sm border border-white/10">
            <Download className="w-3 h-3 text-emerald-400" />
            <span>{formatDownloadCount(getTemplateDownloadCount(template.slug, template.download_count), isBn)}</span>
          </div>

          {/* Premium / Owned Badge */}
          {template.is_premium && !isPurchased && (
            <Badge className="absolute top-2.5 right-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-md z-10 text-[11px]">
              <Crown className="h-3 w-3 mr-1" />
              {template.price ? formatCurrency(template.price) : (isBn ? "প্রিমিয়াম" : "Premium")}
            </Badge>
          )}

          {!template.is_premium && (
            <Badge variant="secondary" className="absolute top-2.5 right-2.5 bg-emerald-500 text-white border-0 shadow-md z-10 text-[11px]">
              {isBn ? "ফ্রি" : "Free"}
            </Badge>
          )}

          {isPurchased && (
            <Badge className="absolute top-2.5 right-2.5 bg-green-600 text-white border-0 shadow-md z-10 text-[11px]">
              <Check className="h-3 w-3 mr-1" />
              {isBn ? "কেনা আছে" : "Owned"}
            </Badge>
          )}

          {/* Hover Action Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 z-20 backdrop-blur-[2px]">
            <Button
              size="sm"
              variant="secondary"
              className="h-9 px-4 text-xs font-bold shadow-xl bg-white/95 text-slate-900 hover:bg-white rounded-full flex items-center gap-1.5"
              onClick={(e) => {
                e.stopPropagation();
                setShowPreviewModal(true);
              }}
            >
              <Eye className="w-3.5 h-3.5" />
              {isBn ? "বড় আকারে দেখুন" : "View Large"}
            </Button>
          </div>
        </div>

        {/* Card Footer Info & Use Button */}
        <div className="p-4 space-y-3 flex-1 flex flex-col justify-between bg-card">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-foreground truncate group-hover:text-primary transition-colors">
                {template.name}
              </h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-muted-foreground hover:text-primary shrink-0"
                onClick={() => setShowPreviewModal(true)}
                title={isBn ? "বড় আকারে প্রিভিউ" : "Zoom Preview"}
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5 capitalize">
              {template.category} {isBn ? "স্টাইল" : "Style"}
            </p>
            <div className="mt-2 p-1.5 px-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                <Download className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
                <span>{isBn ? "মোট ডাউনলোড:" : "Downloads:"}</span>
              </div>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono bg-emerald-500/15 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]">
                {formatDownloadCount(getTemplateDownloadCount(template.slug, template.download_count), isBn)} {isBn ? "বার" : ""}
              </span>
            </div>
          </div>

          <div className="pt-2 border-t flex gap-2">
            <Button
              className="w-full text-xs font-semibold h-9 rounded-lg"
              size="sm"
              disabled={creating}
              onClick={() => onUse(template)}
            >
              {creating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
              ) : (
                <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              )}
              {isBn ? "টেমপ্লেট ব্যবহার করুন" : "Use Template"}
            </Button>
          </div>
        </div>
      </div>

      {/* Full-Screen High-Fidelity Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 overflow-hidden bg-slate-900 border-slate-800">
          <DialogHeader className="p-4 bg-slate-950 text-white border-b border-slate-800 flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-lg font-bold text-white flex items-center gap-2">
                <span>{template.name}</span>
                {template.is_premium ? (
                  <Badge className="bg-amber-500 text-white text-xs">
                    {template.price ? formatCurrency(template.price) : "Premium"}
                  </Badge>
                ) : (
                  <Badge variant="secondary" className="bg-emerald-500 text-white text-xs">
                    Free
                  </Badge>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2.5 py-0.5 rounded-full ml-2">
                  <Download className="w-3.5 h-3.5" />
                  <span>{getTemplateDownloadCount(template.slug, template.download_count).toLocaleString()} {isBn ? "বার ডাউনলোড হয়েছে" : "downloads"}</span>
                </span>
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2 pr-6">
              <Button
                size="sm"
                className="bg-primary text-primary-foreground font-semibold"
                disabled={creating}
                onClick={() => {
                  setShowPreviewModal(false);
                  onUse(template);
                }}
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                {isBn ? "এই টেমপ্লেট দিয়ে সিভি তৈরি করুন" : "Use This Template"}
              </Button>
            </div>
          </DialogHeader>

          <div className="flex-1 bg-slate-900 overflow-y-auto p-4 flex items-center justify-center">
            <div className="shadow-2xl rounded-lg overflow-hidden bg-white max-w-full">
              <iframe
                src={`/cv/demo/${template.slug}`}
                title={template.name}
                className="w-[794px] h-[1123px] max-w-full border-0"
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
