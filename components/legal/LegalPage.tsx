import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";
import { Link } from "@/lib/i18n/routing";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export type LegalSection = {
  heading: string;
  blocks: LegalBlock[];
};

export type LegalPageProps = {
  locale: string;
  eyebrow: string;
  title: string;
  intro?: string;
  updatedAt?: string;
  homeLabel: string;
  infoLabel: string;
  /** Structured body content. If provided, rendered with consistent styling. */
  sections?: LegalSection[];
  /** Optional custom JSX appended after the structured content. */
  children?: ReactNode;
};

/**
 * Shared layout for /informatii/* legal pages. Breadcrumbs + page header +
 * styled prose. Pass `sections` (data-driven, locale-aware) and/or `children`.
 *
 * Inline `**bold**` markers inside text strings are rendered as `<strong>`.
 */
export function LegalPage({
  locale,
  eyebrow,
  title,
  intro,
  updatedAt,
  homeLabel,
  infoLabel,
  sections,
  children,
}: LegalPageProps) {
  return (
    <div className="bg-background">
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

          <div className="mt-10 flex flex-col gap-6 text-sm leading-relaxed text-foreground md:text-[15px]">
            {sections?.map((section, idx) => (
              <section key={idx} className="flex flex-col gap-3">
                <h2 className="text-lg font-bold tracking-tight md:text-xl">
                  {section.heading}
                </h2>
                {section.blocks.map((block, j) => (
                  <RenderBlock key={j} block={block} />
                ))}
              </section>
            ))}
            {children}
          </div>
        </div>
      </Container>
    </div>
  );
}

function RenderBlock({ block }: { block: LegalBlock }) {
  if (block.type === "p") {
    return <p className="text-muted-strong">{renderInline(block.text)}</p>;
  }
  if (block.type === "ul") {
    return (
      <ul className="flex list-none flex-col gap-1.5 pl-1">
        {block.items.map((item, i) => (
          <li
            key={i}
            className="relative pl-5 text-muted-strong before:absolute before:left-0 before:top-2 before:size-1.5 before:rounded-full before:bg-primary/60"
          >
            {renderInline(item)}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ol className="flex flex-col gap-1.5 pl-5 [counter-reset:item]">
      {block.items.map((item, i) => (
        <li
          key={i}
          className="relative pl-7 text-muted-strong before:absolute before:left-0 before:top-0 before:font-mono before:text-xs before:text-primary [counter-increment:item] [&::before]:[content:counter(item)'.']"
        >
          {renderInline(item)}
        </li>
      ))}
    </ol>
  );
}

/**
 * Parse inline `**bold**` segments into `<strong>` nodes. Plain text
 * passes through unchanged. Used by paragraphs and list items so each
 * page's content stays as plain strings (translatable).
 */
function renderInline(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{part}</span>;
  });
}
