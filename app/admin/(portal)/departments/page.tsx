import { ArrowDown, ArrowUp, Building2, Plus, Trash2 } from "lucide-react";

import { ActionForm } from "@/components/admin/action-form";
import { AdminEmpty, PageHeader, SectionCard } from "@/components/admin/ui";
import {
  deleteDepartmentAction,
  moveDepartmentAction,
  saveDepartmentAction,
} from "@/app/admin/actions";
import {
  getAllDepartments,
  countPositionsByDepartment,
} from "@/lib/data/departments";
import { getDepartmentJobCounts } from "@/lib/data/jobs";

export const dynamic = "force-dynamic";

export default async function AdminDepartmentsPage() {
  const [departments, counts, openCounts] = await Promise.all([
    getAllDepartments(),
    countPositionsByDepartment(),
    getDepartmentJobCounts(),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Recruitment"
        title="Departments"
        description="Departments organise jobs on the public site. Hiding a department also hides its jobs from candidates."
      />

      <SectionCard
        title="Add a department"
        description="Use a short, clear name. The department URL is generated automatically."
        className="mb-4"
      >
        <ActionForm
          action={saveDepartmentAction}
          submitLabel="Add department"
          submitContent={
            <>
              <Plus className="h-3.5 w-3.5" /> Add department
            </>
          }
          size="sm"
          resetOnSuccess
          footerClassName="mt-3"
        >
          <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
            <div>
              <label htmlFor="new-department-name" className="label">
                Name <span className="text-brand">*</span>
              </label>
              <input
                id="new-department-name"
                name="name"
                required
                maxLength={120}
                className="input"
                placeholder="e.g. Tool Room"
              />
            </div>
            <div>
              <label htmlFor="new-department-description" className="label">
                Description
              </label>
              <input
                id="new-department-description"
                name="description"
                maxLength={500}
                className="input"
                placeholder="One line shown on the department card."
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

      {departments.length ? (
        <div className="space-y-3">
          {departments.map((department) => {
            const total = counts[department.name.toLowerCase()] ?? 0;
            const open = openCounts[department.id]?.open ?? 0;
            return (
              <div key={department.id} className="admin-card">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-muted" />
                    <p className="text-[12px] font-medium">{department.name}</p>
                    {department.active ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-muted">Hidden</span>
                    )}
                    <span className="text-[10px] text-muted">
                      {total} job{total === 1 ? "" : "s"} · {open} open
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ActionForm
                      action={moveDepartmentAction}
                      submitLabel="Move up"
                      submitContent={<ArrowUp className="h-3.5 w-3.5" />}
                      variant="ghost"
                      size="icon"
                      showMessage={false}
                      footerClassName="mt-0"
                    >
                      <input type="hidden" name="id" value={department.id} />
                      <input type="hidden" name="direction" value="up" />
                    </ActionForm>
                    <ActionForm
                      action={moveDepartmentAction}
                      submitLabel="Move down"
                      submitContent={<ArrowDown className="h-3.5 w-3.5" />}
                      variant="ghost"
                      size="icon"
                      showMessage={false}
                      footerClassName="mt-0"
                    >
                      <input type="hidden" name="id" value={department.id} />
                      <input type="hidden" name="direction" value="down" />
                    </ActionForm>
                    <ActionForm
                      action={deleteDepartmentAction}
                      submitLabel="Delete department"
                      submitContent={<Trash2 className="h-3.5 w-3.5" />}
                      variant="danger"
                      size="icon"
                      showMessage={false}
                      footerClassName="mt-0"
                      confirm={`Delete "${department.name}"? Departments used by jobs cannot be deleted.`}
                    >
                      <input type="hidden" name="id" value={department.id} />
                    </ActionForm>
                  </div>
                </div>

                <ActionForm
                  action={saveDepartmentAction}
                  submitLabel="Save"
                  size="sm"
                  className="px-5 py-4"
                  footerClassName="mt-3"
                >
                  <input type="hidden" name="id" value={department.id} />
                  <div className="grid gap-3 md:grid-cols-[220px_1fr_auto]">
                    <div>
                      <label className="label" htmlFor={`name-${department.id}`}>
                        Name
                      </label>
                      <input
                        id={`name-${department.id}`}
                        name="name"
                        defaultValue={department.name}
                        className="input"
                        required
                      />
                    </div>
                    <div>
                      <label className="label" htmlFor={`desc-${department.id}`}>
                        Description
                      </label>
                      <input
                        id={`desc-${department.id}`}
                        name="description"
                        defaultValue={department.description}
                        className="input"
                      />
                    </div>
                    <div className="flex items-end pb-2">
                      <label className="flex min-h-11 cursor-pointer items-center gap-2 text-[12px]">
                        <input
                          type="checkbox"
                          name="active"
                          defaultChecked={department.active}
                          className="h-4 w-4 accent-brand"
                        />
                        Active
                      </label>
                    </div>
                  </div>
                </ActionForm>
              </div>
            );
          })}
        </div>
      ) : (
        <AdminEmpty
          title="No departments yet"
          description="Add a department before creating jobs."
          actionHref="/admin/departments"
          actionLabel="Refresh"
        />
      )}
    </>
  );
}
