import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { SectionCard } from "@/components/admin/ui";
import {
  deleteJobDetailAction,
  moveJobDetailAction,
  saveJobDetailAction,
} from "@/app/admin/actions";
import {
  JOB_DETAIL_TYPES,
  JOB_DETAIL_TYPE_LABELS,
} from "@/lib/data/config";
import type { JobDetail } from "@/lib/types";

export function JobDetailsEditor({
  positionId,
  details,
}: {
  positionId: string;
  details: JobDetail[];
}) {
  return (
    <SectionCard
      title="Job details"
      description="Extra information shown on the job page — shift, salary range, reporting line or anything specific to this role."
      bodyClassName="p-0"
    >
      {details.length ? (
        <div className="divide-y divide-line">
          {details.map((detail) => (
            <div key={detail.id} className="p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[12px] font-medium">{detail.label}</p>
                  <span className="badge badge-muted">{JOB_DETAIL_TYPE_LABELS[detail.type]}</span>
                  {!detail.visible ? (
                    <span className="badge badge-warning">Hidden</span>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <ActionForm
                    action={moveJobDetailAction}
                    submitLabel="Move up"
                    submitContent={<ArrowUp className="h-3.5 w-3.5" />}
                    variant="ghost"
                    size="icon"
                    showMessage={false}
                    footerClassName="mt-0"
                  >
                    <input type="hidden" name="id" value={detail.id} />
                    <input type="hidden" name="direction" value="up" />
                  </ActionForm>
                  <ActionForm
                    action={moveJobDetailAction}
                    submitLabel="Move down"
                    submitContent={<ArrowDown className="h-3.5 w-3.5" />}
                    variant="ghost"
                    size="icon"
                    showMessage={false}
                    footerClassName="mt-0"
                  >
                    <input type="hidden" name="id" value={detail.id} />
                    <input type="hidden" name="direction" value="down" />
                  </ActionForm>
                  <ActionForm
                    action={deleteJobDetailAction}
                    submitLabel="Delete detail"
                    submitContent={<Trash2 className="h-3.5 w-3.5" />}
                    variant="danger"
                    size="icon"
                    showMessage={false}
                    footerClassName="mt-0"
                    confirm={`Remove "${detail.label}" from this job?`}
                  >
                    <input type="hidden" name="id" value={detail.id} />
                    <input type="hidden" name="position_id" value={positionId} />
                  </ActionForm>
                </div>
              </div>

              <ActionForm
                action={saveJobDetailAction}
                submitLabel="Save detail"
                size="sm"
                footerClassName="mt-3 flex items-center gap-3"
              >
                <input type="hidden" name="id" value={detail.id} />
                <input type="hidden" name="position_id" value={positionId} />
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor={`label-${detail.id}`}>
                      Label
                    </label>
                    <input
                      id={`label-${detail.id}`}
                      name="label"
                      defaultValue={detail.label}
                      className="input"
                      required
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`value-${detail.id}`}>
                      Value
                    </label>
                    <input
                      id={`value-${detail.id}`}
                      name="value"
                      defaultValue={detail.value}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor={`type-${detail.id}`}>
                      Type
                    </label>
                    <select
                      id={`type-${detail.id}`}
                      name="type"
                      defaultValue={detail.type}
                      className="select"
                    >
                      {JOB_DETAIL_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {JOB_DETAIL_TYPE_LABELS[type]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end pb-2">
                    <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[12px]">
                      <input
                        type="checkbox"
                        name="visible"
                        defaultChecked={detail.visible}
                        className="h-4 w-4 accent-brand"
                      />
                      Visible on the public job page
                    </label>
                  </div>
                </div>
              </ActionForm>
            </div>
          ))}
        </div>
      ) : (
        <p className="px-5 py-6 text-[12px] text-muted">
          No extra detail rows yet. Add the first one below.
        </p>
      )}

      <div className="border-t border-line bg-[#fcfcfc] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted">
          Add a detail
        </p>
        <ActionForm
          action={saveJobDetailAction}
          submitLabel="Add detail"
          submitContent={
            <>
              <Plus className="h-3.5 w-3.5" /> Add detail
            </>
          }
          size="sm"
          resetOnSuccess
          footerClassName="mt-3 flex items-center gap-3"
        >
          <input type="hidden" name="position_id" value={positionId} />
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label" htmlFor="new-detail-label">
                Label
              </label>
              <input
                id="new-detail-label"
                name="label"
                className="input"
                placeholder="e.g. Shift"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="new-detail-value">
                Value
              </label>
              <input
                id="new-detail-value"
                name="value"
                className="input"
                placeholder="e.g. Rotational shifts"
              />
            </div>
            <div>
              <label className="label" htmlFor="new-detail-type">
                Type
              </label>
              <select
                id="new-detail-type"
                name="type"
                className="select"
                defaultValue="text"
              >
                {JOB_DETAIL_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {JOB_DETAIL_TYPE_LABELS[type]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </ActionForm>
      </div>
    </SectionCard>
  );
}
