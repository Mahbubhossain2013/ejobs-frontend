import { NextRequest, NextResponse } from "next/server";

const backendBase = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api").replace(/\/api\/?$/, "");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ uuid: string }> }
) {
  const { uuid } = await params;

  // Next.js strips Authorization headers from client requests,
  // so the token is passed as a query param and forwarded as Bearer.
  const token = req.nextUrl.searchParams.get("token") || "";
  const cookieHeader = req.headers.get("cookie") || "";

  const authHeaders: Record<string, string> = {
    Accept: "application/pdf",
  };
  if (token) authHeaders["Authorization"] = `Bearer ${token}`;
  if (cookieHeader) authHeaders["Cookie"] = cookieHeader;

  // 1. Try auth-protected download (owner's private resume)
  try {
    const res = await fetch(`${backendBase}/api/candidate/cv/resumes/${uuid}/download`, {
      headers: authHeaders,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });

    if (res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("pdf") || ct.includes("octet-stream")) {
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="resume-${uuid}.pdf"`,
            "Cache-Control": "no-cache",
          },
        });
      }
    }
  } catch { /* proxy failed */ }

  // 2. Try public download (shared resume)
  try {
    const res = await fetch(`${backendBase}/api/candidate/cv/${uuid}/download-pdf`, {
      headers: authHeaders,
      cache: "no-store",
    });

    if (res.ok) {
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("pdf") || ct.includes("octet-stream")) {
        const buffer = await res.arrayBuffer();
        return new NextResponse(buffer, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="resume-${uuid}.pdf"`,
            "Cache-Control": "no-cache",
          },
        });
      }
    }
  } catch { /* public endpoint failed */ }

  return new NextResponse(
    JSON.stringify({ error: "PDF generation failed. Please try again." }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
