/**
 * Shared domain types for the Malati Group recruitment portal.
 *
 * Google Sheets returns every cell as a string; the repository normalises
 * values into these types before they reach the UI.
 */

export type JobStatus = "DRAFT" | "OPEN" | "CLOSED";

export type RecruitmentStatus = "OPEN" | "PAUSED" | "CLOSED";

export type FieldType =
  | "text"
  | "email"
  | "phone"
  | "number"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "file";

export type JobDetailType = "text" | "number" | "date" | "select" | "long_text";

export interface Position {
  id: string;
  title: string;
  department: string;
  location: string;
  employment_type: string;
  experience: string;
  qualification: string;
  description: string;
  responsibilities: string;
  requirements: string;
  deadline: string;
  status: JobStatus;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface Department {
  id: string;
  name: string;
  description: string;
  display_order: number;
  active: boolean;
}

export interface FormField {
  id: string;
  key: string;
  label: string;
  description: string;
  type: FieldType;
  required: boolean;
  visible: boolean;
  system_field: boolean;
  display_order: number;
  active: boolean;
  /** Presentation grouping: Personal, Professional, Documents, … */
  section: string;
  created_at: string;
  updated_at: string;
}

export interface FormOption {
  id: string;
  field_id: string;
  label: string;
  value: string;
  display_order: number;
  active: boolean;
}

export interface JobDetail {
  id: string;
  position_id: string;
  key: string;
  label: string;
  value: string;
  type: JobDetailType;
  visible: boolean;
  display_order: number;
  active: boolean;
}

export interface ApplicationStatus {
  id: string;
  name: string;
  display_order: number;
  active: boolean;
}

export interface StatusHistoryEntry {
  status: string;
  at: string;
  by: string;
}

/** Raw value stored for a submitted form field. */
export type FieldValue = string | boolean;

export type ApplicationPayload = Record<string, FieldValue>;

export interface FormSnapshotField {
  id: string;
  key: string;
  label: string;
  type: FieldType;
  section: string;
  required: boolean;
  display_order: number;
  options: { label: string; value: string }[];
}

export interface FormSnapshot {
  fields: FormSnapshotField[];
  captured_at: string;
  job_id: string;
  job_title: string;
}

export interface Application {
  id: string;
  application_id: string;
  position_id: string;
  candidate_name: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
  qualification: string;
  additional_info: string;
  cv_file_id: string;
  cv_filename: string;
  status: string;
  created_at: string;
  payload: ApplicationPayload;
  form_snapshot: FormSnapshot | null;
  status_history: StatusHistoryEntry[];
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}

export interface Settings {
  company_name: string;
  contact_email: string;
  contact_phone: string;
  portal_location: string;
  recruitment_status: RecruitmentStatus;
  hero_heading: string;
  hero_subheading: string;
  hero_support: string;
  [key: string]: string;
}

export interface ResolvedField extends FormField {
  options: FormOption[];
  /** True when a job-level override changed required/visible. */
  overridden: boolean;
  inherited_required: boolean;
  inherited_visible: boolean;
}

export interface JobFormOverride {
  required?: boolean;
  visible?: boolean;
}

export type JobFormOverrides = Record<string, Record<string, JobFormOverride>>;

/** State returned by every admin server action. */
export interface ActionState {
  ok: boolean;
  error?: string;
  message?: string;
  redirectTo?: string;
}

export const EMPTY_ACTION_STATE: ActionState = { ok: false };
