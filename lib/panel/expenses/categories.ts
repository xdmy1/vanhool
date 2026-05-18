/**
 * Expense categories — plain constants, no "use server" so they can be
 * imported into client components and pages without violating the
 * Next.js rule that server-action files only export async functions.
 */

export const EXPENSE_CATEGORIES = [
  "utilities",
  "salaries",
  "rent",
  "fuel",
  "supplies",
  "transport",
  "marketing",
  "fees",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  utilities: "Utilități",
  salaries: "Salarii",
  rent: "Chirie",
  fuel: "Carburant",
  supplies: "Consumabile",
  transport: "Transport",
  marketing: "Marketing",
  fees: "Comisioane / taxe",
  other: "Altele",
};
