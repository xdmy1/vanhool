import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const registerSchema = z
  .object({
    firstName: z.string().min(2).max(60),
    lastName: z.string().min(2).max(60),
    email: z.string().email(),
    phone: z.string().min(6).max(30).optional().or(z.literal("")),
    company: z.string().max(120).optional().or(z.literal("")),
    password: z.string().min(8),
    passwordConfirm: z.string().min(8),
    language: z.enum(["ro", "en", "ru"]).default("ro"),
    terms: z.literal(true),
    marketingOptIn: z.boolean().optional(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    message: "Passwords do not match",
    path: ["passwordConfirm"],
  });

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
