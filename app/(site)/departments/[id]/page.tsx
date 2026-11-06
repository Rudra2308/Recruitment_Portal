import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { JobRow } from "@/components/job-row";
import { EmptyState } from "@/components/status-badge";
import { getActiveDepartments, getDepartmentById } from "@/lib/data/departments";
import { getPublicPositions } from "@/lib/data/jobs";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const department = await getDepartmentById(id);
  if (!department) return { title: "Department" };
  return {
    title: `${department.name} careers`,
    description: department.description,
  };
}

export default async function DepartmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [department, positions, departments] = await Promise.all([
    getDepartmentById(id),
    getPublicPositions(),
    getActiveDepartments(),
  ]);

  if (!department || !department.active) notFound();

  const departmentPositions = positions.filter(
    (position) =>
      position.department.toLowerCase() === department.name.toLowerCase(),
  );
  const otherDepartments = departments.filter(
    (item) => item.id !== department.id,
  );

  return (
    <div className="container-page py-10 md:py-14">
      <Link
        href="/departments"
        className="inline-flex items-center gap-2 text-[12px] text-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All departments
      </Link>

      <header className="mt-8 grid gap-8 border-b border-line pb-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="eyebrow text-brand">Department</p>
          <h1 className="display mt-4 text-[40px] md:text-[56px]">
            {department.name}
          </h1>
          <p className="mt-5 max-w-2xl text-[15px] leading-7 text-muted">
            {department.description}
          </p>
        </div>
        <div className="md:col-span-4 md:text-right">
          <p className="text-[42px] font-semibold leading-none tracking-[-0.05em]">
            {departmentPositions.length}
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.12em] text-muted">
            {departmentPositions.length === 1 ? "open role" : "open roles"}
          </p>
        </div>
      </header>

      <section className="mt-10">
        <h2 className="text-xl font-medium tracking-[-0.02em]">
          Open positions in {department.name}
        </h2>
        {departmentPositions.length ? (
          <div className="mt-5 border-t border-line">
            {departmentPositions.map((job, index) => (
              <JobRow key={job.id} job={job} index={index + 1} showDepartment={false} />
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState
              title="No open roles in this department"
              description="This team is not hiring publicly right now. Explore other departments or view all open positions."
              actionHref="/jobs"
              actionLabel="View all positions"
            />
          </div>
        )}
      </section>

      {otherDepartments.length ? (
        <section className="mt-14 border-t border-line pt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">Other departments</h2>
            <Link
              href="/departments"
              className="inline-flex items-center gap-1.5 text-[12px] text-muted transition-colors hover:text-ink"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {otherDepartments.map((item) => (
              <Link
                key={item.id}
                href={`/departments/${item.id}`}
                className="inline-flex min-h-10 items-center border border-line px-3.5 text-[12px] font-medium transition-colors hover:border-ink"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
