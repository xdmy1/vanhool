/** Shared types for the maib e-commerce API (https://api.maibmerchants.md/v1). */

export type MaibCurrency = "MDL" | "EUR" | "USD";

export type MaibPayItem = {
  id?: string;
  name: string;
  price: number;
  quantity: number;
};

/** Request body for POST /pay (direct payment). amount/currency/clientIp required. */
export type MaibPayInput = {
  amount: number;
  currency: MaibCurrency;
  clientIp: string;
  language?: "ro" | "en" | "ru";
  description?: string;
  clientName?: string;
  email?: string;
  phone?: string;
  orderId?: string;
  delivery?: number;
  items?: MaibPayItem[];
  callbackUrl?: string;
  okUrl?: string;
  failUrl?: string;
};

/** Result of POST /pay. */
export type MaibPayResult = {
  payId: string;
  payUrl: string;
  orderId?: string;
};

/** maib payment lifecycle status (callback + pay-info). */
export type MaibStatus = "OK" | "FAILED" | "PENDING" | "REVERSED" | string;

/** Result of GET /pay-info/{id} and the callback `result` object. */
export type MaibPayInfo = {
  payId: string;
  orderId?: string;
  status: MaibStatus;
  statusCode?: string;
  statusMessage?: string;
  amount?: number;
  currency?: string;
  cardNumber?: string;
  rrn?: string;
  approval?: string;
  [key: string]: unknown;
};

/** Body maib POSTs to the Callback URL. */
export type MaibCallbackBody = {
  result: MaibPayInfo;
  signature: string;
};
