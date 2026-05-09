/**
 * Constants and types shared between client and server. Kept in a separate
 * module because `actions.ts` carries `"use server"` — and "use server" files
 * can only export async functions; any non-function export gets serialized as
 * `undefined` when imported by a client component.
 */
export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
