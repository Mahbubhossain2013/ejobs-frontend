"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { useTheme } from "@/hooks/use-theme";
import { useTheme as useNextTheme } from "next-themes";
import { useNotificationStore } from "@/store/notification-store";
import { subscriptionService } from "@/services/subscription.service";
import { notificationsService } from "@/services/notifications.service";
import PremiumBadge from "@/components/badges/PremiumBadge";
import CurrencySwitcher from "@/components/currency-switcher";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu, Sun, Moon, Bell, LogOut, User, Settings, LayoutDashboard,
  ChevronDown, Sparkles, Briefcase, Globe, Building2, Users,
  FileText, CreditCard, Home, Trophy, GraduationCap, BookOpen, Plus,
  MessageSquare, FolderKanban, Wallet, ShoppingCart,
  Megaphone, ShieldCheck, BarChart3, Headphones, Plane, Send, Calendar, Award, Shield,
  CheckCircle, Bookmark,
} from "lucide-react";
import { getInitials, getStorageUrl } from "@/lib/utils";
import type { Subscription } from "@/types";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, role, logout } = useAuth();
  const { language, toggleLanguage, settings } = useThemeStore();
  useTheme();
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const activeTheme = resolvedTheme || theme;
  const { notifications, unreadCount, setNotifications } = useNotificationStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { data: subscription } = useQuery({
    queryKey: ["subscription", "current"],
    queryFn: () => subscriptionService.getMySubscription(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchNotifications = async () => {
      try {
        const data = await notificationsService.getNotifications(1);
        if (data?.data) setNotifications(data.data);
        if (typeof data?.unread_count === "number") {
          useNotificationStore.getState().setUnreadCount(data.unread_count);
        }
      } catch {}
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, setNotifications]);

  const isEmployer = role === "employer";
  const isAdmin = role === "admin";
  const isCandidate = role === "candidate";
  const isBn = language === "bn";

  // Desktop nav links (including Leaderboard)
  const navLinks = [
    { href: "/jobs", label: isBn ? "চাকরি" : "Jobs", icon: Briefcase },
    { href: "/jobs/remote", label: isBn ? "রিমোট চাকরি" : "Remote Jobs", icon: Globe },
    { href: "/companies", label: isBn ? "কোম্পানি" : "Companies", icon: Building2 },
    { href: "/skills", label: isBn ? "দক্ষতা কেন্দ্র" : "Skill Center", icon: GraduationCap },
    ...(!isCandidate ? [{ href: "/candidates", label: isBn ? "প্রার্থী" : "Candidates", icon: Users }] : []),
    ...(!isEmployer ? [{ href: "/resume-builder/template", label: isBn ? "সিভি বিল্ডার" : "CV Builder", icon: FileText }] : []),
    { href: "/leaderboard", label: isBn ? "লিডারবোর্ড" : "Leaderboard", icon: Trophy },
    { href: "/pricing", label: isBn ? "মূল্য" : "Pricing", icon: CreditCard },
  ];

  // Mobile-only extra links (merged into main nav on mobile)
  const mobileExtraLinks = [
    { href: "/", label: isBn ? "হোম" : "Home", icon: Home },
    { href: "/ai-assistant", label: isBn ? "AI সহকারী" : "AI Assistant", icon: Sparkles, highlight: true },
    { href: "/ai-career", label: isBn ? "AI ক্যারিয়ার" : "AI Career", icon: Sparkles },
    { href: "/ai-mock-interview", label: isBn ? "AI মক ইন্টারভিউ" : "AI Mock Interview", icon: Sparkles },
    { href: "/resume-score", label: isBn ? "রিজিউম স্কোর" : "Resume Score", icon: FileText },
    { href: "/certificates", label: isBn ? "সার্টিফিকেট" : "Certificates", icon: Trophy },
    { href: "/assessments", label: isBn ? "মূল্যায়ন" : "Assessments", icon: BookOpen },
  ];

  // Employer dashboard pages for mobile menu - grouped same as desktop sidebar
  const employerMobileLinks = isEmployer ? [
    { group: isBn ? "সারসংক্ষেপ" : "Overview", items: [
      { href: "/employer/dashboard", label: isBn ? "ড্যাশবোর্ড" : "Dashboard", icon: LayoutDashboard },
      { href: "/employer/company-overview", label: isBn ? "কোম্পানি সারসংক্ষেপ" : "Company Overview", icon: Building2 },
      { href: "/employer/profile", label: isBn ? "প্রোফাইল" : "Profile", icon: User },
      { href: "/employer/analytics", label: isBn ? "অ্যানালিটিক্স" : "Analytics", icon: BarChart3 },
    ]},
    { group: isBn ? "নিয়োগ" : "Hiring", items: [
      { href: "/employer/post-job", label: isBn ? "চাকরি পোস্ট করুন" : "Post Job", icon: Plus },
      { href: "/employer/manage-jobs", label: isBn ? "চাকরি ব্যবস্থাপনা" : "Manage Jobs", icon: Briefcase },
      { href: "/employer/applicants", label: isBn ? "আবেদনকারীগণ" : "Applicants", icon: Users },
      { href: "/employer/candidates", label: isBn ? "প্রার্থীগণ" : "Candidates", icon: Users },
      { href: "/employer/deployments", label: isBn ? "নিয়োগ ট্র্যাকার" : "Deployments", icon: Plane },
      { href: "/employer/cv-database", label: isBn ? "সিভি ডাটাবেজ" : "CV Database", icon: FileText },
      { href: "/employer/workspace", label: isBn ? "ওয়ার্কস্পেস" : "Workspace", icon: FolderKanban },
    ]},
    { group: isBn ? "আর্থিক" : "Finance", items: [
      { href: "/employer/wallet", label: isBn ? "ওয়ালেট" : "Wallet", icon: Wallet },
      { href: "/employer/purchases", label: isBn ? "ক্রয়সমূহ" : "Purchases", icon: ShoppingCart },
      { href: "/employer/promotions", label: isBn ? "বিজ্ঞাপন প্রচার" : "Promotions", icon: Megaphone },
      { href: "/employer/subscription", label: isBn ? "সাবস্ক্রিপশন" : "Subscription", icon: CreditCard },
    ]},
    { group: isBn ? "অ্যাকাউন্ট" : "Account", items: [
      { href: "/employer/messages", label: isBn ? "বার্তা" : "Messages", icon: MessageSquare },
      { href: "/employer/verify", label: isBn ? "যাচাইকরণ" : "Verification", icon: ShieldCheck },
      { href: "/employer/notifications", label: isBn ? "নোটিফিকেশন" : "Notifications", icon: Bell },
      { href: "/employer/support", label: isBn ? "সাপোর্ট" : "Support", icon: Headphones },
      { href: "/employer/settings", label: isBn ? "সেটিংস" : "Settings", icon: Settings },
    ]},
  ] : [];

  // Candidate dashboard pages for mobile menu - grouped same as desktop sidebar
  const candidateMobileLinks = isCandidate ? [
    { group: isBn ? "সারসংক্ষেপ" : "Overview", items: [
      { href: "/dashboard", label: isBn ? "ড্যাশবোর্ড" : "Dashboard", icon: LayoutDashboard },
      { href: "/dashboard/profile/overview", label: isBn ? "প্রোফাইল ওভারভিউ" : "Profile Overview", icon: BarChart3 },
      { href: "/dashboard/profile", label: isBn ? "প্রোফাইল" : "Profile", icon: User },
      { href: "/dashboard/resume", label: isBn ? "জীবনবৃত্তান্ত" : "Resume", icon: FileText },
      { href: "/dashboard/analytics", label: isBn ? "অ্যানালিটিক্স" : "Analytics", icon: BarChart3 },
    ]},
    { group: isBn ? "চাকরি ও কাজ" : "Jobs & Work", items: [
      { href: "/dashboard/applied-jobs", label: isBn ? "আবেদনকৃত চাকরি" : "Applied Jobs", icon: Send },
      { href: "/dashboard/accepted-jobs", label: isBn ? "গৃহীত চাকরি" : "Accepted Jobs", icon: CheckCircle },
      { href: "/dashboard/saved-jobs", label: isBn ? "সংরক্ষিত চাকরি" : "Saved Jobs", icon: Bookmark },
      { href: "/dashboard/job-alerts", label: isBn ? "জব এলার্ট" : "Job Alerts", icon: Bell },
      { href: "/dashboard/workspace", label: isBn ? "ওয়ার্কস্পেস" : "Workspace", icon: FolderKanban },
      { href: "/dashboard/deployments", label: isBn ? "নিয়োগ ট্র্যাকার" : "Deployments", icon: Plane },
      { href: "/dashboard/interviews", label: isBn ? "সাক্ষাৎকার" : "Interviews", icon: Calendar },
    ]},
    { group: isBn ? "দক্ষতা কেন্দ্র" : "Skill Center", items: [
      { href: "/dashboard/skill-center", label: isBn ? "দক্ষতা কেন্দ্র" : "Skill Center", icon: GraduationCap },
      { href: "/dashboard/skill-center/certificates", label: isBn ? "আমার সার্টিফিকেট" : "My Certificates", icon: Award },
    ]},
    { group: isBn ? "আর্থিক" : "Finance", items: [
      { href: "/dashboard/wallet", label: isBn ? "ওয়ালেট" : "Wallet", icon: Wallet },
      { href: "/dashboard/purchases", label: isBn ? "ক্রয়সমূহ" : "Purchases", icon: ShoppingCart },
      { href: "/dashboard/subscription", label: isBn ? "সাবস্ক্রিপশন" : "Subscription", icon: CreditCard },
    ]},
    { group: isBn ? "অ্যাকাউন্ট" : "Account", items: [
      { href: "/dashboard/messages", label: isBn ? "বার্তা" : "Messages", icon: MessageSquare },
      { href: "/dashboard/verify", label: isBn ? "যাচাইকরণ" : "Verification", icon: Shield },
      { href: "/dashboard/notifications", label: isBn ? "নোটিফিকেশন" : "Notifications", icon: Bell },
      { href: "/dashboard/notifications/preferences", label: isBn ? "নোটিফিকেশন পছন্দ" : "Notification Prefs", icon: Settings },
      { href: "/dashboard/disputes", label: isBn ? "বিরোধসমূহ" : "Disputes", icon: Shield },
      { href: "/dashboard/settings", label: isBn ? "সেটিংস" : "Settings", icon: Settings },
      { href: "/dashboard/support", label: isBn ? "সাপোর্ট" : "Support", icon: Headphones },
    ]},
  ] : [];

  // All mobile nav links (navLinks + extras, no duplicates)
  const allMobileLinks = [
    ...navLinks,
    ...mobileExtraLinks.filter((e) => !navLinks.some((n) => n.href === e.href)),
  ] as { href: string; label: string; icon: any; highlight?: boolean }[];

  const dashboardPath = isAdmin ? "/admin/dashboard" : isEmployer ? "/employer/dashboard" : "/dashboard";
  const profilePath = isAdmin ? "/admin" : isEmployer ? "/employer/profile" : "/dashboard/profile";
  const notificationsPath = isAdmin ? "/admin/notifications" : isEmployer ? "/employer/notifications" : "/dashboard/notifications";
  const settingsPath = isAdmin ? "/admin/settings" : isEmployer ? "/employer/settings" : "/dashboard/settings";

  const isDark = mounted && activeTheme === "dark";

  return (
    <>
    <header
      className="sticky top-0 z-50 w-full navbar-surface"
      style={{
        backgroundColor: isDark
          ? (settings.nav_bg_dark ? `${settings.nav_bg_dark}f2` : undefined)
          : (settings.nav_bg ? `${settings.nav_bg}f2` : undefined),
      }}
    >
      <div className="container mx-auto flex h-20 items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 min-w-0">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl shrink-0 whitespace-nowrap overflow-hidden">
          {settings.site_logo ? (
            <Image
              src={getStorageUrl(settings.site_logo)!}
              alt={settings.site_name || "eJobs"}
               width={32} height={32}
               className="h-8 w-auto object-contain shrink-0" unoptimized
            />
          ) : (
            <span style={{ color: settings.nav_text_color || undefined }} className="font-bold">{settings.site_name || "eJobs"}</span>
          )}
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 whitespace-nowrap">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="text-sm font-bold transition-colors whitespace-nowrap"
              style={{
                color: pathname === link.href
                  ? (settings.nav_text_hover || undefined)
                  : (settings.nav_text_color || undefined),
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = settings.nav_text_hover || ''; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = pathname === link.href ? (settings.nav_text_hover || '') : (settings.nav_text_color || ''); }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-1.5">
          <Button variant="ghost" size="icon" asChild className="hover:bg-black/5 dark:hover:bg-white/10" style={{ color: settings.nav_text_color || undefined }}>
            <Link href="/ai-assistant" title={isBn ? "AI সহকারী" : "AI Assistant"}>
              <Sparkles className="h-4 w-4 animate-pulse" />
            </Link>
          </Button>
          {isAuthenticated ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative hover:bg-black/5 dark:hover:bg-white/10" style={{ color: settings.nav_text_color || undefined }}>
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-0">
                  <div className="px-3 py-2.5 border-b flex items-center justify-between">
                    <p className="text-sm font-semibold">{isBn ? "নোটিফিকেশন" : "Notifications"}</p>
                    {unreadCount > 0 && (
                      <Badge variant="secondary" className="text-[10px]">{unreadCount} {isBn ? "নতুন" : "new"}</Badge>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        {isBn ? "কোনো নোটিফিকেশন নেই" : "No notifications yet"}
                      </div>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <div key={n.id} className={`px-3 py-2.5 border-b last:border-0 hover:bg-muted/50 transition-colors ${!n.read_at ? "bg-primary/5" : ""}`}>
                          <div className="flex items-start gap-2">
                            {!n.read_at && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium truncate">{n.title || n.data?.title || (isBn ? "নোটিফিকেশন" : "Notification")}</p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{n.message || n.data?.message || ""}</p>
                              {n.created_at && (
                                <p className="text-[10px] text-muted-foreground/60 mt-1">
                                  {new Date(n.created_at).toLocaleDateString(isBn ? "bn-BD" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-3 py-2 border-t">
                    <button
                      onClick={() => router.push(notificationsPath)}
                      className="w-full text-center text-xs font-medium text-primary hover:underline py-1"
                    >
                      {isBn ? "সব দেখুন" : "See all notifications"}
                    </button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-2 hover:bg-black/5 dark:hover:bg-white/10" style={{ color: settings.nav_text_color || undefined }}>
                    <DefaultAvatar src={user?.avatar} name={user?.name} className="h-7 w-7" fallback={<span className="text-xs">{getInitials(user?.name || "U")}</span>} />
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b">
                    <p className="text-sm font-semibold truncate">{user?.name}</p>
                    {subscription?.status === "active" && subscription.plan_name && (
                      <PremiumBadge plan={subscription.plan_name} />
                    )}
                  </div>
                  <div className="px-3 py-2 border-b">
                    <div className="flex items-center gap-2">
                      <CurrencySwitcher />
                      <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10">
                        {isBn ? "EN" : "বাং"}
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}>
                        {mounted ? (activeTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Moon className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => router.push(dashboardPath)}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    {isBn ? "ড্যাশবোর্ড" : "Dashboard"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(profilePath)}>
                    <User className="mr-2 h-4 w-4" />
                    {isBn ? "প্রোফাইল" : "Profile"}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`${settingsPath}`)}>
                    <Settings className="mr-2 h-4 w-4" />
                    {isBn ? "সেটিংস" : "Settings"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    {isBn ? "লগআউট" : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}>
                {mounted ? (activeTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10">
                {isBn ? "EN" : "বাং"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="hover:bg-black/5 dark:hover:bg-white/10" style={{ color: settings.nav_text_color || undefined }}>{isBn ? "লগইন" : "Login"}</Button>
              <Button size="sm" onClick={() => router.push("/register")} style={{ color: settings.nav_text_color || undefined, backgroundColor: `${settings.nav_text_color || '#076938'}22` }}>{isBn ? "নিবন্ধন" : "Register"}</Button>
            </div>
          )}
        </div>

        {/* Mobile: Login/Register + Hamburger */}
        {!isAuthenticated && (
          <div className="flex items-center gap-1.5 md:hidden">
            <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}>
              {mounted ? (activeTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Moon className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => router.push("/login")} className="text-sm hover:bg-black/5 dark:hover:bg-white/10" style={{ color: settings.nav_text_color || undefined }}>{isBn ? "লগইন" : "Login"}</Button>
            <Button size="sm" onClick={() => router.push("/register")} className="text-sm" style={{ color: settings.nav_text_color || undefined, backgroundColor: `${settings.nav_text_color || '#076938'}22` }}>{isBn ? "নিবন্ধন" : "Register"}</Button>
          </div>
        )}

        {/* Mobile Hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden hover:bg-black/5 dark:hover:bg-white/10" style={{ color: settings.nav_text_color || undefined }}>
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            {/* Mobile Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <SheetTitle className="flex items-center gap-2 text-lg font-bold">
                 {settings.site_logo ? (
                    <Image src={getStorageUrl(settings.site_logo)!}
                      alt={settings.site_name || "eJobs"} width={48} height={48}
                       className="h-10 w-auto object-contain" unoptimized />
                 ) : (
                  <span className="text-primary">{settings.site_name || "eJobs"}</span>
                )}
              </SheetTitle>
            </div>

            <div className="flex flex-col h-full">
              {/* User Info — dropdown like desktop */}
              {isAuthenticated && (
                <div className="p-4 border-b bg-muted/30">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-3 hover:bg-muted/50 rounded-lg p-2 -m-2 w-full text-left transition-colors">
                        <DefaultAvatar src={user?.avatar} name={user?.name} className="h-10 w-10" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm truncate">{user?.name}</p>
                          {subscription?.status === "active" && subscription.plan_name && (
                            <PremiumBadge plan={subscription.plan_name} />
                          )}
                        </div>
                        <ChevronDown className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-72">
                      <div className="px-3 py-2 border-b">
                        <div className="flex items-center gap-2">
                          <CurrencySwitcher />
                          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="text-xs font-medium hover:bg-black/5 dark:hover:bg-white/10">
                            {isBn ? "EN" : "বাং"}
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:bg-black/5 dark:hover:bg-white/10" onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")}>
                            {mounted ? (activeTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Moon className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                      <DropdownMenuItem onClick={() => { setMobileOpen(false); router.push(dashboardPath); }}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        {isBn ? "ড্যাশবোর্ড" : "Dashboard"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setMobileOpen(false); router.push(profilePath); }}>
                        <User className="mr-2 h-4 w-4" />
                        {isBn ? "প্রোফাইল" : "Profile"}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => { setMobileOpen(false); router.push(settingsPath); }}>
                        <Settings className="mr-2 h-4 w-4" />
                        {isBn ? "সেটিংস" : "Settings"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => { setMobileOpen(false); logout(); }} className="text-destructive">
                        <LogOut className="mr-2 h-4 w-4" />
                        {isBn ? "লগআউট" : "Logout"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}

              {/* Mobile Navigation */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-4">
                {isEmployer && employerMobileLinks.length > 0 ? (
                  employerMobileLinks.map((group) => (
                    <div key={group.group}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 px-3 text-muted-foreground">
                        {group.group}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((link) => {
                          const Icon = link.icon;
                          const isActive = (() => {
                            const matches = pathname === link.href || pathname.startsWith(link.href + "/");
                            if (!matches) return false;
                            return !group.items.some(
                              (other) =>
                                other.href !== link.href &&
                                other.href.startsWith(link.href + "/") &&
                                (pathname === other.href || pathname.startsWith(other.href + "/"))
                            );
                          })();
                          return (
                            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                                isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted"
                              }`}>
                              <Icon className="h-4 w-4 shrink-0" />
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : isCandidate && candidateMobileLinks.length > 0 ? (
                  candidateMobileLinks.map((group) => (
                    <div key={group.group}>
                      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1.5 px-3 text-muted-foreground">
                        {group.group}
                      </p>
                      <div className="space-y-0.5">
                        {group.items.map((link) => {
                          const Icon = link.icon;
                          const isActive = (() => {
                            const matches = pathname === link.href || pathname.startsWith(link.href + "/");
                            if (!matches) return false;
                            return !group.items.some(
                              (other) =>
                                other.href !== link.href &&
                                other.href.startsWith(link.href + "/") &&
                                (pathname === other.href || pathname.startsWith(other.href + "/"))
                            );
                          })();
                          return (
                            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                                isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted"
                              }`}>
                              <Icon className="h-4 w-4 shrink-0" />
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  allMobileLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
                    return (
                      <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                          isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-muted"
                        }`}>
                        <Icon className="h-4 w-4 shrink-0" />
                        {link.label}
                      </Link>
                    );
                  })
                )}
                {isAuthenticated && (
                  <button onClick={() => { setMobileOpen(false); logout(); }}
                    className="flex items-center gap-3 px-3 py-2 mb-8 rounded-lg text-sm font-bold text-destructive hover:bg-destructive/10 transition-colors w-full">
                    <LogOut className="h-4 w-4 shrink-0" />
                    {isBn ? "লগআউট" : "Logout"}
                  </button>
                )}
              </nav>

              {/* Bottom Actions */}
              <div className="p-4 border-t">
                {!isAuthenticated && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={toggleLanguage} className="flex-1 gap-1.5">
                        <Globe className="h-3.5 w-3.5" />
                        {isBn ? "English" : "বাংলা"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setTheme(activeTheme === "dark" ? "light" : "dark")} className="flex-1 gap-1.5">
                        {mounted ? (activeTheme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />) : <Moon className="h-3.5 w-3.5" />}
                        {mounted ? (activeTheme === "dark" ? "Light" : "Dark") : "Theme"}
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" onClick={() => { setMobileOpen(false); router.push("/login"); }}>
                        {isBn ? "লগইন" : "Login"}
                      </Button>
                      <Button className="flex-1" onClick={() => { setMobileOpen(false); router.push("/register"); }}>
                        {isBn ? "নিবন্ধন" : "Register"}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
    </>
  );
}
