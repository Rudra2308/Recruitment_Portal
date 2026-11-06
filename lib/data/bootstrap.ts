import { DEFAULT_SETTINGS } from "@/lib/defaults";
import {
  buildSeedDepartments,
  buildSeedFormFields,
  buildSeedFormOptions,
  buildSeedJobDetails,
  buildSeedJobs,
  buildSeedSettings,
  buildSeedStatuses,
} from "@/lib/seed";
import type { DataStore } from "@/lib/data/store";

const SEED_VERSION = "4.0.0";

/**
 * Idempotent first-run setup. It creates missing configuration rows without
 * overwriting anything an administrator has already changed.
 */
export async function seedIfEmpty(store: DataStore): Promise<void> {
  const existingSettings = await store.getSettings();
  const [positions, formFields] = await Promise.all([
    store.list("POSITIONS"),
    store.list("FORM_FIELDS"),
  ]);

  // The version marker means bootstrap already ran. Never re-seed over data an
  // administrator may have deliberately removed.
  if (existingSettings.seed_version === SEED_VERSION && formFields.length > 0) {
    return;
  }

  const now = new Date();

  const departments = await store.list("DEPARTMENTS");
  if (!departments.length) {
    await store.appendMany("DEPARTMENTS", buildSeedDepartments());
  }

  let seededPositions = false;
  if (!positions.length) {
    await store.appendMany("POSITIONS", buildSeedJobs(now));
    seededPositions = true;
  }

  if (!formFields.length) {
    await store.appendMany("FORM_FIELDS", buildSeedFormFields(now));
  }

  const options = await store.list("FORM_OPTIONS");
  if (!options.length) {
    await store.appendMany("FORM_OPTIONS", buildSeedFormOptions());
  }

  const statuses = await store.list("APPLICATION_STATUSES");
  if (!statuses.length) {
    await store.appendMany("APPLICATION_STATUSES", buildSeedStatuses());
  }

  const details = await store.list("JOB_DETAILS");
  if (!details.length && seededPositions) {
    await store.appendMany("JOB_DETAILS", buildSeedJobDetails(now));
  }

  const defaults = { ...DEFAULT_SETTINGS, ...buildSeedSettings() };
  const missingSettings: Record<string, string> = {};
  for (const [key, value] of Object.entries(defaults)) {
    if (existingSettings[key] === undefined || existingSettings[key] === "") {
      missingSettings[key] = value;
    }
  }
  // Never overwrite an existing recruitment status, including CLOSED.
  if (existingSettings.recruitment_status) {
    delete missingSettings.recruitment_status;
  }
  missingSettings.seed_version = SEED_VERSION;

  await store.setSettings(missingSettings);
}
