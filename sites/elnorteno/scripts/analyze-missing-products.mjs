import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";

const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "elnorteno.myshopify.com";
const VERSION = process.env.SHOPIFY_API_VERSION || "2025-10";

if (!TOKEN) {
  console.error("Error: define SHOPIFY_ADMIN_TOKEN en .env");
  process.exit(1);
}

const IMPORT_CSV = path.resolve("data/shopify-import-corrected.csv");

async function getAllDraftHandles() {
  const handles = new Set();
  let url = `https://${DOMAIN}/admin/api/${VERSION}/products.json?status=draft&limit=250&fields=handle`;
  let page = 0;
  while (url && page < 100) {
    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": TOKEN },
    });
    const data = await res.json();
    for (const p of data.products || []) handles.add(p.handle);
    const link = res.headers.get("link");
    url = null;
    if (link) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      if (match) url = match[1];
    }
    page++;
    if ((data.products || []).length === 0) break;
  }
  return handles;
}

async function main() {
  const csvText = fs.readFileSync(IMPORT_CSV, "utf-8");
  const rows = parse(csvText, { columns: true, skip_empty_lines: true });

  console.log("Obteniendo handles de Shopify...");
  const shopifyHandles = await getAllDraftHandles();

  const missing = rows.filter((r) => !shopifyHandles.has(r.Handle));
  console.log(`\n=== ${missing.length} PRODUCTOS FALTANTES ===\n`);

  for (const row of missing) {
    console.log("Handle:", row.Handle);
    console.log("  Title:", row.Title);
    console.log("  Vendor:", row.Vendor);
    console.log("  Type:", row["Product Category"] || row.Type);
    console.log("  SKU:", row["Variant SKU"]);
    console.log("  Price:", row["Variant Price"]);
    console.log(
      "  Body HTML:",
      row["Body (HTML)"]
        ? row["Body (HTML)"].substring(0, 80) + "..."
        : "(vacío)",
    );
    console.log("  Tags:", row.Tags);
    console.log("---");
  }

  // Check data completeness of ALL products
  console.log("\n=== COMPLETITUD DE DATOS EN CSV ===\n");
  const hasBody = rows.filter(
    (r) => r["Body (HTML)"] && r["Body (HTML)"].trim().length > 10,
  ).length;
  const hasVendor = rows.filter((r) => r.Vendor && r.Vendor.trim()).length;
  const hasType = rows.filter(
    (r) =>
      (r["Product Category"] || r.Type) &&
      (r["Product Category"] || r.Type).trim(),
  ).length;
  const hasTags = rows.filter((r) => r.Tags && r.Tags.trim()).length;
  const hasPrice = rows.filter(
    (r) => r["Variant Price"] && parseFloat(r["Variant Price"]) > 0,
  ).length;
  const hasWeight = rows.filter(
    (r) => r["Variant Grams"] && parseFloat(r["Variant Grams"]) > 0,
  ).length;

  console.log(`Total productos: ${rows.length}`);
  console.log(
    `Con descripción (>10 chars): ${hasBody} (${((hasBody / rows.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Con vendor: ${hasVendor} (${((hasVendor / rows.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Con tipo/categoría: ${hasType} (${((hasType / rows.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Con tags: ${hasTags} (${((hasTags / rows.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Con precio: ${hasPrice} (${((hasPrice / rows.length) * 100).toFixed(1)}%)`,
  );
  console.log(
    `Con peso: ${hasWeight} (${((hasWeight / rows.length) * 100).toFixed(1)}%)`,
  );
}

main().catch((e) => {
  console.error("❌ Error:", e);
  process.exit(1);
});
