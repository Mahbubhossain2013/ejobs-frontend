"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  CheckCircle,
  Shield,
  Clock,
  Upload,
  Mail,
  Phone,
  CreditCard,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Loader2,
  XCircle,
  FileImage,
  Sparkles,
  BadgeCheck,
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

type StepKey = "email" | "phone" | "nid";

interface StepDef {
  key: StepKey;
  label: string;
  labelBn: string;
  icon: any;
  description: string;
  descriptionBn: string;
}

const STEPS: StepDef[] = [
  {
    key: "email",
    label: "Email Verification",
    labelBn: "ইমেইল যাচাইকরণ",
    icon: Mail,
    description: "Verify your email address with a 6-digit OTP code",
    descriptionBn: "একটি 6-অঙ্কের OTP কোড দিয়ে আপনার ইমেইল যাচাই করুন",
  },
  {
    key: "phone",
    label: "Phone Verification",
    labelBn: "ফোন যাচাইকরণ",
    icon: Phone,
    description: "Verify your mobile number via SMS OTP",
    descriptionBn: "SMS OTP এর মাধ্যমে আপনার মোবাইল নম্বর যাচাই করুন",
  },
  {
    key: "nid",
    label: "NID Verification",
    labelBn: "জাতীয় পরিচয়পত্র যাচাইকরণ",
    icon: CreditCard,
    description: "Verify your identity with National ID card details",
    descriptionBn: "জাতীয় পরিচয়পত্রের তথ্য দিয়ে আপনার পরিচয় যাচাই করুন",
  },
];

/* ─── Helpers ─── */
function getStatusInfo(
  key: StepKey,
  status: VerificationStatus | null
): { state: "verified" | "pending" | "rejected" | "none"; label: string; labelBn: string } {
  if (!status) return { state: "none", label: "Not Started", labelBn: "শুরু হয়নি" };

  const detail = status.details[key];
  if (status.summary[`${key}_verified` as keyof typeof status.summary]) {
    return { state: "verified", label: "Verified", labelBn: "যাচাইকৃত" };
  }
  if (detail?.status === "pending") {
    return { state: "pending", label: "Under Review", labelBn: "পর্যালোচনাধীন" };
  }
  if (detail?.status === "rejected") {
    return { state: "rejected", label: "Rejected", labelBn: "প্রত্যাখ্যাত" };
  }
  return { state: "none", label: "Not Started", labelBn: "শুরু হয়নি" };
}

function StatusIcon({ state }: { state: string }) {
  switch (state) {
    case "verified":
      return <CheckCircle className="h-5 w-5 text-emerald-500" />;
    case "pending":
      return <Clock className="h-5 w-5 text-amber-500" />;
    case "rejected":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />;
  }
}

/* ─── Main Component ─── */
export default function VerifyClient() {
  const { user } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();
  const searchParams = useSearchParams();
  const postRegistration = searchParams.get("post_registration") === "true";

  const [activeStep, setActiveStep] = useState<number>(0);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // Email state
  const [emailSending, setEmailSending] = useState(false);
  const [emailVerifying, setEmailVerifying] = useState(false);
  const [emailCode, setEmailCode] = useState("");
  const [emailCooldown, setEmailCooldown] = useState(0);

  // Phone state
  const [phone, setPhone] = useState(user?.phone || "");
  const [phoneSending, setPhoneSending] = useState(false);
  const [phoneVerifying, setPhoneVerifying] = useState(false);
  const [phoneCode, setPhoneCode] = useState("");
  const [phoneCooldown, setPhoneCooldown] = useState(0);

  // NID state
  const [nidForm, setNidForm] = useState({
    full_name: user?.name || "",
    nid_number: "",
    dob: "",
  });
  const [nidFront, setNidFront] = useState<File | null>(null);
  const [nidBack, setNidBack] = useState<File | null>(null);
  const [nidFrontPreview, setNidFrontPreview] = useState<string>("");
  const [nidBackPreview, setNidBackPreview] = useState<string>("");
  const [nidSubmitting, setNidSubmitting] = useState(false);

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

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Cooldown timers
  useEffect(() => {
    if (emailCooldown <= 0) return;
    const t = setTimeout(() => setEmailCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [emailCooldown]);

  useEffect(() => {
    if (phoneCooldown <= 0) return;
    const t = setTimeout(() => setPhoneCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [phoneCooldown]);

  // Auto-select first non-verified step
  useEffect(() => {
    if (verificationStatus) {
      const idx = STEPS.findIndex(
        (s) => !verificationStatus.summary[`${s.key}_verified` as keyof typeof verificationStatus.summary]
      );
      if (idx >= 0) setActiveStep(idx);
    }
  }, [verificationStatus]);

  /* ─── Email Handlers ─── */
  const sendEmailOtp = async () => {
    setEmailSending(true);
    try {
      await api.post("/verifications/email/request");
      toast.success(isBn ? "ইমেইলে কোড পাঠানো হয়েছে" : "Verification code sent to your email");
      setEmailCooldown(60);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send code");
    } finally {
      setEmailSending(false);
    }
  };

  const verifyEmail = async () => {
    if (!emailCode || emailCode.length !== 6) {
      toast.error(isBn ? "৬-অঙ্কের কোড দিন" : "Please enter the 6-digit code");
      return;
    }
    setEmailVerifying(true);
    try {
      await api.post("/verifications/email/confirm", { otp_code: emailCode });
      toast.success(isBn ? "ইমেইল যাচাইকৃত!" : "Email verified successfully!");
      setEmailCode("");
      fetchStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid code");
    } finally {
      setEmailVerifying(false);
    }
  };

  /* ─── Phone Handlers ─── */
  const sendPhoneOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error(isBn ? "সঠিক ফোন নম্বর দিন" : "Please enter a valid phone number");
      return;
    }
    setPhoneSending(true);
    try {
      await api.post("/verifications/phone/request", { phone });
      toast.success(isBn ? "ফোনে OTP কোড পাঠানো হয়েছে" : "OTP code sent to your phone");
      setPhoneCooldown(60);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    } finally {
      setPhoneSending(false);
    }
  };

  const verifyPhone = async () => {
    if (!phoneCode || phoneCode.length !== 6) {
      toast.error(isBn ? "৬-অঙ্কের OTP কোড দিন" : "Please enter the 6-digit OTP code");
      return;
    }
    setPhoneVerifying(true);
    try {
      await api.post("/verifications/phone/confirm", { otp_code: phoneCode });
      toast.success(isBn ? "ফোন যাচাইকৃত!" : "Phone verified successfully!");
      setPhoneCode("");
      fetchStatus();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Invalid OTP code");
    } finally {
      setPhoneVerifying(false);
    }
  };

  /* ─── NID Handlers ─── */
  const handleNidFront = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNidFront(file);
      setNidFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleNidBack = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNidBack(file);
      setNidBackPreview(URL.createObjectURL(file));
    }
  };

  const submitNid = async () => {
    if (!nidForm.nid_number || nidForm.nid_number.length < 10) {
      toast.error(isBn ? "সঠিক NID নম্বর দিন (কমপক্ষে ১০ অঙ্ক)" : "Please enter a valid NID number (min 10 digits)");
      return;
    }
    if (!nidForm.dob) {
      toast.error(isBn ? "জন্ম তারিখ দিন" : "Please enter your date of birth");
      return;
    }
    if (!nidFront) {
      toast.error(isBn ? "NID এর সামনের ছবি আপলোড করুন" : "Please upload the front side of your NID");
      return;
    }

    setNidSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("nid_number", nidForm.nid_number);
      formData.append("dob", nidForm.dob);
      formData.append("document_front", nidFront);
      if (nidBack) {
        formData.append("document_back", nidBack);
      }

      const res = await api.post("/verifications/nid", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.pending_manual) {
        toast.info(
          isBn
            ? "NID জমা হয়েছে। এডমিন পর্যালোচনার জন্য অপেক্ষা করুন।"
            : "NID submitted! Awaiting admin manual review."
        );
      } else {
        toast.success(isBn ? "NID যাচাইকৃত!" : "NID verified automatically!");
      }
      fetchStatus();
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Submission failed";
      if (err?.response?.status === 402) {
        toast.error(isBn ? "পর্যাপ্ত ব্যালেন্স নেই। ওয়ালেটে অর্থ যোগ করুন।" : msg);
      } else {
        toast.error(msg);
      }
    } finally {
      setNidSubmitting(false);
    }
  };

  /* ─── Render ─── */
  const completedCount = verificationStatus
    ? STEPS.filter((s) => verificationStatus.summary[`${s.key}_verified` as keyof typeof verificationStatus.summary]).length
    : 0;
  const overallVerified = verificationStatus?.summary.is_fully_verified || false;
  const percentage = Math.round((completedCount / STEPS.length) * 100);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          {isBn ? "যাচাইকরণ কেন্দ্র" : "Verification Center"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {isBn
            ? "আপনার অ্যাকাউন্ট যাচাই করুন এবং বিশ্বাসযোগ্য ব্যাজ অর্জন করুন"
            : "Complete all verification steps to earn trust badges and unlock features"}
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="overflow-hidden">
        <div className={`h-1.5 ${overallVerified ? "bg-emerald-500" : "bg-primary/20"}`}>
          <div
            className={`h-full transition-all duration-500 ${overallVerified ? "bg-emerald-500" : "bg-primary"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {overallVerified ? (
              <BadgeCheck className="h-8 w-8 text-emerald-500" />
            ) : (
              <Sparkles className="h-8 w-8 text-primary" />
            )}
            <div>
              <p className="font-semibold">
                {overallVerified
                  ? isBn
                    ? "সম্পূর্ণ যাচাইকৃত!"
                    : "Fully Verified!"
                  : isBn
                  ? `${percentage}% সম্পন্ন (${completedCount}/${STEPS.length})`
                  : `${percentage}% completed (${completedCount}/${STEPS.length})`}
              </p>
              <p className="text-xs text-muted-foreground">
                {overallVerified
                  ? isBn
                    ? "আপনার অ্যাকাউন্ট সম্পূর্ণরূপে যাচাইকৃত"
                    : "Your account is fully verified and trusted"
                  : isBn
                  ? "সব ধাপ সম্পন্ন করুন যাচাই ব্যাজ পেতে"
                  : "Complete all steps to earn the verified badge"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {overallVerified && (
              <Badge variant="success" className="text-sm gap-1">
                <CheckCircle className="h-3.5 w-3.5" />
                {isBn ? "যাচাইকৃত" : "Verified"}
              </Badge>
            )}
            {postRegistration && !overallVerified && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dashboard")}
                className="text-muted-foreground hover:text-foreground"
              >
                {isBn ? "পরে করুন" : "Skip for now"} →
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <div className="flex items-center gap-2">
        {STEPS.map((step, idx) => {
          const statusInfo = getStatusInfo(step.key, verificationStatus);
          const isActive = idx === activeStep;
          const StepIcon = step.icon;
          return (
            <button
              key={step.key}
              onClick={() => setActiveStep(idx)}
              className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                isActive
                  ? "border-primary bg-primary/5 text-primary shadow-sm"
                  : statusInfo.state === "verified"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                  : "border-border hover:border-primary/30 hover:bg-muted/50"
              }`}
            >
              <StatusIcon state={statusInfo.state} />
              <span className="hidden sm:inline truncate">
                {isBn ? step.labelBn : step.label}
              </span>
              <span className="sm:hidden">
                <StepIcon className="h-4 w-4" />
              </span>
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
          {activeStep === 0 && (
            <EmailStep
              isBn={isBn}
              status={getStatusInfo("email", verificationStatus)}
              emailCode={emailCode}
              setEmailCode={setEmailCode}
              sending={emailSending}
              verifying={emailVerifying}
              cooldown={emailCooldown}
              onSend={sendEmailOtp}
              onVerify={verifyEmail}
              userEmail={user?.email}
            />
          )}
          {activeStep === 1 && (
            <PhoneStep
              isBn={isBn}
              status={getStatusInfo("phone", verificationStatus)}
              phone={phone}
              setPhone={setPhone}
              phoneCode={phoneCode}
              setPhoneCode={setPhoneCode}
              sending={phoneSending}
              verifying={phoneVerifying}
              cooldown={phoneCooldown}
              onSend={sendPhoneOtp}
              onVerify={verifyPhone}
            />
          )}
          {activeStep === 2 && (
            <NidStep
              isBn={isBn}
              status={getStatusInfo("nid", verificationStatus)}
              form={nidForm}
              setForm={setNidForm}
              frontFile={nidFront}
              backFile={nidBack}
              frontPreview={nidFrontPreview}
              backPreview={nidBackPreview}
              onFrontChange={handleNidFront}
              onBackChange={handleNidBack}
              submitting={nidSubmitting}
              onSubmit={submitNid}
              detail={verificationStatus?.details.nid}
            />
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

/* ─── Email Step ─── */
function EmailStep({
  isBn,
  status,
  emailCode,
  setEmailCode,
  sending,
  verifying,
  cooldown,
  onSend,
  onVerify,
  userEmail,
}: {
  isBn: boolean;
  status: { state: string; label: string; labelBn: string };
  emailCode: string;
  setEmailCode: (v: string) => void;
  sending: boolean;
  verifying: boolean;
  cooldown: number;
  onSend: () => void;
  onVerify: () => void;
  userEmail?: string;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="h-5 w-5 text-primary" />
            {isBn ? "ইমেইল যাচাইকরণ" : "Email Verification"}
          </CardTitle>
          <StatusBadge state={status.state} isBn={isBn} />
        </div>
        <p className="text-sm text-muted-foreground">
          {isBn
            ? "আপনার ইমেইল ঠিকানায় একটি ৬-অঙ্কের যাচাইকরণ কোড পাঠানো হবে"
            : "A 6-digit verification code will be sent to your email address"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.state === "verified" ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                {isBn ? "ইমেইল যাচাইকৃত" : "Email Verified"}
              </p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">{userEmail}</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm">
              <span className="text-muted-foreground">{isBn ? "পাঠানো হবে:" : "Sending to:"}</span>
              <span className="font-medium">{userEmail}</span>
            </div>

            {status.state === "rejected" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                {isBn
                  ? "পূর্ববর্তী যাচাইকরণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
                  : "Previous verification failed. Please try again."}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={onSend} disabled={sending || cooldown > 0} variant="outline" className="shrink-0">
                {sending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : cooldown > 0 ? (
                  <Clock className="h-4 w-4 mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {cooldown > 0
                  ? `${cooldown}s`
                  : isBn
                  ? "কোড পাঠান"
                  : "Send Code"}
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{isBn ? "যাচাইকরণ কোড" : "Verification Code"}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="000000"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="max-w-[200px] text-center text-lg tracking-[0.3em] font-mono"
                  maxLength={6}
                />
                <Button onClick={onVerify} disabled={verifying || emailCode.length !== 6}>
                  {verifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  {isBn ? "যাচাই করুন" : "Verify"}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Phone Step ─── */
function PhoneStep({
  isBn,
  status,
  phone,
  setPhone,
  phoneCode,
  setPhoneCode,
  sending,
  verifying,
  cooldown,
  onSend,
  onVerify,
}: {
  isBn: boolean;
  status: { state: string; label: string; labelBn: string };
  phone: string;
  setPhone: (v: string) => void;
  phoneCode: string;
  setPhoneCode: (v: string) => void;
  sending: boolean;
  verifying: boolean;
  cooldown: number;
  onSend: () => void;
  onVerify: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-primary" />
            {isBn ? "ফোন যাচাইকরণ" : "Phone Verification"}
          </CardTitle>
          <StatusBadge state={status.state} isBn={isBn} />
        </div>
        <p className="text-sm text-muted-foreground">
          {isBn
            ? "আপনার মোবাইল নম্বরে SMS OTP কোড পাঠানো হবে"
            : "An SMS OTP code will be sent to your mobile number"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.state === "verified" ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                {isBn ? "ফোন যাচাইকৃত" : "Phone Verified"}
              </p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">{phone}</p>
            </div>
          </div>
        ) : (
          <>
            {status.state === "rejected" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4 w-4" />
                {isBn
                  ? "পূর্ববর্তী যাচাইকরণ ব্যর্থ হয়েছে। আবার চেষ্টা করুন।"
                  : "Previous verification failed. Please try again."}
              </div>
            )}

            <div className="space-y-2">
              <Label>{isBn ? "মোবাইল নম্বর" : "Mobile Number"}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="+8801XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="max-w-[250px]"
                />
                <Button onClick={onSend} disabled={sending || cooldown > 0} variant="outline" className="shrink-0">
                  {sending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : cooldown > 0 ? (
                    <Clock className="h-4 w-4 mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {cooldown > 0 ? `${cooldown}s` : isBn ? "OTP পাঠান" : "Send OTP"}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>{isBn ? "OTP কোড" : "OTP Code"}</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="000000"
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="max-w-[200px] text-center text-lg tracking-[0.3em] font-mono"
                  maxLength={6}
                />
                <Button onClick={onVerify} disabled={verifying || phoneCode.length !== 6}>
                  {verifying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  {isBn ? "যাচাই করুন" : "Verify"}
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── NID Step ─── */
function NidStep({
  isBn,
  status,
  form,
  setForm,
  frontFile,
  backFile,
  frontPreview,
  backPreview,
  onFrontChange,
  onBackChange,
  submitting,
  onSubmit,
  detail,
}: {
  isBn: boolean;
  status: { state: string; label: string; labelBn: string };
  form: { full_name: string; nid_number: string; dob: string };
  setForm: React.Dispatch<React.SetStateAction<{ full_name: string; nid_number: string; dob: string }>>;
  frontFile: File | null;
  backFile: File | null;
  frontPreview: string;
  backPreview: string;
  onFrontChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBackChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  submitting: boolean;
  onSubmit: () => void;
  detail: any;
}) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" />
            {isBn ? "জাতীয় পরিচয়পত্র যাচাইকরণ" : "NID Verification"}
          </CardTitle>
          <StatusBadge state={status.state} isBn={isBn} />
        </div>
        <p className="text-sm text-muted-foreground">
          {isBn
            ? "আপনার NID তথ্য এবং ডকুমেন্ট জমা দিন। এডমিন যাচাই করবে।"
            : "Submit your NID details and documents for admin verification"}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {status.state === "verified" ? (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle className="h-5 w-5 text-emerald-600" />
            <div>
              <p className="font-medium text-emerald-700 dark:text-emerald-400">
                {isBn ? "পরিচয় যাচাইকৃত" : "Identity Verified"}
              </p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">
                {isBn ? "আপনার NID সফলভাবে যাচাইকৃত হয়েছে" : "Your NID has been successfully verified"}
              </p>
            </div>
          </div>
        ) : status.state === "pending" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-700 dark:text-amber-400">
                  {isBn ? "পর্যালোচনাধীন" : "Under Review"}
                </p>
                <p className="text-xs text-amber-600/80 dark:text-amber-500/80">
                  {isBn
                    ? "আপনার NID এডমিন পর্যালোচনার জন্য জমা দেওয়া হয়েছে। সাধারণত ২৪-৪৮ ঘণ্টা সময় লাগে।"
                    : "Your NID has been submitted for admin review. Usually takes 24-48 hours."}
                </p>
              </div>
            </div>
            {detail?.ai_confidence_score && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <span className="text-muted-foreground">{isBn ? "AI আত্মবিশ্বাস স্কোর:" : "AI Confidence:"} </span>
                <span className="font-mono font-medium">{detail.ai_confidence_score}%</span>
              </div>
            )}
            {detail?.notes && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <span className="text-muted-foreground">{isBn ? "নোট:" : "Notes:"} </span>
                <span>{detail.notes}</span>
              </div>
            )}
          </div>
        ) : (
          <>
            {status.state === "rejected" && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <div>
                  <p className="font-medium">{isBn ? "যাচাইকরণ ব্যর্থ" : "Verification Failed"}</p>
                  {detail?.notes && <p className="text-xs mt-1 opacity-80">{detail.notes}</p>}
                  <p className="text-xs mt-1">
                    {isBn ? "অনুগ্রহ করে সঠিক তথ্য দিয়ে আবার জমা দিন।" : "Please resubmit with correct details."}
                  </p>
                </div>
              </div>
            )}

            {/* NID Info Form */}
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 text-sm text-primary">
                {isBn
                  ? "গুরুত্বপূর্ণ: আপনার NID তথ্য সঠিকভাবে প্রদান করুন। ভুল তথ্য দিলে যাচাইকরণ ব্যর্থ হবে।"
                  : "Important: Provide accurate NID information. Incorrect details will result in rejection."}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isBn ? "পুরো নাম (NID অনুযায়ী)" : "Full Name (as on NID)"}</Label>
                  <Input
                    placeholder={isBn ? "আপনার পুরো নাম" : "Your full name as on NID"}
                    value={form.full_name}
                    onChange={(e) => setForm((p) => ({ ...p, full_name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "জাতীয় পরিচয়পত্র নম্বর" : "National ID Number"}</Label>
                  <Input
                    placeholder={isBn ? "NID নম্বর (১০-১৭ অঙ্ক)" : "NID Number (10-17 digits)"}
                    value={form.nid_number}
                    onChange={(e) => setForm((p) => ({ ...p, nid_number: e.target.value.replace(/\D/g, "").slice(0, 17) }))}
                    maxLength={17}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{isBn ? "জন্ম তারিখ" : "Date of Birth"}</Label>
                <Input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm((p) => ({ ...p, dob: e.target.value }))}
                  className="max-w-[250px]"
                />
              </div>
            </div>

            <Separator />

            {/* Document Upload */}
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <FileImage className="h-4 w-4" />
                {isBn ? "ডকুমেন্ট আপলোড" : "Document Upload"}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Front Side */}
                <div className="space-y-2">
                  <Label>{isBn ? "সামনের দিক" : "Front Side"} *</Label>
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors overflow-hidden">
                    {frontPreview ? (
                      <img src={frontPreview} alt="NID Front" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {isBn ? "NID এর সামনের ছবি" : "Front side of NID"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">JPEG, PNG (max 400KB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={onFrontChange}
                    />
                  </label>
                </div>

                {/* Back Side */}
                <div className="space-y-2">
                  <Label>{isBn ? "পিছনের দিক" : "Back Side"}</Label>
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-lg cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors overflow-hidden">
                    {backPreview ? (
                      <img src={backPreview} alt="NID Back" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center p-4">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {isBn ? "NID এর পিছনের ছবি" : "Back side of NID"}
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 mt-1">JPEG, PNG (max 400KB)</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      className="hidden"
                      onChange={onBackChange}
                    />
                  </label>
                </div>
              </div>
            </div>

            <Button onClick={onSubmit} disabled={submitting} className="w-full">
              {submitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              {isBn ? "NID জমা দিন" : "Submit NID Verification"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ state, isBn }: { state: string; isBn: boolean }) {
  switch (state) {
    case "verified":
      return (
        <Badge variant="success" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          {isBn ? "যাচাইকৃত" : "Verified"}
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="outline" className="gap-1 border-amber-300 text-amber-600">
          <Clock className="h-3 w-3" />
          {isBn ? "পর্যালোচনাধীন" : "Pending"}
        </Badge>
      );
    case "rejected":
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="h-3 w-3" />
          {isBn ? "প্রত্যাখ্যাত" : "Rejected"}
        </Badge>
      );
    default:
      return (
        <Badge variant="secondary" className="gap-1">
          {isBn ? "শুরু হয়নি" : "Not Started"}
        </Badge>
      );
  }
}
