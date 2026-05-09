import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

// Navbar/Footer read the user's auth cookie via Supabase, but Next.js 16's
// static analysis doesn't always detect that through `createClient()`. Forcing
// dynamic rendering ensures the navbar shows the correct AccountMenu vs Login
// button on every request.
export const dynamic = "force-dynamic";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
