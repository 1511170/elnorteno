#!/usr/bin/env node
/**
 * Sync Shopify variants from the POS-derived CSV by SKU.
 *
 * Safe defaults:
 * - dry-run unless --apply is passed
 * - only updates existing SKUs unless --create-missing is passed
 * - rate-limit aware sequential REST calls
 * - writes JSON report to data/shopify-sync-*.json
 *
 * Examples:
 *   node scripts/sync-shopify-from-pos-csv.mjs --csv=data/shopify-import-enriched.csv
 *   node scripts/sync-shopify-from-pos-csv.mjs --csv=data/shopify-import-enriched.csv --apply --only-existing
 */

import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';

const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [k, ...v] = arg.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : true];
}));

const cwd = process.cwd();
const csvPath = path.resolve(cwd, args.csv || 'data/shopify-import-enriched.csv');
const reportPath = path.resolve(cwd, args.report || `data/shopify-sync-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
const apply = Boolean(args.apply);
const createMissing = Boolean(args['create-missing']);
const onlyExisting = args['only-existing'] !== false;
const limit = args.limit ? Number(args.limit) : Infinity;
const delayMs = args.delay ? Number(args.delay) : 650;

loadEnv(path.resolve(cwd, '.env'));
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION = process.env.SHOPIFY_API_VERSION || '2025-10';

if (!DOMAIN || !TOKEN) {
  console.error('Missing SHOPIFY_STORE_DOMAIN or SHOPIFY_ACCESS_TOKEN/SHOPIFY_ADMIN_ACCESS_TOKEN');
  process.exit(1);
}

function loadEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}

function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

async function shopifyRest(method, endpoint, body, attempt = 1) {
  const url = endpoint.startsWith('http') ? endpoint : `https://${DOMAIN}/admin/api/${API_VERSION}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': TOKEN,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json = {};
  try { json = text ? JSON.parse(text) : {}; } catch { json = { raw: text }; }
  if (res.status === 429 && attempt <= 6) {
    const retry = Number(res.headers.get('retry-after') || 2);
    await sleep((retry * 1000) + 500);
    return shopifyRest(method, endpoint, body, attempt + 1);
  }
  if (!res.ok) {
    const err = new Error(`Shopify ${method} ${endpoint} failed ${res.status}: ${JSON.stringify(json).slice(0, 500)}`);
    err.status = res.status;
    err.body = json;
    throw err;
  }
  return { json, headers: res.headers };
}

function nextLink(linkHeader) {
  if (!linkHeader) return null;
  const m = linkHeader.match(/<([^>]+)>;\s*rel="next"/);
  return m ? m[1] : null;
}

async function fetchAllProductsBySku() {
  const bySku = new Map();
  let url = `https://${DOMAIN}/admin/api/${API_VERSION}/products.json?limit=250&fields=id,handle,title,status,variants`;
  let pages = 0;
  while (url && pages < 120) {
    const { json, headers } = await shopifyRest('GET', url);
    for (const p of json.products || []) {
      for (const v of p.variants || []) {
        const sku = String(v.sku || '').trim();
        if (!sku) continue;
        if (!bySku.has(sku)) bySku.set(sku, []);
        bySku.get(sku).push({ product: p, variant: v });
      }
    }
    url = nextLink(headers.get('link'));
    pages++;
    if (pages % 10 === 0) console.log(`Fetched ${pages} Shopify product pages... SKUs ${bySku.size}`);
    await sleep(120);
  }
  return bySku;
}

async function getPrimaryLocationId() {
  const { json } = await shopifyRest('GET', '/locations.json');
  const locations = (json.locations || []).filter((l) => l.active !== false);
  const preferred = locations.find((l) => /bucaramanga|principal|bodega|pos/i.test(`${l.name} ${l.address1 || ''}`)) || locations[0];
  if (!preferred) throw new Error('No active Shopify location found');
  return { id: preferred.id, name: preferred.name, locations };
}

function readCsvRows(file) {
  const rows = parse(fs.readFileSync(file, 'utf8'), { columns: true, skip_empty_lines: true });
  const bySku = new Map();
  const duplicates = [];
  for (const row of rows) {
    const sku = String(row['Variant SKU'] || '').trim();
    if (!sku) continue;
    if (bySku.has(sku)) duplicates.push(sku);
    bySku.set(sku, row);
  }
  return { rows, bySku, duplicates };
}

function num(v) {
  const n = Number.parseFloat(String(v || '0').replace(/,/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function int(v) { return Math.round(num(v)); }
function priceString(v) { return String(Math.round(num(v))); }

async function main() {
  console.log(`${apply ? 'APPLY' : 'DRY-RUN'} Shopify POS sync`);
  console.log(`CSV: ${csvPath}`);
  const { rows, bySku, duplicates } = readCsvRows(csvPath);
  console.log(`CSV rows: ${rows.length}; unique SKUs: ${bySku.size}; duplicate SKUs: ${duplicates.length}`);

  const shopifyBySku = await fetchAllProductsBySku();
  console.log(`Shopify unique SKUs: ${shopifyBySku.size}`);

  const location = await getPrimaryLocationId();
  console.log(`Primary inventory location: ${location.name} (${location.id})`);

  const report = {
    mode: apply ? 'apply' : 'dry-run',
    csv: csvPath,
    generatedAt: new Date().toISOString(),
    location: { id: location.id, name: location.name },
    counts: { csvRows: rows.length, csvSkus: bySku.size, duplicateSkus: duplicates.length, shopifySkus: shopifyBySku.size },
    updates: [],
    missing: [],
    duplicates: duplicates.slice(0, 1000),
    errors: [],
  };

  for (const [sku, row] of bySku) {
    const matches = shopifyBySku.get(sku) || [];
    if (matches.length === 0) {
      report.missing.push({ sku, title: row.Title, stock: int(row['Variant Inventory Qty']), price: priceString(row['Variant Price']), handle: row.Handle, status: row.Status });
      continue;
    }
    if (matches.length > 1) {
      report.errors.push({ sku, error: 'duplicate Shopify SKU', matches: matches.map((m) => ({ handle: m.product.handle, variantId: m.variant.id })) });
      continue;
    }
    const { product, variant } = matches[0];
    const newPrice = priceString(row['Variant Price']);
    const oldPrice = priceString(variant.price);
    const newQty = int(row['Variant Inventory Qty']);
    const oldQty = variant.inventory_quantity == null ? null : int(variant.inventory_quantity);
    const priceChanged = newPrice !== oldPrice;
    const stockChanged = oldQty !== null && newQty !== oldQty;
    if (!priceChanged && !stockChanged) continue;
    report.updates.push({
      sku, title: row.Title, handle: product.handle, productId: product.id, variantId: variant.id, inventoryItemId: variant.inventory_item_id,
      price: { old: oldPrice, new: newPrice, changed: priceChanged },
      inventory: { old: oldQty, new: newQty, changed: stockChanged },
    });
  }

  report.counts.missing = report.missing.length;
  report.counts.updates = report.updates.length;
  report.counts.priceUpdates = report.updates.filter((u) => u.price.changed).length;
  report.counts.inventoryUpdates = report.updates.filter((u) => u.inventory.changed).length;
  report.counts.missingInStock = report.missing.filter((m) => Number(m.stock) > 0).length;
  console.log('Planned:', report.counts);

  if (apply) {
    let processed = 0;
    for (const u of report.updates.slice(0, limit)) {
      try {
        if (u.price.changed) {
          await shopifyRest('PUT', `/variants/${u.variantId}.json`, { variant: { id: u.variantId, price: u.price.new } });
        }
        if (u.inventory.changed && u.inventoryItemId) {
          await shopifyRest('POST', '/inventory_levels/set.json', {
            location_id: location.id,
            inventory_item_id: u.inventoryItemId,
            available: u.inventory.new,
          });
        }
        u.applied = true;
      } catch (err) {
        u.applied = false;
        report.errors.push({ sku: u.sku, handle: u.handle, error: err.message });
      }
      processed++;
      if (processed % 100 === 0) console.log(`Applied ${processed}/${Math.min(report.updates.length, limit)} updates...`);
      await sleep(delayMs);
    }
    report.counts.applied = report.updates.filter((u) => u.applied).length;
    report.counts.applyErrors = report.errors.length;
  }

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report: ${reportPath}`);
  console.log(JSON.stringify(report.counts, null, 2));

  if (!apply && report.updates.length) {
    console.log('Dry-run only. Re-run with --apply --only-existing to update existing SKUs.');
  }
  if (createMissing) {
    console.log('create-missing is reserved for a separate reviewed phase; no product creation is implemented in this script yet.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
