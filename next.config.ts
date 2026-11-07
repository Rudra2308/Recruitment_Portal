import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  basePath: "/careers",
  poweredByHeader: false,
  serverExternalPackages: ["googleapis", "nodemailer", "bcryptjs"],
  experimental: {
    optimizePackageImports: ["lucide-react"],
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/careers",
        basePath: false,
        permanent: false,
      },
      {
        source: "/admin",
        destination: "/careers/admin",
        basePath: false,
        permanent: false,
      },
      {
        source: "/admin/:path*",
        destination: "/careers/admin/:path*",
        basePath: false,
        permanent: false,
      },
      {
        source: "/jobs",
        destination: "/careers/jobs",
        basePath: false,
        permanent: false,
      },
      {
        source: "/jobs/:path*",
        destination: "/careers/jobs/:path*",
        basePath: false,
        permanent: false,
      },
      {
        source: "/departments",
        destination: "/careers/departments",
        basePath: false,
        permanent: false,
      },
      {
        source: "/departments/:path*",
        destination: "/careers/departments/:path*",
        basePath: false,
        permanent: false,
      },
      {
        source: "/apply/:path*",
        destination: "/careers/apply/:path*",
        basePath: false,
        permanent: false,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
