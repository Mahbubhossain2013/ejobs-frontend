import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Force no-cache for resume-builder pages so LiteSpeed/proxy won't cache them
  if (request.nextUrl.pathname.startsWith("/resume-builder")) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
    response.headers.set("X-LiteSpeed-Cache-Control", "no-cache=*");
    response.headers.set("Surrogate-Control", "no-store");
  }

  return response;
}

export const config = {
  matcher: ["/resume-builder/:path*"],
};

