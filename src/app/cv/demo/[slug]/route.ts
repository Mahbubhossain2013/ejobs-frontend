import { NextRequest, NextResponse } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const backendUrl = apiUrl.replace(/\/api\/?$/, "");

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const res = await fetch(`${backendUrl}/cv/demo/${encodeURIComponent(slug)}`, {
      headers: { Accept: "text/html" },
    });

    const body = await res.text();

    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy": "frame-ancestors 'self' https://ejobs.bd",
      },
    });
  } catch {
    return new NextResponse("Failed to load template preview", { status: 502 });
  }
}
