"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useThemeStore } from "@/store/theme-store";

function getConsent(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("cookie_consent") === "accepted";
}

export default function TrackingScripts() {
  const pathname = usePathname();
  const settings = useThemeStore((s) => s.settings);
  const [consent, setConsent] = useState<boolean>(false);

  const gtmId = settings?.gtm_id || "";
  const fbPixelId = settings?.facebook_pixel_id || "";

  // Check consent on mount + listen for changes
  useEffect(() => {
    setConsent(getConsent());

    const handleConsentChange = () => setConsent(getConsent());
    window.addEventListener("storage", handleConsentChange);
    window.addEventListener("consent-changed", handleConsentChange);

    return () => {
      window.removeEventListener("storage", handleConsentChange);
      window.removeEventListener("consent-changed", handleConsentChange);
    };
  }, []);

  // Track GA page views on route change
  useEffect(() => {
    if (!consent || !gtmId) return;
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: pathname,
    });
  }, [pathname, consent, gtmId]);

  // Track Facebook Pixel page views on route change
  useEffect(() => {
    if (!consent || !fbPixelId || typeof window.fbq !== "function") return;
    window.fbq("track", "PageView");
  }, [pathname, consent, fbPixelId]);

  if (!consent) return null;

  return (
    <>
      {/* Google Tag Manager */}
      {gtmId && (
        <>
          <Script
            id="gtm-script"
            src={`https://www.googletagmanager.com/gtm.js?id=${gtmId}`}
            strategy="afterInteractive"
          />
          <Script id="gtm-datalayer" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gtmId}');
            `}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}

      {/* Facebook Pixel */}
      {fbPixelId && (
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${fbPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
    </>
  );
}

declare global {
  interface Window {
    fbq: (...args: any[]) => void;
    dataLayer: Record<string, any>[];
  }
}
