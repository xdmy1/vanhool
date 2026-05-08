import type { ReactNode } from "react";

import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";

export function AuthShell({
  title,
  subtitle,
  children,
}: {
  eyebrow?: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100dvh-5rem)] items-center justify-center bg-background py-12">
      <Container>
        <div className="mx-auto w-full max-w-md rounded-md border border-border bg-surface-elevated p-8 shadow-[var(--shadow-card)] md:p-10">
          <div className="mb-6 flex items-center gap-3">
            <Logo className="h-8 w-auto text-foreground" />
            <span className="text-base font-semibold text-foreground">Inter Bus</span>
          </div>
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
            <p className="mt-1 text-sm text-muted-strong">{subtitle}</p>
          </div>
          {children}
        </div>
      </Container>
    </div>
  );
}
