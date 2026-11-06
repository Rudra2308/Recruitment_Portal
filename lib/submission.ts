import { getActiveStatuses, resolveFormFields } from "@/lib/data/config";
import { createApplication } from "@/lib/data/applications";
import {
  getPositionById,
  isJobLive,
} from "@/lib/data/jobs";
import { getSettings } from "@/lib/data/settings";
import { deleteCv, uploadCv } from "@/lib/google/drive";
import { isUploadedFile, validateCvFile } from "@/lib/files";
import type {
  Application,
  ApplicationPayload,
  FormSnapshot,
  Position,
  ResolvedField,
} from "@/lib/types";
import { isEmail, isPhone } from "@/lib/utils";

export interface SubmissionResult {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
  application?: Application;
  position?: Position;
}

function stringValue(value: FormDataEntryValue | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function findMatchingOption(field: ResolvedField, value: string) {
  if (!value) return null;
  const valLower = value.toLowerCase().trim();
  return (
    field.options.find(
      (opt) =>
        opt.value === value ||
        opt.value.toLowerCase() === valLower ||
        opt.label.toLowerCase() === valLower,
    ) ?? null
  );
}

function optionsError(field: ResolvedField, value: string): string | null {
  if (!value) return null;
  if (!findMatchingOption(field, value)) {
    return "Choose a valid option.";
  }
  return null;
}

function validateField(
  field: ResolvedField,
  formData: FormData,
  values: ApplicationPayload,
  errors: Record<string, string>,
  fileState: { file: File | null },
): void {
  if (field.type === "file") {
    const entry = formData.get(field.key);
    if (isUploadedFile(entry) && entry.size > 0) {
      fileState.file = entry;
      values[field.key] = entry.name;
    } else if (field.required) {
      errors[field.key] = "Upload your resume to continue.";
    }
    return;
  }

  if (field.type === "checkbox") {
    const raw = formData.get(field.key);
    const checked =
      raw === "on" || raw === "true" || raw === "yes" || raw === "1";
    values[field.key] = checked;
    if (field.required && !checked) {
      errors[field.key] = "Please tick this box to continue.";
    }
    return;
  }

  const value = stringValue(formData.get(field.key));
  const limit =
    field.type === "textarea"
      ? 5000
      : field.type === "email"
        ? 254
        : field.type === "phone"
          ? 40
          : field.type === "date"
            ? 10
            : field.type === "number"
              ? 50
              : 500;

  if (value.length > limit) {
    errors[field.key] = `Keep this under ${limit} characters.`;
    return;
  }

  if (!value) {
    if (field.required) {
      errors[field.key] =
        field.type === "select" || field.type === "radio"
          ? "Choose an option to continue."
          : "This field is required.";
    } else {
      values[field.key] = "";
    }
    return;
  }

  if (field.type === "email" && !isEmail(value)) {
    errors[field.key] = "Enter a valid email address.";
    return;
  }
  if (field.type === "phone" && !isPhone(value)) {
    errors[field.key] = "Enter a valid phone number.";
    return;
  }
  if (field.type === "number" && !Number.isFinite(Number(value))) {
    errors[field.key] = "Enter a valid number.";
    return;
  }
  if (field.type === "date") {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
      errors[field.key] = "Enter a valid date.";
      return;
    }
  }
  if (field.type === "select" || field.type === "radio") {
    const match = findMatchingOption(field, value);
    if (!match) {
      errors[field.key] = "Choose a valid option.";
      return;
    }
    values[field.key] = match.label;
    return;
  }

  values[field.key] = value;
}

function buildSnapshot(
  position: Position,
  fields: ResolvedField[],
): FormSnapshot {
  return {
    captured_at: new Date().toISOString(),
    job_id: position.id,
    job_title: position.title,
    fields: fields.map((field) => ({
      id: field.id,
      key: field.key,
      label: field.label,
      type: field.type,
      section: field.section,
      required: field.required,
      display_order: field.display_order,
      options: field.options.map((option) => ({
        label: option.label,
        value: option.value,
      })),
    })),
  };
}

function coreString(values: ApplicationPayload, key: string): string {
  const value = values[key];
  return typeof value === "string" ? value : "";
}

/**
 * Validates and stores a public application. This is the single server-side
 * authority for required/visible rules, job overrides and file validation.
 */
export async function submitApplication(
  formData: FormData,
): Promise<SubmissionResult> {
  // Honeypot: real candidates never see or fill this field.
  if (stringValue(formData.get("company_website"))) {
    return { ok: false, error: "We could not process this submission." };
  }

  const positionId = stringValue(formData.get("position_id")).slice(0, 160);
  if (!positionId) {
    return { ok: false, error: "Select a position before applying." };
  }

  const [position, settings] = await Promise.all([
    getPositionById(positionId),
    getSettings(),
  ]);

  if (!position) {
    return { ok: false, error: "This position could not be found." };
  }
  if (settings.recruitment_status !== "OPEN") {
    return {
      ok: false,
      error:
        "Applications are currently paused. Please check back when recruitment reopens.",
    };
  }
  if (!isJobLive(position)) {
    return {
      ok: false,
      error: "Applications for this position are closed.",
    };
  }

  const fields = await resolveFormFields(position.id);
  if (!fields.length) {
    return {
      ok: false,
      error: "This application form is not configured yet.",
    };
  }

  const values: ApplicationPayload = {};
  const errors: Record<string, string> = {};
  const fileState: { file: File | null } = { file: null };

  for (const field of fields) {
    validateField(field, formData, values, errors, fileState);
  }

  // Handle conditional logic for Fresher vs Experienced
  const expType = coreString(values, "experience_type").toLowerCase();
  const cvField = fields.find((field) => field.type === "file");

  if (expType === "fresher") {
    // Freshers do not need compensation or prior employer fields
    delete errors.current_employer;
    delete errors.experience_years;
    delete errors.current_ctc;
    delete errors.current_gross;
    delete errors.expected_gross;
    delete errors.notice_period;

    values.current_employer = "N/A - Fresher";
    values.experience_years = "0";
    values.current_ctc = "N/A";
    values.current_gross = "N/A";
    values.expected_gross = coreString(values, "expected_gross") || "N/A";
    values.notice_period = "Immediate";
    values.experience = "Fresher (0 yrs)";
  } else if (expType === "experienced") {
    // Experienced candidates must provide their previous employment details
    if (!coreString(values, "current_employer")) {
      errors.current_employer = "Enter your current or last employer.";
    }
    if (!coreString(values, "experience_years")) {
      errors.experience_years = "Enter your total years of experience.";
    }
    if (!coreString(values, "current_ctc")) {
      errors.current_ctc = "Enter your current CTC.";
    }
    if (!coreString(values, "current_gross")) {
      errors.current_gross = "Enter your current gross salary.";
    }
    if (!coreString(values, "expected_gross")) {
      errors.expected_gross = "Enter your expected gross salary.";
    }
    if (!coreString(values, "notice_period")) {
      errors.notice_period = "Select your notice period.";
    }
    values.experience = `${coreString(values, "experience_years")} (${coreString(values, "current_employer")})`;
  } else if (!errors.experience_type) {
    errors.experience_type = "Please select whether you are a Fresher or Experienced.";
  }

  // CV is strictly required for all applicants
  if (!fileState.file || fileState.file.size === 0) {
    errors[cvField?.key ?? "cv"] = "Upload your resume / CV to continue.";
  } else {
    const validation = await validateCvFile(fileState.file);
    if (!validation.ok) {
      errors[cvField?.key ?? "cv"] = validation.error ?? "Invalid file.";
    }
  }

  if (Object.keys(errors).length) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: errors,
    };
  }

  const statuses = await getActiveStatuses();
  const initialStatus =
    statuses.find((status) => status.name.toUpperCase() === "NEW")?.name ??
    statuses[0]?.name ??
    "NEW";

  let uploaded: { fileId: string; filename: string };
  try {
    uploaded = await uploadCv(fileState.file!);
  } catch (error) {
    console.error("CV upload failed", error);
    return {
      ok: false,
      error:
        "Your CV could not be uploaded right now. Please try again in a moment.",
    };
  }

  try {
    const application = await createApplication({
      position_id: position.id,
      candidate_name: coreString(values, "candidate_name"),
      email: coreString(values, "email"),
      phone: coreString(values, "phone"),
      location: coreString(values, "location"),
      experience_type: expType === "fresher" ? "Fresher" : "Experienced",
      experience_years: coreString(values, "experience_years"),
      experience: coreString(values, "experience") || "Fresher",
      qualification: coreString(values, "qualification"),
      current_employer: coreString(values, "current_employer"),
      current_ctc: coreString(values, "current_ctc"),
      current_gross: coreString(values, "current_gross"),
      expected_gross: coreString(values, "expected_gross"),
      notice_period: coreString(values, "notice_period"),
      additional_info: coreString(values, "additional_info"),
      cv_file_id: uploaded.fileId,
      cv_filename: uploaded.filename,
      status: initialStatus,
      payload: values,
      form_snapshot: buildSnapshot(position, fields),
    });

    return { ok: true, application, position };
  } catch (error) {
    console.error("Application storage failed", error);
    if (uploaded) await deleteCv(uploaded.fileId);
    return {
      ok: false,
      error:
        "Your application could not be saved right now. Please try again in a moment.",
    };
  }
}
