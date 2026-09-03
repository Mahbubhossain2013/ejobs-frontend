"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth-store";
import { authService, type LoginPayload, type RegisterPayload } from "@/services/auth.service";
import { resetCsrf } from "@/lib/api-client";
import type { UserRole } from "@/types";
import { toast } from "sonner";

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, token, role, isAuthenticated, isLoading, setAuth, logout: storeLogout, setLoading } =
    useAuthStore();

  const { data: currentUser } = useQuery({
    queryKey: ["auth", "user"],
    queryFn: async () => {
      try {
        return await authService.getUser();
      } catch (e: any) {
        if (e?.response?.status === 401) {
          storeLogout();
          queryClient.clear();
          return null;
        }
        throw e;
      }
    },
    enabled: !!token && !user,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginPayload) => authService.login(data),
    onSuccess: (data) => {
      if (data.requires_2fa) {
        return;
      }
      const userRole = (data.role || data.user?.role || "candidate") as UserRole;

      setAuth(data.user ?? null, data.token || "", userRole);
      queryClient.clear();
      toast.success("Login successful!");
      if (userRole === "employer") {
        router.push("/employer/dashboard");
      } else if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const verify2faMutation = useMutation({
    mutationFn: (data: { temp_token: string; code: string }) => authService.verify2fa(data),
    onSuccess: (data) => {
      const userRole = (data.role || data.user?.role || "candidate") as UserRole;

      setAuth(data.user ?? null, data.token || "", userRole);
      queryClient.clear();
      toast.success("Login successful!");
      if (userRole === "employer") {
        router.push("/employer/dashboard");
      } else if (userRole === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "2FA verification failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterPayload) => authService.register(data),
    onSuccess: (data) => {
      const userRole = (data.role || data.user?.role || "candidate") as UserRole;
      setAuth(data.user ?? null, data.token || "", userRole);
      queryClient.clear();
      toast.success("Registration successful! Please verify your email.");
      if (userRole === "employer") {
        router.push("/employer/verify?post_registration=true");
      } else {
        router.push("/dashboard/verify?post_registration=true");
      }
    },
    onError: (error: { response?: { data?: { message?: string } } }) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore error on logout
    }
    resetCsrf();
    storeLogout();
    queryClient.clear();
    router.push("/login");
  }, [storeLogout, queryClient, router]);

  return {
    user: currentUser || user,
    token,
    role,
    isAuthenticated,
    isLoading,
    login: loginMutation,
    verify2fa: verify2faMutation,
    register: registerMutation,
    logout,
    setLoading,
  };
}
