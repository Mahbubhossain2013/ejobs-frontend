"use client";

import { useState, useEffect } from "react";
import { useThemeStore } from "@/store/theme-store";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");

interface SocialSettings {
  google_enabled: string;
  facebook_enabled: string;
}

export default function SocialLoginButtons({ role = "candidate" }: { role?: "candidate" | "employer" }) {
  const { language } = useThemeStore();
  const isBn = language === "bn";
  const [settings, setSettings] = useState<SocialSettings | null>(null);

  useEffect(() => {
    // Defer fetch to after paint — doesn't block initial render
    const id = requestAnimationFrame(() => {
      fetch(`${API_URL}/api/auth/social-settings`, { signal: AbortSignal.timeout(5000) })
        .then((r) => r.json())
        .then((j) => setSettings(j?.data || null))
        .catch(() => setSettings(null));
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!settings) return null;

  const googleEnabled = settings.google_enabled === "true";
  const facebookEnabled = settings.facebook_enabled === "true";

  if (!googleEnabled && !facebookEnabled) return null;

  const enabledCount = (googleEnabled ? 1 : 0) + (facebookEnabled ? 1 : 0);

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{isBn ? "অথবা সাথে চালিয়ে যান" : "or continue with"}</span>
        </div>
      </div>
      <div className={`grid gap-3 ${enabledCount === 1 ? "grid-cols-1" : "grid-cols-2"}`}>
        {googleEnabled && (
          <button type="button" onClick={() => { window.location.href = `${API_URL}/api/auth/google/redirect?role=${role}`; }}
            className="flex items-center justify-center gap-2.5 rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Google
          </button>
        )}
        {facebookEnabled && (
          <button type="button" onClick={() => { window.location.href = `${API_URL}/api/auth/facebook/redirect?role=${role}`; }}
            className="flex items-center justify-center gap-2.5 rounded-md border border-input bg-background px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent">
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            Facebook
          </button>
        )}
      </div>
    </div>
  );
}