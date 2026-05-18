import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { getLocale } from "next-intl/server";
import { Toaster } from "sonner";

import { CartBootstrap } from "@/components/cart/CartBootstrap";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://inter-bus.md",
  ),
  title: {
    default: "Inter Bus — Piese auto pentru autobuze",
    template: "%s — Inter Bus",
  },
  description:
    "Magazin online de piese auto rare pentru autobuze Inter Bus. Livrare rapidă în Moldova și internațional.",
  // The icon convention files (app/icon.tsx, app/apple-icon.tsx) are picked
  // up automatically — Next injects the <link> tags. We don't need to list
  // them here; we only set `manifest` so Android/Chrome wire up the PWA
  // home-screen entry with the right name + icons + theme color.
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Inter Bus",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#ece9e2",
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
      className={inter.variable}
      style={{ colorScheme: "light", backgroundColor: "#ece9e2" }}
      suppressHydrationWarning
    >
      <body
        className="min-h-dvh bg-background text-foreground antialiased"
        suppressHydrationWarning
      >
        {children}
        <CartBootstrap />
        <Toaster
          theme="light"
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--surface-elevated)",
              color: "var(--foreground)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-elevated)",
            },
          }}
        />
      </body>
    </html>
  );
}
