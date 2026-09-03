"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const provider = searchParams.get("provider");
    const error = searchParams.get("error");

    if (error) {
      router.replace("/login?error=social_auth_failed");
      return;
    }

    if (token && role) {
      // Store auth data
      setAuth(null, token, role as "candidate" | "employer" | "admin");

      // Redirect based on role
      if (role === "admin") {
        router.replace("/admin/dashboard");
      } else if (role === "employer") {
        router.replace("/employer/dashboard");
      } else {
        router.replace("/dashboard");
      }
    } else {
      router.replace("/login?error=no_token");
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
