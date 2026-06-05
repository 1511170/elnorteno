const TOKEN = process.env.SHOPIFY_ADMIN_TOKEN;
const DOMAIN = process.env.SHOPIFY_STORE_DOMAIN || "elnorteno.myshopify.com";
const VERSION = process.env.SHOPIFY_API_VERSION || "2025-10";

if (!TOKEN) {
  console.error("Error: define SHOPIFY_ADMIN_TOKEN en .env");
  process.exit(1);
}

const newCollections = [
  { title: "Outdoor", handle: "outdoor" },
  { title: "Caza", handle: "caza" },
];

async function collectionExists(handle) {
  const res = await fetch(
    `https://${DOMAIN}/admin/api/${VERSION}/custom_collections.json?handle=${handle}`,
    {
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
    },
  );
  const data = await res.json();
  if (data.custom_collections?.length)
    return { exists: true, type: "custom", id: data.custom_collections[0].id };

  const res2 = await fetch(
    `https://${DOMAIN}/admin/api/${VERSION}/smart_collections.json?handle=${handle}`,
    {
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
    },
  );
  const data2 = await res2.json();
  if (data2.smart_collections?.length)
    return { exists: true, type: "smart", id: data2.smart_collections[0].id };

  return { exists: false };
}

async function createCollection(title, handle) {
  const res = await fetch(
    `https://${DOMAIN}/admin/api/${VERSION}/custom_collections.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        custom_collection: {
          title,
          handle,
          published: true,
        },
      }),
    },
  );
  const data = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(data.errors || data));
  return data.custom_collection;
}

async function main() {
  for (const col of newCollections) {
    const check = await collectionExists(col.handle);
    if (check.exists) {
      console.log(
        `✅ ${col.handle}: ya existe (ID: ${check.id}, tipo: ${check.type})`,
      );
      continue;
    }

    console.log(`🆕 Creando colección: ${col.title} (${col.handle})`);
    try {
      const created = await createCollection(col.title, col.handle);
      console.log(`✅ ${col.handle}: creada con ID ${created.id}`);
    } catch (e) {
      console.error(`❌ ${col.handle}: ${e.message}`);
    }

    await new Promise((r) => setTimeout(r, 500));
  }
}

main();
