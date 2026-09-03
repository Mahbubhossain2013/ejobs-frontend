"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User, UserRole } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  setAuth: (user: User | null, token: string, role: UserRole) => void;
  setUser: (user: User) => void;
  setToken: (token: string | null) => void;
  setRole: (role: UserRole | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isLoading: true,

      setAuth: (user, token, role) =>
        set({
          user,
          token,
          role,
          isAuthenticated: true,
          isLoading: false,
        }),

      setUser: (user) => set({ user }),

      setToken: (token) =>
        set({
          token,
          isAuthenticated: !!token,
        }),

      setRole: (role) => set({ role }),

      setLoading: (isLoading) => set({ isLoading }),

      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("auth-storage");
        }
        set({
          user: null,
          token: null,
          role: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        role: state.role,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (_state, error) => {
        if (error) {
          localStorage.removeItem("auth-storage");
        }
        useAuthStore.setState({ isLoading: false });
      },
    }
  )
);
