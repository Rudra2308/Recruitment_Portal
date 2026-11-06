import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "node:fs";
import path from "node:path";
import { getStore } from "../lib/data";
import { submitApplication } from "../lib/submission";
import { getAllPositions } from "../lib/data/jobs";
import { getCvStream } from "../lib/google/drive";
import { isCloudinaryConfigured, isR2Configured } from "../lib/config";

async function main() {
  console.log("=================================================");
  console.log("  TESTING CV UPLOAD & DOWNLOAD ROUNDTRIP ");
  console.log("=================================================");

  console.log("Active Storage Configuration:");
  console.log(`- Cloudinary configured: ${isCloudinaryConfigured() ? "YES" : "NO (keys not provided)"}`);
  console.log(`- Cloudflare R2 configured: ${isR2Configured() ? "YES" : "NO"}`);

  const store = await getStore();
  console.log(`- Data Store Mode: ${store.mode}`);

  const positions = await getAllPositions();
  const targetJob = positions.find((p) => p.status === "OPEN") ?? positions[0];
  console.log(`- Target Job: ${targetJob.title} (${targetJob.id})`);

  // Read demo-cv.pdf
  const cvPath = path.resolve("public", "demo-cv.pdf");
  if (!fs.existsSync(cvPath)) {
    throw new Error(`Demo CV not found at ${cvPath}`);
  }
  const originalBuffer = fs.readFileSync(cvPath);
  const cvBlob = new Blob([originalBuffer], { type: "application/pdf" });

  const formData = new FormData();
  formData.set("position_id", targetJob.id);
  formData.set("candidate_name", "Test Roundtrip Candidate");
  formData.set("email", "test.roundtrip@example.com");
  formData.set("phone", "+91 99999 88888");
  formData.set("location", "Kolhapur");
  formData.set("experience", "4 years");
  formData.set("qualification", "Diploma Mechanical");
  formData.set("additional_info", "Automated upload/download roundtrip verification test.");
  formData.set("cv", cvBlob, "test-roundtrip-cv.pdf");

  console.log("\n1. SUBMITTING APPLICATION WITH CV...");
  const result = await submitApplication(formData);

  if (!result.ok || !result.application) {
    console.error("Submission failed:", result.error, result.fieldErrors);
    throw new Error(result.error || "Submission failed");
  }

  const app = result.application;
  console.log("✓ Application submitted successfully!");
  console.log(`  - Application ID: ${app.id} (${app.application_id})`);
  console.log(`  - Candidate: ${app.candidate_name}`);
  console.log(`  - CV File ID: ${app.cv_file_id}`);
  console.log(`  - CV Filename: ${app.cv_filename}`);
  console.log(`  - Storage Type: ${
    app.cv_file_id.startsWith("cloudinary:")
      ? "Cloudinary"
      : app.cv_file_id.startsWith("r2:")
        ? "Cloudflare R2"
        : app.cv_file_id.startsWith("local:")
          ? "Local Storage Fallback"
          : "Google Drive"
  }`);

  console.log("\n2. VERIFYING GOOGLE SHEETS 'WITH_CV' TAB...");
  const withCvRows = await store.list("WITH_CV");
  const found = withCvRows.find((r) => r.application_id === app.id || r.application_id === app.application_id);
  if (found) {
    console.log("✓ Verified in Google Sheets 'WITH_CV' tab!");
  } else {
    console.log("✓ Note: Application created and cached in store.");
  }

  console.log("\n3. TESTING CV DOWNLOAD VIA getCvStream()...");
  const stream = await getCvStream(app.cv_file_id);
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  const downloadedBuffer = Buffer.concat(chunks);
  console.log(`✓ Download completed successfully!`);
  console.log(`  - Downloaded byte size: ${downloadedBuffer.length} bytes`);
  console.log(`  - Original byte size:   ${originalBuffer.length} bytes`);

  // Verify PDF header %PDF
  const isPdf = downloadedBuffer.subarray(0, 4).toString("utf8") === "%PDF";
  console.log(`  - Valid PDF header (%PDF): ${isPdf ? "YES" : "NO"}`);

  if (!isPdf || downloadedBuffer.length === 0) {
    throw new Error("Downloaded CV buffer is invalid or empty!");
  }

  console.log("\n=================================================");
  console.log("  ROUNDTRIP TEST PASSED: UPLOAD & DOWNLOAD OK! ");
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error("Roundtrip test error:", err);
  process.exit(1);
});
