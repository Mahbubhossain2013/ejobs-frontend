"use client";

import React, { useState, Suspense, lazy } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useThemeStore } from "@/store/theme-store";
import PublicLayout from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const SocialLoginButtons = lazy(() => import("@/components/auth/social-login-buttons"));

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Phone is required"),
  company_name: z.string().min(2, "Company name is required"),
  address: z.string().min(5, "Address is required"),
  trade_license_number: z.string().optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
  password_confirmation: z.string(),
}).refine((d) => d.password === d.password_confirmation, { message: "Passwords do not match", path: ["password_confirmation"] });
type Form = z.infer<typeof schema>;

export default function EmployerRegisterClient() {
  const { language, settings } = useThemeStore();
  const isBn = language === "bn";
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
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
        window.location.href = "/employer/dashboard";
      }
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      const { toast } = await import("sonner");
      toast.error(msg || (isBn ? "নিবন্ধন ব্যর্থ" : "Registration failed"));
    } finally { setSubmitting(false); }
  };

  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-[70vh] py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{isBn ? "নিয়োগকর্তা নিবন্ধন" : "Employer Registration"}</CardTitle>
            <CardDescription>{isBn ? "সেরা প্রার্থীদের নিয়োগ দিন" : "Start hiring the best talent"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>{isBn ? "আপনার নাম" : "Your Name"}</Label>
                <Input placeholder="Admin Name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "কোম্পানির নাম" : "Company Name"}</Label>
                <Input placeholder="Acme Corp" {...register("company_name")} />
                {errors.company_name && <p className="text-sm text-destructive">{errors.company_name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "ইমেইল" : "Email"}</Label>
                <Input type="email" placeholder="company@example.com" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "ফোন নম্বর" : "Phone Number"}</Label>
                <Input type="tel" placeholder="01XXXXXXXXX" {...register("phone")} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "ঠিকানা" : "Address"}</Label>
                <Input placeholder="Dhaka, Bangladesh" {...register("address")} />
                {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "ট্রেড লাইসেন্স নম্বর" : "Trade License Number"} <span className="text-muted-foreground text-xs">({isBn ? "ঐচ্ছিক" : "Optional"})</span></Label>
                <Input placeholder="TRAD-12345" {...register("trade_license_number")} />
              </div>
              <div className="space-y-2">
                <Label>{isBn ? "ট্রেড লাইসেন্স ডকুমেন্ট" : "Trade License Document"} <span className="text-muted-foreground text-xs">({isBn ? "ঐচ্ছিক" : "Optional"})</span></Label>
                <Input type="file" accept=".pdf,.docx,.jpg,.jpeg,.png" onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} className="file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isBn ? "পাসওয়ার্ড" : "Password"}</Label>
                  <Input type="password" placeholder="••••••••" {...register("password")} />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>{isBn ? "নিশ্চিত" : "Confirm"}</Label>
                  <Input type="password" placeholder="••••••••" {...register("password_confirmation")} />
                  {errors.password_confirmation && <p className="text-sm text-destructive">{errors.password_confirmation.message}</p>}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{isBn ? "নিবন্ধন করুন" : "Create Account"}</Button>
            </form>
            <div className="mt-6"><Suspense fallback={<div className="h-16 bg-muted rounded animate-pulse" />}><SocialLoginButtons role="employer" /></Suspense></div>
            <div className="mt-4 text-center text-sm">
              <p>{isBn ? "ইতিমধ্যে অ্যাকাউন্ট আছে?" : "Already have an account?"}{" "}<Link href="/login" className="text-primary hover:underline font-medium">{isBn ? "লগইন" : "Sign In"}</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}