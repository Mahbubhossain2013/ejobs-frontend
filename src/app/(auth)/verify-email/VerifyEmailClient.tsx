"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { authService } from "@/services/auth.service";
import PublicLayout from "@/components/layout/PublicLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Briefcase, Mail, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function VerifyEmailClient() {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await authService.forgotPassword("resend-verification");
      setSent(true);
      toast.success(isBn ? "ইমেইল পুনরায় পাঠানো হয়েছে" : "Verification email resent!");
    } catch {
      toast.error(isBn ? "ব্যর্থ" : "Failed to resend");
    } finally {
      setSending(false);
    }
  };

  return (
    <PublicLayout>
      <div className="flex items-center justify-center min-h-[70vh] py-12 px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              {isBn ? "ইমেইল যাচাই করুন" : "Verify Your Email"}
            </CardTitle>
            <CardDescription>
              {isBn
                ? "আপনার ইমেইলে একটি যাচাইকরণ লিংক পাঠানো হয়েছে"
                : "We've sent a verification link to your email address"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sent ? (
              <div className="space-y-4">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                <p className="text-sm text-muted-foreground">
                  {isBn ? "নতুন যাচাইকরণ লিংক পাঠানো হয়েছে" : "A new verification link has been sent."}
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {isBn
                  ? "আপনার ইমেইল ইনবক্স চেক করুন এবং লিংকে ক্লিক করুন"
                  : "Check your inbox and click the verification link"}
              </p>
            )}
            <Button onClick={handleResend} disabled={sending} variant="outline" className="w-full">
              {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {isBn ? "পুনরায় পাঠান" : "Resend Verification Email"}
            </Button>
            <Link href="/login" className="block text-sm text-primary hover:underline">
              {isBn ? "লগইনে ফিরে যান" : "Back to Login"}
            </Link>
          </CardContent>
        </Card>
      </div>
    </PublicLayout>
  );
}
