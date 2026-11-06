"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";

import { requireAdmin, type AdminSession } from "@/lib/auth";
import { countApplicationsForPosition, updateApplicationStatus } from "@/lib/data/applications";
import { recordAudit } from "@/lib/data/audit";
import {
  clearJobFormOverrides,
  createFormField,
  createFormOption,
  createJobDetail,
  createStatus,
  deleteFormField,
  deleteFormOption,
  deleteJobDetail,
  deleteStatus,
  FORM_FIELD_TYPES,
  getFormFieldById,
  JOB_DETAIL_TYPES,
  moveFormField,
  moveFormOption,
  moveJobDetail,
  moveStatus,
  setJobFormOverride,
  updateFormField,
  updateFormOption,
  updateJobDetail,
  updateStatus,
} from "@/lib/data/config";
import {
  createDepartment,
  deleteDepartment,
  moveDepartment,
  updateDepartment,
} from "@/lib/data/departments";
import {
  createPosition,
  deletePosition,
  getPositionById,
  JOB_STATUSES,
  movePosition,
  updatePosition,
  updatePositionStatus,
} from "@/lib/data/jobs";
import { getSettings, updateSettings } from "@/lib/data/settings";
import { sendStatusNotification } from "@/lib/email";
import type {
  ActionState,
  FieldType,
  JobDetailType,
  JobStatus,
  RecruitmentStatus,
} from "@/lib/types";
import { isEmail } from "@/lib/utils";

function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function checked(formData: FormData, key: string): boolean {
  const value = formData.get(key);
  return value === "on" || value === "true" || value === "1" || value === "yes";
}

function fail(error: unknown): ActionState {
  if (error instanceof Error) {
    return { ok: false, error: error.message };
  }
  console.error("Admin action failed", error);
  return { ok: false, error: "Something went wrong. Please try again." };
}

function ok(message?: string, redirectTo?: string): ActionState {
  return { ok: true, message, redirectTo };
}

function refresh() {
  // Recruitment data feeds both portals; invalidate the whole route tree so
  // candidate pages and every admin view see the change immediately.
  revalidatePath("/", "layout");
}

async function audit(
  session: AdminSession,
  action: string,
  target: string,
  details?: Record<string, unknown>,
): Promise<void> {
  await recordAudit({
    actor: session.email,
    action,
    target,
    details: details ?? {},
  });
}

/* ------------------------------------------------------------------ Jobs */

export async function saveJobAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const status = text(formData, "status") as JobStatus;
    if (!JOB_STATUSES.includes(status)) {
      return { ok: false, error: "Choose a valid job status." };
    }

    const input = {
      title: text(formData, "title"),
      department: text(formData, "department"),
      location: text(formData, "location"),
      employment_type: text(formData, "employment_type") || "Full-time",
      experience: text(formData, "experience"),
      qualification: text(formData, "qualification"),
      description: text(formData, "description"),
      responsibilities: text(formData, "responsibilities"),
      requirements: text(formData, "requirements"),
      deadline: text(formData, "deadline"),
      status,
    };

    if (id) {
      const previous = await getPositionById(id);
      if (!previous) return { ok: false, error: "Job not found." };
      const updated = await updatePosition(id, input);

      let action = "Job edited";
      if (previous.status !== updated.status) {
        action =
          updated.status === "OPEN"
            ? "Job published"
            : updated.status === "CLOSED"
              ? "Job closed"
              : "Job moved to draft";
      }
      await audit(session, action, updated.title, {
        job_id: updated.id,
        department: updated.department,
        status: updated.status,
        deadline: updated.deadline,
      });
      refresh();
      return ok("Job saved.");
    }

    const created = await createPosition(input);
    await audit(session, "Job created", created.title, {
      job_id: created.id,
      department: created.department,
      status: created.status,
    });
    refresh();
    return ok("Job created.", `/admin/jobs/${created.id}?created=1`);
  } catch (error) {
    return fail(error);
  }
}

export async function setJobStatusAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const status = text(formData, "status") as JobStatus;
    const position = await getPositionById(id);
    if (!position) return { ok: false, error: "Job not found." };
    await updatePositionStatus(id, status);
    const action =
      status === "OPEN"
        ? "Job published"
        : status === "CLOSED"
          ? "Job closed"
          : "Job moved to draft";
    await audit(session, action, position.title, {
      job_id: position.id,
      previous_status: position.status,
      status,
    });
    refresh();
    return ok(
      status === "OPEN"
        ? "Job is now open."
        : status === "CLOSED"
          ? "Job closed."
          : "Job moved to draft.",
    );
  } catch (error) {
    return fail(error);
  }
}

export async function deleteJobAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const position = await getPositionById(id);
    if (!position) return { ok: false, error: "Job not found." };

    const applications = await countApplicationsForPosition(id);
    if (applications > 0) {
      return {
        ok: false,
        error: `This job has ${applications} application${
          applications === 1 ? "" : "s"
        }. Close it instead of deleting so the history is preserved.`,
      };
    }

    await deletePosition(id);
    await audit(session, "Job deleted", position.title, { job_id: id });
    refresh();
    return ok("Job deleted.", "/admin/jobs");
  } catch (error) {
    return fail(error);
  }
}

export async function moveJobAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    const direction = text(formData, "direction") === "up" ? "up" : "down";
    await movePosition(id, direction);
    refresh();
    return ok("Order updated.");
  } catch (error) {
    return fail(error);
  }
}

/* ----------------------------------------------------------- Job details */

export async function saveJobDetailAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const positionId = text(formData, "position_id");
    const label = text(formData, "label");
    const value = text(formData, "value");
    const rawType = text(formData, "type") as JobDetailType;
    const type = JOB_DETAIL_TYPES.includes(rawType) ? rawType : "text";
    const visible = checked(formData, "visible");
    const position = await getPositionById(positionId);
    if (!position) return { ok: false, error: "Job not found." };

    if (id) {
      await updateJobDetail(id, { label, value, type, visible });
      await audit(session, "Job detail updated", position.title, {
        job_id: positionId,
        label,
        type,
        visible,
      });
      refresh();
      return ok("Detail saved.");
    }

    await createJobDetail({ position_id: positionId, label, value, type });
    await audit(session, "Job detail added", position.title, {
      job_id: positionId,
      label,
      type,
    });
    refresh();
    return ok("Detail added.");
  } catch (error) {
    return fail(error);
  }
}

export async function deleteJobDetailAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const positionId = text(formData, "position_id");
    const position = await getPositionById(positionId);
    await deleteJobDetail(id);
    await audit(session, "Job detail removed", position?.title ?? positionId, {
      job_id: positionId,
      detail_id: id,
    });
    refresh();
    return ok("Detail removed.");
  } catch (error) {
    return fail(error);
  }
}

export async function moveJobDetailAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    const direction = text(formData, "direction") === "up" ? "up" : "down";
    await moveJobDetail(id, direction);
    refresh();
    return ok("Order updated.");
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------------------------- Job form overrides */

export async function saveJobOverrideAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const jobId = text(formData, "job_id");
    const fieldId = text(formData, "field_id");
    const requiredMode = text(formData, "required_mode");
    const visibleMode = text(formData, "visible_mode");

    const field = await getFormFieldById(fieldId);
    if (!field) return { ok: false, error: "Field not found." };

    const override: { required?: boolean; visible?: boolean } = {};
    if (requiredMode === "required") override.required = true;
    if (requiredMode === "optional") override.required = false;
    if (visibleMode === "visible") override.visible = true;
    if (visibleMode === "hidden") override.visible = false;

    await setJobFormOverride(
      jobId,
      fieldId,
      Object.keys(override).length ? override : null,
    );
    await audit(session, "Job form override updated", field.label, {
      job_id: jobId,
      field_id: fieldId,
      ...override,
    });
    refresh();
    return ok("Override saved.");
  } catch (error) {
    return fail(error);
  }
}

export async function clearJobOverridesAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const jobId = text(formData, "job_id");
    const position = await getPositionById(jobId);
    await clearJobFormOverrides(jobId);
    await audit(
      session,
      "Job form overrides cleared",
      position?.title ?? jobId,
      { job_id: jobId },
    );
    refresh();
    return ok("Overrides cleared.");
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------------------------------------ Departments */

export async function saveDepartmentAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const name = text(formData, "name");
    const description = text(formData, "description");
    const active = checked(formData, "active");

    if (id) {
      const updated = await updateDepartment(id, { name, description, active });
      await audit(session, "Department updated", updated.name, {
        department_id: id,
        active,
      });
      refresh();
      return ok("Department saved.");
    }

    const created = await createDepartment({ name, description, active });
    await audit(session, "Department created", created.name, {
      department_id: created.id,
    });
    refresh();
    return ok("Department created.");
  } catch (error) {
    return fail(error);
  }
}

export async function deleteDepartmentAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    await deleteDepartment(id);
    await audit(session, "Department deleted", id, { department_id: id });
    refresh();
    return ok("Department deleted.");
  } catch (error) {
    return fail(error);
  }
}

export async function moveDepartmentAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    const direction = text(formData, "direction") === "up" ? "up" : "down";
    await moveDepartment(id, direction);
    refresh();
    return ok("Order updated.");
  } catch (error) {
    return fail(error);
  }
}

/* ----------------------------------------------------------- Form fields */

export async function saveFormFieldAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const label = text(formData, "label");
    const description = text(formData, "description");
    const section = text(formData, "section") || "Additional";
    const rawType = text(formData, "type") as FieldType;
    const type = FORM_FIELD_TYPES.includes(rawType) ? rawType : "text";
    const required = checked(formData, "required");
    const visible = checked(formData, "visible");

    if (id) {
      await updateFormField(id, {
        label,
        description,
        type,
        required,
        visible,
        section,
      });
      await audit(
        session,
        visible ? "Form field edited" : "Form field hidden",
        label,
        { field_id: id, required, visible, section },
      );
      refresh();
      return ok("Field saved.");
    }

    const created = await createFormField({
      key: text(formData, "key"),
      label,
      description,
      type,
      required,
      visible,
      section,
    });
    await audit(session, "Form field added", created.label, {
      field_id: created.id,
      type: created.type,
      required: created.required,
      visible: created.visible,
    });
    refresh();
    return ok("Field created.", `/admin/config/form/${created.id}?created=1`);
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFormFieldAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const field = await getFormFieldById(id);
    await deleteFormField(id);
    await audit(session, "Form field removed", field?.label ?? id, {
      field_id: id,
    });
    refresh();
    return ok("Field removed.", "/admin/config/form");
  } catch (error) {
    return fail(error);
  }
}

export async function moveFormFieldAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    const direction = text(formData, "direction") === "up" ? "up" : "down";
    await moveFormField(id, direction);
    refresh();
    return ok("Order updated.");
  } catch (error) {
    return fail(error);
  }
}

export async function saveFormOptionAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const fieldId = text(formData, "field_id");
    const label = text(formData, "label");
    const active = checked(formData, "active");

    if (id) {
      await updateFormOption(id, { label, active });
      await audit(session, "Form option edited", label, {
        field_id: fieldId,
        option_id: id,
        active,
      });
      refresh();
      return ok("Option saved.");
    }

    const created = await createFormOption({ field_id: fieldId, label });
    await audit(session, "Form option added", created.label, {
      field_id: fieldId,
      option_id: created.id,
    });
    refresh();
    return ok("Option added.");
  } catch (error) {
    return fail(error);
  }
}

export async function deleteFormOptionAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const fieldId = text(formData, "field_id");
    await deleteFormOption(id);
    await audit(session, "Form option removed", id, {
      field_id: fieldId,
      option_id: id,
    });
    refresh();
    return ok("Option removed.");
  } catch (error) {
    return fail(error);
  }
}

export async function moveFormOptionAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    const direction = text(formData, "direction") === "up" ? "up" : "down";
    await moveFormOption(id, direction);
    refresh();
    return ok("Order updated.");
  } catch (error) {
    return fail(error);
  }
}

/* -------------------------------------------------------------- Statuses */

export async function saveStatusAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    const name = text(formData, "name");
    const active = checked(formData, "active");

    if (id) {
      await updateStatus(id, { name, active });
      await audit(session, "Applicant status edited", name, {
        status_id: id,
        active,
      });
      refresh();
      return ok("Status saved.");
    }

    const created = await createStatus(name);
    await audit(session, "Applicant status added", created.name, {
      status_id: created.id,
    });
    refresh();
    return ok("Status added.");
  } catch (error) {
    return fail(error);
  }
}

export async function deleteStatusAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const id = text(formData, "id");
    await deleteStatus(id);
    await audit(session, "Applicant status removed", id, { status_id: id });
    refresh();
    return ok("Status removed.");
  } catch (error) {
    return fail(error);
  }
}

export async function moveStatusAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await requireAdmin();
  try {
    const id = text(formData, "id");
    const direction = text(formData, "direction") === "up" ? "up" : "down";
    await moveStatus(id, direction);
    refresh();
    return ok("Order updated.");
  } catch (error) {
    return fail(error);
  }
}

/* ------------------------------------------------------------ Applicants */

export async function updateApplicantStatusAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const applicationId = text(formData, "application_id");
    const status = text(formData, "status");
    if (!status) return { ok: false, error: "Choose a status." };

    const updated = await updateApplicationStatus(
      applicationId,
      status,
      session.email,
    );
    await audit(session, "Applicant status changed", updated.application_id, {
      application_id: updated.application_id,
      candidate: updated.candidate_name,
      status,
    });

    const position = await getPositionById(updated.position_id);
    after(async () => {
      try {
        await sendStatusNotification(updated, position, status);
      } catch (error) {
        console.error("Applicant status email failed", error);
      }
    });

    refresh();
    return ok(`Status changed to ${status}.`);
  } catch (error) {
    return fail(error);
  }
}

/* -------------------------------------------------------------- Settings */

export async function saveSettingsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await requireAdmin();
  try {
    const recruitmentStatus = text(formData, "recruitment_status");
    if (!["OPEN", "PAUSED", "CLOSED"].includes(recruitmentStatus)) {
      return { ok: false, error: "Choose a valid recruitment status." };
    }

    const patch = {
      company_name: text(formData, "company_name"),
      contact_email: text(formData, "contact_email"),
      contact_phone: text(formData, "contact_phone"),
      portal_location: text(formData, "portal_location"),
      recruitment_status: recruitmentStatus as RecruitmentStatus,
      hero_heading: text(formData, "hero_heading"),
      hero_subheading: text(formData, "hero_subheading"),
      hero_support: text(formData, "hero_support"),
      hero_tag1: text(formData, "hero_tag1") || "No Account Required",
      hero_tag2: text(formData, "hero_tag2") || "Apply in 2 Minutes",
      positions_heading: text(formData, "positions_heading") || "Open Positions",
      positions_subheading:
        text(formData, "positions_subheading") ||
        "Select a role to view detailed responsibilities and submit your application.",
      departments_eyebrow: text(formData, "departments_eyebrow") || "Explore Functions",
      departments_heading: text(formData, "departments_heading") || "Hiring Departments",
      departments_link_text: text(formData, "departments_link_text") || "View all departments",
      process_step1_title: text(formData, "process_step1_title") || "Find Your Position",
      process_step1_desc:
        text(formData, "process_step1_desc") ||
        "Explore roles across foundry, machining, quality, and administrative teams.",
      process_step2_title: text(formData, "process_step2_title") || "Quick Online Application",
      process_step2_desc:
        text(formData, "process_step2_desc") ||
        "Complete the short form on any phone or desktop and attach your CV.",
      process_step3_title: text(formData, "process_step3_title") || "Direct Review by HR",
      process_step3_desc:
        text(formData, "process_step3_desc") ||
        "Every submission goes straight to the Malati Group recruitment desk for interview scheduling.",
      contact_banner_title: text(formData, "contact_banner_title") || "Questions about applying?",
      contact_banner_desc:
        text(formData, "contact_banner_desc") ||
        "Contact our recruitment and HR team directly during working hours.",
    };

    if (!patch.company_name) return { ok: false, error: "Company name is required." };
    if (!patch.contact_email || !isEmail(patch.contact_email)) {
      return { ok: false, error: "Enter a valid contact email." };
    }
    if (!patch.contact_phone) return { ok: false, error: "Contact phone is required." };
    if (!patch.portal_location) return { ok: false, error: "Portal location is required." };
    if (!patch.hero_heading) return { ok: false, error: "Landing headline is required." };

    const previous = await getSettings();
    await updateSettings(patch);

    const changed = Object.entries(patch)
      .filter(([key, value]) => previous[key] !== value)
      .map(([key]) => key);
    await audit(session, "Settings changed", "Portal settings", {
      changed,
      recruitment_status: patch.recruitment_status,
    });
    refresh();
    return ok("Settings saved.");
  } catch (error) {
    return fail(error);
  }
}
