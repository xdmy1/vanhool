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
  const t = await getTranslations({ locale, namespace: "legal_terms" });
  return { title: t("title"), description: t("intro") };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [tNav, t] = await Promise.all([
    getTranslations("nav"),
    getTranslations("legal_terms"),
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
        Documentul de față stabilește regulile de utilizare a magazinului online Inter Bus,
        accesibil la adresa acestui site. Prin plasarea unei comenzi sau prin simpla folosire a
        site-ului, confirmi că ai citit și ai acceptat acești termeni. Te rugăm să-i parcurgi
        înainte de a finaliza orice tranzacție.
      </p>

      <h2>1. Definiții</h2>
      <ul>
        <li>
          <strong>Magazin / Inter Bus</strong> — platforma online prin care sunt comercializate
          piese auto pentru autobuze și vehicule comerciale.
        </li>
        <li>
          <strong>Utilizator</strong> — orice persoană fizică sau juridică ce accesează
          site-ul, indiferent dacă are cont sau plasează o comandă.
        </li>
        <li>
          <strong>Client</strong> — utilizatorul care plasează o comandă valabilă.
        </li>
        <li>
          <strong>Comandă</strong> — solicitarea fermă a clientului de a cumpăra unul sau mai
          multe produse listate pe site, la prețul afișat la momentul plasării.
        </li>
        <li>
          <strong>Contract</strong> — acordul dintre Inter Bus și client, încheiat la
          confirmarea comenzii de către magazin.
        </li>
      </ul>

      <h2>2. Cont de utilizator</h2>
      <p>
        Crearea unui cont nu este obligatorie pentru a plasa o comandă, însă oferă acces la
        istoric, urmărirea livrărilor și salvarea adreselor. Ești responsabil pentru păstrarea
        confidențialității parolei și pentru toate activitățile efectuate sub contul tău.
        Inter Bus nu răspunde pentru daunele rezultate din folosirea neautorizată a contului
        din cauza neglijenței utilizatorului.
      </p>

      <h2>3. Procesul de comandă</h2>
      <ol>
        <li>Adaugi produsele dorite în coș.</li>
        <li>Completezi datele de livrare și factură.</li>
        <li>Alegi metoda de plată (transfer bancar, plată la livrare sau online).</li>
        <li>Confirmi comanda; primești pe email un sumar al solicitării.</li>
        <li>
          Echipa Inter Bus verifică disponibilitatea în stoc și confirmă comanda printr-un al
          doilea email. Acesta marchează încheierea contractului.
        </li>
      </ol>
      <p>
        Ne rezervăm dreptul de a refuza sau anula o comandă dacă produsul nu mai este în stoc,
        dacă prețul afișat conține o eroare evidentă (greșeală de tipar) sau dacă există
        suspiciuni de fraudă. În aceste cazuri, banii încasați se rambursează integral, fără
        costuri suplimentare.
      </p>

      <h2>4. Prețuri și disponibilitate</h2>
      <p>
        Prețurile sunt afișate în EUR și includ TVA, cu excepția cazurilor unde este menționat
        altfel. Prețurile pot fi modificate fără notificare prealabilă, dar valoarea aplicabilă
        unei comenzi este cea afișată la momentul plasării ei. Dacă apare o eroare evidentă
        (de exemplu, un preț nerealist de mic), Inter Bus poate corecta valoarea și te
        contactează înainte de procesare.
      </p>

      <h2>5. Plata</h2>
      <p>
        Acceptăm plata prin transfer bancar (în baza facturii proforma), card bancar (procesat
        prin operatori autorizați) sau ramburs la livrare, în limitele indicate pe pagina de
        checkout. Pentru clienții juridici emitem factură fiscală cu TVA. Datele cardurilor nu
        trec niciodată prin serverele noastre.
      </p>

      <h2>6. Anularea comenzii</h2>
      <p>
        Poți anula o comandă fără cost dacă aceasta nu a fost încă pregătită pentru expediere.
        Trimite-ne un mesaj cât mai repede posibil prin formularul de contact. După expediere,
        anularea se transformă în retur (vezi pagina dedicată).
      </p>

      <h2>7. Conformitatea pieselor</h2>
      <p>
        Toate piesele comercializate prin Inter Bus sunt fie originale (OEM), fie echivalente
        verificate, conforme cu specificațiile producătorilor de autobuze. Pentru fiecare piesă
        afișăm codul producătorului și, când este cazul, codurile cross-reference. Identificarea
        piesei corecte rămâne responsabilitatea cumpărătorului; echipa noastră oferă suport
        gratuit pe email sau telefon dacă ai dubii.
      </p>

      <h2>8. Răspundere</h2>
      <p>
        Inter Bus garantează calitatea produselor în baza politicii de garanție și retur
        publicate pe site. Răspunderea noastră este limitată la valoarea piesei livrate și nu
        se extinde la daune indirecte (pierderi operaționale, întârzieri, costuri de montaj
        efectuate de terți etc.). Această limitare nu se aplică în cazurile prevăzute imperativ
        de lege.
      </p>

      <h2>9. Drepturi de proprietate intelectuală</h2>
      <p>
        Tot conținutul site-ului — texte, imagini, structură, baze de date, software — aparține
        Inter Bus sau partenerilor săi și este protejat de legea drepturilor de autor.
        Reproducerea, copierea sau distribuirea fără acord scris este interzisă.
      </p>

      <h2>10. Litigii și legea aplicabilă</h2>
      <p>
        Acești termeni sunt guvernați de legislația Republicii Moldova. Orice dispută se va
        încerca a fi soluționată pe cale amiabilă; în caz de eșec, competența revine instanțelor
        de la sediul Inter Bus. Pentru consumatori se aplică, suplimentar, normele Legii nr.
        105/2003 privind protecția consumatorilor.
      </p>

      <h2>11. Modificări ale termenilor</h2>
      <p>
        Putem actualiza acești termeni periodic. Versiunea curentă este afișată pe această
        pagină, cu data ultimei modificări în antet. Comenzile deja plasate rămân guvernate de
        termenii valabili la momentul plasării lor.
      </p>
    </LegalPage>
  );
}
