import { getStore } from "@/lib/data";
import type { AuditEntry } from "@/lib/types";
import { randomId, safeJsonParse } from "@/lib/utils";

export async function recordAudit(input: {
  actor: string;
  action: string;
  target: string;
  details?: string | Record<string, unknown>;
}): Promise<void> {
  try {
    const store = await getStore();
    const details =
      typeof input.details === "string"
        ? input.details
        : input.details
          ? JSON.stringify(input.details)
          : "";
    const entry: AuditEntry = {
      id: randomId("audit"),
      actor: input.actor.slice(0, 160),
      action: input.action.slice(0, 120),
      target: input.target.slice(0, 200),
      timestamp: new Date().toISOString(),
      details: details.slice(0, 2000),
    };
    await store.appendMany("AUDIT_LOG", [entry]);
  } catch (error) {
    // Auditing must never break the recruitment workflow.
    console.error("Failed to write audit entry", error);
  }
}

export async function getAllAuditEntries(): Promise<AuditEntry[]> {
  const store = await getStore();
  const rows = await store.list("AUDIT_LOG");
  return rows
    .map((row) => ({
      id: row.id ?? "",
      actor: row.actor ?? "",
      action: row.action ?? "",
      target: row.target ?? "",
      timestamp: row.timestamp ?? "",
      details: row.details ?? "",
    }))
    .filter((entry) => entry.id)
    .sort(
      (a, b) =>
        Date.parse(b.timestamp || "1970-01-01") -
        Date.parse(a.timestamp || "1970-01-01"),
    );
}

export interface AuditListResult {
  items: AuditEntry[];
  total: number;
  page: number;
  pages: number;
  actions: string[];
}

export async function listAuditEntries(options: {
  q?: string;
  action?: string;
  page?: number;
  pageSize?: number;
}): Promise<AuditListResult> {
  const all = await getAllAuditEntries();
  const actions = [...new Set(all.map((entry) => entry.action))].sort();

  let entries = all;
  if (options.action) {
    entries = entries.filter((entry) => entry.action === options.action);
  }
  const query = (options.q ?? "").trim().toLowerCase();
  if (query) {
    entries = entries.filter((entry) =>
      [entry.actor, entry.action, entry.target, entry.details]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  const pageSize = Math.min(Math.max(options.pageSize ?? 25, 1), 100);
  const total = entries.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(options.page ?? 1, 1), pages);
  const start = (page - 1) * pageSize;

  return {
    items: entries.slice(start, start + pageSize),
    total,
    page,
    pages,
    actions,
  };
}

export function parseAuditDetails(details: string): Record<string, unknown> | null {
  const parsed = safeJsonParse<Record<string, unknown>>(details, {});
  return parsed && typeof parsed === "object" && Object.keys(parsed).length
    ? parsed
    : null;
}
