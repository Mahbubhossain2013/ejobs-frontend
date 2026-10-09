"use client";

import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useThemeStore } from "@/store/theme-store";

interface Props {
  data: { description: string };
  onChange: (d: { description: string }) => void;
  isBn?: boolean;
}

const MAX_WORDS = 250;

const countWords = (text: string): number => {
  const trimmed = (text || "").trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
};

export default function ResumeObjectiveSection({ data, onChange, isBn: isBnProp }: Props) {
  const { language } = useThemeStore();
  const isBn = isBnProp ?? language === "bn";

  const description = data?.description || "";
  const wordCount = countWords(description);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    const trimmed = val.trim();
    if (!trimmed) {
      onChange({ ...data, description: val });
      return;
    }

    const words = trimmed.split(/\s+/);
    if (words.length > MAX_WORDS) {
      // Truncate to maximum 250 words
      const limited = words.slice(0, MAX_WORDS).join(" ");
      onChange({ ...data, description: limited });
    } else {
      onChange({ ...data, description: val });
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold">
        {isBn ? "ক্যারিয়ার অবজেক্টিভ (Resume objective)" : "Resume objective"}
      </h3>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label>{isBn ? "বিবরণ (Description)" : "Description"}</Label>
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium transition-colors ${
              wordCount >= MAX_WORDS
                ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400 font-bold"
                : "text-muted-foreground"
            }`}
          >
            {wordCount} / {MAX_WORDS} {isBn ? "শব্দ" : "words"}
          </span>
        </div>
        <Textarea
          value={description}
          onChange={handleChange}
          placeholder={
            isBn
              ? "আপনার ক্যারিয়ার লক্ষ্য ও অভিজ্ঞতার সংক্ষিপ্ত বিবরণ লিখুন (সর্বোচ্চ ২৫০ শব্দ)..."
              : "Write a brief summary of your career goals and qualifications (max 250 words)..."
          }
          rows={5}
          className="text-sm"
        />
        {wordCount >= MAX_WORDS && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {isBn
              ? "সর্বোচ্চ ২৫০ শব্দ লেখার সীমা পূর্ণ হয়েছে।"
              : "Maximum limit of 250 words reached."}
          </p>
        )}
      </div>
    </div>
  );
}