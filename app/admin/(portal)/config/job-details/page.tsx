import Link from "next/link";
import { ArrowRight, Briefcase, Plus, SlidersHorizontal } from "lucide-react";

import { PageHeader, SectionCard, AdminEmpty } from "@/components/admin/ui";
import { getAllPositions } from "@/lib/data/jobs";
import { getAllJobDetails, JOB_DETAIL_TYPE_LABELS } from "@/lib/data/config";
import type { JobDetail, Position } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function AdminJobDetailsConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const [positions, allDetails] = await Promise.all([
    getAllPositions(),
    getAllJobDetails(),
  ]);

  const query = q.trim().toLowerCase();
  const filteredPositions = query
    ? positions.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.department.toLowerCase().includes(query),
      )
    : positions;

  const detailsByJob = new Map<string, JobDetail[]>();
  for (const detail of allDetails) {
    const list = detailsByJob.get(detail.position_id) ?? [];
    list.push(detail);
    detailsByJob.set(detail.position_id, list);
  }

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Job Details"
        description="Configure role-specific metadata such as shift timings, machines used, reporting line, and salary range for each position."
        actions={
          <div className="flex items-center gap-2">
            <span className="badge badge-muted">
              {allDetails.length} custom details across {positions.length} jobs
            </span>
          </div>
        }
      />

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <form method="GET" className="flex items-center gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Filter by job or department..."
            className="input min-h-9 w-72 text-[12px]"
          />
          {q ? (
            <Link
              href="/admin/config/job-details"
              className="text-[12px] text-muted underline hover:text-ink"
            >
              Clear
            </Link>
          ) : null}
        </form>
      </div>

      {filteredPositions.length ? (
        <div className="space-y-4">
          {filteredPositions.map((job) => {
            const details = detailsByJob.get(job.id) ?? [];

            return (
              <div key={job.id} className="admin-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Briefcase className="h-4 w-4 text-muted" />
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="text-[13px] font-semibold text-ink hover:text-brand"
                    >
                      {job.title}
                    </Link>
                    <span className="badge badge-muted">{job.department}</span>
                    <span
                      className={`badge ${
                        job.status === "OPEN" ? "badge-success" : "badge-muted"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>

                  <Link
                    href={`/admin/jobs/${job.id}`}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-brand hover:underline"
                  >
                    Manage job details
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                <div className="p-5">
                  {details.length ? (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {details.map((detail) => (
                        <div
                          key={detail.id}
                          className="rounded border border-line bg-surface/40 p-3 text-[12px]"
                        >
                          <div className="flex items-center justify-between text-muted">
                            <span className="font-medium text-ink">
                              {detail.label}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide">
                              {JOB_DETAIL_TYPE_LABELS[detail.type] ?? detail.type}
                            </span>
                          </div>
                          <p className="mt-1 line-clamp-2 text-ink">
                            {detail.value || "—"}
                          </p>
                          {!detail.visible ? (
                            <span className="mt-2 inline-block text-[10px] text-brand">
                              (Hidden from public view)
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[12px] text-muted">
                      No custom details configured for this role yet.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <AdminEmpty
          title="No jobs found"
          description={
            q ? "Try clearing your search query." : "No jobs exist in the system yet."
          }
        />
      )}
    </>
  );
}
