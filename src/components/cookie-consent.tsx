"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

const CONSENT_KEY = "cookie_consent";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const consent = localStorage.getItem(CONSENT_KEY);
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable (SSR, private browsing edge cases)
      setVisible(true);
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "accepted");
      window.dispatchEvent(new Event("consent-changed"));
    } catch {}
    setVisible(false);
  };

  const handleReject = () => {
    try {
      localStorage.setItem(CONSENT_KEY, "rejected");
      window.dispatchEvent(new Event("consent-changed"));
    } catch {}
    setVisible(false);
  };

  if (!mounted || !visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 md:p-6 shadow-lg">
      <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          We use cookies to enhance your experience, analyze site traffic, and personalize content. 
          By clicking &quot;Accept All&quot;, you consent to our use of cookies. 
          Read our{" "}
          <a href="/privacy" className="underline hover:text-foreground">Privacy Policy</a>{" "}
          for more information.
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={handleReject}>Reject All</Button>
          <Button size="sm" onClick={handleAccept}>Accept All</Button>
        </div>
      </div>
    </div>
  );
}
