import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { getLocale } from "next-intl/server";
import { Toaster } from "sonner";

import { CartBootstrap } from "@/components/cart/CartBootstrap";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://interbus.md",
  ),
  title: {
    default: "Inter Bus — Piese auto pentru autobuze",
    template: "%s — Inter Bus",
  },
  description:
    "Magazin online de piese auto rare pentru autobuze Inter Bus. Livrare rapidă în Moldova și internațional.",
  icons: {
    icon: "/logo.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html
      lang={locale}
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh bg-background text-foreground antialiased">
        {children}
        <CartBootstrap />
        <Toaster
          theme="dark"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--surface-elevated)",
              color: "var(--foreground)",
              border: "1px solid var(--border-strong)",
            },
          }}
        />
      </body>
    </html>
  );
}
