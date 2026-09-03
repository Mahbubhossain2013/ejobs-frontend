"use client";

import React, { useState } from "react";
import type { CvTemplate } from "@/types";

interface TemplateThumbnailProps {
  template: CvTemplate;
  className?: string;
}

interface TemplateVisualConfig {
  layout: "sidebar-left" | "top-banner" | "minimal-serif" | "dark-code" | "timeline";
  primaryColor: string;
  secondaryColor?: string;
  sidebarColor?: string;
  hasPhoto?: boolean;
  accentColor?: string;
  dark?: boolean;
}

const TEMPLATE_VISUAL_MAP: Record<string, TemplateVisualConfig> = {
  // 1. Sidebar Pro
  "sidebar-pro": { layout: "sidebar-left", primaryColor: "#0f172a", sidebarColor: "#1e293b", accentColor: "#f59e0b", hasPhoto: true },
  // 2. Academic
  "academic": { layout: "minimal-serif", primaryColor: "#111827", accentColor: "#4b5563", hasPhoto: false },
  // 3. Executive
  "executive": { layout: "top-banner", primaryColor: "#dc2626", secondaryColor: "#991b1b", accentColor: "#ef4444", hasPhoto: true },
  // 4. Corporate Clean
  "corporate-clean": { layout: "top-banner", primaryColor: "#1e40af", secondaryColor: "#1d4ed8", sidebarColor: "#eff6ff", accentColor: "#3b82f6", hasPhoto: true },
  // 5. Modern Two-Column
  "modern-twocol": { layout: "sidebar-left", primaryColor: "#0d9488", sidebarColor: "#0f766e", accentColor: "#14b8a6", hasPhoto: true },
  // 6. Creative Pro
  "creative-pro": { layout: "top-banner", primaryColor: "#e11d48", secondaryColor: "#be123c", accentColor: "#f43f5e", hasPhoto: true },
  // 7. Minimal Elegant
  "minimal-elegant": { layout: "sidebar-left", primaryColor: "#18181b", sidebarColor: "#f4f4f5", accentColor: "#71717a", hasPhoto: true },
  // 8. Bold Professional
  "bold-professional": { layout: "top-banner", primaryColor: "#ea580c", secondaryColor: "#c2410c", sidebarColor: "#fff7ed", accentColor: "#f97316", hasPhoto: true },
  // 9. Sleek Financial
  "sleek-financial": { layout: "top-banner", primaryColor: "#047857", secondaryColor: "#065f46", accentColor: "#10b981", hasPhoto: true },
  // 10. Developer / Tech
  "developer-resume": { layout: "dark-code", primaryColor: "#0d1117", sidebarColor: "#161b22", accentColor: "#39d353", dark: true, hasPhoto: true },
  "tech-developer": { layout: "dark-code", primaryColor: "#0d1117", sidebarColor: "#161b22", accentColor: "#39d353", dark: true, hasPhoto: true },
  // 11. Interior Design
  "interior-design": { layout: "sidebar-left", primaryColor: "#292524", sidebarColor: "#44403c", accentColor: "#d97706", hasPhoto: true },
  // 12. Sales Manager
  "sales-manager": { layout: "top-banner", primaryColor: "#1e3a8a", secondaryColor: "#172554", accentColor: "#fbbf24", hasPhoto: true },
  // 13. Analyst
  "analyst-resume": { layout: "sidebar-left", primaryColor: "#312e81", sidebarColor: "#3730a3", accentColor: "#6366f1", hasPhoto: true },
  // 14. Photographer
  "photographer-resume": { layout: "top-banner", primaryColor: "#18181b", secondaryColor: "#27272a", accentColor: "#a1a1aa", hasPhoto: true },
  // 15. Graphic Designer
  "graphic-designer": { layout: "top-banner", primaryColor: "#7c3aed", secondaryColor: "#6d28d9", accentColor: "#ec4899", hasPhoto: true },
  // 16. Manager Pastel
  "manager-pastel": { layout: "sidebar-left", primaryColor: "#0f766e", sidebarColor: "#ccfbf1", accentColor: "#14b8a6", hasPhoto: true },
  // 17. Business Analyst
  "business-analyst": { layout: "top-banner", primaryColor: "#0369a1", secondaryColor: "#075985", accentColor: "#38bdf8", hasPhoto: true },
  // 18. Business Administrator
  "business-administrator": { layout: "sidebar-left", primaryColor: "#1e40af", sidebarColor: "#dbeafe", accentColor: "#2563eb", hasPhoto: true },
  // 19. Social Media Specialist
  "social-media-specialist": { layout: "top-banner", primaryColor: "#c026d3", secondaryColor: "#9333ea", accentColor: "#f472b6", hasPhoto: true },
  // 20. UI/UX Developer
  "ui-ux-developer": { layout: "sidebar-left", primaryColor: "#0891b2", sidebarColor: "#164e63", accentColor: "#06b6d4", hasPhoto: true },
  // 21. Black Curved Modern
  "black-curved-modern": { layout: "top-banner", primaryColor: "#09090b", secondaryColor: "#18181b", accentColor: "#f59e0b", hasPhoto: true },
  // 22. Black Orange Duo
  "black-orange-duo": { layout: "sidebar-left", primaryColor: "#09090b", sidebarColor: "#18181b", accentColor: "#ea580c", hasPhoto: true },
  // 23. Navy Gold Executive
  "navy-gold-executive": { layout: "sidebar-left", primaryColor: "#0f172a", sidebarColor: "#1e293b", accentColor: "#f59e0b", hasPhoto: true },
  // 24. Three Band Horizon
  "three-band-horizontal": { layout: "top-banner", primaryColor: "#1e3a8a", secondaryColor: "#0284c7", accentColor: "#0ea5e9", hasPhoto: true },
  // 25. Curved Taupe Minimal
  "curved-taupe-minimal": { layout: "top-banner", primaryColor: "#57534e", secondaryColor: "#78716c", accentColor: "#a8a29e", hasPhoto: true },
  // 26. Dark Charcoal Ribbon
  "dark-charcoal-ribbon": { layout: "top-banner", primaryColor: "#27272a", secondaryColor: "#18181b", accentColor: "#e4e4e7", hasPhoto: true },
  // 27. Corporate Monochrome Pro
  "corporate-monochrome-pro": { layout: "minimal-serif", primaryColor: "#09090b", accentColor: "#71717a", hasPhoto: false },
  // 28. Arch Ribbon Grey
  "arch-ribbon-grey": { layout: "top-banner", primaryColor: "#334155", secondaryColor: "#1e293b", accentColor: "#94a3b8", hasPhoto: true },
  // 29. Cyan Ocean Wave
  "cyan-ocean-wave": { layout: "top-banner", primaryColor: "#0891b2", secondaryColor: "#0e7490", accentColor: "#22d3ee", hasPhoto: true },
  // 30. Red Slate Executive
  "red-slate-executive": { layout: "top-banner", primaryColor: "#991b1b", secondaryColor: "#7f1d1d", sidebarColor: "#f1f5f9", accentColor: "#dc2626", hasPhoto: true },
  // 31. Purple Gradient
  "purple-gradient": { layout: "top-banner", primaryColor: "#6d28d9", secondaryColor: "#9333ea", accentColor: "#a855f7", hasPhoto: true },
  // 32. Teal Sidebar
  "teal-sidebar": { layout: "sidebar-left", primaryColor: "#0d9488", sidebarColor: "#115e59", accentColor: "#2dd4bf", hasPhoto: true },
  // 33. Orange Impact
  "orange-impact": { layout: "top-banner", primaryColor: "#c2410c", secondaryColor: "#ea580c", accentColor: "#f97316", hasPhoto: true },
  // 34. Minimal White
  "minimal-white": { layout: "minimal-serif", primaryColor: "#18181b", accentColor: "#a1a1aa", hasPhoto: true },
  // 35. Classic Serif
  "classic-serif": { layout: "minimal-serif", primaryColor: "#09090b", accentColor: "#52525b", hasPhoto: false },
  // 36. Timeline Modern
  "timeline-modern": { layout: "timeline", primaryColor: "#0284c7", secondaryColor: "#0369a1", accentColor: "#38bdf8", hasPhoto: true },
};

export default function TemplateThumbnail({
  template,
  className = "",
}: TemplateThumbnailProps) {
  const [imgError, setImgError] = useState(false);
  const imgUrl = `https://admin.ejobs.bd/templates/${template.slug}.png`;

  if (!imgError) {
    return (
      <div className={`relative w-full h-full select-none overflow-hidden bg-white dark:bg-slate-900 flex items-start justify-center ${className}`}>
        <img
          src={imgUrl}
          alt={template.name || "CV Template"}
          className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  const cfg: TemplateVisualConfig = TEMPLATE_VISUAL_MAP[template.slug] || {
    layout: "sidebar-left",
    primaryColor: "#1e293b",
    sidebarColor: "#334155",
    accentColor: "#3b82f6",
    hasPhoto: true,
  };

  return (
    <div
      className={`relative w-full h-full select-none overflow-hidden font-sans ${className}`}
      style={{ backgroundColor: cfg.dark ? cfg.primaryColor : "#ffffff" }}
    >
      {/* ── LAYOUT: LEFT SIDEBAR ── */}
      {cfg.layout === "sidebar-left" && (
        <div className="flex h-full w-full">
          {/* Sidebar */}
          <div
            className="w-[36%] h-full p-2.5 flex flex-col justify-between shrink-0"
            style={{ backgroundColor: cfg.sidebarColor || cfg.primaryColor }}
          >
            <div>
              {cfg.hasPhoto && (
                <div className="flex justify-center mb-2">
                  <div
                    className="w-9 h-9 rounded-full border-2 flex items-center justify-center overflow-hidden bg-white/20 shadow"
                    style={{ borderColor: cfg.accentColor || "#ffffff" }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/80 fill-current">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                    </svg>
                  </div>
                </div>
              )}
              <div className="space-y-1 text-center mb-2.5">
                <div className="h-2 w-3/4 mx-auto bg-white/90 rounded-sm" />
                <div
                  className="h-1.5 w-1/2 mx-auto rounded-sm opacity-80"
                  style={{ backgroundColor: cfg.accentColor || "#ffffff" }}
                />
              </div>
              <div className="space-y-1 mb-2">
                <div
                  className="h-1.5 w-7 rounded-sm mb-1"
                  style={{ backgroundColor: cfg.accentColor || "#ffffff" }}
                />
                <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-white/60" /><div className="h-1 w-full bg-white/40 rounded" /></div>
                <div className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-white/60" /><div className="h-1 w-4/5 bg-white/40 rounded" /></div>
              </div>
              <div className="space-y-1.5">
                <div
                  className="h-1.5 w-7 rounded-sm mb-1"
                  style={{ backgroundColor: cfg.accentColor || "#ffffff" }}
                />
                {[85, 95, 70].map((pct, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.accentColor || "#ffffff" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="pt-1.5 border-t border-white/20 flex gap-1">
              <div className="h-1 w-1/2 bg-white/30 rounded" />
            </div>
          </div>

          {/* Right Body */}
          <div className="flex-1 p-3 flex flex-col justify-between overflow-hidden bg-white">
            <div>
              <div className="border-b pb-1.5 mb-2">
                <div className="h-2.5 w-1/2 bg-slate-800 rounded-sm mb-1" />
                <div className="h-1.5 w-1/3 rounded-sm" style={{ backgroundColor: cfg.primaryColor }} />
              </div>
              <div className="space-y-1.5 mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-2 rounded-full" style={{ backgroundColor: cfg.primaryColor }} />
                  <div className="h-1.5 w-12 bg-slate-700 rounded-sm" />
                </div>
                <div className="pl-1.5 border-l border-slate-200 space-y-0.5">
                  <div className="flex justify-between items-center">
                    <div className="h-1.5 w-16 bg-slate-800 rounded-sm" />
                    <div className="h-1 w-6 rounded" style={{ backgroundColor: cfg.accentColor || cfg.primaryColor }} />
                  </div>
                  <div className="h-1 w-10 bg-slate-400 rounded-sm" />
                  <div className="h-1 w-full bg-slate-200 rounded" />
                  <div className="h-1 w-4/5 bg-slate-200 rounded" />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-2 rounded-full" style={{ backgroundColor: cfg.primaryColor }} />
                  <div className="h-1.5 w-10 bg-slate-700 rounded-sm" />
                </div>
                <div className="pl-1.5 border-l border-slate-200 space-y-0.5">
                  <div className="h-1.5 w-20 bg-slate-800 rounded-sm" />
                  <div className="h-1 w-12 bg-slate-400 rounded-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-1 pt-1 border-t border-slate-100">
              <div className="h-1.5 px-1.5 rounded-full flex items-center" style={{ backgroundColor: `${cfg.accentColor || cfg.primaryColor}20` }}>
                <div className="h-0.5 w-5 rounded-full" style={{ backgroundColor: cfg.accentColor || cfg.primaryColor }} />
              </div>
              <div className="h-1.5 px-1.5 rounded-full flex items-center" style={{ backgroundColor: `${cfg.accentColor || cfg.primaryColor}20` }}>
                <div className="h-0.5 w-6 rounded-full" style={{ backgroundColor: cfg.accentColor || cfg.primaryColor }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── LAYOUT: TOP BANNER ── */}
      {cfg.layout === "top-banner" && (
        <div className="flex flex-col h-full w-full bg-white">
          <div
            className="w-full p-2.5 flex items-center gap-2.5 shrink-0 shadow-sm"
            style={{
              background: cfg.secondaryColor
                ? `linear-gradient(135deg, ${cfg.primaryColor}, ${cfg.secondaryColor})`
                : cfg.primaryColor,
            }}
          >
            {cfg.hasPhoto && (
              <div
                className="w-9 h-9 rounded-full border-2 flex items-center justify-center overflow-hidden bg-white/20 shrink-0 shadow"
                style={{ borderColor: cfg.accentColor || "#ffffff" }}
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-white/80 fill-current">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
            <div className="flex-1 space-y-1">
              <div className="h-2.5 w-3/5 bg-white rounded-sm font-bold shadow-sm" />
              <div className="h-1.5 w-2/5 rounded-sm opacity-90" style={{ backgroundColor: cfg.accentColor || "#ffffff" }} />
            </div>
          </div>
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div className="p-1 rounded-sm border-l-2 mb-1.5 bg-slate-50 space-y-0.5" style={{ borderColor: cfg.primaryColor }}>
              <div className="h-1 w-full bg-slate-300 rounded" />
              <div className="h-1 w-4/5 bg-slate-300 rounded" />
            </div>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div className="space-y-1">
                <div className="h-1.5 w-10 rounded-sm font-bold" style={{ backgroundColor: cfg.primaryColor }} />
                <div className="h-1.5 w-14 bg-slate-800 rounded-sm" />
                <div className="h-1 w-full bg-slate-200 rounded" />
                <div className="h-1 w-3/4 bg-slate-200 rounded" />
              </div>
              <div className="space-y-1.5 border-l border-slate-100 pl-1.5">
                <div className="h-1.5 w-8 rounded-sm font-bold" style={{ backgroundColor: cfg.primaryColor }} />
                <div className="h-1.5 w-12 bg-slate-800 rounded-sm" />
                <div className="flex flex-wrap gap-1 pt-1">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-1.5 px-1 rounded-sm" style={{ backgroundColor: `${cfg.primaryColor}20` }}>
                      <div className="h-0.5 w-4 rounded-full" style={{ backgroundColor: cfg.primaryColor }} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="h-0.5 w-full mt-1.5 rounded-full" style={{ backgroundColor: cfg.primaryColor }} />
          </div>
        </div>
      )}

      {/* ── LAYOUT: MINIMAL SERIF ── */}
      {cfg.layout === "minimal-serif" && (
        <div className="flex flex-col h-full w-full bg-white p-3 justify-between">
          <div>
            <div className="text-center pb-2 border-b border-slate-300 mb-2">
              <div className="h-2.5 w-2/3 mx-auto bg-slate-900 rounded-sm font-serif mb-1" />
              <div className="h-1 w-1/3 mx-auto bg-slate-500 rounded-sm mb-1" />
              <div className="flex justify-center gap-1">
                <div className="h-0.5 w-6 bg-slate-300 rounded" />
                <div className="h-0.5 w-6 bg-slate-300 rounded" />
                <div className="h-0.5 w-6 bg-slate-300 rounded" />
              </div>
            </div>
            <div className="space-y-1 mb-2">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-12 bg-slate-900 font-bold rounded-sm" />
                <div className="h-px flex-1 bg-slate-300" />
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between">
                  <div className="h-1.5 w-16 bg-slate-800 rounded-sm" />
                  <div className="h-1 w-6 bg-slate-400 rounded" />
                </div>
                <div className="h-1 w-full bg-slate-200 rounded" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-10 bg-slate-900 font-bold rounded-sm" />
                <div className="h-px flex-1 bg-slate-300" />
              </div>
              <div className="h-1.5 w-16 bg-slate-800 rounded-sm" />
            </div>
          </div>
          <div className="pt-1 border-t border-slate-200 grid grid-cols-3 gap-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-1">
                <div className="w-0.5 h-0.5 rounded-full bg-slate-400" />
                <div className="h-0.5 w-full bg-slate-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── LAYOUT: DARK CODE ── */}
      {cfg.layout === "dark-code" && (
        <div className="flex h-full w-full bg-[#0d1117] text-white">
          <div className="w-[36%] h-full p-2 bg-[#161b22] border-r border-[#30363d] flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-center">
                <div className="w-9 h-9 rounded-full border-2 flex items-center justify-center overflow-hidden bg-[#21262d]" style={{ borderColor: cfg.accentColor }}>
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" style={{ color: cfg.accentColor }}>
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
                  </svg>
                </div>
              </div>
              <div className="space-y-0.5 text-center">
                <div className="h-2 w-3/4 mx-auto bg-white rounded-sm font-mono" />
                <div className="h-1 w-1/2 mx-auto rounded-sm font-mono" style={{ backgroundColor: cfg.accentColor }} />
              </div>
              <div className="space-y-1">
                <div className="text-[6px] font-mono" style={{ color: cfg.accentColor }}>&lt;skills /&gt;</div>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-1.5 bg-[#21262d] border border-[#30363d] rounded px-1 flex items-center">
                    <div className="h-0.5 w-full rounded" style={{ backgroundColor: cfg.accentColor }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[6px] font-mono text-emerald-400/60 text-center">// git:main</div>
          </div>
          <div className="flex-1 p-2.5 flex flex-col justify-between bg-[#0d1117]">
            <div className="space-y-2">
              <div className="border-b border-[#30363d] pb-1">
                <div className="h-2 w-1/2 bg-white rounded-sm mb-1" />
                <div className="h-1 w-1/3 rounded-sm" style={{ backgroundColor: cfg.accentColor }} />
              </div>
              <div className="p-1.5 bg-[#161b22] rounded border border-[#30363d] space-y-0.5">
                <div className="flex justify-between">
                  <div className="h-1.5 w-14 bg-white rounded-sm" />
                  <div className="h-1 w-4 rounded text-[5px]" style={{ backgroundColor: `${cfg.accentColor}30`, color: cfg.accentColor }}>git</div>
                </div>
                <div className="h-1 w-full bg-[#30363d] rounded" />
              </div>
            </div>
            <div className="h-1 w-full bg-[#21262d] rounded flex items-center">
              <div className="h-full rounded" style={{ width: "65%", backgroundColor: cfg.accentColor }} />
            </div>
          </div>
        </div>
      )}

      {/* ── LAYOUT: TIMELINE ── */}
      {cfg.layout === "timeline" && (
        <div className="flex flex-col h-full w-full bg-white">
          <div className="w-full p-2 flex items-center gap-2 text-white shrink-0" style={{ background: `linear-gradient(135deg, ${cfg.primaryColor}, ${cfg.secondaryColor || cfg.primaryColor})` }}>
            <div className="w-7 h-7 rounded-full border-2 border-white/80 bg-white/20 shrink-0" />
            <div className="space-y-0.5 flex-1">
              <div className="h-2 w-1/2 bg-white rounded-sm" />
              <div className="h-1 w-1/3 bg-white/70 rounded-sm" />
            </div>
          </div>
          <div className="p-2.5 flex-1 flex flex-col justify-between">
            <div className="space-y-1.5">
              <div className="pl-2 border-l-2 border-cyan-500 space-y-0.5">
                <div className="h-1.5 w-14 bg-slate-800 rounded-sm" />
                <div className="h-1 w-full bg-slate-200 rounded" />
              </div>
              <div className="pl-2 border-l-2 border-cyan-500 space-y-0.5">
                <div className="h-1.5 w-12 bg-slate-800 rounded-sm" />
                <div className="h-1 w-3/4 bg-slate-200 rounded" />
              </div>
            </div>
            <div className="flex gap-1 pt-1 border-t border-slate-100">
              <div className="h-1.5 w-8 bg-cyan-100 rounded" />
              <div className="h-1.5 w-6 bg-cyan-100 rounded" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
