import Image from "next/image";
import { ChevronRight } from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { Link } from "@/lib/i18n/routing";
import type { Category } from "@/lib/db/types";
import { cn } from "@/lib/utils/cn";

type IconComp = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Tall category card matching the screenshot layout: white header with the
 * root category name, a dark image area, and a list of subcategories below
 * with chevron bullets. Each item is a link to the catalog filtered on that
 * subcategory.
 */
export function CategoryColumn({
  root,
  subcategories,
  icon: Icon,
  locale,
  maxVisible = 8,
}: {
  root: Category;
  subcategories: Category[];
  icon: IconComp;
  locale: string;
  maxVisible?: number;
}) {
  const visible = subcategories.slice(0, maxVisible);
  const remaining = subcategories.length - visible.length;

  return (
    <article className="flex flex-col overflow-hidden rounded-md border border-border bg-surface-elevated">
      {/* Header — fixed min height so 1- and 2-line names align across columns */}
      <Link
        href={`/catalog?category=${root.slug}`}
        locale={locale}
        className="flex min-h-[3.25rem] items-center justify-center border-b border-border bg-surface px-3 py-3 text-center transition-colors hover:bg-background/40"
      >
        <span className="line-clamp-2 text-[11px] font-semibold uppercase leading-tight tracking-[0.18em] text-foreground">
          {root.name}
        </span>
      </Link>

      {/* Image area — banner if available, icon fallback */}
      <Link
        href={`/catalog?category=${root.slug}`}
        locale={locale}
        className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-accent-dark"
        aria-label={root.name}
      >
        {root.imageUrl ? (
          <Image
            src={root.imageUrl}
            alt={root.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <Icon className="size-20 text-muted/60 transition-colors hover:text-primary" />
        )}
      </Link>

      {/* Subcategories list */}
      {visible.length > 0 ? (
        <ul className="flex flex-col gap-1 p-4">
          {visible.map((c) => (
            <li key={c.id}>
              <Link
                href={`/catalog?category=${c.slug}`}
                locale={locale}
                className={cn(
                  "group flex items-center gap-2 py-1 text-[12px] uppercase tracking-wide text-muted-strong transition-colors",
                  "hover:text-primary",
                )}
              >
                <ChevronRight className="size-3 shrink-0 text-muted group-hover:text-primary" />
                <span className="truncate">{c.name}</span>
              </Link>
            </li>
          ))}
          {remaining > 0 ? (
            <li>
              <Link
                href={`/catalog?category=${root.slug}`}
                locale={locale}
                className="mt-1 inline-block py-1 text-[11px] font-semibold text-primary hover:underline"
              >
                + {remaining}
              </Link>
            </li>
          ) : null}
        </ul>
      ) : null}
    </article>
  );
}
