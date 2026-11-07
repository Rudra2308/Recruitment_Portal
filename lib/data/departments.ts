import { cache } from "react";

import { getStore } from "@/lib/data";
import type { DataStore, Row } from "@/lib/data/store";
import type { Department } from "@/lib/types";
import { parseBool, parseNumber, slugify } from "@/lib/utils";

function parseDepartment(row: Row): Department {
  return {
    id: row.id ?? "",
    name: (row.name ?? "").trim(),
    description: (row.description ?? "").trim(),
    display_order: parseNumber(row.display_order, 9999),
    active: parseBool(row.active, true),
  };
}

export const getAllDepartments = cache(async function getAllDepartments(): Promise<Department[]> {
  const store = await getStore();
  const rows = await store.list("DEPARTMENTS");
  return rows
    .map(parseDepartment)
    .filter((department) => department.id && department.name)
    .sort(
      (a, b) => a.display_order - b.display_order || a.name.localeCompare(b.name),
    );
});

export const getActiveDepartments = cache(async function getActiveDepartments(): Promise<Department[]> {
  return (await getAllDepartments()).filter((department) => department.active);
});

export const getDepartmentById = cache(async function getDepartmentById(id: string): Promise<Department | null> {
  const departments = await getAllDepartments();
  return departments.find((department) => department.id === id) ?? null;
});

export function departmentSlug(name: string): string {
  return slugify(name);
}

async function uniqueDepartmentId(
  store: DataStore,
  name: string,
): Promise<string> {
  const base = slugify(name) || `department-${Date.now().toString(36)}`;
  const existing = new Set(
    (await store.list("DEPARTMENTS")).map((row) => row.id),
  );
  if (!existing.has(base)) return base;
  let suffix = 2;
  while (existing.has(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
}

export interface DepartmentInput {
  name: string;
  description: string;
  active: boolean;
}

export async function createDepartment(
  input: DepartmentInput,
): Promise<Department> {
  const store = await getStore();
  const departments = await getAllDepartments();
  const name = input.name.trim().slice(0, 120);
  if (!name) throw new Error("Department name is required.");
  if (
    departments.some(
      (department) => department.name.toLowerCase() === name.toLowerCase(),
    )
  ) {
    throw new Error("A department with this name already exists.");
  }

  const id = await uniqueDepartmentId(store, name);
  const nextOrder =
    departments.reduce((max, department) => Math.max(max, department.display_order), 0) +
    10;
  const department: Department = {
    id,
    name,
    description: input.description.trim().slice(0, 500),
    display_order: nextOrder,
    active: input.active,
  };

  await store.appendMany("DEPARTMENTS", [department]);
  return department;
}

export async function updateDepartment(
  id: string,
  patch: Partial<DepartmentInput>,
): Promise<Department> {
  const store = await getStore();
  const departments = await getAllDepartments();
  const current = departments.find((department) => department.id === id);
  if (!current) throw new Error("Department not found.");

  const nextName = patch.name?.trim().slice(0, 120) ?? current.name;
  if (!nextName) throw new Error("Department name is required.");
  if (
    departments.some(
      (department) =>
        department.id !== id &&
        department.name.toLowerCase() === nextName.toLowerCase(),
    )
  ) {
    throw new Error("A department with this name already exists.");
  }

  const nextDescription =
    patch.description !== undefined
      ? patch.description.trim().slice(0, 500)
      : current.description;
  const nextActive = patch.active ?? current.active;

  await store.update("DEPARTMENTS", id, {
    name: nextName,
    description: nextDescription,
    active: nextActive,
  });

  // Jobs reference departments by name; keep that relationship intact.
  if (nextName !== current.name) {
    const positions = await store.list("POSITIONS");
    const matches = positions.filter(
      (position) => position.department === current.name,
    );
    for (const position of matches) {
      await store.update("POSITIONS", position.id, {
        department: nextName,
        updated_at: new Date().toISOString(),
      });
    }
  }

  return {
    ...current,
    name: nextName,
    description: nextDescription,
    active: nextActive,
  };
}

export async function deleteDepartment(id: string): Promise<void> {
  const store = await getStore();
  const department = await getDepartmentById(id);
  if (!department) return;

  const positions = await store.list("POSITIONS");
  const usedBy = positions.filter(
    (position) => position.department === department.name,
  );
  if (usedBy.length) {
    throw new Error(
      `This department is used by ${usedBy.length} job${
        usedBy.length === 1 ? "" : "s"
      }. Move or delete those jobs first, or deactivate the department.`,
    );
  }

  await store.remove("DEPARTMENTS", id);
}

export async function moveDepartment(
  id: string,
  direction: "up" | "down",
): Promise<void> {
  await moveOrdered("DEPARTMENTS", id, direction);
}

/** Shared adjacent-swap ordering helper for configurable lists. */
export async function moveOrdered(
  sheet:
    | "DEPARTMENTS"
    | "POSITIONS"
    | "FORM_FIELDS"
    | "JOB_DETAILS"
    | "APPLICATION_STATUSES",
  id: string,
  direction: "up" | "down",
): Promise<void> {
  const store = await getStore();
  const rows = await store.list(sheet);
  const sorted = [...rows].sort(
    (a, b) => parseNumber(a.display_order, 9999) - parseNumber(b.display_order, 9999),
  );
  const index = sorted.findIndex((row) => row.id === id);
  if (index === -1) return;
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (swapWith < 0 || swapWith >= sorted.length) return;

  const current = sorted[index];
  const neighbour = sorted[swapWith];
  const currentOrder = parseNumber(current.display_order, (index + 1) * 10);
  const neighbourOrder = parseNumber(neighbour.display_order, (swapWith + 1) * 10);

  if (currentOrder === neighbourOrder) {
    await store.update(sheet, current.id, {
      display_order: neighbourOrder + (direction === "up" ? -1 : 1),
    });
    return;
  }

  await store.update(sheet, current.id, { display_order: neighbourOrder });
  await store.update(sheet, neighbour.id, { display_order: currentOrder });
}

export async function countPositionsByDepartment(): Promise<
  Record<string, number>
> {
  const store = await getStore();
  const positions = await store.list("POSITIONS");
  const counts: Record<string, number> = {};
  for (const position of positions) {
    const key = (position.department ?? "").trim().toLowerCase();
    if (!key) continue;
    counts[key] = (counts[key] ?? 0) + 1;
  }
  return counts;
}
