"use client";

import React, { useRef, useState, useEffect } from "react";
import type { CvTemplate } from "@/types";

interface TemplateThumbnailProps {
  template: CvTemplate;
  className?: string;
  demoHtml?: string;
}

// Global in-memory cache shared across all cards and mounts
const demoCache = new Map<string, string>();
const pendingFetches = new Map<string, Promise<string | null>>();

function fetchTemplateHtml(slug: string): Promise<string | null> {
  if (demoCache.has(slug)) {
    return Promise.resolve(demoCache.get(slug)!);
  }
  if (pendingFetches.has(slug)) {
    return pendingFetches.get(slug)!;
  }

  const p = fetch(`/cv/demo/${encodeURIComponent(slug)}`)
    .then((res) => (res.ok ? res.text() : null))
    .then((html) => {
      if (html) demoCache.set(slug, html);
      pendingFetches.delete(slug);
      return html;
    })
    .catch(() => {
      pendingFetches.delete(slug);
      return null;
    });

  pendingFetches.set(slug, p);
  return p;
}

export default function TemplateThumbnail({
  template,
  className = "",
  demoHtml,
}: TemplateThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);

  const initialHtml = demoHtml || (template?.slug ? demoCache.get(template.slug) : null) || null;
  const [htmlContent, setHtmlContent] = useState<string | null>(initialHtml);
  const [loaded, setLoaded] = useState<boolean>(Boolean(initialHtml));
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (demoHtml) {
      if (template?.slug) demoCache.set(template.slug, demoHtml);
      setHtmlContent(demoHtml);
      setLoaded(true);
    }
  }, [demoHtml, template?.slug]);

  useEffect(() => {
    const updateSize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      if (width > 0) {
        setScale(width / 794);
      }
    };

    updateSize();
    const ro = new ResizeObserver(updateSize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // IntersectionObserver: Only load and render when entering or near viewport (300px margin)
  useEffect(() => {
    if (isVisible) return;
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry && entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible]);

  // Fetch HTML directly only when visible and not yet cached
  useEffect(() => {
    if (!isVisible || htmlContent || !template?.slug) return;
    let cancelled = false;

    fetchTemplateHtml(template.slug).then((html) => {
      if (!cancelled && html) {
        setHtmlContent(html);
        setLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isVisible, htmlContent, template?.slug]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden bg-white dark:bg-slate-950 flex items-start justify-center ${className}`}
    >
      {(isVisible || htmlContent) && htmlContent && (
        <iframe
          srcDoc={htmlContent}
          title={template.name || "CV Template"}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          style={{
            width: "794px",
            height: "1123px",
            border: "none",
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            pointerEvents: "none",
            position: "absolute",
            top: 0,
            left: 0,
            opacity: loaded ? 1 : 0,
            transition: "opacity 0.25s ease-in",
            backgroundColor: "#ffffff",
          }}
        />
      )}
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 animate-pulse">
          <div className="text-xs text-muted-foreground font-medium">লোড হচ্ছে...</div>
        </div>
      )}
    </div>
  );
}
