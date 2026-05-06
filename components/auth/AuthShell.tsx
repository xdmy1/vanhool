import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/Container";
import { Logo } from "@/components/layout/Logo";

export function AuthShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100dvh-5rem)] items-center justify-center overflow-hidden bg-background py-12">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,transparent_0%,transparent_42%,rgba(208,73,65,0.08)_42%,rgba(208,73,65,0.08)_46%,transparent_46%)] opacity-60"
      />
      <div aria-hidden className="absolute inset-0 -z-10 bg-grid-dim opacity-30" />

      <Container>
        <div className="mx-auto w-full max-w-md rounded-md border border-border bg-surface p-8 md:p-10">
          <div className="mb-7 flex items-center gap-3">
            <Logo className="h-8 w-auto text-foreground" />
            <span className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
              Inter Bus
            </span>
          </div>
          <div className="mb-6">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.3em] text-primary">
              <ShieldCheck className="size-3" />
              {eyebrow}
            </div>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
            <p className="mt-1 text-sm text-muted-strong">{subtitle}</p>
          </div>
          {children}
        </div>
      </Container>
    </div>
  );
}
