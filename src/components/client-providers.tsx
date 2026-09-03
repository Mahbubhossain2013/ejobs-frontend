"use client";

import dynamic from "next/dynamic";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { useTheme } from "@/hooks/use-theme";
import PwaInstallBanner from "@/components/pwa-install-banner";
import CookieConsent from "@/components/cookie-consent";
import TrackingScripts from "@/components/analytics/TrackingScripts";

const TooltipProvider = dynamic(
  () => import("@/components/ui/tooltip").then((m) => m.TooltipProvider),
  { ssr: false }
);

const Toaster = dynamic(
  () => import("@/components/ui/sonner").then((m) => m.Toaster),
  { ssr: false }
);

function FontSizeInit() {
  useTheme();
  return null;
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <AuthProvider>
          <FontSizeInit />
          <TooltipProvider>
            {children}
            <PwaInstallBanner />
            <Toaster position="top-right" richColors closeButton />
            <CookieConsent />
            <TrackingScripts />
          </TooltipProvider>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}