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

async function fetchAll(url) {
  const res = await fetch(url, {
    headers: { "X-Shopify-Access-Token": TOKEN },
  });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.log("RAW:", text.slice(0, 200));
    return {};
  }
}

const custom = await fetchAll(
  `https://${DOMAIN}/admin/api/${API_VERSION}/custom_collections.json?limit=250`,
);
console.log("=== Custom Collections ===");
(custom.custom_collections || []).forEach((c) =>
  console.log(c.handle, ":", c.title),
);

const smart = await fetchAll(
  `https://${DOMAIN}/admin/api/${API_VERSION}/smart_collections.json?limit=250`,
);
console.log("\n=== Smart Collections ===");
(smart.smart_collections || []).forEach((c) =>
  console.log(c.handle, ":", c.title),
);

const allHandles = [
  ...(custom.custom_collections || []).map((c) => c.handle),
  ...(smart.smart_collections || []).map((c) => c.handle),
];

const expected = ["pesca", "camping", "tiro-deportivo", "outdoor", "caza"];
console.log("\n=== Missing from expected main categories ===");
expected.forEach((h) => {
  if (!allHandles.includes(h)) console.log("MISSING:", h);
});
