const VENDOR_API_URL = process.env.VENDOR_API_URL;

export const VENDOR_ENDPOINTS: Record<string, string> = {
  vendor1: `${VENDOR_API_URL}/api/vendor1/stock`,
  vendor2: `${VENDOR_API_URL}/api/vendor2/stock`,
  vendor3: `${VENDOR_API_URL}/api/vendor3/stock`,
  vendor4: `${VENDOR_API_URL}/api/vendor4/stock`,
};
