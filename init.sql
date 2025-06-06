
-- Create vendor_stock table
CREATE TABLE IF NOT EXISTS vendor_stock (
  vendor_id TEXT NOT NULL,
  product_id TEXT NOT NULL,
  quantity INT NOT NULL,
  updated_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY (vendor_id, product_id)
);

-- Create simplified orders table
CREATE TABLE IF NOT EXISTS orders (
  order_id TEXT PRIMARY KEY,
  status TEXT DEFAULT 'pending',
  payload JSONB NOT NULL,
  updated_at TIMESTAMP DEFAULT now()
);
