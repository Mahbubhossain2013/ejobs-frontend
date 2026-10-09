"use client";

import React from "react";
import { FileText, Layers, Copy, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type PageCount = 1 | 2 | 3;

interface PageCountSelectorProps {
  pageCount: PageCount;
  onChange: (count: PageCount) => void;
  isBn?: boolean;
  compact?: boolean;
  className?: string;
}

export default function PageCountSelector({
  pageCount,
  onChange,
  isBn = true,
  compact = false,
  className = "",
}: PageCountSelectorProps) {
  const options: {
    count: PageCount;
    labelBn: string;
    labelEn: string;
    subBn: string;
    subEn: string;
    icon: typeof FileText;
    badgeBn?: string;
    badgeEn?: string;
  }[] = [
    {
      count: 1,
      labelBn: "১ পেজ",
      labelEn: "1 Page",
      subBn: "এক পৃষ্ঠায় সম্পূর্ণ ফিট (নো গ্যাপ)",
      subEn: "Single page compact fit (no spill)",
      icon: FileText,
      badgeBn: "জনপ্রিয়",
      badgeEn: "Popular",
    },
    {
      count: 2,
      labelBn: "২ পেজ",
      labelEn: "2 Pages",
      subBn: "দুই পৃষ্ঠায় সুন্দর সুষম বিন্যাস",
      subEn: "Balanced 2-page professional layout",
      icon: Copy,
      badgeBn: "স্ট্যান্ডার্ড",
      badgeEn: "Standard",
    },
    {
      count: 3,
      labelBn: "৩ পেজ",
      labelEn: "৩ Pages",
      subBn: "তিন পৃষ্ঠায় বিস্তারিত এক্সিকিউটিভ ভিউ",
      subEn: "Comprehensive 3-page executive view",
      icon: Layers,
      badgeBn: "এক্সিকিউটিভ",
      badgeEn: "Executive",
    },
  ];

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-1 bg-muted/60 p-1 rounded-xl border ${className}`}>
        <span className="text-[11px] font-semibold text-muted-foreground px-2 hidden sm:inline">
          {isBn ? "সিভি সাইজ:" : "Pages:"}
        </span>
        {options.map((opt) => {
          const isSelected = pageCount === opt.count;
          const Icon = opt.icon;
          return (
            <button
              key={opt.count}
              type="button"
              onClick={() => onChange(opt.count)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-sm scale-100"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/80"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isBn ? opt.labelBn : opt.labelEn}</span>
              {isSelected && <Check className="w-3 h-3 ml-0.5" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold text-foreground flex items-center gap-2">
          <span>{isBn ? "সিভি পৃষ্ঠার সংখ্যা নির্বাচন করুন:" : "Select CV Page Length:"}</span>
          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary border-primary/20">
            {isBn ? "অটো-ফিট সিস্টেম" : "Auto-Fit System"}
          </Badge>
        </label>
        <span className="text-xs text-muted-foreground">
          {isBn
            ? `বর্তমানে ${pageCount === 1 ? "১" : pageCount === 2 ? "২" : "৩"} পেজে ফিট করা হচ্ছে`
            : `Currently fitted for ${pageCount} ${pageCount === 1 ? "page" : "pages"}`}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {options.map((opt) => {
          const isSelected = pageCount === opt.count;
          const Icon = opt.icon;

          return (
            <button
              key={opt.count}
              type="button"
              onClick={() => onChange(opt.count)}
              className={`relative flex flex-col items-start p-3.5 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-md ring-2 ring-primary/20"
                  : "border-border/70 hover:border-primary/40 bg-card hover:bg-muted/40"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-sm text-foreground">
                    {isBn ? opt.labelBn : opt.labelEn}
                  </span>
                </div>

                {opt.badgeBn && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-primary/20 text-primary dark:text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isBn ? opt.badgeBn : opt.badgeEn}
                  </span>
                )}
              </div>

              <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">
                {isBn ? opt.subBn : opt.subEn}
              </p>

              {isSelected && (
                <div className="absolute top-2 right-2 text-primary">
                  <div className="w-4 h-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px]">
                    ✓
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
