"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import api from "@/lib/api-client";

const PUBLIC_ROUTES = [
  "/",
  "/jobs",
  "/companies",
  "/candidates",
  "/leaderboard",
  "/login",
  "/register",
  "/employer/register",
  "/forgot-password",
  "/verify-email",
  "/pricing",
  "/ai-career",
  "/ai-assistant",
  "/resume-builder",
  "/cv-builder",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/help",
  "/notices",
  "/support",
  "/invoices",
  "/auth/callback",
  "/account-restricted",
];

const GUEST_ONLY_ROUTES = ["/login", "/employer/register"];

const EMPLOYEE_AUTH_ROUTES = ["/employer/register"];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { token, isAuthenticated, setLoading, setAuth, logout } =
    useAuthStore();
  const [rehydrated, setRehydrated] = useState(false);
  const [verified, setVerified] = useState(false);

  // Wait for Zustand persist rehydration before making auth decisions
  useEffect(() => {
    const unsub = useAuthStore.subscribe(
      (state, prevState) => {
        if (prevState.isLoading && !state.isLoading) {
          setRehydrated(true);
        }
      }
    );

    if (!useAuthStore.getState().isLoading) {
      setRehydrated(true);
    }

    return unsub;
  }, []);

  useEffect(() => {
    const verifyUser = async () => {
      try {
        if (token) {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
          const res = await api.get("/user");
          const userData = res.data.data ?? res.data;
          const role =
            userData.role ||
            userData.roles?.[0]?.name ||
            "candidate";
          setAuth(userData, token, role);
        }
      } catch (error: { response?: { status?: number } } | unknown) {
        if ((error as { response?: { status?: number } })?.response?.status === 401) {
          logout();
        }
      } finally {
        setLoading(false);
        setVerified(true);
      }
    };

    verifyUser();
  }, [token, setAuth, setLoading, logout]);

  // Only run redirect logic after rehydration AND initial verification is complete
  useEffect(() => {
    if (!rehydrated || !verified) return;
    if (typeof window === "undefined") return;

    const currentAuth = useAuthStore.getState();
    const isGuestOnly = GUEST_ONLY_ROUTES.includes(pathname);
    const isEmployeeAuth = EMPLOYEE_AUTH_ROUTES.includes(pathname);
    const isDashboard = pathname.startsWith("/dashboard") || (pathname.startsWith("/employer") && !isEmployeeAuth) || pathname.startsWith("/admin");

    if (!currentAuth.isAuthenticated && isDashboard) {
      router.push("/login");
    }

    if (currentAuth.isAuthenticated && isGuestOnly) {
      const role = currentAuth.role;
      if (role === "employer") {
        router.push("/employer/dashboard");
      } else {
        router.push("/dashboard");
      }
    }
  }, [rehydrated, verified, isAuthenticated, pathname, router]);

  return <>{children}</>;
}
