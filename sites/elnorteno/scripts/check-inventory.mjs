import fs from "fs";

const ENV = {};
for (const line of fs
  .readFileSync("sites/elnorteno/.env", "utf-8")
  .split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) ENV[m[1]] = m[2].trim();
}

const handle = "18pow-fuente-de-24v-mikrotik-con-08-amperios";

// Admin GraphQL - check inventory details
const adminQuery = `
  query {
    productByHandle(handle: "${handle}") {
      id
      title
      status
      variants(first: 10) {
        edges {
          node {
            id
            title
            inventoryQuantity
            inventoryManagement
            inventoryPolicy
            availableForSale
          }
        }
      }
    }
  }
`;

const adminRes = await fetch(
  `https://${ENV.SHOPIFY_STORE_DOMAIN}/admin/api/${ENV.SHOPIFY_API_VERSION || "2025-10"}/graphql.json`,
  {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": ENV.SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: adminQuery }),
  },
);
const adminData = await adminRes.json();
console.log(
  "Admin GraphQL:",
  JSON.stringify(adminData.data?.productByHandle, null, 2),
);

// Compare with a product that IS visible in Storefront
const handle2 =
  "cana-combo-shakespeare-wild-series-walleye-combo-wildwye662m30";
const adminQuery2 = `
  query {
    productByHandle(handle: "${handle2}") {
      id
      title
      status
      publishedOnPublication(publicationId: "gid://shopify/Publication/129675362375")
      variants(first: 10) {
        edges {
          node {
            id
            title
            inventoryQuantity
            inventoryManagement
            inventoryPolicy
            availableForSale
          }
        }
      }
    }
  }
`;

const adminRes2 = await fetch(
  `https://${ENV.SHOPIFY_STORE_DOMAIN}/admin/api/${ENV.SHOPIFY_API_VERSION || "2025-10"}/graphql.json`,
  {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": ENV.SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: adminQuery2 }),
  },
);
const adminData2 = await adminRes2.json();
console.log(
  "\nVisible product:",
  JSON.stringify(adminData2.data?.productByHandle, null, 2),
);
