import dotenv from "dotenv";
import express, { Request } from "express";
import { allocateAndReserveStock } from "./allocateAndReserveStock";
import { connectQueue, sendToQueue } from "./queue";
import { generateOrderId } from "./utils/uuid";

dotenv.config();
const app = express();
app.use(express.json());
const port = 5000;

app.post("/api/order", async (req: Request, res: any) => {
  const { product_id, quantity } = req.body;

  if (!product_id || !quantity || quantity <= 0) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const result = await allocateAndReserveStock(product_id, quantity);
    if (!result.success) {
      return res
        .status(400)
        .json({ error: "Insufficient stock to fulfill order" });
    }

    const order_id = generateOrderId();
    const orderPayload = {
      order_id,
      product_id,
      total_quantity: quantity,
      allocations: result.allocations,
      status: "pending",
      created_at: new Date().toISOString(),
    };

    await sendToQueue(orderPayload);
    return res.status(200).json({
      status: "queued",
      order_id,
      fulfillment: result.allocations,
    });
  } catch (err) {
    console.error("Order error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// bootstrap the server and connect to AMQP queue
(async () => {
  try {
    await connectQueue();
    console.log("✅  AMQP connected");

    app.listen(port, () =>
      console.log(`🚀  Order API running at http://localhost:${port}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
})();
