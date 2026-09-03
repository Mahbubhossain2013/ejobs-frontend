"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useThemeStore } from "@/store/theme-store";
import { resumeService } from "@/services/resume.service";
import { toast } from "sonner";
import type { CvTemplate, CvProfile } from "@/types";
import { profileDataToEditorData, sanitizeForBlade } from "@/lib/cv-builder-utils";
import { getStorageUrl } from "@/lib/utils";

interface UseResumeEditorOptions {
  slug: string;
  onNotFound?: () => void;
}

function storageKey(slug: string) {
  return `resume_draft_${slug}`;
}

function loadDraft(slug: string): Record<string, any> | null {
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" && Object.keys(parsed).length > 0 ? parsed : null;
  } catch {
    return null;
  }
}

function saveDraft(slug: string, data: Record<string, any>) {
  try { localStorage.setItem(storageKey(slug), JSON.stringify(data)); } catch {}
}

function clearDraft(slug: string) {
  try { localStorage.removeItem(storageKey(slug)); } catch {}
}

/**
 * Build a simple client-side HTML preview by merging user data into
 * the demo template HTML. Used as fallback when backend POST preview
 * fails or returns demo data.
 */
function buildClientPreview(demoHtml: string, data: Record<string, any>): string {
  const p = data.personal || {};
  const get = (val: any): string => {
    if (val === null || val === undefined) return "";
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    if (Array.isArray(val)) return val.map(v => typeof v === "string" ? v : (v?.name || "")).join(", ");
    if (typeof val === "object") return val.name || val.title || val.description || "";
    return String(val);
  };

  const sectionContent: Record<string, string> = {};

  // Personal
  sectionContent["personal-name"] = get(p.full_name);
  sectionContent["personal-title"] = get(p.title);
  sectionContent["personal-email"] = get(p.email);
  sectionContent["personal-phone"] = get(p.phone);
  sectionContent["personal-location"] = get(p.location);
  sectionContent["personal-address"] = get(p.address);
  sectionContent["personal-summary"] = get(p.summary);
  sectionContent["personal-website"] = get(p.website);
  sectionContent["personal-linkedin"] = get(p.linkedin);

  // Experience
  const exps = (data.experience || []) as any[];
  sectionContent["experience"] = exps.map(e =>
    `<div style="margin-bottom:12px"><strong>${get(e.position || e.job_title)}</strong><br/>${get(e.company || e.company_name)}${e.location ? " · " + get(e.location) : ""}<br/><em>${get(e.start_date)} – ${get(e.end_date) || (e.is_current ? "Present" : "")}</em>${e.description ? "<br/>" + get(e.description) : ""}</div>`
  ).join("");

  // Education
  const edus = (data.education || []) as any[];
  sectionContent["education"] = edus.map(e =>
    `<div style="margin-bottom:12px"><strong>${get(e.degree)}</strong><br/>${get(e.institution || e.school_name)}${e.location ? " · " + get(e.location) : ""}<br/><em>${get(e.year || e.start_date || e.passing_year)}${e.end_date ? " – " + get(e.end_date) : ""}</em>${e.gpa_or_cgpa ? "<br/>GPA: " + get(e.gpa_or_cgpa) : ""}${e.grade ? " | Grade: " + get(e.grade) : ""}</div>`
  ).join("");

  // Skills
  const skills = (data.skills || []) as any[];
  sectionContent["skills"] = skills.map(s =>
    typeof s === "string" ? s : get(s.name) + (s.level ? " (" + get(s.level) + ")" : "")
  ).join(", ");

  // Languages
  const langs = (data.languages || []) as any[];
  sectionContent["languages"] = langs.map(l => `${get(l.name)}: ${get(l.proficiency)}`).join(", ");

  // Certifications
  const certs = (data.certifications || []) as any[];
  sectionContent["certifications"] = certs.map(c =>
    `<div style="margin-bottom:8px"><strong>${get(c.name)}</strong>${c.issuer ? " — " + get(c.issuer) : ""}${c.date ? " (" + get(c.date) + ")" : ""}</div>`
  ).join("");

  // Projects
  const projs = (data.projects || []) as any[];
  sectionContent["projects"] = projs.map(j =>
    `<div style="margin-bottom:12px"><strong>${get(j.name || j.project_name)}</strong>${j.technologies ? "<br/><em>" + get(j.technologies) + "</em>" : ""}${j.description ? "<br/>" + get(j.description) : ""}${j.url ? '<br/><a href="' + get(j.url) + '">' + get(j.url) + "</a>" : ""}</div>`
  ).join("");

  // Awards
  const awards = (data.awards || []) as any[];
  sectionContent["awards"] = awards.map(a =>
    `<div style="margin-bottom:8px"><strong>${get(a.title)}</strong>${a.issuer ? " — " + get(a.issuer) : ""}${a.date ? " (" + get(a.date) + ")" : ""}</div>`
  ).join("");

  // Hobbies
  const hobbies = (data.hobbies || []) as any[];
  sectionContent["hobbies"] = hobbies.map(h => typeof h === "string" ? h : get(h.name || h)).join(", ");

  // Social
  const social = data.social_links || {};
  const socialLinks = Object.entries(social)
    .filter(([, v]) => v && typeof v === "string" && v.length > 0)
    .map(([k, v]) => `${k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}: ${v}`)
    .join(" | ");
  sectionContent["social"] = socialLinks;

  // Training
  const trainings = (data.training || []) as any[];
  sectionContent["training"] = trainings.map(t =>
    `<div style="margin-bottom:8px"><strong>${get(t.title)}</strong>${t.institute ? " — " + get(t.institute) : ""}${t.duration ? " (" + get(t.duration) + ")" : ""}</div>`
  ).join("");

  // References
  const refs = (data.references || []) as any[];
  sectionContent["references"] = refs.map(r =>
    `<div style="margin-bottom:8px"><strong>${get(r.name)}</strong>${r.designation ? " — " + get(r.designation) : ""}${r.organization ? "<br/>" + get(r.organization) : ""}</div>`
  ).join("");

  // Try to replace content in HTML by matching common patterns
  let html = demoHtml;

  // Replace name patterns
  html = html.replace(/<h1[^>]*class="[^"]*name[^"]*"[^>]*>.*?<\/h1>/i, `<h1 class="name" style="font-size:22px;font-weight:700;margin:0 0 4px 0">${get(p.full_name)}</h1>`);
  html = html.replace(/<p[^>]*class="[^"]*title[^"]*"[^>]*>.*?<\/p>/i, `<p class="title" style="font-size:14px;color:#666;margin:0 0 12px 0">${get(p.title)}</p>`);

  // Replace contact items
  if (get(p.email)) html = html.replace(/<div[^>]*class="[^"]*contact-item[^"]*"[^>]*>.*?✉.*?<\/div>/i, `<div class="contact-item"><span class="icon">✉</span><span>${get(p.email)}</span></div>`);
  if (get(p.phone)) html = html.replace(/<div[^>]*class="[^"]*contact-item[^"]*"[^>]*>.*?☎.*?<\/div>/i, `<div class="contact-item"><span class="icon">☎</span><span>${get(p.phone)}</span></div>`);
  if (get(p.location)) html = html.replace(/<div[^>]*class="[^"]*contact-item[^"]*"[^>]*>.*?📍.*?<\/div>/i, `<div class="contact-item"><span class="icon">📍</span><span>${get(p.location)}</span></div>`);
  if (get(p.address)) html = html.replace(/<div[^>]*class="[^"]*contact-item[^"]*"[^>]*>.*?🏠.*?<\/div>/i, `<div class="contact-item"><span class="icon">🏠</span><span>${get(p.address)}</span></div>`);

  // Replace summary
  if (get(p.summary)) {
    const summaryMatch = html.match(/<p[^>]*class="[^"]*summary[^"]*"[^>]*>.*?<\/p>/i);
    if (summaryMatch) {
      html = html.replace(summaryMatch[0], `<p class="summary">${get(p.summary)}</p>`);
    }
  }

  // Find sections by heading text and replace content
  const sectionMappings: Record<string, string[]> = {
    "experience": ["Work Experience", "Professional Experience", "Work History"],
    "education": ["Education", "Educational Background"],
    "skills": ["Skills", "Key Skills", "Professional Skills"],
    "languages": ["Languages", "Language Skills"],
    "certifications": ["Certifications", "Certifications & Licenses"],
    "projects": ["Projects", "Key Projects", "Portfolio Projects"],
    "awards": ["Awards", "Awards & Honors", "Awards & Recognition"],
    "hobbies": ["Hobbies", "Hobbies & Interests", "Interests"],
    "social": ["Social Links", "Social Profiles", "Links"],
    "training": ["Training", "Training Summary", "Professional Training"],
    "references": ["References", "Professional References"],
  };

  for (const [key, headings] of Object.entries(sectionMappings)) {
    const content = sectionContent[key];
    if (!content) continue;

    for (const heading of headings) {
      // Find section content between this heading's closing </h2> and the next <h2> or end
      const headingPattern = new RegExp(
        `(<h2[^>]*>\\s*${heading}\\s*</h2>[\\s\\S]*?)(?=<div class="section">|<h2|<\\/div>\\s*<\\/div>\\s*$)`,
        "i"
      );
      const match = html.match(headingPattern);
      if (match) {
        const before = match[0];
        const afterIdx = html.indexOf(match[0]) + match[0].length;
        html = html.substring(0, html.indexOf(match[0])) +
          `<h2>${heading}</h2>` +
          `<div style="font-size:12px;line-height:1.5;color:#333">${content}</div>` +
          html.substring(afterIdx);
        break;
      }
    }
  }

  // Profile photo
  if (get(p.photo_url)) {
    const photoUrl = getStorageUrl(p.photo_url);
    const photoMatch = html.match(/<div class="photo-section">[\s\S]*?<\/div>/i);
    if (photoMatch) {
      html = html.replace(photoMatch[0], `<div class="photo-section"><img src="${photoUrl}" alt="${get(p.full_name)}" /></div>`);
    } else if (!html.includes("photo-section")) {
      html = html.replace(/(<div class="personal-info">)/i, `<div class="photo-section"><img src="${photoUrl}" alt="${get(p.full_name)}" /></div>$1`);
    }
  }

  return html;
}

const EMPTY_PROJECT = { name: "", description: "", url: "" };

export function useResumeEditor({ slug, onNotFound }: UseResumeEditorOptions) {
  const router = useRouter();
  const { language } = useThemeStore();
  const isBn = language === "bn";

  const [template, setTemplate] = useState<CvTemplate | null>(null);
  const [editorData, setEditorData] = useState<Record<string, any>>({});
  const [activeSection, setActiveSection] = useState("personal");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [demoHtml, setDemoHtml] = useState("");

  const previewDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataReadyRef = useRef(false);

  /* ── 1. Load template + editorData ── */
  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        const templates = await resumeService.getTemplates().catch(() => [] as CvTemplate[]);
        const tmpl = templates.find((t) => t.slug === slug);
        if (!tmpl) { onNotFound?.() ?? router.push("/resume-builder"); return; }
        setTemplate(tmpl);

        const stored = loadDraft(slug);
        if (stored) {
          dataReadyRef.current = true;
          setEditorData(stored);
        } else {
          const profile = await resumeService.getProfile().catch(() => null as CvProfile | null);
          if (profile) {
            const data = profileDataToEditorData(profile);
            if (!data.projects || (Array.isArray(data.projects) && data.projects.length === 0)) {
              data.projects = [{ ...EMPTY_PROJECT }];
            }
            dataReadyRef.current = true;
            setEditorData(data);
          }
        }
      } catch {
        onNotFound?.() ?? router.push("/resume-builder");
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  /* ── 2. Load demo HTML (static template) ── */
  useEffect(() => {
    if (!template) return;
    (async () => {
      try {
        const html = await resumeService.getPreviewDemo(template.slug);
        if (html && html.length > 50) setDemoHtml(html);
      } catch {}
    })();
  }, [template]);

  /* ── 3. Render initial preview using demo HTML + client data ── */
  useEffect(() => {
    if (!demoHtml) return;
    if (dataReadyRef.current && Object.keys(editorData).length > 0) {
      const preview = buildClientPreview(demoHtml, editorData);
      setPreviewHtml(preview);
      setPreviewLoading(false);
    }
  }, [demoHtml, editorData]);

  /* ── 4. Persist every change to localStorage ── */
  useEffect(() => {
    if (!slug || !dataReadyRef.current || Object.keys(editorData).length === 0) return;
    saveDraft(slug, editorData);
  }, [editorData, slug]);

  /* ── 5. Debounced live preview via backend POST ── */
  useEffect(() => {
    if (!template || !dataReadyRef.current || Object.keys(editorData).length === 0) return;

    if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current);
    previewDebounceRef.current = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const safe = sanitizeForBlade(editorData);
        const html = await resumeService.getLivePreviewWithData(template.slug, safe);
        if (html && html.length > 50 && !html.includes("Template not found")) {
          setPreviewHtml(html);
          setPreviewLoading(false);
          return;
        }
      } catch {
        // Fallback to client-side
      }

      // Fallback: client-side preview from demo HTML
      if (demoHtml) {
        const fallback = buildClientPreview(demoHtml, editorData);
        setPreviewHtml(fallback);
      }
      setPreviewLoading(false);
    }, 800);

    return () => { if (previewDebounceRef.current) clearTimeout(previewDebounceRef.current); };
  }, [editorData, template, demoHtml]);

  /* ── Actions ── */

  const handleDataChange = useCallback((section: string, sectionData: any) => {
    setEditorData((prev) => ({ ...prev, [section]: sectionData }));
  }, []);

  const refreshPreview = useCallback(async () => {
    if (!template) return;
    setPreviewLoading(true);

    // Try backend POST first
    try {
      const safe = sanitizeForBlade(editorData);
      const html = await resumeService.getLivePreviewWithData(template.slug, safe);
      if (html && html.length > 50 && !html.includes("Template not found")) {
        setPreviewHtml(html);
        setPreviewLoading(false);
        return;
      }
    } catch {
      // fallback to client-side preview
    }

    // Fallback: client-side
    if (demoHtml) {
      setPreviewHtml(buildClientPreview(demoHtml, editorData));
    }
    setPreviewLoading(false);
  }, [template, editorData, demoHtml]);

  const saveAndCreate = useCallback(async () => {
    if (!template) return false;
    setSaving(true);
    try {
      await resumeService.updateProfile({
        personal_info: editorData.personal || {},
        experiences: editorData.experience || [],
        educations: editorData.education || [],
        skills: editorData.skills || [],
        certifications: editorData.certifications || [],
        languages: editorData.languages || [],
        projects: editorData.projects || [],
        awards: editorData.awards || [],
        hobbies: editorData.hobbies || [],
        social_links: editorData.social_links || {},
        references: editorData.references || [],
        training: editorData.training || [],
      } as any);

      const resume = await resumeService.createResume({
        title: template.name + " " + (isBn ? "সিভি" : "CV"),
        template_slug: template.slug,
      });

      const uuid = (resume as any)?.uuid || (resume as any)?.data?.uuid;
      clearDraft(slug);
      toast.success(isBn ? "সিভি তৈরি হয়েছে!" : "Resume created!");
      if (uuid) router.push(`/cv/preview/${uuid}`);
      else router.push("/resume-builder");
      return true;
    } catch (e: any) {
      toast.error(e.response?.data?.message || (isBn ? "ব্যর্থ" : "Failed"));
      return false;
    } finally {
      setSaving(false);
    }
  }, [template, editorData, isBn, router, slug]);

  return {
    template, editorData, activeSection, setActiveSection,
    previewHtml, previewLoading, loading, saving,
    handleDataChange, refreshPreview, saveAndCreate,
  };
}