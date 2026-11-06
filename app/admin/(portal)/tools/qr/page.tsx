import { PageHeader } from "@/components/admin/ui";
import { QrGenerator } from "@/components/admin/qr-generator";
import { getAllPositions } from "@/lib/data/jobs";
import { getActiveDepartments } from "@/lib/data/departments";
import { absoluteUrl } from "@/lib/config";

export const dynamic = "force-dynamic";

export default async function AdminQrPage() {
  const [positions, departments] = await Promise.all([
    getAllPositions(),
    getActiveDepartments(),
  ]);

  const baseUrl = absoluteUrl();

  const targets = [
    {
      id: "portal-home",
      label: "Main Recruitment Portal (/)",
      path: "/",
      group: "General Portal",
    },
    {
      id: "portal-jobs",
      label: "All Positions Listing (/jobs)",
      path: "/jobs",
      group: "General Portal",
    },
    {
      id: "portal-departments",
      label: "Departments Overview (/departments)",
      path: "/departments",
      group: "General Portal",
    },
    ...departments.map((dept) => ({
      id: `dept-${dept.id}`,
      label: `${dept.name} Department (/departments/${dept.id})`,
      path: `/departments/${dept.id}`,
      group: "Departments",
    })),
    ...positions
      .filter((p) => p.status === "OPEN")
      .map((job) => ({
        id: `job-${job.id}`,
        label: `${job.title} — Direct Apply (/jobs/${job.id})`,
        path: `/jobs/${job.id}`,
        group: "Open Positions",
      })),
  ];

  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="QR Code Generator"
        description="Generate high-resolution printable QR codes for newspaper ads, factory gate posters, campus recruitment flyers, and specific job openings."
      />

      <QrGenerator baseUrl={baseUrl} targets={targets} />
    </>
  );
}
