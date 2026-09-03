"use client";

import React, { useState, Suspense, lazy, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useThemeStore } from "@/store/theme-store";
import { authService } from "@/services/auth.service";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Briefcase, User, Building2, CheckCircle, Mail, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";

const SocialLoginButtons = lazy(() => import("@/components/auth/social-login-buttons"));

const candidateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, { message: "Passwords do not match", path: ["password_confirmation"] });
type CandidateForm = z.infer<typeof candidateSchema>;

const employerSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone is required"),
  company_name: z.string().min(2, "Company name is required"),
  address: z.string().min(5, "Address is required"),
  trade_license_number: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, { message: "Passwords do not match", path: ["password_confirmation"] });
type EmployerForm = z.infer<typeof employerSchema>;

function RegisterClientInner() {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("role") === "employer" ? "employer" : "candidate";
  const [activeTab, setActiveTab] = useState<"candidate" | "employer">(initialTab);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // OTP verification state
  const [registeredRole, setRegisteredRole] = useState<UserRole | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const candidateForm = useForm<CandidateForm>({ resolver: zodResolver(candidateSchema) });
  const employerForm = useForm<EmployerForm>({ resolver: zodResolver(employerSchema) });

  const handleCandidateSubmit = async (data: CandidateForm) => {
    setSubmitting(true);
    try {
      const res = await authService.register({ ...data, role: "candidate" });
      const userRole = (res.role || res.user?.role || "candidate") as UserRole;
      if (res.token && res.user) {
        const { useAuthStore } = await import("@/store/auth-store");
        useAuthStore.getState().setAuth(res.user, res.token, userRole);
      }
      setRegisteredRole(userRole);
      toast.success(isBn ? "নিবন্ধন সফল! এখন ইমেইল যাচাই করুন।" : "Registration successful! Please verify your email.");
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || (isBn ? "নিবন্ধন ব্যর্থ" : "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmployerSubmit = async (data: EmployerForm) => {
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);
      formData.append("company_name", data.company_name);
      formData.append("address", data.address);
      formData.append("trade_license_number", data.trade_license_number ?? "");
      formData.append("password", data.password);
      formData.append("password_confirmation", data.password_confirmation);
      formData.append("role", "employer");
      if (licenseFile) formData.append("trade_license_document", licenseFile);

      const api = (await import("@/lib/api-client")).default;
      const res = await api.post("/register", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const result = res.data;
      if (result.token && result.user) {
        const { useAuthStore } = await import("@/store/auth-store");
        useAuthStore.getState().setAuth(result.user, result.token, "employer");
        setRegisteredRole("employer");
        toast.success(isBn ? "নিবন্ধন সফল! এখন ইমেইল যাচাই করুন।" : "Registration successful! Please verify your email.");
      }
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || (isBn ? "নিবন্ধন ব্যর্থ" : "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      await authService.requestEmailOtp();
      setOtpSent(true);
      setCountdown(60);
      toast.success(isBn ? "OTP কোড পাঠানো হয়েছে" : "OTP code sent to your email");
    } catch {
      toast.error(isBn ? "OTP পাঠাতে ব্যর্থ" : "Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otpCode.length !== 6) {
      toast.error(isBn ? "৬ ডিজিট কোড দিন" : "Enter 6-digit code");
      return;
    }
    setVerifyingOtp(true);
    try {
      await authService.confirmEmailOtp(otpCode);
      setOtpVerified(true);
      toast.success(isBn ? "ইমেইল যাচাই সফল!" : "Email verified successfully!");
    } catch {
      toast.error(isBn ? "ভুল কোড" : "Invalid code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSkipVerification = () => {
    if (registeredRole === "employer") {
      router.push("/employer/dashboard");
    } else {
      router.push("/dashboard");
    }
  };

  // OTP Verification screen
  if (registeredRole && !otpVerified) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[70vh] py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">{isBn ? "ইমেইল যাচাই করুন" : "Verify Your Email"}</CardTitle>
              <CardDescription>
                {otpSent
                  ? (isBn ? "আপনার ইমেইলে একটি ৬-ডিজিট কোড পাঠানো হয়েছে" : "A 6-digit code has been sent to your email")
                  : (isBn ? "নিবন্ধন সম্পন্ন করতে ইমেইল যাচাই করুন" : "Verify your email to complete registration")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!otpSent ? (
                <Button onClick={handleSendOtp} disabled={sendingOtp} className="w-full">
                  {sendingOtp && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isBn ? "OTP কোড পাঠান" : "Send OTP Code"}
                </Button>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>{isBn ? "৬-ডিজিটের কোড" : "6-Digit Code"}</Label>
                    <Input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      className="text-center text-2xl tracking-widest font-mono py-6"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      autoFocus
                    />
                  </div>
                  <div className="text-center">
                    <Button type="button" variant="link" className="text-sm p-0 h-auto" onClick={handleSendOtp} disabled={countdown > 0}>
                      {countdown > 0 ? `${isBn ? "পুনরায় পাঠান" : "Resend"} (${countdown}s)` : isBn ? "কোড পুনরায় পাঠান" : "Resend Code"}
                    </Button>
                  </div>
                  <Button onClick={handleVerifyOtp} disabled={verifyingOtp || otpCode.length !== 6} className="w-full">
                    {verifyingOtp && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {isBn ? "যাচাই করুন" : "Verify"}
                  </Button>
                </>
              )}
              <Button variant="ghost" onClick={handleSkipVerification} className="w-full text-muted-foreground">
                {isBn ? "এখনই যাচাই না করে যান" : "Skip for now"}
              </Button>
              <div className="text-center">
                <Button variant="link" className="text-sm p-0 h-auto" onClick={() => { setRegisteredRole(null); setOtpSent(false); setOtpCode(""); }}>
                  <ArrowLeft className="h-3 w-3 mr-1" />
                  {isBn ? "ফিরে যান" : "Go back"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  // OTP Verified success screen
  if (otpVerified) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[70vh] py-12 px-4">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 dark:bg-green-950/40 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">{isBn ? "যাচাই সফল!" : "Verification Complete!"}</CardTitle>
              <CardDescription>{isBn ? "আপনার ইমেইল সফলভাবে যাচাই করা হয়েছে" : "Your email has been verified successfully"}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleSkipVerification} className="w-full">
                {isBn ? "ড্যাশবোর্ডে যান" : "Go to Dashboard"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-[70vh] py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{isBn ? "অ্যাকাউন্ট তৈরি করুন" : "Create Account"}</CardTitle>
            <CardDescription>{isBn ? "আপনার পছন্দের পথ বেছে নিন" : "Choose your path to get started"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Role Tabs */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab("candidate")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "candidate"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="h-4 w-4" />
                {isBn ? "প্রার্থী" : "Candidate"}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("employer")}
                className={`flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "employer"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building2 className="h-4 w-4" />
                {isBn ? "নিয়োগকর্তা" : "Employer"}
              </button>
            </div>

            {/* Candidate Form */}
            {activeTab === "candidate" && (
              <form onSubmit={candidateForm.handleSubmit(handleCandidateSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>{isBn ? "পুরো নাম" : "Full Name"}</Label>
                  <Input placeholder="John Doe" {...candidateForm.register("name")} />
                  {candidateForm.formState.errors.name && <p className="text-sm text-destructive">{candidateForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "ইমেইল" : "Email"}</Label>
                  <Input type="email" placeholder="you@example.com" {...candidateForm.register("email")} />
                  {candidateForm.formState.errors.email && <p className="text-sm text-destructive">{candidateForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "ফোন নম্বর" : "Phone Number"}</Label>
                  <Input type="tel" placeholder="01XXXXXXXXX" {...candidateForm.register("phone")} />
                  {candidateForm.formState.errors.phone && <p className="text-sm text-destructive">{candidateForm.formState.errors.phone.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isBn ? "পাসওয়ার্ড" : "Password"}</Label>
                    <Input type="password" placeholder="••••••••" {...candidateForm.register("password")} />
                    {candidateForm.formState.errors.password && <p className="text-sm text-destructive">{candidateForm.formState.errors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>{isBn ? "নিশ্চিত করুন" : "Confirm"}</Label>
                    <Input type="password" placeholder="••••••••" {...candidateForm.register("password_confirmation")} />
                    {candidateForm.formState.errors.password_confirmation && <p className="text-sm text-destructive">{candidateForm.formState.errors.password_confirmation.message}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isBn ? "নিবন্ধন করুন" : "Create Account"}
                </Button>
              </form>
            )}

            {/* Employer Form */}
            {activeTab === "employer" && (
              <form onSubmit={employerForm.handleSubmit(handleEmployerSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>{isBn ? "আপনার নাম" : "Your Name"}</Label>
                  <Input placeholder="Admin Name" {...employerForm.register("name")} />
                  {employerForm.formState.errors.name && <p className="text-sm text-destructive">{employerForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "কোম্পানির নাম" : "Company Name"}</Label>
                  <Input placeholder="Acme Corp" {...employerForm.register("company_name")} />
                  {employerForm.formState.errors.company_name && <p className="text-sm text-destructive">{employerForm.formState.errors.company_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "ইমেইল" : "Email"}</Label>
                  <Input type="email" placeholder="company@example.com" {...employerForm.register("email")} />
                  {employerForm.formState.errors.email && <p className="text-sm text-destructive">{employerForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "ফোন নম্বর" : "Phone Number"}</Label>
                  <Input type="tel" placeholder="01XXXXXXXXX" {...employerForm.register("phone")} />
                  {employerForm.formState.errors.phone && <p className="text-sm text-destructive">{employerForm.formState.errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "ঠিকানা" : "Address"}</Label>
                  <Input placeholder="Dhaka, Bangladesh" {...employerForm.register("address")} />
                  {employerForm.formState.errors.address && <p className="text-sm text-destructive">{employerForm.formState.errors.address.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "ট্রেড লাইসেন্স নম্বর" : "Trade License Number"} <span className="text-muted-foreground text-xs">({isBn ? "ঐচ্ছিক" : "Optional"})</span></Label>
                  <Input placeholder="TRAD-12345" {...employerForm.register("trade_license_number")} />
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "ট্রেড লাইসেন্স ডকুমেন্ট" : "Trade License Document"} <span className="text-muted-foreground text-xs">({isBn ? "ঐচ্ছিক" : "Optional"})</span></Label>
                  <Input type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} className="file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isBn ? "পাসওয়ার্ড" : "Password"}</Label>
                    <Input type="password" placeholder="••••••••" {...employerForm.register("password")} />
                    {employerForm.formState.errors.password && <p className="text-sm text-destructive">{employerForm.formState.errors.password.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>{isBn ? "নিশ্চিত" : "Confirm"}</Label>
                    <Input type="password" placeholder="••••••••" {...employerForm.register("password_confirmation")} />
                    {employerForm.formState.errors.password_confirmation && <p className="text-sm text-destructive">{employerForm.formState.errors.password_confirmation.message}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isBn ? "নিবন্ধন করুন" : "Create Account"}
                </Button>
              </form>
            )}

            <div className="mt-4">
              <Suspense fallback={<div className="h-16 bg-muted rounded animate-pulse" />}>
                <SocialLoginButtons role={activeTab} />
              </Suspense>
            </div>

            <div className="mt-4 text-center text-sm space-y-2">
              <p>{isBn ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}<Link href="/login" className="text-primary hover:underline font-medium">{isBn ? "লগইন" : "Sign In"}</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}

export default function RegisterClient() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <RegisterClientInner />
    </Suspense>
  );
}
