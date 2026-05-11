import type { Category, Locale, Product } from "./types";

/**
 * Fallback data used when the Supabase catalog is empty (early migration)
 * or when the request is not authenticated. Will be phased out as real
 * products/categories are seeded.
 */

type LocalizedName = Record<Locale, string>;

const CATEGORY_NAMES: Record<string, LocalizedName> = {
  brakes: { ro: "Frâne", en: "Brakes", ru: "Тормоза" },
  engine: { ro: "Motor", en: "Engine", ru: "Двигатель" },
  chassis: { ro: "Șasiu și suspensie", en: "Chassis & suspension", ru: "Шасси и подвеска" },
  electro: { ro: "Electro", en: "Electro", ru: "Электро" },
  "air-pressure": { ro: "Aer comprimat", en: "Air pressure", ru: "Пневмосистема" },
  clutch: { ro: "Ambreiaj și cutie", en: "Clutch & gearbox", ru: "Сцепление и КПП" },
  steering: { ro: "Direcție și punți", en: "Steering & axle hubs", ru: "Рулевое и мосты" },
  cooling: { ro: "Climă și încălzire", en: "Climate & heating", ru: "Климат и отопление" },
  bodywork: { ro: "Caroserie", en: "Bodywork", ru: "Кузовщина" },
  interior: { ro: "Interior", en: "Interior", ru: "Салон" },
  hoses: { ro: "Furtune silicon", en: "Silicone hoses", ru: "Силиконовые шланги" },
  couplings: { ro: "Cuple pneumatice", en: "Air couplings", ru: "Пневмосоединения" },
};

const PRODUCT_COPY: Record<string, { name: LocalizedName; desc: LocalizedName }> = {
  "placute-frana-fata-van-hool-t916": {
    name: {
      ro: "Plăcuțe frână față Van Hool T916 Acron",
      en: "Front brake pads Van Hool T916 Acron",
      ru: "Тормозные колодки передние Van Hool T916 Acron",
    },
    desc: {
      ro: "Set plăcuțe frână față originale pentru Van Hool T916 Acron. Compatibilitate directă OEM.",
      en: "Original front brake pad set for Van Hool T916 Acron. Direct OEM compatibility.",
      ru: "Оригинальный комплект передних тормозных колодок для Van Hool T916 Acron. Прямая совместимость OEM.",
    },
  },
  "pompa-apa-dd13": {
    name: {
      ro: "Pompă apă motor DD13 / OM457",
      en: "Water pump DD13 / OM457 engine",
      ru: "Водяной насос двигателя DD13 / OM457",
    },
    desc: {
      ro: "Pompă apă OE pentru motor Detroit Diesel DD13 și Mercedes OM457.",
      en: "OE water pump for Detroit Diesel DD13 and Mercedes OM457 engines.",
      ru: "Оригинальный водяной насос для Detroit Diesel DD13 и Mercedes OM457.",
    },
  },
  "filtru-motorina-astronic-12": {
    name: {
      ro: "Filtru motorină Astronic 12 AS-Tronic",
      en: "Diesel filter Astronic 12 AS-Tronic",
      ru: "Топливный фильтр Astronic 12 AS-Tronic",
    },
    desc: {
      ro: "Filtru motorină de înaltă eficiență pentru cutii ZF AS-Tronic.",
      en: "High-efficiency diesel filter for ZF AS-Tronic gearboxes.",
      ru: "Высокоэффективный топливный фильтр для КПП ZF AS-Tronic.",
    },
  },
  "senzor-abs-fata": {
    name: {
      ro: "Senzor ABS față punte directoare",
      en: "ABS sensor front steering axle",
      ru: "Датчик ABS передней управляемой оси",
    },
    desc: {
      ro: "Senzor inductiv ABS pentru puntea directoare. Semnal testat pe stand.",
      en: "Inductive ABS sensor for steering axle. Bench-tested signal.",
      ru: "Индуктивный датчик ABS для управляемой оси. Сигнал проверен на стенде.",
    },
  },
  "amortizor-spate-tn-scania-irizar": {
    name: {
      ro: "Amortizor spate TN Scania Irizar",
      en: "Rear shock absorber TN Scania Irizar",
      ru: "Амортизатор задний TN Scania Irizar",
    },
    desc: {
      ro: "Amortizor hidraulic spate pentru autocare Scania Irizar PB / i6.",
      en: "Rear hydraulic shock absorber for Scania Irizar PB / i6 coaches.",
      ru: "Задний гидравлический амортизатор для автобусов Scania Irizar PB / i6.",
    },
  },
  "supapa-control-aer-ebs": {
    name: {
      ro: "Supapă control aer EBS",
      en: "EBS air control valve",
      ru: "Клапан управления воздухом EBS",
    },
    desc: {
      ro: "Supapă electronică EBS pentru frână pneumatică. Verificată, garanție 24 luni.",
      en: "Electronic EBS valve for pneumatic brake. Tested, 24-month warranty.",
      ru: "Электронный клапан EBS для пневматического тормоза. Проверен, гарантия 24 мес.",
    },
  },
  "compresor-aer-conditionat-oe": {
    name: {
      ro: "Compresor aer condiționat OE replacement",
      en: "OE replacement A/C compressor",
      ru: "Компрессор кондиционера OE",
    },
    desc: {
      ro: "Compresor AC OE replacement pentru sistem Konvekta / Thermo King.",
      en: "OE A/C compressor for Konvekta / Thermo King systems.",
      ru: "Компрессор кондиционера OE для систем Konvekta / Thermo King.",
    },
  },
  "set-ambreiaj-zf-ecosplit": {
    name: {
      ro: "Set ambreiaj ZF EcoSplit 12 viteze",
      en: "ZF EcoSplit 12-speed clutch set",
      ru: "Комплект сцепления ZF EcoSplit 12 скоростей",
    },
    desc: {
      ro: "Kit complet ambreiaj ZF EcoSplit (disc + placă + rulment).",
      en: "Complete ZF EcoSplit clutch kit (disc + plate + bearing).",
      ru: "Полный комплект сцепления ZF EcoSplit (диск + корзина + выжимной).",
    },
  },
};

type BaseProduct = {
  id: string;
  slug: string;
  partCode: string;
  brand: string;
  price: number;
  oldPrice?: number;
  stockQuantity: number;
  categorySlug: keyof typeof CATEGORY_NAMES;
  weight?: number;
  warrantyMonths?: number;
  isFeatured: boolean;
};

const PRODUCTS: BaseProduct[] = [
  {
    id: "demo-1",
    slug: "placute-frana-fata-van-hool-t916",
    partCode: "814 5225 001",
    brand: "Knorr-Bremse",
    price: 142.5,
    oldPrice: 178.0,
    stockQuantity: 24,
    categorySlug: "brakes",
    weight: 3.2,
    warrantyMonths: 24,
    isFeatured: true,
  },
  {
    id: "demo-2",
    slug: "pompa-apa-dd13",
    partCode: "4722000320",
    brand: "Wabco",
    price: 289.0,
    stockQuantity: 8,
    categorySlug: "engine",
    weight: 5.6,
    warrantyMonths: 24,
    isFeatured: true,
  },
  {
    id: "demo-3",
    slug: "filtru-motorina-astronic-12",
    partCode: "A 000 090 93 52",
    brand: "Mann-Filter",
    price: 28.9,
    stockQuantity: 42,
    categorySlug: "engine",
    weight: 0.4,
    warrantyMonths: 12,
    isFeatured: true,
  },
  {
    id: "demo-4",
    slug: "senzor-abs-fata",
    partCode: "4410328160",
    brand: "Wabco",
    price: 89.5,
    stockQuantity: 3,
    categorySlug: "electro",
    weight: 0.3,
    warrantyMonths: 24,
    isFeatured: true,
  },
  {
    id: "demo-5",
    slug: "amortizor-spate-tn-scania-irizar",
    partCode: "1422 9651",
    brand: "Sachs",
    price: 215.0,
    oldPrice: 259.0,
    stockQuantity: 12,
    categorySlug: "chassis",
    weight: 4.1,
    warrantyMonths: 24,
    isFeatured: true,
  },
  {
    id: "demo-6",
    slug: "supapa-control-aer-ebs",
    partCode: "4802060020",
    brand: "Knorr-Bremse",
    price: 196.0,
    stockQuantity: 15,
    categorySlug: "air-pressure",
    weight: 0.8,
    warrantyMonths: 24,
    isFeatured: true,
  },
  {
    id: "demo-7",
    slug: "compresor-aer-conditionat-oe",
    partCode: "2 447 222 509",
    brand: "Bosch",
    price: 548.0,
    stockQuantity: 6,
    categorySlug: "cooling",
    weight: 8.2,
    warrantyMonths: 24,
    isFeatured: true,
  },
  {
    id: "demo-8",
    slug: "set-ambreiaj-zf-ecosplit",
    partCode: "3192 7010 1",
    brand: "ZF",
    price: 1290.0,
    stockQuantity: 0,
    categorySlug: "clutch",
    weight: 28.0,
    warrantyMonths: 24,
    isFeatured: true,
  },
];

const CATEGORY_COUNTS: Record<string, number> = {
  brakes: 842,
  engine: 651,
  chassis: 514,
  electro: 463,
  "air-pressure": 398,
  clutch: 327,
  steering: 289,
  cooling: 245,
  bodywork: 412,
  interior: 186,
  hoses: 94,
  couplings: 178,
};

function localizedProduct(base: BaseProduct, locale: Locale): Product {
  const copy = PRODUCT_COPY[base.slug];
  const qty = base.stockQuantity;
  const stock = qty <= 0 ? "out_of_stock" : qty < 5 ? "low_stock" : "in_stock";
  return {
    id: base.id,
    slug: base.slug,
    partCode: base.partCode,
    brand: base.brand,
    name: copy?.name[locale] ?? base.slug,
    description: copy?.desc[locale],
    price: base.price,
    listPrice: base.price,
    promoPrice: null,
    isPromo: false,
    oldPrice: base.oldPrice,
    stock,
    stockQuantity: qty,
    categoryId: null,
    categorySlug: base.categorySlug,
    imageUrl: null,
    images: [],
    illustration: illustrationFromCategory(base.categorySlug),
    weight: base.weight ?? null,
    width: null,
    height: null,
    length: null,
    ribCount: null,
    customSpecs: [],
    warrantyMonths: base.warrantyMonths ?? null,
    isFeatured: base.isFeatured,
  };
}

function illustrationFromCategory(slug: string): Product["illustration"] {
  const map: Record<string, Product["illustration"]> = {
    brakes: "brake",
    engine: "engine",
    chassis: "chassis",
    electro: "electro",
    "air-pressure": "air",
    clutch: "clutch",
    steering: "steering",
    cooling: "cooling",
    bodywork: "body",
    interior: "interior",
    hoses: "hoses",
    couplings: "couplings",
  };
  // Override: some product slugs imply more specific illustrations
  return map[slug] ?? "engine";
}

// Finer per-product illustration override for the featured grid
const OVERRIDE_ILLUSTRATION: Partial<Record<string, Product["illustration"]>> = {
  "demo-3": "filter",
  "demo-4": "sensor",
  "demo-2": "pump",
};

export const demo = {
  products(locale: Locale, opts?: { featuredOnly?: boolean; limit?: number }): Product[] {
    let list = PRODUCTS.map((p) => localizedProduct(p, locale)).map((p) => ({
      ...p,
      illustration: OVERRIDE_ILLUSTRATION[p.id] ?? p.illustration,
    }));
    if (opts?.featuredOnly) list = list.filter((p) => p.isFeatured);
    if (opts?.limit) list = list.slice(0, opts.limit);
    return list;
  },
  productBySlug(slug: string, locale: Locale): Product | null {
    const base = PRODUCTS.find((p) => p.slug === slug);
    if (!base) return null;
    const p = localizedProduct(base, locale);
    return { ...p, illustration: OVERRIDE_ILLUSTRATION[p.id] ?? p.illustration };
  },
  categories(locale: Locale): Category[] {
    return Object.entries(CATEGORY_NAMES).map(([slug, names], i) => ({
      id: `demo-cat-${slug}`,
      slug,
      name: names[locale],
      parentId: null,
      sortOrder: i,
      productCount: CATEGORY_COUNTS[slug] ?? 0,
      iconKey: illustrationFromCategory(slug),
      imageUrl: null,
    }));
  },
};
