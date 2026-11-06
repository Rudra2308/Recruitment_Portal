import { randomBytes, randomUUID } from "node:crypto";

import { getStore } from "@/lib/data";
import { getAllStatuses } from "@/lib/data/config";
import { getAllPositions } from "@/lib/data/jobs";
import type { Row, SheetName } from "@/lib/data/store";
import type {
  Application,
  ApplicationPayload,
  FormSnapshot,
  StatusHistoryEntry,
} from "@/lib/types";
import { dateOnlyIST, safeJsonParse, todayISO } from "@/lib/utils";

const APPLICATION_SHEETS = ["WITH_CV", "WITHOUT_CV"] as const;

export interface ApplicationWithJob extends Application {
  position_title: string;
  position_department: string;
}

export function generateApplicationId(now = new Date()): string {
  const [year, month] = new Intl.DateTimeFormat("en-CA", {
    year: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Kolkata",
  })
    .format(now)
    .split("-");
  const random = randomBytes(3).toString("hex").toUpperCase();
  return `MG-${year}${month}-${random}`;
}

function parseHistory(value: string | undefined, fallback: StatusHistoryEntry[]): StatusHistoryEntry[] {
  const parsed = safeJsonParse<StatusHistoryEntry[]>(value, []);
  if (!Array.isArray(parsed)) return fallback;
  return parsed.filter(
    (entry) =>
      entry &&
      typeof entry.status === "string" &&
      typeof entry.at === "string",
  );
}

function parseApplication(row: Row): Application {
  const corePayload: ApplicationPayload = {
    candidate_name: row.candidate_name ?? "",
    email: row.email ?? "",
    phone: row.phone ?? "",
    gender: row.gender ?? "",
    location: row.location ?? "",
    experience_type: row.experience_type ?? "",
    experience_years: row.experience_years ?? "",
    experience: row.experience ?? "",
    qualification: row.qualification ?? "",
    current_employer: row.current_employer ?? "",
    current_ctc: row.current_ctc ?? "",
    current_gross: row.current_gross ?? "",
    expected_gross: row.expected_gross ?? "",
    notice_period: row.notice_period ?? "",
    additional_info: row.additional_info ?? "",
  };
  const payloadRaw = safeJsonParse<ApplicationPayload>(row.payload, corePayload);
  const payload =
    payloadRaw && typeof payloadRaw === "object" ? payloadRaw : corePayload;
  const snapshot = safeJsonParse<FormSnapshot | null>(row.form_snapshot, null);
  const createdAt = row.created_at ?? "";
  const status = (row.status ?? "NEW").trim() || "NEW";
  const history = parseHistory(row.status_history, [
    { status, at: createdAt, by: "System" },
  ]);

  return {
    id: row.id ?? randomUUID(),
    application_id: (row.application_id ?? "").trim(),
    position_id: (row.position_id ?? "").trim(),
    candidate_name: (row.candidate_name ?? "").trim(),
    email: (row.email ?? "").trim(),
    phone: (row.phone ?? "").trim(),
    gender:
      (row.gender ?? "").trim() ||
      (typeof payload.gender === "string" ? payload.gender : ""),
    location: (row.location ?? "").trim(),
    experience_type:
      (row.experience_type ?? "").trim() ||
      (typeof payload.experience_type === "string" ? payload.experience_type : ""),
    experience_years:
      (row.experience_years ?? "").trim() ||
      (typeof payload.experience_years === "string" ? payload.experience_years : ""),
    experience: (row.experience ?? "").trim(),
    qualification: (row.qualification ?? "").trim(),
    current_employer:
      (row.current_employer ?? "").trim() ||
      (typeof payload.current_employer === "string" ? payload.current_employer : ""),
    current_ctc:
      (row.current_ctc ?? "").trim() ||
      (typeof payload.current_ctc === "string" ? payload.current_ctc : ""),
    current_gross:
      (row.current_gross ?? "").trim() ||
      (typeof payload.current_gross === "string" ? payload.current_gross : ""),
    expected_gross:
      (row.expected_gross ?? "").trim() ||
      (typeof payload.expected_gross === "string" ? payload.expected_gross : ""),
    notice_period:
      (row.notice_period ?? "").trim() ||
      (typeof payload.notice_period === "string" ? payload.notice_period : ""),
    additional_info: (row.additional_info ?? "").trim(),
    cv_file_id: (row.cv_file_id ?? "").trim(),
    cv_filename: (row.cv_filename ?? "").trim(),
    status,
    created_at: createdAt,
    payload,
    form_snapshot: snapshot && Array.isArray(snapshot.fields) ? snapshot : null,
    status_history: history,
  };
}

async function readApplications(): Promise<Application[]> {
  const store = await getStore();
  const [withCv, withoutCv] = await Promise.all([
    store.list("WITH_CV"),
    store.list("WITHOUT_CV"),
  ]);
  return [...withCv, ...withoutCv].map(parseApplication);
}

export interface CreateApplicationInput {
  position_id: string;
  candidate_name: string;
  email: string;
  phone: string;
  gender?: string;
  location: string;
  experience_type?: string;
  experience_years?: string;
  experience: string;
  qualification: string;
  current_employer?: string;
  current_ctc?: string;
  current_gross?: string;
  expected_gross?: string;
  notice_period?: string;
  additional_info: string;
  cv_file_id: string;
  cv_filename: string;
  status: string;
  payload: ApplicationPayload;
  form_snapshot: FormSnapshot;
  created_at?: string;
}

export async function createApplication(
  input: CreateApplicationInput,
): Promise<Application> {
  const store = await getStore();
  const createdAt = input.created_at ?? new Date().toISOString();
  const application: Application = {
    id: randomUUID(),
    application_id: generateApplicationId(new Date(createdAt)),
    position_id: input.position_id,
    candidate_name: input.candidate_name,
    email: input.email,
    phone: input.phone,
    gender: input.gender || "",
    location: input.location,
    experience_type: input.experience_type || "",
    experience_years: input.experience_years || "",
    experience: input.experience,
    qualification: input.qualification,
    current_employer: input.current_employer || "",
    current_ctc: input.current_ctc || "",
    current_gross: input.current_gross || "",
    expected_gross: input.expected_gross || "",
    notice_period: input.notice_period || "",
    additional_info: input.additional_info,
    cv_file_id: input.cv_file_id,
    cv_filename: input.cv_filename,
    status: input.status,
    created_at: createdAt,
    payload: input.payload,
    form_snapshot: input.form_snapshot,
    status_history: [
      { status: input.status, at: createdAt, by: "Candidate" },
    ],
  };

  const sheet: SheetName = "WITH_CV";
  const row: Record<string, unknown> = {
    ...application,
    payload: JSON.stringify(application.payload),
    form_snapshot: JSON.stringify(application.form_snapshot),
    status_history: JSON.stringify(application.status_history),
    cv_file_id: application.cv_file_id || "",
    cv_filename: application.cv_filename || "",
  };
  await store.appendMany(sheet, [row]);
  return application;
}

export async function getApplicationById(
  id: string,
): Promise<Application | null> {
  const applications = await readApplications();
  return applications.find((application) => application.id === id) ?? null;
}

async function locateApplication(
  id: string,
): Promise<{ application: Application; sheet: SheetName } | null> {
  const store = await getStore();
  for (const sheet of APPLICATION_SHEETS) {
    const rows = await store.list(sheet);
    const row = rows.find((item) => item.id === id);
    if (row) return { application: parseApplication(row), sheet };
  }
  return null;
}

export async function getApplicationByReference(
  reference: string,
): Promise<Application | null> {
  const applications = await readApplications();
  return (
    applications.find(
      (application) => application.application_id === reference,
    ) ?? null
  );
}

export async function getApplicationsForPosition(
  positionId: string,
): Promise<Application[]> {
  return (await readApplications()).filter(
    (application) => application.position_id === positionId,
  );
}

export async function countApplicationsForPosition(
  positionId: string,
): Promise<number> {
  const applications = await readApplications();
  return applications.filter(
    (application) => application.position_id === positionId,
  ).length;
}

export async function countApplicationsByPosition(): Promise<
  Record<string, number>
> {
  const counts: Record<string, number> = {};
  for (const application of await readApplications()) {
    counts[application.position_id] =
      (counts[application.position_id] ?? 0) + 1;
  }
  return counts;
}

export interface ApplicationFilters {
  q?: string;
  position?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}

export interface ApplicationListResult {
  items: ApplicationWithJob[];
  total: number;
  page: number;
  pages: number;
  pageSize: number;
}

export async function listApplications(
  filters: ApplicationFilters = {},
): Promise<ApplicationListResult> {
  const [applications, positions] = await Promise.all([
    readApplications(),
    getAllPositions(),
  ]);
  const positionsById = new Map(positions.map((position) => [position.id, position]));

  let rows: ApplicationWithJob[] = applications.map((application) => {
    const position = positionsById.get(application.position_id);
    return {
      ...application,
      position_title: position?.title ?? "Removed position",
      position_department: position?.department ?? "—",
    };
  });

  if (filters.position) {
    rows = rows.filter(
      (application) => application.position_id === filters.position,
    );
  }
  if (filters.status) {
    rows = rows.filter(
      (application) =>
        application.status.toUpperCase() === filters.status?.toUpperCase(),
    );
  }
  const query = (filters.q ?? "").trim().toLowerCase();
  if (query) {
    rows = rows.filter((application) =>
      [
        application.candidate_name,
        application.email,
        application.phone,
        application.application_id,
        application.position_title,
        application.location,
        application.qualification,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }

  rows.sort(
    (a, b) =>
      Date.parse(b.created_at || "1970-01-01") -
      Date.parse(a.created_at || "1970-01-01"),
  );

  const pageSize = Math.min(Math.max(filters.pageSize ?? 20, 1), 100);
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(filters.page ?? 1, 1), pages);
  const start = (page - 1) * pageSize;

  return {
    items: rows.slice(start, start + pageSize),
    total,
    page,
    pages,
    pageSize,
  };
}

export async function getAllApplicationsWithJob(): Promise<ApplicationWithJob[]> {
  const [applications, positions] = await Promise.all([
    readApplications(),
    getAllPositions(),
  ]);
  const positionsById = new Map(positions.map((position) => [position.id, position]));

  const rows: ApplicationWithJob[] = applications.map((application) => {
    const position = positionsById.get(application.position_id);
    return {
      ...application,
      position_title: position?.title ?? "Removed position",
      position_department: position?.department ?? "—",
    };
  });

  rows.sort(
    (a, b) =>
      Date.parse(b.created_at || "1970-01-01") -
      Date.parse(a.created_at || "1970-01-01"),
  );

  return rows;
}

export interface ApplicationStats {
  total: number;
  newToday: number;
  withCv: number;
  byStatus: Record<string, number>;
}

export async function getApplicationStats(): Promise<ApplicationStats> {
  const applications = await readApplications();
  const today = todayISO();
  const byStatus: Record<string, number> = {};
  let newToday = 0;
  let withCv = 0;

  for (const application of applications) {
    byStatus[application.status] = (byStatus[application.status] ?? 0) + 1;
    if (dateOnlyIST(application.created_at) === today) newToday += 1;
    if (application.cv_file_id) withCv += 1;
  }

  return {
    total: applications.length,
    newToday,
    withCv,
    byStatus,
  };
}

export async function getRecentApplications(
  limit = 6,
): Promise<ApplicationWithJob[]> {
  const result = await listApplications({ page: 1, pageSize: limit });
  return result.items;
}

export async function updateApplicationStatus(
  id: string,
  status: string,
  actor: string,
): Promise<Application> {
  const store = await getStore();
  const statuses = await getAllStatuses();
  const activeNames = statuses.filter((item) => item.active).map((item) => item.name);
  if (!activeNames.includes(status)) {
    throw new Error("Select a valid, active applicant status.");
  }

  const located = await locateApplication(id);
  if (!located) throw new Error("Application not found.");
  const { application, sheet } = located;

  const history: StatusHistoryEntry[] = [
    ...application.status_history,
    { status, at: new Date().toISOString(), by: actor },
  ];

  await store.update(sheet, id, {
    status,
    status_history: JSON.stringify(history),
  });

  return { ...application, status, status_history: history };
}

export async function getStatusCounts(): Promise<Record<string, number>> {
  return (await getApplicationStats()).byStatus;
}

/** Exposed for scripts/tests that need to know the primary sheet. */
export function applicationSheet(hasCv: boolean): (typeof APPLICATION_SHEETS)[number] {
  return hasCv ? "WITH_CV" : "WITHOUT_CV";
}
