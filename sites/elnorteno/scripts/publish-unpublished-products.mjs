#!/usr/bin/env node
/**
 * Publish unpublished active Shopify products to both Online Store + Storefront channels.
 * Rate-limit aware, sequential, writes JSON report.
 */
import fs from 'node:fs';
import path from 'node:path';

const cwd = process.cwd();
const reportPath = path.resolve(cwd, 'data/shopify-publish-report.json');
const delayMs = 400;

loadEnv(path.resolve(cwd, '.env'));
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN = process.env.SHOPIFY_ACCESS_TOKEN || process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
const API = process.env.SHOPIFY_API_VERSION || '2025-10';
const PUB_ONLINE = 'gid://shopify/Publication/129675362375';
const PUB_ADMIN = 'gid://shopify/Publication/146016010311';

function loadEnv(f) {
  if (!fs.existsSync(f)) return;
  for (const line of fs.readFileSync(f, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function gql(query, variables, attempt = 1) {
  const res = await fetch(`https://${DOMAIN}/admin/api/${API}/graphql.json`, {
    method: 'POST',
    headers: { 'X-Shopify-Access-Token': TOKEN, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  if (res.status === 429 && attempt <= 6) {
    const retry = Number(res.headers.get('retry-after') || 2);
    await sleep(retry * 1000 + 500);
    return gql(query, variables, attempt + 1);
  }
  const text = await res.text();
  try { return JSON.parse(text); } catch { return { errors: [{ message: text.slice(0, 500) }] }; }
}

async function getUnpublished() {
  const products = [];
  let url = `https://${DOMAIN}/admin/api/${API}/products.json?published_status=unpublished&status=active&limit=250&fields=id,handle`;
  let pages = 0;
  while (url && pages < 100) {
    const res = await fetch(url, { headers: { 'X-Shopify-Access-Token': TOKEN } });
    if (res.status === 429) { await sleep(Number(res.headers.get('retry-after') || 2) * 1000); continue; }
    const data = await res.json();
    for (const p of data.products || []) products.push({ id: p.id, handle: p.handle });
    const link = res.headers.get('link');
    url = null;
    if (link) { const m = link.match(/<([^>]+)>;\s*rel="next"/); if (m) url = m[1]; }
    pages++;
    if (pages % 5 === 0) console.log(`Fetched ${pages} pages, ${products.length} products`);
  }
  return products;
}

const mutation = `mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    publishable { id }
    userErrors { field message }
  }
}`;

async function main() {
  console.log('Fetching unpublished active products...');
  const products = await getUnpublished();
  console.log(`Total to publish: ${products.length}`);

  if (products.length === 0) {
    console.log('Nothing to publish.');
    fs.writeFileSync(reportPath, JSON.stringify({ total: 0, published: 0, errors: 0 }, null, 2));
    return;
  }

  let published = 0, errors = 0;
  const errorDetails = [];

  for (const p of products) {
    const gid = `gid://shopify/Product/${p.id}`;
    let allOk = true;
    for (const pubId of [PUB_ONLINE, PUB_ADMIN]) {
      try {
        const r = await gql(mutation, { id: gid, input: [{ publicationId: pubId }] });
        const ue = r.data?.publishablePublish?.userErrors || [];
        if (ue.length) { allOk = false; }
      } catch (e) {
        allOk = false;
      }
      await sleep(delayMs / 2);
    }
    if (allOk) { published++; } else { errors++; errorDetails.push({ id: p.id, handle: p.handle }); }
    if ((published + errors) % 100 === 0) console.log(`Progress: ${published + errors}/${products.length} (ok ${published}, err ${errors})`);
    await sleep(delayMs / 2);
  }

  const report = { total: products.length, published, errors, errorDetails: errorDetails.slice(0, 100) };
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`DONE: published ${published}/${products.length}; errors ${errors}`);
  console.log(`Report: ${reportPath}`);
}

main().catch(e => { console.error(e); process.exitCode = 1; });
