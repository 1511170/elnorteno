import fs from "fs";
import { parse } from "csv-parse/sync";

const ENV = {};
for (const line of fs
  .readFileSync("sites/elnorteno/.env", "utf-8")
  .split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) ENV[m[1]] = m[2].trim();
}

const TOKEN = ENV.SHOPIFY_ACCESS_TOKEN;
const DOMAIN = ENV.SHOPIFY_STORE_DOMAIN;
const API_VERSION = ENV.SHOPIFY_API_VERSION || "2025-10";
const REST_ENDPOINT = `https://${DOMAIN}/admin/api/${API_VERSION}`;

// Get handles from CSV
const csvText = fs.readFileSync("data/shopify-import-enriched.csv", "utf-8");
const rows = parse(csvText, { columns: true, skip_empty_lines: true });
const targetHandles = new Set();
for (const row of rows) {
  const type = row["Type"] || row["Custom Product Type"] || "";
  if (type === "Outdoor" || type === "Caza") {
    targetHandles.add(row["Handle"]);
  }
}
console.log(`Target handles: ${targetHandles.size}`);

// Get all products from Shopify (including draft)
async function getAllProducts() {
  const products = [];
  let url = `${REST_ENDPOINT}/products.json?limit=250&fields=id,handle,status`;
  let page = 0;
  while (url && page < 100) {
    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": TOKEN },
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      break;
    }
    products.push(...(data.products || []));
    const link = res.headers.get("link");
    url = null;
    if (link) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      if (match) url = match[1];
    }
    page++;
    if ((data.products || []).length === 0) break;
  }
  return products;
}

async function publishProduct(id) {
  const res = await fetch(`${REST_ENDPOINT}/products/${id}.json`, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ product: { id, status: "active" } }),
  });
  return { status: res.status };
}

console.log("Fetching all products...");
const allProducts = await getAllProducts();
console.log(`Total products: ${allProducts.length}`);

const toPublish = allProducts.filter(
  (p) => targetHandles.has(p.handle) && p.status !== "active",
);
console.log(`To publish: ${toPublish.length}`);

let published = 0;
let errors = 0;
for (let i = 0; i < toPublish.length; i++) {
  const p = toPublish[i];
  const result = await publishProduct(p.id);
  if (result.status === 200) {
    published++;
  } else {
    errors++;
    console.log(`  Error ${p.handle}: ${result.status}`);
  }
  if ((i + 1) % 50 === 0)
    console.log(`  Progress: ${i + 1}/${toPublish.length}`);
}

console.log(`\nDone! Published: ${published}, Errors: ${errors}`);
