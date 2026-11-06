import Link from "next/link";
import { ExternalLink, FileText, Search } from "lucide-react";

import { ApplicantStatusPill } from "@/components/admin/status-pill";
import {
  AdminEmpty,
  PageHeader,
  Pagination,
} from "@/components/admin/ui";
import { listApplications } from "@/lib/data/applications";
import { getAllStatuses } from "@/lib/data/config";
import { getAllPositions } from "@/lib/data/jobs";
import { formatDate, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminApplicantsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    position?: string;
    status?: string;
    page?: string;
  }>;
}) {
  const params = await searchParams;
  const q = (params.q ?? "").trim();
  const position = (params.position ?? "").trim();
  const status = (params.status ?? "").trim();
  const page = Number(params.page ?? "1") || 1;

  const [result, positions, statuses] = await Promise.all([
    listApplications({ q, position, status, page, pageSize: 20 }),
    getAllPositions(),
    getAllStatuses(),
  ]);

  const hasFilters = Boolean(q || position || status);

  return (
    <>
      <PageHeader
        eyebrow="Recruitment"
        title="Applicants"
        description="Every application received through the portal. Search, filter and move candidates through the pipeline."
      />

      <form
        method="get"
        action="/admin/applicants"
        className="admin-card mb-4 grid gap-2 p-4 md:grid-cols-[1fr_220px_180px_auto]"
      >
        <label className="relative block">
          <span className="sr-only">Search applicants</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="Search name, email, phone or reference"
            className="input pl-9"
          />
        </label>
        <select name="position" defaultValue={position} className="select" aria-label="Position">
          <option value="">All positions</option>
          {positions.map((job) => (
            <option key={job.id} value={job.id}>
              {job.title}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="select" aria-label="Status">
          <option value="">All statuses</option>
          {statuses.map((item) => (
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
          <strong className="font-semibold text-ink">{result.total}</strong>{" "}
          application{result.total === 1 ? "" : "s"}
          {hasFilters ? " matching filters" : ""}
        </p>
        {hasFilters ? (
          <Link
            href="/admin/applicants"
            className="underline decoration-line underline-offset-2 hover:text-ink"
          >
            Clear filters
          </Link>
        ) : null}
      </div>

      {result.items.length ? (
        <div className="admin-card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Position</th>
                <th>Status</th>
                <th>Received</th>
                <th>CV</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {result.items.map((application) => (
                <tr key={application.id}>
                  <td className="min-w-[200px]">
                    <Link
                      href={`/admin/applicants/${application.id}`}
                      className="text-[12.5px] font-medium text-ink transition-colors hover:text-brand"
                    >
                      {application.candidate_name || "Unnamed applicant"}
                    </Link>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {application.email || "No email"} · {application.phone || "No phone"}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted">
                      {application.application_id}
                    </p>
                  </td>
                  <td className="min-w-[180px] max-w-[260px]">
                    <p className="truncate text-[12px]">{application.position_title}</p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {application.position_department}
                    </p>
                  </td>
                  <td>
                    <ApplicantStatusPill status={application.status} />
                  </td>
                  <td className="whitespace-nowrap">
                    <p className="text-[11px]">{formatDate(application.created_at)}</p>
                    <p className="mt-0.5 text-[10px] text-muted">
                      {relativeTime(application.created_at)}
                    </p>
                  </td>
                  <td>
                    {application.cv_file_id ? (
                      <a
                        href={`/api/admin/applications/${application.id}/cv`}
                        className="inline-flex min-h-7 items-center gap-1 border border-line px-2 text-[10px] font-medium transition-colors hover:border-ink"
                      >
                        <FileText className="h-3 w-3" />
                        Download
                      </a>
                    ) : (
                      <span className="text-[10px] text-muted">None</span>
                    )}
                  </td>
                  <td className="text-right">
                    <Link
                      href={`/admin/applicants/${application.id}`}
                      className="inline-flex min-h-7 items-center gap-1 border border-line px-2 text-[10px] font-medium transition-colors hover:border-ink"
                    >
                      Open <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={result.page}
            pages={result.pages}
            total={result.total}
            basePath="/admin/applicants"
            params={{ q, position, status }}
          />
        </div>
      ) : (
        <AdminEmpty
          title="No applications found"
          description={
            hasFilters
              ? "No applications match these filters. Try a broader search."
              : "Applications will appear here as candidates apply through the public portal."
          }
          actionHref={hasFilters ? "/admin/applicants" : "/admin/jobs"}
          actionLabel={hasFilters ? "Clear filters" : "Manage jobs"}
        />
      )}
    </>
  );
}
