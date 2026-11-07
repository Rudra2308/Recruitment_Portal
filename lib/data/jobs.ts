import { cache } from "react";

import { getStore } from "@/lib/data";
import {
  clearJobFormOverrides,
  deleteJobDetailsForPosition,
} from "@/lib/data/config";
import { getAllDepartments } from "@/lib/data/departments";
import type { Row } from "@/lib/data/store";
import type { JobStatus, Position } from "@/lib/types";
import { daysUntil, parseNumber, slugify } from "@/lib/utils";

export const JOB_STATUSES: JobStatus[] = ["DRAFT", "OPEN", "CLOSED"];

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Draft",
  OPEN: "Open",
  CLOSED: "Closed",
};

export const EMPLOYMENT_TYPES = [
  "Full-time",
  "Contract",
  "Internship",
  "Traineeship",
  "Part-time",
];

function normaliseStatus(value: string | undefined): JobStatus {
  const status = (value ?? "").trim().toUpperCase() as JobStatus;
  return JOB_STATUSES.includes(status) ? status : "DRAFT";
}

function parsePosition(row: Row): Position {
  return {
    id: row.id ?? "",
    title: (row.title ?? "").trim(),
    department: (row.department ?? "").trim(),
    location: (row.location ?? "").trim(),
    employment_type: (row.employment_type ?? "Full-time").trim(),
    experience: (row.experience ?? "").trim(),
    qualification: (row.qualification ?? "").trim(),
    description: (row.description ?? "").trim(),
    responsibilities: (row.responsibilities ?? "").trim(),
    requirements: (row.requirements ?? "").trim(),
    deadline: (row.deadline ?? "").trim(),
    status: normaliseStatus(row.status),
    display_order: parseNumber(row.display_order, 9999),
    created_at: row.created_at ?? "",
    updated_at: row.updated_at ?? "",
  };
}

export const getAllPositions = cache(async function getAllPositions(): Promise<Position[]> {
  const store = await getStore();
  const rows = await store.list("POSITIONS");
  return rows
    .map(parsePosition)
    .filter((position) => position.id && position.title)
    .sort(
      (a, b) =>
        a.display_order - b.display_order || a.title.localeCompare(b.title),
    );
});

export const getPositionById = cache(async function getPositionById(id: string): Promise<Position | null> {
  return (await getAllPositions()).find((position) => position.id === id) ?? null;
});

export function isPositionExpired(position: Position): boolean {
  if (!position.deadline) return false;
  const days = daysUntil(position.deadline);
  return days !== null && days < 0;
}

/** A job is live when it is open and its deadline has not passed. */
export function isJobLive(position: Position): boolean {
  return position.status === "OPEN" && !isPositionExpired(position);
}

function matchesActiveDepartment(
  position: Position,
  activeNames: Set<string> | null,
  allDepartmentNames: Set<string>,
): boolean {
  if (!activeNames) return true;
  const key = position.department.toLowerCase();
  if (!allDepartmentNames.has(key)) return true;
  return activeNames.has(key);
}

/** Jobs visible on the public site: OPEN, not expired, in an active department. */
export const getPublicPositions = cache(async function getPublicPositions(): Promise<Position[]> {
  const [positions, departments] = await Promise.all([
    getAllPositions(),
    getAllDepartments(),
  ]);
  const activeNames = new Set(
    departments
      .filter((department) => department.active)
      .map((department) => department.name.toLowerCase()),
  );
  const allNames = new Set(
    departments.map((department) => department.name.toLowerCase()),
  );
  return positions.filter(
    (position) =>
      isJobLive(position) &&
      matchesActiveDepartment(position, activeNames, allNames),
  );
});

export const getPublicPositionById = cache(async function getPublicPositionById(
  id: string,
): Promise<Position | null> {
  const position = await getPositionById(id);
  if (!position || position.status === "DRAFT") return null;
  const departments = await getAllDepartments();
  const department = departments.find(
    (item) => item.name.toLowerCase() === position.department.toLowerCase(),
  );
  if (department && !department.active) return null;
  return position;
});

export async function searchPublicPositions(options: {
  q?: string;
  department?: string;
} = {}): Promise<Position[]> {
  let positions = await getPublicPositions();
  if (options.department) {
    const departments = await getAllDepartments();
    const department = departments.find(
      (item) => item.id === options.department,
    );
    if (department) {
      positions = positions.filter(
        (position) =>
          position.department.toLowerCase() === department.name.toLowerCase(),
      );
    }
  }
  const query = (options.q ?? "").trim().toLowerCase();
  if (query) {
    positions = positions.filter((position) =>
      [position.title, position.department, position.description, position.location]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }
  return positions;
}

export async function filterPositionsForAdmin(options: {
  q?: string;
  status?: string;
  department?: string;
} = {}): Promise<Position[]> {
  let positions = await getAllPositions();
  if (options.status && JOB_STATUSES.includes(options.status as JobStatus)) {
    positions = positions.filter((position) => position.status === options.status);
  }
  if (options.department) {
    positions = positions.filter(
      (position) => position.department === options.department,
    );
  }
  const query = (options.q ?? "").trim().toLowerCase();
  if (query) {
    positions = positions.filter((position) =>
      [position.title, position.department, position.location, position.id]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }
  return positions;
}

export const getDepartmentJobCounts = cache(async function getDepartmentJobCounts(): Promise<
  Record<string, { open: number; total: number }>
> {
  const [positions, departments] = await Promise.all([
    getAllPositions(),
    getAllDepartments(),
  ]);
  const counts: Record<string, { open: number; total: number }> = {};
  for (const department of departments) {
    counts[department.id] = { open: 0, total: 0 };
  }
  for (const position of positions) {
    const department = departments.find(
      (item) => item.name.toLowerCase() === position.department.toLowerCase(),
    );
    if (!department) continue;
    counts[department.id].total += 1;
    if (isJobLive(position)) counts[department.id].open += 1;
  }
  return counts;
});

export async function getJobsClosingSoon(limit = 5): Promise<Position[]> {
  const positions = await getPublicPositions();
  return positions
    .filter((position) => {
      const days = daysUntil(position.deadline);
      return position.deadline && days !== null && days >= 0 && days <= 21;
    })
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
    .slice(0, limit);
}

export async function getRelatedPositions(
  position: Position,
  limit = 3,
): Promise<Position[]> {
  const positions = await getPublicPositions();
  const sameDepartment = positions.filter(
    (item) =>
      item.id !== position.id &&
      item.department.toLowerCase() === position.department.toLowerCase(),
  );
  const others = positions.filter(
    (item) =>
      item.id !== position.id &&
      item.department.toLowerCase() !== position.department.toLowerCase(),
  );
  return [...sameDepartment, ...others].slice(0, limit);
}

async function uniquePositionId(idSeed: string, title: string): Promise<string> {
  const store = await getStore();
  const existing = new Set(
    (await store.list("POSITIONS")).map((row) => row.id),
  );
  const base = slugify(idSeed || title) || `position-${Date.now().toString(36)}`;
  if (!existing.has(base)) return base;
  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export interface PositionInput {
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
}

function validateInput(input: PositionInput): PositionInput {
  const title = input.title.trim().slice(0, 160);
  if (!title) throw new Error("Job title is required.");
  const department = input.department.trim().slice(0, 120);
  if (!department) throw new Error("Department is required.");
  const deadline = input.deadline.trim();
  if (deadline && !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) {
    throw new Error("Deadline must be a valid date.");
  }
  if (!JOB_STATUSES.includes(input.status)) {
    throw new Error("Invalid job status.");
  }
  return {
    title,
    department,
    location: input.location.trim().slice(0, 120),
    employment_type: input.employment_type.trim().slice(0, 60) || "Full-time",
    experience: input.experience.trim().slice(0, 160),
    qualification: input.qualification.trim().slice(0, 240),
    description: input.description.trim().slice(0, 6000),
    responsibilities: input.responsibilities.trim().slice(0, 6000),
    requirements: input.requirements.trim().slice(0, 6000),
    deadline,
    status: input.status,
  };
}

export async function createPosition(
  input: PositionInput,
): Promise<Position> {
  const store = await getStore();
  const cleaned = validateInput(input);

  const departments = await getAllDepartments();
  if (
    !departments.some(
      (department) =>
        department.name.toLowerCase() === cleaned.department.toLowerCase(),
    )
  ) {
    throw new Error("Select an existing department.");
  }

  const positions = await getAllPositions();
  const id = await uniquePositionId("", cleaned.title);
  const now = new Date().toISOString();
  const position: Position = {
    ...cleaned,
    id,
    display_order:
      positions.reduce((max, item) => Math.max(max, item.display_order), 0) + 10,
    created_at: now,
    updated_at: now,
  };
  await store.appendMany("POSITIONS", [position]);
  return position;
}

export async function updatePosition(
  id: string,
  input: PositionInput,
): Promise<Position> {
  const store = await getStore();
  const current = await getPositionById(id);
  if (!current) throw new Error("Job not found.");
  const cleaned = validateInput(input);

  const departments = await getAllDepartments();
  if (
    !departments.some(
      (department) =>
        department.name.toLowerCase() === cleaned.department.toLowerCase(),
    )
  ) {
    throw new Error("Select an existing department.");
  }

  const updated: Position = {
    ...current,
    ...cleaned,
    updated_at: new Date().toISOString(),
  };
  await store.update("POSITIONS", id, updated);
  return updated;
}

export async function updatePositionStatus(
  id: string,
  status: JobStatus,
): Promise<void> {
  if (!JOB_STATUSES.includes(status)) throw new Error("Invalid job status.");
  const store = await getStore();
  await store.update("POSITIONS", id, {
    status,
    updated_at: new Date().toISOString(),
  });
}

export async function deletePosition(id: string): Promise<void> {
  const store = await getStore();
  await deleteJobDetailsForPosition(id);
  await clearJobFormOverrides(id);
  await store.remove("POSITIONS", id);
}

export async function movePosition(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const store = await getStore();
  const positions = await getAllPositions();
  const index = positions.findIndex((position) => position.id === id);
  if (index === -1) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= positions.length) return;

  const current = positions[index];
  const neighbour = positions[swapWith];
  await store.update("POSITIONS", current.id, {
    display_order: neighbour.display_order,
    updated_at: new Date().toISOString(),
  });
  await store.update("POSITIONS", neighbour.id, {
    display_order: current.display_order,
    updated_at: new Date().toISOString(),
  });
}

export function jobStatusTone(status: JobStatus): string {
  switch (status) {
    case "OPEN":
      return "success";
    case "DRAFT":
      return "muted";
    default:
      return "danger";
  }
}

export function isDeadlineSoon(position: Position, withinDays = 7): boolean {
  const days = daysUntil(position.deadline);
  return days !== null && days >= 0 && days <= withinDays;
}

export function sortedForPublic(positions: Position[]): Position[] {
  return [...positions].sort(
    (a, b) =>
      a.display_order - b.display_order || a.title.localeCompare(b.title),
  );
}
