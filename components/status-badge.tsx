import Link from "next/link";

import { JOB_STATUS_LABELS, jobStatusTone } from "@/lib/data/jobs";
import type { JobStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export function JobStatusBadge({ status }: { status: JobStatus }) {
  const tone = jobStatusTone(status);
  return (
    <span
      className={cn(
        "badge",
        tone === "success" && "badge-success",
        tone === "danger" && "badge-brand",
        tone === "muted" && "badge-muted",
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "OPEN" && "bg-success",
          status === "DRAFT" && "bg-muted",
          status === "CLOSED" && "bg-brand",
        )}
      />
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="border border-dashed border-line bg-[#fcfcfc] px-6 py-16 text-center">
      <p className="text-sm font-medium text-ink">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-6 inline-flex min-h-11 items-center border border-ink px-5 text-[13px] font-medium transition-colors hover:bg-ink hover:text-white"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
