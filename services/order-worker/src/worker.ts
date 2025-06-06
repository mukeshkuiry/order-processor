import amqp from "amqplib";
import dotenv from "dotenv";
import { saveOrderStatus } from "./db";
import { OrderMessage } from "./types";

dotenv.config();

const QUEUE_NAME = "orders";
const VENDOR_API_BASE = process.env.VENDOR_API_URL;
const AMQP_URL = process.env.AMQP_URL;

if (!VENDOR_API_BASE || !AMQP_URL) {
  throw new Error(
    "Environment variables VENDOR_API_URL and AMQP_URL must be set"
  );
}

async function reserveWithVendor(
  vendorId: string,
  productId: string,
  qty: number
): Promise<void> {
  const MAX_RETRIES = 0;
  const endpoint = new URL(`/api/${vendorId}/stock`, VENDOR_API_BASE).href;

  for (let attempt = 0; ; attempt++) {
    const resp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_id: productId, quantity: qty }),
    });

    if (resp.ok) return;

    if (attempt >= MAX_RETRIES) {
      const msg = await resp.text();
      throw new Error(
        `Vendor ${vendorId} rejected reservation (${resp.status}): ${msg}`
      );
    }

    await new Promise((r) => setTimeout(r, 2 ** attempt * 500));
  }
}

async function handleOrder(order: OrderMessage): Promise<boolean> {
  console.info(`Processing ${order.order_id}`);

  try {
    for (const { vendor_id, quantity } of order.allocations) {
      await reserveWithVendor(vendor_id, order.product_id, quantity);
      console.info(
        `Reserved ${quantity} of ${order.product_id} from ${vendor_id}`
      );
    }

    await saveOrderStatus(order.order_id, "completed", order);
    return true;
  } catch (err) {
    console.error(`Order ${order.order_id} failed:`, (err as Error).message);
    await saveOrderStatus(order.order_id, "failed", order);
    return false;
  }
}

// worker bootstrap
async function startWorker(): Promise<void> {
  const conn = await amqp.connect(AMQP_URL!);
  const ch = await conn.createChannel();
  await ch.assertQueue(QUEUE_NAME, { durable: true });
  ch.prefetch(1);

  console.log(`Worker listening on “${QUEUE_NAME}”`);

  ch.consume(QUEUE_NAME, async (msg) => {
    if (!msg) return;

    const order: OrderMessage = JSON.parse(msg.content.toString());
    const ok = await handleOrder(order);

    ok ? ch.ack(msg) : ch.nack(msg, false, false);
  });
}

startWorker().catch((err) => {
  console.error("Worker startup failed:", err);
  process.exit(1);
});
