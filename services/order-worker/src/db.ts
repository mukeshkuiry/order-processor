import dotenv from "dotenv";
import { Pool } from "pg";
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

export const pool = new Pool({
  connectionString: DATABASE_URL,
});

export const saveOrderStatus = async (
  order_id: string,
  status: string,
  message: object
) => {
  const client = await pool.connect();
  try {
    await client.query(
      `INSERT INTO orders (order_id, status, payload, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (order_id) DO UPDATE
       SET status = $2, payload = $3, updated_at = NOW()`,
      [order_id, status, message]
    );
  } finally {
    client.release();
  }
};
