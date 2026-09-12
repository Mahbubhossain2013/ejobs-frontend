/**
 * CV Template Download Tracker
 * Tracks and persists real download counts for each CV template.
 * Strictly starts from 0 and increments every time a user downloads or prints a CV.
 */

import { API_BASE } from "@/lib/api-client";

const STORAGE_KEY_PREFIX = "ejobs_cv_downloads_v2_";

/**
 * Helper to convert English digits to Bengali digits
 */
export function toBengaliNumber(num: number): string {
  if (num === null || num === undefined || isNaN(num)) return "০";
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return num.toLocaleString().replace(/\d/g, (d) => bnDigits[parseInt(d, 10)] || d);
}

/**
 * Get total download count for a given template slug.
 * Strictly starts from 0 (or from database download_count).
 */
export function getTemplateDownloadCount(slug?: string, initialCount?: number): number {
  const base = typeof initialCount === "number" && !isNaN(initialCount) ? initialCount : 0;
  if (!slug || typeof window === "undefined") return base;

  try {
    const storedIncrement = localStorage.getItem(`${STORAGE_KEY_PREFIX}${slug}`);
    const increment = storedIncrement ? parseInt(storedIncrement, 10) : 0;
    return base + (isNaN(increment) ? 0 : increment);
  } catch {
    return base;
  }
}

/**
 * Record a new download for a given template slug (increments count by 1)
 * Also syncs with the backend API in the background.
 */
export function recordTemplateDownload(slug?: string, baseCount?: number): number {
  if (!slug) return 0;
  if (typeof window === "undefined") return getTemplateDownloadCount(slug, baseCount);

  try {
    const key = `${STORAGE_KEY_PREFIX}${slug}`;
    const currentInc = parseInt(localStorage.getItem(key) || "0", 10);
    const newInc = (isNaN(currentInc) ? 0 : currentInc) + 1;
    localStorage.setItem(key, newInc.toString());

    const totalCount = getTemplateDownloadCount(slug, baseCount) + 1;

    // Dispatch custom event so all open cards update instantly
    window.dispatchEvent(
      new CustomEvent("cv-template-downloaded", {
        detail: { slug, count: totalCount },
      })
    );

    // Background sync with backend API to increment persistent download count in database
    fetch(`${API_BASE}/api/cv/templates/${slug}/track-download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {});

    return totalCount;
  } catch {
    return getTemplateDownloadCount(slug, baseCount);
  }
}

/**
 * Format download count into a short human-readable string (e.g., 0, 1, 15, or 1.2k)
 */
export function formatDownloadCount(count: number, isBn: boolean = false): string {
  if (!count || isNaN(count) || count <= 0) return isBn ? "০" : "0";
  if (count >= 1000) {
    const k = (count / 1000).toFixed(1).replace(/\.0$/, "");
    return isBn ? `${toBengaliNumber(parseFloat(k))}k` : `${k}k`;
  }
  return isBn ? toBengaliNumber(count) : count.toLocaleString();
}
