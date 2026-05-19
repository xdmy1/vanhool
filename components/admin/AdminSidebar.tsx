"use client";

import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  FolderTree,
  LayoutDashboard,
  Mail,
  Package,
  ShoppingBag,
  Tags,
  Users,
} from "lucide-react";

import { Logo } from "@/components/layout/Logo";
import { Link } from "@/lib/i18n/routing";
import { cn } from "@/lib/utils/cn";

type NavItem = {
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  badge?: number;
};

export function AdminSidebar({
  locale,
  labels,
  badges,
}: {
  locale: string;
  labels: {
    overview: string;
    products: string;
    categories: string;
    orders: string;
    promocodes: string;
    messages: string;
    customers: string;
    back: string;
  };
  badges?: { orders?: number; messages?: number };
}) {
  const pathname = usePathname();
  const items: NavItem[] = [
    { href: "/admin", icon: LayoutDashboard, label: labels.overview },
    { href: "/admin/products", icon: Package, label: labels.products },
    { href: "/admin/categories", icon: FolderTree, label: labels.categories },
    {
      href: "/admin/orders",
      icon: ShoppingBag,
      label: labels.orders,
      badge: badges?.orders,
    },
    { href: "/admin/promocodes", icon: Tags, label: labels.promocodes },
    {
      href: "/admin/messages",
      icon: Mail,
      label: labels.messages,
      badge: badges?.messages,
    },
    { href: "/admin/customers", icon: Users, label: labels.customers },
  ];

  // pathname includes locale prefix; strip it for active matching
  const stripped = pathname.replace(new RegExp(`^/${locale}`), "");

  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface-elevated md:flex">
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <Logo className="h-7 w-auto text-foreground" />
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold text-foreground">Inter Bus</span>
          <span className="text-xs text-primary">Admin</span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-0.5">
          {items.map((item) => {
            const active =
              stripped === item.href ||
              (item.href !== "/admin" && stripped.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href as "/admin"}
                  locale={locale}
                  className={cn(
                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-strong hover:bg-surface hover:text-foreground",
                  )}
                >
                  <item.icon
                    className={cn(
                      "size-4 shrink-0",
                      active ? "text-primary" : "text-muted",
                    )}
                  />
                  <span className="flex-1 text-sm">
                    {item.label}
                  </span>
                  {typeof item.badge === "number" && item.badge > 0 ? (
                    <span
                      className={cn(
                        "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-px text-[10px] tabular-nums",
                        active
                          ? "bg-primary text-primary-foreground"
                          : "bg-surface text-muted-strong",
                      )}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-3">
        <Link
          href="/"
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
