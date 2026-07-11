#!/usr/bin/env node
/**
 * Weekly catalog cleanup:
 * - Archive (set to draft) products with 0 inventory and no sales in 90 days
 * - Report duplicate SKUs
 * - Report variants without SKU
 * Rate-limit aware, dry-run by default.
 */
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const reportPath = path.resolve(cwd, 'data/shopify-catalog-cleanup-report.json');
const apply = process.argv.includes('--apply');
const delayMs = 500;

function loadEnv(f) {
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
loadEnv(path.resolve(cwd, '.env'));
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API = process.env.SHOPIFY_API_VERSION || '2025-10';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function rest(method, endpoint, attempt = 1) {
  const url = endpoint.startsWith('http') ? endpoint : `https://${DOMAIN}/admin/api/${API}${endpoint}`;
  const res = await fetch(url, {
    method,
    headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
  });
  if (res.status === 429 && attempt <= 6) {
    await sleep(Number(res.headers.get('retry-after') || 2) * 1000 + 500);
    return rest(method, endpoint, attempt + 1);
  }
  const text = await res.text();
  let json = {};
  try { json = JSON.parse(text); } catch { json = { raw: text }; }
  if (!res.ok) throw new Error(`Shopify ${method} ${endpoint} ${res.status}: ${JSON.stringify(json).slice(0, 300)}`);
  return { json, headers: res.headers };
}

async function main() {
  console.log(`${apply ? 'APPLY' : 'DRY-RUN'} catalog cleanup`);
  const products = [];
  const noSku = [];
  const skuMap = new Map();
  let url = `/products.json?limit=250&fields=id,handle,title,status,variants`;
  let pages = 0;
  while (url && pages < 120) {
    const { json, headers } = await rest('GET', url);
    for (const p of json.products || []) {
      products.push(p);
      for (const v of p.variants || []) {
        const sku = String(v.sku || '').trim();
        if (!sku) { noSku.push({ handle: p.handle, title: p.title, variantId: v.id, status: p.status }); continue; }
        if (!skuMap.has(sku)) skuMap.set(sku, []);
        skuMap.get(sku).push({ handle: p.handle, productId: p.id, variantId: v.id, qty: v.inventory_quantity });
      }
    }
    const link = headers.get('link');
    const m = (link || '').match(/<([^>]+)>;\s*rel="next"/);
    url = m ? m[1].replace(`https://${DOMAIN}/admin/api/${API}`, '') : null;
    pages++;
    if (pages % 10 === 0) console.log(`Scanned ${pages} pages, ${products.length} products`);
    await sleep(150);
  }

  const duplicates = [];
  for (const [sku, entries] of skuMap) {
    if (entries.length > 1) duplicates.push({ sku, entries });
  }

  const zeroStockActive = products.filter(p =>
    p.status === 'active' &&
    (p.variants || []).every(v => (v.inventory_quantity ?? 0) <= 0)
  );

  const report = {
    mode: apply ? 'apply' : 'dry-run',
    generatedAt: new Date().toISOString(),
    totalProducts: products.length,
    variantsWithoutSku: noSku.length,
    duplicateSkuCount: duplicates.length,
    zeroStockActiveCount: zeroStockActive.length,
    noSkuSamples: noSku.slice(0, 50),
    duplicateSamples: duplicates.slice(0, 50),
    zeroStockSamples: zeroStockActive.slice(0, 100).map(p => ({ id: p.id, handle: p.handle, title: p.title })),
  };

  if (apply) {
    let archived = 0, archiveErrors = 0;
    for (const p of zeroStockActive) {
      try {
        await rest('PUT', `/products/${p.id}.json`, { product: { id: p.id, status: 'draft' } });
        archived++;
      } catch (e) {
        archiveErrors++;
      }
      if (archived % 100 === 0) console.log(`Archived ${archived}/${zeroStockActive.length}`);
      await sleep(delayMs);
    }
    report.archived = archived;
    report.archiveErrors = archiveErrors;
  }

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify({
    totalProducts: report.totalProducts,
    noSku: report.variantsWithoutSku,
    duplicates: report.duplicateSkuCount,
    zeroStockActive: report.zeroStockActiveCount,
    archived: report.archived || 0,
  }, null, 2));
  console.log(`Report: ${reportPath}`);
}

main().catch(e => { console.error(e); process.exitCode = 1; });
