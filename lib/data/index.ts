import { getDataMode } from "@/lib/config";
import { seedIfEmpty } from "@/lib/data/bootstrap";
import { GoogleSheetStore } from "@/lib/data/google-store";
import { LocalStore } from "@/lib/data/local-store";
import type { DataStore } from "@/lib/data/store";

let storePromise: Promise<DataStore> | null = null;

/**
 * Returns the configured data store, bootstrapped and seeded once per server
 * process. A failed initialisation is not cached, so a transient Google error
 * can recover on the next request.
 */
export async function getStore(): Promise<DataStore> {
  if (!storePromise) {
    storePromise = (async () => {
      const mode = getDataMode();
      const store: DataStore =
        mode === "google" ? new GoogleSheetStore() : new LocalStore();
      await store.ensureReady();
      await seedIfEmpty(store);
      return store;
    })().catch((error) => {
      storePromise = null;
      throw error;
    });
  }
  return storePromise;
}

export type { DataStore, Row, SheetName } from "@/lib/data/store";
