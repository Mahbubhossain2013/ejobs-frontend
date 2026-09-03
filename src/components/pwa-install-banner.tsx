"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, X } from "lucide-react";
import { useThemeStore } from "@/store/theme-store";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export default function PwaInstallBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const { hasPrompt, isInstalled, install } = usePwaInstall();
  const settings = useThemeStore((s) => s.settings);
  const appName = settings?.site_name || process.env.NEXT_PUBLIC_APP_NAME || "JobPortal";

  useEffect(() => {
    if (hasPrompt) {
      const timer = setTimeout(() => setShowBanner(true), 3000);
      return () => clearTimeout(timer);
    }
  }, [hasPrompt]);

  const handleInstall = async () => {
    const accepted = await install();
    if (accepted) setShowBanner(false);
  };

  const handleDismiss = () => {
    setShowBanner(false);
    sessionStorage.setItem("pwa-dismissed", "1");
  };

  if (isInstalled || !showBanner || !hasPrompt) return null;
  if (typeof window !== "undefined" && sessionStorage.getItem("pwa-dismissed") === "1") return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:max-w-sm">
      <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-3">
        <div className="flex-shrink-0">
          <Download className="h-8 w-8 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm">Install {appName}</p>
          <p className="text-xs text-muted-foreground">Add to your home screen for quick access</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={handleInstall}>Install</Button>
          <Button size="sm" variant="ghost" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
