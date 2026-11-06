import { getStore } from "@/lib/data";
import { moveOrdered } from "@/lib/data/departments";
import type { Row } from "@/lib/data/store";
import type {
  ApplicationStatus,
  FieldType,
  FormField,
  FormOption,
  JobDetail,
  JobDetailType,
  JobFormOverride,
  JobFormOverrides,
  ResolvedField,
} from "@/lib/types";
import {
  parseBool,
  parseNumber,
  randomId,
  safeJsonParse,
  slugify,
} from "@/lib/utils";

export const FORM_FIELD_TYPES: FieldType[] = [
  "text",
  "email",
  "phone",
  "number",
  "textarea",
  "select",
  "radio",
  "checkbox",
  "date",
  "file",
];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Short text",
  email: "Email",
  phone: "Phone",
  number: "Number",
  textarea: "Long text",
  select: "Dropdown",
  radio: "Radio choices",
  checkbox: "Checkbox",
  date: "Date",
  file: "File upload",
};

export const JOB_DETAIL_TYPES: JobDetailType[] = [
  "text",
  "number",
  "date",
  "select",
  "long_text",
];

export const JOB_DETAIL_TYPE_LABELS: Record<JobDetailType, string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  select: "Dropdown value",
  long_text: "Long text",
};

/** Fields that always exist in the data model and can never be deleted. */
export const SYSTEM_META_FIELDS = [
  { key: "application_id", label: "Application ID", note: "Generated on submission" },
  { key: "position_id", label: "Position", note: "Linked job record" },
  { key: "created_at", label: "Created at", note: "Submission timestamp" },
  { key: "status", label: "Status", note: "Applicant pipeline stage" },
  { key: "cv_file_id", label: "CV file", note: "Private Drive reference" },
];

export function isMetaField(field: FormField): boolean {
  return (
    SYSTEM_META_FIELDS.some((meta) => meta.key === field.key) ||
    field.section === "System"
  );
}

function inferSection(row: Row): string {
  const key = row.key ?? "";
  const type = row.type ?? "";
  if (["candidate_name", "email", "phone", "location"].includes(key)) {
    return "Personal";
  }
  if (key === "cv" || type === "file") return "Documents";
  if (["experience", "qualification", "additional_info"].includes(key)) {
    return "Professional";
  }
  return "Additional";
}

function parseField(row: Row): FormField {
  const rawType = (row.type ?? "text").trim() as FieldType;
  return {
    id: row.id ?? "",
    key: (row.key ?? "").trim(),
    label: (row.label ?? "").trim(),
    description: (row.description ?? "").trim(),
    type: FORM_FIELD_TYPES.includes(rawType) ? rawType : "text",
    required: parseBool(row.required, false),
    visible: parseBool(row.visible, true),
    system_field: parseBool(row.system_field, false),
    display_order: parseNumber(row.display_order, 9999),
    active: parseBool(row.active, true),
    section: (row.section ?? "").trim() || inferSection(row),
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? "",
  };
}

function parseOption(row: Row): FormOption {
  return {
    id: row.id ?? "",
    field_id: row.field_id ?? "",
    label: (row.label ?? "").trim(),
    value: (row.value ?? "").trim(),
    display_order: parseNumber(row.display_order, 9999),
    active: parseBool(row.active, true),
  };
}

function parseJobDetail(row: Row): JobDetail {
  const type = (row.type ?? "text") as JobDetailType;
  return {
    id: row.id ?? "",
    position_id: row.position_id ?? "",
    key: (row.key ?? "").trim(),
    label: (row.label ?? "").trim(),
    value: (row.value ?? "").trim(),
    type: JOB_DETAIL_TYPES.includes(type) ? type : "text",
    visible: parseBool(row.visible, true),
    display_order: parseNumber(row.display_order, 9999),
    active: parseBool(row.active, true),
  };
}

function parseStatus(row: Row): ApplicationStatus {
  return {
    id: row.id ?? "",
    name: (row.name ?? "").trim(),
    display_order: parseNumber(row.display_order, 9999),
    active: parseBool(row.active, true),
  };
}

export async function getAllFormFields(): Promise<FormField[]> {
  const store = await getStore();
  const rows = await store.list("FORM_FIELDS");
  return rows
    .map(parseField)
    .filter((field) => field.id && field.key)
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getFormFieldById(id: string): Promise<FormField | null> {
  return (await getAllFormFields()).find((field) => field.id === id) ?? null;
}

export async function getAllFormOptions(): Promise<FormOption[]> {
  const store = await getStore();
  const rows = await store.list("FORM_OPTIONS");
  return rows
    .map(parseOption)
    .filter((option) => option.id && option.field_id)
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getOptionsForField(fieldId: string): Promise<FormOption[]> {
  return (await getAllFormOptions()).filter(
    (option) => option.field_id === fieldId && option.active,
  );
}

export async function getAllJobDetails(): Promise<JobDetail[]> {
  const store = await getStore();
  const rows = await store.list("JOB_DETAILS");
  return rows
    .map(parseJobDetail)
    .filter((detail) => detail.id && detail.position_id)
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getJobDetailsForPosition(
  positionId: string,
  options: { includeHidden?: boolean } = {},
): Promise<JobDetail[]> {
  const details = await getAllJobDetails();
  return details
    .filter((detail) => detail.position_id === positionId && detail.active)
    .filter((detail) => options.includeHidden || detail.visible)
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getAllStatuses(): Promise<ApplicationStatus[]> {
  const store = await getStore();
  const rows = await store.list("APPLICATION_STATUSES");
  return rows
    .map(parseStatus)
    .filter((status) => status.id && status.name)
    .sort((a, b) => a.display_order - b.display_order);
}

export async function getActiveStatuses(): Promise<ApplicationStatus[]> {
  return (await getAllStatuses()).filter((status) => status.active);
}

const OVERRIDES_KEY = "job_form_overrides";

export async function getAllJobFormOverrides(): Promise<JobFormOverrides> {
  const store = await getStore();
  const settings = await store.getSettings();
  const parsed = safeJsonParse<JobFormOverrides>(
    settings[OVERRIDES_KEY],
    {},
  );
  return parsed && typeof parsed === "object" ? parsed : {};
}

export async function getJobFormOverrides(
  jobId: string,
): Promise<Record<string, JobFormOverride>> {
  const overrides = await getAllJobFormOverrides();
  return overrides[jobId] ?? {};
}

export async function setJobFormOverride(
  jobId: string,
  fieldId: string,
  override: JobFormOverride | null,
): Promise<void> {
  const store = await getStore();
  const field = await getFormFieldById(fieldId);
  if (!field) throw new Error("Field not found.");
  if (
    field.system_field &&
    ["candidate_name", "email", "phone"].includes(field.key) &&
    (override?.visible === false || override?.required === false)
  ) {
    throw new Error(
      "Name, email and phone must remain visible and required for every job.",
    );
  }

  const overrides = await getAllJobFormOverrides();
  const forJob = { ...(overrides[jobId] ?? {}) };

  if (!override || (override.required === undefined && override.visible === undefined)) {
    delete forJob[fieldId];
  } else {
    forJob[fieldId] = override;
  }

  if (Object.keys(forJob).length) {
    overrides[jobId] = forJob;
  } else {
    delete overrides[jobId];
  }

  await store.setSettings({ [OVERRIDES_KEY]: JSON.stringify(overrides) });
}

export async function clearJobFormOverrides(jobId: string): Promise<void> {
  const store = await getStore();
  const overrides = await getAllJobFormOverrides();
  if (!overrides[jobId]) return;
  delete overrides[jobId];
  await store.setSettings({ [OVERRIDES_KEY]: JSON.stringify(overrides) });
}

/**
 * Resolves the effective form for a job by merging global configuration with
 * job-level overrides. Required/visible are evaluated together: hiding a field
 * always removes its required validation.
 */
export async function resolveFormFields(
  jobId: string,
  options: { includeHidden?: boolean } = {},
): Promise<ResolvedField[]> {
  const [fields, optionsRows, overrides] = await Promise.all([
    getAllFormFields(),
    getAllFormOptions(),
    getJobFormOverrides(jobId),
  ]);

  const optionsByField = new Map<string, FormOption[]>();
  for (const option of optionsRows) {
    if (!option.active) continue;
    const list = optionsByField.get(option.field_id) ?? [];
    list.push(option);
    optionsByField.set(option.field_id, list);
  }

  const resolved: ResolvedField[] = [];
  for (const field of fields) {
    if (!field.active) continue;
    if (isMetaField(field)) continue;

    const override = overrides[field.id] ?? {};
    const visible = override.visible ?? field.visible;
    const required = visible ? (override.required ?? field.required) : false;
    const overridden =
      override.visible !== undefined || override.required !== undefined;

    if (!visible && !options.includeHidden) continue;

    resolved.push({
      ...field,
      required,
      visible,
      options: optionsByField.get(field.id) ?? [],
      overridden,
      inherited_required: field.required,
      inherited_visible: field.visible,
    });
  }

  return resolved;
}

export async function createFormField(input: {
  key: string;
  label: string;
  description?: string;
  type: FieldType;
  required: boolean;
  visible: boolean;
  section: string;
}): Promise<FormField> {
  const store = await getStore();
  const fields = await getAllFormFields();
  const label = input.label.trim().slice(0, 120);
  if (!label) throw new Error("Field label is required.");

  const requestedKey = slugify(input.key || label).replace(/-/g, "_");
  if (!requestedKey) throw new Error("Field key is required.");
  const key = requestedKey.slice(0, 60);
  if (fields.some((field) => field.key === key)) {
    throw new Error("A field with this key already exists.");
  }
  if (input.type === "file") {
    throw new Error(
      "File uploads are reserved for the protected CV field, which is linked to private storage.",
    );
  }

  const now = new Date().toISOString();
  const field: FormField = {
    id: randomId("field"),
    key,
    label,
    description: (input.description ?? "").trim().slice(0, 400),
    type: FORM_FIELD_TYPES.includes(input.type) ? input.type : "text",
    required: input.required,
    visible: input.visible,
    system_field: false,
    display_order:
      fields.reduce((max, item) => Math.max(max, item.display_order), 0) + 10,
    active: true,
    section: input.section.trim() || "Additional",
    created_at: now,
    updated_at: now,
  };

  await store.appendMany("FORM_FIELDS", [field]);
  return field;
}

export async function updateFormField(
  id: string,
  patch: {
    label?: string;
    description?: string;
    type?: FieldType;
    required?: boolean;
    visible?: boolean;
    section?: string;
    active?: boolean;
  },
): Promise<void> {
  const store = await getStore();
  const field = await getFormFieldById(id);
  if (!field) throw new Error("Field not found.");

  const protectedField = field.system_field || isMetaField(field);
  const essential =
    field.system_field &&
    ["candidate_name", "email", "phone"].includes(field.key);
  if (essential) {
    if (patch.visible === false) {
      throw new Error(
        "Name, email and phone must stay visible: the application record depends on them.",
      );
    }
    if (patch.required === false) {
      throw new Error(
        "Name, email and phone must stay required: the application record depends on them.",
      );
    }
  }
  const label = patch.label?.trim().slice(0, 120) ?? field.label;
  if (!label) throw new Error("Field label is required.");

  const type =
    patch.type && FORM_FIELD_TYPES.includes(patch.type) ? patch.type : field.type;
  if (protectedField && type !== field.type) {
    throw new Error(
      "The input type of a protected system field cannot be changed.",
    );
  }
  if (!protectedField && type === "file") {
    throw new Error(
      "File uploads are reserved for the protected CV field, which is linked to private storage.",
    );
  }

  const update: Record<string, unknown> = {
    label,
    description:
      patch.description !== undefined
        ? patch.description.trim().slice(0, 400)
        : field.description,
    required: patch.required ?? field.required,
    visible: patch.visible ?? field.visible,
    section: (patch.section ?? field.section).trim() || field.section,
    active: patch.active ?? field.active,
    updated_at: new Date().toISOString(),
  };

  if (!protectedField) update.type = type;

  await store.update("FORM_FIELDS", id, update);
}

export async function deleteFormField(id: string): Promise<void> {
  const store = await getStore();
  const field = await getFormFieldById(id);
  if (!field) return;
  if (field.system_field || isMetaField(field)) {
    throw new Error(
      "This is a protected system field. It can be hidden or renamed, but not deleted.",
    );
  }
  const options = (await getAllFormOptions()).filter(
    (option) => option.field_id === id,
  );
  for (const option of options) {
    await store.remove("FORM_OPTIONS", option.id);
  }
  await store.remove("FORM_FIELDS", id);
}

export async function moveFormField(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  await moveOrdered("FORM_FIELDS", id, direction);
}

export async function createFormOption(input: {
  field_id: string;
  label: string;
}): Promise<FormOption> {
  const store = await getStore();
  const field = await getFormFieldById(input.field_id);
  if (!field) throw new Error("Field not found.");
  const label = input.label.trim().slice(0, 120);
  if (!label) throw new Error("Option label is required.");
  const options = (await getAllFormOptions()).filter(
    (option) => option.field_id === input.field_id,
  );
  const base = slugify(label).replace(/-/g, "_") || `option_${options.length + 1}`;
  let value = base;
  let suffix = 2;
  while (options.some((option) => option.value === value)) {
    value = `${base}_${suffix}`;
    suffix += 1;
  }
  const option: FormOption = {
    id: randomId("option"),
    field_id: input.field_id,
    label,
    value,
    display_order:
      options.reduce((max, item) => Math.max(max, item.display_order), 0) + 10,
    active: true,
  };
  await store.appendMany("FORM_OPTIONS", [option]);
  return option;
}

export async function updateFormOption(
  id: string,
  patch: { label?: string; active?: boolean },
): Promise<void> {
  const store = await getStore();
  const options = await getAllFormOptions();
  const option = options.find((item) => item.id === id);
  if (!option) throw new Error("Option not found.");
  await store.update("FORM_OPTIONS", id, {
    label: patch.label?.trim().slice(0, 120) || option.label,
    active: patch.active ?? option.active,
  });
}

export async function deleteFormOption(id: string): Promise<void> {
  const store = await getStore();
  await store.remove("FORM_OPTIONS", id);
}

export async function moveFormOption(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const store = await getStore();
  const options = await getAllFormOptions();
  const option = options.find((item) => item.id === id);
  if (!option) return;
  const siblings = options.filter((item) => item.field_id === option.field_id);
  const index = siblings.findIndex((item) => item.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;
  const neighbour = siblings[swapWith];
  await store.update("FORM_OPTIONS", option.id, {
    display_order: neighbour.display_order,
  });
  await store.update("FORM_OPTIONS", neighbour.id, {
    display_order: option.display_order,
  });
}

export async function createJobDetail(input: {
  position_id: string;
  label: string;
  value: string;
  type: JobDetailType;
}): Promise<JobDetail> {
  const store = await getStore();
  const label = input.label.trim().slice(0, 120);
  if (!label) throw new Error("Detail label is required.");
  const siblings = (await getAllJobDetails()).filter(
    (detail) => detail.position_id === input.position_id,
  );
  let key = slugify(label).replace(/-/g, "_") || `detail_${siblings.length + 1}`;
  let suffix = 2;
  while (siblings.some((detail) => detail.key === key)) {
    key = `${slugify(label).replace(/-/g, "_")}_${suffix}`;
    suffix += 1;
  }
  const detail: JobDetail = {
    id: randomId("detail"),
    position_id: input.position_id,
    key,
    label,
    value: input.value.trim().slice(0, 2000),
    type: JOB_DETAIL_TYPES.includes(input.type) ? input.type : "text",
    visible: true,
    display_order:
      siblings.reduce((max, item) => Math.max(max, item.display_order), 0) + 10,
    active: true,
  };
  await store.appendMany("JOB_DETAILS", [detail]);
  return detail;
}

export async function updateJobDetail(
  id: string,
  patch: {
    label?: string;
    value?: string;
    type?: JobDetailType;
    visible?: boolean;
    active?: boolean;
  },
): Promise<void> {
  const store = await getStore();
  const details = await getAllJobDetails();
  const detail = details.find((item) => item.id === id);
  if (!detail) throw new Error("Job detail not found.");
  await store.update("JOB_DETAILS", id, {
    label: patch.label?.trim().slice(0, 120) || detail.label,
    value:
      patch.value !== undefined
        ? patch.value.trim().slice(0, 2000)
        : detail.value,
    type:
      patch.type && JOB_DETAIL_TYPES.includes(patch.type)
        ? patch.type
        : detail.type,
    visible: patch.visible ?? detail.visible,
    active: patch.active ?? detail.active,
  });
}

export async function deleteJobDetail(id: string): Promise<void> {
  const store = await getStore();
  await store.remove("JOB_DETAILS", id);
}

export async function moveJobDetail(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const store = await getStore();
  const details = await getAllJobDetails();
  const detail = details.find((item) => item.id === id);
  if (!detail) return;
  const siblings = details.filter(
    (item) => item.position_id === detail.position_id,
  );
  const index = siblings.findIndex((item) => item.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= siblings.length) return;
  const neighbour = siblings[swapWith];
  await store.update("JOB_DETAILS", detail.id, {
    display_order: neighbour.display_order,
  });
  await store.update("JOB_DETAILS", neighbour.id, {
    display_order: detail.display_order,
  });
}

export async function deleteJobDetailsForPosition(
  positionId: string,
): Promise<void> {
  const store = await getStore();
  const details = (await getAllJobDetails()).filter(
    (detail) => detail.position_id === positionId,
  );
  for (const detail of details) {
    await store.remove("JOB_DETAILS", detail.id);
  }
}

export async function createStatus(name: string): Promise<ApplicationStatus> {
  const store = await getStore();
  const cleaned = name.trim().replace(/\s+/g, " ").toUpperCase().slice(0, 40);
  if (!cleaned) throw new Error("Status name is required.");
  const statuses = await getAllStatuses();
  if (statuses.some((status) => status.name.toUpperCase() === cleaned)) {
    throw new Error("A status with this name already exists.");
  }
  let id = `status-${slugify(cleaned)}`;
  let suffix = 2;
  while (statuses.some((status) => status.id === id)) {
    id = `status-${slugify(cleaned)}-${suffix}`;
    suffix += 1;
  }
  const status: ApplicationStatus = {
    id,
    name: cleaned,
    display_order:
      statuses.reduce((max, item) => Math.max(max, item.display_order), 0) + 10,
    active: true,
  };
  await store.appendMany("APPLICATION_STATUSES", [status]);
  return status;
}

export async function updateStatus(
  id: string,
  patch: { name?: string; active?: boolean },
): Promise<void> {
  const store = await getStore();
  const statuses = await getAllStatuses();
  const status = statuses.find((item) => item.id === id);
  if (!status) throw new Error("Status not found.");

  const name = patch.name
    ? patch.name.trim().replace(/\s+/g, " ").toUpperCase().slice(0, 40)
    : status.name;
  if (!name) throw new Error("Status name is required.");
  if (
    statuses.some(
      (item) => item.id !== id && item.name.toUpperCase() === name,
    )
  ) {
    throw new Error("A status with this name already exists.");
  }

  await store.update("APPLICATION_STATUSES", id, {
    name,
    active: patch.active ?? status.active,
  });

  // Applications store the status name; keep historical records valid.
  if (name !== status.name) {
    for (const sheet of ["WITH_CV", "WITHOUT_CV"] as const) {
      const applications = await store.list(sheet);
      for (const application of applications) {
        if (application.status === status.name) {
          await store.update(sheet, application.id, { status: name });
        }
      }
    }
  }
}

export async function deleteStatus(id: string): Promise<void> {
  const store = await getStore();
  const statuses = await getAllStatuses();
  const status = statuses.find((item) => item.id === id);
  if (!status) return;

  const [withCv, withoutCv] = await Promise.all([
    store.list("WITH_CV"),
    store.list("WITHOUT_CV"),
  ]);
  const inUse = [...withCv, ...withoutCv].some(
    (application) => application.status === status.name,
  );
  if (inUse) {
    throw new Error(
      "This status is used by existing applications. Deactivate it instead of deleting.",
    );
  }
  await store.remove("APPLICATION_STATUSES", id);
}

export async function moveStatus(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  await moveOrdered("APPLICATION_STATUSES", id, direction);
}

/** Returns sections in the order their first field appears. */
export function groupFieldsBySection(
  fields: ResolvedField[],
): { section: string; fields: ResolvedField[] }[] {
  const groups: { section: string; fields: ResolvedField[] }[] = [];
  for (const field of fields) {
    const section = field.section || "Additional";
    let group = groups.find((item) => item.section === section);
    if (!group) {
      group = { section, fields: [] };
      groups.push(group);
    }
    group.fields.push(field);
  }
  return groups;
}
