"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { useTheme } from "next-themes";
import api from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Moon, Sun, Globe, LogOut, Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { TwoFactorSettings } from "@/components/dashboard/two-factor-settings";

export default function EmployerSettingsPage() {
  const { user, logout } = useAuth();
  const { language, setLanguage } = useThemeStore();
  const { theme, setTheme } = useTheme();
  const isBn = language === "bn";
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    company_description: "",
    website: "",
  });

  useEffect(() => {
    setMounted(true);
    if (user) {
      setForm({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        company_name: (user as any).company?.name || "",
        company_description: (user as any).company?.description || "",
        website: (user as any).company?.website || "",
      });
    }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put("/employer/profile", {
        name: form.name,
        phone: form.phone,
        company_name: form.company_name,
        company_description: form.company_description,
        website: form.website,
      });
      toast.success(isBn ? "সংরক্ষিত হয়েছে!" : "Settings saved!");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          (isBn ? "সংরক্ষণ করতে ব্যর্থ" : "Failed to save")
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">
        {isBn ? "সেটিংস" : "Settings"}
      </h1>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isBn ? "অ্যাকাউন্ট তথ্য" : "Account Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isBn ? "নাম" : "Name"}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>{isBn ? "ইমেইল" : "Email"}</Label>
              <Input value={form.email} disabled />
            </div>
            <div className="space-y-2">
              <Label>{isBn ? "ফোন" : "Phone"}</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isBn ? "কোম্পানি তথ্য" : "Company Information"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{isBn ? "কোম্পানির নাম" : "Company Name"}</Label>
            <Input
              value={form.company_name}
              onChange={(e) =>
                setForm({ ...form, company_name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{isBn ? "কোম্পানি বিবরণ" : "Company Description"}</Label>
            <Textarea
              rows={3}
              value={form.company_description}
              onChange={(e) =>
                setForm({ ...form, company_description: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label>{isBn ? "ওয়েবসাইট" : "Website"}</Label>
            <Input
              value={form.website}
              onChange={(e) =>
                setForm({ ...form, website: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isBn ? "সংরক্ষণ করুন" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            {mounted ? (
              theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />
            ) : (
              <Sun className="h-4 w-4" />
            )}
            {isBn ? "থিম" : "Appearance"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">{isBn ? "ডার্ক মোড" : "Dark Mode"}</span>
            <div className="flex gap-2">
              <Button
                variant={mounted && theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
              >
                <Sun className="h-4 w-4 mr-1" /> Light
              </Button>
              <Button
                variant={mounted && theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
              >
                <Moon className="h-4 w-4 mr-1" /> Dark
              </Button>
              <Button
                variant={mounted && theme === "system" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("system")}
              >
                System
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            {isBn ? "ভাষা" : "Language"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">
              {isBn ? "ইন্টারফেস ভাষা" : "Interface Language"}
            </span>
            <div className="flex gap-2">
              <Button
                variant={language === "en" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("en")}
              >
                English
              </Button>
              <Button
                variant={language === "bn" ? "default" : "outline"}
                size="sm"
                onClick={() => setLanguage("bn")}
              >
                বাংলা
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2FA */}
      <TwoFactorSettings />

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {isBn ? "অ্যাকাউন্ট" : "Account"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <p className="text-muted-foreground">
              {isBn ? "ইমেইল" : "Email"}
            </p>
            <p>{user?.email}</p>
          </div>
          <Separator />
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {isBn ? "লগ আউট" : "Logout"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}