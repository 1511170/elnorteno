import { PRODUCT_REDIRECTS } from "../generated/product-redirects";

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
  "canas": "store/canas-para-pesca",
  "canas-de-pesca": "store/canas-para-pesca",
  "canas-para-pesca": "store/canas-para-pesca",
  "canas-de-spinning": "store/canas-de-spinning",
  "canas-de-casting": "store/canas-de-casting",
  "combos-cana": "store/combos-cana-para-pesca",
  "combos-cana-para-pesca": "store/combos-cana-para-pesca",
  "combos-spinning": "store/combos-spinning",
  "molinetes": "store/molinetes-de-pesca",
  "molinetes-de-pesca": "store/molinetes-de-pesca",
  "senuelos": "store/senuelos-y-carnadas",
  "senuelos-y-carnadas": "store/senuelos-y-carnadas",
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

function productTarget(rawSlug: string): string {
  const slug = normalizeSlug(rawSlug);
  return `/products/${PRODUCT_REDIRECTS[slug] ?? slug}`;
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
  if (productMatch && productMatch[1] !== "page") return productTarget(productMatch[1]);

  // Old tag/brand/filter archives. Send to store to avoid legacy 404s from indexed facets.
  if (/^\/(?:product-tag|tag|marca|brand|pa_marca|product_brand)\/[^/]+$/.test(cleanPathname)) {
    return "/store";
  }

  // Old WooCommerce category URLs, including nested categories:
  // /product-category/{slug}, /categoria-producto/{parent}/{slug}
  const categoryMatch = cleanPathname.match(/^\/(?:product-category|categoria-producto|categoria)\/(.+)$/);
  if (categoryMatch) {
    const parts = categoryMatch[1].split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? categoryTarget(last) : "/store";
  }

  // Common WordPress/WooCommerce pagination and feeds collapse to index pages.
  if (/^\/(?:shop|tienda)\/page\/\d+$/.test(cleanPathname)) return "/store";
  if (/^\/(?:product-category|categoria-producto|categoria)\/.+\/page\/\d+$/.test(cleanPathname)) {
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
