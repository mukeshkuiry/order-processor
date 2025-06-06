import { Pool } from "pg";

const DATABASE_URL =
  process.env.DATABASE_URL 

if(!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const upsertStock = async (
  vendorId: string,
  stock: Record<string, number>
) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    for (const [productId, quantity] of Object.entries(stock)) {
      await client.query(
        `
        INSERT INTO vendor_stock (vendor_id, product_id, quantity)
        VALUES ($1, $2, $3)
        ON CONFLICT (vendor_id, product_id)
        DO UPDATE SET quantity = EXCLUDED.quantity, updated_at = now();
        `,
        [vendorId, productId, quantity]
      );
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};
