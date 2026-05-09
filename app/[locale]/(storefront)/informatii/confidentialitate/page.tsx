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
  const t = await getTranslations({ locale, namespace: "legal_privacy" });
  return { title: t("title"), description: t("intro") };
}

const CONTENT: Record<string, { intro: string; sections: LegalSection[] }> = {
  ro: {
    intro:
      "Inter Bus tratează cu seriozitate protecția datelor personale ale clienților săi și respectă cadrul Regulamentului General privind Protecția Datelor (GDPR), Legea nr. 133/2011 privind protecția datelor cu caracter personal din Republica Moldova și legislația conexă. Acest document explică pe înțeles ce date colectăm, de ce le colectăm, cu cine le partajăm și ce drepturi ai în calitate de utilizator.",
    sections: [
      {
        heading: "1. Cine este operatorul",
        blocks: [
          { type: "p", text: "Operatorul datelor cu caracter personal este Inter Bus, denumit în continuare „Inter Bus”, „noi” sau „magazinul”. Pentru orice solicitare privind datele personale, ne poți contacta prin formularul de contact de pe site sau la adresa de email a echipei." },
        ],
      },
      {
        heading: "2. Ce date colectăm",
        blocks: [
          {
            type: "ul",
            items: [
              "**Date de identificare**: nume, prenume, adresa de email, număr de telefon, denumirea companiei și codul fiscal (pentru clienții juridici).",
              "**Date de livrare**: adresa la care urmează să livrăm comanda, oraș, țară, eventuale instrucțiuni suplimentare.",
              "**Date despre comenzi**: produsele cumpărate, valorile, metoda de plată aleasă, istoricul tranzacțiilor.",
              "**Date tehnice**: adresa IP, tipul dispozitivului, sistemul de operare, paginile vizitate, durata sesiunii — colectate strict pentru securitate, statistici agregate și îmbunătățirea site-ului.",
              "**Cont de utilizator**: dacă îți creezi un cont, păstrăm parola într-o formă criptată (hash); nu o vedem niciodată în clar.",
            ],
          },
        ],
      },
      {
        heading: "3. De ce colectăm aceste date",
        blocks: [
          {
            type: "ul",
            items: [
              "Pentru a procesa comenzile și a livra piesele cumpărate.",
              "Pentru a emite facturile și documentele contabile cerute de lege.",
              "Pentru a-ți răspunde la întrebări tehnice, garanție și retur.",
              "Pentru a îmbunătăți site-ul și catalogul (analitică agregată, fără identificarea persoanei).",
              "Pentru a-ți trimite informări comerciale, doar dacă ți-ai exprimat consimțământul explicit (newsletter, oferte). Te poți dezabona oricând.",
            ],
          },
        ],
      },
      {
        heading: "4. Temeiul legal",
        blocks: [
          { type: "p", text: "Prelucrăm datele tale fie pentru executarea contractului de vânzare-cumpărare (art. 6 alin. (1) lit. b GDPR), fie pe baza consimțământului tău liber exprimat (art. 6 alin. (1) lit. a), fie pentru îndeplinirea unor obligații legale ale Inter Bus în domeniul contabilității și fiscalității (art. 6 alin. (1) lit. c)." },
        ],
      },
      {
        heading: "5. Cu cine partajăm datele",
        blocks: [
          {
            type: "ul",
            items: [
              "**Curieri și operatori de transport** — pentru livrarea comenzilor (nume, telefon, adresă).",
              "**Procesatori de plăți** — atunci când alegi plata online, datele financiare merg direct către procesator (nu trec prin serverele noastre).",
              "**Furnizori IT** — găzduire web, servicii de email, instrumente de analiză — toți obligați contractual să respecte aceleași standarde GDPR.",
              "**Autorități publice** — strict în baza unei cereri legale fundamentate.",
            ],
          },
          { type: "p", text: "Nu vindem datele tale unor terți și nu le folosim în afara scopurilor enumerate aici." },
        ],
      },
      {
        heading: "6. Cât timp păstrăm datele",
        blocks: [
          { type: "p", text: "Datele despre comenzi și facturi sunt păstrate timp de 10 ani, conform legislației contabile. Datele de cont rămân active cât timp îți păstrezi contul; le poți șterge oricând la cerere. Datele tehnice (log-uri) sunt rotite la 12 luni." },
        ],
      },
      {
        heading: "7. Drepturile tale",
        blocks: [
          {
            type: "ul",
            items: [
              "**Drept de acces** — să afli ce date deținem despre tine.",
              "**Drept de rectificare** — să corectezi datele incorecte sau incomplete.",
              "**Drept de ștergere** — să ne ceri ștergerea datelor (cu excepția celor pe care suntem obligați legal să le păstrăm).",
              "**Drept de restricționare** — să limitezi temporar prelucrarea.",
              "**Drept de portabilitate** — să primești datele într-un format structurat, lizibil automat.",
              "**Drept de opoziție** — în special față de marketing direct.",
              "**Drept de a depune plângere** — la Centrul Național pentru Protecția Datelor cu Caracter Personal (Republica Moldova) sau la autoritatea echivalentă din țara ta.",
            ],
          },
        ],
      },
      {
        heading: "8. Cookies",
        blocks: [
          { type: "p", text: "Folosim cookies strict necesare (sesiunea de coș, autentificare) și cookies de analitică agregată. Nu folosim cookies de tracking pentru publicitate țintită fără consimțământul tău. Poți șterge sau bloca cookies-urile din setările browserului, dar unele funcționalități (coș, login) ar putea înceta să funcționeze." },
        ],
      },
      {
        heading: "9. Securitatea datelor",
        blocks: [
          { type: "p", text: "Folosim conexiuni HTTPS pe tot site-ul, criptăm parolele, ne actualizăm constant infrastructura și restricționăm accesul intern doar la persoanele care au nevoie de el. Cu toate acestea, nicio metodă de transmitere prin internet nu este 100% sigură; ne angajăm să te informăm fără întârziere în cazul oricărui incident care îți afectează datele." },
        ],
      },
      {
        heading: "10. Modificări ale acestei politici",
        blocks: [
          { type: "p", text: "Putem actualiza această politică pentru a reflecta schimbări legislative sau ale modului nostru de operare. Versiunea curentă este întotdeauna afișată pe această pagină, cu data ultimei modificări în antet." },
        ],
      },
    ],
  },
  en: {
    intro:
      "Inter Bus takes the protection of customer personal data seriously and complies with the General Data Protection Regulation (GDPR), the Republic of Moldova's Law no. 133/2011 on personal data protection, and related legislation. This document explains, in plain terms, what data we collect, why, who we share it with, and what rights you have as a user.",
    sections: [
      {
        heading: "1. Who is the controller",
        blocks: [
          { type: "p", text: "The personal data controller is Inter Bus, hereinafter referred to as “Inter Bus”, “we”, or “the store”. For any request regarding personal data, you can reach us through the contact form on the site or via the team's email address." },
        ],
      },
      {
        heading: "2. What data we collect",
        blocks: [
          {
            type: "ul",
            items: [
              "**Identification data**: first name, last name, email address, phone number, company name and tax code (for business customers).",
              "**Delivery data**: the address where we will deliver the order, city, country, and any additional instructions.",
              "**Order data**: products purchased, values, payment method chosen, transaction history.",
              "**Technical data**: IP address, device type, operating system, pages visited, session duration — collected strictly for security, aggregated statistics, and site improvements.",
              "**User account**: if you create an account, we store the password in encrypted form (hash); we never see it in plain text.",
            ],
          },
        ],
      },
      {
        heading: "3. Why we collect this data",
        blocks: [
          {
            type: "ul",
            items: [
              "To process orders and ship the parts purchased.",
              "To issue invoices and accounting documents required by law.",
              "To answer your technical, warranty, and return questions.",
              "To improve the site and catalog (aggregate analytics, without identifying the individual).",
              "To send you commercial communications, only if you have given explicit consent (newsletter, offers). You can unsubscribe at any time.",
            ],
          },
        ],
      },
      {
        heading: "4. Legal basis",
        blocks: [
          { type: "p", text: "We process your data either to perform the sales contract (Art. 6(1)(b) GDPR), based on your freely given consent (Art. 6(1)(a)), or to comply with Inter Bus's legal obligations in accounting and taxation (Art. 6(1)(c))." },
        ],
      },
      {
        heading: "5. Who we share data with",
        blocks: [
          {
            type: "ul",
            items: [
              "**Couriers and shipping operators** — for order delivery (name, phone, address).",
              "**Payment processors** — when you choose online payment, financial data goes directly to the processor (it does not pass through our servers).",
              "**IT vendors** — web hosting, email services, analytics tools — all contractually required to meet the same GDPR standards.",
              "**Public authorities** — strictly upon a legally grounded request.",
            ],
          },
          { type: "p", text: "We do not sell your data to third parties and we do not use it outside of the purposes listed here." },
        ],
      },
      {
        heading: "6. How long we keep data",
        blocks: [
          { type: "p", text: "Order and invoice data is retained for 10 years, as required by accounting law. Account data remains active as long as you keep your account; you can delete it at any time on request. Technical data (logs) is rotated every 12 months." },
        ],
      },
      {
        heading: "7. Your rights",
        blocks: [
          {
            type: "ul",
            items: [
              "**Right of access** — to find out what data we hold about you.",
              "**Right to rectification** — to correct inaccurate or incomplete data.",
              "**Right to erasure** — to request deletion of your data (except for what we are legally required to retain).",
              "**Right to restriction** — to temporarily limit processing.",
              "**Right to portability** — to receive your data in a structured, machine-readable format.",
              "**Right to object** — particularly against direct marketing.",
              "**Right to lodge a complaint** — with the National Center for Personal Data Protection (Republic of Moldova) or the equivalent authority in your country.",
            ],
          },
        ],
      },
      {
        heading: "8. Cookies",
        blocks: [
          { type: "p", text: "We use strictly necessary cookies (cart session, authentication) and aggregated analytics cookies. We do not use tracking cookies for targeted advertising without your consent. You can delete or block cookies in your browser settings, but some features (cart, login) may stop working." },
        ],
      },
      {
        heading: "9. Data security",
        blocks: [
          { type: "p", text: "We use HTTPS across the entire site, encrypt passwords, continuously update our infrastructure, and restrict internal access only to people who need it. That said, no method of internet transmission is 100% secure; we commit to informing you without delay in the event of any incident affecting your data." },
        ],
      },
      {
        heading: "10. Changes to this policy",
        blocks: [
          { type: "p", text: "We may update this policy to reflect legislative changes or changes in how we operate. The current version is always displayed on this page, with the date of the last modification in the header." },
        ],
      },
    ],
  },
  ru: {
    intro:
      "Inter Bus серьёзно относится к защите персональных данных клиентов и соблюдает Общий регламент по защите данных (GDPR), Закон Республики Молдова № 133/2011 о защите персональных данных и смежное законодательство. В этом документе понятным языком объясняется, какие данные мы собираем, зачем, с кем делимся и какие права у вас есть как у пользователя.",
    sections: [
      {
        heading: "1. Кто оператор",
        blocks: [
          { type: "p", text: "Оператором персональных данных является Inter Bus, далее — «Inter Bus», «мы» или «магазин». По любым вопросам о персональных данных свяжитесь с нами через форму на сайте или по электронной почте команды." },
        ],
      },
      {
        heading: "2. Какие данные мы собираем",
        blocks: [
          {
            type: "ul",
            items: [
              "**Идентификационные данные**: имя, фамилия, e-mail, телефон, название компании и налоговый код (для юридических лиц).",
              "**Данные доставки**: адрес, по которому будет доставлен заказ, город, страна, дополнительные инструкции.",
              "**Данные о заказах**: купленные товары, суммы, выбранный способ оплаты, история транзакций.",
              "**Технические данные**: IP-адрес, тип устройства, операционная система, посещённые страницы, продолжительность сессии — строго для безопасности, агрегированной статистики и улучшения сайта.",
              "**Учётная запись**: если вы создаёте аккаунт, пароль хранится в зашифрованном виде (hash); мы никогда не видим его в открытом виде.",
            ],
          },
        ],
      },
      {
        heading: "3. Зачем мы собираем эти данные",
        blocks: [
          {
            type: "ul",
            items: [
              "Для обработки заказов и доставки купленных деталей.",
              "Для выставления счетов и бухгалтерских документов, требуемых законом.",
              "Чтобы отвечать на ваши вопросы по технике, гарантии и возврату.",
              "Для улучшения сайта и каталога (агрегированная аналитика, без идентификации лица).",
              "Для отправки коммерческих сообщений — только при вашем явном согласии (рассылки, акции). Отписаться можно в любое время.",
            ],
          },
        ],
      },
      {
        heading: "4. Правовое основание",
        blocks: [
          { type: "p", text: "Мы обрабатываем данные либо для исполнения договора купли-продажи (ст. 6(1)(b) GDPR), либо на основании вашего согласия (ст. 6(1)(a)), либо для исполнения юридических обязательств Inter Bus в области бухгалтерии и налогообложения (ст. 6(1)(c))." },
        ],
      },
      {
        heading: "5. С кем мы делимся данными",
        blocks: [
          {
            type: "ul",
            items: [
              "**Курьеры и транспортные операторы** — для доставки заказов (имя, телефон, адрес).",
              "**Платёжные процессоры** — при онлайн-оплате финансовые данные идут напрямую к процессору (они не проходят через наши серверы).",
              "**IT-поставщики** — хостинг, e-mail, аналитика — все обязаны контрактом соблюдать те же стандарты GDPR.",
              "**Государственные органы** — строго на основании обоснованного законного запроса.",
            ],
          },
          { type: "p", text: "Мы не продаём ваши данные третьим лицам и не используем их вне перечисленных здесь целей." },
        ],
      },
      {
        heading: "6. Сколько мы храним данные",
        blocks: [
          { type: "p", text: "Данные о заказах и счетах хранятся 10 лет согласно бухгалтерскому законодательству. Данные аккаунта активны, пока вы его сохраняете; их можно удалить в любое время по запросу. Технические данные (логи) ротируются каждые 12 месяцев." },
        ],
      },
      {
        heading: "7. Ваши права",
        blocks: [
          {
            type: "ul",
            items: [
              "**Право доступа** — узнать, какие данные о вас у нас есть.",
              "**Право на исправление** — исправить неточные или неполные данные.",
              "**Право на удаление** — потребовать удалить данные (за исключением тех, что мы обязаны хранить по закону).",
              "**Право на ограничение** — временно ограничить обработку.",
              "**Право на переносимость** — получить данные в структурированном машиночитаемом формате.",
              "**Право на возражение** — особенно против прямого маркетинга.",
              "**Право подать жалобу** — в Национальный центр по защите персональных данных (Республика Молдова) или эквивалентный орган в вашей стране.",
            ],
          },
        ],
      },
      {
        heading: "8. Cookies",
        blocks: [
          { type: "p", text: "Мы используем строго необходимые cookies (сессия корзины, аутентификация) и cookies агрегированной аналитики. Мы не используем cookies трекинга для таргетированной рекламы без вашего согласия. Cookies можно удалить или заблокировать в настройках браузера, но некоторые функции (корзина, вход) могут перестать работать." },
        ],
      },
      {
        heading: "9. Безопасность данных",
        blocks: [
          { type: "p", text: "Мы используем HTTPS на всём сайте, шифруем пароли, постоянно обновляем инфраструктуру и ограничиваем внутренний доступ только теми, кому он нужен. Тем не менее, ни один способ передачи через интернет не является 100% безопасным; в случае инцидента, влияющего на ваши данные, мы обязуемся проинформировать вас без задержки." },
        ],
      },
      {
        heading: "10. Изменения этой политики",
        blocks: [
          { type: "p", text: "Мы можем обновлять эту политику, отражая изменения законодательства или нашего способа работы. Текущая версия всегда отображается на этой странице, с датой последнего изменения в шапке." },
        ],
      },
    ],
  },
};

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
