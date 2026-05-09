# Odoo integration — setup guide

Odoo runs as a separate service alongside Supabase + Next.js. It's the source
of truth for **inventory, purchasing, customers, quotes, invoices, accounting**.
The web stack mirrors a subset of this data into Supabase for fast public reads
and pushes web orders back into Odoo for fulfillment.

## 1. Pick how to host Odoo

| Option | Cost | Effort | Best when |
|---|---|---|---|
| **Self-hosted (Docker)** | $0–10/mo VPS | Medium — DIY backups & updates | You want full control, comfortable with Linux |
| **[Odoo.sh](https://www.odoo.sh)** | ~$30–80/mo | Low — managed | You want Git-based deploys without ops |
| **Odoo Online (SaaS)** | ~$25/user/mo | None | Few users, stock features only, no custom code |

For a small bus-parts shop with 1–3 staff, **self-hosted Docker** on a €5/mo
Hetzner VPS is the most cost-effective. Move to Odoo.sh if ops becomes a chore.

### Self-hosted with Docker (recommended start)

`docker-compose.yml` (separate folder from this Next.js project):

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: odoo
      POSTGRES_PASSWORD: <strong-pw>
      POSTGRES_DB: postgres
    volumes:
      - odoo-db-data:/var/lib/postgresql/data
    restart: unless-stopped

  odoo:
    image: odoo:18  # use the latest LTS
    depends_on: [db]
    ports:
      - "8069:8069"
    environment:
      HOST: db
      USER: odoo
      PASSWORD: <strong-pw>
    volumes:
      - odoo-web-data:/var/lib/odoo
      - ./addons:/mnt/extra-addons
    restart: unless-stopped

volumes:
  odoo-db-data:
  odoo-web-data:
```

`docker compose up -d` → http://localhost:8069 → set master password →
create database "interbus" → choose Romanian / Moldovan locale + EUR.

Put a reverse proxy (Caddy / nginx) with HTTPS in front before exposing it
publicly. Backup `odoo-db-data` daily.

## 2. Install required modules

In Odoo: **Apps** menu → search and install:

- **Sales** (`sale_management`) — quotes & sales orders
- **Inventory** (`stock`) — warehouses, stock moves
- **Accounting** / **Invoicing** (`account`) — invoices for customers
- **Purchase** (`purchase`) — record what you buy into stock from suppliers
- **Barcode** (`stock_barcode`) — scan parts in/out with a USB or Bluetooth scanner
- **Contacts** (`contacts`) — customers (already pulled in by Sales)

For Moldova: install **l10n_md** if available, otherwise the generic chart of
accounts is fine — your accountant can map it.

## 3. Create an API user

Settings → Users & Companies → **Users** → Create:

- **Name**: `Web API`
- **Login**: `api@interbus.md`
- **User Type**: Internal user
- **Access Rights**:
  - Sales: User: All Documents
  - Inventory: Administrator
  - Accounting: Billing
  - Contacts: User: All Documents
  - Purchase: User
  - Technical Settings: enable **Developer mode** in Settings to see this

Save → open the user → **Action → Change Password** (or **API Keys** tab if
in dev mode) → generate an API key. Copy this string — it's used for
`ODOO_API_KEY` below.

## 4. Wire it up in Next.js

Edit `nextjs/.env.local`:

```
ODOO_URL=https://odoo.your-domain.com
ODOO_DB=interbus
ODOO_USER=api@interbus.md
ODOO_API_KEY=<the-api-key-from-step-3>
ODOO_WEBHOOK_SECRET=<random-32-char-string>
```

Run the SQL migration in Supabase:

```
sql/supabase-odoo-migration.sql
```

That adds `odoo_id` cross-references on products / profiles / orders,
a `barcode` column on products, and an `odoo_sync_log` table.

## 5. Webhook from Odoo → Next.js (optional, for live updates)

Without this, you sync periodically (cron). With it, Odoo pushes events as
they happen. Set up an **Automation Rule** in Odoo:

- **Apply on**: `product.product` (or `stock.quant` for stock changes)
- **Trigger**: On Update
- **Action**: Execute Python code

Code (paste into the Python action):

```python
import requests, json, hmac, hashlib, os
url = "https://your-site.com/api/odoo/webhook"
secret = "<ODOO_WEBHOOK_SECRET from .env>"
payload = json.dumps({
    "event": "product.updated",
    "model": "product.product",
    "id": record.id,
    "barcode": record.barcode,
    "qty_available": record.qty_available,
    "list_price": record.list_price,
})
sig = hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
requests.post(url, data=payload, headers={
    "content-type": "application/json",
    "x-odoo-signature": sig,
}, timeout=5)
```

The Next.js webhook route (`app/api/odoo/webhook/route.ts`) verifies the HMAC
signature and applies the change to Supabase.

## 6. The 8 features mapped

| Need | Where it lives | How |
|---|---|---|
| 1. Customer database | Odoo (`res.partner`) | Web signups → server action upserts a partner with email match |
| 2. Purchased parts in stock | Odoo (Purchase + Inventory) | Receive a Purchase Order → Odoo posts stock moves |
| 3. Real warehouse stock | Odoo (`stock.quant`) | Single source of truth; Supabase mirrors `qty_available` |
| 4. Selling parts | Odoo (`sale.order`) | Web checkout → push order; in-shop sales done in Odoo POS / Sales |
| 5. Price quotes | Odoo (`sale.order` with state=draft) | Admin can create quotes via Odoo or via our admin UI |
| 6. Customer invoices | Odoo (`account.move`) | One-click "Create invoice" from a confirmed sale order |
| 7. Barcode scanning | Odoo Barcode app on phone/tablet | Standard Odoo workflow — works with USB/BT scanners |
| 8. Accounting feed | Odoo Accounting | Sales → invoices → journal entries; one place for accountant |

## 7. Suggested daily workflow

1. New shipment arrives → magaziner scans codes with phone in Odoo Barcode
   → stock incremented → webhook → Supabase mirrors new stock → website
   shows "in stock"
2. Customer orders online → Next.js creates an order in Supabase → server
   action also creates a `sale.order` in Odoo (linked via `odoo_id`)
3. Magaziner picks the order in Odoo Barcode → scans items → confirms
   delivery → Odoo decrements stock → webhook updates Supabase
4. Click "Create Invoice" in Odoo → sends PDF to customer → registers
   journal entry → end of month, accountant exports the journal

## 8. What's already in this repo

- `lib/odoo/client.ts` — JSON-RPC wrapper
- `lib/odoo/{products,partners,orders,invoices,stock,quotations}.ts` — domain wrappers
- `lib/odoo/sync.ts` — pull-products / push-order helpers
- `app/api/odoo/webhook/route.ts` — webhook receiver
- `app/[locale]/(admin)/admin/odoo/page.tsx` — admin UI to trigger sync + see status
- `sql/supabase-odoo-migration.sql` — DB migration

The integration is **off by default**: if `ODOO_URL` is empty, the checkout
keeps working without pushing to Odoo, the admin page shows a "not configured"
state, and the webhook returns 503. Flip the switch by filling in env vars.
