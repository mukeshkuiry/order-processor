import { randomUUID } from "crypto";

export const generateOrderId = () => `order_${randomUUID()}`;
