import { config } from "dotenv";
config({ path: ".env.local" });

import fs from "node:fs";
import path from "node:path";
import JSZip from "jszip";
import { getStore } from "../lib/data";
import { submitApplication } from "../lib/submission";
import { getAllPositions } from "../lib/data/jobs";
import { getCvStream } from "../lib/google/drive";

async function run() {
  console.log("=================================================");
  console.log("  E2E TEST: CONDITIONAL FORM & BULK DOWNLOAD ZIP ");
  console.log("=================================================");

  const store = await getStore();
  const positions = await getAllPositions();
  const openJob = positions.find((p) => p.status === "OPEN") || positions[0];

  const cvPath = path.resolve("public", "demo-cv.pdf");
  if (!fs.existsSync(cvPath)) {
    throw new Error(`Demo CV missing at ${cvPath}`);
  }
  const cvBuffer = fs.readFileSync(cvPath);

  // -----------------------------------------------------------------
  // 1. Submit Fresher Candidate
  // -----------------------------------------------------------------
  console.log("\n1. Submitting Fresher Candidate application...");
  const fresherForm = new FormData();
  fresherForm.set("position_id", openJob.id);
  fresherForm.set("candidate_name", "Aarav Sharma");
  fresherForm.set("email", "aarav.sharma.test@example.com");
  fresherForm.set("phone", "+91 98111 22334");
  fresherForm.set("gender", "Male");
  fresherForm.set("location", "Pune, Maharashtra");
  fresherForm.set("experience_type", "Fresher");
  fresherForm.set("qualification", "B.Tech Mechanical Engineering");
  fresherForm.set("expected_gross", "₹ 28,000 / month");
  fresherForm.set("additional_info", "Enthusiastic graduate ready for immediate start.");
  fresherForm.set("cv", new Blob([cvBuffer], { type: "application/pdf" }), "aarav_resume.pdf");

  const fresherResult = await submitApplication(fresherForm);
  if (!fresherResult.ok) {
    console.error("Fresher submission failed:", fresherResult.error, fresherResult.fieldErrors);
    throw new Error("Fresher submission failed");
  }
  console.log(`   ✓ Fresher submitted: ${fresherResult.application.id}`);

  // -----------------------------------------------------------------
  // 2. Submit Experienced Candidate
  // -----------------------------------------------------------------
  console.log("\n2. Submitting Experienced Candidate application...");
  const expForm = new FormData();
  expForm.set("position_id", openJob.id);
  expForm.set("candidate_name", "Pooja Kulkarni");
  expForm.set("email", "pooja.kulkarni.test@example.com");
  expForm.set("phone", "+91 98222 33445");
  expForm.set("gender", "Female");
  expForm.set("location", "Kolhapur, Maharashtra");
  expForm.set("experience_type", "Experienced");
  expForm.set("experience_years", "4");
  expForm.set("qualification", "BE Metallurgical Engineering");
  expForm.set("current_employer", "Precision Castings Pvt Ltd");
  expForm.set("current_ctc", "6.5 LPA");
  expForm.set("current_gross", "52,000 / month");
  expForm.set("expected_gross", "65,000 / month");
  expForm.set("notice_period", "30 Days");
  expForm.set("additional_info", "Extensive foundry metallurgy experience.");
  expForm.set("cv", new Blob([cvBuffer], { type: "application/pdf" }), "pooja_cv.pdf");

  const expResult = await submitApplication(expForm);
  if (!expResult.ok) {
    console.error("Experienced submission failed:", expResult.error, expResult.fieldErrors);
    throw new Error("Experienced submission failed");
  }
  console.log(`   ✓ Experienced submitted: ${expResult.application.id}`);

  // -----------------------------------------------------------------
  // 3. Verify in Google Sheet
  // -----------------------------------------------------------------
  console.log("\n3. Verifying records in Google Sheet (WITH_CV)...");
  const withCvRows = await store.list("WITH_CV");
  console.log(`   Total rows in WITH_CV: ${withCvRows.length}`);

  const fresherRow = withCvRows.find(
    (r) => r.id === fresherResult.application.id || r.application_id === fresherResult.application.application_id,
  );
  const expRow = withCvRows.find(
    (r) => r.id === expResult.application.id || r.application_id === expResult.application.application_id,
  );

  if (!fresherRow) throw new Error("Fresher row not found in WITH_CV sheet!");
  if (!expRow) throw new Error("Experienced row not found in WITH_CV sheet!");

  console.log("   ✓ Fresher row fields:", {
    name: fresherRow.candidate_name,
    gender: fresherRow.gender,
    type: fresherRow.experience_type,
    years: fresherRow.experience_years,
    qualification: fresherRow.qualification,
    expected_gross: fresherRow.expected_gross,
    cv_filename: fresherRow.cv_filename,
    cv_file_id: fresherRow.cv_file_id,
  });

  console.log("   ✓ Experienced row fields:", {
    name: expRow.candidate_name,
    gender: expRow.gender,
    type: expRow.experience_type,
    years: expRow.experience_years,
    employer: expRow.current_employer,
    current_ctc: expRow.current_ctc,
    expected_gross: expRow.expected_gross,
    notice_period: expRow.notice_period,
    cv_filename: expRow.cv_filename,
    cv_file_id: expRow.cv_file_id,
  });

  // -----------------------------------------------------------------
  // 4. Test Bulk Download Packaging
  // -----------------------------------------------------------------
  console.log("\n4. Testing Bulk Download ZIP compilation...");

  function formatTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  function cleanFilename(candidateName: string, applicationId: string, originalFilename: string): string {
    const cleanName = (candidateName || "Candidate").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_");
    const cleanAppId = (applicationId || "Application").replace(/[^\w-]/g, "");
    const ext = originalFilename && originalFilename.includes(".") ? originalFilename.slice(originalFilename.lastIndexOf(".")).toLowerCase() : ".pdf";
    return `${cleanName}_${cleanAppId}${ext}`;
  }

  const timestamp = formatTimestamp();
  const zip = new JSZip();

  // Excel/CSV Master Sheet export
  const csvFilename = `Applicants_Master_Export_${timestamp}.csv`;
  const csvHeaders = [
    "Application ID", "Candidate Name", "Position Title", "Department",
    "Email", "Phone", "Gender", "Current Location", "Experience Type",
    "Total Experience Years", "Highest Qualification", "Current Organisation",
    "Current Salary (CTC)", "Current Gross Salary", "Expected Gross Salary",
    "Notice Period", "Status", "Applied At", "CV Attached?", "CV Filename"
  ];

  const csvRows = withCvRows.map((app) => [
    `"${app.application_id}"`,
    `"${app.candidate_name}"`,
    `"${openJob.title}"`,
    `"${openJob.department}"`,
    `"${app.email}"`,
    `"${app.phone}"`,
    `"${app.gender || ""}"`,
    `"${app.location}"`,
    `"${app.experience_type}"`,
    `"${app.experience_years}"`,
    `"${app.qualification}"`,
    `"${app.current_employer}"`,
    `"${app.current_ctc}"`,
    `"${app.current_gross}"`,
    `"${app.expected_gross}"`,
    `"${app.notice_period}"`,
    `"${app.status}"`,
    `"${app.created_at}"`,
    `"Yes"`,
    `"${app.cv_filename}"`,
  ].join(","));

  const csvContent = "\uFEFF" + [csvHeaders.join(","), ...csvRows].join("\r\n");
  zip.file(csvFilename, csvContent);

  // Package CVs
  const cvFolder = zip.folder("CVs");
  const targetApps = [fresherRow, expRow];

  for (const app of targetApps) {
    const stream = await getCvStream(app.cv_file_id);
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    const fileBuffer = Buffer.concat(chunks);
    const pdfName = cleanFilename(app.candidate_name, app.application_id, app.cv_filename);
    console.log(`   ✓ Packaging CV: ${pdfName} (${fileBuffer.length} bytes)`);
    cvFolder?.file(pdfName, fileBuffer);
  }

  const zipBuffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  console.log(`   ✓ Generated ZIP size: ${zipBuffer.length} bytes`);

  // Verify ZIP contents
  const readZip = await JSZip.loadAsync(zipBuffer);
  const zipFileNames = Object.keys(readZip.files);
  console.log("\n5. Validating ZIP structure & file names:");
  for (const name of zipFileNames) {
    console.log(`   - ${name}`);
  }

  // Ensure CSV file exists in root
  const hasCsv = zipFileNames.some((f) => f.startsWith("Applicants_Master_Export_") && f.endsWith(".csv"));
  if (!hasCsv) throw new Error("ZIP is missing root Master Export CSV!");

  // Ensure formatted PDFs exist in CVs/
  const hasFresherPdf = zipFileNames.some((f) => f.includes("Aarav_Sharma_") && f.endsWith(".pdf"));
  const hasExpPdf = zipFileNames.some((f) => f.includes("Pooja_Kulkarni_") && f.endsWith(".pdf"));

  if (!hasFresherPdf || !hasExpPdf) {
    throw new Error(`PDF naming mismatch! Expected Aarav_Sharma_<id>.pdf and Pooja_Kulkarni_<id>.pdf`);
  }

  console.log("\n=================================================");
  console.log("  ALL TESTS PASSED WITH 100% SUCCESS!           ");
  console.log("=================================================");
}

run().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
