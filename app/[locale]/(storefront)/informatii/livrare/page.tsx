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
  const t = await getTranslations({ locale, namespace: "legal_delivery" });
  return { title: t("title"), description: t("intro") };
}

export default async function DeliveryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [tNav, t] = await Promise.all([
    getTranslations("nav"),
    getTranslations("legal_delivery"),
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
        Inter Bus livrează piese în toată Republica Moldova și, la cerere, în țările limitrofe.
        Lucrăm cu parteneri de transport verificați și ambalăm fiecare piesă astfel încât să
        ajungă la tine în condiții impecabile, indiferent de distanță sau gabarit.
      </p>

      <h2>1. Zone de livrare</h2>
      <ul>
        <li>
          <strong>Chișinău</strong> — livrare în aceeași zi sau în ziua următoare lucrătoare,
          în funcție de ora plasării comenzii.
        </li>
        <li>
          <strong>Restul Republicii Moldova</strong> — 2–5 zile lucrătoare prin curier
          național.
        </li>
        <li>
          <strong>România și UE</strong> — 5–10 zile lucrătoare prin parteneri internaționali.
          Costul și termenul exact se confirmă pe email înainte de expediere.
        </li>
        <li>
          <strong>Altă destinație</strong> — pentru flotele care operează în alte țări, oferim
          ofertă personalizată la cerere.
        </li>
      </ul>

      <h2>2. Termenul de livrare</h2>
      <p>
        Termenul indicat începe să curgă din momentul confirmării comenzii și al verificării
        stocului. Pentru piesele aflate în stoc propriu, expediem în aceeași zi pentru
        comenzile primite până la ora 14:00 (zile lucrătoare). Pentru piesele aduse la comandă
        de la furnizorii noștri, te informăm anticipat asupra termenului estimat și al
        eventualelor costuri suplimentare.
      </p>

      <h2>3. Costul livrării</h2>
      <ul>
        <li>
          <strong>Livrare gratuită</strong> pentru comenzile cu valoare egală sau mai mare de
          200 EUR pe teritoriul Republicii Moldova.
        </li>
        <li>
          <strong>Tarif fix</strong> de 25 EUR pentru comenzile sub acest prag, indiferent de
          locație în Republica Moldova.
        </li>
        <li>
          <strong>Livrarea internațională</strong> se calculează individual, în funcție de
          greutate, dimensiuni și destinație. Costul este afișat înainte de confirmarea
          comenzii.
        </li>
        <li>
          Pentru piesele de gabarit mare (radiatoare, oglinzi laterale, panouri de caroserie)
          poate exista un tarif suplimentar, comunicat înainte de expediere.
        </li>
      </ul>

      <h2>4. Modalități de livrare</h2>
      <ul>
        <li>
          <strong>Curierat la domiciliu</strong> — opțiunea standard. Curierul livrează la
          adresa indicată în comandă, în intervalul orar agreat la confirmare.
        </li>
        <li>
          <strong>Ridicare de la sediu</strong> — în Chișinău, poți ridica personal piesele de
          la depozitul Inter Bus, după ce primești confirmarea că sunt pregătite. Ne ajută să
          economisim timp pe comenzile urgente.
        </li>
        <li>
          <strong>Livrare directă la service</strong> — pentru flotele profesioniste, putem
          livra direct la atelierul partener, fără opriri intermediare.
        </li>
      </ul>

      <h2>5. Confirmare și urmărire</h2>
      <p>
        După plasarea comenzii primești pe email un sumar al solicitării. La expediere primești
        un al doilea email cu numărul de tracking de la curier și un link prin care urmărești
        pachetul în timp real. Pentru întrebări legate de o livrare în curs, ne poți scrie
        oricând prin formularul de contact, indicând numărul comenzii.
      </p>

      <h2>6. La primirea coletului</h2>
      <ol>
        <li>
          Verifică integritatea ambalajului în prezența curierului. Dacă observi deteriorări
          vizibile (cutie zdrobită, sigiliu rupt), refuză primirea sau menționează expres acest
          lucru pe documentul de livrare.
        </li>
        <li>
          Deschide coletul cât mai repede posibil și verifică conținutul față de factură.
        </li>
        <li>
          Pentru orice neconformitate (piesă lipsă, deteriorată, codul nu corespunde),
          contactează-ne în maxim 48 de ore de la primire.
        </li>
      </ol>

      <h2>7. Imposibilitatea livrării</h2>
      <p>
        Dacă pachetul nu poate fi predat din motive imputabile destinatarului (adresă incorectă,
        număr de telefon greșit, refuz de primire fără motiv obiectiv), costul de retur și al
        reexpedierii se suportă de către cumpărător. Pentru a evita astfel de situații,
        verifică datele de contact înainte de a confirma comanda.
      </p>

      <h2>8. Ambalare</h2>
      <p>
        Toate piesele sunt ambalate în condiții care protejează atât componentele sensibile
        (electronice, lentile, suprafețe vopsite), cât și piesele cu masă mare. Folosim cutii
        întărite, materiale absorbante de șocuri și plastic protector la nevoie. Pentru piesele
        cu marcaj fragil, marcăm extern cutiile pentru a le manipula corespunzător.
      </p>

      <h2>9. Întârzieri și forță majoră</h2>
      <p>
        Inter Bus depune toate eforturile rezonabile pentru a respecta termenele indicate. În
        cazul evenimentelor imprevizibile (condiții meteo extreme, restricții vamale,
        întreruperi ale serviciilor curierului), te informăm de îndată și agreăm împreună
        soluția: așteptare, anulare cu rambursare integrală sau înlocuire cu un produs
        echivalent.
      </p>
    </LegalPage>
  );
}
