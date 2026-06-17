import type { APIRoute } from "astro";
import { getCachedProducts } from "../../lib/build-data";

const SITE_URL = "https://elnorteno.com";
const SAFE_COLLECTIONS = new Set([
  "pesca",
  "canas-de-spinning",
  "canas-de-casting",
  "canas-para-pesca",
  "combos-cana-para-pesca",
  "combos-spinning",
  "molinetes-de-pesca",
  "molinetes-de-spinning",
  "molinetes-de-casting",
  "molinetes-de-mosqueo",
  "senuelos-y-carnadas",
  "suaves",
  "duras",
  "nylon-para-pesca",
  "fluorocarbono",
  "monofilamento",
  "anzuelos",
  "jigs",
  "terminales-para-pesca",
  "uniones",
  "bass-pro-shops",
  "junnie-s-cat-tracker",
  "yo-zuri",
  "berkley",
  "berkley-1",
  "creme",
  "netbait",
  "calcutta",
  "yamamoto",
  "camping",
  "colchones-inflables-y-colchonetas",
  "nueva-importacion-camping",
]);

const SENSITIVE_COLLECTIONS = new Set([
  "caza",
  "armas-de-aire",
  "rifles-de-aire-comprimido",
  "tiro-deportivo",
  "pistolas",
  "arqueria",
]);

const SENSITIVE_TERMS = [
  "arma",
  "armas",
  "rifle",
  "rifles",
  "pistola",
  "pistolas",
  "revolver",
  "revólver",
  "escopeta",
  "municion",
  "munición",
  "diabolo",
  "diábolo",
  "poston",
  "postón",
  "balin",
  "balín",
  "crosman",
  "gamo",
  "sig sauer",
  "colt",
  "smith wesson",
  "smith & wesson",
  "navaja",
  "navajas",
  "cuchillo",
  "cuchillos",
  "machete",
  "arco",
  "ballesta",
  "flecha",
  "caza",
  "polvora",
  "pólvora",
  "field box",
  "iniciador de fuego",
  "magnesio",
];

// Numeric Google taxonomy IDs avoid Merchant Center text-label mismatches.
// Source checked: https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
const GOOGLE_CATEGORY_BY_COLLECTION: Array<[string, string]> = [
  ["canas", "4927"], // Fishing Rods
  ["molinetes", "4926"], // Fishing Reels
  ["senuelos", "3603"], // Fishing Baits & Lures
  ["carnada", "3603"],
  ["anzuelos", "3359"], // Fishing Hooks
  ["jigs", "3603"],
  ["terminales", "499823"], // Fishing Tackle
  ["uniones", "7222"], // Fishing Snaps & Swivels
  ["nylon", "1037"], // Fishing Lines & Leaders
  ["fluorocarbono", "1037"],
  ["monofilamento", "1037"],
  ["pesca", "3334"], // Fishing
  ["camping", "1013"], // Camping & Hiking
];

function sanitizeText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, " ")
    .replace(/[\uD800-\uDFFF]/g, "")
    .replace(/�/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function escapeXml(value: unknown): string {
  return sanitizeText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function stripHtml(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trim()}…` : value;
}

function titleCase(value: unknown): string {
  const original = sanitizeText(value);
  if (!original) return original;
  const letters = original.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, "");
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, "").length;
  const isMostlyUpper = letters.length >= 4 && upper / letters.length > 0.75;
  if (!isMostlyUpper) return original;

  const keepUpper = new Set(["3d", "3db", "gps", "uv", "led", "xl", "xxl", "usa"]);
  const lowerWords = new Set(["de", "del", "la", "las", "el", "los", "y", "para", "por", "con", "en"]);

  return original.toLocaleLowerCase("es-CO").replace(/[\p{L}\p{N}][\p{L}\p{N}'´-]*/gu, (word, offset) => {
    if (keepUpper.has(word)) return word.toUpperCase();
    if (/^\d/.test(word)) return word.toUpperCase();
    if (offset > 0 && lowerWords.has(word)) return word;
    return word.charAt(0).toLocaleUpperCase("es-CO") + word.slice(1);
  });
}

function normalizeText(value: unknown): string {
  return String(value ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function hasSensitiveTerm(value: string): boolean {
  return SENSITIVE_TERMS.some((term) => {
    const normalizedTerm = normalizeText(term).replace(/&/g, " ").replace(/\s+/g, " ").trim();
    if (!normalizedTerm) return false;
    const pattern = normalizedTerm.includes(" ")
      ? new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedTerm).replace(/\\ /g, "\\s+")}([^a-z0-9]|$)`, "i")
      : new RegExp(`(^|[^a-z0-9])${escapeRegExp(normalizedTerm)}([^a-z0-9]|$)`, "i");
    return pattern.test(value);
  });
}

function productCollections(product: any): string[] {
  return Array.isArray(product.collections) ? product.collections : [];
}

function isPolicySafe(product: any): boolean {
  const collections = productCollections(product).map(normalizeText);
  if (!collections.some((c) => SAFE_COLLECTIONS.has(c))) return false;
  if (collections.some((c) => SENSITIVE_COLLECTIONS.has(c))) return false;

  const searchable = normalizeText([
    product.title,
    product.handle,
    product.productType,
    product.vendor,
    product.description,
    product.descriptionHtml,
    Array.isArray(product.tags) ? product.tags.join(" ") : "",
    collections.join(" "),
  ].join(" "));

  return !hasSensitiveTerm(searchable);
}

function primaryCollection(product: any): string {
  const collections = productCollections(product);
  return collections.find((c) => SAFE_COLLECTIONS.has(normalizeText(c))) ?? collections[0] ?? "general";
}

function googleCategory(product: any): string {
  const text = normalizeText([product.title, product.productType, product.handle, productCollections(product).join(" ")].join(" "));
  return GOOGLE_CATEGORY_BY_COLLECTION.find(([needle]) => text.includes(needle))?.[1]
    ?? "1011"; // Sporting Goods > Outdoor Recreation
}

function productPrice(product: any): number {
  const variantPrice = Number.parseFloat(product.variants?.[0]?.price?.amount ?? "");
  const rootPrice = Number.parseFloat(product.price ?? "");
  const price = Number.isFinite(variantPrice) ? variantPrice : rootPrice;
  return Number.isFinite(price) ? price : 0;
}

function productImage(product: any): any {
  return product.featuredImage || product.images?.[0] || null;
}

function hasMerchantQualityImage(product: any): boolean {
  const image = productImage(product);
  if (!image?.url) return false;
  const width = Number(image.width ?? 0);
  const height = Number(image.height ?? 0);
  return !width || !height || (width >= 500 && height >= 500);
}

function merchantImageUrl(url: string): string {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("cdn.shopify.com")) {
      parsed.searchParams.set("width", "1000");
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function itemXml(product: any): string {
  const variant = product.variants?.[0] ?? {};
  const price = Math.round(productPrice(product));
  const title = truncate(titleCase(product.title), 150);
  const description = truncate(sanitizeText(stripHtml(product.descriptionHtml || product.description || product.title)), 5000);
  const brand = sanitizeText(product.vendor || "El Norteño");
  const collection = primaryCollection(product);
  const image = merchantImageUrl(productImage(product)?.url || "");
  const availability = product.availableForSale && variant.availableForSale !== false ? "in_stock" : "out_of_stock";

  const fields: Array<[string, string | number | undefined]> = [
    ["g:id", sanitizeText(product.handle)],
    ["g:title", title],
    ["g:description", description || title],
    ["g:link", `${SITE_URL}/products/${product.handle}/`],
    ["g:image_link", image],
    ["g:availability", availability],
    ["g:price", `${price} COP`],
    ["g:brand", truncate(brand, 70)],
    ["g:condition", "new"],
    ["g:product_type", collection],
    ["g:google_product_category", googleCategory(product)],
    ["g:identifier_exists", "no"],
    ["g:custom_label_0", "merchant_safe_initial_feed"],
    ["g:custom_label_1", collection],
  ];

  return [
    "    <item>",
    ...fields
      .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== "")
      .map(([key, value]) => `      <${key}>${escapeXml(value)}</${key}>`),
    "    </item>",
  ].join("\n");
}

export const GET: APIRoute = async () => {
  const products = await getCachedProducts();
  const safeProducts = (products as any[])
    .filter((product) => product.availableForSale)
    .filter((product) => productPrice(product) > 0)
    .filter(hasMerchantQualityImage)
    .filter(isPolicySafe)
    .sort((a, b) => String(a.title).localeCompare(String(b.title), "es"));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>El Norteño — Google Merchant policy-safe feed</title>
    <link>${SITE_URL}</link>
    <description>Feed inicial para Google Merchant Center con productos de pesca, camping y outdoor de bajo riesgo. Productos sensibles se excluyen por política.</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${safeProducts.map(itemXml).join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
