import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  Eye,
  GraduationCap,
  MapPin,
} from "lucide-react";

import { JobStatusBadge } from "@/components/status-badge";
import { getJobDetailsForPosition } from "@/lib/data/config";
import { getPositionById, isJobLive } from "@/lib/data/jobs";
import { getSettings } from "@/lib/data/settings";
import type { JobDetail } from "@/lib/types";
import { cn, deadlineLabel, formatDate, splitLines } from "@/lib/utils";

export const dynamic = "force-dynamic";

function PreviewMeta({
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
        <p className="text-[10px] uppercase tracking-[0.11em] text-muted">{label}</p>
        <p className="mt-0.5 text-[13px] font-medium leading-5">{value}</p>
      </div>
    </div>
  );
}

function DetailValue({ detail }: { detail: JobDetail }) {
  if (!detail.value) return <span className="text-muted">—</span>;
  if (detail.type === "date") return <>{formatDate(detail.value)}</>;
  return <>{detail.value}</>;
}

export default async function JobPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [position, settings] = await Promise.all([
    getPositionById(id),
    getSettings(),
  ]);
  if (!position) notFound();

  const details = await getJobDetailsForPosition(position.id);
  const live = isJobLive(position);

  return (
    <div className="-mx-4 -my-6 md:-mx-7 md:-my-8">
      <div className="border-b border-[#ecdcb9] bg-[#fdf8ec] px-4 py-3 md:px-7">
        <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[11px] text-[#6b4a00]">
            <Eye className="h-3.5 w-3.5" />
            <span className="font-semibold uppercase tracking-[0.1em]">
              Preview mode
            </span>
            <span className="text-[#8a6a1f]">
              This page is not public and nobody else can see it.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/admin/jobs/${position.id}`}
              className="inline-flex min-h-8 items-center gap-1.5 border border-[#d9c58f] bg-white px-3 text-[11px] font-medium text-[#6b4a00]"
            >
              <ArrowLeft className="h-3 w-3" /> Back to editor
            </Link>
            {live ? (
              <Link
                href={`/jobs/${position.id}`}
                target="_blank"
                className="inline-flex min-h-8 items-center gap-1.5 bg-[#6b4a00] px-3 text-[11px] font-medium text-white"
              >
                Open live page
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-[1180px] px-4 py-10 md:px-7 md:py-14">
          <div className="flex flex-wrap items-center gap-2">
            <JobStatusBadge status={position.status} />
            <span className="badge badge-muted">{position.employment_type}</span>
            <span className="text-[11px] text-muted">
              Job ID <span className="font-mono text-ink">{position.id}</span>
            </span>
          </div>

          <p className="eyebrow mt-6 text-brand">{position.department}</p>
          <h1 className="display mt-3 max-w-[22ch] text-[38px] md:text-[54px]">
            {position.title}
          </h1>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 md:grid-cols-4">
            <PreviewMeta icon={MapPin} label="Location" value={position.location} />
            <PreviewMeta
              icon={BriefcaseBusiness}
              label="Employment"
              value={position.employment_type}
            />
            <PreviewMeta icon={Clock} label="Experience" value={position.experience} />
            <PreviewMeta
              icon={GraduationCap}
              label="Qualification"
              value={position.qualification}
            />
          </dl>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_320px]">
            <article>
              {position.description ? (
                <section className="border-b border-line pb-8">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">
                    About the role
                  </h2>
                  <p className="mt-4 whitespace-pre-line text-[15px] leading-8 text-[#333333]">
                    {position.description}
                  </p>
                </section>
              ) : null}

              {splitLines(position.responsibilities).length ? (
                <section className="border-b border-line py-8">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">
                    What you will do
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {splitLines(position.responsibilities).map((line) => (
                      <li key={line} className="flex gap-3 text-[14px] leading-7 text-[#333333]">
                        <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-brand" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {splitLines(position.requirements).length ? (
                <section className="border-b border-line py-8">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">
                    What we are looking for
                  </h2>
                  <ul className="mt-4 space-y-3">
                    {splitLines(position.requirements).map((line) => (
                      <li key={line} className="flex gap-3 text-[14px] leading-7 text-[#333333]">
                        <span className="mt-[11px] h-1 w-1 shrink-0 rounded-full bg-ink" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}

              {details.length ? (
                <section className="py-8">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.13em] text-muted">
                    Job details
                  </h2>
                  <dl className="mt-4 grid border-l border-t border-line sm:grid-cols-2">
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
                        <dd className="mt-1.5 whitespace-pre-line text-[13px] leading-6">
                          <DetailValue detail={detail} />
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ) : null}
            </article>

            <aside>
              <div className="sticky top-[90px] border border-line bg-white p-6">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      live ? "bg-[#1a7f4b]" : "bg-muted",
                    )}
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.1em]">
                    {live ? "Applications open" : "Not accepting applications"}
                  </p>
                </div>
                <p className="mt-4 text-[13px] leading-6 text-muted">
                  This is the candidate view. The apply action is disabled in preview
                  mode.
                </p>
                <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-[12px] text-muted">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {deadlineLabel(position.deadline)}
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-5 flex min-h-11 w-full items-center justify-center border border-line bg-surface px-5 text-sm font-medium text-muted"
                >
                  Apply (preview only)
                </button>
                <div className="mt-5 border-t border-line pt-4 text-[11px] text-muted">
                  Questions:{" "}
                  <span className="font-medium text-ink">{settings.contact_email}</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
