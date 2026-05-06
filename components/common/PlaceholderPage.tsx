import { Construction, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/Container";
import { Link } from "@/lib/i18n/routing";

export function PlaceholderPage({
  eyebrow,
  title,
  description,
  locale,
  homeLabel,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  locale: string;
  homeLabel: string;
}) {
  return (
    <Container className="py-24 md:py-32">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto mb-6 inline-flex size-14 items-center justify-center rounded-full border border-border bg-surface text-primary">
          <Construction className="size-6" />
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
          {eyebrow}
        </div>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-4 max-w-lg text-muted-strong">{description}</p>
        ) : null}
        <Button asChild size="lg" variant="secondary" className="mt-8">
          <Link href="/" locale={locale}>
            <ArrowLeft className="size-4" />
            {homeLabel}
          </Link>
        </Button>
      </div>
    </Container>
  );
}
