# Inter Bus — Next.js

Magazin online de piese auto pentru autobuze **Inter Bus**, migrat de pe site static vanilla JS pe Next.js 16 App Router + Supabase + next-intl. Deployment: Vercel.

## Status

Faza 1 — **Fundație**. Baza Next.js + design system + routing + Supabase SSR + layout + home placeholder. Paginile de catalog, produs, cart, checkout, dashboard, admin vin în fazele următoare.

## Stack

- Next.js 16 App Router · React 19.2 · TypeScript
- Tailwind CSS v4 (CSS-first config, CSS variables)
- shadcn/ui primitives (Radix + copy-in)
- @supabase/ssr (Server Components first)
- next-intl 4.x (3 locale-uri: ro, en, ru)
- Zustand (cart — Faza 3), react-hook-form + zod, sonner, lucide-react
- Geist Sans/Mono
- Turbopack (default în Next.js 16)

## Setup

```bash
cp .env.local.example .env.local
# (optional) add SUPABASE_SERVICE_ROLE_KEY for admin features in Faza 5

npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run lint
npm run build
```

## Structure

```
app/
├── layout.tsx             # root — html/body, Geist, metadata
├── [locale]/
│   ├── layout.tsx         # locale-aware layout: NextIntlClientProvider, Navbar, Footer
│   ├── page.tsx           # home
│   ├── not-found.tsx
│   └── {catalog,categories,product,cart,checkout,about,contact,login,register,dashboard,admin}/
└── globals.css            # design tokens + Tailwind v4 @theme

components/
├── ui/                    # button, input, dropdown-menu (shadcn copy-in)
├── layout/                # Navbar, Footer, Logo, LocaleSwitcher, Container
└── common/                # PlaceholderPage (Faza 1), etc.

lib/
├── supabase/              # client.ts, server.ts, middleware.ts, admin.ts, database.types.ts
├── i18n/                  # routing.ts (defineRouting + createNavigation), request.ts, config.ts
├── cart/                  # Zustand store + pricing + sync (Faza 3)
└── utils/cn.ts

messages/
├── ro.json / en.json / ru.json

proxy.ts                   # Next.js 16 proxy: next-intl locale + Supabase session refresh
next.config.ts             # withNextIntl + images remotePatterns (Supabase storage)
tailwind.config.ts         # (nu mai e necesar — config în globals.css cu @theme)
```

## Design tokens

Definite în `app/globals.css`:

- `--background: #0a0a0a`, `--surface: #141414`, `--surface-elevated: #1c1c1c`
- `--primary: #D04941` (roșu din logo), `--accent-dark: #2B2B2B` (negru din logo)
- `--foreground: #fafafa`, `--muted: #a1a1a1`, `--muted-strong: #d4d4d4`
- `--border: #262626`, `--border-strong: #333333`

Access în Tailwind: `bg-background`, `bg-primary`, `text-muted`, `border-border`, etc.

## Roadmap

- [x] **Faza 1** — Fundație (bootstrap, design system, routing, SSR Supabase, home)
- [ ] **Faza 2** — Catalog, categorii, product detail
- [ ] **Faza 3** — Cart, checkout, auth, dashboard
- [ ] **Faza 4** — Marketing pages (about, contact)
- [ ] **Faza 5** — Admin panel complet
- [ ] **Faza 6** — Polish, SEO, DNS cutover la Vercel

Plan complet: `/Users/bobernagadamian/.claude/plans/parallel-dreaming-anchor.md`.
