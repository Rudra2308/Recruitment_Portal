import { ActionForm } from "@/components/admin/action-form";
import { SectionCard } from "@/components/admin/ui";
import {
  clearJobOverridesAction,
  saveJobOverrideAction,
} from "@/app/admin/actions";
import type { FormField, JobFormOverride } from "@/lib/types";

const ESSENTIAL = ["candidate_name", "email", "phone"];

export function FormOverridesEditor({
  positionId,
  fields,
  overrides,
}: {
  positionId: string;
  fields: FormField[];
  overrides: Record<string, JobFormOverride>;
}) {
  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <SectionCard
      title="Application form overrides"
      description="Override the global form for this job only. For example, require a CV for a technical role while keeping it optional elsewhere."
      action={
        hasOverrides ? (
          <ActionForm
            action={clearJobOverridesAction}
            submitLabel="Clear all overrides"
            variant="outline"
            size="xs"
            confirm="Remove every form override for this job?"
            showMessage={false}
            footerClassName="mt-0"
          >
            <input type="hidden" name="job_id" value={positionId} />
          </ActionForm>
        ) : undefined
      }
      bodyClassName="p-0"
    >
      {fields.length ? (
        <div className="divide-y divide-line">
          {fields.map((field) => {
            const override = overrides[field.id] ?? {};
            const essential = field.system_field && ESSENTIAL.includes(field.key);
            const requiredValue =
              override.required === true
                ? "required"
                : override.required === false
                  ? "optional"
                  : "inherit";
            const visibleValue =
              override.visible === true
                ? "visible"
                : override.visible === false
                  ? "hidden"
                  : "inherit";

            return (
              <div
                key={field.id}
                className="flex flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[12px] font-medium">{field.label}</p>
                    {field.system_field ? (
                      <span className="badge badge-muted">System</span>
                    ) : null}
                    {Object.keys(override).length ? (
                      <span className="badge badge-brand">Overridden</span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[10px] text-muted">
                    Global: {field.required ? "Required" : "Optional"} ·{" "}
                    {field.visible ? "Visible" : "Hidden"} · {field.section}
                  </p>
                </div>

                {essential ? (
                  <p className="text-[11px] text-muted">
                    Required and visible for every job.
                  </p>
                ) : (
                  <ActionForm
                    action={saveJobOverrideAction}
                    submitLabel="Save"
                    size="xs"
                    variant="outline"
                    showMessage={false}
                    footerClassName="mt-0 flex items-center gap-2"
                  >
                    <input type="hidden" name="job_id" value={positionId} />
                    <input type="hidden" name="field_id" value={field.id} />
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="text-[10px] text-muted" htmlFor={`req-${field.id}`}>
                        Required
                      </label>
                      <select
                        id={`req-${field.id}`}
                        name="required_mode"
                        defaultValue={requiredValue}
                        className="select !min-h-8 w-[112px] !py-1 text-[11px]"
                      >
                        <option value="inherit">Inherit</option>
                        <option value="required">Required</option>
                        <option value="optional">Optional</option>
                      </select>
                      <label className="text-[10px] text-muted" htmlFor={`vis-${field.id}`}>
                        Visible
                      </label>
                      <select
                        id={`vis-${field.id}`}
                        name="visible_mode"
                        defaultValue={visibleValue}
                        className="select !min-h-8 w-[112px] !py-1 text-[11px]"
                      >
                        <option value="inherit">Inherit</option>
                        <option value="visible">Visible</option>
                        <option value="hidden">Hidden</option>
                      </select>
                    </div>
                  </ActionForm>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="px-5 py-6 text-[12px] text-muted">
          No configurable fields exist yet.
        </p>
      )}
      <div className="border-t border-line bg-[#fcfcfc] px-5 py-3">
        <p className="text-[10px] leading-5 text-muted">
          A hidden field is never required, even if its global setting is required.
          Overrides apply to new applications; existing records keep their original
          answers.
        </p>
      </div>
    </SectionCard>
  );
}
