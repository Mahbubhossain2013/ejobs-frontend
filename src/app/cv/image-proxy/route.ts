import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const targetUrl = decodeURIComponent(url);

    const res = await fetch(targetUrl, {
      cache: "no-store",
      headers: {
        Accept: "image/*,*/*",
        "User-Agent": "eJobs-CV-Renderer/1.0",
      },
    });

    if (!res.ok) {
      return new NextResponse(`Failed to fetch image: ${res.statusText}`, { status: res.status });
    }

    const contentType = res.headers.get("content-type") || "image/png";
    const arrayBuffer = await res.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=86400, immutable",
      },
    });
  } catch (err: any) {
    return new NextResponse(`Image proxy error: ${err.message}`, { status: 500 });
  }
}
