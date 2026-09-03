"use client";

import api from "@/lib/api-client";
import { toast } from "sonner";

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/**
 * Recursively ensure all values are strings/arrays.
 * Prevents Blade htmlspecialchars() errors from receiving arrays.
 */
export function toSafeStrings(v: any): any {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (Array.isArray(v)) return v.map(toSafeStrings);
  if (typeof v === 'object') {
    const out: Record<string, any> = {};
    for (const [k, val] of Object.entries(v)) { out[k] = toSafeStrings(val); }
    return out;
  }
  return String(v);
}

export async function compressToWebp(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new window.Image();
      el.onload = () => resolve(el);
      el.onerror = reject;
      el.src = url;
    });
    const attempts = [
      { maxDim: 500, quality: 0.55 },
      { maxDim: 400, quality: 0.50 },
      { maxDim: 350, quality: 0.45 },
      { maxDim: 300, quality: 0.40 },
      { maxDim: 250, quality: 0.35 },
    ];
    for (const { maxDim, quality } of attempts) {
      const canvas = document.createElement("canvas");
      const scale = Math.min(maxDim / img.width, maxDim / img.height, 1);
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/webp", quality);
      const base64 = dataUrl.split(",")[1];
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blob = new Blob([bytes], { type: "image/webp" });
      if (blob.size <= MAX_PHOTO_BYTES) {
        return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = 200; canvas.height = 200;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, 200, 200);
    const dataUrl = canvas.toDataURL("image/webp", 0.35);
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const blob = new Blob([bytes], { type: "image/webp" });
    return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
  } catch { return file; }
  finally { URL.revokeObjectURL(url); }
}

export function uploadPhoto(file: File, isBn: boolean): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const formData = new FormData();
      formData.append("photo", file);
      const res = await api.post("/candidate/cv/profile/upload-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const photoUrl = res.data?.data?.photo_url || res.data?.photo_url;
      if (photoUrl) resolve(photoUrl);
      else reject(new Error("No photo URL returned"));
    } catch (err: any) {
      reject(err);
    }
  });
}