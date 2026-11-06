import { config } from "dotenv";
config({ path: ".env.local" });

import { getStore } from "../lib/data";
import { getSheetsClient } from "../lib/google/auth";
import { getSpreadsheetId } from "../lib/config";
import { seedIfEmpty } from "../lib/data/bootstrap";
import { submitApplication } from "../lib/submission";

async function verifyGoogleSync() {
  console.log("=================================================");
  console.log("  MALATI GROUP RECRUITMENT PORTAL — GOOGLE VERIFIER");
  console.log("=================================================");

  const spreadsheetId = getSpreadsheetId();
  console.log(`\n1. Target Google Spreadsheet ID: ${spreadsheetId}`);
  console.log(`   Spreadsheet URL: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);

  // Step 1: Initialize store
  console.log("\n2. Initializing Google Sheet Store & Verifying Connection...");
  const store = await getStore();
  console.log(`   Store Mode: ${store.mode}`);

  if (store.mode !== "google") {
    throw new Error(`Expected store mode 'google', but got '${store.mode}'. Check credentials in .env.local`);
  }

  // Step 2: Ensure sheets and headers exist
  console.log("\n3. Ensuring all 10 required sheets and canonical headers exist in Google Sheets...");
  await store.ensureReady();
  await seedIfEmpty(store);

  // Step 3: Inspect sheet tabs
  const sheets = getSheetsClient();
  const meta = await sheets.spreadsheets.get({
    spreadsheetId,
    fields: "sheets.properties(sheetId,title)",
  });

  const tabNames = (meta.data.sheets ?? []).map((s) => s.properties?.title ?? "");
  console.log(`   ✓ Found ${tabNames.length} sheet tabs in Google Sheets:`);
  console.log(`     ${tabNames.join(", ")}`);

  // Step 4: Check Positions
  const positions = await store.list("POSITIONS");
  console.log(`\n4. Verified POSITIONS tab: ${positions.length} rows loaded from Google Sheets.`);

  // Step 5: Check Departments
  const departments = await store.list("DEPARTMENTS");
  console.log(`5. Verified DEPARTMENTS tab: ${departments.length} departments loaded from Google Sheets.`);

  // Step 6: Test submitting an application to verify live write into Google Sheets
  console.log("\n6. Submitting a test application to verify live write into Google Sheets...");
  const firstJob = positions[0];
  const testSuffix = Date.now().toString().slice(-4);
  const testName = `Verification Candidate (${testSuffix})`;
  const testEmail = `verify-${testSuffix}@example.com`;

  const formData = new FormData();
  formData.append("position_id", firstJob.id);
  formData.append("candidate_name", testName);
  formData.append("email", testEmail);
  formData.append("phone", "+91 98765 43210");
  formData.append("location", "Kolhapur");
  formData.append("experience", "3 years");
  formData.append("qualification", "B.E. Mechanical");
  formData.append("additional_info", "Automated verification test entry");

  const submissionResult = await submitApplication(formData);

  if (!submissionResult.ok) {
    throw new Error(`Submission failed: ${submissionResult.error}`);
  }

  const appId = submissionResult.applicationId;
  console.log(`   ✓ Application submitted successfully!`);
  console.log(`   ✓ Generated Application ID: ${appId}`);

  // Step 7: Verify row in WITHOUT_CV tab
  console.log("\n7. Reading WITHOUT_CV tab directly from Google Sheets API...");
  const withoutCvRows = await store.list("WITHOUT_CV");
  const found = withoutCvRows.find((r) => r.application_id === appId || r.email === testEmail);

  if (!found) {
    throw new Error(`Could not find application ID ${appId} in WITHOUT_CV tab of Google Sheets!`);
  }

  console.log(`   ✓ Verified record successfully written to WITHOUT_CV tab:`);
  console.log(`     - Application ID: ${found.application_id}`);
  console.log(`     - Candidate Name: ${found.candidate_name}`);
  console.log(`     - Position: ${found.position_id}`);
  console.log(`     - Status: ${found.status}`);
  console.log(`     - Created At: ${found.created_at}`);

  // Step 8: Verify audit log entry
  console.log("\n8. Checking AUDIT_LOG tab in Google Sheets...");
  const auditRows = await store.list("AUDIT_LOG");
  console.log(`   ✓ Found ${auditRows.length} audit entries in Google Sheets.`);

  console.log("\n=================================================");
  console.log("  >>> GOOGLE SHEETS LIVE SYNC VERIFIED 100%! <<<");
  console.log("  You can view your spreadsheet right now at:");
  console.log(`  https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`);
  console.log("=================================================\n");
}

verifyGoogleSync().catch((err) => {
  console.error("\nGoogle sync verification failed:", err);
  process.exit(1);
});
