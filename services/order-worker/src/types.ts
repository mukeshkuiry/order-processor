export interface VendorAllocation {
  vendor_id: string;
  quantity: number;
}

export interface OrderMessage {
  order_id: string;
  product_id: string;
  total_quantity: number;
  allocations: VendorAllocation[];
  created_at: string;
}
