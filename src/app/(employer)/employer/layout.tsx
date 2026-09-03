"use client";

import React, { Suspense, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useThemeStore } from "@/store/theme-store";
import { useEmployerCompany } from "@/hooks/use-employer-company";
import Navbar from "@/components/layout/Navbar";
import QuotaDisplay from "@/components/subscription/QuotaDisplay";
import { DefaultAvatar } from "@/components/ui/default-avatar";
import {
  LayoutDashboard, Briefcase, Users, Plus, CreditCard, Settings,
  Bell, User, MessageSquare, BarChart3, Megaphone, FolderKanban,
  ShieldCheck, Wallet, Headphones, ShoppingCart, Building2, Plane, FileText, LogOut,
} from "lucide-react";

type SidebarGroup = { group: string; groupBn: string; color: string; items: typeof sidebarItems };

const sidebarItems = [
  { href: "/employer/dashboard", label: "Dashboard", labelBn: "ড্যাশবোর্ড", icon: LayoutDashboard },
  { href: "/employer/company-overview", label: "Company Overview", labelBn: "কোম্পানি সারসংক্ষেপ", icon: Building2 },
  { href: "/employer/profile", label: "Profile", labelBn: "প্রোফাইল", icon: User },
  { href: "/employer/post-job", label: "Post Job", labelBn: "চাকরি পোস্ট করুন", icon: Plus },
  { href: "/employer/manage-jobs", label: "Manage Jobs", labelBn: "চাকরি ব্যবস্থাপনা", icon: Briefcase },
  { href: "/employer/applicants", label: "Applicants", labelBn: "আবেদনকারীগণ", icon: Users },
  { href: "/employer/candidates", label: "Candidates", labelBn: "প্রার্থীগণ", icon: Users },
  { href: "/employer/deployments", label: "Deployments", labelBn: "নিয়োগ ট্র্যাকার", icon: Plane },
  { href: "/employer/cv-database", label: "CV Database", labelBn: "সিভি ডাটাবেজ", icon: FileText },
  { href: "/employer/messages", label: "Messages", labelBn: "বার্তা", icon: MessageSquare },
  { href: "/employer/workspace", label: "Workspace", labelBn: "ওয়ার্কস্পেস", icon: FolderKanban },
  { href: "/employer/contracts", label: "Contracts", labelBn: "চুক্তি", icon: FileText },
  { href: "/employer/wallet", label: "Wallet", labelBn: "ওয়ালেট", icon: Wallet },
  { href: "/employer/purchases", label: "Purchases", labelBn: "ক্রয়সমূহ", icon: ShoppingCart },
  { href: "/employer/promotions", label: "Promotions", labelBn: "বিজ্ঞাপন প্রচার", icon: Megaphone },
  { href: "/employer/subscription", label: "Subscription", labelBn: "সাবস্ক্রিপশন", icon: CreditCard },
  { href: "/employer/verify", label: "Verification", labelBn: "যাচাইকরণ", icon: ShieldCheck },
  { href: "/employer/analytics", label: "Analytics", labelBn: "অ্যানালিটিক্স", icon: BarChart3 },
  { href: "/employer/notifications", label: "Notifications", labelBn: "নোটিফিকেশন", icon: Bell },
  { href: "/employer/support", label: "Support", labelBn: "সাপোর্ট", icon: Headphones },
  { href: "/employer/settings", label: "Settings", labelBn: "সেটিংস", icon: Settings },
];

const sidebarGroups: SidebarGroup[] = [
  { group: "Overview", groupBn: "সারসংক্ষেপ", color: "text-blue-500", items: sidebarItems.filter(i => ["/employer/dashboard", "/employer/company-overview", "/employer/profile", "/employer/analytics"].includes(i.href)) },
  { group: "Hiring", groupBn: "নিয়োগ", color: "text-emerald-500", items: sidebarItems.filter(i => ["/employer/post-job", "/employer/manage-jobs", "/employer/applicants", "/employer/candidates", "/employer/deployments", "/employer/cv-database", "/employer/workspace", "/employer/contracts"].includes(i.href)) },
  { group: "Finance", groupBn: "আর্থিক", color: "text-amber-500", items: sidebarItems.filter(i => ["/employer/wallet", "/employer/purchases", "/employer/promotions", "/employer/subscription"].includes(i.href)) },
  { group: "Account", groupBn: "অ্যাকাউন্ট", color: "text-purple-500", items: sidebarItems.filter(i => ["/employer/messages", "/employer/verify", "/employer/notifications", "/employer/support", "/employer/settings"].includes(i.href)) },
];

function Sidebar() {
  const pathname = usePathname();
  const { language } = useThemeStore();
  const { company } = useEmployerCompany();
  const { logout } = useAuth();
  const isBn = language === "bn";

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-blue-50/80 dark:bg-blue-950/20 border-r border-blue-100 dark:border-blue-900/30 overflow-y-auto">
      <div className="p-4 border-b border-blue-100 dark:border-blue-900/30">
        <Link href="/employer/dashboard" className="flex items-center gap-3">
          <DefaultAvatar
            src={company?.logo}
            name={company?.name}
            className="h-10 w-10"
          />
          <div className="min-w-0">
            <p className="text-sm font-bold truncate">{company?.name || (isBn ? "ড্যাশবোর্ড" : "Dashboard")}</p>
            {company?.industry && (
              <p className="text-xs text-muted-foreground truncate">{company.industry}</p>
            )}
          </div>
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
                  if (item.href === "/employer/dashboard") return pathname === "/employer/dashboard";
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
      <QuotaDisplay />
    </aside>
  );
}

export default function EmployerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated, role, logout } = useAuth();
  const { language } = useThemeStore();
  const isBn = language === "bn";

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated || role !== "employer") {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <p className="text-muted-foreground">
            {isBn ? "এই পৃষ্ঠাটি শুধুমাত্র নিয়োগকর্তাদের জন্য" : "This page is for employers only"}
          </p>
          <a href="/login" className="text-primary underline">
            {isBn ? "লগইন" : "Login"}
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
        {/* Mobile bottom nav with logout */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border p-2 flex items-center justify-between safe-area-inset">
          <Link href="/employer/dashboard" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <LayoutDashboard className="h-4 w-4" />
            {isBn ? "হোম" : "Home"}
          </Link>
          <Link href="/employer/manage-jobs" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Briefcase className="h-4 w-4" />
            {isBn ? "চাকরি" : "Jobs"}
          </Link>
          <Link href="/employer/messages" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <MessageSquare className="h-4 w-4" />
            {isBn ? "বার্তা" : "Messages"}
          </Link>
          <Link href="/employer/wallet" className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-muted-foreground hover:bg-muted transition-colors">
            <Wallet className="h-4 w-4" />
            {isBn ? "ওয়ালেট" : "Wallet"}
          </Link>
          <button onClick={logout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors">
            <LogOut className="h-4 w-4" />
            {isBn ? "লগআউট" : "Logout"}
          </button>
        </div>
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