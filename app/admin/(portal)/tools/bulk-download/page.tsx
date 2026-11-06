import { BulkDownloadManager } from "@/components/admin/bulk-download-manager";
import { PageHeader } from "@/components/admin/ui";
import { getAllApplicationsWithJob } from "@/lib/data/applications";
import { getAllStatuses } from "@/lib/data/config";
import { getAllPositions } from "@/lib/data/jobs";

export const dynamic = "force-dynamic";

export default async function BulkDownloadPage() {
  const [applications, positions, statuses] = await Promise.all([
    getAllApplicationsWithJob(),
    getAllPositions(),
    getAllStatuses(),
  ]);

  // Extract distinct departments
  const departmentSet = new Set<string>();
  for (const pos of positions) {
    if (pos.department && pos.department.trim()) {
      departmentSet.add(pos.department.trim());
    }
  }
  const departments = Array.from(departmentSet).sort();

  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Bulk CV & Data Download"
        description="Download all or filtered applicant CVs alongside the complete master applicant database export in one convenient ZIP archive."
      />

      <BulkDownloadManager
        applications={applications}
        positions={positions}
        departments={departments}
        statuses={statuses}
      />
    </>
  );
}
