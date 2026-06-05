import fs from "fs";

const ENV = {};
for (const line of fs
  .readFileSync("sites/elnorteno/.env", "utf-8")
  .split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) ENV[m[1]] = m[2].trim();
}

// Query ALL products and see if our target is there
const sfQuery = `query {
  products(first: 250) {
    edges {
      node {
        handle
        title
      }
    }
  }
}`;

const sfRes = await fetch(
  `https://${ENV.SHOPIFY_STORE_DOMAIN}/api/${ENV.SHOPIFY_API_VERSION || "2025-10"}/graphql.json`,
  {
    method: "POST",
    headers: {
      "X-Shopify-Storefront-Access-Token": ENV.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sfQuery }),
  },
);
const sfData = await sfRes.json();
const handles = sfData.data?.products?.edges?.map((e) => e.node.handle) || [];
console.log("Total products:", handles.length);
console.log(
  "Contains target?",
  handles.includes("18pow-fuente-de-24v-mikrotik-con-08-amperios"),
);
console.log("First 5:", handles.slice(0, 5));
