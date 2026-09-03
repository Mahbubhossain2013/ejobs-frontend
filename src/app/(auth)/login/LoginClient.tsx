"use client";

import React, { useState, useEffect, Suspense, lazy } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/auth-store";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";
import { authService } from "@/services/auth.service";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { UserRole } from "@/types";
import { getStorageUrl } from "@/lib/utils";

const SocialLoginButtons = lazy(() => import("@/components/auth/social-login-buttons"));

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginForm = z.infer<typeof loginSchema>;

function SSOHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();
  const [ssoProcessing, setSsoProcessing] = useState(false);
  const { language } = useThemeStore();
  const isBn = language === "bn";

  useEffect(() => {
    const ssoToken = searchParams.get("sso_token");
    const role = searchParams.get("role") as UserRole | null;
    if (ssoToken && role) {
      setSsoProcessing(true);
      api.get("/user", { headers: { Authorization: `Bearer ${ssoToken}` } })
        .then((res) => {
          const user = res.data.data || res.data;
          setAuth(user, ssoToken, role);
          toast.success(isBn ? "SSO লগইন সফল!" : "SSO login successful!");
          router.push(role === "employer" ? "/employer/dashboard" : role === "admin" ? "/admin/dashboard" : "/dashboard");
        })
        .catch(() => { toast.error(isBn ? "SSO লগইন ব্যর্থ" : "SSO login failed"); setSsoProcessing(false); router.replace("/login"); });
    }
  }, []);

  if (!ssoProcessing) return null;
  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md"><CardContent className="flex flex-col items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /><p className="text-muted-foreground mt-2">{isBn ? "SSO লগইন প্রক্রিয়া চলছে..." : "Processing SSO login..."}</p></CardContent></Card>
      </div>
    </PublicLayout>
  );
}

function LoginClientInner() {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const router = useRouter();
  const { login, verify2fa } = useAuth();
  const searchParams = useSearchParams();
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [twoFactorMethod, setTwoFactorMethod] = useState<"totp" | "sms" | "email">("totp");
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (login.data?.requires_2fa && login.data?.temp_token) {
      const method = (login.data as any).two_factor_method || "totp";
      setTwoFactorMethod(method);
      setTempToken(login.data.temp_token);
      toast.info(isBn ? "২-ফ্যাক্টর কোড লিখুন" : "Enter your 2FA code");
      if (method === "sms" || method === "email") {
        authService.sendLoginOtp(login.data.temp_token).then(() => { setOtpSent(true); setCountdown(60); }).catch(() => {});
      }
    }
  }, [login.data, isBn]);

  useEffect(() => {
    if (countdown <= 0) return; const t = setTimeout(() => setCountdown((c) => c - 1), 1000); return () => clearTimeout(t);
  }, [countdown]);

  const handleSendCode = async () => {
    if (!tempToken) return;
    try { await authService.sendLoginOtp(tempToken); setOtpSent(true); setCountdown(60); toast.success(isBn ? "কোড পাঠানো হয়েছে" : "Code sent"); } catch { toast.error(isBn ? "কোড পাঠাতে ব্যর্থ" : "Failed to send code"); }
  };

  const ssoToken = searchParams.get("sso_token");
  if (ssoToken && searchParams.get("role")) return <SSOHandler />;

  if (tempToken) {
    const handleOtpSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (otpCode.length < 6) { toast.error(isBn ? "৬ ডিজিট কোড দিন" : "Enter 6-digit code"); return; }
      if (twoFactorMethod === "sms" || twoFactorMethod === "email") {
        try {
          const result = await authService.verifyLoginOtp(tempToken, otpCode);
          if (result.status) {
            const { setAuth } = useAuthStore.getState();
            const userRole = (result.role || result.user?.role || "candidate") as UserRole;
            setAuth(result.user ?? null, result.token || "", userRole);
            toast.success(isBn ? "লগইন সফল!" : "Login successful!");
            router.push(userRole === "employer" ? "/employer/dashboard" : userRole === "admin" ? "/admin/dashboard" : "/dashboard");
          } else { toast.error(result.message || "Verification failed"); }
        } catch { toast.error(isBn ? "যাচাইকরণ ব্যর্থ" : "Verification failed"); }
      } else { verify2fa.mutate({ temp_token: tempToken, code: otpCode }); }
    };

    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-[70vh] py-12 px-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {settings.site_logo ? <Image src={getStorageUrl(settings.site_logo)!} alt="" width={64} height={64} className="h-16 w-auto object-contain" unoptimized /> : <p className="text-2xl font-bold text-primary">{settings.site_name || "eJobs"}</p>}
              </div>
              <CardTitle className="text-2xl">{isBn ? "২-ফ্যাক্টর যাচাইকরণ" : "2-Factor Verification"}</CardTitle>
              <CardDescription>{twoFactorMethod === "sms" ? (isBn ? "মোবাইলে কোড লিখুন" : "Enter code sent to your phone") : twoFactorMethod === "email" ? (isBn ? "ইমেইলে কোড লিখুন" : "Enter code sent to your email") : (isBn ? "অ্যাপ থেকে কোড লিখুন" : "Enter code from authenticator app")}</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleOtpSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>{isBn ? "৬-ডিজিটের কোড" : "6-Digit Code"}</Label>
                  <Input type="text" inputMode="numeric" maxLength={6} placeholder="000000" className="text-center text-2xl tracking-widest font-mono py-6" value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))} autoFocus />
                </div>
                {(twoFactorMethod === "sms" || twoFactorMethod === "email") && (
                  <div className="text-center">
                    <Button type="button" variant="link" className="text-sm p-0 h-auto" onClick={handleSendCode} disabled={countdown > 0}>
                      {countdown > 0 ? `${isBn ? "পুনরায় পাঠান" : "Resend"} (${countdown}s)` : isBn ? "কোড পাঠান" : "Send Code"}
                    </Button>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button type="button" variant="outline" className="w-1/3" onClick={() => { setTempToken(null); setOtpCode(""); login.reset(); }}>{isBn ? "বাতিল" : "Cancel"}</Button>
                  <Button type="submit" className="w-2/3" disabled={verify2fa.isPending}>{verify2fa.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{isBn ? "যাচাই করুন" : "Verify"}</Button>
                </div>
              </form>
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
            <div className="mx-auto mb-4">
              {settings.site_logo ? <Image src={getStorageUrl(settings.site_logo)!} alt="" width={64} height={64} className="h-16 w-auto object-contain" unoptimized /> : <p className="text-2xl font-bold text-primary">{settings.site_name || "eJobs"}</p>}
            </div>
            <CardTitle className="text-2xl">{isBn ? "লগইন" : "Welcome Back"}</CardTitle>
            <CardDescription>{isBn ? "আপনার অ্যাকাউন্টে লগইন করুন" : "Sign in to your account"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit((data) => login.mutate(data))} className="space-y-4">
              <div className="space-y-2">
                <Label>{isBn ? "ইমেইল" : "Email"}</Label>
                <Input type="email" placeholder="you@example.com" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "পাসওয়ার্ড" : "Password"}</Label>
                <Input type="password" placeholder="••••••••" {...register("password")} />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>
              <div className="flex items-center justify-end text-sm"><Link href="/forgot-password" className="text-primary hover:underline">{isBn ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}</Link></div>
              <Button type="submit" className="w-full" disabled={login.isPending}>{login.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{isBn ? "লগইন" : "Sign In"}</Button>
            </form>
            <div className="mt-6"><Suspense fallback={<div className="h-16 bg-muted rounded animate-pulse" />}><SocialLoginButtons role="candidate" /></Suspense></div>
            <div className="mt-4 text-center text-sm">
              <p>{isBn ? "নতুন ব্যবহারকারী?" : "New here?"}{" "}<Link href="/register" className="text-primary hover:underline font-medium">{isBn ? "নিবন্ধন করুন" : "Register"}</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}

export default function LoginClient() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <LoginClientInner />
    </Suspense>
  );
}