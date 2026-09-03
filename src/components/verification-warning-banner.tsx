"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { AlertTriangle, CheckCircle2, Mail, Phone, CreditCard, X } from "lucide-react";
import { useState, useEffect } from "react";

const DISMISS_KEY = "verification_banner_dismissed";

function isDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const val = localStorage.getItem(DISMISS_KEY);
    if (!val) return false;
    return Date.now() - Number(val) < 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

interface VerificationSummary {
  email_verified: boolean;
  phone_verified: boolean;
  nid_verified: boolean;
  is_fully_verified: boolean;
}

/**
 * Props:
 * - mode: "dashboard" = always show when incomplete, "global" = only show when email+phone not verified
 */
export default function VerificationWarningBanner({ mode = "global" }: { mode?: "dashboard" | "global" }) {
  const { user, isAuthenticated } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [dismissed, setDismissed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissed(isDismissed());
  }, []);

  const { data } = useQuery({
    queryKey: ["verification-status"],
    queryFn: async () => {
      const res = await api.get("/verifications/status");
      return res.data?.summary as VerificationSummary;
    },
    enabled: !!isAuthenticated && !!user && user.role !== "employer",
    staleTime: 5 * 60 * 1000,
  });

  if (!mounted || !data || dismissed) return null;

  const emailOk = data.email_verified;
  const phoneOk = data.phone_verified;
  const nidOk = data.nid_verified;
  const allDone = emailOk && phoneOk && nidOk;
  if (allDone) return null;

  // Global mode: only show if email OR phone is NOT verified
  if (mode === "global" && emailOk && phoneOk) return null;

  // Dashboard mode: always show if anything is missing (already passed — we reached here because !allDone)

  const steps = [
    { label: "Email", labelBn: "ইমেইল", done: emailOk, icon: Mail },
    { label: "Phone", labelBn: "ফোন", done: phoneOk, icon: Phone },
    { label: "NID", labelBn: "জাতীয় পরিচয়পত্র", done: nidOk, icon: CreditCard },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const pct = Math.round((completedCount / steps.length) * 100);

  return (
    <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-400 shrink-0" />
        <p className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-200 shrink-0">
          {isBn ? "অ্যাকাউন্ট যাচাইকৃত নয়:" : "Account not verified:"}
        </p>
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {steps.map((step) => (
            <span key={step.label} className="flex items-center gap-1 text-[10px] sm:text-xs">
              {step.done ? (
                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-green-600" />
              ) : (
                <step.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-amber-500" />
              )}
              <span className={`${step.done ? "text-green-700 dark:text-green-400" : "text-amber-700 dark:text-amber-300"} hidden sm:inline`}>
                {isBn ? step.labelBn : step.label}
              </span>
            </span>
          ))}
          <span className="text-[10px] sm:text-xs text-amber-600 dark:text-amber-400 font-medium">{pct}%</span>
        </div>
        <Link
          href="/dashboard/verify"
          className="shrink-0 text-[10px] sm:text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg transition-colors"
        >
          {isBn ? "যাচাই করুন" : "Verify Now"}
        </Link>
        <button
          onClick={() => {
            setDismissed(true);
            try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch {}
          }}
          className="shrink-0 text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200"
        >
          <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </button>
      </div>
    </div>
  );
}
