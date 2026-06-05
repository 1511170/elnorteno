import fs from "fs";

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
const PUBLICATION_ID_ONLINE_STORE = "gid://shopify/Publication/129675362375";
const PUBLICATION_ID_ADMIN_APP = "gid://shopify/Publication/146016010311";

const CONCURRENCY = 10;
const DELAY_MS = 50;

// ─── 1. Get all unpublished active products ────────────────────────────────
async function getUnpublishedProducts() {
  const products = [];
  let url = `https://${DOMAIN}/admin/api/${API_VERSION}/products.json?published_status=unpublished&status=active&limit=250&fields=id,handle`;
  let page = 0;
  while (url && page < 100) {
    const res = await fetch(url, {
      headers: { "X-Shopify-Access-Token": TOKEN },
    });
    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("retry-after") || "5", 10);
      console.log(`  ⏳ REST rate limited. Waiting ${retryAfter}s...`);
      await sleep(retryAfter * 1000);
      continue;
    }
    const data = await res.json();
    for (const p of data.products || []) {
      products.push({ id: p.id, handle: p.handle });
    }
    const link = res.headers.get("link");
    url = null;
    if (link) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      if (match) url = match[1];
    }
    page++;
    if ((data.products || []).length === 0) break;
    if (page % 5 === 0) {
      console.log(
        `  📄 Fetched page ${page}, total: ${products.length} products`,
      );
    }
  }
  return products;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── 2. Publish a single product via GraphQL Admin API ─────────────────────
async function publishProduct(productId) {
  const gid = `gid://shopify/Product/${productId}`;

  // Publish to Online Store
  const mutation1 = `
    mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        publishable {
          publishedOnPublication(publicationId: "${PUBLICATION_ID_ONLINE_STORE}")
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables1 = {
    id: gid,
    input: [{ publicationId: PUBLICATION_ID_ONLINE_STORE }],
  };

  const res1 = await fetch(
    `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: mutation1, variables: variables1 }),
    },
  );

  if (res1.status === 429) {
    const retryAfter = parseInt(res1.headers.get("retry-after") || "5", 10);
    return { rateLimited: true, retryAfter };
  }

  const data1 = await res1.json();
  const errors1 = data1.data?.publishablePublish?.userErrors || [];
  if (errors1.length > 0) {
    return { success: false, errors: errors1, data: data1 };
  }

  // Publish to Admin App (Storefront API channel)
  const mutation2 = `
    mutation publishablePublish($id: ID!, $input: [PublicationInput!]!) {
      publishablePublish(id: $id, input: $input) {
        publishable {
          publishedOnPublication(publicationId: "${PUBLICATION_ID_ADMIN_APP}")
        }
        userErrors {
          field
          message
        }
      }
    }
  `;
  const variables2 = {
    id: gid,
    input: [{ publicationId: PUBLICATION_ID_ADMIN_APP }],
  };

  const res2 = await fetch(
    `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: mutation2, variables: variables2 }),
    },
  );

  if (res2.status === 429) {
    const retryAfter = parseInt(res2.headers.get("retry-after") || "5", 10);
    return { rateLimited: true, retryAfter };
  }

  const data2 = await res2.json();
  const errors2 = data2.data?.publishablePublish?.userErrors || [];
  return { success: errors2.length === 0, errors: errors2, data: data2 };
}

  const res = await fetch(
    `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: mutation, variables }),
    },
  );

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("retry-after") || "5", 10);
    return { rateLimited: true, retryAfter };
  }

  const data = await res.json();
  const errors = data.data?.publishablePublish?.userErrors || [];
  return { success: errors.length === 0, errors, data };
}

// ─── 3. Process with concurrency limit ─────────────────────────────────────
async function processBatch(items, concurrency) {
  const results = [];
  const executing = new Set();

  for (const item of items) {
    const p = publishProduct(item.id).then((result) => ({ ...result, item }));
    results.push(p);
    executing.add(p);

    p.then(() => executing.delete(p));

    if (executing.size >= concurrency) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

// ─── 4. Main loop ──────────────────────────────────────────────────────────
console.log("=== BULK PUBLISH SCRIPT (optimized) ===");
console.log("Fetching unpublished active products...\n");

const products = await getUnpublishedProducts();
console.log(`\n📦 Total to publish: ${products.length} products\n`);

if (products.length === 0) {
  console.log("✅ No products to publish.");
  process.exit(0);
}

let published = 0;
let failed = 0;
let rateLimited = 0;
const startTime = Date.now();

// Process in chunks to avoid memory issues and show progress
const CHUNK_SIZE = 500;
for (
  let chunkStart = 0;
  chunkStart < products.length;
  chunkStart += CHUNK_SIZE
) {
  const chunk = products.slice(chunkStart, chunkStart + CHUNK_SIZE);
  const results = await processBatch(chunk, CONCURRENCY);

  for (const result of results) {
    if (result.rateLimited) {
      rateLimited++;
      // Re-process this item after delay
      await sleep(result.retryAfter * 1000);
      const retry = await publishProduct(result.item.id);
      if (retry.success) published++;
      else failed++;
    } else if (result.success) {
      published++;
    } else {
      failed++;
      if (failed <= 10) {
        console.log(
          `  ❌ Failed: ${result.item.handle} — ${result.errors.map((e) => e.message).join(", ")}`,
        );
      }
    }
  }

  const processed = Math.min(chunkStart + CHUNK_SIZE, products.length);
  const elapsed = (Date.now() - startTime) / 1000;
  const rate = (processed / elapsed).toFixed(1);
  const remaining = Math.ceil((products.length - processed) / parseFloat(rate));
  console.log(
    `  📊 Progress: ${processed}/${products.length} | ✅ ${published} | ❌ ${failed} | ⏳ ${rate}/s | ETA: ${remaining}s`,
  );

  // Small pause between chunks
  await sleep(500);
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
console.log(
  `\n✅ Done! Published: ${published}, Failed: ${failed}, Rate-limited: ${rateLimited}`,
);
console.log(`⏱ Total time: ${totalTime}s`);
