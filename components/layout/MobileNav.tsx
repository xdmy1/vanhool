"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/lib/i18n/routing";
import { Logo } from "@/components/layout/Logo";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { signOut } from "@/lib/auth/actions";
import { cn } from "@/lib/utils/cn";

type NavLink = {
  href:
    | "/catalog"
    | "/categories"
    | "/promotions"
    | "/piese-auto"
    | "/about"
    | "/contact";
  label: string;
};

export function MobileNav({
  locale,
  user,
  isAdmin,
  links,
  authedLabels,
  guestLabels,
}: {
  locale: string;
  user: { displayName: string | null; email: string } | null;
  isAdmin: boolean;
  links: NavLink[];
  authedLabels: { dashboard: string; admin: string; logout: string };
  guestLabels: { login: string; register: string };
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const close = () => setOpen(false);

  const onLogout = () => {
    startTransition(async () => {
      const res = await signOut();
      if (res.ok) {
        toast.success("OK");
        close();
        router.refresh();
      } else {
        toast.error(res.message ?? "Error");
      }
    });
  };

  const initial = user
    ? (user.displayName || user.email || "?").charAt(0).toUpperCase()
    : null;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="grid size-10 place-items-center rounded-md border border-border bg-surface-elevated text-foreground transition-colors hover:bg-surface md:hidden"
          aria-label="Meniu"
        >
          <Menu className="size-5" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm" />
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 right-0 z-50 flex w-[85vw] max-w-sm flex-col bg-surface-elevated shadow-[var(--shadow-elevated)]",
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <Link
              href="/"
              locale={locale}
              onClick={close}
              className="flex items-center gap-2"
              aria-label="Inter Bus"
            >
              <Logo className="h-7 w-auto text-foreground" />
              <span className="text-base font-semibold">Inter Bus</span>
            </Link>
            <Dialog.Close asChild>
              <button
                type="button"
                className="grid size-9 place-items-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground"
                aria-label="Închide"
              >
                <X className="size-5" />
              </button>
            </Dialog.Close>
            <Dialog.Title className="sr-only">Meniu</Dialog.Title>
          </div>

          {user ? (
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <span className="grid size-10 place-items-center rounded-full border border-primary/40 bg-primary/10 text-base font-semibold text-primary">
                {initial}
              </span>
              <div className="min-w-0">
                {user.displayName ? (
                  <div className="truncate text-sm font-semibold text-foreground">
                    {user.displayName}
                  </div>
                ) : null}
                <div className="truncate text-xs text-muted">{user.email}</div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 border-b border-border px-5 py-4">
              <Link
                href="/login"
                locale={locale}
                onClick={close}
                className="inline-flex items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-[color:var(--primary-hover)]"
              >
                <LogIn className="size-4" />
                {guestLabels.login}
              </Link>
              <Link
                href="/register"
                locale={locale}
                onClick={close}
                className="inline-flex items-center justify-center gap-1.5 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-background"
              >
                <UserPlus className="size-4" />
                {guestLabels.register}
              </Link>
            </div>
          )}

          <nav className="flex-1 overflow-y-auto px-2 py-3">
            <ul className="flex flex-col gap-0.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    locale={locale}
                    onClick={close}
                    className="flex items-center rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            {user ? (
              <>
                <div className="my-3 h-px bg-border" />
                <ul className="flex flex-col gap-0.5">
                  <li>
                    <Link
                      href="/dashboard"
                      locale={locale}
                      onClick={close}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface"
                    >
                      <LayoutDashboard className="size-4 text-primary" />
                      {authedLabels.dashboard}
                    </Link>
                  </li>
                  {isAdmin ? (
                    <li>
                      <Link
                        href="/admin"
                        locale={locale}
                        onClick={close}
                        className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-surface"
                      >
                        <ShieldCheck className="size-4 text-primary" />
                        {authedLabels.admin}
                      </Link>
                    </li>
                  ) : null}
                  <li>
                    <button
                      type="button"
                      onClick={onLogout}
                      disabled={pending}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
                    >
                      <LogOut className="size-4" />
                      {authedLabels.logout}
                    </button>
                  </li>
                </ul>
              </>
            ) : null}
          </nav>

          <div className="border-t border-border px-5 py-3">
            <LocaleSwitcher />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
