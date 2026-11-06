"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Archive,
  CheckSquare,
  Download,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  FolderDown,
  Loader2,
  RefreshCw,
  Search,
  Square,
} from "lucide-react";

import { ApplicantStatusPill } from "@/components/admin/status-pill";
import type { ApplicationWithJob } from "@/lib/data/applications";
import type { ApplicationStatus, Position } from "@/lib/types";
import { formatDate } from "@/lib/utils";

interface BulkDownloadManagerProps {
  applications: ApplicationWithJob[];
  positions: Position[];
  departments: string[];
  statuses: ApplicationStatus[];
}

export function BulkDownloadManager({
  applications,
  positions,
  departments,
  statuses,
}: BulkDownloadManagerProps) {
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedPos, setSelectedPos] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedExpType, setSelectedExpType] = useState("");

  // Set of selected application IDs
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    () => new Set(applications.filter((a) => Boolean(a.cv_file_id)).map((a) => a.id)),
  );

  const [isDownloading, setIsDownloading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Filter positions by selected department if any
  const availablePositions = useMemo(() => {
    if (!selectedDept) return positions;
    return positions.filter((p) => p.department === selectedDept);
  }, [positions, selectedDept]);

  // Filtered applications based on active criteria
  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (selectedDept && app.position_department !== selectedDept) {
        return false;
      }
      if (selectedPos && app.position_id !== selectedPos) {
        return false;
      }
      if (selectedStatus && app.status.toUpperCase() !== selectedStatus.toUpperCase()) {
        return false;
      }
      if (selectedExpType) {
        const type = (app.experience_type || (app.experience?.toLowerCase().includes("fresher") ? "Fresher" : "Experienced")).toLowerCase();
        if (type !== selectedExpType.toLowerCase()) return false;
      }
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const haystack = [
          app.candidate_name,
          app.application_id,
          app.email,
          app.phone,
          app.location,
          app.position_title,
          app.position_department,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [applications, selectedDept, selectedPos, selectedStatus, selectedExpType, search]);

  const visibleApplicationsWithCv = useMemo(() => {
    return filteredApplications.filter((a) => Boolean(a.cv_file_id));
  }, [filteredApplications]);

  const totalWithCv = applications.filter((a) => Boolean(a.cv_file_id)).length;

  const isAllVisibleSelected =
    visibleApplicationsWithCv.length > 0 &&
    visibleApplicationsWithCv.every((app) => selectedIds.has(app.id));

  function toggleSelectAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (isAllVisibleSelected) {
        // Unselect all currently visible
        for (const app of visibleApplicationsWithCv) {
          next.delete(app.id);
        }
      } else {
        // Select all currently visible
        for (const app of visibleApplicationsWithCv) {
          next.add(app.id);
        }
      }
      return next;
    });
  }

  function selectEntireDatabaseCvs() {
    const allCvs = applications.filter((a) => Boolean(a.cv_file_id)).map((a) => a.id);
    setSelectedIds(new Set(allCvs));
  }

  function clearAllSelections() {
    setSelectedIds(new Set());
  }

  function toggleRow(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  async function handleDownload() {
    setIsDownloading(true);
    setErrorMessage(null);

    try {
      const payload: {
        applicationIds: string[];
        all: boolean;
      } = {
        applicationIds: Array.from(selectedIds),
        all: selectedIds.size === totalWithCv && totalWithCv > 0,
      };

      const response = await fetch("/api/admin/applications/bulk-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let msg = "Failed to generate bulk package.";
        try {
          const json = await response.json();
          if (json.error) msg = json.error;
        } catch {
          // ignore
        }
        throw new Error(msg);
      }

      // Extract filename from Content-Disposition header if available
      const disposition = response.headers.get("Content-Disposition");
      let filename = `Malati_Recruitment_Export_${new Date().toISOString().slice(0, 10)}.zip`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^";]+)"?/);
        if (match && match[1]) filename = match[1];
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Bulk download error:", err);
      setErrorMessage(
        err instanceof Error ? err.message : "An unexpected error occurred during download.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Informational Banner */}
      <div className="admin-card border-brand/30 bg-brand/5 p-4 md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-ink font-semibold text-[14px]">
              <FileSpreadsheet className="h-4 w-4 text-brand" />
              <span>Full Master Sheet Included in Every Export</span>
            </div>
            <p className="text-[12px] leading-relaxed text-muted">
              Every download package always includes the complete master applicant spreadsheet (
              <span className="font-mono text-ink">Applicants_Master_Export_YYYY-MM-DD_HH-mm-ss.csv</span>
              ) containing all applicant records. Individual CVs are packaged in the <span className="font-mono text-ink">CVs/</span> folder formatted as <span className="font-mono text-ink">&lt;name&gt;_&lt;applicantid&gt;.pdf</span>.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn btn-primary min-w-[240px] shrink-0 justify-center py-2.5 text-[13px] shadow-sm"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Packaging ZIP Archive...
              </>
            ) : (
              <>
                <FolderDown className="h-4 w-4 mr-2" />
                Download Package ({selectedIds.size} CV{selectedIds.size === 1 ? "" : "s"} + Full Sheet)
              </>
            )}
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded border border-red-200 bg-red-50 p-4 text-[12.5px] text-red-700">
          <strong>Download Error: </strong> {errorMessage}
        </div>
      )}

      {/* Filter and Selection Controls */}
      <div className="admin-card p-4 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            <input
              type="search"
              placeholder="Search name, ID, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9 text-[12.5px]"
            />
          </div>

          {/* Department / Category Filter */}
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value);
              setSelectedPos("");
            }}
            className="select text-[12.5px]"
          >
            <option value="">All Departments (Categories)</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Position Filter */}
          <select
            value={selectedPos}
            onChange={(e) => setSelectedPos(e.target.value)}
            className="select text-[12.5px]"
          >
            <option value="">All Positions</option>
            {availablePositions.map((pos) => (
              <option key={pos.id} value={pos.id}>
                {pos.title}
              </option>
            ))}
          </select>

          {/* Experience Type Filter */}
          <select
            value={selectedExpType}
            onChange={(e) => setSelectedExpType(e.target.value)}
            className="select text-[12.5px]"
          >
            <option value="">All Experience Types</option>
            <option value="Fresher">Fresher</option>
            <option value="Experienced">Experienced</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="select text-[12.5px]"
          >
            <option value="">All Statuses</option>
            {statuses.map((st) => (
              <option key={st.id} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Selection Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line/60 pt-3 text-[12px]">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={toggleSelectAllVisible}
              className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
            >
              {isAllVisibleSelected ? (
                <>
                  <Square className="h-3.5 w-3.5" />
                  Deselect Visible ({visibleApplicationsWithCv.length})
                </>
              ) : (
                <>
                  <CheckSquare className="h-3.5 w-3.5" />
                  Select Visible ({visibleApplicationsWithCv.length})
                </>
              )}
            </button>

            <button
              type="button"
              onClick={selectEntireDatabaseCvs}
              className="btn btn-secondary btn-sm inline-flex items-center gap-1.5"
            >
              <CheckSquare className="h-3.5 w-3.5 text-brand" />
              Select All in System ({totalWithCv})
            </button>

            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={clearAllSelections}
                className="btn btn-ghost btn-sm text-muted hover:text-ink"
              >
                Clear Selection
              </button>
            )}
          </div>

          <div className="text-[12px] text-muted">
            <span className="font-semibold text-ink">{selectedIds.size}</span> of{" "}
            <span className="font-semibold text-ink">{totalWithCv}</span> available CVs selected
            {filteredApplications.length !== applications.length && (
              <span className="ml-1 text-muted">
                (showing {filteredApplications.length} candidate{filteredApplications.length === 1 ? "" : "s"})
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Applications Table */}
      {filteredApplications.length > 0 ? (
        <div className="admin-card overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th className="w-10">
                  <input
                    type="checkbox"
                    checked={isAllVisibleSelected}
                    onChange={toggleSelectAllVisible}
                    aria-label="Select all visible candidates"
                    className="h-4 w-4 rounded border-line text-brand focus:ring-brand"
                  />
                </th>
                <th>Candidate</th>
                <th>Position & Department</th>
                <th>Experience</th>
                <th>Compensation</th>
                <th>Status</th>
                <th>Applied On</th>
                <th className="text-right">CV</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app) => {
                const hasCv = Boolean(app.cv_file_id);
                const isSelected = selectedIds.has(app.id);
                const expType =
                  app.experience_type ||
                  (app.experience?.toLowerCase().includes("fresher")
                    ? "Fresher"
                    : "Experienced");

                return (
                  <tr
                    key={app.id}
                    className={`transition-colors ${
                      isSelected ? "bg-brand/[0.03]" : ""
                    }`}
                  >
                    <td>
                      <input
                        type="checkbox"
                        disabled={!hasCv}
                        checked={isSelected}
                        onChange={() => toggleRow(app.id)}
                        aria-label={`Select ${app.candidate_name}`}
                        className="h-4 w-4 rounded border-line text-brand focus:ring-brand disabled:opacity-30"
                      />
                    </td>
                    <td className="min-w-[200px]">
                      <Link
                        href={`/admin/applicants/${app.id}`}
                        className="text-[12.5px] font-medium text-ink transition-colors hover:text-brand"
                      >
                        {app.candidate_name || "Unnamed"}
                      </Link>
                      <p className="mt-0.5 text-[10.5px] text-muted">
                        {app.email} · {app.phone}
                      </p>
                      <p className="mt-0.5 font-mono text-[10px] text-muted">
                        {app.application_id}
                      </p>
                    </td>
                    <td className="min-w-[180px]">
                      <p className="text-[12px] font-medium">{app.position_title}</p>
                      <p className="text-[10.5px] text-muted">{app.position_department}</p>
                    </td>
                    <td className="min-w-[140px]">
                      <span className="inline-block text-[11px] font-medium text-ink">
                        {expType}
                      </span>
                      {expType === "Experienced" && app.experience_years ? (
                        <p className="text-[10.5px] text-muted">
                          {app.experience_years} yrs exp
                        </p>
                      ) : null}
                      {app.notice_period ? (
                        <p className="text-[10px] text-muted">Notice: {app.notice_period}</p>
                      ) : null}
                    </td>
                    <td className="min-w-[150px] text-[11px]">
                      {expType === "Fresher" ? (
                        <span className="text-muted">Fresher (N/A)</span>
                      ) : (
                        <>
                          <p className="text-ink">CTC: {app.current_ctc || "—"}</p>
                          <p className="text-muted text-[10px]">
                            Exp Gross: {app.expected_gross || "—"}
                          </p>
                        </>
                      )}
                    </td>
                    <td>
                      <ApplicantStatusPill status={app.status} />
                    </td>
                    <td className="whitespace-nowrap text-[11px]">
                      {formatDate(app.created_at)}
                    </td>
                    <td className="text-right">
                      {hasCv ? (
                        <a
                          href={`/api/admin/applications/${app.id}/cv`}
                          target="_blank"
                          rel="noreferrer"
                          title="Download single CV"
                          className="inline-flex min-h-7 items-center gap-1 border border-line px-2 text-[10px] font-medium transition-colors hover:border-ink"
                        >
                          <FileText className="h-3 w-3" />
                          CV
                        </a>
                      ) : (
                        <span className="text-[10px] text-muted">No CV</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="admin-card p-12 text-center text-muted">
          <Archive className="mx-auto h-8 w-8 opacity-40 mb-2" />
          <p className="font-semibold text-ink text-[14px]">No applicants found</p>
          <p className="text-[12px] mt-1">Try clearing or adjusting your search filters.</p>
        </div>
      )}

      {/* Floating Bottom Action Bar for Quick Download */}
      {selectedIds.size > 0 && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-lg border border-brand/40 bg-white/95 px-5 py-3 shadow-lg backdrop-blur md:px-6">
          <div className="text-[12.5px]">
            <strong className="text-ink font-semibold">{selectedIds.size} CVs selected</strong>
            <span className="text-muted ml-2 hidden sm:inline">
              + Full Master CSV sheet will be packaged into ZIP
            </span>
          </div>

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="btn btn-primary btn-sm inline-flex items-center gap-2 px-4 shadow-sm"
          >
            {isDownloading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Packaging ZIP...
              </>
            ) : (
              <>
                <Download className="h-3.5 w-3.5" />
                Download Package ({selectedIds.size} CVs + Sheet)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}