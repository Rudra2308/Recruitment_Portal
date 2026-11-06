import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { deadlineLabel, daysUntil } from "@/lib/utils";
import type { Position } from "@/lib/types";
import { cn } from "@/lib/utils";

export function JobRow({
  job,
  index,
  showDepartment = true,
}: {
  job: Position;
  index?: number;
  showDepartment?: boolean;
}) {
  const days = daysUntil(job.deadline);
  const closingSoon = days !== null && days >= 0 && days <= 7;

  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group grid grid-cols-[1fr_auto] items-start gap-x-5 gap-y-2 border-b border-line py-6 transition-colors hover:bg-[#fcfcfc] md:grid-cols-[36px_1fr_190px_24px] md:items-center md:py-7"
    >
      {typeof index === "number" ? (
        <span className="hidden pt-1 font-mono text-[11px] tabular-nums text-muted md:block">
          {String(index).padStart(2, "0")}
        </span>
      ) : (
        <span className="hidden md:block" />
      )}

      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3 className="text-[17px] font-medium tracking-[-0.01em] text-ink transition-colors group-hover:text-brand md:text-lg">
            {job.title}
          </h3>
          {closingSoon ? (
            <span className="badge badge-warning">Closing soon</span>
          ) : null}
        </div>
        <p className="mt-1.5 text-xs leading-5 text-muted">
          {showDepartment ? (
            <>
              <span>{job.department}</span>
              <span className="mx-1.5 text-line">·</span>
            </>
          ) : null}
          <span>{job.location}</span>
          <span className="mx-1.5 text-line">·</span>
          <span>{job.employment_type}</span>
        </p>
      </div>

      <div className="hidden text-right md:block">
        <p className="text-xs font-medium text-ink">{job.experience || "—"}</p>
        <p
          className={cn(
            "mt-1 text-[11px]",
            closingSoon ? "text-warning" : "text-muted",
          )}
        >
          {deadlineLabel(job.deadline)}
        </p>
      </div>

      <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand md:mt-0" />
    </Link>
  );
}
