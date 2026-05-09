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
  const t = await getTranslations({ locale, namespace: "legal_warranty" });
  return { title: t("title"), description: t("intro") };
}

const CONTENT: Record<string, { intro: string; sections: LegalSection[] }> = {
  ro: {
    intro:
      "Inter Bus oferă garanție pentru toate piesele comercializate prin magazin și acceptă returul produselor în condițiile de mai jos. Scopul nostru este ca fiecare comandă să ajungă conformă, iar în cazul oricărei probleme tehnice să primești o soluție rapidă — înlocuire, reparație sau rambursare.",
    sections: [
      {
        heading: "1. Termenul de garanție",
        blocks: [
          {
            type: "ul",
            items: [
              "**12 luni** — termen standard pentru majoritatea pieselor de schimb, dacă producătorul nu specifică altă durată.",
              "**24 luni** — pentru anumite categorii (amortizoare, alternatoare, ambreiaje complete) când specificațiile producătorului permit.",
              "**Conform fișei tehnice** — pentru piese cu garanție extinsă oferită direct de fabricant; durata exactă este menționată pe pagina produsului.",
            ],
          },
          { type: "p", text: "Termenul curge de la data livrării, dovedită prin factura fiscală. Pentru a beneficia de garanție, păstrează factura și ambalajul original cât timp folosești piesa." },
        ],
      },
      {
        heading: "2. Ce acoperă garanția",
        blocks: [
          {
            type: "ul",
            items: [
              "Defecte de material și execuție atribuibile producătorului.",
              "Funcționare necorespunzătoare apărută în condiții normale de utilizare.",
              "Neconformitatea cu specificațiile tehnice declarate la momentul vânzării.",
            ],
          },
        ],
      },
      {
        heading: "3. Ce nu acoperă garanția",
        blocks: [
          {
            type: "ul",
            items: [
              "Uzura normală apărută prin folosință (de exemplu, plăcuțele de frână își epuizează ferodoul, filtrele se colmatează etc.).",
              "Defecțiuni cauzate de montaj incorect sau efectuat de personal neautorizat. Pentru piese tehnice, recomandăm montajul într-un service specializat.",
              "Daune apărute din folosirea piesei în condiții improprii (suprasarcină, lichide neconforme, lipsa întreținerii periodice a vehiculului).",
              "Modificări sau reparații neautorizate aduse piesei.",
              "Daune mecanice externe (lovituri, accidente, fenomene naturale).",
              "Folosirea piesei pe alt vehicul decât cel pentru care este omologată sau aplicabilă.",
            ],
          },
        ],
      },
      {
        heading: "4. Cum activezi garanția",
        blocks: [
          {
            type: "ol",
            items: [
              "Contactează echipa Inter Bus prin formularul de contact sau telefonic, cu numărul comenzii și o descriere a problemei.",
              "Te ghidăm spre soluție: în multe cazuri identificăm rapid dacă e vorba de un defect de fabricație sau de o cauză externă.",
              "Dacă piesa trebuie inspectată, o expediezi la adresa pe care ți-o comunicăm, împreună cu factura și, dacă este posibil, fotografii cu defectul.",
              "În maxim **15 zile lucrătoare** de la primirea piesei, comunicăm rezultatul evaluării și soluția aplicată: înlocuire, reparație sau rambursare.",
            ],
          },
        ],
      },
      {
        heading: "5. Dreptul de retur (14 zile)",
        blocks: [
          { type: "p", text: "Pentru clienții persoane fizice, conform Legii nr. 105/2003 privind protecția consumatorilor, ai dreptul de a returna produsul în **14 zile calendaristice** de la primire, fără a fi nevoie să justifici decizia." },
          { type: "p", text: "Condițiile pentru retur:" },
          {
            type: "ul",
            items: [
              "Piesa nu a fost montată și se află în starea originală.",
              "Ambalajul original este intact, etichetele neîndepărtate.",
              "Toate accesoriile, manualele și certificatele sunt incluse.",
              "Returul e însoțit de factura fiscală sau bonul de casă.",
            ],
          },
          { type: "p", text: "Costul de transport pentru retur este suportat de cumpărător, cu excepția cazurilor în care produsul este defect, eronat livrat sau incorect descris." },
        ],
      },
      {
        heading: "6. Excepții de la dreptul de retur",
        blocks: [
          { type: "p", text: "Anumite produse, prin natura lor, nu pot fi returnate dacă au fost desigilate sau montate: piese electronice individualizate, lichide tehnice, piese realizate la comandă după specificații furnizate de client, precum și piese care, după ambalare, nu mai pot fi revândute din motive sanitare sau de siguranță." },
        ],
      },
      {
        heading: "7. Modalități de rambursare",
        blocks: [
          { type: "p", text: "Rambursarea se efectuează în maxim **14 zile** de la confirmarea returului sau de la finalizarea procedurii de garanție, prin aceeași metodă folosită la plată (transfer bancar pe contul de pe care s-a încasat suma sau ramburs către cardul folosit). Pentru clienții juridici, rambursarea se efectuează exclusiv prin transfer bancar pe baza facturii de stornare." },
        ],
      },
      {
        heading: "8. Asistență tehnică",
        blocks: [
          { type: "p", text: "Echipa Inter Bus rămâne la dispoziție pentru orice întrebare legată de identificarea pieselor, compatibilitate sau garanție. Răspundem în zilele lucrătoare în maxim 24 de ore. Pentru flotele profesioniste oferim asistență tehnică prioritară." },
        ],
      },
    ],
  },
  en: {
    intro:
      "Inter Bus warrants every part sold through the store and accepts returns under the conditions below. Our goal is for every order to arrive conforming, and in the event of any technical issue, for you to receive a quick resolution — replacement, repair, or refund.",
    sections: [
      {
        heading: "1. Warranty period",
        blocks: [
          {
            type: "ul",
            items: [
              "**12 months** — standard term for most spare parts, unless the manufacturer specifies a different duration.",
              "**24 months** — for certain categories (shock absorbers, alternators, complete clutches) when manufacturer specifications allow.",
              "**Per data sheet** — for parts with extended warranty offered directly by the manufacturer; the exact duration is shown on the product page.",
            ],
          },
          { type: "p", text: "The term starts from the delivery date, evidenced by the tax invoice. To benefit from the warranty, keep the invoice and the original packaging for as long as you use the part." },
        ],
      },
      {
        heading: "2. What the warranty covers",
        blocks: [
          {
            type: "ul",
            items: [
              "Material and workmanship defects attributable to the manufacturer.",
              "Malfunction occurring under normal conditions of use.",
              "Non-conformity with the technical specifications declared at the time of sale.",
            ],
          },
        ],
      },
      {
        heading: "3. What the warranty does not cover",
        blocks: [
          {
            type: "ul",
            items: [
              "Normal wear from use (for example, brake pads consuming their friction lining, filters clogging, etc.).",
              "Defects caused by incorrect installation or installation by unauthorized personnel. For technical parts, we recommend installation in a specialized service shop.",
              "Damage from using the part in improper conditions (overload, non-conforming fluids, lack of periodic vehicle maintenance).",
              "Unauthorized modifications or repairs to the part.",
              "External mechanical damage (impacts, accidents, natural phenomena).",
              "Use of the part on a vehicle other than the one for which it is homologated or applicable.",
            ],
          },
        ],
      },
      {
        heading: "4. How to activate the warranty",
        blocks: [
          {
            type: "ol",
            items: [
              "Contact the Inter Bus team via the contact form or phone, with your order number and a description of the issue.",
              "We guide you to a solution: in many cases we quickly identify whether it's a manufacturing defect or an external cause.",
              "If the part needs to be inspected, you ship it to the address we provide, along with the invoice and, if possible, photographs of the defect.",
              "Within a maximum of **15 working days** of receiving the part, we communicate the assessment result and the applied solution: replacement, repair, or refund.",
            ],
          },
        ],
      },
      {
        heading: "5. Right of return (14 days)",
        blocks: [
          { type: "p", text: "For natural-person customers, under Law no. 105/2003 on consumer protection, you have the right to return the product within **14 calendar days** of receipt, without having to justify the decision." },
          { type: "p", text: "Return conditions:" },
          {
            type: "ul",
            items: [
              "The part has not been installed and is in original condition.",
              "Original packaging is intact, labels not removed.",
              "All accessories, manuals, and certificates are included.",
              "The return is accompanied by the tax invoice or receipt.",
            ],
          },
          { type: "p", text: "Return shipping costs are borne by the buyer, except where the product is defective, mis-shipped, or incorrectly described." },
        ],
      },
      {
        heading: "6. Exceptions to the right of return",
        blocks: [
          { type: "p", text: "Certain products, by their nature, cannot be returned if they have been unsealed or installed: individualized electronic parts, technical fluids, parts made to order based on customer specifications, as well as parts which, once packaged, cannot be resold for sanitary or safety reasons." },
        ],
      },
      {
        heading: "7. Refund methods",
        blocks: [
          { type: "p", text: "Refunds are issued within a maximum of **14 days** from confirmation of the return or completion of the warranty procedure, using the same method used for payment (bank transfer to the account from which the amount was collected, or refund to the card used). For business customers, refunds are issued exclusively by bank transfer based on a credit note." },
        ],
      },
      {
        heading: "8. Technical assistance",
        blocks: [
          { type: "p", text: "The Inter Bus team is available for any question regarding part identification, compatibility, or warranty. We respond on working days within 24 hours. For professional fleets we offer priority technical assistance." },
        ],
      },
    ],
  },
  ru: {
    intro:
      "Inter Bus предоставляет гарантию на все детали, продаваемые через магазин, и принимает возвраты на условиях ниже. Наша цель — чтобы каждый заказ прибывал соответствующим, а в случае технической проблемы вы получили быстрое решение: замену, ремонт или возврат средств.",
    sections: [
      {
        heading: "1. Срок гарантии",
        blocks: [
          {
            type: "ul",
            items: [
              "**12 месяцев** — стандартный срок для большинства запчастей, если производитель не указывает иное.",
              "**24 месяца** — для отдельных категорий (амортизаторы, генераторы, комплекты сцепления), когда это допускают спецификации производителя.",
              "**Согласно паспорту** — для деталей с расширенной гарантией от производителя; точный срок указан на странице товара.",
            ],
          },
          { type: "p", text: "Срок исчисляется с даты доставки, подтверждённой налоговой накладной. Для использования гарантии сохраняйте счёт и оригинальную упаковку всё время использования детали." },
        ],
      },
      {
        heading: "2. Что покрывает гарантия",
        blocks: [
          {
            type: "ul",
            items: [
              "Дефекты материала и изготовления, относящиеся к производителю.",
              "Неисправная работа при нормальных условиях эксплуатации.",
              "Несоответствие техническим характеристикам, заявленным на момент продажи.",
            ],
          },
        ],
      },
      {
        heading: "3. Что гарантия не покрывает",
        blocks: [
          {
            type: "ul",
            items: [
              "Естественный износ при эксплуатации (например, износ накладок тормозных колодок, засорение фильтров).",
              "Неисправности из-за неправильной установки или установки неавторизованным персоналом. Для технических деталей рекомендуем установку в специализированном сервисе.",
              "Повреждения от использования в неподходящих условиях (перегрузка, неподходящие жидкости, отсутствие периодического обслуживания автомобиля).",
              "Несанкционированные изменения или ремонт детали.",
              "Внешние механические повреждения (удары, аварии, природные явления).",
              "Использование детали на другом автомобиле, чем тот, для которого она омологирована или применима.",
            ],
          },
        ],
      },
      {
        heading: "4. Как активировать гарантию",
        blocks: [
          {
            type: "ol",
            items: [
              "Свяжитесь с командой Inter Bus через форму обратной связи или по телефону, указав номер заказа и описание проблемы.",
              "Мы направляем вас к решению: во многих случаях быстро определяем, дефект ли это производства или внешняя причина.",
              "Если деталь требует осмотра, вы отправляете её по адресу, который мы укажем, со счётом и, по возможности, фото дефекта.",
              "В течение максимум **15 рабочих дней** с момента получения детали сообщаем результат оценки и применённое решение: замена, ремонт или возврат средств.",
            ],
          },
        ],
      },
      {
        heading: "5. Право возврата (14 дней)",
        blocks: [
          { type: "p", text: "Для клиентов физических лиц, согласно Закону № 105/2003 о защите прав потребителей, вы имеете право вернуть товар в течение **14 календарных дней** с даты получения, без необходимости обоснования." },
          { type: "p", text: "Условия возврата:" },
          {
            type: "ul",
            items: [
              "Деталь не была установлена и находится в оригинальном состоянии.",
              "Оригинальная упаковка цела, ярлыки не удалены.",
              "Все принадлежности, инструкции и сертификаты в комплекте.",
              "Возврат сопровождается налоговой накладной или чеком.",
            ],
          },
          { type: "p", text: "Стоимость обратной доставки несёт покупатель, кроме случаев, когда товар дефектный, ошибочно отправлен или неверно описан." },
        ],
      },
      {
        heading: "6. Исключения из права возврата",
        blocks: [
          { type: "p", text: "Отдельные товары по своей природе не подлежат возврату после распечатки или установки: индивидуализированные электронные детали, технические жидкости, детали, изготовленные на заказ по спецификации клиента, а также детали, которые после упаковки не могут быть перепроданы по санитарным соображениям или соображениям безопасности." },
        ],
      },
      {
        heading: "7. Способы возврата средств",
        blocks: [
          { type: "p", text: "Возврат средств производится в течение максимум **14 дней** с подтверждения возврата или завершения гарантийной процедуры, тем же способом, что и оплата (банковский перевод на счёт, с которого был получен платёж, или возврат на использованную карту). Для юридических лиц возврат производится исключительно банковским переводом на основании сторно-накладной." },
        ],
      },
      {
        heading: "8. Техническая поддержка",
        blocks: [
          { type: "p", text: "Команда Inter Bus готова ответить на любые вопросы об идентификации деталей, совместимости или гарантии. Отвечаем в рабочие дни в течение 24 часов. Для профессиональных автопарков предусмотрена приоритетная техническая поддержка." },
        ],
      },
    ],
  },
};

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
