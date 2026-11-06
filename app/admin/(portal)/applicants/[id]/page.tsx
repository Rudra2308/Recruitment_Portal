import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  Download,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { ApplicantStatusPill } from "@/components/admin/status-pill";
import { PageHeader, SectionCard } from "@/components/admin/ui";
import { CopyButton } from "@/components/copy-button";
import { updateApplicantStatusAction } from "@/app/admin/actions";
import { getApplicationById } from "@/lib/data/applications";
import { getAllStatuses } from "@/lib/data/config";
import { getPositionById } from "@/lib/data/jobs";
import type { FieldType } from "@/lib/types";
import {
  formatDate,
  formatDateTime,
  relativeTime,
} from "@/lib/utils";

export const dynamic = "force-dynamic";

interface DisplayField {
  key: string;
  label: string;
  type: FieldType;
  section: string;
  options: { label: string; value: string }[];
}

function humaniseKey(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function displayValue(field: DisplayField, value: unknown): string {
  if (field.type === "checkbox") return value === true ? "Yes" : "No";
  if (value === true) return "Yes";
  if (value === false) return "No";
  if (value === null || value === undefined || value === "") return "";
  if (field.type === "select" || field.type === "radio") {
    const option = field.options.find((item) => item.value === String(value));
    if (option) return option.label;
  }
  return String(value);
}

export default async function ApplicantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const application = await getApplicationById(id);
  if (!application) notFound();

  const [position, statuses] = await Promise.all([
    getPositionById(application.position_id),
    getAllStatuses(),
  ]);

  const activeStatuses = statuses.filter((status) => status.active);
  const statusOptions = activeStatuses.length ? activeStatuses : statuses;
  const hasCurrent = statusOptions.some(
    (status) => status.name === application.status,
  );

  const snapshotFields: DisplayField[] = (application.form_snapshot?.fields ?? []).map(
    (field) => ({
      key: field.key,
      label: field.label,
      type: field.type,
      section: field.section || "Application",
      options: field.options ?? [],
    }),
  );

  if (!snapshotFields.length) {
    snapshotFields.push(
      { key: "candidate_name", label: "Full name", type: "text", section: "Personal", options: [] },
      { key: "email", label: "Email", type: "email", section: "Personal", options: [] },
      { key: "phone", label: "Phone", type: "phone", section: "Personal", options: [] },
      { key: "location", label: "Location", type: "text", section: "Personal", options: [] },
      { key: "experience", label: "Experience", type: "text", section: "Professional", options: [] },
      { key: "qualification", label: "Qualification", type: "text", section: "Professional", options: [] },
      { key: "additional_info", label: "Additional information", type: "textarea", section: "Professional", options: [] },
    );
  }

  const knownKeys = new Set(snapshotFields.map((field) => field.key));
  const extraFields: DisplayField[] = Object.keys(application.payload)
    .filter((key) => !knownKeys.has(key))
    .map((key) => ({
      key,
      label: humaniseKey(key),
      type: "text" as FieldType,
      section: "Additional",
      options: [],
    }));

  const allFields = [...snapshotFields, ...extraFields];
  const sections = Array.from(new Set(allFields.map((field) => field.section)));

  const history = [...application.status_history].sort(
    (a, b) => Date.parse(b.at || "1970-01-01") - Date.parse(a.at || "1970-01-01"),
  );

  return (
    <>
      <PageHeader
        eyebrow="Applicant"
        title={application.candidate_name || "Unnamed applicant"}
        description={`${position?.title ?? "Removed position"} · Applied ${formatDate(
          application.created_at,
        )} · ${application.application_id}`}
        actions={
          <>
            <Link href="/admin/applicants" className="btn btn-outline btn-sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              Applicants
            </Link>
            {application.cv_file_id ? (
              <a
                href={`/api/admin/applications/${application.id}/cv`}
                className="btn btn-secondary btn-sm"
              >
                <Download className="h-3.5 w-3.5" />
                Download CV
              </a>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <SectionCard
            title="Application details"
            description="Answers are shown exactly as submitted, including fields that have since been removed from the form."
            bodyClassName="p-0"
          >
            <div className="divide-y divide-line">
              {sections.map((section) => (
                <div key={section} className="px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
                    {section}
                  </p>
                  <dl className="mt-3 space-y-3">
                    {allFields
                      .filter((field) => field.section === section)
                      .map((field) => {
                        const value = displayValue(
                          field,
                          application.payload[field.key],
                        );
                        return (
                          <div
                            key={field.key}
                            className="grid gap-1 sm:grid-cols-[190px_1fr] sm:gap-5"
                          >
                            <dt className="text-[11px] text-muted">{field.label}</dt>
                            <dd
                              className={
                                value
                                  ? "whitespace-pre-line break-words text-[12.5px] leading-6 text-ink"
                                  : "text-[12.5px] italic text-muted/70"
                              }
                            >
                              {value || "Not provided"}
                            </dd>
                          </div>
                        );
                      })}
                  </dl>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="Status history"
            description="Every pipeline change, with the administrator who made it."
            bodyClassName="p-5"
          >
            {history.length ? (
              <ol className="relative space-y-5 border-l border-line pl-5">
                {history.map((entry, index) => (
                  <li key={`${entry.status}-${entry.at}-${index}`} className="relative">
                    <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full border border-line bg-white" />
                    <div className="flex flex-wrap items-center gap-2">
                      <ApplicantStatusPill status={entry.status} />
                      <span className="text-[10px] text-muted">
                        {formatDateTime(entry.at)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-muted">
                      Changed by {entry.by || "System"}
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[12px] text-muted">No status history recorded.</p>
            )}
          </SectionCard>
        </div>

        <aside className="space-y-4">
          <SectionCard
            title="Applicant status"
            description="Changes are audited and can trigger an email."
          >
            <ActionForm
              action={updateApplicantStatusAction}
              submitLabel="Update status"
              size="sm"
              className="space-y-3"
              footerClassName="mt-3"
            >
              <input type="hidden" name="application_id" value={application.id} />
              <div>
                <label htmlFor="status" className="label">
                  Current status
                </label>
                <select
                  id="status"
                  name="status"
                  defaultValue={application.status}
                  className="select"
                >
                  {!hasCurrent ? (
                    <option value={application.status}>{application.status}</option>
                  ) : null}
                  {statusOptions.map((status) => (
                    <option key={status.id} value={status.name}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>
            </ActionForm>
            <p className="mt-3 border-t border-line pt-3 text-[10px] leading-5 text-muted">
              Status emails are sent only when SMTP is enabled. The application is
              saved regardless.
            </p>
          </SectionCard>

          <SectionCard title="Contact">
            <ul className="space-y-3 text-[12px]">
              <li>
                <a
                  href={`mailto:${application.email}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-brand"
                >
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                  <span className="break-all">{application.email || "Not provided"}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${application.phone.replace(/\s+/g, "")}`}
                  className="flex items-start gap-2.5 transition-colors hover:text-brand"
                >
                  <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                  <span>{application.phone || "Not provided"}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted" />
                <span>{application.location || "Not provided"}</span>
              </li>
            </ul>
          </SectionCard>

          <SectionCard title="Application">
            <dl className="space-y-3 text-[11px]">
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Reference</dt>
                <dd className="flex items-center gap-2 font-mono text-[10px] font-medium">
                  {application.application_id}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Received</dt>
                <dd className="text-right text-[11px]">
                  {formatDateTime(application.created_at)}
                  <span className="mt-0.5 block text-[10px] text-muted">
                    {relativeTime(application.created_at)}
                  </span>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Position</dt>
                <dd className="max-w-[65%] text-right text-[11px]">
                  {position ? (
                    <Link
                      href={`/admin/jobs/${position.id}`}
                      className="underline decoration-line underline-offset-2 hover:text-brand"
                    >
                      {position.title}
                    </Link>
                  ) : (
                    "Removed position"
                  )}
                  <span className="mt-0.5 block text-[10px] text-muted">
                    {position?.department ?? application.position_id}
                  </span>
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="text-muted">Source</dt>
                <dd className="text-right text-[11px]">Public portal</dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-line pt-3">
              <CopyButton
                value={application.application_id}
                label="Copy reference"
                className="inline-flex min-h-8 w-full items-center justify-center gap-1.5 border border-line px-3 text-[11px] font-medium transition-colors hover:border-ink"
              />
            </div>
          </SectionCard>

          <SectionCard title="CV">
            {application.cv_file_id ? (
              <div>
                <div className="flex items-start gap-2.5">
                  <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                  <div className="min-w-0">
                    <p className="break-all text-[12px] font-medium">
                      {application.cv_filename || "Candidate CV"}
                    </p>
                    <p className="mt-0.5 text-[10px] text-muted">Stored privately</p>
                  </div>
                </div>
                <a
                  href={`/api/admin/applications/${application.id}/cv`}
                  className="mt-3 inline-flex min-h-9 w-full items-center justify-center gap-1.5 border border-ink bg-ink px-3 text-[11px] font-medium text-white transition-colors hover:bg-black"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download securely
                </a>
              </div>
            ) : (
              <p className="text-[12px] text-muted">No CV was uploaded.</p>
            )}
            <p className="mt-3 flex items-start gap-1.5 border-t border-line pt-3 text-[10px] leading-5 text-muted">
              <ShieldCheck className="mt-0.5 h-3 w-3 shrink-0" />
              CV access requires an authenticated admin session.
            </p>
          </SectionCard>

          <div className="flex items-center gap-2 px-1 text-[10px] text-muted">
            <CalendarDays className="h-3.5 w-3.5" />
            Application ID {application.id.slice(0, 8)}…
          </div>
        </aside>
      </div>
    </>
  );
}
