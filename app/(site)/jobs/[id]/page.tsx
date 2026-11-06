import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  GraduationCap,
  Mail,
  MapPin,
} from "lucide-react";

import { JobRow } from "@/components/job-row";
import { getJobDetailsForPosition } from "@/lib/data/config";
import { getAllDepartments } from "@/lib/data/departments";
import {
  getPublicPositionById,
  getRelatedPositions,
  isJobLive,
} from "@/lib/data/jobs";
import { getSettings } from "@/lib/data/settings";
import type { JobDetail, Position } from "@/lib/types";
import {
  cn,
  deadlineLabel,
  formatDate,
  splitLines,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const position = await getPublicPositionById(id);
  if (!position) return { title: "Position" };
  return {
    title: position.title,
    description: position.description.slice(0, 160),
    openGraph: {
      title: `${position.title} — Malati Group Careers`,
      description: position.description.slice(0, 160),
      type: "article",
    },
  };
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2.5">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
      <div>
        <dt className="text-[10px] uppercase tracking-[0.11em] text-muted">{label}</dt>
        <dd className="mt-0.5 text-[13px] font-medium leading-5 text-ink">{value}</dd>
      </div>
    </div>
  );
}

function DetailValue({ detail }: { detail: JobDetail }) {
  if (!detail.value) return <span className="text-muted">—</span>;
  if (detail.type === "date") return <>{formatDate(detail.value)}</>;
  return <>{detail.value}</>;
}

function ContentSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-line py-8 first:border-t-0 first:pt-0">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [position, settings, departments] = await Promise.all([
    getPublicPositionById(id),
    getSettings(),
    getAllDepartments(),
  ]);

  if (!position) notFound();

  const [details, related] = await Promise.all([
    getJobDetailsForPosition(position.id),
    getRelatedPositions(position, 3),
  ]);

  const department = departments.find(
    (item) => item.name.toLowerCase() === position.department.toLowerCase(),
  );
  const live = isJobLive(position);
  const recruitmentOpen = settings.recruitment_status === "OPEN";
  const canApply = live && recruitmentOpen;

  let statusText = "Applications open";
  if (!live) statusText = "Applications closed";
  else if (!recruitmentOpen) statusText = "Applications paused";

  return (
    <>
      <div className="border-b border-line bg-[#fcfcfc]">
        <div className="container-page py-6 md:py-8">
          <nav className="flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <Link href="/jobs" className="inline-flex items-center gap-1.5 transition-colors hover:text-ink">
              <ArrowLeft className="h-3 w-3" />
              Open positions
            </Link>
            <span className="text-line">/</span>
            {department ? (
              <Link
                href={`/departments/${department.id}`}
                className="transition-colors hover:text-ink"
              >
                {department.name}
              </Link>
            ) : (
              <span>{position.department}</span>
            )}
          </nav>

          <div className="mt-6 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "badge",
                    canApply ? "badge-success" : "badge-muted",
                  )}
                >
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      canApply ? "bg-success" : "bg-muted",
                    )}
                  />
                  {statusText}
                </span>
                <span className="badge badge-muted">{position.employment_type}</span>
              </div>

              <h1 className="display mt-5 max-w-[22ch] text-[38px] leading-[1.05] md:text-[54px]">
                {position.title}
              </h1>

              <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 md:grid-cols-4">
                <MetaItem icon={MapPin} label="Location" value={position.location} />
                <MetaItem
                  icon={BriefcaseBusiness}
                  label="Employment"
                  value={position.employment_type}
                />
                <MetaItem icon={Clock} label="Experience" value={position.experience} />
                <MetaItem
                  icon={GraduationCap}
                  label="Qualification"
                  value={position.qualification}
                />
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-10 pb-28 md:py-14 md:pb-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-14">
          <article className="min-w-0">
            {position.description ? (
              <ContentSection title="About the role">
                <p className="prose-copy whitespace-pre-line text-[15px] leading-8 text-[#333333]">
                  {position.description}
                </p>
              </ContentSection>
            ) : null}

            {splitLines(position.responsibilities).length ? (
              <ContentSection title="What you will do">
                <ul className="space-y-3">
                  {splitLines(position.responsibilities).map((line) => (
                    <li key={line} className="flex gap-3 text-[14px] leading-7 text-[#333333]">
                      <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </ContentSection>
            ) : null}

            {splitLines(position.requirements).length ? (
              <ContentSection title="What we are looking for">
                <ul className="space-y-3">
                  {splitLines(position.requirements).map((line) => (
                    <li key={line} className="flex gap-3 text-[14px] leading-7 text-[#333333]">
                      <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-ink" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </ContentSection>
            ) : null}

            {details.length ? (
              <ContentSection title="Job details">
                <dl className="grid border-l border-t border-line sm:grid-cols-2">
                  {details.map((detail) => (
                    <div
                      key={detail.id}
                      className={cn(
                        "border-b border-r border-line p-4",
                        detail.type === "long_text" && "sm:col-span-2",
                      )}
                    >
                      <dt className="text-[10px] uppercase tracking-[0.11em] text-muted">
                        {detail.label}
                      </dt>
                      <dd className="mt-1.5 whitespace-pre-line text-[13px] leading-6 text-ink">
                        <DetailValue detail={detail} />
                      </dd>
                    </div>
                  ))}
                </dl>
              </ContentSection>
            ) : null}

            <div className="mt-10 flex flex-col gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">Ready to apply?</p>
                <p className="mt-1 text-[12px] text-muted">
                  {canApply
                    ? "The form takes about five minutes and does not require an account."
                    : "This role is not accepting applications at the moment."}
                </p>
              </div>
              {canApply ? (
                <Link
                  href={`/jobs/${position.id}/apply`}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
                >
                  Apply for this role
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/jobs"
                  className="inline-flex min-h-11 shrink-0 items-center justify-center border border-line px-5 text-sm font-medium transition-colors hover:border-ink"
                >
                  View other roles
                </Link>
              )}
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-[98px]">
              <div className="border border-line bg-white p-6">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      canApply ? "bg-[#1a7f4b]" : "bg-muted",
                    )}
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em]">
                    {statusText}
                  </p>
                </div>

                <p className="mt-4 text-[13px] leading-6 text-muted">
                  {canApply
                    ? "Applications are reviewed on a rolling basis. Shortlisted candidates are contacted using the details provided."
                    : "This position is no longer accepting new applications. Explore other open roles below."}
                </p>

                <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[12px] text-muted">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {deadlineLabel(position.deadline)}
                </div>

                {canApply ? (
                  <Link
                    href={`/jobs/${position.id}/apply`}
                    className="mt-5 flex min-h-11 w-full items-center justify-center gap-2 bg-brand px-5 text-sm font-medium text-white transition-colors hover:bg-brand-dark"
                  >
                    Apply now
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="mt-5 flex min-h-11 w-full items-center justify-center border border-line bg-surface px-5 text-sm font-medium text-muted"
                  >
                    Applications closed
                  </button>
                )}

                <p className="mt-3 text-center text-[10px] uppercase tracking-[0.08em] text-muted">
                  No account needed · Mobile friendly
                </p>

                <div className="mt-5 border-t border-line pt-4">
                  <p className="text-[11px] text-muted">Questions about this role?</p>
                  <a
                    href={`mailto:${settings.contact_email}`}
                    className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium underline decoration-line underline-offset-2 hover:text-brand"
                  >
                    <Mail className="h-3 w-3" />
                    {settings.contact_email}
                  </a>
                </div>
              </div>

              <p className="mt-4 px-1 text-[11px] leading-5 text-muted">
                Malati Group is an equal opportunity employer. We evaluate
                applications on experience, capability and fit for the role.
              </p>
            </div>
          </aside>
        </div>

        {related.length ? (
          <section className="mt-16 border-t border-line pt-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow text-brand">Keep exploring</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-[-0.025em]">
                  Similar open roles
                </h2>
              </div>
              <Link
                href="/jobs"
                className="hidden items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-ink sm:inline-flex"
              >
                All positions <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="mt-5 border-t border-line">
              {related.map((job, index) => (
                <JobRow key={job.id} job={job} index={index + 1} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-white px-5 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-[11px] font-medium text-ink">{position.title}</p>
            <p className="mt-0.5 text-[10px] text-muted">{deadlineLabel(position.deadline)}</p>
          </div>
          {canApply ? (
            <Link
              href={`/jobs/${position.id}/apply`}
              className="inline-flex min-h-11 shrink-0 items-center gap-2 bg-brand px-5 text-[13px] font-medium text-white"
            >
              Apply now <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <span className="inline-flex min-h-11 shrink-0 items-center border border-line bg-surface px-4 text-[12px] text-muted">
              Closed
            </span>
          )}
        </div>
      </div>
    </>
  );
}
