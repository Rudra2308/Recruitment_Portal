import type { DataMode } from "@/lib/config";

export type SheetName =
  | "POSITIONS"
  | "DEPARTMENTS"
  | "WITH_CV"
  | "WITHOUT_CV"
  | "SETTINGS"
  | "AUDIT_LOG"
  | "FORM_FIELDS"
  | "FORM_OPTIONS"
  | "JOB_DETAILS"
  | "APPLICATION_STATUSES";

export type Row = Record<string, string>;

export interface DataStore {
  readonly mode: DataMode;
  ensureReady(): Promise<void>;
  list(sheet: SheetName): Promise<Row[]>;
  appendMany(sheet: SheetName, rows: object[]): Promise<void>;
  update(sheet: SheetName, id: string, patch: object): Promise<void>;
  remove(sheet: SheetName, id: string): Promise<void>;
  /** Replaces every data row in a sheet, used by ordering operations. */
  replace(sheet: SheetName, rows: object[]): Promise<void>;
  getSettings(): Promise<Record<string, string>>;
  setSettings(patch: Record<string, string>): Promise<void>;
}

/**
 * Headers define the canonical column order. Extra columns at the end are
 * V4 extensions needed for configurable forms and historical records:
 * - FORM_FIELDS.section groups fields into progressive sections.
 * - WITH_CV / WITHOUT_CV.payload preserves every configured answer as JSON.
 * - .form_snapshot preserves the field definitions used at submission time.
 * - .status_history preserves the applicant's status trail.
 */
export const SHEET_HEADERS: Record<SheetName, string[]> = {
  POSITIONS: [
    "id",
    "title",
    "department",
    "location",
    "employment_type",
    "experience",
    "qualification",
    "description",
    "responsibilities",
    "requirements",
    "deadline",
    "status",
    "display_order",
    "created_at",
    "updated_at",
  ],
  DEPARTMENTS: ["id", "name", "description", "display_order", "active"],
  WITH_CV: [
    "id",
    "application_id",
    "position_id",
    "candidate_name",
    "email",
    "phone",
    "location",
    "experience_type",
    "experience_years",
    "experience",
    "qualification",
    "current_employer",
    "current_ctc",
    "current_gross",
    "expected_gross",
    "notice_period",
    "additional_info",
    "cv_file_id",
    "cv_filename",
    "status",
    "created_at",
    "payload",
    "form_snapshot",
    "status_history",
  ],
  WITHOUT_CV: [
    "id",
    "application_id",
    "position_id",
    "candidate_name",
    "email",
    "phone",
    "location",
    "experience",
    "qualification",
    "additional_info",
    "status",
    "created_at",
    "payload",
    "form_snapshot",
    "status_history",
  ],
  SETTINGS: ["key", "value"],
  AUDIT_LOG: ["id", "actor", "action", "target", "timestamp", "details"],
  FORM_FIELDS: [
    "id",
    "key",
    "label",
    "description",
    "type",
    "required",
    "visible",
    "system_field",
    "display_order",
    "active",
    "created_at",
    "updated_at",
    "section",
  ],
  FORM_OPTIONS: ["id", "field_id", "label", "value", "display_order", "active"],
  JOB_DETAILS: [
    "id",
    "position_id",
    "key",
    "label",
    "value",
    "type",
    "visible",
    "display_order",
    "active",
  ],
  APPLICATION_STATUSES: ["id", "name", "display_order", "active"],
};

export const ALL_SHEETS = Object.keys(SHEET_HEADERS) as SheetName[];

/** Converts any value to the string form stored in Google Sheets. */
export function cellToString(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  return JSON.stringify(value);
}

export function buildRow(sheet: SheetName, object: object): string[] {
  const record = object as Record<string, unknown>;
  const headers = SHEET_HEADERS[sheet];
  return headers.map((header) => cellToString(record[header]));
}

export function rowToObject(
  sheet: SheetName,
  headers: string[],
  row: string[],
): Row {
  const object: Row = {};
  const canonical = SHEET_HEADERS[sheet];
  const effectiveHeaders = headers.length ? headers : canonical;
  effectiveHeaders.forEach((header, index) => {
    if (header) object[header] = row[index] ?? "";
  });
  // Keep canonical fields present even if a newer column is not in the sheet.
  for (const header of canonical) {
    if (!(header in object)) object[header] = "";
  }
  return object;
}

export function columnLetter(index: number): string {
  // 1 -> A, 26 -> Z, 27 -> AA
  let result = "";
  let current = index;
  while (current > 0) {
    const remainder = (current - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    current = Math.floor((current - 1) / 26);
  }
  return result;
}
