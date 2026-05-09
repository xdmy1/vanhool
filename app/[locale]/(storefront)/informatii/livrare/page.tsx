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
  const t = await getTranslations({ locale, namespace: "legal_delivery" });
  return { title: t("title"), description: t("intro") };
}

const CONTENT: Record<string, { intro: string; sections: LegalSection[] }> = {
  ro: {
    intro:
      "Inter Bus livrează piese în toată Republica Moldova și, la cerere, în țările limitrofe. Lucrăm cu parteneri de transport verificați și ambalăm fiecare piesă astfel încât să ajungă la tine în condiții impecabile, indiferent de distanță sau gabarit.",
    sections: [
      {
        heading: "1. Zone de livrare",
        blocks: [
          {
            type: "ul",
            items: [
              "**Chișinău** — livrare în aceeași zi sau în ziua următoare lucrătoare, în funcție de ora plasării comenzii.",
              "**Restul Republicii Moldova** — 2–5 zile lucrătoare prin curier național.",
              "**România și UE** — 5–10 zile lucrătoare prin parteneri internaționali. Costul și termenul exact se confirmă pe email înainte de expediere.",
              "**Altă destinație** — pentru flotele care operează în alte țări, oferim ofertă personalizată la cerere.",
            ],
          },
        ],
      },
      {
        heading: "2. Termenul de livrare",
        blocks: [
          { type: "p", text: "Termenul indicat începe să curgă din momentul confirmării comenzii și al verificării stocului. Pentru piesele aflate în stoc propriu, expediem în aceeași zi pentru comenzile primite până la ora 14:00 (zile lucrătoare). Pentru piesele aduse la comandă de la furnizorii noștri, te informăm anticipat asupra termenului estimat și al eventualelor costuri suplimentare." },
        ],
      },
      {
        heading: "3. Costul livrării",
        blocks: [
          {
            type: "ul",
            items: [
              "**Livrare gratuită** pentru comenzile cu valoare egală sau mai mare de 200 EUR pe teritoriul Republicii Moldova.",
              "**Tarif fix** de 25 EUR pentru comenzile sub acest prag, indiferent de locație în Republica Moldova.",
              "**Livrarea internațională** se calculează individual, în funcție de greutate, dimensiuni și destinație. Costul este afișat înainte de confirmarea comenzii.",
              "Pentru piesele de gabarit mare (radiatoare, oglinzi laterale, panouri de caroserie) poate exista un tarif suplimentar, comunicat înainte de expediere.",
            ],
          },
        ],
      },
      {
        heading: "4. Modalități de livrare",
        blocks: [
          {
            type: "ul",
            items: [
              "**Curierat la domiciliu** — opțiunea standard. Curierul livrează la adresa indicată în comandă, în intervalul orar agreat la confirmare.",
              "**Ridicare de la sediu** — în Chișinău, poți ridica personal piesele de la depozitul Inter Bus, după ce primești confirmarea că sunt pregătite. Ne ajută să economisim timp pe comenzile urgente.",
              "**Livrare directă la service** — pentru flotele profesioniste, putem livra direct la atelierul partener, fără opriri intermediare.",
            ],
          },
        ],
      },
      {
        heading: "5. Confirmare și urmărire",
        blocks: [
          { type: "p", text: "După plasarea comenzii primești pe email un sumar al solicitării. La expediere primești un al doilea email cu numărul de tracking de la curier și un link prin care urmărești pachetul în timp real. Pentru întrebări legate de o livrare în curs, ne poți scrie oricând prin formularul de contact, indicând numărul comenzii." },
        ],
      },
      {
        heading: "6. La primirea coletului",
        blocks: [
          {
            type: "ol",
            items: [
              "Verifică integritatea ambalajului în prezența curierului. Dacă observi deteriorări vizibile (cutie zdrobită, sigiliu rupt), refuză primirea sau menționează expres acest lucru pe documentul de livrare.",
              "Deschide coletul cât mai repede posibil și verifică conținutul față de factură.",
              "Pentru orice neconformitate (piesă lipsă, deteriorată, codul nu corespunde), contactează-ne în maxim 48 de ore de la primire.",
            ],
          },
        ],
      },
      {
        heading: "7. Imposibilitatea livrării",
        blocks: [
          { type: "p", text: "Dacă pachetul nu poate fi predat din motive imputabile destinatarului (adresă incorectă, număr de telefon greșit, refuz de primire fără motiv obiectiv), costul de retur și al reexpedierii se suportă de către cumpărător. Pentru a evita astfel de situații, verifică datele de contact înainte de a confirma comanda." },
        ],
      },
      {
        heading: "8. Ambalare",
        blocks: [
          { type: "p", text: "Toate piesele sunt ambalate în condiții care protejează atât componentele sensibile (electronice, lentile, suprafețe vopsite), cât și piesele cu masă mare. Folosim cutii întărite, materiale absorbante de șocuri și plastic protector la nevoie. Pentru piesele cu marcaj fragil, marcăm extern cutiile pentru a le manipula corespunzător." },
        ],
      },
      {
        heading: "9. Întârzieri și forță majoră",
        blocks: [
          { type: "p", text: "Inter Bus depune toate eforturile rezonabile pentru a respecta termenele indicate. În cazul evenimentelor imprevizibile (condiții meteo extreme, restricții vamale, întreruperi ale serviciilor curierului), te informăm de îndată și agreăm împreună soluția: așteptare, anulare cu rambursare integrală sau înlocuire cu un produs echivalent." },
        ],
      },
    ],
  },
  en: {
    intro:
      "Inter Bus delivers parts throughout the Republic of Moldova and, on request, to neighbouring countries. We work with vetted shipping partners and pack every part so it arrives in pristine condition, regardless of distance or size.",
    sections: [
      {
        heading: "1. Delivery zones",
        blocks: [
          {
            type: "ul",
            items: [
              "**Chișinău** — same-day or next working-day delivery, depending on when the order is placed.",
              "**Rest of Moldova** — 2–5 working days via national courier.",
              "**Romania & EU** — 5–10 working days through international partners. Exact cost and term are confirmed by email before shipping.",
              "**Other destinations** — for fleets operating in other countries, we provide a custom quote on request.",
            ],
          },
        ],
      },
      {
        heading: "2. Delivery time",
        blocks: [
          { type: "p", text: "The stated term starts from order confirmation and stock verification. For parts in our own stock, we ship the same day for orders received before 14:00 (working days). For parts ordered from our suppliers, we inform you in advance of the estimated term and any additional costs." },
        ],
      },
      {
        heading: "3. Delivery cost",
        blocks: [
          {
            type: "ul",
            items: [
              "**Free delivery** for orders of 200 EUR or more within the Republic of Moldova.",
              "**Flat fee** of 25 EUR for orders below this threshold, regardless of location within Moldova.",
              "**International shipping** is calculated individually, based on weight, dimensions, and destination. The cost is shown before you confirm the order.",
              "For oversize parts (radiators, side mirrors, body panels), an additional fee may apply, communicated before shipping.",
            ],
          },
        ],
      },
      {
        heading: "4. Delivery options",
        blocks: [
          {
            type: "ul",
            items: [
              "**Home courier** — the standard option. The courier delivers to the address in the order, within the time slot agreed at confirmation.",
              "**Pickup at our location** — in Chișinău, you can collect parts in person from the Inter Bus warehouse once you receive confirmation that they're ready. Helps save time on urgent orders.",
              "**Direct service-shop delivery** — for professional fleets, we can deliver straight to the partner workshop, with no intermediate stops.",
            ],
          },
        ],
      },
      {
        heading: "5. Confirmation and tracking",
        blocks: [
          { type: "p", text: "After placing your order you receive an email summary. On dispatch you receive a second email with the courier's tracking number and a link to follow the package in real time. For questions about an in-progress delivery, you can write to us at any time via the contact form, citing the order number." },
        ],
      },
      {
        heading: "6. On receiving the package",
        blocks: [
          {
            type: "ol",
            items: [
              "Check packaging integrity in the courier's presence. If you notice visible damage (crushed box, broken seal), refuse the package or expressly note this on the delivery document.",
              "Open the package as soon as possible and check the contents against the invoice.",
              "For any non-conformity (missing part, damaged, code doesn't match), contact us within 48 hours of receipt.",
            ],
          },
        ],
      },
      {
        heading: "7. Inability to deliver",
        blocks: [
          { type: "p", text: "If the package cannot be delivered for reasons attributable to the recipient (incorrect address, wrong phone number, refusal without an objective reason), return shipping and re-shipment costs are borne by the buyer. To avoid such situations, verify contact details before confirming the order." },
        ],
      },
      {
        heading: "8. Packaging",
        blocks: [
          { type: "p", text: "All parts are packed in ways that protect both sensitive components (electronics, lenses, painted surfaces) and heavy parts. We use reinforced boxes, shock-absorbing materials, and protective plastic where needed. For fragile items, we mark the boxes externally so they are handled appropriately." },
        ],
      },
      {
        heading: "9. Delays and force majeure",
        blocks: [
          { type: "p", text: "Inter Bus makes all reasonable efforts to meet the stated terms. In the event of unforeseen events (extreme weather, customs restrictions, courier service interruptions), we inform you immediately and agree on a solution together: waiting, cancellation with full refund, or replacement with an equivalent product." },
        ],
      },
    ],
  },
  ru: {
    intro:
      "Inter Bus доставляет запчасти по всей Республике Молдова и, по запросу, в соседние страны. Мы работаем с проверенными транспортными партнёрами и упаковываем каждую деталь так, чтобы она прибыла в безупречном состоянии, независимо от расстояния или габарита.",
    sections: [
      {
        heading: "1. Зоны доставки",
        blocks: [
          {
            type: "ul",
            items: [
              "**Кишинёв** — доставка в тот же день или на следующий рабочий день, в зависимости от времени оформления заказа.",
              "**Остальная Молдова** — 2–5 рабочих дней через национального курьера.",
              "**Румыния и ЕС** — 5–10 рабочих дней через международных партнёров. Точная стоимость и сроки подтверждаются по e-mail до отправки.",
              "**Другие направления** — для автопарков, работающих в других странах, предоставляем индивидуальное предложение по запросу.",
            ],
          },
        ],
      },
      {
        heading: "2. Сроки доставки",
        blocks: [
          { type: "p", text: "Указанный срок начинает течь с момента подтверждения заказа и проверки наличия. Для деталей с собственного склада мы отгружаем в тот же день при заказах, полученных до 14:00 (рабочие дни). Для деталей под заказ у наших поставщиков мы заранее сообщаем предполагаемый срок и возможные дополнительные расходы." },
        ],
      },
      {
        heading: "3. Стоимость доставки",
        blocks: [
          {
            type: "ul",
            items: [
              "**Бесплатная доставка** для заказов от 200 EUR на территории Республики Молдова.",
              "**Фиксированный тариф** 25 EUR для заказов ниже этого порога, независимо от локации в Молдове.",
              "**Международная доставка** рассчитывается индивидуально по весу, размерам и направлению. Стоимость показывается до подтверждения заказа.",
              "Для крупногабаритных деталей (радиаторы, боковые зеркала, панели кузова) может применяться дополнительный тариф, согласованный до отправки.",
            ],
          },
        ],
      },
      {
        heading: "4. Способы доставки",
        blocks: [
          {
            type: "ul",
            items: [
              "**Курьер на дом** — стандартный вариант. Курьер доставляет по адресу, указанному в заказе, в согласованный временной интервал.",
              "**Самовывоз** — в Кишинёве вы можете лично забрать детали со склада Inter Bus после подтверждения готовности. Помогает экономить время на срочных заказах.",
              "**Прямая доставка в сервис** — для профессиональных автопарков мы можем доставлять напрямую в партнёрский сервис без промежуточных остановок.",
            ],
          },
        ],
      },
      {
        heading: "5. Подтверждение и отслеживание",
        blocks: [
          { type: "p", text: "После размещения заказа вы получаете на e-mail сводку. При отправке вы получаете второе письмо с трек-номером курьера и ссылкой для отслеживания посылки в реальном времени. По вопросам о текущей доставке вы можете написать нам через форму обратной связи, указав номер заказа." },
        ],
      },
      {
        heading: "6. При получении посылки",
        blocks: [
          {
            type: "ol",
            items: [
              "Проверьте целостность упаковки в присутствии курьера. Если видны повреждения (помятая коробка, сорванная пломба), откажитесь от посылки или специально укажите это в накладной.",
              "Откройте посылку как можно скорее и проверьте содержимое по счёту.",
              "При любом несоответствии (отсутствует деталь, повреждена, код не совпадает) свяжитесь с нами в течение 48 часов с момента получения.",
            ],
          },
        ],
      },
      {
        heading: "7. Невозможность доставки",
        blocks: [
          { type: "p", text: "Если посылка не может быть доставлена по причинам со стороны получателя (неверный адрес, ошибочный телефон, отказ без объективной причины), расходы на возврат и повторную отправку несёт покупатель. Чтобы избежать таких ситуаций, проверяйте контактные данные до подтверждения заказа." },
        ],
      },
      {
        heading: "8. Упаковка",
        blocks: [
          { type: "p", text: "Все детали упаковываются с защитой как чувствительных компонентов (электроника, линзы, окрашенные поверхности), так и тяжёлых деталей. Мы используем усиленные коробки, амортизирующие материалы и защитный пластик при необходимости. Для хрупких изделий мы маркируем коробки снаружи для правильного обращения." },
        ],
      },
      {
        heading: "9. Задержки и форс-мажор",
        blocks: [
          { type: "p", text: "Inter Bus прилагает все разумные усилия для соблюдения указанных сроков. В случае непредвиденных событий (экстремальная погода, таможенные ограничения, перебои в курьерских службах) мы немедленно информируем вас и совместно согласовываем решение: ожидание, отмена с полным возвратом средств или замена эквивалентным продуктом." },
        ],
      },
    ],
  },
};

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
