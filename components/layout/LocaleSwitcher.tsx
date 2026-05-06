"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { Check, Languages } from "lucide-react";

import { routing, type Locale, usePathname, useRouter } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LOCALE_LABELS: Record<Locale, { short: string; long: string }> = {
  ro: { short: "RO", long: "Română" },
  en: { short: "EN", long: "English" },
  ru: { short: "RU", long: "Русский" },
};

export function LocaleSwitcher({ variant = "ghost" }: { variant?: "ghost" | "secondary" }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [, startTransition] = useTransition();

  const onSelect = (next: Locale) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error -- params shape is loose across routes
        { pathname, params },
        { locale: next },
      );
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className="gap-1.5 font-mono uppercase tracking-widest"
          aria-label="Change language"
        >
          <Languages className="size-4" />
          {LOCALE_LABELS[locale].short}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-36">
        <DropdownMenuLabel>Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onSelect={() => onSelect(loc as Locale)}
            className="justify-between"
          >
            <span className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-widest text-muted">
                {LOCALE_LABELS[loc as Locale].short}
              </span>
              <span>{LOCALE_LABELS[loc as Locale].long}</span>
            </span>
            {loc === locale && <Check className="size-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
