"use client";

import React, { useState, useEffect, useCallback } from "react";
import api from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  CheckCircle,
  Clock,
  Upload,
  Building2,
  FileText,
  ArrowRight,
  ArrowLeft,
  Loader2,
  XCircle,
  BadgeCheck,
  Sparkles,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  RefreshCw,
} from "lucide-react";

/* ─── Types ─── */
interface VerificationStatus {
  summary: {
    nid_verified: boolean;
    phone_verified: boolean;
    email_verified: boolean;
    employer_verified: boolean;
    is_fully_verified: boolean;
  };
  details: {
    nid: any;
    phone: any;
    email: any;
    employer: any;
  };
  fees: { candidate: number; employer: number };
}

type StepKey = "company" | "documents" | "status";

interface StepDef {
  key: StepKey;
  label: string;
  labelBn: string;
  icon: any;
}

const STEPS: StepDef[] = [
  { key: "company", label: "Company Details", labelBn: "কোম্পানির তথ্য", icon: Building2 },
  { key: "documents", label: "Trade License", labelBn: "ট্রেড লাইসেন্স", icon: FileText },
  { key: "status", label: "Verification Status", labelBn: "যাচাইকরণের অবস্থা", icon: BadgeCheck },
];

/* ─── Helpers ─── */
function getStatusInfo(status: VerificationStatus | null) {
  if (!status) return { state: "none" as const, label: "Not Started", labelBn: "শুরু হয়নি" };
  if (status.summary.employer_verified) return { state: "verified" as const, label: "Verified", labelBn: "যাচাইকৃত" };
  const detail = status.details.employer;
  if (detail?.status === "pending") return { state: "pending" as const, label: "Under Review", labelBn: "পর্যালোচনাধীন" };
  if (detail?.status === "rejected") return { state: "rejected" as const, label: "Rejected", labelBn: "প্রত্যাখ্যাত" };
  return { state: "none" as const, label: "Not Started", labelBn: "শুরু হয়নি" };
}

function StatusIcon({ state }: { state: string }) {
  switch (state) {
    case "verified": return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case "pending": return <Clock className="h-5 w-5 text-amber-500" />;
    case "rejected": return <XCircle className="h-5 w-5 text-red-500" />;
    default: return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
  }
}

function StatusBadge({ state, isBn }: { state: string; isBn: boolean }) {
  switch (state) {
    case "verified":
      return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />{isBn ? "যাচাইকৃত" : "Verified"}</Badge>;
    case "pending":
      return <Badge variant="outline" className="gap-1 border-amber-300 text-amber-600"><Clock className="h-3 w-3" />{isBn ? "পর্যালোচনাধীন" : "Pending"}</Badge>;
    case "rejected":
      return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />{isBn ? "প্রত্যাখ্যাত" : "Rejected"}</Badge>;
    default:
      return <Badge variant="secondary" className="gap-1">{isBn ? "শুরু হয়নি" : "Not Started"}</Badge>;
  }
}

/* ─── Main Component ─── */
export default function EmployerVerifyClient() {
  const { user } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";

  const [activeStep, setActiveStep] = useState(0);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Form state
  const [form, setForm] = useState({
    company_name: "",
    trade_license_number: "",
    company_phone: "",
    business_email: user?.email || "",
    company_address: "",
    company_website: "",
  });
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [licensePreview, setLicensePreview] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      setLoadingStatus(true);
      const res = await api.get("/verifications/status");
      setVerificationStatus(res.data);
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);

  // Auto-select first non-completed step
  useEffect(() => {
    if (verificationStatus) {
      const info = getStatusInfo(verificationStatus);
      if (info.state === "verified") setActiveStep(2);
      else if (info.state === "pending" || info.state === "rejected") setActiveStep(2);
      else setActiveStep(0);
    }
  }, [verificationStatus]);

  const handleLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLicenseFile(file);
      setLicensePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (!form.company_name.trim()) {
      toast.error(isBn ? "কোম্পানির নাম দিন" : "Please enter company name");
      return;
    }
    if (!form.trade_license_number.trim() || form.trade_license_number.length < 5) {
      toast.error(isBn ? "সঠিক ট্রেড লাইসেন্স নম্বর দিন" : "Please enter a valid trade license number (min 5 chars)");
      return;
    }
    if (!form.company_phone) {
      toast.error(isBn ? "কোম্পানি ফোন দিন" : "Please enter company phone");
      return;
    }
    if (!form.business_email) {
      toast.error(isBn ? "ব্যবসায়িক ইমেইল দিন" : "Please enter business email");
      return;
    }
    if (!licenseFile) {
      toast.error(isBn ? "ট্রেড লাইসেন্স আপলোড করুন" : "Please upload trade license document");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("company_name", form.company_name);
      formData.append("trade_license_number", form.trade_license_number);
      formData.append("company_phone", form.company_phone);
      formData.append("business_email", form.business_email);
      formData.append("trade_license_document", licenseFile);

      await api.post("/verifications/employer", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(
        isBn
          ? "কোম্পানি যাচাইকরণ জমা দেওয়া হয়েছে। এডমিন পর্যালোচনার জন্য অপেক্ষা করুন।"
          : "Company verification submitted! Awaiting admin review."
      );
      fetchStatus();
      setActiveStep(2);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Submission failed";
      if (err?.response?.status === 402) {
        toast.error(isBn ? "পর্যাপ্ত ব্যালেন্স নেই। ওয়ালেটে অর্থ যোগ করুন।" : msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const statusInfo = getStatusInfo(verificationStatus);
  const isVerified = statusInfo.state === "verified";
  const isPending = statusInfo.state === "pending";
  const detail = verificationStatus?.details.employer;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6 text-primary" />
          {isBn ? "কোম্পানি যাচাইকরণ" : "Company Verification"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isBn
            ? "আপনার কোম্পানি যাচাই করুন এবং বিশ্বাসযোগ্য ব্যাজ অর্জন করুন"
            : "Verify your company to earn the trusted employer badge"}
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="overflow-hidden">
        <div className={`h-1.5 ${isVerified ? "bg-emerald-500" : "bg-primary/20"}`}>
          <div
            className={`h-full transition-all duration-500 ${isVerified ? "bg-emerald-500" : "bg-primary"}`}
            style={{ width: isVerified ? "100%" : isPending ? "66%" : "0%" }}
          />
        </div>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isVerified ? (
              <BadgeCheck className="h-8 w-8 text-emerald-500" />
            ) : (
              <Sparkles className="h-8 w-8 text-primary" />
            )}
            <div>
              <p className="font-semibold">
                {isVerified
                  ? isBn ? "কোম্পানি যাচাইকৃত!" : "Company Verified!"
                  : isPending
                  ? isBn ? "পর্যালোচনাধীন" : "Under Review"
                  : isBn ? "যাচাইকরণ সম্পন্ন করুন" : "Complete Verification"}
              </p>
              <p className="text-xs text-muted-foreground">
                {isVerified
                  ? isBn ? "আপনার কোম্পানি যাচাইকৃত" : "Your company is verified and trusted"
                  : isPending
                  ? isBn ? "এডমিন পর্যালোচনার জন্য অপেক্ষা করুন" : "Awaiting admin review"
                  : isBn ? "ট্রেড লাইসেন্স এবং কোম্পানি তথ্য জমা দিন" : "Submit trade license and company details"}
              </p>
            </div>
          </div>
          <StatusBadge state={statusInfo.state} isBn={isBn} />
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, idx) => {
          const isActive = idx === activeStep;
          const StepIcon = step.icon;
          return (
            <button
              key={step.key}
              onClick={() => {
                if (idx < 2 || isPending || isVerified) setActiveStep(idx);
              }}
              className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                isActive
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : isVerified && idx === 2
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                  : "border-border hover:border-primary/30 hover:bg-muted/50"
              }`}
            >
              <StatusIcon state={isActive ? "active" : isVerified && idx === 2 ? "verified" : "none"} />
              <span className="hidden sm:inline truncate">{isBn ? step.labelBn : step.label}</span>
              <span className="sm:hidden"><StepIcon className="h-4 w-4" /></span>
            </button>
          );
        })}
      </div>

      {/* Active Step Content */}
      {loadingStatus ? (
        <Card>
          <CardContent className="p-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Step 1: Company Details */}
          {activeStep === 0 && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Briefcase className="h-5 w-5 text-primary" />
                    {isBn ? "কোম্পানির তথ্য" : "Company Details"}
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isBn ? "আপনার কোম্পানির বিস্তারিত তথ্য প্রদান করুন" : "Provide your company information"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isBn ? "কোম্পানির নাম *" : "Company Name *"}</Label>
                    <Input
                      placeholder={isBn ? "কোম্পানির নাম" : "Enter company name"}
                      value={form.company_name}
                      onChange={(e) => setForm((p) => ({ ...p, company_name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isBn ? "ট্রেড লাইসেন্স নম্বর *" : "Trade License Number *"}</Label>
                    <Input
                      placeholder={isBn ? "লাইসেন্স নম্বর" : "Enter trade license number"}
                      value={form.trade_license_number}
                      onChange={(e) => setForm((p) => ({ ...p, trade_license_number: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {isBn ? "কোম্পানি ফোন *" : "Company Phone *"}
                    </Label>
                    <Input
                      placeholder="+8801XXXXXXXXX"
                      value={form.company_phone}
                      onChange={(e) => setForm((p) => ({ ...p, company_phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {isBn ? "ব্যবসায়িক ইমেইল *" : "Business Email *"}
                    </Label>
                    <Input
                      type="email"
                      placeholder="company@example.com"
                      value={form.business_email}
                      onChange={(e) => setForm((p) => ({ ...p, business_email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {isBn ? "কোম্পানির ঠিকানা" : "Company Address"}
                    </Label>
                    <Input
                      placeholder={isBn ? "সম্পূর্ণ ঠিকানা" : "Full address"}
                      value={form.company_address}
                      onChange={(e) => setForm((p) => ({ ...p, company_address: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isBn ? "ওয়েবসাইট" : "Website"}</Label>
                    <Input
                      placeholder="https://example.com"
                      value={form.company_website}
                      onChange={(e) => setForm((p) => ({ ...p, company_website: e.target.value }))}
                    />
                  </div>
                </div>

                <Button onClick={() => setActiveStep(1)} className="w-full">
                  {isBn ? "পরবর্তী: লাইসেন্স আপলোড" : "Next: Upload License"}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Trade License Upload */}
          {activeStep === 1 && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    {isBn ? "ট্রেড লাইসেন্স আপলোড" : "Trade License Upload"}
                  </CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">
                  {isBn
                    ? "আপনার ট্রেড লাইসেন্সের ছবি বা PDF আপলোড করুন"
                    : "Upload a photo or PDF of your trade license"}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-primary">
                  {isBn
                    ? "গুরুত্বপূর্ণ: আপনার ট্রেড লাইসেন্স বৈধ এবং পাঠযোগ্য হতে হবে। ভুল বা জাল ডকুমেন্ট জমা দিলে অ্যাকাউন্ট ব্লক হতে পারে।"
                    : "Important: Your trade license must be valid and legible. Submitting fake documents may result in account suspension."}
                </div>

                <div className="space-y-2">
                  <Label>{isBn ? "ট্রেড লাইসেন্স ডকুমেন্ট *" : "Trade License Document *"}</Label>
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors overflow-hidden">
                    {licensePreview ? (
                      <img src={licensePreview} alt="Trade License" className="w-full h-full object-contain" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {isBn ? "ট্রেড লাইসেন্স এখানে আপলোড করুন" : "Click to upload trade license"}
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">PDF, JPEG, PNG (max 400KB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="application/pdf,image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={handleLicenseChange}
                    />
                  </label>
                </div>

                {licenseFile && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span className="text-emerald-700 dark:text-emerald-400">{licenseFile.name}</span>
                    <span className="text-emerald-600/60 ml-auto">{(licenseFile.size / 1024 / 1024).toFixed(1)}MB</span>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setActiveStep(0)} className="flex-1">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    {isBn ? "আগের" : "Back"}
                  </Button>
                  <Button onClick={() => setActiveStep(2)} disabled={!licenseFile} className="flex-1">
                    {isBn ? "পরবর্তী: পর্যালোচনা" : "Next: Review"}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Review & Submit / Status */}
          {activeStep === 2 && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BadgeCheck className="h-5 w-5 text-primary" />
                    {isBn ? "যাচাইকরণের অবস্থা" : "Verification Status"}
                  </CardTitle>
                  <StatusBadge state={statusInfo.state} isBn={isBn} />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isVerified ? (
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium text-emerald-700 dark:text-emerald-400">
                        {isBn ? "কোম্পানি যাচাইকৃত!" : "Company Verified!"}
                      </p>
                      <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">
                        {isBn ? "আপনার কোম্পানি সফলভাবে যাচাইকৃত হয়েছে" : "Your company has been successfully verified"}
                      </p>
                    </div>
                  </div>
                ) : isPending ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
                      <Clock className="h-5 w-5 text-amber-600" />
                      <div>
                        <p className="font-medium text-amber-700 dark:text-amber-400">
                          {isBn ? "এডমিন পর্যালোচনাধীন" : "Under Admin Review"}
                        </p>
                        <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
                          {isBn
                            ? "আপনার কোম্পানি তথ্য এডমিন পর্যালোচনার জন্য জমা দেওয়া হয়েছে। সাধারণত ২৪-৪৮ ঘণ্টা সময় লাগে।"
                            : "Your company details have been submitted for admin review. Usually takes 24-48 hours."}
                        </p>
                      </div>
                    </div>

                    {/* Show submitted details */}
                    {detail && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">{isBn ? "জমা দেওয়া তথ্য:" : "Submitted Details:"}</h4>
                        {detail.notes && (
                          <div className="p-3 rounded-lg bg-muted/50 text-sm whitespace-pre-line">{detail.notes}</div>
                        )}
                      </div>
                    )}
                  </div>
                ) : statusInfo.state === "rejected" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-400">
                          {isBn ? "যাচাইকরণ ব্যর্থ" : "Verification Rejected"}
                        </p>
                        {detail?.notes && (
                          <p className="text-xs text-red-600/80 dark:text-red-500/80 mt-1">{detail.notes}</p>
                        )}
                        <p className="text-xs text-red-600/80 dark:text-red-500/80 mt-1">
                          {isBn ? "অনুগ্রহ করে সঠিক তথ্য দিয়ে আবার জমা দিন।" : "Please resubmit with correct information."}
                        </p>
                      </div>
                    </div>
                    <Button onClick={() => setActiveStep(0)} className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      {isBn ? "আবার জমা দিন" : "Resubmit"}
                    </Button>
                  </div>
                ) : (
                  /* Not submitted yet - show review summary */
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {isBn ? "আপনার জমা দেওয়া তথ্য পর্যালোচনা করুন এবং সাবমিট করুন।" : "Review your submitted information and submit."}
                    </p>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground text-xs">{isBn ? "কোম্পানি" : "Company"}</span>
                        <p className="font-medium mt-1">{form.company_name || "-"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground text-xs">{isBn ? "লাইসেন্স" : "License No."}</span>
                        <p className="font-medium mt-1">{form.trade_license_number || "-"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground text-xs">{isBn ? "ফোন" : "Phone"}</span>
                        <p className="font-medium mt-1">{form.company_phone || "-"}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground text-xs">{isBn ? "ইমেইল" : "Email"}</span>
                        <p className="font-medium mt-1">{form.business_email || "-"}</p>
                      </div>
                    </div>

                    {licenseFile && (
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span>{licenseFile.name}</span>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setActiveStep(1)} className="flex-1">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        {isBn ? "আগের" : "Back"}
                      </Button>
                      <Button onClick={handleSubmit} disabled={submitting} className="flex-1">
                        {submitting ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {isBn ? "যাচাইকরণের জন্য জমা দিন" : "Submit for Verification"}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
          disabled={activeStep === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          {isBn ? "আগের" : "Previous"}
        </Button>
        <span className="text-sm text-muted-foreground">
          {activeStep + 1} / {STEPS.length}
        </span>
        <Button
          variant="outline"
          onClick={() => setActiveStep((s) => Math.min(STEPS.length - 1, s + 1))}
          disabled={activeStep === STEPS.length - 1}
        >
          {isBn ? "পরবর্তী" : "Next"}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}


