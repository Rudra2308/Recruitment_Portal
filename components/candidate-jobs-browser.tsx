"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, MapPin, Search, X } from "lucide-react";
import type { Department, Position } from "@/lib/types";

export function CandidateJobsBrowser({
  positions,
  departments,
  initialDepartment = "",
}: {
  positions: Position[];
  departments: Department[];
  initialDepartment?: string;
}) {
  const [selectedDept, setSelectedDept] = useState<string>(initialDepartment);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Count open jobs per department name
  const deptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of positions) {
      counts[p.department] = (counts[p.department] || 0) + 1;
    }
    return counts;
  }, [positions]);

  // Departments that actually have open jobs
  const activeDepartments = useMemo(() => {
    return departments.filter((d) => (deptCounts[d.name] || 0) > 0);
  }, [departments, deptCounts]);

  // Filter positions by search and department
  const filteredPositions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return positions.filter((job) => {
      const matchesDept = !selectedDept || job.department === selectedDept;
      const matchesSearch =
        !q ||
        job.title.toLowerCase().includes(q) ||
        job.department.toLowerCase().includes(q) ||
        job.experience.toLowerCase().includes(q) ||
        job.qualification.toLowerCase().includes(q) ||
        job.location.toLowerCase().includes(q);
      return matchesDept && matchesSearch;
    });
  }, [positions, selectedDept, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Search & Fast Filters */}
      <div className="space-y-4">
        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job role, skill, or qualification (e.g. CNC, Quality, Mechanical, Trainee)..."
            className="input min-h-12 pl-11 pr-10 text-[14px] shadow-xs"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Department Pills */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setSelectedDept("")}
            className={`shrink-0 rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
              selectedDept === ""
                ? "border-ink bg-ink text-white"
                : "border-line bg-white text-ink hover:border-ink/60 hover:bg-surface"
            }`}
          >
            All Roles ({positions.length})
          </button>
          {activeDepartments.map((dept) => {
            const count = deptCounts[dept.name] || 0;
            const isSelected = selectedDept === dept.name;
            return (
              <button
                key={dept.id}
                type="button"
                onClick={() => setSelectedDept(isSelected ? "" : dept.name)}
                className={`shrink-0 rounded-full border px-4 py-1.5 text-[12.5px] font-medium transition-colors ${
                  isSelected
                    ? "border-brand bg-brand text-white"
                    : "border-line bg-white text-ink hover:border-ink/60 hover:bg-surface"
                }`}
              >
                {dept.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between border-b border-line pb-3 text-[12px] text-muted">
        <p>
          Showing{" "}
          <strong className="font-semibold text-ink">
            {filteredPositions.length}
          </strong>{" "}
          {filteredPositions.length === 1 ? "opening" : "openings"}
          {selectedDept ? ` in ${selectedDept}` : ""}
          {searchQuery ? ` matching "${searchQuery}"` : ""}
        </p>
        {selectedDept || searchQuery ? (
          <button
            type="button"
            onClick={() => {
              setSelectedDept("");
              setSearchQuery("");
            }}
            className="text-brand underline hover:text-brand-dark"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      {/* Job Cards List */}
      {filteredPositions.length ? (
        <div className="divide-y divide-line border-t border-line">
          {filteredPositions.map((job) => (
            <div
              key={job.id}
              className="group flex flex-col justify-between gap-4 py-5 transition-colors hover:bg-[#fafafa] sm:flex-row sm:items-center sm:py-6"
            >
              <div className="min-w-0 flex-1 space-y-1.5 pr-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-[17px] font-semibold text-ink transition-colors hover:text-brand sm:text-[18px]"
                  >
                    {job.title}
                  </Link>
                  <span className="badge badge-muted text-[11px]">
                    {job.department}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </span>
                  <span>·</span>
                  <span>{job.employment_type}</span>
                  {job.experience ? (
                    <>
                      <span>·</span>
                      <span className="font-medium text-ink">
                        Exp: {job.experience}
                      </span>
                    </>
                  ) : null}
                  {job.qualification ? (
                    <>
                      <span>·</span>
                      <span>{job.qualification}</span>
                    </>
                  ) : null}
                </div>
              </div>

              {/* Actions */}
              <div className="flex shrink-0 items-center gap-2 sm:self-center">
                <Link
                  href={`/jobs/${job.id}`}
                  className="inline-flex min-h-10 items-center justify-center border border-line bg-white px-4 text-[12px] font-medium text-ink transition-colors hover:border-ink hover:bg-surface"
                >
                  Details
                </Link>
                <Link
                  href={`/jobs/${job.id}/apply`}
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 bg-brand px-5 text-[12px] font-medium text-white transition-colors hover:bg-brand-dark"
                >
                  Apply Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded border border-dashed border-line bg-surface/40 p-8 text-center">
          <p className="text-[14px] font-medium text-ink">
            No matching positions found
          </p>
          <p className="mt-1 text-[12px] text-muted">
            Try adjusting your search terms or clearing your department filter.
          </p>
          <button
            type="button"
            onClick={() => {
              setSelectedDept("");
              setSearchQuery("");
            }}
            className="mt-4 inline-flex min-h-9 items-center border border-ink px-4 text-[12px] font-medium transition-colors hover:bg-ink hover:text-white"
          >
            Show all {positions.length} openings
          </button>
        </div>
      )}
    </div>
  );
}
