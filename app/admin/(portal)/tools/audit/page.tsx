import Link from "next/link";
import { ScrollText, Search, User } from "lucide-react";

import { AdminEmpty, PageHeader, Pagination } from "@/components/admin/ui";
import { listAuditEntries, parseAuditDetails } from "@/lib/data/audit";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; action?: string; page?: string }>;
}) {
  const { q = "", action = "", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr, 10) || 1);

  const { items, total, pages, actions } = await listAuditEntries({
    q,
    action,
    page,
    pageSize: 30,
  });

  return (
    <>
      <PageHeader
        eyebrow="Tools"
        title="Audit Log"
        description="Immutable record of administrative actions taken across jobs, applications, form configuration, and system settings."
        actions={
          <div className="flex items-center gap-2">
            <span className="badge badge-muted">{total} logged events</span>
          </div>
        }
      />

      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <form method="GET" className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search actor, target or details..."
              className="input min-h-9 w-64 pl-8 text-[12px]"
            />
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted" />
          </div>

          <select
            name="action"
            defaultValue={action}
            className="select min-h-9 w-48 text-[12px]"
          >
            <option value="">All Action Types</option>
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="min-h-9 border border-ink bg-ink px-4 text-[12px] font-medium text-white transition-colors hover:bg-black"
          >
            Filter
          </button>

          {q || action ? (
            <Link
              href="/admin/tools/audit"
              className="text-[12px] text-muted underline hover:text-ink"
            >
              Reset
            </Link>
          ) : null}
        </form>
      </div>

      {items.length ? (
        <div className="admin-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead className="border-b border-line bg-surface/40 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-muted">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-4 py-3.5">Actor</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Target</th>
                  <th className="px-5 py-3.5">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((entry) => {
                  const detailsObj = parseAuditDetails(entry.details);
                  const displayTime = formatDateTime(entry.timestamp);

                  return (
                    <tr key={entry.id} className="hover:bg-surface/30">
                      <td className="whitespace-nowrap px-5 py-3 text-muted font-mono text-[11px]">
                        {displayTime}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-ink">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3 w-3 text-muted" />
                          <span>{entry.actor || "system"}</span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="badge badge-muted font-medium">
                          {entry.action}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-semibold text-ink">
                        {entry.target || "—"}
                      </td>
                      <td className="px-5 py-3 text-muted max-w-md">
                        {detailsObj ? (
                          <div className="space-y-0.5 font-mono text-[10.5px]">
                            {Object.entries(detailsObj).map(([k, v]) => (
                              <span key={k} className="mr-2 inline-block">
                                <span className="text-ink">{k}:</span>{" "}
                                <span>{String(v)}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="truncate">{entry.details || "—"}</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            pages={pages}
            total={total}
            basePath="/admin/tools/audit"
            params={{ q, action }}
          />
        </div>
      ) : (
        <AdminEmpty
          title="No audit entries found"
          description={
            q || action
              ? "Try adjusting or clearing your search filters."
              : "Administrative actions will be automatically recorded here."
          }
        />
      )}
    </>
  );
}
