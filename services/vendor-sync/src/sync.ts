import axios from "axios";
import cron from "node-cron";
import { upsertStock } from "./db";
import { VendorStockResponse } from "./types";
import { retryWithBackoff } from "./utils/retry";
import { VENDOR_ENDPOINTS } from "./vendors";

// Pulls stock from all vendor endpoints and updates local DB
async function syncAllVendors() {
  console.log(`[sync] starting vendor stock sync...`);

  for (const [vendorId, url] of Object.entries(VENDOR_ENDPOINTS)) {
    try {
      const { stock } = await retryWithBackoff<VendorStockResponse>(
        () => axios.get(url).then((res) => res.data),
        3,
        1000
      );

      await upsertStock(vendorId, stock);
      console.log(`[sync] ${vendorId}: stock synced`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[sync] ${vendorId}: failed to sync - ${msg}`);
    }
  }
}

// Run immediately when service starts
syncAllVendors().catch((err) => {
  console.error("[sync] initial sync failed:", err);
});

// Run every minute via cron
cron.schedule("* * * * *", () => {
  syncAllVendors().catch((err) => {
    console.error("[sync] cron sync failed:", err);
  });
});
