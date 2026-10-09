import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const backendUrl = apiUrl.replace(/\/api\/?$/, "");

// In-memory server cache for fast delivery of static demo templates
const demoHtmlCache = new Map<string, string>();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (demoHtmlCache.has(slug)) {
    return new NextResponse(demoHtmlCache.get(slug)!, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "frame-ancestors 'self' https://ejobs.bd",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  }

  try {
    const res = await fetch(`${backendUrl}/cv/demo/${encodeURIComponent(slug)}`, {
      headers: { Accept: "text/html" },
      next: { revalidate: 86400 },
    });

    const body = await res.text();

    if (res.ok && body && body.length > 50) {
      demoHtmlCache.set(slug, body);
    }

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "frame-ancestors 'self' https://ejobs.bd",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch {
    return new NextResponse("Failed to load template preview", { status: 502 });
  }
}
