"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, Globe, Download } from "lucide-react";
import { toast } from "sonner";
import { useThemeStore } from "@/store/theme-store";
import { getStorageUrl } from "@/lib/utils";
import { usePwaInstall } from "@/hooks/use-pwa-install";

export default function Footer() {
  const { settings, language } = useThemeStore();
  const isBn = language === "bn";

  const pub = settings as Record<string, any>;

  const siteName = settings.site_name || process.env.NEXT_PUBLIC_APP_NAME || "eJobs";

  const socialLinks = [
    { url: pub.facebook_page, label: "Facebook" },
    { url: pub.whatsapp_number ? `https://wa.me/${pub.whatsapp_number.replace(/[^0-9]/g, "")}` : undefined, label: "WhatsApp" },
    { url: pub.telegram_channel, label: "Telegram" },
    { url: pub.youtube_channel, label: "YouTube" },
  ].filter((s) => s.url);

  const contactItems = [
    pub.support_phone ? { icon: Phone, text: pub.support_phone, href: `tel:${pub.support_phone}` } : null,
    pub.support_email ? { icon: Mail, text: pub.support_email, href: `mailto:${pub.support_email}` } : null,
    pub.support_website ? { icon: Globe, text: pub.support_website.replace(/^https?:\/\//, ""), href: pub.support_website } : null,
  ].filter(Boolean) as { icon: typeof Phone; text: string; href: string }[];

  /* ── PWA Install ── */
  const { canInstall, hasPrompt, isInstalled, install } = usePwaInstall();

  const showInstallBanner = canInstall && !isInstalled;

  const handlePwaInstall = async () => {
    if (hasPrompt) {
      await install();
    } else {
      // Non-Chrome or prompt not available — show manual instructions
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      toast.info(
        isBn
          ? isIOS
            ? "Safari থেকে শেয়ার বাটনে ক্লিক করুন → 'হোম স্ক্রিনে যোগ করুন'"
            : "ব্রাউজার মেনু থেকে 'হোম স্ক্রিনে যোগ করুন' বা 'ইনস্টল' বেছে নিন"
          : isIOS
            ? "Tap the Share button in Safari → 'Add to Home Screen'"
            : "Tap your browser menu → 'Add to Home Screen' or 'Install'"
      );
    }
  };

  return (
    <footer className="footer-surface">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand + Contact */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg mb-4">
              {settings.site_logo ? (
                <Image
                  src={getStorageUrl(settings.site_logo)!}
                  alt={siteName}
                  width={48}
                  height={48}
                  className="h-12 w-auto object-contain"
                  unoptimized
                />
              ) : (
                <span className="text-primary">{siteName}</span>
              )}
            </Link>
            <p className="text-sm text-surface-footer-foreground/80 mb-3">
              {isBn ? "আপনার স্বপ্নের চাকরি খুঁজুন অথবা সেরা প্রতিভা নিয়োগ করুন।" : "Find your dream job or hire the best talent."}
            </p>
            {showInstallBanner && (
              <div className="flex items-center gap-2 mb-3">
                <button
                  type="button"
                  onClick={handlePwaInstall}
                  className="inline-flex items-center gap-1.5 bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  {isBn ? "অ্যাপ ইনস্টল করুন" : "Install App"}
                </button>
              </div>
            )}
            {contactItems.length > 0 && (
              <ul className="space-y-1.5 text-sm text-surface-footer-foreground/80">
                {contactItems.map((c, i) => (
                  <li key={i}>
                    <a href={c.href} target={c.href.startsWith("http") ? "_blank" : undefined} rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                      <c.icon className="h-3.5 w-3.5" />
                      <span>{c.text}</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Job Seekers */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-surface-footer-foreground">
              {isBn ? "চাকরিপ্রার্থীদের জন্য" : "For Job Seekers"}
            </h3>
            <ul className="space-y-2 text-sm text-surface-footer-foreground/80">
              <li><Link href="/jobs" className="hover:text-primary transition-colors">{isBn ? "চাকরি খুঁজুন" : "Browse Jobs"}</Link></li>
              <li><Link href="/companies" className="hover:text-primary transition-colors">{isBn ? "প্রতিষ্ঠানসমূহ" : "Companies"}</Link></li>
              <li><Link href="/resume-builder" className="hover:text-primary transition-colors">{isBn ? "সিভি তৈরি" : "CV Builder"}</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">{isBn ? "মূল্য নির্ধারণ" : "Pricing"}</Link></li>
            </ul>
          </div>

          {/* Employers */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-surface-footer-foreground">
              {isBn ? "নিয়োগকর্তাদের জন্য" : "For Employers"}
            </h3>
            <ul className="space-y-2 text-sm text-surface-footer-foreground/80">
              <li><Link href="/employer/register" className="hover:text-primary transition-colors">{isBn ? "চাকরি পোস্ট করুন" : "Post a Job"}</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition-colors">{isBn ? "পরিকল্পনাসমূহ" : "Plans"}</Link></li>
              <li><Link href="/login" className="hover:text-primary transition-colors">{isBn ? "নিয়োগকর্তা লগইন" : "Employer Login"}</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-sm mb-3 text-surface-footer-foreground">
              {isBn ? "কোম্পানি" : "Company"}
            </h3>
            <ul className="space-y-2 text-sm text-surface-footer-foreground/80">
              <li><Link href="/about" className="hover:text-primary transition-colors">{isBn ? "আমাদের সম্পর্কে" : "About Us"}</Link></li>
              <li><Link href="/help" className="hover:text-primary transition-colors">{isBn ? "সাহায্য ও জিজ্ঞাসা" : "Help & FAQ"}</Link></li>
              <li><Link href="/notices" className="hover:text-primary transition-colors">{isBn ? "নোটিশ" : "Notices"}</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">{isBn ? "যোগাযোগ" : "Contact"}</Link></li>
              <li><Link href="/privacy" className="hover:text-primary transition-colors">{isBn ? "গোপনীয়তা নীতি" : "Privacy Policy"}</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">{isBn ? "সেবার শর্তাবলী" : "Terms of Service"}</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-surface-footer-foreground space-y-2">
          <p>
            {pub.footer_copyright_text || 
              (isBn 
                ? `\u00A9 ${new Date().getFullYear()} ${siteName}। সর্বস্বত্ব সংরক্ষিত।` 
                : `\u00A9 ${new Date().getFullYear()} ${siteName}. All rights reserved.`)}
          </p>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center justify-center gap-4">
              {socialLinks.map((s, i) => (
                <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors" title={s.label}>
                  {s.label === "Facebook" && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  )}
                  {s.label === "WhatsApp" && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  )}
                  {s.label === "Telegram" && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                  )}
                  {s.label === "YouTube" && (
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  )}
                </a>
              ))}
            </div>
          )}

          <p>
            <Link href="https://nextin.fobign.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors text-surface-footer-foreground/80">
              {isBn ? "NEXTIN দ্বারা তৈরি" : "Developed by NEXTIN"}
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
