"use client";

import { useState, type ReactNode } from "react";
import { Package, User as UserIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type Tab = "orders" | "profile";

export function DashboardTabs({
  labels,
  ordersBadge,
  ordersTab,
  profileTab,
}: {
  labels: { orders: string; profile: string };
  ordersBadge?: number;
  ordersTab: ReactNode;
  profileTab: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("orders");

  return (
    <div>
      <div role="tablist" className="mb-6 inline-flex rounded-md border border-border bg-surface-elevated p-1">
        <TabButton
          active={tab === "orders"}
          onClick={() => setTab("orders")}
          icon={<Package className="size-3.5" />}
          badge={ordersBadge}
        >
          {labels.orders}
        </TabButton>
        <TabButton
          active={tab === "profile"}
          onClick={() => setTab("profile")}
          icon={<UserIcon className="size-3.5" />}
        >
          {labels.profile}
        </TabButton>
      </div>

      <div role="tabpanel">{tab === "orders" ? ordersTab : profileTab}</div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  badge,
  children,
}: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  badge?: number;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-sm px-4 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-strong hover:text-foreground",
      )}
    >
      {icon}
      <span>{children}</span>
      {typeof badge === "number" && badge > 0 ? (
        <span
          className={cn(
            "ml-1 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-px text-[10px] tabular-nums",
            active ? "bg-primary text-primary-foreground" : "bg-surface text-muted-strong",
          )}
        >
          {badge}
        </span>
      ) : null}
    </button>
  );
}
