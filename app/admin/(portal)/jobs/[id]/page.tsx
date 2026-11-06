import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Eye } from "lucide-react";

import { FormOverridesEditor } from "@/components/admin/form-overrides-editor";
import { JobDetailsEditor } from "@/components/admin/job-details-editor";
import { JobForm } from "@/components/admin/job-form";
import { Flash, PageHeader } from "@/components/admin/ui";
import { JobStatusBadge } from "@/components/status-badge";
import { countApplicationsForPosition } from "@/lib/data/applications";
import {
  getAllFormFields,
  getAllJobDetails,
  getJobFormOverrides,
  isMetaField,
} from "@/lib/data/config";
import { getAllDepartments } from "@/lib/data/departments";
import { getPositionById, isJobLive } from "@/lib/data/jobs";
import { getSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

export default async function EditJobPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const position = await getPositionById(id);
  if (!position) notFound();

  const [departments, details, fields, overrides, settings, applicationCount] =
    await Promise.all([
      getAllDepartments(),
      getAllJobDetails(),
      getAllFormFields(),
      getJobFormOverrides(id),
      getSettings(),
      countApplicationsForPosition(id),
    ]);

  const positionDetails = details.filter((detail) => detail.position_id === id);
  const configurableFields = fields.filter(
    (field) => field.active && !isMetaField(field),
  );
  const live = isJobLive(position);

  return (
    <>
      <PageHeader
        eyebrow="Recruitment"
        title={position.title}
        description={`${position.department} · ${position.location} · ${applicationCount} application${
          applicationCount === 1 ? "" : "s"
        }`}
        actions={
          <>
            <Link href="/admin/jobs" className="btn btn-outline btn-sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              Jobs
            </Link>
            <Link
              href={`/admin/jobs/${position.id}/preview`}
              target="_blank"
              className="btn btn-outline btn-sm"
            >
              <Eye className="h-3.5 w-3.5" />
              Preview
            </Link>
            {live ? (
              <Link
                href={`/jobs/${position.id}`}
                target="_blank"
                className="btn btn-secondary btn-sm"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Public page
              </Link>
            ) : null}
          </>
        }
      />

      {query.created ? (
        <Flash>
          Job created. Add job details and form overrides below, then publish when
          you are ready.
        </Flash>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <JobStatusBadge status={position.status} />
        <span className="text-[11px] text-muted">
          Job ID <span className="font-mono text-ink">{position.id}</span>
        </span>
        <span className="text-[11px] text-muted">
          Updated {new Date(position.updated_at).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
        </span>
      </div>

      <JobForm
        position={position}
        departments={departments}
        defaultLocation={settings.portal_location}
      />

      <div className="mt-4">
        <JobDetailsEditor positionId={position.id} details={positionDetails} />
      </div>

      <div className="mt-4">
        <FormOverridesEditor
          positionId={position.id}
          fields={configurableFields}
          overrides={overrides}
        />
      </div>

      {applicationCount > 0 ? (
        <div className="mt-4 admin-card flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[12px] font-medium">This job has applications</p>
            <p className="mt-0.5 text-[11px] text-muted">
              It cannot be deleted while applications exist. Close it instead to
              preserve history.
            </p>
          </div>
          <Link
            href={`/admin/applicants?position=${position.id}`}
            className="btn btn-outline btn-sm shrink-0"
          >
            View applicants
          </Link>
        </div>
      ) : null}
    </>
  );
}
