"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Smartphone, Mail, KeyRound, Loader2, Copy, Check } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";

type Method = "totp" | "sms" | "email";

export function TwoFactorSettings() {
  const [loading, setLoading] = useState(true);
  const [enabled, setEnabled] = useState(false);
  const [method, setMethod] = useState<Method>("totp");
  const [hasPhone, setHasPhone] = useState(false);
  const [userPhone, setUserPhone] = useState<string>("");

  const [setupMode, setSetupMode] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<Method>("totp");
  const [otpauthUri, setOtpauthUri] = useState("");
  const [secret, setSecret] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const [disableMode, setDisableMode] = useState(false);
  const [disableCode, setDisableCode] = useState("");

  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    authService.get2faStatus().then((res) => {
      setEnabled(res.enabled);
      setMethod(res.method);
      setHasPhone(res.has_phone);
      setUserPhone(res.phone || res.user_phone || "");
      setUserEmail(res.email || "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const startTotpSetup = async () => {
    setSubmitting(true);
    try {
      const res = await authService.setup2faTotp();
      const email = encodeURIComponent(userEmail || res.email || "user@example.com");
      const issuer = encodeURIComponent("JobPortalApp");
      const otpauth = res.otpauth_uri || `otpauth://totp/JobPortalApp:${email}?secret=${res.secret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`;
      setOtpauthUri(otpauth);
      setSecret(res.secret);
      setSetupMode(true);
      setSelectedMethod("totp");
    } catch {
      toast.error("Failed to initialize 2FA setup");
    } finally {
      setSubmitting(false);
    }
  };

  const sendOtp = async (ch: "sms" | "email") => {
    if (ch === "sms" && !userPhone) {
      toast.error("Please add a phone number to your profile first");
      return;
    }
    setSendingOtp(true);
    try {
      const phone = ch === "sms" ? userPhone : undefined;
      const res = await authService.send2faOtp(ch, phone);
      if (res.status) {
        setOtpSent(true);
        setSelectedMethod(ch);
        setCountdown(60);
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to send OTP");
    } finally {
      setSendingOtp(false);
    }
  };

  const confirmSetup = async () => {
    if (otpCode.length !== 6) return;
    setSubmitting(true);
    try {
      let res;
      if (selectedMethod === "totp") {
        res = await authService.confirm2faTotp(otpCode);
      } else {
        res = await authService.confirm2faOtp(selectedMethod, otpCode);
      }
      if (res.status) {
        setEnabled(true);
        setMethod(selectedMethod);
        setSetupMode(false);
        setRecoveryCodes(res.recovery_codes || []);
        setOtpCode("");
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const disable2fa = async () => {
    if (disableCode.length < 6) return;
    setSubmitting(true);
    try {
      const res = await authService.disable2fa(disableCode);
      if (res.status) {
        setEnabled(false);
        setMethod("totp");
        setDisableMode(false);
        setDisableCode("");
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error("Failed to disable 2FA");
    } finally {
      setSubmitting(false);
    }
  };

  const copyRecoveryCodes = () => {
    navigator.clipboard.writeText(recoveryCodes.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (recoveryCodes.length > 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Recovery Codes
          </CardTitle>
          <CardDescription>Save these codes securely. Each can be used once if you lose access to your 2FA method.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
            {recoveryCodes.map((code, i) => (
              <div key={i} className="p-1">{code}</div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={copyRecoveryCodes}>
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
              {copied ? "Copied!" : "Copy Codes"}
            </Button>
            <Button size="sm" onClick={() => setRecoveryCodes([])}>Done</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">2FA is {enabled ? "Enabled" : "Disabled"}</p>
            {enabled && (
              <p className="text-sm text-muted-foreground">
                Method: {method === "totp" ? "Authenticator App" : method === "sms" ? "SMS OTP" : "Email OTP"}
              </p>
            )}
          </div>
          <Badge variant={enabled ? "default" : "secondary"}>
            {enabled ? "Active" : "Inactive"}
          </Badge>
        </div>

        <Separator />

        {!enabled && !setupMode && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Choose your preferred 2FA method:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={startTotpSetup}
                disabled={submitting}
              >
                <Smartphone className="h-6 w-6" />
                <span className="text-sm font-medium">Authenticator App</span>
                <span className="text-xs text-muted-foreground">Google Authenticator, Authy</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => sendOtp("sms")}
                disabled={!hasPhone}
              >
                <Smartphone className="h-6 w-6" />
                <span className="text-sm font-medium">SMS OTP</span>
                <span className="text-xs text-muted-foreground">{hasPhone ? "Code via SMS" : "Add phone first"}</span>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => sendOtp("email")}
              >
                <Mail className="h-6 w-6" />
                <span className="text-sm font-medium">Email OTP</span>
                <span className="text-xs text-muted-foreground">Code via email</span>
              </Button>
            </div>
          </div>
        )}

        {setupMode && selectedMethod === "totp" && (
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              {otpauthUri && (
                <div className="rounded-lg border p-3 bg-white">
                  <QRCodeSVG value={otpauthUri} size={200} />
                </div>
              )}
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Or enter this key manually:</p>
                <code className="text-sm font-mono bg-muted px-3 py-1 rounded">{secret}</code>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Enter 6-digit code from your app</Label>
              <div className="flex gap-2">
                <Input
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  className="font-mono text-center text-lg tracking-widest"
                />
                <Button onClick={confirmSetup} disabled={otpCode.length !== 6 || submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setSetupMode(false); setOtpCode(""); }}>Cancel</Button>
          </div>
        )}

        {!setupMode && !enabled && otpSent && (
          <div className="space-y-4">
            <p className="text-sm">
              Enter the 6-digit code sent to your {selectedMethod === "sms" ? "phone" : "email"}.
            </p>
            <div className="flex gap-2">
              <Input
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="font-mono text-center text-lg tracking-widest"
              />
              <Button onClick={confirmSetup} disabled={otpCode.length !== 6 || submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
              </Button>
            </div>
            {countdown > 0 ? (
              <p className="text-xs text-muted-foreground">Resend in {countdown}s</p>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => sendOtp(selectedMethod as "sms" | "email")}>
                Resend Code
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => { setOtpSent(false); setOtpCode(""); }}>Cancel</Button>
          </div>
        )}

        {enabled && !disableMode && (
          <Button variant="destructive" onClick={() => setDisableMode(true)}>
            Disable 2FA
          </Button>
        )}

        {enabled && disableMode && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enter your {method === "totp" ? "authenticator code" : "OTP code"} to disable 2FA:
            </p>
            <div className="flex gap-2">
              <Input
                value={disableCode}
                onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                className="font-mono"
              />
              <Button variant="destructive" onClick={disable2fa} disabled={disableCode.length < 6 || submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Disable"}
              </Button>
            </div>
            <Button variant="ghost" size="sm" onClick={() => { setDisableMode(false); setDisableCode(""); }}>Cancel</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}