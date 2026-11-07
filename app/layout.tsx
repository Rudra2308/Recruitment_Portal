import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
});

const baseUrl = (() => {
  try {
    const raw =
      process.env.NEXT_PUBLIC_BASE_URL ??
      process.env.BASE_URL ??
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}`
          : "http://localhost:3000");
    return new URL(raw);
  } catch {
    return new URL("http://localhost:3000");
  }
})();

export const metadata: Metadata = {
  metadataBase: baseUrl,
  title: {
    default: "Careers at Malati Group | Recruitment Portal",
    template: "%s | Malati Group Careers",
  },
  description:
    "Explore current opportunities at Malati Group across foundry, machine shop, quality, supply chain and corporate teams. Apply online in minutes.",
  applicationName: "Malati Group Recruitment Portal",
  keywords: [
    "Malati Group",
    "careers",
    "jobs",
    "Kolhapur",
    "foundry",
    "machine shop",
    "recruitment",
  ],
  openGraph: {
    title: "Careers at Malati Group",
    description:
      "Explore current opportunities and apply online. Foundry, machining, quality and corporate roles in Kolhapur.",
    type: "website",
    locale: "en_IN",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/careers/favicon.ico", sizes: "any" },
      { url: "/careers/brand/favicon-64x64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/careers/brand/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth">
      <body className="min-h-screen bg-white font-sans text-ink antialiased">
        {children}
      </body>
    </html>
  );
}
