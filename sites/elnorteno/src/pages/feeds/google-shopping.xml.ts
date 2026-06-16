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

const GOOGLE_CATEGORY_BY_COLLECTION: Array<[string, string]> = [
  ["canas", "Sporting Goods > Outdoor Recreation > Fishing > Fishing Rods"],
  ["molinetes", "Sporting Goods > Outdoor Recreation > Fishing > Fishing Reels"],
  ["senuelos", "Sporting Goods > Outdoor Recreation > Fishing > Fishing Lures"],
  ["anzuelos", "Sporting Goods > Outdoor Recreation > Fishing > Fishing Hooks"],
  ["nylon", "Sporting Goods > Outdoor Recreation > Fishing > Fishing Line"],
  ["fluorocarbono", "Sporting Goods > Outdoor Recreation > Fishing > Fishing Line"],
  ["monofilamento", "Sporting Goods > Outdoor Recreation > Fishing > Fishing Line"],
  ["pesca", "Sporting Goods > Outdoor Recreation > Fishing"],
  ["camping", "Sporting Goods > Outdoor Recreation > Camping & Hiking"],
];

function escapeXml(value: unknown): string {
  return String(value ?? "")
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
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1).trim()}…` : value;
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
    ?? "Sporting Goods > Outdoor Recreation";
}

function productPrice(product: any): number {
  const variantPrice = Number.parseFloat(product.variants?.[0]?.price?.amount ?? "");
  const rootPrice = Number.parseFloat(product.price ?? "");
  const price = Number.isFinite(variantPrice) ? variantPrice : rootPrice;
  return Number.isFinite(price) ? price : 0;
}

function itemXml(product: any): string {
  const variant = product.variants?.[0] ?? {};
  const price = Math.round(productPrice(product));
  const description = truncate(stripHtml(product.descriptionHtml || product.description || product.title), 5000);
  const brand = product.vendor || "El Norteño";
  const collection = primaryCollection(product);
  const image = product.featuredImage?.url || product.images?.[0]?.url || "";
  const availability = product.availableForSale && variant.availableForSale !== false ? "in_stock" : "out_of_stock";

  const fields: Array<[string, string | number | undefined]> = [
    ["g:id", product.handle],
    ["g:title", truncate(product.title, 150)],
    ["g:description", description || product.title],
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
    .filter((product) => product.featuredImage?.url || product.images?.[0]?.url)
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
