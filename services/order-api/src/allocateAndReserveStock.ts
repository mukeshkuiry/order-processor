import { pool } from "./db";

interface VendorAllocation {
  vendor_id: string;
  quantity: number;
}

export const allocateAndReserveStock = async (
  product_id: string,
  requiredQty: number
): Promise<{ success: true; allocations: VendorAllocation[] } | { success: false }> => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const res = await client.query(
      `SELECT vendor_id, quantity
       FROM vendor_stock
       WHERE product_id = $1 AND quantity > 0
       ORDER BY quantity DESC
       FOR UPDATE`,
      [product_id]
    );

    let remaining = requiredQty;
    const allocations: VendorAllocation[] = [];

    for (const row of res.rows) {
      const available = row.quantity;
      if (remaining <= 0) break;

      const useQty = Math.min(remaining, available);
      allocations.push({ vendor_id: row.vendor_id, quantity: useQty });
      remaining -= useQty;
    }

    if (remaining > 0) {
      await client.query("ROLLBACK");
      return { success: false };
    }

    // Apply reservations
    for (const a of allocations) {
      await client.query(
        `UPDATE vendor_stock
         SET quantity = quantity - $1
         WHERE vendor_id = $2 AND product_id = $3`,
        [a.quantity, a.vendor_id, product_id]
      );
    }

    await client.query("COMMIT");
    return { success: true, allocations };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
