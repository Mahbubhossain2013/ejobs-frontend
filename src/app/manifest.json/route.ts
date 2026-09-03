import { NextResponse } from "next/server";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");

export async function GET() {
  try {
    const res = await fetch(`${API_URL}/api/settings/manifest`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error("Failed to fetch manifest");
    const manifest = await res.json();
    return NextResponse.json(manifest, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch {
    return NextResponse.json({
      short_name: "JobPortal",
      name: "JobPortal - Job Board & Career Platform",
      description: "Find your dream job or hire the best talent.",
      icons: [
        { src: "/favicon-192.png", type: "image/png", sizes: "192x192", purpose: "any" },
        { src: "/favicon-512.png", type: "image/png", sizes: "512x512", purpose: "any maskable" },
        { src: "/favicon.svg", type: "image/svg+xml", sizes: "any", purpose: "any" },
      ],
      start_url: "/",
      scope: "/",
      background_color: "#ffffff",
      theme_color: "#2563eb",
      display: "standalone",
      orientation: "portrait",
      categories: ["jobs", "business", "education"],
      prefer_related_applications: false,
    });
  }
}
