"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api-client";
import { useThemeStore } from "@/store/theme-store";
import { useAuthStore } from "@/store/auth-store";
import { useEmployerCompany } from "@/hooks/use-employer-company";
import { useEmployerProfileState } from "@/hooks/use-employer-profile-state";
import { STEPS } from "@/components/employer/profile/step-config";
import BasicInfoStep from "@/components/employer/profile/steps/BasicInfoStep";
import ContactStep from "@/components/employer/profile/steps/ContactStep";
import AddressStep from "@/components/employer/profile/steps/AddressStep";
import OverviewStep from "@/components/employer/profile/steps/OverviewStep";
import HrStep from "@/components/employer/profile/steps/HrStep";
import SettingsStep from "@/components/employer/profile/steps/SettingsStep";
import VerificationStep from "@/components/employer/profile/steps/VerificationStep";
import MediaStep from "@/components/employer/profile/steps/MediaStep";
import SocialStep from "@/components/employer/profile/steps/SocialStep";
import StatsStep from "@/components/employer/profile/steps/StatsStep";
import HrTeamStep from "@/components/employer/profile/steps/HrTeamStep";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, ChevronRight, ChevronLeft, Check, FileCheck } from "lucide-react";

const STEP_COMPONENTS: Record<string, React.FC<any>> = {
  basic: BasicInfoStep, contact: ContactStep, address: AddressStep,
  overview: OverviewStep, hr: HrStep, settings: SettingsStep,
  verification: VerificationStep, media: MediaStep, social: SocialStep,
};

export default function EmployerProfilePage() {
  const { user } = useAuthStore();
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";
  const { company: hookCompany, stats: hookStats, loading: hookLoading, updateCompany, lastSyncedAt } = useEmployerCompany();
  const form = useEmployerProfileState();

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [savedSteps, setSavedSteps] = useState<Set<number>>(new Set());
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    document.title = isBn ? `কোম্পানি প্রোফাইল | ${siteName}` : `Company Profile | ${siteName}`;
  }, [isBn, siteName]);

  useEffect(() => {
    if (!hookLoading) setLoading(false);
  }, [hookLoading]);

  const handleSave = async (showToast = true): Promise<boolean> => {
    try {
      setSaving(true); setSaveError(null);
      const fd = form.buildFormData();
      const success = await updateCompany(fd);
      if (success) {
        if (form.hrTeam.length > 0) {
          api.post("/employer/hr-team", { members: form.hrTeam }).catch(() => toast.error(isBn ? "HR টিম সংরক্ষণ ব্যর্থ" : "HR team save failed"));
        }
        if (showToast) toast.success(isBn ? "সংরক্ষিত হয়েছে!" : "Profile saved!");
        window.dispatchEvent(new Event("employer-company-saved"));
        setSaveError(null); return true;
      }
      if (showToast) toast.error(isBn ? "সংরক্ষণ ব্যর্থ হয়েছে" : "Failed to save profile");
      return false;
    } catch (error: any) {
      const data = error.response?.data;
      const msg = error.response?.status === 500
        ? (isBn ? "সার্ভার ত্রুটি। পরে আবার চেষ্টা করুন।" : "Server error. Please try again later.")
        : data?.errors ? (Array.isArray(data.errors[Object.keys(data.errors)[0]]) ? data.errors[Object.keys(data.errors)[0]][0] : data.errors[Object.keys(data.errors)[0]])
        : data?.message || "Failed to save profile";
      setSaveError(msg); if (showToast) toast.error(msg); return false;
    } finally { setSaving(false); }
  };

  const handleSaveAndContinue = async () => {
    if (await handleSave(true)) { setSavedSteps((p) => new Set(p).add(step)); if (step < STEPS.length - 1) setStep(step + 1); }
  };

  const isStepComplete = (key: string): boolean => {
    switch (key) {
      case "basic":
        return Boolean(form.companyName && form.industry && form.companyType);
      case "contact":
        return Boolean(form.contactPerson && form.contactPhone && form.contactEmail);
      case "address":
        return Boolean(form.headOffice && form.district);
      case "overview":
        return Boolean(form.description && (form.mission || form.vision));
      case "hr":
        return Boolean((form.hrName && form.hrEmail) || form.hrTeam.length > 0);
      case "settings":
        return true;
      case "verification":
        return Boolean(
          form.businessRegNo || form.tradeLicenseNo || form.tradeLicensePath || form.tradeLicenseFile ||
          form.nidPath || form.nidFile || form.regCertPath || form.regCertFile
        );
      case "media":
        return Boolean((form.logoPreview || form.logoFile) && (form.coverPreview || form.coverFile || form.videoUrl));
      case "social":
        return Boolean(form.facebookPage || form.linkedinPage || form.website || form.youtubeChannel || form.instagramProfile);
      case "stats":
        return true;
      case "team":
        return form.hrTeam.length > 0;
      default:
        return false;
    }
  };

  const completionPct = (() => {
    const weights: Record<string, number> = {
      basic: 15, contact: 10, address: 10, overview: 10, hr: 10,
      verification: 15, media: 10, social: 10, team: 10,
    };
    return Math.min(100, STEPS.reduce((sum, s) => sum + (isStepComplete(s.key) ? weights[s.key] ?? 0 : 0), 0));
  })();

  const completedSteps = new Set([
    ...STEPS.map((s, i) => (isStepComplete(s.key) ? i : -1)).filter((i) => i >= 0),
    ...savedSteps,
  ]);

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const currentStep = STEPS[step];

  const renderContent = () => {
    if (currentStep.key === "stats") return <StatsStep stats={hookStats} isBn={isBn} />;
    if (currentStep.key === "team") return <HrTeamStep team={form.hrTeam} setTeam={form.setHrTeam} isBn={isBn} />;
    const StepComp = STEP_COMPONENTS[currentStep.key];
    return StepComp ? <StepComp state={form} isBn={isBn} /> : null;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{isBn ? "কোম্পানি প্রোফাইল" : "Company Profile"}</h1>
          {lastSyncedAt && <p className="text-xs text-muted-foreground mt-0.5">{isBn ? "সর্বশেষ সিঙ্ক:" : "Last synced:"} {lastSyncedAt.toLocaleTimeString()}</p>}
        </div>
        <Button onClick={async () => { if (await handleSave(true)) setSavedSteps((p) => new Set(p).add(step)); }} disabled={saving} variant="outline">
          {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          {saving ? (isBn ? "সংরক্ষিত হচ্ছে..." : "Saving...") : (isBn ? "সংরক্ষণ করুন" : "Save")}
        </Button>
      </div>

      {saveError && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          <FileCheck className="h-4 w-4 shrink-0" /><p className="flex-1">{saveError}</p>
          <button onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-700 shrink-0">&times;</button>
        </div>
      )}

      <Card><CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium">{isBn ? "প্রোফাইল সম্পূর্ণতা" : "Profile Completion"}</p>
          <Badge variant={completionPct >= 80 ? "default" : completionPct >= 50 ? "secondary" : "outline"}>{completionPct}%</Badge>
        </div>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${completionPct}%` }} />
        </div>
      </CardContent></Card>

      <div className="flex items-center gap-1 overflow-x-auto pb-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <button key={s.key} onClick={() => setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${i === step ? "bg-primary text-primary-foreground" : completedSteps.has(i) ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
              {completedSteps.has(i) ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              {isBn ? s.labelBn : s.labelEn}
            </button>
          );
        })}
      </div>

      <Card><CardContent className="pt-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          {React.createElement(currentStep.icon, { className: "h-5 w-5 text-primary" })}
          {isBn ? currentStep.labelBn : currentStep.labelEn}
          <Badge variant="outline" className="ml-auto text-xs">{step + 1}/{STEPS.length}</Badge>
        </h2>
        {renderContent()}
      </CardContent></Card>

      <div className="flex items-center justify-between pb-8">
        <Button variant="outline" onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}>
          <ChevronLeft className="h-4 w-4 mr-1" /> {isBn ? "আগের" : "Previous"}
        </Button>
        <div className="flex items-center gap-2">
          {step < STEPS.length - 1 && <Button variant="ghost" onClick={() => setStep(step + 1)}>{isBn ? "এড়িয়ে যান" : "Skip"}</Button>}
          {step < STEPS.length - 1 ? (
            <Button onClick={handleSaveAndContinue} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isBn ? "সংরক্ষণ ও পরবর্তী" : "Save & Continue"}
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={async () => { if (await handleSave(true)) setSavedSteps((p) => new Set(p).add(step)); }} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {isBn ? "সম্পূর্ণ সংরক্ষণ" : "Save Complete"}
              <Check className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}