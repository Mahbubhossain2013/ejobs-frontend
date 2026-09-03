import axios from "axios";
import type { AxiosError, InternalAxiosRequestConfig } from "axios";

declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _csrfRetried?: boolean;
  }
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://admin.ejobs.bd").replace(/\/api\/?$/, "");
const isBrowser = typeof window !== "undefined";
const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },
});

// Fetch CSRF cookie before making state-changing requests
let csrfFetched = false;
let csrfFetchPromise: Promise<void> | null = null;

async function ensureCsrfCookie() {
  if (csrfFetched) return;
  if (!csrfFetchPromise) {
    csrfFetchPromise = axios
      .get(isBrowser ? "/sanctum/csrf-cookie" : `${API_BASE}/sanctum/csrf-cookie`, {
        withCredentials: true,
      })
      .then(() => {
        csrfFetched = true;
      })
      .catch(() => {
        // CSRF cookie may not be required for all setups
        csrfFetched = false;
      })
      .finally(() => {
        csrfFetchPromise = null;
      });
  }
  return csrfFetchPromise;
}

// Invalidate the cached CSRF cookie so the next request fetches a fresh token.
// Needed after logout / session expiry where the old token no longer matches.
export function resetCsrf() {
  csrfFetched = false;
}

// Read token from Zustand persist store
function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("auth-storage");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token || null;
  } catch {
    return null;
  }
}

// Clear auth store completely
function clearAuthStore() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem("auth-storage");
  } catch {
    // ignore
  }
}

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = getStoredToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Fetch CSRF cookie before state-changing requests
    if (["post", "put", "patch", "delete"].includes(config.method?.toLowerCase() || "")) {
      await ensureCsrfCookie();
      const xsrfToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("XSRF-TOKEN="));
      if (xsrfToken && config.headers) {
        config.headers["X-XSRF-TOKEN"] = decodeURIComponent(xsrfToken.split("=")[1]);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string; security_status?: string }>) => {
    const status = error.response?.status;

    // Stale or expired CSRF token (session rotated/logged out): invalidate the
    // cached token, refetch it, and retry the request once.
    if (status === 419 && typeof window !== "undefined") {
      csrfFetched = false;
      const cfg = error.config;
      if (cfg && !cfg._csrfRetried) {
        cfg._csrfRetried = true;
        try {
          return await api.request(cfg);
        } catch (retryError) {
          // Surface the retry's real outcome (e.g. 401 invalid credentials)
          // instead of the original 419, so callers show a useful message.
          return Promise.reject(retryError);
        }
      }
    }

    if (typeof window !== "undefined") {
      // Handle 403 banned/suspended — redirect to restricted page
      if (status === 403) {
        const securityStatus = error.response?.data?.security_status;
        if (securityStatus === "banned" || securityStatus === "suspended") {
          const currentPath = window.location.pathname;
          if (!currentPath.startsWith("/account-restricted")) {
            const isEmployerPath = currentPath.startsWith("/employer");
            setTimeout(() => {
              window.location.href = isEmployerPath
                ? "/account-restricted?status=banned"
                : "/account-restricted?status=suspended";
            }, 0);
          }
          return Promise.reject(error);
        }
      }

      if (status === 401 || status === 419) {
        clearAuthStore();
        delete api.defaults.headers.common["Authorization"];

        // Don't redirect when the failing request is a background auth-check
        // endpoint (called from public pages). The calling code handles 401
        // gracefully via .catch() or React Query error state.
        const failedUrl = error.config?.url || "";
        const silentEndpoints = ["/user", "/subscriptions/", "/candidate/cv/", "/candidate/saved-jobs", "/candidate/toggle-save/", "/candidate/applied-jobs"];
        const isSilent = silentEndpoints.some((ep) => failedUrl.startsWith(ep));

        if (!isSilent) {
          const currentPath = window.location.pathname;
          const authPaths = ["/login", "/register", "/employer/register"];
          if (!authPaths.some((p) => currentPath.startsWith(p))) {
            setTimeout(() => {
              window.location.href = "/login";
            }, 0);
          }
        }
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Extract a user-friendly error message from an API error response.
 * Usage: import api, { getApiErrorMessage } from "@/lib/api-client";
 *        catch (e) { toast.error(getApiErrorMessage(e, "Something went wrong")); }
 */
export function getApiErrorMessage(error: unknown, fallback = "An unexpected error occurred"): string {
  if (!error || typeof error !== "object") return fallback;
  const err = error as { response?: { data?: { message?: string; errors?: Record<string, string | string[]> } }; message?: string };
  const data = err.response?.data;
  if (data?.errors) {
    const firstKey = Object.keys(data.errors)[0];
    if (firstKey) {
      const val = data.errors[firstKey];
      return Array.isArray(val) ? val[0] : val;
    }
  }
  return data?.message || err.message || fallback;
}

export default api;
