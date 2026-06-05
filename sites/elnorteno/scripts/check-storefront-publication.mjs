import fs from "fs";

const ENV = {};
for (const line of fs
  .readFileSync("sites/elnorteno/.env", "utf-8")
  .split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) ENV[m[1]] = m[2].trim();
}

// Get the storefront access token details via Admin API
const query = `
  query {
    storefrontAccessTokens(first: 10) {
      edges {
        node {
          id
          title
          accessToken
          accessScopes {
            handle
          }
          createdAt
        }
      }
    }
  }
`;

const res = await fetch(
  `https://${ENV.SHOPIFY_STORE_DOMAIN}/admin/api/${ENV.SHOPIFY_API_VERSION || "2025-10"}/graphql.json`,
  {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": ENV.SHOPIFY_ACCESS_TOKEN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  },
);
const data = await res.json();
console.log(JSON.stringify(data, null, 2));
