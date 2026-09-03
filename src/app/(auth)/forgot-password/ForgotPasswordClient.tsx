"use client";

import React from "react";
import Link from "next/link";
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
import { Briefcase, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

const schema = z.object({ email: z.string().email("Invalid email") });
type Form = z.infer<typeof schema>;

export default function ForgotPasswordClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
      toast.success(isBn ? "ইমেইল পাঠানো হয়েছে" : "Reset link sent!");
    } catch {
      toast.error(isBn ? "ব্যর্থ" : "Failed to send reset link");
    }
  };

  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-[70vh] py-12 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isBn ? "পাসওয়ার্ড রিসেট" : "Reset Password"}
            </CardTitle>
            <CardDescription>
              {isBn ? "আপনার ইমেইল লিখুন" : "Enter your email to receive a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center py-6 space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {isBn ? "রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে।" : "We've sent a password reset link to your email."}
                </p>
                <Button variant="link" asChild>
                  <Link href="/login">{isBn ? "লগইনে ফিরে যান" : "Back to Login"}</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>{isBn ? "ইমেইল" : "Email"}</Label>
                  <Input type="email" placeholder="you@example.com" {...register("email")} />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {isBn ? "রিসেট লিংক পাঠান" : "Send Reset Link"}
                </Button>
                <div className="text-center text-sm">
                  <Link href="/login" className="text-primary hover:underline">
                    {isBn ? "লগইনে ফিরে যান" : "Back to Login"}
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
