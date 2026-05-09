import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalPage, type LegalSection } from "@/components/legal/LegalPage";
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

const CONTENT: Record<string, { intro: string; sections: LegalSection[] }> = {
  ro: {
    intro:
      "Documentul de față stabilește regulile de utilizare a magazinului online Inter Bus, accesibil la adresa acestui site. Prin plasarea unei comenzi sau prin simpla folosire a site-ului, confirmi că ai citit și ai acceptat acești termeni. Te rugăm să-i parcurgi înainte de a finaliza orice tranzacție.",
    sections: [
      {
        heading: "1. Definiții",
        blocks: [
          {
            type: "ul",
            items: [
              "**Magazin / Inter Bus** — platforma online prin care sunt comercializate piese auto pentru autobuze și vehicule comerciale.",
              "**Utilizator** — orice persoană fizică sau juridică ce accesează site-ul, indiferent dacă are cont sau plasează o comandă.",
              "**Client** — utilizatorul care plasează o comandă valabilă.",
              "**Comandă** — solicitarea fermă a clientului de a cumpăra unul sau mai multe produse listate pe site, la prețul afișat la momentul plasării.",
              "**Contract** — acordul dintre Inter Bus și client, încheiat la confirmarea comenzii de către magazin.",
            ],
          },
        ],
      },
      {
        heading: "2. Cont de utilizator",
        blocks: [
          { type: "p", text: "Crearea unui cont nu este obligatorie pentru a plasa o comandă, însă oferă acces la istoric, urmărirea livrărilor și salvarea adreselor. Ești responsabil pentru păstrarea confidențialității parolei și pentru toate activitățile efectuate sub contul tău. Inter Bus nu răspunde pentru daunele rezultate din folosirea neautorizată a contului din cauza neglijenței utilizatorului." },
        ],
      },
      {
        heading: "3. Procesul de comandă",
        blocks: [
          {
            type: "ol",
            items: [
              "Adaugi produsele dorite în coș.",
              "Completezi datele de livrare și factură.",
              "Alegi metoda de plată (transfer bancar, plată la livrare sau online).",
              "Confirmi comanda; primești pe email un sumar al solicitării.",
              "Echipa Inter Bus verifică disponibilitatea în stoc și confirmă comanda printr-un al doilea email. Acesta marchează încheierea contractului.",
            ],
          },
          { type: "p", text: "Ne rezervăm dreptul de a refuza sau anula o comandă dacă produsul nu mai este în stoc, dacă prețul afișat conține o eroare evidentă (greșeală de tipar) sau dacă există suspiciuni de fraudă. În aceste cazuri, banii încasați se rambursează integral, fără costuri suplimentare." },
        ],
      },
      {
        heading: "4. Prețuri și disponibilitate",
        blocks: [
          { type: "p", text: "Prețurile sunt afișate în lei (MDL) și includ TVA, cu excepția cazurilor unde este menționat altfel. Prețurile pot fi modificate fără notificare prealabilă, dar valoarea aplicabilă unei comenzi este cea afișată la momentul plasării ei. Dacă apare o eroare evidentă (de exemplu, un preț nerealist de mic), Inter Bus poate corecta valoarea și te contactează înainte de procesare." },
        ],
      },
      {
        heading: "5. Plata",
        blocks: [
          { type: "p", text: "Acceptăm plata prin transfer bancar (în baza facturii proforma), card bancar (procesat prin operatori autorizați) sau ramburs la livrare, în limitele indicate pe pagina de checkout. Pentru clienții juridici emitem factură fiscală cu TVA. Datele cardurilor nu trec niciodată prin serverele noastre." },
        ],
      },
      {
        heading: "6. Anularea comenzii",
        blocks: [
          { type: "p", text: "Poți anula o comandă fără cost dacă aceasta nu a fost încă pregătită pentru expediere. Trimite-ne un mesaj cât mai repede posibil prin formularul de contact. După expediere, anularea se transformă în retur (vezi pagina dedicată)." },
        ],
      },
      {
        heading: "7. Conformitatea pieselor",
        blocks: [
          { type: "p", text: "Toate piesele comercializate prin Inter Bus sunt fie originale (OEM), fie echivalente verificate, conforme cu specificațiile producătorilor de autobuze. Pentru fiecare piesă afișăm codul producătorului și, când este cazul, codurile cross-reference. Identificarea piesei corecte rămâne responsabilitatea cumpărătorului; echipa noastră oferă suport gratuit pe email sau telefon dacă ai dubii." },
        ],
      },
      {
        heading: "8. Răspundere",
        blocks: [
          { type: "p", text: "Inter Bus garantează calitatea produselor în baza politicii de garanție și retur publicate pe site. Răspunderea noastră este limitată la valoarea piesei livrate și nu se extinde la daune indirecte (pierderi operaționale, întârzieri, costuri de montaj efectuate de terți etc.). Această limitare nu se aplică în cazurile prevăzute imperativ de lege." },
        ],
      },
      {
        heading: "9. Drepturi de proprietate intelectuală",
        blocks: [
          { type: "p", text: "Tot conținutul site-ului — texte, imagini, structură, baze de date, software — aparține Inter Bus sau partenerilor săi și este protejat de legea drepturilor de autor. Reproducerea, copierea sau distribuirea fără acord scris este interzisă." },
        ],
      },
      {
        heading: "10. Litigii și legea aplicabilă",
        blocks: [
          { type: "p", text: "Acești termeni sunt guvernați de legislația Republicii Moldova. Orice dispută se va încerca a fi soluționată pe cale amiabilă; în caz de eșec, competența revine instanțelor de la sediul Inter Bus. Pentru consumatori se aplică, suplimentar, normele Legii nr. 105/2003 privind protecția consumatorilor." },
        ],
      },
      {
        heading: "11. Modificări ale termenilor",
        blocks: [
          { type: "p", text: "Putem actualiza acești termeni periodic. Versiunea curentă este afișată pe această pagină, cu data ultimei modificări în antet. Comenzile deja plasate rămân guvernate de termenii valabili la momentul plasării lor." },
        ],
      },
    ],
  },
  en: {
    intro:
      "This document sets out the rules for using the Inter Bus online store, available at this site's address. By placing an order or simply using the site, you confirm that you have read and accepted these terms. Please review them before completing any transaction.",
    sections: [
      {
        heading: "1. Definitions",
        blocks: [
          {
            type: "ul",
            items: [
              "**Store / Inter Bus** — the online platform through which auto parts for buses and commercial vehicles are sold.",
              "**User** — any natural or legal person who accesses the site, whether or not they have an account or place an order.",
              "**Customer** — the user who places a valid order.",
              "**Order** — the customer's firm request to purchase one or more products listed on the site, at the price shown at the time of placement.",
              "**Contract** — the agreement between Inter Bus and the customer, concluded once the store confirms the order.",
            ],
          },
        ],
      },
      {
        heading: "2. User account",
        blocks: [
          { type: "p", text: "Creating an account is not required to place an order, but it gives access to history, shipment tracking, and saved addresses. You are responsible for keeping your password confidential and for all activity carried out under your account. Inter Bus is not liable for damages resulting from unauthorized account use due to user negligence." },
        ],
      },
      {
        heading: "3. Order process",
        blocks: [
          {
            type: "ol",
            items: [
              "You add the desired products to the cart.",
              "You fill in delivery and billing details.",
              "You choose the payment method (bank transfer, cash on delivery, or online).",
              "You confirm the order; you receive a summary by email.",
              "The Inter Bus team checks stock availability and confirms the order with a second email. This marks the conclusion of the contract.",
            ],
          },
          { type: "p", text: "We reserve the right to refuse or cancel an order if the product is no longer in stock, if the displayed price contains an obvious error (typo), or if fraud is suspected. In these cases, any amount collected is fully refunded with no extra costs." },
        ],
      },
      {
        heading: "4. Prices and availability",
        blocks: [
          { type: "p", text: "Prices are displayed in lei (MDL) and include VAT, unless stated otherwise. Prices may change without prior notice, but the value applicable to an order is the one shown at the time it was placed. In the event of an obvious error (for example, an unrealistically low price), Inter Bus may correct the value and contact you before processing." },
        ],
      },
      {
        heading: "5. Payment",
        blocks: [
          { type: "p", text: "We accept payment by bank transfer (against a proforma invoice), bank card (processed by authorized operators), or cash on delivery, within the limits shown on the checkout page. For business customers we issue a VAT invoice. Card details never pass through our servers." },
        ],
      },
      {
        heading: "6. Order cancellation",
        blocks: [
          { type: "p", text: "You can cancel an order at no cost if it has not yet been prepared for shipping. Send us a message as soon as possible through the contact form. After shipment, cancellation becomes a return (see the dedicated page)." },
        ],
      },
      {
        heading: "7. Part conformity",
        blocks: [
          { type: "p", text: "All parts sold through Inter Bus are either original (OEM) or verified equivalents, compliant with bus manufacturer specifications. For each part we display the manufacturer code and, where applicable, cross-reference codes. Identifying the correct part remains the buyer's responsibility; our team offers free support by email or phone in case of doubt." },
        ],
      },
      {
        heading: "8. Liability",
        blocks: [
          { type: "p", text: "Inter Bus warrants product quality under the warranty and return policy published on the site. Our liability is limited to the value of the part delivered and does not extend to indirect damages (operational losses, delays, third-party installation costs, etc.). This limitation does not apply where mandatory law provides otherwise." },
        ],
      },
      {
        heading: "9. Intellectual property rights",
        blocks: [
          { type: "p", text: "All site content — texts, images, structure, databases, software — belongs to Inter Bus or its partners and is protected by copyright law. Reproduction, copying, or distribution without written consent is prohibited." },
        ],
      },
      {
        heading: "10. Disputes and applicable law",
        blocks: [
          { type: "p", text: "These terms are governed by the laws of the Republic of Moldova. Any dispute will first be attempted to be resolved amicably; failing that, jurisdiction lies with the courts at the Inter Bus head office. For consumers, the rules of Law no. 105/2003 on consumer protection apply additionally." },
        ],
      },
      {
        heading: "11. Changes to the terms",
        blocks: [
          { type: "p", text: "We may update these terms periodically. The current version is displayed on this page, with the date of the last modification in the header. Orders already placed remain governed by the terms in effect at the time they were placed." },
        ],
      },
    ],
  },
  ru: {
    intro:
      "Этот документ устанавливает правила использования интернет-магазина Inter Bus, доступного по адресу этого сайта. Размещая заказ или просто пользуясь сайтом, вы подтверждаете, что прочитали и приняли эти условия. Просим ознакомиться с ними до завершения любой сделки.",
    sections: [
      {
        heading: "1. Определения",
        blocks: [
          {
            type: "ul",
            items: [
              "**Магазин / Inter Bus** — онлайн-платформа продажи автозапчастей для автобусов и коммерческих транспортных средств.",
              "**Пользователь** — любое физическое или юридическое лицо, посещающее сайт, независимо от наличия аккаунта или заказа.",
              "**Клиент** — пользователь, разместивший действительный заказ.",
              "**Заказ** — твёрдый запрос клиента купить один или несколько товаров, размещённых на сайте, по цене на момент оформления.",
              "**Договор** — соглашение между Inter Bus и клиентом, заключаемое после подтверждения заказа магазином.",
            ],
          },
        ],
      },
      {
        heading: "2. Учётная запись",
        blocks: [
          { type: "p", text: "Создание учётной записи не обязательно для размещения заказа, но даёт доступ к истории, отслеживанию доставки и сохранённым адресам. Вы несёте ответственность за конфиденциальность пароля и за все действия под вашей учётной записью. Inter Bus не отвечает за ущерб от несанкционированного использования учётной записи по вашей халатности." },
        ],
      },
      {
        heading: "3. Процесс заказа",
        blocks: [
          {
            type: "ol",
            items: [
              "Вы добавляете нужные товары в корзину.",
              "Вы вводите данные для доставки и счёта.",
              "Вы выбираете способ оплаты (банковский перевод, оплата при получении или онлайн).",
              "Подтверждаете заказ; получаете на e-mail сводку запроса.",
              "Команда Inter Bus проверяет наличие на складе и подтверждает заказ вторым письмом. Это знаменует заключение договора.",
            ],
          },
          { type: "p", text: "Мы оставляем за собой право отказать или отменить заказ, если товара больше нет в наличии, если на странице цена содержит очевидную ошибку (опечатку), или при подозрении в мошенничестве. В этих случаях полученные средства полностью возвращаются без дополнительных расходов." },
        ],
      },
      {
        heading: "4. Цены и наличие",
        blocks: [
          { type: "p", text: "Цены указаны в леях (MDL) и включают НДС, если не указано иное. Цены могут меняться без предварительного уведомления, но к заказу применяется значение на момент его размещения. В случае очевидной ошибки (например, нереально низкой цены) Inter Bus может скорректировать значение и связаться с вами до обработки." },
        ],
      },
      {
        heading: "5. Оплата",
        blocks: [
          { type: "p", text: "Мы принимаем оплату банковским переводом (по проформе-счёту), банковской картой (через авторизованных операторов) или наложенным платежом, в пределах, указанных на странице оформления. Для юридических лиц выставляется налоговая накладная с НДС. Данные карт никогда не проходят через наши серверы." },
        ],
      },
      {
        heading: "6. Отмена заказа",
        blocks: [
          { type: "p", text: "Вы можете отменить заказ бесплатно, если он ещё не подготовлен к отправке. Напишите нам как можно скорее через форму обратной связи. После отправки отмена превращается в возврат (см. соответствующую страницу)." },
        ],
      },
      {
        heading: "7. Соответствие деталей",
        blocks: [
          { type: "p", text: "Все детали, продаваемые через Inter Bus, являются либо оригинальными (OEM), либо проверенными аналогами, соответствующими спецификациям производителей автобусов. Для каждой детали указан код производителя и, при необходимости, кросс-коды. Идентификация правильной детали остаётся ответственностью покупателя; наша команда оказывает бесплатную поддержку по e-mail или телефону при сомнениях." },
        ],
      },
      {
        heading: "8. Ответственность",
        blocks: [
          { type: "p", text: "Inter Bus гарантирует качество продукции в соответствии с политикой гарантии и возврата, опубликованной на сайте. Наша ответственность ограничена стоимостью поставленной детали и не распространяется на косвенный ущерб (операционные потери, задержки, расходы на установку у третьих лиц и т. д.). Это ограничение не применяется в случаях, императивно предусмотренных законом." },
        ],
      },
      {
        heading: "9. Права интеллектуальной собственности",
        blocks: [
          { type: "p", text: "Всё содержимое сайта — тексты, изображения, структура, базы данных, программное обеспечение — принадлежит Inter Bus или его партнёрам и защищено законом об авторском праве. Воспроизведение, копирование или распространение без письменного согласия запрещены." },
        ],
      },
      {
        heading: "10. Споры и применимое право",
        blocks: [
          { type: "p", text: "Настоящие условия регулируются законодательством Республики Молдова. Любой спор сначала будет решаться полюбовно; в противном случае подсудность принадлежит судам по месту нахождения Inter Bus. Для потребителей дополнительно применяются нормы Закона № 105/2003 о защите прав потребителей." },
        ],
      },
      {
        heading: "11. Изменения условий",
        blocks: [
          { type: "p", text: "Мы можем периодически обновлять эти условия. Текущая версия отображается на этой странице с датой последней модификации в шапке. К ранее размещённым заказам применяются условия, действовавшие на момент их размещения." },
        ],
      },
    ],
  },
};

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

  const content = CONTENT[locale] ?? CONTENT.ro;

  return (
    <LegalPage
      locale={locale}
      eyebrow={t("eyebrow")}
      title={t("title")}
      intro={content.intro}
      updatedAt={t("updated_at")}
      homeLabel={tNav("home")}
      infoLabel={t("info_label")}
      sections={content.sections}
    />
  );
}
