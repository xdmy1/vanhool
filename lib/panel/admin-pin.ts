import "server-only";

/**
 * Soft-confirmation PIN for destructive admin actions. NOT real security —
 * it just guards against accidental clicks on the trash icon. Every admin
 * already passed `is_admin` before any of these actions are reachable.
 *
 * Override via env if you ever want to rotate it without a redeploy.
 */
const FALLBACK_PIN = "2549";

export function adminDeletePin(): string {
  return (process.env.ADMIN_DELETE_PIN || FALLBACK_PIN).trim();
}

export function verifyAdminPin(pin: unknown): boolean {
  if (typeof pin !== "string") return false;
  return pin.trim() === adminDeletePin();
}
