import { getSpreadsheetId } from "@/lib/config";
import {
  ALL_SHEETS,
  buildRow,
  columnLetter,
  rowToObject,
  SHEET_HEADERS,
  type DataStore,
  type Row,
  type SheetName,
} from "@/lib/data/store";
import { getSheetsClient } from "@/lib/google/auth";

function quotedRange(sheet: SheetName, a1: string): string {
  return `'${sheet.replace(/'/g, "''")}'!${a1}`;
}

function sheetId(): string {
  const id = getSpreadsheetId();
  if (!id) throw new Error("GOOGLE_SPREADSHEET_ID is not configured.");
  return id;
}

/** Sleep utility for backoff */
function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Retries Google API calls with backoff on rate-limit (429) errors */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 4): Promise<T> {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (err: unknown) {
      attempt++;
      const isRateLimit =
        err &&
        typeof err === "object" &&
        ("status" in err || "code" in err) &&
        (Number((err as { status?: number }).status) === 429 ||
          Number((err as { code?: number }).code) === 429);

      if (isRateLimit && attempt <= maxRetries) {
        const delay = Math.pow(2, attempt) * 1500;
        console.warn(`[Google Sheets API] Rate limit reached. Backing off for ${delay}ms (attempt ${attempt}/${maxRetries})...`);
        await wait(delay);
        continue;
      }
      throw err;
    }
  }
}

interface CacheEntry {
  rows: Row[];
  timestamp: number;
}

/**
 * Google Sheets implementation. Every call goes through the server-side
 * service account; the browser never receives Google credentials.
 */
export class GoogleSheetStore implements DataStore {
  readonly mode = "google" as const;

  private readyPromise: Promise<void> | null = null;
  private sheetIds = new Map<string, number>();
  private cache = new Map<string, CacheEntry>();
  private cacheTtlMs = 15_000; // 15 seconds read cache to conserve API quota

  async ensureReady(): Promise<void> {
    if (!this.readyPromise) {
      this.readyPromise = this.bootstrap().catch((error) => {
        this.readyPromise = null;
        throw error;
      });
    }
    return this.readyPromise;
  }

  private invalidate(sheet?: SheetName) {
    if (sheet) {
      this.cache.delete(sheet);
    } else {
      this.cache.clear();
    }
  }

  private async bootstrap(): Promise<void> {
    const sheets = getSheetsClient();
    const spreadsheetId = sheetId();

    const meta = await withRetry(() =>
      sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets.properties(sheetId,title)",
      }),
    );

    const existing = new Map<string, number>();
    for (const sheet of meta.data.sheets ?? []) {
      const title = sheet.properties?.title;
      const id = sheet.properties?.sheetId;
      if (title && typeof id === "number") existing.set(title, id);
    }

    const missing = ALL_SHEETS.filter((name) => !existing.has(name));
    if (missing.length) {
      await withRetry(() =>
        sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: {
            requests: missing.map((title) => ({
              addSheet: { properties: { title } },
            })),
          },
        }),
      );
      const refreshed = await withRetry(() =>
        sheets.spreadsheets.get({
          spreadsheetId,
          fields: "sheets.properties(sheetId,title)",
        }),
      );
      existing.clear();
      for (const sheet of refreshed.data.sheets ?? []) {
        const title = sheet.properties?.title;
        const id = sheet.properties?.sheetId;
        if (title && typeof id === "number") existing.set(title, id);
      }
    }

    this.sheetIds = existing;

    // Use a single batchGet to fetch header rows for all 10 sheets in 1 request!
    const ranges = ALL_SHEETS.map((name) => quotedRange(name, "A1:ZZ1"));
    const batchResponse = await withRetry(() =>
      sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
      }),
    );

    const valueRanges = batchResponse.data.valueRanges ?? [];
    const missingHeadersBySheet: { range: string; values: string[][] }[] = [];

    for (let i = 0; i < ALL_SHEETS.length; i++) {
      const name = ALL_SHEETS[i];
      const vr = valueRanges[i];
      const current = (vr?.values?.[0] ?? [])
        .map((cell) => String(cell ?? "").trim())
        .filter((cell, idx, arr) => cell !== "" || arr.slice(idx + 1).some((next) => next !== ""));

      const canonical = SHEET_HEADERS[name];
      const missingHeaders = canonical.filter((header) => !current.includes(header));

      if (!current.length) {
        missingHeadersBySheet.push({
          range: quotedRange(name, `A1:${columnLetter(canonical.length)}1`),
          values: [canonical],
        });
      } else if (missingHeaders.length) {
        const start = current.length + 1;
        missingHeadersBySheet.push({
          range: quotedRange(
            name,
            `${columnLetter(start)}1:${columnLetter(start + missingHeaders.length - 1)}1`,
          ),
          values: [missingHeaders],
        });
      }
    }

    if (missingHeadersBySheet.length) {
      await withRetry(() =>
        sheets.spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: {
            valueInputOption: "RAW",
            data: missingHeadersBySheet,
          },
        }),
      );
    }
  }

  async list(sheet: SheetName): Promise<Row[]> {
    const cached = this.cache.get(sheet);
    if (cached && Date.now() - cached.timestamp < this.cacheTtlMs) {
      return cached.rows;
    }

    await this.ensureReady();
    const response = await withRetry(() =>
      getSheetsClient().spreadsheets.values.get({
        spreadsheetId: sheetId(),
        range: quotedRange(sheet, "A1:ZZ"),
      }),
    );

    const values = response.data.values ?? [];
    if (!values.length) {
      this.cache.set(sheet, { rows: [], timestamp: Date.now() });
      return [];
    }

    const headers = (values[0] ?? []).map((cell) => String(cell ?? "").trim());
    const rows = values
      .slice(1)
      .filter((row) => row.some((cell) => String(cell ?? "").trim() !== ""))
      .map((row) =>
        rowToObject(
          sheet,
          headers,
          row.map((cell) => String(cell ?? "")),
        ),
      );

    this.cache.set(sheet, { rows, timestamp: Date.now() });
    return rows;
  }

  async appendMany(
    sheet: SheetName,
    rows: object[],
  ): Promise<void> {
    if (!rows.length) return;
    await this.ensureReady();
    this.invalidate(sheet);
    await withRetry(() =>
      getSheetsClient().spreadsheets.values.append({
        spreadsheetId: sheetId(),
        range: quotedRange(sheet, "A1"),
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        requestBody: {
          values: rows.map((row) => buildRow(sheet, row)),
        },
      }),
    );
  }

  async update(
    sheet: SheetName,
    id: string,
    patch: object,
  ): Promise<void> {
    await this.ensureReady();
    this.invalidate(sheet);
    const spreadsheetId = sheetId();
    const response = await withRetry(() =>
      getSheetsClient().spreadsheets.values.get({
        spreadsheetId,
        range: quotedRange(sheet, "A1:ZZ"),
      }),
    );

    const values = response.data.values ?? [];
    if (!values.length) throw new Error(`No rows found in ${sheet}.`);
    const headers = (values[0] ?? []).map((cell) => String(cell ?? "").trim());
    const idIndex = headers.indexOf("id");
    if (idIndex === -1) throw new Error(`${sheet} has no id column.`);

    const rowOffset = values
      .slice(1)
      .findIndex((row) => String(row[idIndex] ?? "") === id);
    if (rowOffset === -1) throw new Error(`Record ${id} not found in ${sheet}.`);

    const rowNumber = rowOffset + 2;
    const current = rowToObject(
      sheet,
      headers,
      (values[rowNumber - 1] ?? []).map((cell) => String(cell ?? "")),
    );
    const merged = buildRow(sheet, { ...current, ...patch, id });
    await withRetry(() =>
      getSheetsClient().spreadsheets.values.update({
        spreadsheetId,
        range: quotedRange(sheet, `A${rowNumber}:${columnLetter(merged.length)}${rowNumber}`),
        valueInputOption: "RAW",
        requestBody: { values: [merged] },
      }),
    );
  }

  async remove(sheet: SheetName, id: string): Promise<void> {
    await this.ensureReady();
    this.invalidate(sheet);
    const spreadsheetId = sheetId();
    const response = await withRetry(() =>
      getSheetsClient().spreadsheets.values.get({
        spreadsheetId,
        range: quotedRange(sheet, "A1:A"),
      }),
    );
    const values = response.data.values ?? [];
    const rowOffset = values
      .slice(1)
      .findIndex((row) => String(row[0] ?? "") === id);
    if (rowOffset === -1) return;

    const numericSheetId = this.sheetIds.get(sheet);
    if (numericSheetId === undefined) {
      throw new Error(`Could not resolve the sheet id for ${sheet}.`);
    }

    await withRetry(() =>
      getSheetsClient().spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: numericSheetId,
                  dimension: "ROWS",
                  startIndex: rowOffset + 1,
                  endIndex: rowOffset + 2,
                },
              },
            },
          ],
        },
      }),
    );
  }

  async replace(
    sheet: SheetName,
    rows: object[],
  ): Promise<void> {
    await this.ensureReady();
    this.invalidate(sheet);
    const spreadsheetId = sheetId();
    await withRetry(() =>
      getSheetsClient().spreadsheets.values.clear({
        spreadsheetId,
        range: quotedRange(sheet, "A2:ZZ"),
      }),
    );
    if (!rows.length) return;
    const width = SHEET_HEADERS[sheet].length;
    await withRetry(() =>
      getSheetsClient().spreadsheets.values.update({
        spreadsheetId,
        range: quotedRange(sheet, `A2:${columnLetter(width)}${rows.length + 1}`),
        valueInputOption: "RAW",
        requestBody: { values: rows.map((row) => buildRow(sheet, row)) },
      }),
    );
  }

  async getSettings(): Promise<Record<string, string>> {
    const rows = await this.list("SETTINGS");
    const settings: Record<string, string> = {};
    for (const row of rows) {
      const key = (row.key ?? "").trim();
      if (key) settings[key] = row.value ?? "";
    }
    return settings;
  }

  async setSettings(patch: Record<string, string>): Promise<void> {
    await this.ensureReady();
    this.invalidate("SETTINGS");
    const spreadsheetId = sheetId();
    const entries = Object.entries(patch);
    if (!entries.length) return;

    const response = await withRetry(() =>
      getSheetsClient().spreadsheets.values.get({
        spreadsheetId,
        range: quotedRange("SETTINGS", "A1:B"),
      }),
    );
    const values = response.data.values ?? [];
    const rowForKey = new Map<string, number>();
    values.slice(1).forEach((row, index) => {
      const key = String(row[0] ?? "").trim();
      if (key) rowForKey.set(key, index + 2);
    });

    const updates: { range: string; values: string[][] }[] = [];
    const appends: string[][] = [];

    for (const [key, value] of entries) {
      const rowNumber = rowForKey.get(key);
      if (rowNumber) {
        updates.push({
          range: quotedRange("SETTINGS", `A${rowNumber}:B${rowNumber}`),
          values: [[key, value]],
        });
      } else {
        appends.push([key, value]);
      }
    }

    if (updates.length) {
      await withRetry(() =>
        getSheetsClient().spreadsheets.values.batchUpdate({
          spreadsheetId,
          requestBody: { valueInputOption: "RAW", data: updates },
        }),
      );
    }
    if (appends.length) {
      await withRetry(() =>
        getSheetsClient().spreadsheets.values.append({
          spreadsheetId,
          range: quotedRange("SETTINGS", "A1"),
          valueInputOption: "RAW",
          insertDataOption: "INSERT_ROWS",
          requestBody: { values: appends },
        }),
      );
    }
  }
}
