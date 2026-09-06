import type { NextConfig } from "next";

const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || "https://admin.ejobs.bd";
const cleanApiUrl = rawApiUrl.replace(/\/$/, "");
const backendUrl = cleanApiUrl.replace(/\/api\/?$/, "");
const apiUrl = `${backendUrl}/api`;

const apiHostname = (() => {
  try {
    return new URL(apiUrl).hostname;
  } catch {
    return "";
  }
})();

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },

  staticPageGenerationTimeout: 120,
  serverExternalPackages: ["laravel-echo", "pusher-js"],
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "127.0.0.1", port: "8000", pathname: "/storage/**" },
      { protocol: "https", hostname: "**.ejobs.bd", pathname: "/storage/**" },
      { protocol: "https", hostname: apiHostname, pathname: "/storage/**" },
    ],
  },
  async headers() {
    const connectHosts = [
      "'self'",
      "http://127.0.0.1:8000",
      "http://localhost:3000",
      "wss:",
      "ws:",
      "https://fonts.maateen.me",
      "https://connect.facebook.net",
    ];
    if (apiHostname && apiHostname !== "127.0.0.1") {
      connectHosts.push(`https://${apiHostname}`);
    }

    const imgHosts = [
      "'self'",
      "data:",
      "http://127.0.0.1:8000",
      "https://*.ejobs.bd",
      "https://fonts.maateen.me",
      "blob:",
    ];
    if (apiHostname && apiHostname !== "127.0.0.1") {
      imgHosts.push(`https://${apiHostname}`);
    }

    const frameHosts = [
      "'self'",
      "data:",
      "blob:",
      "https://*.ejobs.bd",
    ];
    if (apiHostname && apiHostname !== "127.0.0.1") {
      frameHosts.push(`https://${apiHostname}`);
    }

    return [
      {
        source: "/resume-builder/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" },
          { key: "Pragma", value: "no-cache" },
          { key: "Expires", value: "0" },
          { key: "X-LiteSpeed-Cache-Control", value: "no-cache" },
          { key: "Surrogate-Control", value: "no-store" },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.maateen.me",
              "style-src-elem 'self' 'unsafe-inline' https://fonts.maateen.me",
              "font-src 'self' data: https://fonts.maateen.me",
              `img-src ${imgHosts.join(" ")}`,
              `connect-src ${connectHosts.join(" ")}`,
              `frame-src ${frameHosts.join(" ")}`,
              "frame-ancestors 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiUrl}/:path*` },
      { source: "/storage/:path*", destination: `${backendUrl}/storage/:path*` },
      { source: "/sanctum/:path*", destination: `${backendUrl}/sanctum/:path*` },
      { source: "/cv/share/:path*", destination: `${backendUrl}/cv/share/:path*` },
      { source: "/cv/demo/:path*", destination: `${backendUrl}/cv/demo/:path*` },
      { source: "/cv/download/:path*", destination: `${backendUrl}/cv/download/:path*` },
    ];
  },
  async redirects() {
    return [
      { source: "/resume-builder", destination: "/resume-builder/template", permanent: false },
      { source: "/dashboard/cv-builder", destination: "/resume-builder/template", permanent: false },
      { source: "/cv-builder", destination: "/resume-builder/template", permanent: false },
      { source: "/dashboard/resume-builder", destination: "/resume-builder/template", permanent: false },
      { source: "/dashboard/resume-builder/:path*", destination: "/resume-builder/:path*", permanent: false },
      { source: "/candidate/cv-builder", destination: "/resume-builder/template", permanent: false },
      { source: "/candidate/resume/create", destination: "/resume-builder/template", permanent: false },
      { source: "/dashboard/resume/create", destination: "/resume-builder/template", permanent: false },
      { source: "/employer/login", destination: "/login", permanent: true },
      { source: "/employer-login", destination: "/login", permanent: true },
      { source: "/employer/forgot-password", destination: "/forgot-password", permanent: true },
      { source: "/employer-register", destination: "/register", permanent: true },
      { source: "/employer/register", destination: "/register?role=employer", permanent: true },
    ];
  },
};

export default nextConfig;