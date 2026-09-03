"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useResumeWizard } from "@/hooks/use-resume-wizard";
import { useThemeStore } from "@/store/theme-store";
import PublicLayout from "@/components/layout/PublicLayout";
import PersonalStep from "./PersonalStep";
import ExperiencesStep from "./ExperiencesStep";
import TemplateStep from "./TemplateStep";
import PreviewStep from "./PreviewStep";
import { User, Briefcase, Palette, Check, Eye, FileText } from "lucide-react";

const STEPS = [
  {
    key: 1,
    label: "Choose Template",
    labelBn: "টেমপ্লেট বেছে নিন",
    desc: "Design selection",
    descBn: "ডিজাইন নির্বাচন",
    icon: Palette,
    path: "template",
  },
  {
    key: 2,
    label: "Personal Info",
    labelBn: "ব্যক্তিগত তথ্য",
    desc: "Name, contact, photo",
    descBn: "নাম, যোগাযোগ, ছবি",
    icon: User,
    path: "personal",
  },
  {
    key: 3,
    label: "Experience & Skills",
    labelBn: "অভিজ্ঞতা ও দক্ষতা",
    desc: "Work, education, skills",
    descBn: "কাজ, শিক্ষা, দক্ষতা",
    icon: Briefcase,
    path: "experiences",
  },
  {
    key: 4,
    label: "Preview & Submit",
    labelBn: "প্রিভিউ ও সাবমিট",
    desc: "Review and print",
    descBn: "দেখুন ও প্রিন্ট করুন",
    icon: Eye,
    path: "preview",
  },
];

function pathnameToStep(path: string): number {
  if (path.includes("/preview")) return 4;
  if (path.includes("/experiences")) return 3;
  if (path.includes("/personal")) return 2;
  return 1;
}

export default function ResumeWizardClient() {
  const wizard = useResumeWizard();
  const pathname = usePathname();
  const router = useRouter();
  const { language } = useThemeStore();
  const isBn = language === "bn";

  const currentStep = pathnameToStep(pathname);

  if (wizard.step !== currentStep) {
    wizard.setStep(currentStep);
  }

  const goToStep = (n: number) => {
    const path = STEPS.find((s) => s.key === n)?.path || "template";
    router.push(`/resume-builder/${path}`);
  };

  if (wizard.loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">

        {/* ── Beautiful Step Wizard Header ── */}
        <div className="border-b bg-muted/20 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">

            {/* Title row */}
            <div className="flex items-center justify-between py-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <span className="font-semibold text-sm text-foreground">
                  {isBn ? "সিভি তৈরি করুন" : "CV Builder"}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                {isBn
                  ? `ধাপ ${currentStep} / ${STEPS.length}`
                  : `Step ${currentStep} of ${STEPS.length}`}
              </span>
            </div>

            {/* Step indicators */}
            <div className="flex items-center py-4 gap-0">
              {STEPS.map((s, i) => {
                const isCompleted = currentStep > s.key;
                const isActive = currentStep === s.key;
                const isClickable =
                  isCompleted ||
                  isActive ||
                  (s.key === 2 && !!wizard.data.template_slug) ||
                  (s.key === 3 && !!wizard.data.personal?.full_name) ||
                  (s.key === 4 && !!wizard.data.personal?.full_name);

                const Icon = s.icon;

                return (
                  <React.Fragment key={s.key}>
                    {/* Step circle + label */}
                    <button
                      onClick={() => isClickable && goToStep(s.key)}
                      disabled={!isClickable}
                      className={`flex flex-col items-center gap-1.5 min-w-0 flex-shrink-0 group transition-all ${
                        isClickable ? "cursor-pointer" : "cursor-not-allowed"
                      }`}
                    >
                      {/* Circle */}
                      <div
                        className={`relative flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all shadow-sm ${
                          isCompleted
                            ? "bg-primary border-primary text-primary-foreground shadow-primary/30"
                            : isActive
                            ? "bg-primary/10 border-primary text-primary shadow-primary/20 ring-4 ring-primary/10"
                            : "bg-background border-border text-muted-foreground"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        ) : (
                          <Icon className="h-4 w-4" />
                        )}
                        {/* Active pulse */}
                        {isActive && (
                          <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
                        )}
                      </div>

                      {/* Label (hidden on small screens) */}
                      <div className="hidden sm:flex flex-col items-center">
                        <span
                          className={`text-xs font-semibold leading-none whitespace-nowrap ${
                            isActive
                              ? "text-primary"
                              : isCompleted
                              ? "text-foreground"
                              : "text-muted-foreground"
                          }`}
                        >
                          {isBn ? s.labelBn : s.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5 whitespace-nowrap">
                          {isBn ? s.descBn : s.desc}
                        </span>
                      </div>

                      {/* Mobile: step number only */}
                      <span className="sm:hidden text-[10px] font-medium text-muted-foreground">
                        {i + 1}
                      </span>
                    </button>

                    {/* Connector line */}
                    {i < STEPS.length - 1 && (
                      <div className="flex-1 mx-2 sm:mx-3 relative">
                        <div className="h-0.5 w-full bg-border rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-primary rounded-full transition-all duration-500 ${
                              currentStep > s.key ? "w-full" : "w-0"
                            }`}
                          />
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            {/* Progress bar */}
            <div className="h-1 w-full bg-border rounded-full overflow-hidden mb-0 -mt-1">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── Step Content ── */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl py-8">
          {currentStep === 1 && (
            <TemplateStep wizard={wizard} onNext={() => goToStep(2)} />
          )}
          {currentStep === 2 && (
            <PersonalStep
              wizard={wizard}
              onNext={() => goToStep(3)}
              onPrev={() => goToStep(1)}
            />
          )}
          {currentStep === 3 && (
            <ExperiencesStep
              wizard={wizard}
              onNext={() => goToStep(4)}
              onPrev={() => goToStep(2)}
            />
          )}
          {currentStep === 4 && (
            <PreviewStep wizard={wizard} onPrev={() => goToStep(3)} />
          )}
        </div>
      </div>
    </PublicLayout>
  );
}