import { PRODUCT_HANDLES, PRODUCT_REDIRECTS } from "../generated/product-redirects";

const EXACT_REDIRECTS: Record<string, string> = {
  "/shop": "/store",
  "/shop/": "/store",
  "/tienda": "/store",
  "/tienda/": "/store",
  "/catalogo": "/store",
  "/catalogo/": "/store",
  "/contactanos": "/contacto",
  "/contactanos/": "/contacto",
  "/contacto/": "/contacto",
  "/quienes-somos": "/",
  "/quienes-somos/": "/",
  "/sobre-nosotros": "/",
  "/sobre-nosotros/": "/",
  "/mi-cuenta": "/account",
  "/mi-cuenta/": "/account",
  "/cart": "/store",
  "/cart/": "/store",
  "/carrito": "/store",
  "/carrito/": "/store",
  "/checkout": "/store",
  "/checkout/": "/store",
  "/finalizar-compra": "/store",
  "/finalizar-compra/": "/store",
  "/terminos-y-condiciones": "/terminos",
  "/terminos-y-condiciones/": "/terminos",
  "/gracias-por-su-orden": "/",
  "/gracias-por-su-orden/": "/",
  // Brand landing pages from old WordPress site
  "/ubiquiti": "/store/ubiquiti",
  "/ubiquiti/": "/store/ubiquiti",
  "/mikrotik": "/store/mikrotik",
  "/mikrotik/": "/store/mikrotik",
  "/edgemax": "/store/ubiquiti",
  "/edgemax/": "/store/ubiquiti",
  "/airfiber": "/store/ubiquiti",
  "/airfiber/": "/store/ubiquiti",
  "/airvision": "/store/ubiquiti",
  "/airvision/": "/store/ubiquiti",
  "/unifi": "/store/ubiquiti",
  "/unifi/": "/store/ubiquiti",
  // High-impression legacy SEO pages from Search Console.
  // Send exact sensitive-accessory archives to an informational, policy-safe guide.
  "/categoria-productos/tiro-deportivo/accesorios-tiro-deportivo/miras": "/guias/miras-para-rifles-de-aire-colombia",
  "/categoria-productos/tiro-deportivo/accesorios-tiro-deportivo/miras/": "/guias/miras-para-rifles-de-aire-colombia",
  "/categoria-producto/tiro-deportivo/accesorios-tiro-deportivo/miras": "/guias/miras-para-rifles-de-aire-colombia",
  "/categoria-producto/tiro-deportivo/accesorios-tiro-deportivo/miras/": "/guias/miras-para-rifles-de-aire-colombia",
  "/categoria-productos/marcas/gamo": "/store/rifles-de-aire-comprimido",
  "/categoria-productos/marcas/gamo/": "/store/rifles-de-aire-comprimido",
  "/marca/gamo": "/store/rifles-de-aire-comprimido",
  "/marca/gamo/": "/store/rifles-de-aire-comprimido",
};

const CATEGORY_REDIRECTS: Record<string, string> = {
  tienda: "store",
  shop: "store",
  pesca: "store/pesca",
  camping: "store/camping",
  caza: "store/caza",
  outdoor: "store/outdoor",
  "tiro-deportivo": "store/tiro-deportivo",
  "armas-de-aire": "store/armas-de-aire",
  "rifles-de-aire-comprimido": "store/rifles-de-aire-comprimido",
  pistolas: "store/armas-de-aire",
  airsoft: "store/tiro-deportivo",
  "pistolas-de-airsoft": "store/tiro-deportivo",
  "rifles-de-airsoft": "store/tiro-deportivo",
  "arcos-ballestas-y-caucheras": "store/tiro-deportivo",
  arcos: "store/tiro-deportivo",
  ballestas: "store/tiro-deportivo",
  "caucheras-y-cerbatanas": "store/tiro-deportivo",
  "municion-flechas-y-dardos": "store/tiro-deportivo",
  municion: "store/tiro-deportivo",
  "accesorios-tiro-deportivo": "store/tiro-deportivo",
  miras: "store/tiro-deportivo",
  "canas": "store/canas-para-pesca",
  "canas-de-pesca": "store/canas-para-pesca",
  "canas-para-pesca": "store/canas-para-pesca",
  "canas-de-spinning": "store/canas-de-spinning",
  "canas-de-casting": "store/canas-de-casting",
  "combos-cana": "store/combos-cana-para-pesca",
  "combos-cana-para-pesca": "store/combos-cana-para-pesca",
  "combos-spinning": "store/combos-spinning",
  "combos-casting": "store/combos-cana-para-pesca",
  "combos-spincast": "store/combos-cana-para-pesca",
  "combos-mosqueo": "store/combos-cana-para-pesca",
  "molinetes": "store/molinetes-de-pesca",
  "molinetes-de-pesca": "store/molinetes-de-pesca",
  "molinetes-de-spinning": "store/molinetes-de-spinning",
  "molinetes-de-casting": "store/molinetes-de-casting",
  "molinetes-de-mosqueo": "store/molinetes-de-mosqueo",
  "senuelos": "store/senuelos-y-carnadas",
  "senuelos-y-carnadas": "store/senuelos-y-carnadas",
  spinnerbait: "store/senuelos-y-carnadas",
  rapalas: "store/senuelos-y-carnadas",
  cucharas: "store/senuelos-y-carnadas",
  moscas: "store/senuelos-y-carnadas",
  "porta-carnadas": "store/senuelos-y-carnadas",
  mepps: "store/senuelos-y-carnadas",
  "anzuelos": "store/anzuelos",
  "jigs": "store/jigs",
  "nylon": "store/nylon-para-pesca",
  "nylon-para-pesca": "store/nylon-para-pesca",
  "monofilamento": "store/monofilamento",
  "fluorocarbono": "store/fluorocarbono",
  "terminales": "store/terminales-para-pesca",
  "terminales-para-pesca": "store/terminales-para-pesca",
  "colchones": "store/colchones-inflables-y-colchonetas",
  "colchones-inflables": "store/colchones-inflables-y-colchonetas",
  "colchones-inflables-y-colchonetas": "store/colchones-inflables-y-colchonetas",
  "herramientas": "store/herramientas-alicates-y-otros",
  "herramientas-alicates-y-otros": "store/herramientas-alicates-y-otros",
  accesorios: "store/camping",
  carpas: "store/camping",
  "carpas-coleman": "store/camping",
  "morrales-y-loncheras": "store/camping",
  "hieleras-y-termos": "store/camping",
  "estufas-y-asadores": "store/camping",
  "linternas-y-lamparas": "store/camping",
  sleeping: "store/camping",
  "binoculares-y-monoculares": "store/outdoor",
  "cuchillos-y-navajas": "store/outdoor",
  linternas: "store/outdoor",
  gorras: "store/outdoor",
  inflables: "store/outdoor",
  telescopios: "store/outdoor",
  "control-de-plagas": "store/outdoor",
  marcas: "store",
  gamo: "store/armas-de-aire",
  crosman: "store/armas-de-aire",
  coleman: "store/camping",
  promociones: "store",
  "promos-tiro-deportivo": "store/tiro-deportivo",
  "nueva-importacion-tiro-deportivo": "store/tiro-deportivo",
};

function normalizeSlug(value: string): string {
  try {
    value = decodeURIComponent(value);
  } catch {
    // Keep original if URL decoding fails.
  }
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " y ")
    .replace(/\+/g, " plus ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function stripTrailingSlash(pathname: string): string {
  return pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
}

function productTarget(rawSlug: string): string | null {
  const slug = normalizeSlug(rawSlug);
  const target = PRODUCT_REDIRECTS[slug] ?? slug;
  return PRODUCT_HANDLES[target] ? `/products/${target}` : null;
}

function categoryTarget(rawSlug: string): string {
  const slug = normalizeSlug(rawSlug);
  const mapped = CATEGORY_REDIRECTS[slug] ?? `store/${slug}`;
  return mapped.startsWith("/") ? mapped : `/${mapped}`;
}

export function getRedirect(pathname: string): string | null {
  const cleanPathname = stripTrailingSlash(pathname);

  if (EXACT_REDIRECTS[pathname]) return EXACT_REDIRECTS[pathname];
  if (EXACT_REDIRECTS[cleanPathname]) return EXACT_REDIRECTS[cleanPathname];

  // Old WooCommerce product URLs:
  // /product/{slug}, /producto/{slug}, /productos/{slug}, /tienda/{slug}, /shop/{slug}
  const productMatch = cleanPathname.match(/^\/(?:product|producto|productos|tienda|shop)\/([^/]+)$/);
  if (productMatch && productMatch[1] !== "page") return productTarget(productMatch[1]) ?? "/store";

  // Old nested WooCommerce product URLs:
  // /tienda/{category}/{subcategory}/{product-slug}
  // If the final slug matches a current/aliased product, preserve product intent.
  // Otherwise collapse to the nearest known category/store instead of 301ing to a missing PDP.
  const nestedProductMatch = cleanPathname.match(/^\/(?:tienda|shop)\/(.+)$/);
  if (nestedProductMatch) {
    const parts = nestedProductMatch[1].split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    if (last === "page") return "/store";
    const product = last ? productTarget(last) : null;
    if (product) return product;
    for (let index = parts.length - 2; index >= 0; index--) {
      const category = categoryTarget(parts[index]);
      if (category !== `/store/${normalizeSlug(parts[index])}`) return category;
    }
    return "/store";
  }

  // Old tag/brand/filter archives. Known brand/category slugs go to the closest store collection;
  // unknown faceted archives still collapse to /store to avoid legacy 404s.
  const archiveMatch = cleanPathname.match(/^\/(?:product-tag|tag|marca|brand|pa_marca|product_brand)\/([^/]+)$/);
  if (archiveMatch) {
    const category = categoryTarget(archiveMatch[1]);
    return category === `/store/${normalizeSlug(archiveMatch[1])}` ? "/store" : category;
  }

  // Old WooCommerce category URLs, including nested categories:
  // /product-category/{slug}, /categoria-producto/{parent}/{slug}
  const categoryMatch = cleanPathname.match(/^\/(?:product-category|categoria-producto|categoria-productos|categoria)\/(.+)$/);
  if (categoryMatch) {
    const parts = categoryMatch[1].split("/").filter(Boolean);
    const pageIndex = parts.indexOf("page");
    const candidate = pageIndex > 0 ? parts[pageIndex - 1] : parts[parts.length - 1];
    return candidate ? categoryTarget(candidate) : "/store";
  }

  // Common WordPress/WooCommerce pagination and feeds collapse to index pages.
  if (/^\/(?:shop|tienda)\/page\/\d+$/.test(cleanPathname)) return "/store";
  if (/^\/(?:product-category|categoria-producto|categoria-productos|categoria)\/.+\/page\/\d+$/.test(cleanPathname)) {
    const parts = cleanPathname.split("/").filter(Boolean);
    const pageIndex = parts.indexOf("page");
    const candidate = pageIndex > 1 ? parts[pageIndex - 1] : parts[parts.length - 1];
    return categoryTarget(candidate);
  }
  if (/^\/.+\/(?:feed|feed\/rss|embed)$/.test(cleanPathname)) {
    return cleanPathname.replace(/\/(?:feed|feed\/rss|embed)$/, "") || "/";
  }

  return null;
}
