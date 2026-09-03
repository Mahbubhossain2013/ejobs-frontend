import type { Resume, CvProfile } from "@/types";
import { RESUME_STORAGE_KEY } from "@/constants/cv-builder";

export function getStoredResumes(): Resume[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RESUME_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

export function storeResumes(resumes: Resume[]) {
  try { localStorage.setItem(RESUME_STORAGE_KEY, JSON.stringify(resumes)); } catch {}
}

export function profileDataToEditorData(p: CvProfile): Record<string, any> {
  return {
    personal: p.personal_info || {},
    experience: p.experiences || p.experience || [],
    education: p.educations || p.education || [],
    skills: p.skills || [],
    certifications: p.certifications || [],
    languages: p.languages || [],
    projects: p.projects || [],
    awards: (p as any).awards || [],
    hobbies: (p as any).hobbies || [],
    social_links: p.social_links || {},
    references: (p as any).references || [],
    training: (p as any).training || [],
  };
}

export function editorDataToProfile(ed: Record<string, any>): CvProfile {
  return {
    personal_info: ed.personal || {},
    experiences: ed.experience || [],
    educations: ed.education || [],
    skills: ed.skills || [],
    certifications: ed.certifications || [],
    languages: ed.languages || [],
    projects: ed.projects || [],
    awards: ed.awards || [],
    hobbies: ed.hobbies || [],
    social_links: ed.social_links || {},
    references: ed.references || [],
    training: ed.training || [],
  } as CvProfile;
}

/** Ensure all values are strings/arrays-of-strings for Blade templates. */
export function sanitizeForBlade(data: Record<string, any>): Record<string, any> {
  const safe = (v: any): any => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number') return String(v);
    if (typeof v === 'boolean') return v ? 'true' : 'false';
    if (Array.isArray(v)) return v.map(safe);
    if (typeof v === 'object') {
      const out: Record<string, any> = {};
      for (const [k, val] of Object.entries(v)) { out[k] = safe(val); }
      return out;
    }
    return String(v);
  };
  const result: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) { result[key] = safe(val); }
  return result;
}
