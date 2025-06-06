import express, { Request } from "express";
import { VendorId, vendorMockStock } from "./mock_data";

const app = express();
const port = 4000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/:vendor/stock", (req: Request<{ vendor: string }>, res: any) => {
  const vendor = req.params.vendor as VendorId;

  if (!(vendor in vendorMockStock)) {
    return res.status(404).json({ error: `Vendor '${vendor}' not found.` });
  }

  const stock = vendorMockStock[vendor];
  console.log(`[GET] Stock for vendor: ${vendor}`, stock);

  return res.status(200).json({ vendor, stock });
});

app.post(
  "/api/:vendor/stock",
  (
    req: Request<
      { vendor: string },
      unknown,
      { product_id: string; quantity: number }
    >,
    res: any
  ) => {
    const vendor = req.params.vendor as VendorId;
    const { product_id, quantity } = req.body;

    if (!(vendor in vendorMockStock)) {
      console.error(`[POST] Vendor '${vendor}' not found.`);
      return res.status(404).json({ error: `Vendor '${vendor}' not found.` });
    }

    const stockTable = vendorMockStock[vendor];

    if (!(product_id in stockTable)) {
      console.error(
        `[POST] Product '${product_id}' not found in vendor '${vendor}'.`
      );
      return res.status(400).json({
        error: `Product '${product_id}' not found in vendor '${vendor}'.`,
      });
    }

    const currentQty = stockTable[product_id];

    if (currentQty + quantity < 0) {
      console.error(
        `[POST] Insufficient quantity for product '${product_id}' in vendor '${vendor}'. Requested: ${quantity}, Available: ${currentQty}`
      );
      return res.status(400).json({
        error: `Insufficient stock for product '${product_id}' in vendor '${vendor}'.`,
      });
    }

    stockTable[product_id] += quantity;

    console.log(
      `[POST] Updated stock — Vendor: ${vendor}, Product: ${product_id}, New Qty: ${stockTable[product_id]}`
    );

    return res.status(200).json({
      vendor,
      product_id,
      quantity: stockTable[product_id],
      message: `Quantity for product '${product_id}' updated successfully.`,
    });
  }
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Vendor mock API running at http://localhost:${port}`);
});
