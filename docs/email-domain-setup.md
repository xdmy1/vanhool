# Email-uri de la domeniul propriu (inter-bus.md)

Default-ul Supabase trimite email-urile de autentificare (confirmare cont,
resetare parolă, magic link) de la `noreply@mail.app.supabase.io` — cu
limite mici de rată (3-4/oră) și branding Supabase. Pentru producție vrei
ca email-urile să vină de la `noreply@inter-bus.md`.

Schimbarea se face **din UI-ul Supabase**, nu din cod. Nu există migrație
sau redeploy — modificarea e activă imediat după ce salvezi setările.

---

## 1. Alege un provider SMTP

Recomandare: **Resend** (cel mai simplu setup pentru Next.js + Supabase).

| Provider | Free tier | Plătit | Note |
|---|---|---|---|
| **Resend** | 3.000 email/lună | $20/lună la 50k | API curat, dashboard prietenos. **Recomandat.** |
| Postmark | 100/lună | $15/lună la 10k | Cel mai bun delivery rate, util pentru tranzacționale. |
| Brevo (Sendinblue) | 300/zi gratuit pentru totdeauna | de la €25/lună | Bun dacă vrei și newsletter. |
| AWS SES | 3.000 prin EC2 / 62.000 prin Lambda | $0.10 per 1.000 | Cel mai ieftin la scală mare; setup mai birocratic. |

Pentru Inter Bus (zeci-sute de email-uri/lună), tier-ul gratuit Resend e
mai mult decât suficient.

---

## 2. Verifică domeniul la provider

Exemplu Resend (analog la oricare):

1. Cont nou la [resend.com](https://resend.com) → **Domains** → **Add domain**
2. Introdu `inter-bus.md`
3. Resend îți afișează 3-4 înregistrări DNS de adăugat la registrar-ul
   tău (înregistrar = compania de la care ai cumpărat domeniul):
   - **MX** (opțional, doar dacă vrei să primești și replies)
   - **SPF** (TXT) — autorizează Resend să trimită pentru tine
   - **DKIM** (TXT × 2-3) — semnătură criptografică
   - **DMARC** (TXT) — politică de validare
4. Adaugă-le la registrar (panoul DNS). Propagarea durează 5-30 minute.
5. Resend marchează domeniul **Verified** când totul e valid.
6. Generează **API key** (Settings → API Keys → Create). Copiază imediat
   — nu se mai afișează după.

---

## 3. Configurează SMTP în Supabase

1. Supabase Dashboard → proiectul tău → **Project Settings** → **Auth**
2. Scroll la secțiunea **SMTP Settings** → **Enable Custom SMTP**
3. Completează:

   | Câmp | Valoare |
   |---|---|
   | **Host** | `smtp.resend.com` |
   | **Port** | `465` (SSL/TLS) |
   | **Username** | `resend` (literal, exact așa) |
   | **Password** | API key-ul de la pasul 2.6 |
   | **Sender email** | `noreply@inter-bus.md` |
   | **Sender name** | `Inter Bus` |
   | **Minimum interval between emails** | `60` (secunde) — anti-abuz |

4. **Save**.

> **Notă**: dacă alegi alt provider, doar Host + credentials se schimbă.
> Restul rămâne identic.

| Provider | Host | Port | Username |
|---|---|---|---|
| Resend | `smtp.resend.com` | 465 | `resend` |
| Postmark | `smtp.postmarkapp.com` | 587 | API token-ul |
| Brevo | `smtp-relay.brevo.com` | 587 | login Brevo |
| AWS SES | `email-smtp.{region}.amazonaws.com` | 465 sau 587 | SMTP IAM credentials |

---

## 4. Personalizează template-urile

Supabase Dashboard → **Authentication** → **Email Templates**.

Cele 5 template-uri:

1. **Confirm signup** — la înregistrare cont nou
2. **Invite user** — invitație manuală din admin
3. **Magic link** — login fără parolă (dacă activezi)
4. **Change email address** — schimbare email
5. **Reset password** — resetare parolă

Exemplu template **Confirm signup** (HTML cu placeholder-e Supabase):

```html
<h2>Bun venit la Inter Bus</h2>
<p>Confirmă adresa de email apăsând pe butonul de mai jos:</p>
<p>
  <a href="{{ .ConfirmationURL }}"
     style="background:#1d4ed8;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;">
    Confirmă email
  </a>
</p>
<p style="color:#666;font-size:12px;">
  Dacă n-ai creat un cont la Inter Bus, ignoră acest email.
</p>
```

**Variabile disponibile**: `{{ .ConfirmationURL }}`, `{{ .Token }}`,
`{{ .TokenHash }}`, `{{ .Email }}`, `{{ .RedirectTo }}`, `{{ .SiteURL }}`.

> Atenție: dacă editezi template-uri, Supabase nu le validează —
> testează cu un cont real de email (nu Mailtrap) ca să fii sigur că
> link-urile merg.

---

## 5. Testare

1. Creează un cont test pe `/ro/register` cu un email pe care îl
   accesezi (Gmail, ProtonMail, etc.).
2. Verifică inbox-ul: email-ul vine de la `noreply@inter-bus.md` cu
   sender name `Inter Bus`.
3. Click pe link-ul de confirmare → cont activat.
4. Verifică în Supabase Dashboard → **Logs** → **Auth Logs** că nu
   există erori SMTP.

---

## 6. Probleme frecvente

- **Email-urile ajung în Spam**: înseamnă că SPF/DKIM/DMARC nu sunt
  complete. Recheck în panoul DNS. Resend îți arată exact ce lipsește.
- **"SMTP connection failed"**: verifică port-ul (465 vs 587), TLS, și
  că API key-ul e valid în Resend.
- **"Rate limit exceeded"**: ai depășit cota providerului — upgradează
  planul sau crește `Minimum interval between emails`.
- **Link-ul de confirmare expiră instant**: în Supabase Auth Settings,
  setează **Email confirmation expiry** la 1-3 zile (default 24h e ok).

---

## Costuri totale

- **Resend free tier**: 0 EUR/lună până la 3.000 email/lună
- **Domeniu** (deja deținut): 0 EUR (cost anual de înregistrare separat)
- **Supabase**: 0 EUR (custom SMTP e inclus în orice plan, chiar și Free)

Total estimat pentru shop tipic: **0 EUR/lună** până la 3.000 email-uri.
