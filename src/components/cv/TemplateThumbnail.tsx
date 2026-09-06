"use client";

import React, { useRef, useState, useEffect } from "react";
import type { CvTemplate } from "@/types";

interface TemplateThumbnailProps {
  template: CvTemplate;
  className?: string;
  demoHtml?: string;
}

export default function TemplateThumbnail({
  template,
  className = "",
  demoHtml,
}: TemplateThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const [loaded, setLoaded] = useState(false);
  const [htmlContent, setHtmlContent] = useState<string | null>(demoHtml || null);

  useEffect(() => {
    if (demoHtml) {
      setHtmlContent(demoHtml);
      setLoaded(true);
    }
  }, [demoHtml]);

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

  // Fetch HTML directly if not supplied via props
  useEffect(() => {
    if (htmlContent || !template?.slug) return;
    let cancelled = false;

    fetch(`/cv/demo/${template.slug}`)
      .then((res) => (res.ok ? res.text() : null))
      .then((html) => {
        if (!cancelled && html) {
          setHtmlContent(html);
          setLoaded(true);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [template?.slug, htmlContent]);

  const demoUrl = `/cv/demo/${template.slug}`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden bg-white dark:bg-slate-950 flex items-start justify-center ${className}`}
    >
      <iframe
        srcDoc={htmlContent || undefined}
        src={!htmlContent ? demoUrl : undefined}
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
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 animate-pulse">
          <div className="text-xs text-muted-foreground font-medium">লোড হচ্ছে...</div>
        </div>
      )}
    </div>
  );
}
