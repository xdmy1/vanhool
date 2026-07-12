/**
 * The business runs in Moldova. Servers run in UTC.
 *
 * Every timestamp the operator or a customer reads — invoice issue times, order
 * times, "Vânzări azi" — must be rendered in Chisinau local time, and every
 * "what day is it" decision must be made against the Chisinau calendar, not
 * UTC's. Chisinau is UTC+2 (UTC+3 in summer), so between local midnight and
 * 03:00 the UTC date is still *yesterday*: a sale entered at 01:00 would land
 * in the previous day's totals, and an invoice would be stamped with the wrong
 * issue date.
 *
 * next-intl already renders its own formatters in this zone (see
 * lib/i18n/request.ts). This module covers the raw `Date` call sites and the
 * server-side "today" computations, which next-intl never sees.
 */
export const TIMEZONE = "Europe/Chisinau";

/**
 * The calendar day `value` falls on in Chisinau, as `YYYY-MM-DD`.
 *
 * Uses `en-CA`, whose short date format is already ISO-ordered, so no manual
 * part juggling is needed.
 */
export function dateISO(value: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

/** Today's calendar day in Chisinau, as `YYYY-MM-DD`. */
export function todayISO(): string {
  return dateISO(new Date());
}

/** The calendar day `days` from now in Chisinau, as `YYYY-MM-DD`. */
export function dateISOFromNow(days: number): string {
  return dateISO(new Date(Date.now() + days * 86_400_000));
}
