import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Eye,
  EyeOff,
  HelpCircle,
  Plus,
  Settings2,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { ActionForm } from "@/components/admin/action-form";
import { AdminEmpty, PageHeader, SectionCard } from "@/components/admin/ui";
import {
  deleteFormFieldAction,
  deleteFormOptionAction,
  moveFormFieldAction,
  moveFormOptionAction,
  saveFormFieldAction,
  saveFormOptionAction,
} from "@/app/admin/actions";
import {
  FIELD_TYPE_LABELS,
  FORM_FIELD_TYPES,
  getAllFormFields,
  getAllFormOptions,
  isMetaField,
} from "@/lib/data/config";
import type { FieldType, FormField, FormOption } from "@/lib/types";

export const dynamic = "force-dynamic";

const SECTIONS = ["Personal", "Professional", "Documents", "Additional"];

export default async function AdminFormConfigPage() {
  const [fields, allOptions] = await Promise.all([
    getAllFormFields(),
    getAllFormOptions(),
  ]);

  const activeFields = fields.filter((f) => !isMetaField(f));

  // Map options by field id
  const optionsByField = new Map<string, FormOption[]>();
  for (const opt of allOptions) {
    const list = optionsByField.get(opt.field_id) ?? [];
    list.push(opt);
    optionsByField.set(opt.field_id, list);
  }

  // Group fields by section
  const sectionsMap = new Map<string, FormField[]>();
  for (const section of SECTIONS) {
    sectionsMap.set(section, []);
  }
  for (const field of activeFields) {
    const sec = field.section || "Additional";
    const list = sectionsMap.get(sec) ?? [];
    list.push(field);
    sectionsMap.set(sec, list);
  }

  return (
    <>
      <PageHeader
        eyebrow="Configuration"
        title="Application Form"
        description="Configure the questions and documents required from candidates. Changes apply dynamically across all job applications without code changes."
        actions={
          <div className="flex items-center gap-2">
            <span className="badge badge-muted">
              {activeFields.length} active form fields
            </span>
          </div>
        }
      />

      {/* Add New Field Card */}
      <SectionCard
        title="Add a custom field"
        description="Add a new question to the candidate application form. Choose the field type and target section."
        className="mb-8"
      >
        <ActionForm
          action={saveFormFieldAction}
          submitLabel="Create field"
          submitContent={
            <>
              <Plus className="h-3.5 w-3.5" /> Add field
            </>
          }
          size="sm"
          resetOnSuccess
          footerClassName="mt-4"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="new-field-label" className="label">
                Field Label <span className="text-brand">*</span>
              </label>
              <input
                id="new-field-label"
                name="label"
                required
                maxLength={120}
                className="input"
                placeholder="e.g. Current CTC / Notice Period"
              />
            </div>

            <div>
              <label htmlFor="new-field-key" className="label">
                Field Key (Identifier)
              </label>
              <input
                id="new-field-key"
                name="key"
                maxLength={60}
                className="input"
                placeholder="Auto-generated if blank"
              />
            </div>

            <div>
              <label htmlFor="new-field-type" className="label">
                Field Type <span className="text-brand">*</span>
              </label>
              <select
                id="new-field-type"
                name="type"
                defaultValue="text"
                className="select"
              >
                {FORM_FIELD_TYPES.filter((t) => t !== "file").map((t) => (
                  <option key={t} value={t}>
                    {FIELD_TYPE_LABELS[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="new-field-section" className="label">
                Section
              </label>
              <select
                id="new-field-section"
                name="section"
                defaultValue="Professional"
                className="select"
              >
                {SECTIONS.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3">
            <label htmlFor="new-field-desc" className="label">
              Help Text / Description (Optional)
            </label>
            <input
              id="new-field-desc"
              name="description"
              maxLength={400}
              className="input"
              placeholder="e.g. Please specify notice period in days"
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-line pt-3">
            <label className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-ink">
              <input
                type="checkbox"
                name="required"
                className="h-4 w-4 accent-brand"
              />
              Required by default
            </label>

            <label className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-ink">
              <input
                type="checkbox"
                name="visible"
                defaultChecked
                className="h-4 w-4 accent-brand"
              />
              Visible on application form
            </label>
          </div>
        </ActionForm>
      </SectionCard>

      {/* Sections and Form Fields List */}
      <div className="space-y-8">
        {Array.from(sectionsMap.entries()).map(([sectionName, sectionFields]) => {
          if (!sectionFields.length) return null;

          return (
            <div key={sectionName} className="space-y-3">
              <div className="flex items-center justify-between border-b border-line pb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold tracking-[-0.01em] text-ink">
                    {sectionName} Section
                  </span>
                  <span className="badge badge-muted">
                    {sectionFields.length} {sectionFields.length === 1 ? "field" : "fields"}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {sectionFields.map((field) => {
                  const isEssential =
                    field.system_field &&
                    ["candidate_name", "email", "phone"].includes(field.key);
                  const isProtected = field.system_field;
                  const fieldOptions = optionsByField.get(field.id) ?? [];
                  const allowsOptions = ["select", "radio", "checkbox"].includes(
                    field.type,
                  );

                  return (
                    <div
                      key={field.id}
                      className={`admin-card transition-colors ${
                        !field.visible ? "bg-surface/50 opacity-80" : ""
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-[13px] font-semibold text-ink">
                            {field.label}
                          </span>
                          <span className="font-mono text-[11px] text-muted">
                            ({field.key})
                          </span>
                          <span className="badge badge-muted">
                            {FIELD_TYPE_LABELS[field.type] ?? field.type}
                          </span>
                          {field.required ? (
                            <span className="badge badge-brand">Required</span>
                          ) : (
                            <span className="badge badge-muted">Optional</span>
                          )}
                          {!field.visible ? (
                            <span className="badge badge-warning flex items-center gap-1">
                              <EyeOff className="h-3 w-3" /> Hidden
                            </span>
                          ) : null}
                          {isProtected ? (
                            <span className="badge badge-muted">System Field</span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-1">
                          <ActionForm
                            action={moveFormFieldAction}
                            submitLabel="Move up"
                            submitContent={<ArrowUp className="h-3.5 w-3.5" />}
                            variant="ghost"
                            size="icon"
                            showMessage={false}
                            footerClassName="mt-0"
                          >
                            <input type="hidden" name="id" value={field.id} />
                            <input type="hidden" name="direction" value="up" />
                          </ActionForm>
                          <ActionForm
                            action={moveFormFieldAction}
                            submitLabel="Move down"
                            submitContent={<ArrowDown className="h-3.5 w-3.5" />}
                            variant="ghost"
                            size="icon"
                            showMessage={false}
                            footerClassName="mt-0"
                          >
                            <input type="hidden" name="id" value={field.id} />
                            <input type="hidden" name="direction" value="down" />
                          </ActionForm>
                          {!isProtected ? (
                            <ActionForm
                              action={deleteFormFieldAction}
                              submitLabel="Delete"
                              submitContent={<Trash2 className="h-3.5 w-3.5" />}
                              variant="danger"
                              size="icon"
                              showMessage={false}
                              footerClassName="mt-0"
                              confirm={`Delete custom field "${field.label}"? Historical data for this field is preserved.`}
                            >
                              <input type="hidden" name="id" value={field.id} />
                            </ActionForm>
                          ) : null}
                        </div>
                      </div>

                      <div className="p-5">
                        <ActionForm
                          action={saveFormFieldAction}
                          submitLabel="Update field"
                          size="sm"
                          footerClassName="mt-4 flex items-center gap-3"
                        >
                          <input type="hidden" name="id" value={field.id} />
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <div>
                              <label
                                htmlFor={`label-${field.id}`}
                                className="label"
                              >
                                Label
                              </label>
                              <input
                                id={`label-${field.id}`}
                                name="label"
                                defaultValue={field.label}
                                required
                                className="input"
                              />
                            </div>

                            <div>
                              <label
                                htmlFor={`type-${field.id}`}
                                className="label"
                              >
                                Type
                              </label>
                              {isProtected ? (
                                <input
                                  type="text"
                                  disabled
                                  value={FIELD_TYPE_LABELS[field.type] ?? field.type}
                                  className="input cursor-not-allowed bg-surface text-muted"
                                />
                              ) : (
                                <select
                                  id={`type-${field.id}`}
                                  name="type"
                                  defaultValue={field.type}
                                  className="select"
                                >
                                  {FORM_FIELD_TYPES.filter((t) => t !== "file").map(
                                    (t) => (
                                      <option key={t} value={t}>
                                        {FIELD_TYPE_LABELS[t]}
                                      </option>
                                    ),
                                  )}
                                </select>
                              )}
                            </div>

                            <div>
                              <label
                                htmlFor={`section-${field.id}`}
                                className="label"
                              >
                                Section
                              </label>
                              <select
                                id={`section-${field.id}`}
                                name="section"
                                defaultValue={field.section}
                                className="select"
                              >
                                {SECTIONS.map((sec) => (
                                  <option key={sec} value={sec}>
                                    {sec}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label
                                htmlFor={`desc-${field.id}`}
                                className="label"
                              >
                                Description / Help Text
                              </label>
                              <input
                                id={`desc-${field.id}`}
                                name="description"
                                defaultValue={field.description}
                                className="input"
                              />
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-6 border-t border-line pt-3">
                            {isEssential ? (
                              <p className="text-[11px] text-muted italic">
                                Core candidate identifier: permanently required and visible.
                              </p>
                            ) : (
                              <>
                                <label className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-ink">
                                  <input
                                    type="checkbox"
                                    name="required"
                                    defaultChecked={field.required}
                                    className="h-4 w-4 accent-brand"
                                  />
                                  Required field
                                </label>

                                <label className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-ink">
                                  <input
                                    type="checkbox"
                                    name="visible"
                                    defaultChecked={field.visible}
                                    className="h-4 w-4 accent-brand"
                                  />
                                  Visible to applicants
                                </label>
                              </>
                            )}
                          </div>
                        </ActionForm>

                        {/* Options Manager for Dropdown / Radio / Checkbox */}
                        {allowsOptions ? (
                          <div className="mt-5 rounded border border-line bg-surface/30 p-4">
                            <div className="flex items-center justify-between">
                              <h4 className="text-[12px] font-semibold text-ink">
                                Choices / Options ({fieldOptions.length})
                              </h4>
                            </div>

                            {fieldOptions.length ? (
                              <div className="mt-3 space-y-2">
                                {fieldOptions.map((opt) => (
                                  <div
                                    key={opt.id}
                                    className="flex flex-wrap items-center justify-between gap-2 rounded border border-line bg-white px-3 py-2 text-[12px]"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-ink">
                                        {opt.label}
                                      </span>
                                      <span className="font-mono text-[10px] text-muted">
                                        value: {opt.value}
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-1">
                                      <ActionForm
                                        action={moveFormOptionAction}
                                        submitLabel="Up"
                                        submitContent={<ArrowUp className="h-3 w-3" />}
                                        variant="ghost"
                                        size="icon"
                                        showMessage={false}
                                        footerClassName="mt-0"
                                      >
                                        <input type="hidden" name="id" value={opt.id} />
                                        <input type="hidden" name="direction" value="up" />
                                      </ActionForm>
                                      <ActionForm
                                        action={moveFormOptionAction}
                                        submitLabel="Down"
                                        submitContent={<ArrowDown className="h-3 w-3" />}
                                        variant="ghost"
                                        size="icon"
                                        showMessage={false}
                                        footerClassName="mt-0"
                                      >
                                        <input type="hidden" name="id" value={opt.id} />
                                        <input type="hidden" name="direction" value="down" />
                                      </ActionForm>
                                      <ActionForm
                                        action={deleteFormOptionAction}
                                        submitLabel="Delete"
                                        submitContent={<Trash2 className="h-3 w-3" />}
                                        variant="danger"
                                        size="icon"
                                        showMessage={false}
                                        footerClassName="mt-0"
                                        confirm={`Delete option "${opt.label}"?`}
                                      >
                                        <input type="hidden" name="id" value={opt.id} />
                                      </ActionForm>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="mt-2 text-[11px] text-muted">
                                No choices defined yet. Add the first option below.
                              </p>
                            )}

                            {/* Add Option Form */}
                            <div className="mt-3 border-t border-line pt-3">
                              <ActionForm
                                action={saveFormOptionAction}
                                submitLabel="Add option"
                                size="xs"
                                variant="outline"
                                resetOnSuccess
                                showMessage={false}
                                footerClassName="mt-2 flex items-center"
                              >
                                <input
                                  type="hidden"
                                  name="field_id"
                                  value={field.id}
                                />
                                <div className="flex items-center gap-2">
                                  <input
                                    name="label"
                                    required
                                    placeholder="Option label (e.g. Full Time)"
                                    className="input min-h-8 text-[11px]"
                                  />
                                </div>
                              </ActionForm>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
