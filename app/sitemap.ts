import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/config";
import { getPublicPositions } from "@/lib/data/jobs";
import { getActiveDepartments } from "@/lib/data/departments";
import type { Position, Department } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  let positions: Position[] = [];
  let departments: Department[] = [];

  try {
    [positions, departments] = await Promise.all([
      getPublicPositions(),
      getActiveDepartments(),
    ]);
  } catch (err) {
    console.warn("Could not fetch positions/departments during sitemap generation:", err);
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/jobs`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/departments`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const departmentRoutes: MetadataRoute.Sitemap = departments.map((dept) => ({
    url: `${baseUrl}/departments/${dept.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const jobRoutes: MetadataRoute.Sitemap = positions.map((job) => ({
    url: `${baseUrl}/jobs/${job.id}`,
    lastModified: new Date(job.updated_at || job.created_at || Date.now()),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticRoutes, ...departmentRoutes, ...jobRoutes];
}
