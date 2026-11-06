import { getStore } from "../lib/data";
import { getAllPositions } from "../lib/data/jobs";
import { getAllDepartments } from "../lib/data/departments";
import { getAllFormFields, getAllStatuses, resolveFormFields } from "../lib/data/config";
import { getSettings } from "../lib/data/settings";
import QRCode from "qrcode";
import bcrypt from "bcryptjs";

async function runSmokeTest() {
  console.log("--- Malati Group Recruitment Portal: Smoke Test ---");

  // 1. Data Store
  console.log("1. Checking data store & seed...");
  const store = await getStore();
  const [positions, departments, fields, statuses, settings] = await Promise.all([
    getAllPositions(),
    getAllDepartments(),
    getAllFormFields(),
    getAllStatuses(),
    getSettings(),
  ]);

  if (positions.length < 20) {
    throw new Error(`Expected at least 20 positions, found ${positions.length}`);
  }
  console.log(`   ✓ Found ${positions.length} positions`);
  console.log(`   ✓ Found ${departments.length} departments`);
  console.log(`   ✓ Found ${fields.length} form fields`);
  console.log(`   ✓ Found ${statuses.length} applicant statuses`);
  console.log(`   ✓ Company name: ${settings.company_name}`);

  // 2. Form field resolution
  console.log("2. Testing dynamic form resolution for a job...");
  const firstJob = positions[0];
  const resolved = await resolveFormFields(firstJob.id);
  if (!resolved.length) {
    throw new Error(`No form fields resolved for ${firstJob.id}`);
  }
  console.log(`   ✓ Form resolved with ${resolved.length} visible candidate fields`);

  // 3. QR Generation
  console.log("3. Testing QR buffer generation...");
  const qrBuffer = await QRCode.toBuffer("https://malatigroup.com", {
    type: "png",
    width: 300,
  });
  if (!qrBuffer || qrBuffer.length === 0) {
    throw new Error("QR buffer generation returned empty buffer");
  }
  console.log(`   ✓ QR buffer generated (${qrBuffer.length} bytes)`);

  // 4. Password hashing verification
  console.log("4. Testing bcrypt verification...");
  const hash = bcrypt.hashSync("Admin@123", 10);
  const match = bcrypt.compareSync("Admin@123", hash);
  if (!match) throw new Error("bcrypt verification failed");
  console.log("   ✓ bcrypt password verification works");

  console.log("\n>>> All smoke tests passed successfully! <<<\n");
}

runSmokeTest().catch((err) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
