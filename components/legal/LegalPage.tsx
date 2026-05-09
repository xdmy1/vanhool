import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";
import { Link } from "@/lib/i18n/routing";

export type LegalPageProps = {
  locale: string;
  eyebrow: string;
  title: string;
  intro?: string;
  updatedAt?: string;
  homeLabel: string;
  infoLabel: string;
  children: ReactNode;
};

/**
 * Shared layout for /informatii/* legal pages. Breadcrumbs + page header +
 * `prose`-style content area. Children render the actual policy text.
 */
export function LegalPage({
  locale,
  eyebrow,
  title,
  intro,
  updatedAt,
  homeLabel,
  infoLabel,
  children,
}: LegalPageProps) {
  return (
    <div className="bg-background">
      {/* Breadcrumbs */}
      <div className="border-b border-border bg-surface/40">
        <Container className="flex items-center gap-2 py-4 text-xs text-muted">
          <Link href="/" locale={locale} className="transition-colors hover:text-foreground">
            {homeLabel}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-muted">{infoLabel}</span>
          <ChevronRight className="size-3" />
          <span className="truncate text-foreground">{title}</span>
        </Container>
      </div>

      <Container className="py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center gap-2 text-xs text-primary">
            <span className="h-px w-6 bg-primary" />
            {eyebrow}
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          {intro ? (
            <p className="mt-4 text-sm text-muted-strong md:text-base">{intro}</p>
          ) : null}
          {updatedAt ? (
            <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-muted">
              {updatedAt}
            </p>
          ) : null}

          <div
            className={[
              "mt-10 flex flex-col gap-6 text-sm leading-relaxed text-foreground md:text-[15px]",
              "[&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-tight md:[&_h2]:text-xl",
              "[&_h3]:mt-4 [&_h3]:text-base [&_h3]:font-semibold",
              "[&_p]:text-muted-strong [&_p]:leading-relaxed",
              "[&_ul]:flex [&_ul]:list-none [&_ul]:flex-col [&_ul]:gap-1.5 [&_ul]:pl-1",
              "[&_li]:relative [&_li]:pl-5 [&_li]:text-muted-strong",
              "[&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:top-2 [&_li]:before:size-1.5 [&_li]:before:rounded-full [&_li]:before:bg-primary/60",
              "[&_strong]:font-semibold [&_strong]:text-foreground",
              "[&_a]:text-primary [&_a]:underline-offset-2 hover:[&_a]:underline",
            ].join(" ")}
          >
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}
