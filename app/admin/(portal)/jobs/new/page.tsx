import Link from "next/link";
import { AlertTriangle, ArrowLeft } from "lucide-react";

import { JobForm } from "@/components/admin/job-form";
import { PageHeader, Flash } from "@/components/admin/ui";
import { getAllDepartments } from "@/lib/data/departments";
import { getSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

export default async function NewJobPage() {
  const [departments, settings] = await Promise.all([
    getAllDepartments(),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Recruitment"
        title="New job"
        description="Start with the role basics. The job stays in draft until you explicitly set it to open."
        actions={
          <Link href="/admin/jobs" className="btn btn-outline btn-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to jobs
          </Link>
        }
      />

      {!departments.length ? (
        <Flash tone="warning">
          <span className="inline-flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            No departments exist yet.{" "}
            <Link href="/admin/departments" className="underline">
              Create a department
            </Link>{" "}
            before adding a job.
          </span>
        </Flash>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <JobForm departments={departments} defaultLocation={settings.portal_location} />

        <aside className="space-y-3">
          <div className="admin-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Before you publish
            </p>
            <ul className="mt-3 space-y-2.5 text-[11px] leading-5 text-muted">
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                Write responsibilities as one line per bullet for a clean job page.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                Add job details such as shift and salary range after saving.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                Use Preview to check the candidate view before opening the role.
              </li>
              <li className="flex gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                Draft jobs never appear on the public site.
              </li>
            </ul>
          </div>

          <div className="admin-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              Data source
            </p>
            <p className="mt-2 text-[11px] leading-5 text-muted">
              Jobs are stored in the configured recruitment data store. In
              production this is Google Sheets.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}
