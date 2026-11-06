import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import {
  ALL_SHEETS,
  buildRow,
  rowToObject,
  SHEET_HEADERS,
  type DataStore,
  type Row,
  type SheetName,
} from "@/lib/data/store";

interface LocalDatabase {
  version: number;
  sheets: Record<string, Row[]>;
  settings: Record<string, string>;
}

export function getLocalDataDir(): string {
  const configured = (process.env.LOCAL_DATA_DIR ?? "").trim();
  if (configured) return path.resolve(configured);
  if (process.env.VERCEL) return "/tmp/malati-portal-data";
  return path.join(process.cwd(), ".data");
}

function databaseFile(): string {
  return path.join(getLocalDataDir(), "db.json");
}

function emptyDatabase(): LocalDatabase {
  const sheets: Record<string, Row[]> = {};
  for (const sheet of ALL_SHEETS) sheets[sheet] = [];
  return { version: 1, sheets, settings: {} };
}

/**
 * JSON-backed development store. Production uses Google Sheets; this exists so
 * the portal can run locally and in previews without cloud credentials.
 */
export class LocalStore implements DataStore {
  readonly mode = "local" as const;

  private database: LocalDatabase | null = null;
  private loading: Promise<void> | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  async ensureReady(): Promise<void> {
    if (this.database) return;
    if (!this.loading) {
      this.loading = this.load().catch((error) => {
        this.loading = null;
        throw error;
      });
    }
    await this.loading;
  }

  private async load(): Promise<void> {
    const dir = getLocalDataDir();
    await mkdir(dir, { recursive: true });
    const file = databaseFile();

    try {
      const raw = await readFile(file, "utf8");
      const parsed = JSON.parse(raw) as LocalDatabase;
      const database = emptyDatabase();
      if (parsed.sheets && typeof parsed.sheets === "object") {
        for (const sheet of ALL_SHEETS) {
          database.sheets[sheet] = Array.isArray(parsed.sheets[sheet])
            ? parsed.sheets[sheet]
            : [];
        }
      }
      database.settings =
        parsed.settings && typeof parsed.settings === "object"
          ? parsed.settings
          : {};
      this.database = database;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      this.database = emptyDatabase();
      await this.persist();
    }
  }

  private async persist(): Promise<void> {
    if (!this.database) return;
    const dir = getLocalDataDir();
    await mkdir(dir, { recursive: true });
    const file = databaseFile();
    const temporary = `${file}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(this.database, null, 2), "utf8");
    await rename(temporary, file);
  }

  private withLock<T>(operation: () => Promise<T> | T): Promise<T> {
    const run = this.queue.then(operation, operation);
    this.queue = run.then(
      () => undefined,
      () => undefined,
    );
    return run;
  }

  private normalise(sheet: SheetName, object: object): Row {
    return rowToObject(sheet, SHEET_HEADERS[sheet], buildRow(sheet, object));
  }

  async list(sheet: SheetName): Promise<Row[]> {
    await this.ensureReady();
    return (this.database?.sheets[sheet] ?? []).map((row) => ({ ...row }));
  }

  async appendMany(
    sheet: SheetName,
    rows: object[],
  ): Promise<void> {
    if (!rows.length) return;
    await this.ensureReady();
    await this.withLock(async () => {
      const database = this.database!;
      const target = database.sheets[sheet] ?? (database.sheets[sheet] = []);
      for (const row of rows) target.push(this.normalise(sheet, row));
      await this.persist();
    });
  }

  async update(
    sheet: SheetName,
    id: string,
    patch: object,
  ): Promise<void> {
    await this.ensureReady();
    await this.withLock(async () => {
      const database = this.database!;
      const target = database.sheets[sheet] ?? [];
      const index = target.findIndex((row) => row.id === id);
      if (index === -1) throw new Error(`Record ${id} not found in ${sheet}.`);
      target[index] = this.normalise(sheet, { ...target[index], ...patch, id });
      await this.persist();
    });
  }

  async remove(sheet: SheetName, id: string): Promise<void> {
    await this.ensureReady();
    await this.withLock(async () => {
      const database = this.database!;
      database.sheets[sheet] = (database.sheets[sheet] ?? []).filter(
        (row) => row.id !== id,
      );
      await this.persist();
    });
  }

  async replace(
    sheet: SheetName,
    rows: object[],
  ): Promise<void> {
    await this.ensureReady();
    await this.withLock(async () => {
      const database = this.database!;
      database.sheets[sheet] = rows.map((row) => this.normalise(sheet, row));
      await this.persist();
    });
  }

  async getSettings(): Promise<Record<string, string>> {
    await this.ensureReady();
    return { ...(this.database?.settings ?? {}) };
  }

  async setSettings(patch: Record<string, string>): Promise<void> {
    await this.ensureReady();
    await this.withLock(async () => {
      const database = this.database!;
      database.settings = { ...database.settings, ...patch };
      await this.persist();
    });
  }
}
