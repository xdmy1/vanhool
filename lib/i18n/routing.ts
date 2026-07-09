import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["ro", "en", "ru"] as const,
  defaultLocale: "ro",
  localePrefix: "always",
  // Every page already emits hreflang in <head> via `localeAlternates`, whose
  // x-default points at the real /ro URL. next-intl's Link header pointed
  // x-default at the locale-less /product/... path, which 307-redirects — a
  // redirect as an hreflang target is what GSC reports under "Page with
  // redirect" / "Duplicate without user-selected canonical".
  alternateLinks: false,
  localeCookie: {
    name: "INTERBUS_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
