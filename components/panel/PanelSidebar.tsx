"use client";

import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Boxes,
  ClipboardList,
  FileBarChart,
  FileSignature,
  FileText,
  Globe,
  LayoutDashboard,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
} from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  /** When true, render even though Phase X hasn't shipped — link is dead but visible. */
  placeholder?: boolean;
  badge?: number;
};

type SidebarLabels = {
  overview: string;
  comenziSite: string;
  clienti: string;
  produse: string;
  stock: string;
  vanzareNoua: string;
  achizitii: string;
  proforme: string;
  facturi: string;
  fiseLivrare: string;
  cheltuieli: string;
  cheltuieliCash: string;
  rapoarte: string;
  statistici: string;
  exportDocumente: string;
  setari: string;
  back: string;
};

export function PanelSidebar({
  locale,
  labels,
  badges,
  compact = false,
}: {
  locale: string;
  labels: SidebarLabels;
  badges?: { triagePending?: number };
  /** Drawer mode for mobile — drops sticky positioning + hides on lg. */
  compact?: boolean;
}) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: "/panel", icon: LayoutDashboard, label: labels.overview },
    {
      href: "/panel/comenzi-site",
      icon: Globe,
      label: labels.comenziSite,
      badge: badges?.triagePending,
    },
    { href: "/panel/vanzare-noua", icon: ShoppingCart, label: labels.vanzareNoua },
    { href: "/panel/clienti", icon: Users, label: labels.clienti },
    { href: "/panel/produse", icon: Package, label: labels.produse },
    { href: "/panel/stock", icon: Boxes, label: labels.stock },
    { href: "/panel/achizitii", icon: ClipboardList, label: labels.achizitii },
    { href: "/panel/proforme", icon: FileSignature, label: labels.proforme },
    { href: "/panel/facturi", icon: Receipt, label: labels.facturi },
    { href: "/panel/fisa-de-livrare", icon: Truck, label: labels.fiseLivrare },
    { href: "/panel/cheltuieli", icon: FileText, label: labels.cheltuieli },
    { href: "/panel/cheltuieli-cash", icon: Wallet, label: labels.cheltuieliCash },
    { href: "/panel/rapoarte", icon: FileBarChart, label: labels.rapoarte },
    { href: "/panel/statistici", icon: BarChart3, label: labels.statistici },
    { href: "/panel/export-documente", icon: FileText, label: labels.exportDocumente },
    { href: "/panel/setari", icon: Settings, label: labels.setari },
  ];

  const stripped = pathname.replace(new RegExp(`^/${locale}`), "");

  return (
    <aside
      data-panel-chrome
      className={cn(
        // Drawer mode (mobile) renders without sticky positioning since the
        // wrapper handles it; desktop layout keeps the original sticky bar.
        compact
          ? "flex h-full w-full flex-col bg-surface-elevated"
          : "sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface-elevated lg:flex",
      )}
    >
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <Logo className="h-7 w-auto text-foreground" />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold text-foreground">Inter Bus</span>
          <span className="text-xs text-primary">Panel</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active =
              stripped === item.href ||
              (item.href !== "/panel" && stripped.startsWith(item.href));
            const disabled = !!item.placeholder;
            const cls = cn(
              "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-strong hover:bg-surface hover:text-foreground",
              disabled ? "cursor-not-allowed opacity-50 hover:bg-transparent hover:text-muted-strong" : "",
            );
            return (
              <li key={item.href}>
                {disabled ? (
                  <span className={cls} aria-disabled title="În construcție">
                    <item.icon className="size-4 shrink-0 text-muted" />
                    <span className="flex-1 text-sm">{item.label}</span>
                    <span className="rounded-sm bg-surface px-1.5 py-px text-[9px] uppercase tracking-wide text-muted">
                      soon
                    </span>
                  </span>
                ) : (
                  <Link
                    href={item.href as "/panel"}
                    locale={locale}
                    className={cls}
                  >
                    <item.icon
                      className={cn(
                        "size-4 shrink-0",
                        active ? "text-primary" : "text-muted",
                      )}
                    />
                    <span className="flex-1 text-sm">{item.label}</span>
                    {typeof item.badge === "number" && item.badge > 0 ? (
                      <span
                        className={cn(
                          "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-px text-[10px] tabular-nums",
                          active
                            ? "bg-primary text-primary-foreground"
                            : "bg-warning/15 text-warning",
                        )}
                      >
                        {item.badge}
                      </span>
                    ) : null}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href={"/admin" as const}
          locale={locale}
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-muted transition-colors hover:bg-surface hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          {labels.back}
        </Link>
      </div>
    </aside>
  );
}
