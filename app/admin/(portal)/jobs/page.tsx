import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { JobStatusBadge } from "@/components/status-badge";
import { AdminEmpty, PageHeader } from "@/components/admin/ui";
import {
  deleteJobAction,
  moveJobAction,
  setJobStatusAction,
} from "@/app/admin/actions";
import { countApplicationsByPosition } from "@/lib/data/applications";
import { getAllDepartments } from "@/lib/data/departments";
import {
  filterPositionsForAdmin,
  JOB_STATUSES,
  JOB_STATUS_LABELS,
} from "@/lib/data/jobs";
import { deadlineLabel, formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; department?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const status = (params.status ?? "").trim();
  const department = (params.department ?? "").trim();

  const [positions, departments, applicationCounts] = await Promise.all([
    filterPositionsForAdmin({ q, status, department }),
    getAllDepartments(),
    countApplicationsByPosition(),
  ]);

  const hasFilters = Boolean(q || status || department);
  const openCount = positions.filter((position) => position.status === "OPEN").length;

  return (
    <>
      <PageHeader
        eyebrow="Recruitment"
        title="Jobs"
        description="Create, publish and order every position. Draft jobs are never visible on the public site."
        actions={
          <Link href="/admin/jobs/new" className="btn btn-primary btn-sm">
            <Plus className="h-3.5 w-3.5" />
            New job
          </Link>
        }
      />

      <form
        method="get"
        action="/admin/jobs"
        className="admin-card mb-4 grid gap-2 p-4 md:grid-cols-[1fr_160px_200px_auto]"
      >
        <label className="relative block">
          <span className="sr-only">Search jobs</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search title, department or location"
            className="input pl-9"
          />
        </label>
        <select name="status" defaultValue={status} className="select" aria-label="Status">
          <option value="">All statuses</option>
          {JOB_STATUSES.map((value) => (
            <option key={value} value={value}>
              {JOB_STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <select
          name="department"
          defaultValue={department}
          className="select"
          aria-label="Department"
        >
          <option value="">All departments</option>
          {departments.map((item) => (
            <option key={item.id} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-secondary btn-sm">
          Filter
        </button>
      </form>

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted">
        <p>
          <strong className="font-semibold text-ink">{positions.length}</strong> job
          {positions.length === 1 ? "" : "s"}
          {hasFilters ? " matching filters" : ""} · {openCount} marked open
        </p>
        {hasFilters ? (
          <Link href="/admin/jobs" className="underline decoration-line underline-offset-2 hover:text-ink">
            Clear filters
          </Link>
        ) : null}
      </div>

      {positions.length ? (
        <div className="admin-card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Job</th>
                <th>Department</th>
                <th>Status</th>
                <th>Deadline</th>
                <th>Applicants</th>
                <th>Order</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((position) => {
                const applicants = applicationCounts[position.id] ?? 0;
                return (
                  <tr key={position.id}>
                    <td className="min-w-[220px]">
                      <Link
                        href={`/admin/jobs/${position.id}`}
                        className="text-[12.5px] font-medium text-ink transition-colors hover:text-brand"
                      >
                        {position.title}
                      </Link>
                      <p className="mt-0.5 text-[10px] text-muted">
                        {position.location} · {position.employment_type} · created{" "}
                        {formatDate(position.created_at)}
                      </p>
                    </td>
                    <td className="whitespace-nowrap text-[12px]">{position.department}</td>
                    <td>
                      <JobStatusBadge status={position.status} />
                    </td>
                    <td className="whitespace-nowrap">
                      <p className="text-[11.5px]">{deadlineLabel(position.deadline)}</p>
                      {position.deadline ? (
                        <p className="mt-0.5 text-[10px] text-muted">
                          {formatDate(position.deadline)}
                        </p>
                      ) : null}
                    </td>
                    <td>
                      <Link
                        href={`/admin/applicants?position=${position.id}`}
                        className="inline-flex min-h-7 items-center border border-line px-2 text-[11px] tabular-nums transition-colors hover:border-ink"
                      >
                        {applicants}
                      </Link>
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <ActionForm
                          action={moveJobAction}
                          submitLabel="Move up"
                          submitContent={<ArrowUp className="h-3.5 w-3.5" />}
                          pendingLabel=""
                          variant="ghost"
                          size="icon"
                          showMessage={false}
                          footerClassName="mt-0"
                        >
                          <input type="hidden" name="id" value={position.id} />
                          <input type="hidden" name="direction" value="up" />
                        </ActionForm>
                        <ActionForm
                          action={moveJobAction}
                          submitLabel="Move down"
                          submitContent={<ArrowDown className="h-3.5 w-3.5" />}
                          pendingLabel=""
                          variant="ghost"
                          size="icon"
                          showMessage={false}
                          footerClassName="mt-0"
                        >
                          <input type="hidden" name="id" value={position.id} />
                          <input type="hidden" name="direction" value="down" />
                        </ActionForm>
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-wrap items-center justify-end gap-1">
                        <Link
                          href={`/admin/jobs/${position.id}`}
                          className="inline-flex min-h-7 items-center gap-1 border border-line px-2 text-[10px] font-medium transition-colors hover:border-ink"
                        >
                          <Pencil className="h-3 w-3" /> Edit
                        </Link>
                        <Link
                          href={`/admin/jobs/${position.id}/preview`}
                          className="inline-flex min-h-7 items-center gap-1 border border-line px-2 text-[10px] font-medium transition-colors hover:border-ink"
                          target="_blank"
                        >
                          <Eye className="h-3 w-3" /> Preview
                        </Link>
                        <ActionForm
                          action={setJobStatusAction}
                          submitLabel={position.status === "OPEN" ? "Close" : "Publish"}
                          pendingLabel="…"
                          variant={position.status === "OPEN" ? "outline" : "primary"}
                          size="xs"
                          showMessage={false}
                          footerClassName="mt-0"
                        >
                          <input type="hidden" name="id" value={position.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={position.status === "OPEN" ? "CLOSED" : "OPEN"}
                          />
                        </ActionForm>
                        {applicants === 0 ? (
                          <ActionForm
                            action={deleteJobAction}
                            submitLabel="Delete job"
                            submitContent={<Trash2 className="h-3 w-3" />}
                            pendingLabel=""
                            variant="danger"
                            size="icon"
                            showMessage={false}
                            footerClassName="mt-0"
                            confirm={`Delete "${position.title}"? This cannot be undone.`}
                          >
                            <input type="hidden" name="id" value={position.id} />
                          </ActionForm>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <AdminEmpty
          title="No jobs found"
          description={
            hasFilters
              ? "No positions match these filters. Try clearing them or creating a new role."
              : "Create your first position to start accepting applications."
          }
          actionHref="/admin/jobs/new"
          actionLabel="Create a job"
        />
      )}
    </>
  );
}
