import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  Plus,
  Users,
} from "lucide-react";

import { ApplicantStatusPill } from "@/components/admin/status-pill";
import {
  AdminEmpty,
  PageHeader,
  SectionCard,
  StatCard,
  Flash,
} from "@/components/admin/ui";
import {
  getRecentApplications,
  getApplicationStats,
} from "@/lib/data/applications";
import {
  getAllPositions,
  getJobsClosingSoon,
  isJobLive,
  JOB_STATUS_LABELS,
} from "@/lib/data/jobs";
import { getSettings, recruitmentStatusLabel } from "@/lib/data/settings";
import { cn, deadlineLabel, formatShortDate, relativeTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [positions, stats, recent, closingSoon, settings] = await Promise.all([
    getAllPositions(),
    getApplicationStats(),
    getRecentApplications(6),
    getJobsClosingSoon(5),
    getSettings(),
  ]);

  const openJobs = positions.filter((position) => isJobLive(position));
  const departments = new Set(openJobs.map((position) => position.department));
  const draftJobs = positions.filter((position) => position.status === "DRAFT");
  const closedJobs = positions.filter((position) => position.status === "CLOSED");
  const pipeline = Object.entries(stats.byStatus).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Recruitment dashboard"
        description={`Live view of ${settings.company_name} hiring. Applications, open roles and closing deadlines in one place.`}
        actions={
          <>
            <Link href="/admin/jobs/new" className="btn btn-primary btn-sm">
              <Plus className="h-3.5 w-3.5" />
              New job
            </Link>
            <Link href="/admin/tools/qr" className="btn btn-outline btn-sm">
              QR codes
            </Link>
          </>
        }
      />

      {settings.recruitment_status !== "OPEN" ? (
        <Flash tone="warning">
          <strong className="font-semibold">
            {recruitmentStatusLabel(settings.recruitment_status)}.
          </strong>{" "}
          Public applications are on hold.{" "}
          <Link href="/admin/settings" className="underline">
            Manage recruitment status
          </Link>
          .
        </Flash>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Open jobs"
          value={openJobs.length}
          sub={`${departments.size} department${departments.size === 1 ? "" : "s"} hiring · ${draftJobs.length} draft`}
          href="/admin/jobs?status=OPEN"
        />
        <StatCard
          label="Applicants"
          value={stats.total}
          sub={`${stats.withCv} with a CV`}
          href="/admin/applicants"
        />
        <StatCard
          label="New today"
          value={stats.newToday}
          sub={
            stats.byStatus["NEW"]
              ? `${stats.byStatus["NEW"]} awaiting first review`
              : "No unreviewed applications"
          }
          href="/admin/applicants?status=NEW"
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.65fr_1fr]">
        <SectionCard
          title="Recent applications"
          description="The latest submissions across every role."
          action={
            <Link
              href="/admin/applicants"
              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted transition-colors hover:text-ink"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          }
          bodyClassName="p-0"
        >
          {recent.length ? (
            <div className="overflow-x-auto">
              <table className="table-base">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Position</th>
                    <th>Status</th>
                    <th className="text-right">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <Link
                          href={`/admin/applicants/${application.id}`}
                          className="font-medium text-ink transition-colors hover:text-brand"
                        >
                          {application.candidate_name || "Unnamed applicant"}
                        </Link>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {application.application_id}
                        </p>
                      </td>
                      <td className="max-w-[220px]">
                        <p className="truncate text-[12px]">{application.position_title}</p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {application.position_department}
                        </p>
                      </td>
                      <td>
                        <ApplicantStatusPill status={application.status} />
                      </td>
                      <td className="whitespace-nowrap text-right text-[11px] text-muted">
                        {relativeTime(application.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <AdminEmpty
                title="No applications yet"
                description="Applications submitted from the public portal will appear here."
                actionHref="/admin/jobs"
                actionLabel="Manage jobs"
              />
            </div>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard
            title="Jobs closing soon"
            description="Open roles with a deadline in the next 21 days."
            action={
              <CalendarClock className="h-4 w-4 text-muted" aria-hidden="true" />
            }
            bodyClassName="p-0"
          >
            {closingSoon.length ? (
              <ul className="divide-y divide-line">
                {closingSoon.map((job) => (
                  <li key={job.id}>
                    <Link
                      href={`/admin/jobs/${job.id}`}
                      className="group flex items-start justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-[#fcfcfc]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-medium text-ink group-hover:text-brand">
                          {job.title}
                        </p>
                        <p className="mt-0.5 text-[10px] text-muted">
                          {job.department} · {job.location}
                        </p>
                      </div>
                      <span className="shrink-0 text-[10px] font-medium text-warning">
                        {deadlineLabel(job.deadline)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="px-5 py-6 text-[12px] text-muted">
                No deadlines in the next three weeks.
              </p>
            )}
          </SectionCard>

          <SectionCard title="Pipeline" description="Applications by current status.">
            {pipeline.length ? (
              <ul className="space-y-2.5">
                {pipeline.map(([status, count]) => (
                  <li key={status} className="flex items-center justify-between gap-3">
                    <ApplicantStatusPill status={status} />
                    <span className="text-[12px] font-medium tabular-nums">{count}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[12px] text-muted">No applications to report yet.</p>
            )}
          </SectionCard>

          <SectionCard title="Recruitment status">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    settings.recruitment_status === "OPEN"
                      ? "bg-[#1a7f4b]"
                      : settings.recruitment_status === "PAUSED"
                        ? "bg-[#b27a00]"
                        : "bg-brand",
                  )}
                />
                <p className="text-[12px] font-medium">
                  {recruitmentStatusLabel(settings.recruitment_status)}
                </p>
              </div>
              <Link
                href="/admin/settings"
                className="text-[11px] text-muted underline decoration-line underline-offset-2 hover:text-ink"
              >
                Change
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4 text-[11px]">
              <div>
                <p className="text-muted">Draft jobs</p>
                <p className="mt-1 font-medium">{draftJobs.length}</p>
              </div>
              <div>
                <p className="text-muted">Closed jobs</p>
                <p className="mt-1 font-medium">{closedJobs.length}</p>
              </div>
            </div>
          </SectionCard>

          <div className="admin-card flex items-center justify-between gap-3 p-5">
            <div className="flex items-center gap-2.5">
              <Briefcase className="h-4 w-4 text-muted" />
              <p className="text-[11px] text-muted">Total positions</p>
            </div>
            <Link
              href="/admin/jobs"
              className="inline-flex items-center gap-1 text-[12px] font-medium hover:text-brand"
            >
              {positions.length} <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link
          href="/admin/jobs/new"
          className="admin-card flex items-center gap-3 p-4 transition-colors hover:border-ink"
        >
          <Plus className="h-4 w-4 text-brand" />
          <div>
            <p className="text-[12px] font-medium">Create a job</p>
            <p className="text-[10px] text-muted">Draft and publish a new role</p>
          </div>
        </Link>
        <Link
          href="/admin/applicants"
          className="admin-card flex items-center gap-3 p-4 transition-colors hover:border-ink"
        >
          <Users className="h-4 w-4 text-brand" />
          <div>
            <p className="text-[12px] font-medium">Review applicants</p>
            <p className="text-[10px] text-muted">Search and move candidates</p>
          </div>
        </Link>
        <Link
          href="/admin/tools/audit"
          className="admin-card flex items-center gap-3 p-4 transition-colors hover:border-ink"
        >
          <CalendarClock className="h-4 w-4 text-brand" />
          <div>
            <p className="text-[12px] font-medium">Audit log</p>
            <p className="text-[10px] text-muted">Every administrative change</p>
          </div>
        </Link>
      </div>
    </>
  );
}
