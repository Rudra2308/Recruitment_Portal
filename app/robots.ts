import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/jobs", "/departments"],
        disallow: ["/admin", "/admin/*", "/api/*", "/mgmt-portal", "/apply/success"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
