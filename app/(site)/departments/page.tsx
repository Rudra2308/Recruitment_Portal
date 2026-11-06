import type { Metadata } from "next";

import { DepartmentCard } from "@/components/department-card";
import { EmptyState } from "@/components/status-badge";
import { getActiveDepartments } from "@/lib/data/departments";
import { getDepartmentJobCounts, getPublicPositions } from "@/lib/data/jobs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Departments",
  description:
    "Explore the departments hiring at Malati Group — foundry, machine shop, quality, supply chain, HR, IT and more.",
};

export default async function DepartmentsPage() {
  const [departments, counts, positions] = await Promise.all([
    getActiveDepartments(),
    getDepartmentJobCounts(),
    getPublicPositions(),
  ]);

  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-3xl">
        <p className="eyebrow text-brand">Departments</p>
        <h1 className="display mt-4 text-[40px] md:text-[56px]">
          Where you could work.
        </h1>
        <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted md:text-base">
          Malati Group brings together foundry, machining, quality and business
          functions under one roof. Choose a department to see its open roles and
          what the team does.
        </p>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3 border-y border-line py-4 text-[12px] text-muted">
        <span>
          <strong className="font-semibold text-ink">{departments.length}</strong>{" "}
          departments
        </span>
        <span>
          <strong className="font-semibold text-ink">{positions.length}</strong>{" "}
          open positions
        </span>
        <span>Applications reviewed on a rolling basis</span>
      </div>

      {departments.length ? (
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((department, index) => (
            <DepartmentCard
              key={department.id}
              department={department}
              index={index + 1}
              openCount={counts[department.id]?.open ?? 0}
            />
          ))}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            title="No departments published"
            description="The recruitment team is preparing department information. Please check back shortly."
            actionHref="/jobs"
            actionLabel="View all positions"
          />
        </div>
      )}
    </div>
  );
}
