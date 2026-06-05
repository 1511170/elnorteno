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
const PUBLICATION_ID_ADMIN_APP = "gid://shopify/Publication/146016010311";

const CONCURRENCY = 10;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function getProductsWithoutAdminApp() {
  const toPublish = [];
  let hasNext = true;
  let cursor = null;
  let page = 0;

  while (hasNext && page < 50) {
    const after = cursor ? `, after: "${cursor}"` : "";
    const query = `
      query {
        products(first: 250${after}) {
          pageInfo { hasNextPage endCursor }
          edges {
            node {
              id
              handle
              title
              publishedOnPublication(publicationId: "${PUBLICATION_ID_ADMIN_APP}")
            }
          }
        }
      }
    `;

    const res = await fetch(
      `https://${DOMAIN}/admin/api/${API_VERSION}/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": TOKEN,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      },
    );

    if (res.status === 429) {
      const retryAfter = parseInt(res.headers.get("retry-after") || "5", 10);
      console.log(`  ⏳ Rate limited. Waiting ${retryAfter}s...`);
      await sleep(retryAfter * 1000);
      continue;
    }

    const data = await res.json();
    const edges = data.data?.products?.edges || [];

    for (const edge of edges) {
      if (!edge.node.publishedOnPublication) {
        toPublish.push({
          id: edge.node.id.replace("gid://shopify/Product/", ""),
          handle: edge.node.handle,
        });
      }
    }

    hasNext = data.data?.products?.pageInfo?.hasNextPage;
    cursor = data.data?.products?.pageInfo?.endCursor;
    page++;

    if (page % 5 === 0) {
      console.log(`  📄 Page ${page}, total to publish: ${toPublish.length}`);
    }
  }

  return toPublish;
}

async function publishProduct(productId) {
  const gid = `gid://shopify/Product/${productId}`;
  const mutation = `
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
  const variables = {
    id: gid,
    input: [{ publicationId: PUBLICATION_ID_ADMIN_APP }],
  };

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

// ─── Main ──────────────────────────────────────────────────────────────────
console.log("=== BULK PUBLISH TO ADMIN APP ===");
console.log("Fetching products not published on Admin App...\n");

const products = await getProductsWithoutAdminApp();
console.log(`\n📦 Total to publish: ${products.length} products\n`);

if (products.length === 0) {
  console.log("✅ No products to publish.");
  process.exit(0);
}

let published = 0;
let failed = 0;
let rateLimited = 0;
const startTime = Date.now();

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

  await sleep(500);
}

const totalTime = ((Date.now() - startTime) / 1000).toFixed(0);
console.log(
  `\n✅ Done! Published: ${published}, Failed: ${failed}, Rate-limited: ${rateLimited}`,
);
console.log(`⏱ Total time: ${totalTime}s`);
