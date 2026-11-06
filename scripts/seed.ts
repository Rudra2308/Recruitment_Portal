import { getStore } from "../lib/data";
import { seedIfEmpty } from "../lib/data/bootstrap";
import { getAllPositions } from "../lib/data/jobs";
import { getAllDepartments } from "../lib/data/departments";
import { getAllFormFields, getAllStatuses } from "../lib/data/config";

async function main() {
  console.log("Initializing data store...");
  const store = await getStore();
  await seedIfEmpty(store);

  const [positions, departments, fields, statuses] = await Promise.all([
    getAllPositions(),
    getAllDepartments(),
    getAllFormFields(),
    getAllStatuses(),
  ]);

  console.log("\nSeed completed successfully:");
  console.log(`- Positions: ${positions.length}`);
  console.log(`- Departments: ${departments.length}`);
  console.log(`- Form fields: ${fields.length}`);
  console.log(`- Statuses: ${statuses.length}`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
