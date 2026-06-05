/**
 * Build-time data cache.
 * Module-level singletons persist across all page renders in the same Astro build
 * process, so Shopify API calls happen only once per build regardless of page count.
 */

import {
  fetchAllProducts,
  fetchAllCollections,
} from "@skills-official/shopify-ecommerce/lib/shopify-fetch";
import {
  mapShopifyProduct,
  mapShopifyCollection,
} from "@skills-official/shopify-ecommerce/lib/product-mapper";
import fs from "fs";
import { parse } from "csv-parse/sync";
import { join } from "path";

function getShopifyOptions() {
  return {
    storeDomain: import.meta.env.SHOPIFY_STORE_DOMAIN as string,
    storefrontAccessToken: import.meta.env
      .SHOPIFY_STOREFRONT_ACCESS_TOKEN as string,
    apiVersion: import.meta.env.SHOPIFY_API_VERSION as string,
  };
}

function getAdminCredentials() {
  return {
    domain: import.meta.env.SHOPIFY_STORE_DOMAIN as string,
    token: import.meta.env.SHOPIFY_ACCESS_TOKEN as string,
    apiVersion: (import.meta.env.SHOPIFY_API_VERSION as string) || "2025-10",
  };
}

let _products: ReturnType<typeof mapShopifyProduct>[] | null = null;
let _collections: ReturnType<typeof mapShopifyCollection>[] | null = null;

// Cache del CSV enriquecido para no leerlo múltiples veces
let _csvOutdoorHandles: Set<string> | null = null;
let _csvCazaHandles: Set<string> | null = null;

function findCsvPath(): string | null {
  let dir = process.cwd();
  for (let i = 0; i < 5; i++) {
    const p = join(dir, "data", "shopify-import-enriched.csv");
    if (fs.existsSync(p)) return p;
    dir = join(dir, "..");
  }
  return null;
}

function getCsvHandles(): { outdoor: Set<string>; caza: Set<string> } {
  if (_csvOutdoorHandles !== null && _csvCazaHandles !== null) {
    return { outdoor: _csvOutdoorHandles, caza: _csvCazaHandles };
  }
  _csvOutdoorHandles = new Set();
  _csvCazaHandles = new Set();
  try {
    const csvPath = findCsvPath();
    if (!csvPath) throw new Error("CSV no encontrado");
    const csvText = fs.readFileSync(csvPath, "utf-8");
    const rows = parse(csvText, { columns: true, skip_empty_lines: true });
    for (const row of rows) {
      const handle = row["Handle"];
      const type = row["Type"] || row["Custom Product Type"] || "";
      if (!handle) continue;
      if (type === "Outdoor") _csvOutdoorHandles.add(handle);
      if (type === "Caza") _csvCazaHandles.add(handle);
    }
    console.log(
      `[build-data] 📄 CSV: ${_csvOutdoorHandles.size} outdoor, ${_csvCazaHandles.size} caza`,
    );
  } catch (e: any) {
    console.warn(
      `[build-data] ⚠️  No se pudo leer CSV enriquecido:`,
      e.message,
    );
  }
  return { outdoor: _csvOutdoorHandles, caza: _csvCazaHandles };
}

/**
 * El Product del skill no expone price/compareAtPrice a nivel raíz — viven en variants[0].
 * Enriquezco aquí para que todos los consumers (cards, search-index, PDPs) los lean directo.
 */
function enrichProduct(p: any) {
  const firstVariant = p.variants?.[0];
  const priceAmount = parseFloat(firstVariant?.price?.amount ?? "0");
  const compareAt = firstVariant?.compareAtPrice?.amount
    ? parseFloat(firstVariant.compareAtPrice.amount)
    : null;
  return {
    ...p,
    price: Number.isFinite(priceAmount) ? priceAmount : 0,
    compareAtPrice: compareAt && Number.isFinite(compareAt) ? compareAt : null,
  };
}

/**
 * Añade colecciones faltantes (outdoor, caza) basándose en los handles del CSV
 * enriquecido, ya que la Storefront API no expone estas colecciones.
 */
function enrichProductCollections(products: any[]) {
  const { outdoor, caza } = getCsvHandles();

  for (const p of products) {
    if (!Array.isArray(p.collections)) p.collections = [];

    if (outdoor.has(p.handle) && !p.collections.includes("outdoor")) {
      p.collections.push("outdoor");
    }
    if (caza.has(p.handle) && !p.collections.includes("caza")) {
      p.collections.push("caza");
    }
  }
}

/**
 * Obtiene productos faltantes desde la REST API de admin y los mapea
 * al formato del frontend.
 */
async function fetchMissingProductsFromRest(
  existingHandles: Set<string>,
): Promise<any[]> {
  const { domain, token, apiVersion } = getAdminCredentials();
  if (!token) return [];

  const { outdoor, caza } = getCsvHandles();
  const targetHandles = new Set([...outdoor, ...caza]);
  const missingHandles = [...targetHandles].filter(
    (h) => !existingHandles.has(h),
  );

  if (missingHandles.length === 0) return [];

  console.log(
    `[build-data] 🔍 Buscando ${missingHandles.length} productos faltantes en REST API...`,
  );

  const missing: any[] = [];

  for (const handle of missingHandles) {
    try {
      const res = await fetch(
        `https://${domain}/admin/api/${apiVersion}/products.json?handle=${handle}&fields=id,handle,title,body_html,vendor,product_type,tags,variants,images`,
        { headers: { "X-Shopify-Access-Token": token } },
      );
      const data = await res.json();
      const p = data.products?.[0];
      if (!p) continue;

      // Mapear al formato del frontend
      const mapped = {
        handle: p.handle,
        title: p.title,
        description: p.body_html?.replace(/<[^>]+>/g, " ")?.trim() || "",
        descriptionHtml: p.body_html || "",
        vendor: p.vendor || "",
        productType: p.product_type || "",
        tags: p.tags || [],
        featuredImage: p.images?.[0]
          ? {
              url: p.images[0].src,
              altText: p.images[0].alt || p.title,
              width: p.images[0].width ?? 800,
              height: p.images[0].height ?? 600,
            }
          : null,
        images:
          p.images?.map((img: any) => ({
            url: img.src,
            altText: img.alt || p.title,
            width: img.width ?? 800,
            height: img.height ?? 600,
          })) || [],
        variants:
          p.variants?.map((v: any) => ({
            id: `gid://shopify/ProductVariant/${v.id}`,
            title: v.title,
            availableForSale: v.inventory_quantity > 0,
            price: {
              amount: String(v.price),
              currencyCode: "COP",
            },
            compareAtPrice: v.compare_at_price
              ? { amount: String(v.compare_at_price), currencyCode: "COP" }
              : null,
            image: null,
            selectedOptions: [],
            sku: v.sku || null,
          })) || [],
        collections: [],
        seo: { title: p.title, description: "" },
        availableForSale:
          p.variants?.some((v: any) => v.inventory_quantity > 0) ?? false,
        metafields: {},
      };

      missing.push(mapped);
    } catch (e: any) {
      // ignora errores individuales
    }
  }

  console.log(
    `[build-data] ✅ ${missing.length} productos faltantes cargados desde REST API`,
  );
  return missing;
}

/**
 * Obtiene colecciones faltantes de la REST API de admin y las mapea
 * al formato que espera el frontend.
 */
async function fetchMissingCollectionsFromRest(): Promise<
  ReturnType<typeof mapShopifyCollection>[]
> {
  const { domain, token, apiVersion } = getAdminCredentials();
  if (!token) return [];

  try {
    const res = await fetch(
      `https://${domain}/admin/api/${apiVersion}/custom_collections.json?limit=250`,
      { headers: { "X-Shopify-Access-Token": token } },
    );
    const text = await res.text();
    const data = JSON.parse(text);
    const storefrontHandles = new Set(
      (_collections || []).map((c: any) => c.handle),
    );

    return (data.custom_collections || [])
      .filter((c: any) => !storefrontHandles.has(c.handle))
      .map((c: any) =>
        mapShopifyCollection({
          handle: c.handle,
          title: c.title,
          description: c.body_html || "",
          image: c.image
            ? {
                url: c.image.src,
                altText: c.image.alt || c.title,
                width: c.image.width ?? 800,
                height: c.image.height ?? 600,
              }
            : null,
        }),
      );
  } catch (e: any) {
    console.warn(
      `[build-data] ⚠️  No se pudieron cargar colecciones adicionales desde REST:`,
      e.message,
    );
    return [];
  }
}

export async function getCachedProducts(): Promise<
  ReturnType<typeof mapShopifyProduct>[]
> {
  if (_products !== null) return _products;
  const opts = getShopifyOptions();
  console.log(
    `[build-data] 🛒 Fetching products from ${opts.storeDomain} (api ${opts.apiVersion})...`,
  );
  const t0 = Date.now();
  try {
    const raw = await fetchAllProducts(opts);
    _products = raw.map(mapShopifyProduct).map(enrichProduct);
    const storefrontHandles = new Set(_products.map((p: any) => p.handle));

    // Añadir productos faltantes desde REST API
    const missing = await fetchMissingProductsFromRest(storefrontHandles);
    if (missing.length > 0) {
      _products = [..._products, ...missing.map(enrichProduct)];
    }

    enrichProductCollections(_products);

    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    if (_products.length === 0) {
      console.warn(
        `[build-data] ⚠️  Shopify devolvió 0 productos en ${dt}s — revisa token / scopes / API version`,
      );
    } else {
      console.log(
        `[build-data] ✅ ${_products.length} productos cargados en ${dt}s`,
      );
    }
  } catch (e: any) {
    console.error(`[build-data] ❌ Error cargando productos:`, e.message);
    if (e.stack) console.error(e.stack.split("\n").slice(0, 5).join("\n"));
    _products = [];
  }
  return _products;
}

export async function getCachedCollections(): Promise<
  ReturnType<typeof mapShopifyCollection>[]
> {
  if (_collections !== null) return _collections;
  const opts = getShopifyOptions();
  console.log(
    `[build-data] 📚 Fetching collections from ${opts.storeDomain}...`,
  );
  const t0 = Date.now();
  try {
    const raw = await fetchAllCollections(opts);
    _collections = raw.map(mapShopifyCollection);
    const dt = ((Date.now() - t0) / 1000).toFixed(1);
    if (_collections.length === 0) {
      console.warn(`[build-data] ⚠️  Shopify devolvió 0 colecciones en ${dt}s`);
    } else {
      console.log(
        `[build-data] ✅ ${_collections.length} colecciones cargadas en ${dt}s`,
      );
    }
  } catch (e: any) {
    console.error(`[build-data] ❌ Error cargando colecciones:`, e.message);
    if (e.stack) console.error(e.stack.split("\n").slice(0, 5).join("\n"));
    _collections = [];
  }

  // Enriquecer con colecciones faltantes desde REST API
  const missing = await fetchMissingCollectionsFromRest();
  if (missing.length > 0) {
    _collections = [..._collections, ...missing];
    console.log(
      `[build-data] ➕ ${missing.length} colección(es) extra desde REST API: ${missing.map((c: any) => c.handle).join(", ")}`,
    );
  }

  return _collections;
}
