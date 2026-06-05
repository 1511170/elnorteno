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
const REST_ENDPOINT = `https://${DOMAIN}/admin/api/${API_VERSION}`;

async function getCollections() {
  const res = await fetch(
    `${REST_ENDPOINT}/custom_collections.json?limit=250`,
    {
      headers: { "X-Shopify-Access-Token": TOKEN },
    },
  );
  const data = await res.json();
  return data.custom_collections || [];
}

async function publishCollection(id) {
  const res = await fetch(`${REST_ENDPOINT}/custom_collections/${id}.json`, {
    method: "PUT",
    headers: {
      "X-Shopify-Access-Token": TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      custom_collection: {
        id: id,
        published: true,
      },
    }),
  });
  const text = await res.text();
  try {
    return { status: res.status, data: JSON.parse(text) };
  } catch {
    return { status: res.status, data: { raw: text.slice(0, 500) } };
  }
}

const collections = await getCollections();
console.log("Total collections:", collections.length);

const targets = ["outdoor", "caza"];
for (const handle of targets) {
  const col = collections.find((c) => c.handle === handle);
  if (!col) {
    console.log(`NOT FOUND: ${handle}`);
    continue;
  }
  console.log(
    `\n${handle}: id=${col.id}, published=${col.published}, published_at=${col.published_at}`,
  );
  if (!col.published_at) {
    console.log(`  → Publishing ${handle}...`);
    const result = await publishCollection(col.id);
    console.log(`  → Status: ${result.status}`);
    console.log(`  → Response:`, JSON.stringify(result.data, null, 2));
  } else {
    console.log(`  → Already published`);
  }
}
