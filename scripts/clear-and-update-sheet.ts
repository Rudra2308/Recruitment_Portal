import { config } from "dotenv";
config({ path: ".env.local" });

import { getSheetsClient } from "../lib/google/auth";
import { getSpreadsheetId } from "../lib/config";
import { SHEET_HEADERS } from "../lib/data/store";
import { buildSeedFormFields, buildSeedFormOptions } from "../lib/seed";
import fs from "node:fs";
import path from "node:path";

async function run() {
  console.log("==================================================");
  console.log("  UPDATE SHEET HEADERS & CLEAR PREVIOUS APPLICANTS");
  console.log("==================================================");

  const spreadsheetId = getSpreadsheetId();
  console.log(`Target Spreadsheet ID: ${spreadsheetId}`);
  const sheets = getSheetsClient();

  // 1. Clear WITH_CV and update headers
  console.log("\n1. Updating WITH_CV tab...");
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'WITH_CV'!A1:ZZ",
  });
  console.log("   ✓ Cleared all existing data from WITH_CV");

  const withCvHeaders = SHEET_HEADERS.WITH_CV;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'WITH_CV'!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [withCvHeaders],
    },
  });
  console.log(`   ✓ Set new headers in WITH_CV (${withCvHeaders.length} columns):`);
  console.log(`     ${withCvHeaders.join(", ")}`);

  // 2. Clear WITHOUT_CV and update headers
  console.log("\n2. Updating WITHOUT_CV tab...");
  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'WITHOUT_CV'!A1:ZZ",
  });
  console.log("   ✓ Cleared all existing data from WITHOUT_CV");

  const withoutCvHeaders = SHEET_HEADERS.WITHOUT_CV;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'WITHOUT_CV'!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [withoutCvHeaders],
    },
  });
  console.log(`   ✓ Set headers in WITHOUT_CV (${withoutCvHeaders.length} columns)`);

  // 3. Update FORM_FIELDS with new fields spec
  console.log("\n3. Updating FORM_FIELDS tab with new candidate application fields...");
  const newFields = buildSeedFormFields(new Date());
  const fieldHeaders = SHEET_HEADERS.FORM_FIELDS;
  const fieldRows = newFields.map((f) =>
    fieldHeaders.map((h) => String((f as unknown as Record<string, unknown>)[h] ?? "")),
  );

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'FORM_FIELDS'!A1:ZZ",
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'FORM_FIELDS'!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [fieldHeaders, ...fieldRows],
    },
  });
  console.log(`   ✓ Updated FORM_FIELDS (${newFields.length} fields configured)`);

  // 4. Update FORM_OPTIONS with new options
  console.log("\n4. Updating FORM_OPTIONS tab...");
  const newOptions = buildSeedFormOptions();
  const optionHeaders = SHEET_HEADERS.FORM_OPTIONS;
  const optionRows = newOptions.map((o) =>
    optionHeaders.map((h) => String((o as unknown as Record<string, unknown>)[h] ?? "")),
  );

  await sheets.spreadsheets.values.clear({
    spreadsheetId,
    range: "'FORM_OPTIONS'!A1:ZZ",
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: "'FORM_OPTIONS'!A1",
    valueInputOption: "RAW",
    requestBody: {
      values: [optionHeaders, ...optionRows],
    },
  });
  console.log(`   ✓ Updated FORM_OPTIONS (${newOptions.length} options configured)`);

  // 5. Clean local cache / .data directory if present
  console.log("\n5. Checking local storage cache...");
  const localDbPath = path.resolve(".data/db.json");
  if (fs.existsSync(localDbPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(localDbPath, "utf-8"));
      data.WITH_CV = [];
      data.WITHOUT_CV = [];
      fs.writeFileSync(localDbPath, JSON.stringify(data, null, 2), "utf-8");
      console.log("   ✓ Cleared WITH_CV and WITHOUT_CV in .data/db.json");
    } catch (e) {
      console.warn("   Could not clear .data/db.json:", e);
    }
  } else {
    console.log("   (No local db.json present)");
  }

  console.log("\n==================================================");
  console.log("  ALL APPLICANT DATA CLEARED & HEADERS UPDATED!   ");
  console.log("==================================================");
}

run().catch((err) => {
  console.error("Execution failed:", err);
  process.exit(1);
});
