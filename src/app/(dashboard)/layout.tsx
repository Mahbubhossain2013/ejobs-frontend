"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { useNotificationStore } from "@/store/notification-store";
import Navbar from "@/components/layout/Navbar";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard, Briefcase, Bookmark, Send, FileText, Wallet,
  Settings, Bell, User, MessageSquare, BarChart3, Shield, CreditCard,
  FolderKanban, Headphones, ShoppingCart, Home, Calendar, Plane,
  GraduationCap, Award, ClipboardCheck, CheckCircle, LogOut,
} from "lucide-react";

type SidebarGroup = { group: string; groupBn: string; color: string; items: typeof sidebarItems };

const sidebarItems = [
  { href: "/dashboard", label: "Dashboard", labelBn: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/dashboard/profile/overview", label: "Profile Overview", labelBn: "প্রোফাইল ওভারভিউ", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", labelBn: "প্রোফাইল", icon: User },
  { href: "/dashboard/resume", label: "Resume", labelBn: "জীবনবৃত্তান্ত", icon: FileText },
  { href: "/dashboard/applied-jobs", label: "Applied Jobs", labelBn: "আবেদনকৃত চাকরি", icon: Send },
  { href: "/dashboard/accepted-jobs", label: "Accepted Jobs", labelBn: "গৃহীত চাকরি", icon: CheckCircle },
  { href: "/dashboard/saved-jobs", label: "Saved Jobs", labelBn: "সংরক্ষিত চাকরি", icon: Bookmark },
  { href: "/dashboard/job-alerts", label: "Job Alerts", labelBn: "জব এলার্ট", icon: Bell },
  { href: "/dashboard/messages", label: "Messages", labelBn: "বার্তা", icon: MessageSquare },
  { href: "/dashboard/workspace", label: "Workspace", labelBn: "ওয়ার্কস্পেস", icon: FolderKanban },
  { href: "/dashboard/deployments", label: "Deployments", labelBn: "নিয়োগ ট্র্যাকার", icon: Plane },
  { href: "/dashboard/skill-center", label: "Skill Center", labelBn: "দক্ষতা কেন্দ্র", icon: GraduationCap },
  { href: "/dashboard/skill-center/certificates", label: "My Certificates", labelBn: "আমার সার্টিফিকেট", icon: Award },
  { href: "/dashboard/interviews", label: "Interviews", labelBn: "সাক্ষাৎকার", icon: Calendar },
  { href: "/dashboard/wallet", label: "Wallet", labelBn: "ওয়ালেট", icon: Wallet },
  { href: "/dashboard/purchases", label: "Purchases", labelBn: "ক্রয়সমূহ", icon: ShoppingCart },
  { href: "/dashboard/subscription", label: "Subscription", labelBn: "সাবস্ক্রিপশন", icon: CreditCard },
  { href: "/dashboard/verify", label: "Verification", labelBn: "যাচাইকরণ", icon: Shield },
  { href: "/dashboard/analytics", label: "Analytics", labelBn: "অ্যানালিটিক্স", icon: BarChart3 },
  { href: "/dashboard/notifications", label: "Notifications", labelBn: "নোটিফিকেশন", icon: Bell },
  { href: "/dashboard/notifications/preferences", label: "Notification Prefs", labelBn: "নোটিফিকেশন পছন্দ", icon: Settings },
  { href: "/dashboard/disputes", label: "Disputes", labelBn: "বিরোধসমূহ", icon: Shield },
  { href: "/dashboard/settings", label: "Settings", labelBn: "সেটিংস", icon: Settings },
  { href: "/dashboard/support", label: "Support", labelBn: "সাপোর্ট", icon: Headphones },
];

const sidebarGroups: SidebarGroup[] = [
  { group: "Overview", groupBn: "সারসংক্ষেপ", color: "text-blue-500", items: sidebarItems.filter(i => ["/dashboard", "/dashboard/profile/overview", "/dashboard/profile", "/dashboard/analytics"].includes(i.href)) },
  { group: "Jobs & Work", groupBn: "চাকরি ও কাজ", color: "text-emerald-500", items: sidebarItems.filter(i => ["/dashboard/resume", "/dashboard/applied-jobs", "/dashboard/accepted-jobs", "/dashboard/saved-jobs", "/dashboard/job-alerts", "/dashboard/workspace", "/dashboard/interviews"].includes(i.href)) },
  { group: "Skill Center", groupBn: "দক্ষতা কেন্দ্র", color: "text-orange-500", items: sidebarItems.filter(i => ["/dashboard/skill-center", "/dashboard/skill-center/certificates"].includes(i.href)) },
  { group: "Finance", groupBn: "আর্থিক", color: "text-amber-500", items: sidebarItems.filter(i => ["/dashboard/wallet", "/dashboard/purchases", "/dashboard/subscription"].includes(i.href)) },
  { group: "Account", groupBn: "অ্যাকাউন্ট", color: "text-purple-500", items: sidebarItems.filter(i => ["/dashboard/messages", "/dashboard/verify", "/dashboard/notifications", "/dashboard/notifications/preferences", "/dashboard/disputes", "/dashboard/settings", "/dashboard/support"].includes(i.href)) },
];

function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { language } = useThemeStore();
  const { unreadCount } = useNotificationStore();
  const isBn = language === "bn";

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-blue-50/80 dark:bg-blue-950/20 border-r border-blue-100 dark:border-blue-900/30 overflow-y-auto">
      <div className="p-4 border-b border-blue-100 dark:border-blue-900/30">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Briefcase className="h-5 w-5 text-primary" />
          {isBn ? "ড্যাশবোর্ড" : "Dashboard"}
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-4">
        {sidebarGroups.map((group) => (
          <div key={group.group}>
            <p className={`text-[11px] font-semibold uppercase tracking-wider mb-1.5 px-3 ${group.color}`}>
              {isBn ? group.groupBn : group.group}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = (() => {
                  if (item.href === "/dashboard") return pathname === "/dashboard";
                  if (item.href === "/dashboard/profile") return pathname === "/dashboard/profile";
                  const matches = pathname === item.href || pathname.startsWith(item.href + "/");
                  if (!matches) return false;
                  return !group.items.some(
                    (other) =>
                      other.href !== item.href &&
                      other.href.startsWith(item.href + "/") &&
                      (pathname === other.href || pathname.startsWith(other.href + "/"))
                  );
                })();
                return (
                  <Link key={item.href} href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {isBn ? item.labelBn : item.label}
                    {item.label === "Notifications" && unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-auto text-[10px] px-1.5 py-0">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="p-3 border-t border-blue-100 dark:border-blue-900/30">
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold transition-colors w-full text-destructive hover:bg-destructive/10">
          <LogOut className="h-4 w-4 shrink-0" />
          {isBn ? "লগআউট" : "Logout"}
        </button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, role } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (role === "employer" || role === "admin") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            {isBn ? "এই পৃষ্ঠাটি শুধুমাত্র প্রার্থীদের জন্য" : "This page is for candidates only"}
          </p>
          <a href="/login" className="text-primary underline">
            {isBn ? "লগইনে যান" : "Go to Login"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 lg:pb-6 main-surface">
          <Suspense
            fallback={
              <div className="flex items-center justify-center min-h-[40vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            }
          >
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}
