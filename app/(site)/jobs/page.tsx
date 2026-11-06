import type { Metadata } from "next";

import { CandidateJobsBrowser } from "@/components/candidate-jobs-browser";
import { getActiveDepartments } from "@/lib/data/departments";
import { getPublicPositions } from "@/lib/data/jobs";
import { getSettings } from "@/lib/data/settings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Open positions",
  description:
    "Browse every open position at Malati Group. Filter by department and apply online.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ department?: string }>;
}) {
  const query = await searchParams;
  const departmentParam = (query.department ?? "").trim();

  const [positions, departments, settings] = await Promise.all([
    getPublicPositions(),
    getActiveDepartments(),
    getSettings(),
  ]);

  const isOpen = settings.recruitment_status === "OPEN";

  // If a department ID was passed in query, find its name for pre-selection
  const matchedDept = departments.find(
    (d) => d.id === departmentParam || d.name.toLowerCase() === departmentParam.toLowerCase(),
  );
  const initialDepartment = matchedDept ? matchedDept.name : "";

  return (
    <div className="container-page py-10 md:py-14">
      <div className="max-w-3xl mb-8">
        <p className="eyebrow text-brand">Current Intake</p>
        <h1 className="display mt-2 text-[36px] sm:text-[44px] md:text-[50px]">
          {isOpen ? "Explore Open Positions" : "Our Roles"}
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          {isOpen
            ? "Filter by department or search by title, qualification, or experience. Apply directly without creating an account."
            : "Recruitment is currently on hold. You can still review role requirements across our departments."}
        </p>
      </div>

      <CandidateJobsBrowser
        positions={positions}
        departments={departments}
        initialDepartment={initialDepartment}
      />
    </div>
  );
}
