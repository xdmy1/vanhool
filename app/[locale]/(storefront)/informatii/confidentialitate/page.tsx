import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalPage } from "@/components/legal/LegalPage";
import { routing } from "@/lib/i18n/routing";

export const dynamic = "force-static";

export async function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal_privacy" });
  return { title: t("title"), description: t("intro") };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [tNav, t] = await Promise.all([
    getTranslations("nav"),
    getTranslations("legal_privacy"),
  ]);

  return (
    <LegalPage
      locale={locale}
      eyebrow={t("eyebrow")}
      title={t("title")}
      intro={t("intro")}
      updatedAt={t("updated_at")}
      homeLabel={tNav("home")}
      infoLabel={t("info_label")}
    >
      <p>
        Inter Bus tratează cu seriozitate protecția datelor personale ale clienților săi și
        respectă cadrul Regulamentului General privind Protecția Datelor (GDPR), Legea nr.
        133/2011 privind protecția datelor cu caracter personal din Republica Moldova și
        legislația conexă. Acest document explică pe înțeles ce date colectăm, de ce le
        colectăm, cu cine le partajăm și ce drepturi ai în calitate de utilizator.
      </p>

      <h2>1. Cine este operatorul</h2>
      <p>
        Operatorul datelor cu caracter personal este Inter Bus, denumit în continuare
        &quot;Inter Bus&quot;, &quot;noi&quot; sau &quot;magazinul&quot;. Pentru orice solicitare
        privind datele personale, ne poți contacta prin formularul de contact de pe site sau la
        adresa de email a echipei.
      </p>

      <h2>2. Ce date colectăm</h2>
      <ul>
        <li>
          <strong>Date de identificare</strong>: nume, prenume, adresa de email, număr de
          telefon, denumirea companiei și codul fiscal (pentru clienții juridici).
        </li>
        <li>
          <strong>Date de livrare</strong>: adresa la care urmează să livrăm comanda, oraș,
          țară, eventuale instrucțiuni suplimentare.
        </li>
        <li>
          <strong>Date despre comenzi</strong>: produsele cumpărate, valorile, metoda de plată
          aleasă, istoricul tranzacțiilor.
        </li>
        <li>
          <strong>Date tehnice</strong>: adresa IP, tipul dispozitivului, sistemul de operare,
          paginile vizitate, durata sesiunii — colectate strict pentru securitate, statistici
          agregate și îmbunătățirea site-ului.
        </li>
        <li>
          <strong>Cont de utilizator</strong>: dacă îți creezi un cont, păstrăm parola într-o
          formă criptată (hash); nu o vedem niciodată în clar.
        </li>
      </ul>

      <h2>3. De ce colectăm aceste date</h2>
      <ul>
        <li>Pentru a procesa comenzile și a livra piesele cumpărate.</li>
        <li>Pentru a emite facturile și documentele contabile cerute de lege.</li>
        <li>Pentru a-ți răspunde la întrebări tehnice, garanție și retur.</li>
        <li>
          Pentru a îmbunătăți site-ul și catalogul (analitică agregată, fără identificarea
          persoanei).
        </li>
        <li>
          Pentru a-ți trimite informări comerciale, doar dacă ți-ai exprimat consimțământul
          explicit (newsletter, oferte). Te poți dezabona oricând.
        </li>
      </ul>

      <h2>4. Temeiul legal</h2>
      <p>
        Prelucrăm datele tale fie pentru executarea contractului de vânzare-cumpărare (art. 6
        alin. (1) lit. b GDPR), fie pe baza consimțământului tău liber exprimat (art. 6 alin.
        (1) lit. a), fie pentru îndeplinirea unor obligații legale ale Inter Bus în domeniul
        contabilității și fiscalității (art. 6 alin. (1) lit. c).
      </p>

      <h2>5. Cu cine partajăm datele</h2>
      <ul>
        <li>
          <strong>Curieri și operatori de transport</strong> — pentru livrarea comenzilor (nume,
          telefon, adresă).
        </li>
        <li>
          <strong>Procesatori de plăți</strong> — atunci când alegi plata online, datele
          financiare merg direct către procesator (nu trec prin serverele noastre).
        </li>
        <li>
          <strong>Furnizori IT</strong> — găzduire web, servicii de email, instrumente de
          analiză — toți obligați contractual să respecte aceleași standarde GDPR.
        </li>
        <li>
          <strong>Autorități publice</strong> — strict în baza unei cereri legale fundamentate.
        </li>
      </ul>
      <p>
        Nu vindem datele tale unor terți și nu le folosim în afara scopurilor enumerate aici.
      </p>

      <h2>6. Cât timp păstrăm datele</h2>
      <p>
        Datele despre comenzi și facturi sunt păstrate timp de 10 ani, conform legislației
        contabile. Datele de cont rămân active cât timp îți păstrezi contul; le poți șterge
        oricând la cerere. Datele tehnice (log-uri) sunt rotite la 12 luni.
      </p>

      <h2>7. Drepturile tale</h2>
      <ul>
        <li>
          <strong>Drept de acces</strong> — să afli ce date deținem despre tine.
        </li>
        <li>
          <strong>Drept de rectificare</strong> — să corectezi datele incorecte sau incomplete.
        </li>
        <li>
          <strong>Drept de ștergere</strong> — să ne ceri ștergerea datelor (cu excepția celor
          pe care suntem obligați legal să le păstrăm).
        </li>
        <li>
          <strong>Drept de restricționare</strong> — să limitezi temporar prelucrarea.
        </li>
        <li>
          <strong>Drept de portabilitate</strong> — să primești datele într-un format
          structurat, lizibil automat.
        </li>
        <li>
          <strong>Drept de opoziție</strong> — în special față de marketing direct.
        </li>
        <li>
          <strong>Drept de a depune plângere</strong> — la Centrul Național pentru Protecția
          Datelor cu Caracter Personal (Republica Moldova) sau la autoritatea echivalentă din
          țara ta.
        </li>
      </ul>

      <h2>8. Cookies</h2>
      <p>
        Folosim cookies strict necesare (sesiunea de coș, autentificare) și cookies de
        analitică agregată. Nu folosim cookies de tracking pentru publicitate țintită fără
        consimțământul tău. Poți șterge sau bloca cookies-urile din setările browserului, dar
        unele funcționalități (coș, login) ar putea înceta să funcționeze.
      </p>

      <h2>9. Securitatea datelor</h2>
      <p>
        Folosim conexiuni HTTPS pe tot site-ul, criptăm parolele, ne actualizăm constant
        infrastructura și restricționăm accesul intern doar la persoanele care au nevoie de el.
        Cu toate acestea, nicio metodă de transmitere prin internet nu este 100% sigură; ne
        angajăm să te informăm fără întârziere în cazul oricărui incident care îți afectează
        datele.
      </p>

      <h2>10. Modificări ale acestei politici</h2>
      <p>
        Putem actualiza această politică pentru a reflecta schimbări legislative sau ale
        modului nostru de operare. Versiunea curentă este întotdeauna afișată pe această
        pagină, cu data ultimei modificări în antet.
      </p>
    </LegalPage>
  );
}
