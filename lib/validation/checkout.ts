import { z } from "zod";

export const PHONE_PREFIXES = [
  { code: "+373", country: "MD", iso: "MD", flag: "🇲🇩", label: "Moldova" },
  { code: "+40", country: "RO", iso: "RO", flag: "🇷🇴", label: "România" },
  { code: "+7", country: "RU", iso: "RU", flag: "🇷🇺", label: "Русский" },
  { code: "+44", country: "GB", iso: "GB", flag: "🇬🇧", label: "United Kingdom" },
  { code: "+49", country: "DE", iso: "DE", flag: "🇩🇪", label: "Deutschland" },
  { code: "+33", country: "FR", iso: "FR", flag: "🇫🇷", label: "France" },
  { code: "+39", country: "IT", iso: "IT", flag: "🇮🇹", label: "Italia" },
  { code: "+34", country: "ES", iso: "ES", flag: "🇪🇸", label: "España" },
] as const;

export const PAYMENT_METHODS = ["paynet", "cash", "transfer"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const orderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  partCode: z.string(),
  brand: z.string(),
  price: z.number().nonnegative(),
  quantity: z.number().int().positive(),
});

export const checkoutSchema = z.object({
  firstName: z.string().min(2).max(60),
  lastName: z.string().min(2).max(60),
  email: z.string().email(),
  phoneCountry: z.string().min(2).max(4),
  phoneNumber: z.string().min(5).max(20),
  city: z.string().min(2).max(80),
  postal: z.string().max(20).optional().or(z.literal("")),
  address: z.string().min(5).max(200),
  notes: z.string().max(500).optional().or(z.literal("")),
  paymentMethod: z.enum(PAYMENT_METHODS),
  terms: z.literal(true),
  promoCode: z.string().max(40).optional().or(z.literal("")),
  items: z.array(orderItemSchema).min(1),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;
