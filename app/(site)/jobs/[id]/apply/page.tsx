import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { ApplicationForm } from "@/components/application-form";
import { getCvAcceptAttribute, getCvMaxBytes } from "@/lib/config";
import { resolveFormFields } from "@/lib/data/config";
import { getPublicPositionById, isJobLive } from "@/lib/data/jobs";
import { getSettings } from "@/lib/data/settings";
import { deadlineLabel } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const position = await getPublicPositionById(id);
  return {
    title: position ? `Apply — ${position.title}` : "Apply",
    description: position?.description.slice(0, 160),
  };
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [position, settings] = await Promise.all([
    getPublicPositionById(id),
    getSettings(),
  ]);

  if (!position) notFound();
  if (!isJobLive(position) || settings.recruitment_status !== "OPEN") {
    redirect(`/jobs/${position.id}`);
  }

  const fields = await resolveFormFields(position.id);
  const cvMaxMb = Math.round(getCvMaxBytes() / (1024 * 1024));
  const hasFile = fields.some((field) => field.type === "file");

  return (
    <div className="container-page py-10 md:py-14">
      <Link
        href={`/jobs/${position.id}`}
        className="inline-flex items-center gap-2 text-[12px] text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to job details
      </Link>

      <header className="mt-7 border-b border-line pb-8">
        <p className="eyebrow text-brand">Application</p>
        <h1 className="mt-3 max-w-3xl text-[32px] font-semibold leading-[1.1] tracking-[-0.035em] md:text-[44px]">
          Apply for {position.title}
        </h1>
        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {position.location}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            {position.experience || "Experience flexible"}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5" />
            {deadlineLabel(position.deadline)}
          </span>
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-12">
        <div>
          {fields.length ? (
            <ApplicationForm
              jobId={position.id}
              jobTitle={position.title}
              fields={fields}
              cvAccept={getCvAcceptAttribute()}
              cvMaxMb={cvMaxMb}
            />
          ) : (
            <div className="border border-line p-8">
              <p className="text-sm font-medium">This application form is not ready.</p>
              <p className="mt-2 text-sm text-muted">
                The recruitment team is still configuring the form. Please contact{" "}
                <a href={`mailto:${settings.contact_email}`} className="underline">
                  {settings.contact_email}
                </a>
                .
              </p>
            </div>
          )}
        </div>

        <aside className="order-first lg:order-last">
          <div className="sticky top-[98px] space-y-4">
            <div className="border border-line bg-white p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                You are applying for
              </p>
              <h2 className="mt-2 text-[15px] font-medium leading-6">
                {position.title}
              </h2>
              <dl className="mt-4 space-y-2.5 border-t border-line pt-4 text-[12px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Department</dt>
                  <dd className="text-right font-medium">{position.department}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Location</dt>
                  <dd className="text-right font-medium">{position.location}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Type</dt>
                  <dd className="text-right font-medium">{position.employment_type}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Experience</dt>
                  <dd className="text-right font-medium">{position.experience || "—"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted">Deadline</dt>
                  <dd className="text-right font-medium">{deadlineLabel(position.deadline)}</dd>
                </div>
              </dl>
            </div>

            <div className="border border-line bg-surface p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                Before you start
              </p>
              <ul className="mt-3 space-y-2.5 text-[12px] leading-5 text-muted">
                {hasFile ? (
                  <li className="flex gap-2">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                    Keep your CV ready. PDF, DOC or DOCX up to {cvMaxMb} MB.
                  </li>
                ) : null}
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                  The form takes about five minutes and saves nothing until you submit.
                </li>
                <li className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" />
                  Applications are reviewed on a rolling basis.
                </li>
              </ul>
            </div>

            <div className="flex items-start gap-3 px-1 text-[11px] leading-5 text-muted">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <p>
                Your CV is stored privately. Only the Malati Group recruitment
                team can access it.
              </p>
            </div>

            <div className="border-t border-line px-1 pt-4 text-[11px] leading-5 text-muted">
              Need help?{" "}
              <a
                href={`mailto:${settings.contact_email}`}
                className="font-medium text-ink underline decoration-line underline-offset-2 hover:text-brand"
              >
                {settings.contact_email}
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
