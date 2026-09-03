"use client";

import React, { useRef, useState, useEffect } from "react";
import type { CvTemplate } from "@/types";

interface TemplateThumbnailProps {
  template: CvTemplate;
  className?: string;
}

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://admin.ejobs.bd").replace(/\/api\/?$/, "");

export default function TemplateThumbnail({
  template,
  className = "",
}: TemplateThumbnailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.35);
  const [loaded, setLoaded] = useState(false);

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

  const demoUrl = `${API_BASE}/cv/demo/${template.slug}`;

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden bg-white dark:bg-slate-950 flex items-start justify-center ${className}`}
    >
      <iframe
        src={demoUrl}
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
