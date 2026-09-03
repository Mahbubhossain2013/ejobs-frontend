"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useThemeStore } from "@/store/theme-store";
import { useAuth } from "@/hooks/use-auth";
import { ShieldAlert, Mail, Headphones, LogOut } from "lucide-react";

export default function AccountRestrictedPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "suspended";
  const { language } = useThemeStore();
  const { logout } = useAuth();
  const isBn = language === "bn";

  const isBanned = status === "banned";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-6">
        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
          <ShieldAlert className="h-10 w-10 text-red-500 dark:text-red-400" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-foreground">
          {isBn
            ? isBanned
              ? "আপনার অ্যাকাউন্ট নিষিদ্ধ করা হয়েছে"
              : "আপনার অ্যাকাউন্ট স্থগিত করা হয়েছে"
            : isBanned
              ? "Your Account Has Been Banned"
              : "Your Account Has Been Suspended"}
        </h1>

        {/* Message */}
        <p className="text-muted-foreground leading-relaxed">
          {isBn
            ? isBanned
              ? "আপনার অ্যাকাউন্টটি আমাদের সেবার শর্তাবলী লঙ্ঘনের কারণে নিষিদ্ধ করা হয়েছে। আপনি এই অ্যাকাউন্ট দিয়ে আর প্ল্যাটফর্মে প্রবেশ করতে পারবেন না।"
              : "আপনার অ্যাকাউন্টটি আমাদের সেবার শর্তাবলী লঙ্ঘনের কারণে স্থগিত করা হয়েছে। অ্যাকাউন্টটি পুনরুদ্ধারের জন্য সাপোর্ট টিমের সাথে যোগাযোগ করুন।"
            : isBanned
              ? "Your account has been banned due to violations of our terms of service. You can no longer access the platform with this account."
              : "Your account has been suspended due to violations of our terms of service. Please contact our support team to restore your account."}
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="mailto:support@ejobs.com"
            className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            <Mail className="h-4 w-4" />
            {isBn ? "সাপোর্টে যোগাযোগ করুন" : "Contact Support"}
          </a>

          <a
            href="https://www.facebook.com/ejobs.com.bd"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 border border-border px-6 py-3 rounded-lg font-semibold hover:bg-muted transition-colors"
          >
            <Headphones className="h-4 w-4" />
            {isBn ? "হেল্পলাইন" : "Help Line"}
          </a>
        </div>

        {/* Logout */}
        <button
          onClick={() => logout()}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" />
          {isBn ? "লগ আউট" : "Log Out"}
        </button>

        {/* Footer link */}
        <p className="text-xs text-muted-foreground">
          {isBn ? (
            <>সমস্যাটি ভুল বোঝাবোনি হলে <Link href="/terms" className="underline hover:text-foreground">সেবার শর্তাবলী</Link> দেখুন।</>
          ) : (
            <>If you believe this is an error, review our <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>.</>
          )}
        </p>
      </div>
    </div>
  );
}
