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
  const t = await getTranslations({ locale, namespace: "legal_warranty" });
  return { title: t("title"), description: t("intro") };
}

export default async function WarrantyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [tNav, t] = await Promise.all([
    getTranslations("nav"),
    getTranslations("legal_warranty"),
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
        Inter Bus oferă garanție pentru toate piesele comercializate prin magazin și acceptă
        returul produselor în condițiile de mai jos. Scopul nostru este ca fiecare comandă să
        ajungă conformă, iar în cazul oricărei probleme tehnice să primești o soluție rapidă —
        înlocuire, reparație sau rambursare.
      </p>

      <h2>1. Termenul de garanție</h2>
      <ul>
        <li>
          <strong>12 luni</strong> — termen standard pentru majoritatea pieselor de schimb,
          dacă producătorul nu specifică altă durată.
        </li>
        <li>
          <strong>24 luni</strong> — pentru anumite categorii (amortizoare, alternatoare,
          ambreiaje complete) când specificațiile producătorului permit.
        </li>
        <li>
          <strong>Conform fișei tehnice</strong> — pentru piese cu garanție extinsă oferită
          direct de fabricant; durata exactă este menționată pe pagina produsului.
        </li>
      </ul>
      <p>
        Termenul curge de la data livrării, dovedită prin factura fiscală. Pentru a beneficia
        de garanție, păstrează factura și ambalajul original cât timp folosești piesa.
      </p>

      <h2>2. Ce acoperă garanția</h2>
      <ul>
        <li>Defecte de material și execuție atribuibile producătorului.</li>
        <li>Funcționare necorespunzătoare apărută în condiții normale de utilizare.</li>
        <li>Neconformitatea cu specificațiile tehnice declarate la momentul vânzării.</li>
      </ul>

      <h2>3. Ce nu acoperă garanția</h2>
      <ul>
        <li>
          Uzura normală apărută prin folosință (de exemplu, plăcuțele de frână își epuizează
          ferodoul, filtrele se colmatează etc.).
        </li>
        <li>
          Defecțiuni cauzate de montaj incorect sau efectuat de personal neautorizat. Pentru
          piese tehnice, recomandăm montajul într-un service specializat.
        </li>
        <li>
          Daune apărute din folosirea piesei în condiții improprii (suprasarcină, lichide
          neconforme, lipsa întreținerii periodice a vehiculului).
        </li>
        <li>Modificări sau reparații neautorizate aduse piesei.</li>
        <li>Daune mecanice externe (lovituri, accidente, fenomene naturale).</li>
        <li>
          Folosirea piesei pe alt vehicul decât cel pentru care este omologată sau aplicabilă.
        </li>
      </ul>

      <h2>4. Cum activezi garanția</h2>
      <ol>
        <li>
          Contactează echipa Inter Bus prin formularul de contact sau telefonic, cu numărul
          comenzii și o descriere a problemei.
        </li>
        <li>
          Te ghidăm spre soluție: în multe cazuri identificăm rapid dacă e vorba de un defect
          de fabricație sau de o cauză externă.
        </li>
        <li>
          Dacă piesa trebuie inspectată, o expediezi la adresa pe care ți-o comunicăm,
          împreună cu factura și, dacă este posibil, fotografii cu defectul.
        </li>
        <li>
          În maxim <strong>15 zile lucrătoare</strong> de la primirea piesei, comunicăm
          rezultatul evaluării și soluția aplicată: înlocuire, reparație sau rambursare.
        </li>
      </ol>

      <h2>5. Dreptul de retur (14 zile)</h2>
      <p>
        Pentru clienții persoane fizice, conform Legii nr. 105/2003 privind protecția
        consumatorilor, ai dreptul de a returna produsul în <strong>14 zile calendaristice</strong> de
        la primire, fără a fi nevoie să justifici decizia.
      </p>
      <p>Condițiile pentru retur:</p>
      <ul>
        <li>Piesa nu a fost montată și se află în starea originală.</li>
        <li>Ambalajul original este intact, etichetele neîndepărtate.</li>
        <li>Toate accesoriile, manualele și certificatele sunt incluse.</li>
        <li>Returul e însoțit de factura fiscală sau bonul de casă.</li>
      </ul>
      <p>
        Costul de transport pentru retur este suportat de cumpărător, cu excepția cazurilor în
        care produsul este defect, eronat livrat sau incorect descris.
      </p>

      <h2>6. Excepții de la dreptul de retur</h2>
      <p>
        Anumite produse, prin natura lor, nu pot fi returnate dacă au fost desigilate sau
        montate: piese electronice individualizate, lichide tehnice, piese realizate la comandă
        după specificații furnizate de client, precum și piese care, după ambalare, nu mai pot
        fi revândute din motive sanitare sau de siguranță.
      </p>

      <h2>7. Modalități de rambursare</h2>
      <p>
        Rambursarea se efectuează în maxim <strong>14 zile</strong> de la confirmarea returului
        sau de la finalizarea procedurii de garanție, prin aceeași metodă folosită la plată
        (transfer bancar pe contul de pe care s-a încasat suma sau ramburs către cardul folosit).
        Pentru clienții juridici, rambursarea se efectuează exclusiv prin transfer bancar pe
        baza facturii de stornare.
      </p>

      <h2>8. Asistență tehnică</h2>
      <p>
        Echipa Inter Bus rămâne la dispoziție pentru orice întrebare legată de identificarea
        pieselor, compatibilitate sau garanție. Răspundem în zilele lucrătoare în maxim 24 de
        ore. Pentru flotele profesioniste oferim asistență tehnică prioritară.
      </p>
    </LegalPage>
  );
}
