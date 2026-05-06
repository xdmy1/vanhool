/**
 * Global runtime flags read from env. Kept in one file so toggles are discoverable.
 */

export const USE_DEMO_DATA =
  process.env.NEXT_PUBLIC_DEMO_MODE === "1" ||
  // Fallback during Vercel preview if anon RLS forbids reads
  process.env.NEXT_PUBLIC_DEMO_MODE === "true";
