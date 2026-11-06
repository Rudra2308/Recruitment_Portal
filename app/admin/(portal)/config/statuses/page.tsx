import { ArrowDown, ArrowUp, Plus, Tag, Trash2 } from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { AdminEmpty, PageHeader, SectionCard } from "@/components/admin/ui";
import {
  deleteStatusAction,
  moveStatusAction,
  saveStatusAction,
} from "@/app/admin/actions";
import { getAllStatuses } from "@/lib/data/config";

export const dynamic = "force-dynamic";

export default async function AdminStatusesPage() {
  const statuses = await getAllStatuses();

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Application Statuses"
        description="Configure the pipeline stages for applicants. You can reorder stages, activate/deactivate, or add custom recruitment rounds."
      />

      <SectionCard
        title="Add pipeline stage"
        description="Name the status stage (e.g. TECHNICAL ROUND, OFFER SENT, ONBOARDING)."
        className="mb-6"
      >
        <ActionForm
          action={saveStatusAction}
          submitLabel="Add status"
          submitContent={
            <>
              <Plus className="h-3.5 w-3.5" /> Add status
            </>
          }
          size="sm"
          resetOnSuccess
          footerClassName="mt-3"
        >
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="new-status-name" className="label">
                Status Name <span className="text-brand">*</span>
              </label>
              <input
                id="new-status-name"
                name="name"
                required
                maxLength={40}
                className="input"
                placeholder="e.g. TECHNICAL INTERVIEW"
              />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[12px]">
                <input
                  type="checkbox"
                  name="active"
                  defaultChecked
                  className="h-4 w-4 accent-brand"
                />
                Active
              </label>
            </div>
          </div>
        </ActionForm>
      </SectionCard>

      {statuses.length ? (
        <div className="space-y-3">
          {statuses.map((status) => (
            <div key={status.id} className="admin-card">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <Tag className="h-4 w-4 text-muted" />
                  <span className="text-[13px] font-semibold text-ink">
                    {status.name}
                  </span>
                  {!status.active ? (
                    <span className="badge badge-warning">Inactive</span>
                  ) : null}
                </div>

                <div className="flex items-center gap-1">
                  <ActionForm
                    action={moveStatusAction}
                    submitLabel="Move up"
                    submitContent={<ArrowUp className="h-3.5 w-3.5" />}
                    variant="ghost"
                    size="icon"
                    showMessage={false}
                    footerClassName="mt-0"
                  >
                    <input type="hidden" name="id" value={status.id} />
                    <input type="hidden" name="direction" value="up" />
                  </ActionForm>
                  <ActionForm
                    action={moveStatusAction}
                    submitLabel="Move down"
                    submitContent={<ArrowDown className="h-3.5 w-3.5" />}
                    variant="ghost"
                    size="icon"
                    showMessage={false}
                    footerClassName="mt-0"
                  >
                    <input type="hidden" name="id" value={status.id} />
                    <input type="hidden" name="direction" value="down" />
                  </ActionForm>
                  <ActionForm
                    action={deleteStatusAction}
                    submitLabel="Delete"
                    submitContent={<Trash2 className="h-3.5 w-3.5" />}
                    variant="danger"
                    size="icon"
                    showMessage={false}
                    footerClassName="mt-0"
                    confirm={`Delete status "${status.name}"? Only unused statuses can be removed.`}
                  >
                    <input type="hidden" name="id" value={status.id} />
                  </ActionForm>
                </div>
              </div>

              <div className="p-5">
                <ActionForm
                  action={saveStatusAction}
                  submitLabel="Save changes"
                  size="sm"
                  footerClassName="mt-3 flex items-center gap-3"
                >
                  <input type="hidden" name="id" value={status.id} />
                  <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div>
                      <label htmlFor={`name-${status.id}`} className="label">
                        Status Label
                      </label>
                      <input
                        id={`name-${status.id}`}
                        name="name"
                        defaultValue={status.name}
                        required
                        maxLength={40}
                        className="input"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[12px]">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={status.active}
                          className="h-4 w-4 accent-brand"
                        />
                        Active in pipeline
                      </label>
                    </div>
                  </div>
                </ActionForm>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <AdminEmpty
          title="No statuses defined"
          description="Default statuses are automatically seeded on startup."
        />
      )}
    </>
  );
}
