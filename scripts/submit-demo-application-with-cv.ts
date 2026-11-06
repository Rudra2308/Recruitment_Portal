import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "node:fs";
import path from "node:path";
import { getStore } from "../lib/data";
import { submitApplication } from "../lib/submission";
import { getAllPositions } from "../lib/data/jobs";

async function main() {
  console.log("=================================================");
  console.log("  SUBMITTING DEMO APPLICATION WITH CV ATTACHMENT ");
  console.log("=================================================");

  const store = await getStore();
  console.log(`Data Store Mode: ${store.mode}`);

  const positions = await getAllPositions();
  // Find CNC & VMC Programmer role, or use the first open role
  const targetJob =
    positions.find((p) => p.title.toLowerCase().includes("cnc") && p.status === "OPEN") ??
    positions.find((p) => p.status === "OPEN") ??
    positions[0];

  console.log(`Target Job: ${targetJob.title} (${targetJob.id})`);

  // Read demo-cv.pdf
  const cvPath = path.resolve("public", "demo-cv.pdf");
  if (!fs.existsSync(cvPath)) {
    throw new Error(`Demo CV not found at ${cvPath}`);
  }
  const cvBuffer = fs.readFileSync(cvPath);
  const cvBlob = new Blob([cvBuffer], { type: "application/pdf" });

  const formData = new FormData();
  formData.set("position_id", targetJob.id);
  formData.set("candidate_name", "Rahul S. Patil (Demo Candidate)");
  formData.set("email", "rahul.patil.sample@example.com");
  formData.set("phone", "+91 98220 12345");
  formData.set("location", "Kolhapur, Maharashtra");
  formData.set("experience", "5+ years");
  formData.set("qualification", "Diploma in Mechanical Engineering");
  formData.set("additional_info", "Specialized in 3-axis/4-axis VMC and Fanuc controls. Sample CV attached.");
  formData.set("cv", cvBlob, "rahul-patil-cnc-programmer.pdf");

  console.log("Submitting application with attached PDF CV...");
  const result = await submitApplication(formData);

  if (!result.ok) {
    console.error("Submission failed:", result.error, result.fieldErrors);
    throw new Error(result.error);
  }

  console.log("\n✓ Application submitted successfully!");
  console.log(`✓ Application ID: ${result.application.id}`);

  // Verify in WITH_CV tab
  console.log("\nVerifying row in WITH_CV tab of Google Sheets...");
  const withCvRows = await store.list("WITH_CV");
  const found = withCvRows.find((r) => r.application_id === result.application.id);

  if (found) {
    console.log("✓ Found in WITH_CV tab:");
    console.log(`  - Candidate: ${found.candidate_name}`);
    console.log(`  - Email: ${found.email}`);
    console.log(`  - Google Drive CV File ID: ${found.cv_file_id}`);
    console.log(`  - CV Filename: ${found.cv_filename}`);
    console.log(`  - Status: ${found.status}`);
  } else {
    console.log("Saved. (Check WITH_CV tab in Google Sheets).");
  }

  console.log("\n=================================================");
  console.log("  DEMO CV SUBMISSION COMPLETE!");
  console.log("  Check Google Sheets 'WITH_CV' tab and Google Drive folder.");
  console.log("=================================================\n");
}

main().catch((err) => {
  console.error("Demo CV submission failed:", err);
  process.exit(1);
});
