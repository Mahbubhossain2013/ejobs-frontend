"use client";

import { useEffect } from "react";
import { useThemeStore } from "@/store/theme-store";
import api from "@/lib/api-client";

function hexToHsl(hex: string): string {
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("");
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) {
    return `hsl(0 0% ${Math.round(l * 100)}%)`;
  }

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return `hsl(${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
}

function applySettingsToDOM(settings: Record<string, any>) {
  const root = document.documentElement;

  if (settings.border_radius) {
    root.style.setProperty("--radius", settings.border_radius);
  }
  if (settings.english_font) {
    root.style.setProperty("--font-english", settings.english_font);
  }
  if (settings.bangla_font) {
    root.style.setProperty("--font-bangla", settings.bangla_font);
  }
  const fontSize = settings.global_font_size || settings.font_size;
  if (fontSize) {
    root.style.setProperty("--app-font-size", `${fontSize}px`);
  }
  if (settings.phone_font_size) {
    root.style.setProperty("--app-font-size-phone", settings.phone_font_size);
  }
  if (settings.tablet_font_size) {
    root.style.setProperty("--app-font-size-tablet", settings.tablet_font_size);
  }
  if (settings.primary_color) {
    root.style.setProperty("--primary-color", hexToHsl(settings.primary_color));
  }
  if (settings.button_bg) {
    root.style.setProperty("--button-bg", settings.button_bg);
  }
}

export function useTheme() {
  const store = useThemeStore();
  const cached = store.settings;

  // Instantly apply cached settings (from Zustand/persist) on mount
  useEffect(() => {
    if (cached && Object.keys(cached).length > 0) {
      applySettingsToDOM(cached);
    }
  }, []);

  // Background refresh from API — deduped to a single request per session
  useEffect(() => {
    if (store.loadingSettings === false && Object.keys(store.settings).length > 0) {
      return;
    }

    const themePromise = (globalThis as any).__themeSettingsPromise as
      | Promise<Record<string, any> | null>
      | undefined;
    if (!themePromise) {
      const p = api
        .get("/settings/theme")
        .then((res) => res.data?.data || null)
        .catch(() => null);
      (globalThis as any).__themeSettingsPromise = p;
    }

    (globalThis as any).__themeSettingsPromise.then((data: Record<string, any> | null) => {
      if (data) {
        store.setSettings(data);
        store.setLoadingSettings(false);
        applySettingsToDOM(data);
        if (data.timezone) {
          localStorage.setItem("timezone", data.timezone);
        }
        if (data.default_language && !localStorage.getItem("theme-storage")) {
          document.documentElement.lang = data.default_language;
          store.setLanguage(data.default_language as "en" | "bn");
        }
        if (data.behavior_tracking_enabled !== undefined) {
          localStorage.setItem("behavior_tracking_enabled", String(data.behavior_tracking_enabled));
        }
      } else {
        store.setLoadingSettings(false);
      }
    });
  }, [store.setSettings, store.setLoadingSettings]);

  return store;
}