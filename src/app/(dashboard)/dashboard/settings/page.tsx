"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { useTheme } from "next-themes";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api-client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Sun, Globe, LogOut, Loader2, Shield, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { TwoFactorSettings } from "@/components/dashboard/two-factor-settings";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const { language, setLanguage } = useThemeStore();
  const { theme, setTheme } = useTheme();
  const isBn = language === "bn";
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [show2fa, setShow2fa] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (user) { setName(user.name || ""); setPhone(user.phone || ""); }
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", name);
      fd.append("phone", phone);
      await api.post("/candidate/profile-update", fd);
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
      toast.success(isBn ? "সংরক্ষিত হয়েছে!" : "Saved!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || (isBn ? "ব্যর্থ" : "Failed"));
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-3 max-w-3xl">
      <h1 className="text-lg font-bold tracking-tight">{isBn ? "সেটিংস" : "Settings"}</h1>

      {/* ── Main Settings Card ── */}
      <Card className="overflow-hidden border-border/60">
        <CardContent className="p-3 sm:p-4">
          {/* Row 1: Name + Phone + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-2.5">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{isBn ? "নাম" : "Name"}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-8 text-sm bg-background/50"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{isBn ? "ফোন" : "Phone"}</label>
              <div className="flex">
                <span className="flex items-center px-1.5 border border-r-0 border-input rounded-l-md bg-muted text-[11px] text-muted-foreground h-8 shrink-0">
                  +880
                </span>
                <Input
                  value={phone.replace(/^\+?880/, "")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^\d]/g, "").slice(0, 11);
                    setPhone(raw ? `+880${raw}` : "");
                  }}
                  placeholder="1XXXXXXXXX"
                  className="rounded-l-none h-8 text-sm bg-background/50"
                  type="tel"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">{isBn ? "ইমেইল" : "Email"}</label>
              <Input value={user?.email || ""} disabled className="h-8 text-sm bg-background/50 opacity-60 cursor-not-allowed" />
            </div>
          </div>

          {/* Row 2: Theme + Language + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40">
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Theme */}
              <div className="flex items-center gap-1.5">
                {mounted ? (theme === "dark" ? <Moon className="h-3.5 w-3.5 text-muted-foreground" /> : <Sun className="h-3.5 w-3.5 text-muted-foreground" />) : <Sun className="h-3.5 w-3.5 text-muted-foreground" />}
                <span className="text-xs text-muted-foreground hidden sm:inline">{isBn ? "থিম" : "Theme"}</span>
                <div className="flex gap-0.5">
                  {([
                    { key: "light" as const, icon: Sun, tip: "Light" },
                    { key: "dark" as const, icon: Moon, tip: "Dark" },
                    { key: "system" as const, icon: null, tip: "System" },
                  ]).map(({ key, icon: Ic, tip }) => (
                    <Button
                      key={key}
                      variant={mounted && theme === key ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setTheme(key)}
                      className="h-7 w-7 p-0"
                      title={tip}
                    >
                      {Ic ? <Ic className="h-3.5 w-3.5" /> : <span className="text-xs">⚙</span>}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="w-px h-4 bg-border/50 hidden sm:block" />

              {/* Language */}
              <div className="flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground hidden sm:inline">{isBn ? "ভাষা" : "Lang"}</span>
                <div className="flex gap-0.5">
                  <Button
                    variant={language === "en" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setLanguage("en")}
                    className="h-7 px-2 text-xs font-medium"
                  >
                    EN
                  </Button>
                  <Button
                    variant={language === "bn" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setLanguage("bn")}
                    className="h-7 px-2 text-xs font-medium"
                  >
                    বাং
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Button variant="destructive" size="sm" onClick={logout} className="h-7 text-xs px-2.5">
                <LogOut className="h-3.5 w-3.5 sm:mr-1" />
                <span className="hidden sm:inline">{isBn ? "লগ আউট" : "Logout"}</span>
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving} className="h-7 text-xs px-2.5">
                {saving && <Loader2 className="h-3.5 w-3.5 sm:mr-1 animate-spin" />}
                {isBn ? "সংরক্ষণ" : "Save"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── 2FA Toggle Row ── */}
      <button
        onClick={() => setShow2fa(!show2fa)}
        className="w-full flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card hover:bg-accent/50 transition-colors text-left group"
      >
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium leading-tight">{isBn ? "দ্বি-স্তরীয় যাচাইকরণ" : "Two-Factor Authentication"}</p>
            <p className="text-[11px] text-muted-foreground">{isBn ? "অ্যাকাউন্টে অতিরিক্ত নিরাপত্তা যোগ করুন" : "Add extra security to your account"}</p>
          </div>
        </div>
        {show2fa ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </button>

      {show2fa && (
        <div className="animate-in slide-in-from-top-1 duration-200">
          <TwoFactorSettings />
        </div>
      )}
    </div>
  );
}
