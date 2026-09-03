"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeSettings } from "@/types";

type ThemeMode = "light" | "dark" | "system";
type Language = "en" | "bn";

interface ThemeState {
  themeMode: ThemeMode;
  language: Language;
  settings: ThemeSettings;
  loadingSettings: boolean;
  isDarkActive: boolean;

  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  setSettings: (settings: ThemeSettings) => void;
  setLoadingSettings: (loading: boolean) => void;
  setIsDarkActive: (isDark: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      themeMode: "system",
      language: "bn",
      settings: {},
      loadingSettings: true,
      isDarkActive: false,

      setThemeMode: (themeMode) => set({ themeMode }),
      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === "light" ? "dark" : "light",
        })),
      setLanguage: (language) => set({ language }),
      toggleLanguage: () =>
        set((state) => ({
          language: state.language === "bn" ? "en" : "bn",
        })),
      setSettings: (settings) => set({ settings }),
      setLoadingSettings: (loadingSettings) => set({ loadingSettings }),
      setIsDarkActive: (isDarkActive) => set({ isDarkActive }),
    }),
    {
      name: "theme-storage",
      partialize: (state) => ({
        themeMode: state.themeMode,
        language: state.language,
        settings: state.settings,
      }),
    }
  )
);