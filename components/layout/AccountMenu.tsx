"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "@/lib/i18n/routing";
import { signOut } from "@/lib/auth/actions";

export function AccountMenu({
  email,
  displayName,
  isAdmin,
  locale,
  labels,
}: {
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  locale: string;
  labels: { account: string; dashboard: string; admin: string; logout: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onLogout = () => {
    startTransition(async () => {
      const res = await signOut();
      if (res.ok) {
        toast.success("OK");
        router.refresh();
      } else {
        toast.error(res.message ?? "Error");
      }
    });
  };

  const initial = (displayName || email || "?").charAt(0).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" aria-label={labels.account}>
          <span className="grid size-7 place-items-center rounded-full border border-primary/40 bg-primary/10 text-xs font-bold text-primary">
            {initial}
          </span>
          <span className="hidden text-xs text-muted-strong lg:inline">
            {labels.account}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            {displayName ? (
              <span className="text-sm font-medium normal-case tracking-normal text-foreground">
                {displayName}
              </span>
            ) : null}
            <span className="text-[10px] normal-case text-muted">{email}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" locale={locale} className="flex w-full items-center gap-2">
            <LayoutDashboard className="size-4 text-primary" />
            <span>{labels.dashboard}</span>
          </Link>
        </DropdownMenuItem>
        {isAdmin ? (
          <DropdownMenuItem asChild>
            <Link href="/admin" locale={locale} className="flex w-full items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              <span>{labels.admin}</span>
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault();
            onLogout();
          }}
          disabled={pending}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="size-4" />
          <span>{labels.logout}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { User };
