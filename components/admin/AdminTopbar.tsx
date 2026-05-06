import { Bell, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { Link } from "@/lib/i18n/routing";

export function AdminTopbar({
  email,
  displayName,
  locale,
  labels,
}: {
  email: string;
  displayName: string | null;
  locale: string;
  labels: {
    visitSite: string;
    account: string;
    dashboard: string;
    admin: string;
    logout: string;
  };
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <div className="ml-auto flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex">
          <Link href="/" locale={locale}>
            <ExternalLink className="size-4" />
            <span className="font-mono text-[11px] uppercase tracking-wider">
              {labels.visitSite}
            </span>
          </Link>
        </Button>
        <button
          type="button"
          className="grid size-9 place-items-center rounded-md border border-border bg-surface text-muted transition-colors hover:border-border-strong hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="size-4" />
        </button>
        <div className="hidden h-8 w-px bg-border sm:block" />
        <LocaleSwitcher />
        <div className="hidden h-8 w-px bg-border sm:block" />
        <AccountMenu
          email={email}
          displayName={displayName}
          isAdmin={true}
          locale={locale}
          labels={{
            account: labels.account,
            dashboard: labels.dashboard,
            admin: labels.admin,
            logout: labels.logout,
          }}
        />
      </div>
    </header>
  );
}
