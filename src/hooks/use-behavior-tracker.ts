"use client";

import { useEffect, useCallback, useRef } from "react";
import api from "@/lib/api-client";
import { useAuthStore } from "@/store/auth-store";

type ActivityType =
  | "job_view"
  | "job_save"
  | "application"
  | "profile_visit"
  | "company_visit"
  | "search_history"
  | "scroll_depth"
  | "click_pattern"
  | "session_engagement"
  | "page_view";

interface TrackOptions {
  targetId?: number;
  metaData?: Record<string, any>;
}

export function trackBehavior(activityType: ActivityType, options?: TrackOptions) {
  const { token } = useAuthStore.getState();
  if (!token) return;

  api
    .post("/behavior/track", {
      activity_type: activityType,
      target_id: options?.targetId ?? null,
      meta_data: options?.metaData ?? {},
    })
    .catch(() => {});
}

export function BehaviorTracker() {
  useEffect(() => {
    trackBehavior("page_view");
  }, []);

  return null;
}

export function useScrollDepthTracking(thresholds: number[] = [25, 50, 75, 100]) {
  const trackedRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight <= 0) return;
      const percent = Math.round((window.scrollY / scrollHeight) * 100);

      for (const t of thresholds) {
        if (percent >= t && !trackedRef.current.has(t)) {
          trackedRef.current.add(t);
          trackBehavior("scroll_depth", { metaData: { depth: t, page_url: window.location.href } });
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [thresholds]);
}

export function useClickPatternTracking() {
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const selector = target.tagName.toLowerCase() + (target.id ? `#${target.id}` : "") + (target.className && typeof target.className === "string" ? `.${target.className.split(" ")[0]}` : "");
      trackBehavior("click_pattern", {
        metaData: {
          selector,
          text: target.textContent?.slice(0, 50)?.trim() || "",
          page_url: window.location.href,
          x: e.clientX,
          y: e.clientY,
        },
      });
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);
}

export function useSessionEngagementTracking(intervalMs: number = 30000) {
  const activeTimeRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else {
        if (!intervalRef.current) {
          intervalRef.current = setInterval(() => {
            activeTimeRef.current += intervalMs / 1000;
            trackBehavior("session_engagement", {
              metaData: { active_seconds: activeTimeRef.current, page_url: window.location.href },
            });
          }, intervalMs);
        }
      }
    };

    intervalRef.current = setInterval(() => {
      activeTimeRef.current += intervalMs / 1000;
      trackBehavior("session_engagement", {
        metaData: { active_seconds: activeTimeRef.current, page_url: window.location.href },
      });
    }, intervalMs);

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [intervalMs]);
}
