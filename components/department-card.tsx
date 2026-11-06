import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import type { Department } from "@/lib/types";

export function DepartmentCard({
  department,
  index,
  openCount,
}: {
  department: Department;
  index: number;
  openCount: number;
}) {
  return (
    <Link
      href={`/departments/${department.id}`}
      className="group relative flex min-h-[214px] flex-col justify-between border border-line bg-white p-6 transition-colors hover:border-ink"
    >
      <div className="flex items-start justify-between">
        <span className="font-mono text-[11px] tabular-nums text-muted">
          {String(index).padStart(2, "0")}
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand" />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium tracking-[-0.015em] text-ink transition-colors group-hover:text-brand">
          {department.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13px] leading-6 text-muted">
          {department.description}
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
        <span className="text-[11px] uppercase tracking-[0.1em] text-muted">
          {openCount === 1 ? "1 open role" : `${openCount} open roles`}
        </span>
        <span className="h-1.5 w-1.5 rounded-full bg-line transition-colors group-hover:bg-brand" />
      </div>
    </Link>
  );
}
