/**
 * Estructura jerárquica de categorías El Norteño.
 * Shopify no tiene jerarquía nativa: mapeamos los handles reales a 5 categorías
 * principales (basadas en elnorteno.com).
 */

export interface MainCategory {
  title: string;
  parentHandle: string | null;
  subs: { handle: string; title: string }[];
}

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    title: "Pesca",
    parentHandle: "pesca",
    subs: [
      { handle: "canas-para-pesca", title: "Cañas" },
      { handle: "canas-de-spinning", title: "Cañas de spinning" },
      { handle: "canas-de-casting", title: "Cañas de casting" },
      { handle: "combos-cana-para-pesca", title: "Combos caña" },
      { handle: "combos-spinning", title: "Combos spinning" },
      { handle: "molinetes-de-pesca", title: "Molinetes" },
      { handle: "molinetes-de-spinning", title: "Molinetes spinning" },
      { handle: "molinetes-de-casting", title: "Molinetes casting" },
      { handle: "molinetes-de-mosqueo", title: "Molinetes mosqueo" },
      { handle: "anzuelos", title: "Anzuelos" },
      { handle: "jigs", title: "Jigs" },
      { handle: "senuelos-y-carnadas", title: "Señuelos y carnadas" },
      { handle: "duras", title: "Duras" },
      { handle: "suaves", title: "Suaves" },
      { handle: "nylon-para-pesca", title: "Nylon" },
      { handle: "monofilamento", title: "Monofilamento" },
      { handle: "fluorocarbono", title: "Fluorocarbono" },
      { handle: "terminales-para-pesca", title: "Terminales" },
      { handle: "uniones", title: "Uniones" },
      { handle: "herramientas-alicates-y-otros", title: "Herramientas" },
    ],
  },
  {
    title: "Camping",
    parentHandle: "camping",
    subs: [
      {
        handle: "colchones-inflables-y-colchonetas",
        title: "Colchones y colchonetas",
      },
      { handle: "nueva-importacion-camping", title: "Nueva importación" },
    ],
  },
  {
    title: "Tiro Deportivo",
    parentHandle: "tiro-deportivo",
    subs: [
      { handle: "armas-de-aire", title: "Armas de aire" },
      {
        handle: "rifles-de-aire-comprimido",
        title: "Rifles de aire comprimido",
      },
    ],
  },
  {
    title: "Outdoor",
    parentHandle: "outdoor",
    subs: [
      {
        handle: "nueva-importacion-outdoor",
        title: "Nueva importación outdoor",
      },
      { handle: "herramientas-alicates-y-otros", title: "Herramientas" },
      { handle: "calcutta", title: "Calcutta" },
      { handle: "bass-pro-shops", title: "Bass Pro Shops" },
      { handle: "creme", title: "Creme" },
      { handle: "yamamoto", title: "Yamamoto" },
      { handle: "netbait", title: "Netbait" },
      { handle: "junnie-s-cat-tracker", title: "Junnie's Cat Tracker" },
    ],
  },
  {
    title: "Otros",
    parentHandle: "otros",
    subs: [],
  },
];

/**
 * Filtra MAIN_CATEGORIES dejando solo las subs cuyos handles existen en `availableHandles`.
 * Las main que queden sin subs ni parent se omiten.
 */
export function buildNavCategories(
  availableHandles: Set<string>,
): MainCategory[] {
  return MAIN_CATEGORIES.map((cat) => ({
    ...cat,
    subs: cat.subs.filter((s) => availableHandles.has(s.handle)),
  })).filter(
    (cat) =>
      (cat.parentHandle && availableHandles.has(cat.parentHandle)) ||
      cat.subs.length > 0,
  );
}

export interface StoreLocation {
  city: string;
  address: string;
  phones: string[];
  whatsapp: string;
  whatsappDisplay: string;
}

export const STORE_LOCATIONS: StoreLocation[] = [
  {
    city: "Bucaramanga",
    address: "Cr 15 No 28-15",
    phones: ["(7) 698 4646", "(7) 630 3648"],
    whatsapp: "573156819303",
    whatsappDisplay: "315 681 93 03",
  },
  {
    city: "Medellín",
    address: "Cr 43 No 31-183, Galerías de San Diego",
    phones: ["(4) 580 6660", "(4) 580 6300"],
    whatsapp: "573166829593",
    whatsappDisplay: "316 682 95 93",
  },
  {
    city: "Valledupar",
    address: "Carrera 7 No 19A-06",
    phones: ["(5) 580 2930", "(5) 590 1313"],
    whatsapp: "573157956818",
    whatsappDisplay: "315 795 68 18",
  },
];

export function googleMapsUrl(address: string, city: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address}, ${city}, Colombia`)}`;
}
