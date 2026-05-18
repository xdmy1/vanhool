import { ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/layout/LocaleSwitcher";
import { AccountMenu } from "@/components/layout/AccountMenu";
import { Link } from "@/lib/i18n/routing";
import { BookScopeSwitcher } from "@/components/panel/BookScopeSwitcher";
import type { AccountScope } from "@/lib/panel/scope";

export function PanelTopbar({
  email,
  displayName,
  locale,
  scope,
  labels,
}: {
  email: string;
  displayName: string | null;
  locale: string;
  scope: AccountScope;
  labels: {
    visitSite: string;
    backToAdmin: string;
    account: string;
    dashboard: string;
    admin: string;
    logout: string;
    conta1: string;
    conta2: string;
    lockedHint: string;
  };
}) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
      <BookScopeSwitcher
        locale={locale}
        current={scope}
        labels={{
          conta1: labels.conta1,
          conta2: labels.conta2,
          lockedHint: labels.lockedHint,
        }}
      />
      <div className="ml-auto flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex">
          <Link href={"/admin" as const} locale={locale}>
            <ExternalLink className="size-4" />
            <span className="text-sm">{labels.backToAdmin}</span>
          </Link>
        </Button>
        <Button asChild variant="ghost" size="sm" className="hidden gap-1.5 sm:inline-flex">
          <Link href="/" locale={locale}>
            <ExternalLink className="size-4" />
            <span className="text-sm">{labels.visitSite}</span>
          </Link>
        </Button>
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
