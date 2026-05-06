import "server-only";

type SupabaseError = {
  code?: string | null;
  message?: string | null;
  details?: string | null;
};

/**
 * Map a Postgres / supabase-js error to a friendly Romanian message.
 * Falls back to the raw message for anything we don't specifically handle.
 *
 * Codes from https://www.postgresql.org/docs/current/errcodes-appendix.html
 */
export function dbErrorMessage(error: SupabaseError | null | undefined): string {
  if (!error) return "Eroare necunoscută la baza de date.";
  switch (error.code) {
    case "23505":
      // unique_violation
      return "Există deja un element cu aceeași valoare unică (slug sau cod). Alege altul.";
    case "23503":
      // foreign_key_violation
      return "Referință invalidă — categoria sau produsul indicat nu mai există.";
    case "23502":
      // not_null_violation
      return "Lipsește un câmp obligatoriu.";
    case "23514":
      // check_violation
      return "Una dintre valori nu respectă constrângerile (ex: status invalid).";
    case "42501":
      // insufficient_privilege
      return "Nu ai permisiuni să faci această modificare.";
    case "PGRST116":
      // postgrest singleton not found
      return "Înregistrarea nu există sau nu o poți accesa.";
    default:
      return error.message || error.details || "Eroare necunoscută la baza de date.";
  }
}
