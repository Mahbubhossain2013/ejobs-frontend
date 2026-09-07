import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { convertPrice, getCurrencyCode, getCurrencySymbol, getExchangeRate } from "./currency";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return convertPrice(amount);
}

export function getTimezone(): string {
  if (typeof window === "undefined") return "Asia/Dhaka";
  return localStorage.getItem("timezone") || "Asia/Dhaka";
}

export function formatDate(date: string | Date, timezone?: string): string {
  const tz = timezone || (typeof window !== "undefined" ? localStorage.getItem("timezone") || "Asia/Dhaka" : "Asia/Dhaka");
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: tz,
  }).format(new Date(date));
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(date);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function truncate(text: string, length: number): string {
  const clean = stripHtml(text);
  if (clean.length <= length) return clean;
  return clean.slice(0, length).trimEnd() + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const STORAGE_BASE = (
  process.env.NEXT_PUBLIC_STORAGE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "https://admin.ejobs.bd"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

/**
 * Centralized storage URL builder.
 * - Returns empty string for empty/missing paths
 * - Passes through http/https/blob/data URLs as-is (fixing local test domains if present)
 * - Returns absolute URL pointing to backend storage (https://admin.ejobs.bd/storage/...)
 */
export function getStorageUrl(path: string | null | undefined): string {
  if (!path || typeof path !== "string") return "";
  const trimmed = path.trim();
  if (!trimmed) return "";

  // Replace local test origins if stored in DB
  if (trimmed.includes("127.0.0.1:8000/storage/") || trimmed.includes("localhost:8000/storage/")) {
    return trimmed.replace(/^https?:\/\/(127\.0\.0\.1|localhost):8000\/storage\//, `${STORAGE_BASE}/storage/`);
  }

  // Already a full URL or blob/data — pass through
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("data:")
  ) {
    return trimmed;
  }

  // Strip any leading slashes for normalization
  const clean = trimmed.replace(/^\/+/, "");

  // If it starts with "storage/", strip it to attach cleanly to STORAGE_BASE/storage/
  const cleanPath = clean.startsWith("storage/") ? clean.slice(8) : clean;

  return `${STORAGE_BASE}/storage/${cleanPath}`;
}
