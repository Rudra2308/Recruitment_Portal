import { cache } from "react";

import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { getStore } from "@/lib/data";
import type { RecruitmentStatus, Settings } from "@/lib/types";

const VALID_STATUSES: RecruitmentStatus[] = ["OPEN", "PAUSED", "CLOSED"];

export const getSettings = cache(async function getSettings(): Promise<Settings> {
  const store = await getStore();
  const raw = await store.getSettings();
  const merged: Settings = { ...DEFAULT_SETTINGS };

  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") merged[key] = value;
  }

  if (!VALID_STATUSES.includes(merged.recruitment_status as RecruitmentStatus)) {
    merged.recruitment_status = "OPEN";
  }

  return merged;
});

export async function updateSettings(
  patch: Partial<Record<keyof Settings, string>>,
): Promise<void> {
  const store = await getStore();
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(patch)) {
    if (typeof value === "string") cleaned[key] = value.trim();
  }
  if (cleaned.recruitment_status) {
    if (!VALID_STATUSES.includes(cleaned.recruitment_status as RecruitmentStatus)) {
      throw new Error("Invalid recruitment status.");
    }
  }
  await store.setSettings(cleaned);
}

export async function isRecruitmentOpen(): Promise<boolean> {
  const settings = await getSettings();
  return settings.recruitment_status === "OPEN";
}

export function recruitmentStatusLabel(status: RecruitmentStatus): string {
  switch (status) {
    case "OPEN":
      return "Accepting applications";
    case "PAUSED":
      return "Applications paused";
    case "CLOSED":
      return "Recruitment closed";
    default:
      return status;
  }
}
