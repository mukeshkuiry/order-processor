export type ProductId = `p${1 | 2 | 3 | 4 | 5}`;
export type VendorId = `vendor${1 | 2 | 3 | 4}`;

export interface VendorStock {
  [productId: string]: number;
}

export const vendorMockStock: Record<VendorId, VendorStock> = {
  vendor1: {
    p1: 40,
    p2: 50,
    p3: 60,
    p4: 70,
    p5: 80,
  },
  vendor2: {
    p1: 30,
    p2: 20,
    p3: 10,
    p4: 0,
    p5: 90,
  },
  vendor3: {
    p1: 10,
    p2: 20,
    p3: 30,
    p4: 40,
    p5: 50,
  },
  vendor4: {
    p1: 60,
    p2: 70,
    p3: 80,
    p4: 90,
    p5: 100,
  },
};
