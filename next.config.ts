import { execSync } from "node:child_process";
import type { NextConfig } from "next";

const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://127.0.0.1:4000";
const MEDIA_URL = process.env.NEXT_PUBLIC_MEDIA_URL ?? "http://localhost:4000/uploads";
const isDev = process.env.NODE_ENV !== "production";
const UMAMI_ORIGIN = "https://umami.madeburo.com";
const media = new URL(MEDIA_URL);

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${UMAMI_ORIGIN}${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: ${media.origin}`,
  "font-src 'self' data:",
  `connect-src 'self' ${UMAMI_ORIGIN}${isDev ? " ws: http://localhost:*" : ""}`,
  "frame-src https://www.paypal.com https://www.sandbox.paypal.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com",
  "object-src 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

// Build identifier for version-skew protection: after a deploy, tabs opened on the
// previous build do a full reload on navigation instead of failing to load old chunks.
function deploymentId() {
  if (process.env.DEPLOYMENT_ID) return process.env.DEPLOYMENT_ID;
  try {
    return execSync("git rev-parse --short HEAD", { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || undefined;
  } catch {
    return undefined;
  }
}

const nextConfig: NextConfig = {
  deploymentId: deploymentId(),
  poweredByHeader: false,
  reactStrictMode: true,
  images: {
    qualities: [60, 75, 85],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 480, 640, 768, 1024, 1280, 1536, 1920],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: media.protocol.replace(":", "") as "http" | "https",
        hostname: media.hostname,
        port: media.port,
        pathname: `${media.pathname.replace(/\/$/, "")}/**`,
      },
    ],
    dangerouslyAllowLocalIP: isDev,
  },
  // Browser calls go same-origin to /api (nginx proxies to the API in production).
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_INTERNAL_URL}/api/:path*` }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self \"https://www.paypal.com\")" },
        ],
      },
      {
        source: "/(account|checkout|cart|order)(.*)",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
