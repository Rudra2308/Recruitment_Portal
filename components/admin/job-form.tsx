import { ActionForm } from "@/components/admin/action-form";
import { SectionCard } from "@/components/admin/ui";
import { saveJobAction } from "@/app/admin/actions";
import { EMPLOYMENT_TYPES, JOB_STATUSES, JOB_STATUS_LABELS } from "@/lib/data/jobs";
import type { Department, Position } from "@/lib/types";

export function JobForm({
  position,
  departments,
  defaultLocation,
}: {
  position?: Position;
  departments: Department[];
  defaultLocation: string;
}) {
  return (
    <ActionForm
      action={saveJobAction}
      submitLabel={position ? "Save changes" : "Create job"}
      pendingLabel="Saving…"
      footerClassName="mt-4 flex flex-wrap items-center gap-3 border border-line bg-white px-4 py-3"
      align="between"
    >
      {position ? <input type="hidden" name="id" value={position.id} /> : null}

      <SectionCard
        title="Role basics"
        description="The essentials shown on the job card and detail page."
        className="mb-4"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label htmlFor="title" className="label">
              Job title <span className="text-brand">*</span>
            </label>
            <input
              id="title"
              name="title"
              required
              maxLength={160}
              defaultValue={position?.title ?? ""}
              className="input"
              placeholder="e.g. CNC & VMC Programmer"
            />
          </div>

          <div>
            <label htmlFor="department" className="label">
              Department <span className="text-brand">*</span>
            </label>
            <select
              id="department"
              name="department"
              required
              defaultValue={position?.department ?? ""}
              className="select"
            >
              <option value="">Select a department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.name}>
                  {department.name}
                  {department.active ? "" : " (inactive)"}
                </option>
              ))}
            </select>
            {!departments.length ? (
              <p className="hint text-brand">
                Create a department first before adding a job.
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="location" className="label">
              Location <span className="text-brand">*</span>
            </label>
            <input
              id="location"
              name="location"
              required
              maxLength={120}
              defaultValue={position?.location ?? defaultLocation}
              className="input"
              placeholder="Hatkanangale, Kolhapur"
            />
          </div>

          <div>
            <label htmlFor="employment_type" className="label">
              Employment type
            </label>
            <select
              id="employment_type"
              name="employment_type"
              defaultValue={position?.employment_type ?? "Full-time"}
              className="select"
            >
              {EMPLOYMENT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="experience" className="label">
              Experience
            </label>
            <input
              id="experience"
              name="experience"
              maxLength={160}
              defaultValue={position?.experience ?? ""}
              className="input"
              placeholder="e.g. 4–8 years"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="qualification" className="label">
              Qualification
            </label>
            <input
              id="qualification"
              name="qualification"
              maxLength={240}
              defaultValue={position?.qualification ?? ""}
              className="input"
              placeholder="e.g. B.E. / B.Tech in Mechanical or Production"
            />
          </div>

          <div>
            <label htmlFor="deadline" className="label">
              Application deadline
            </label>
            <input
              id="deadline"
              name="deadline"
              type="date"
              defaultValue={position?.deadline ?? ""}
              className="input"
            />
            <p className="hint">Leave blank to show &ldquo;Open until filled&rdquo;.</p>
          </div>

          <div>
            <label htmlFor="status" className="label">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={position?.status ?? "DRAFT"}
              className="select"
            >
              {JOB_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {JOB_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
            <p className="hint">Only Open jobs appear publicly.</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Job content"
        description="Plain text. Use one line per bullet for responsibilities and requirements."
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="description" className="label">
              About the role
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              maxLength={6000}
              defaultValue={position?.description ?? ""}
              className="textarea"
              placeholder="A short paragraph about the role and why it matters."
            />
          </div>
          <div>
            <label htmlFor="responsibilities" className="label">
              Responsibilities
            </label>
            <textarea
              id="responsibilities"
              name="responsibilities"
              rows={6}
              maxLength={6000}
              defaultValue={position?.responsibilities ?? ""}
              className="textarea font-mono text-[12.5px]"
              placeholder={"One responsibility per line.\nPlan and control daily machining production.\nImprove first-pass yield."}
            />
          </div>
          <div>
            <label htmlFor="requirements" className="label">
              Requirements
            </label>
            <textarea
              id="requirements"
              name="requirements"
              rows={6}
              maxLength={6000}
              defaultValue={position?.requirements ?? ""}
              className="textarea font-mono text-[12.5px]"
              placeholder={"One requirement per line.\n3–6 years in machine shop production.\nDegree in mechanical engineering."}
            />
          </div>
        </div>
      </SectionCard>
    </ActionForm>
  );
}
