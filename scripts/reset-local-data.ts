import { rm } from "node:fs/promises";
import path from "node:path";
import { getLocalDataDir } from "../lib/data/local-store";

async function reset() {
  const dataDir = getLocalDataDir();
  console.log(`Resetting local data directory: ${dataDir}`);
  try {
    await rm(dataDir, { recursive: true, force: true });
    console.log("Local data cleared.");
  } catch (error) {
    console.warn("Could not remove data dir:", error);
  }
}

reset().catch(console.error);
