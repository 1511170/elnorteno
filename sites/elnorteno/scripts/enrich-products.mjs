import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";

const IMPORT_CSV = path.resolve("data/shopify-import-corrected.csv");
const OUTPUT_CSV = path.resolve("data/shopify-import-enriched.csv");

const csvText = fs.readFileSync(IMPORT_CSV, "utf-8");
const rows = parse(csvText, { columns: true, skip_empty_lines: true });

// ── Clasificador de tipo de producto ────────────────────────────────────────
function classifyProduct(row) {
  const title = (row.Title || "").toLowerCase();
  const tags = (row.Tags || "")
    .toLowerCase()
    .split(",")
    .map((t) => t.trim());

  // PRIORIDAD 1: Palabras clave EXACTAS en título (más confiable que tags)
  const titleKeywords = [
    // Camping (alta prioridad para no confundir)
    {
      words: [
        "campingaz",
        "colchoneta",
        "colchón",
        "silla camping",
        "mesa camping",
        "saco de dormir",
        "sleeping bag",
        "estufa camping",
        "carpa",
      ],
      type: "Camping",
    },
    // Caza / Tiro (alta prioridad)
    {
      words: [
        "aceite arma",
        "aceite carabina",
        "aceite pistola",
        "rifle",
        "pistola",
        "munición",
        "casco tiro",
        "camo",
        "caza",
        "caceria",
        "diabolo",
        "perdigón",
        "carabina",
        "co2",
      ],
      type: "Caza",
    },
    // Electrónica
    {
      words: [
        "router",
        "switch ",
        "switching",
        "antena",
        "access point",
        "gateway",
        "mikrotik",
        "ubiquiti",
        "poe",
        "conversor",
        "bombillo",
        "convertidor",
      ],
      type: "Electrónica",
    },
    // Misceláneos (muy alta prioridad para no confundir con pesca)
    {
      words: [
        "abrazadera",
        "bisagra",
        "aseo",
        "bebes",
        "cuidado capilar",
        "shampoo",
        "acondicionador",
        "icopor",
        "billy boy",
        "pañales",
        "jabón",
      ],
      type: "Misceláneos",
    },
    // Outdoor
    {
      words: [
        "mochila",
        "linterna",
        "gorra",
        "navaja",
        "multiherramienta",
        "victorinox",
        "afilador",
        "cuchillo",
        "cantimplora",
        "brújula",
        "cantil",
      ],
      type: "Outdoor",
    },
    // Pesca (default, pero solo si no matchea nada arriba)
    {
      words: [
        "señuelo",
        "anzuelo",
        "molinete",
        "caña",
        "nylon",
        "sedal",
        "flotador",
        "jig",
        "spinner",
        "rapala",
        "minnow",
        "shad",
        "lure",
        "bait",
        "hook",
        "reel",
        "rod",
        "cuchara",
        "powerbait",
        "bass",
        "flicker",
        "trolling",
        "casting",
        "fishing",
        "sinker",
        "plomo",
        "boya",
        "line",
        "leader",
        "swivel",
        "snap",
        "worm",
        "grub",
        "stick",
        "jerkbait",
        "crankbait",
        "topwater",
        "jersey",
      ],
      type: "Pesca",
    },
  ];

  for (const { words, type } of titleKeywords) {
    if (words.some((w) => title.includes(w))) return type;
  }

  // PRIORIDAD 2: Tags específicos (solo para casos claros donde el título no ayuda)
  if (
    tags.some((t) =>
      [
        "switching & routing",
        "routers",
        "router",
        "mikrotik",
        "ubiquiti",
        "antenas",
      ].includes(t),
    )
  )
    return "Electrónica";
  if (tags.some((t) => ["caceria", "tiro deportivo"].includes(t)))
    return "Caza";
  if (tags.some((t) => ["parrilas camping", "camping"].includes(t)))
    return "Camping";
  if (
    tags.some((t) =>
      [
        "aseo",
        "aseo bebes",
        "cuidado capilar bebes",
        "aseo hogar",
        "icopor",
        "bisagra",
        "billy boy",
      ].includes(t),
    )
  )
    return "Misceláneos";

  // PRIORIDAD 3: Tags generales (Pesca es el default porque es la mayoría)
  if (
    tags.some((t) =>
      [
        "pesca",
        "señuelo",
        "anzuelo",
        "molinete",
        "caña",
        "nylon",
        "sedal",
        "flotador",
        "spinning",
      ].includes(t),
    )
  )
    return "Pesca";
  if (
    tags.some((t) =>
      [
        "outdoor",
        "gorra",
        "mochila",
        "linterna",
        "multiherramienta",
        "victorinox",
      ].includes(t),
    )
  )
    return "Outdoor";

  return "Otros";
}

// ── Generador de descripción por reglas ─────────────────────────────────────
function generateDescription(row) {
  const title = row.Title || "";
  const vendor = row.Vendor || "";
  const type = classifyProduct(row);
  const sku = row["Variant SKU"] || "";
  const price = row["Variant Price"] || "";

  // Extraer datos del título con regex
  const mmMatch = title.match(/(\d+)mm/i);
  const mm = mmMatch ? mmMatch[1] + "mm" : null;

  const ozMatch = title.match(/(\d+[\/\.]?\d*)\s*oz/i);
  const oz = ozMatch ? ozMatch[1] + " oz" : null;

  const lbMatch = title.match(/(\d+)\s*lb/i);
  const lb = lbMatch ? lbMatch[1] + " lb" : null;

  const sizeMatch = title.match(/size\s*(\d+)/i);
  const size = sizeMatch ? "tamaño " + sizeMatch[1] : null;

  const bbMatch = title.match(/(\d+)\s*bb/i);
  const bb = bbMatch ? bbMatch[1] + " rodamientos" : null;

  const colorMatch = title.match(
    /(black|blue|red|green|silver|gold|white|chartreuse|sardine|mullet|mackerel|pearl|yellow|orange|pink|purple|brown)/i,
  );
  const color = colorMatch ? colorMatch[1] : null;

  const piecesMatch = title.match(/(\d+)\s*pzs?/i);
  const pieces = piecesMatch ? piecesMatch[1] + " piezas" : null;

  // Construir descripción según tipo
  let desc = "";
  const specs = [mm, oz, lb, size, bb, color, pieces].filter(Boolean);
  const specsText = specs.length > 0 ? specs.join(" · ") : "";

  switch (type) {
    case "Pesca":
      if (
        title.toLowerCase().includes("señuelo") ||
        title.toLowerCase().includes("lure")
      ) {
        desc = `<strong>${title}</strong>. Señuelo de alta calidad${vendor ? ` de la marca ${vendor}` : ""}${specsText ? ", con especificaciones: " + specsText : ""}. Diseñado para atraer especies depredadoras en agua dulce y salada. Ideal para pesca deportiva de bass, trucha y mar.`;
      } else if (
        title.toLowerCase().includes("molinete") ||
        title.toLowerCase().includes("reel")
      ) {
        desc = `<strong>${title}</strong>. Molinete${vendor ? ` ${vendor}` : ""}${specsText ? " con " + specsText : ""}. Construcción robusta para largas jornadas de pesca. Sistema de arrastre suave y recuperado preciso.`;
      } else if (
        title.toLowerCase().includes("caña") ||
        title.toLowerCase().includes("rod")
      ) {
        desc = `<strong>${title}</strong>. Caña de pesca${vendor ? ` ${vendor}` : ""}${specsText ? ", " + specsText : ""}. Fabricada con materiales de alto rendimiento para máxima sensibilidad y resistencia.`;
      } else if (
        title.toLowerCase().includes("anzuelo") ||
        title.toLowerCase().includes("hook")
      ) {
        desc = `<strong>${title}</strong>. Anzuelo${vendor ? ` ${vendor}` : ""}${specsText ? ", " + specsText : ""}. Punta ultraafilada y acero templado para máxima penetración. Perfecto para todo tipo de carnadas.`;
      } else if (
        title.toLowerCase().includes("nylon") ||
        title.toLowerCase().includes("sedal") ||
        title.toLowerCase().includes("line")
      ) {
        desc = `<strong>${title}</strong>. Línea de pesca${vendor ? ` ${vendor}` : ""}${specsText ? ", " + specsText : ""}. Alta resistencia a la abrasión y nudos firmes. Rendimiento óptimo en todo tipo de condiciones.`;
      } else {
        desc = `<strong>${title}</strong>. Producto de pesca${vendor ? ` de la marca ${vendor}` : ""}${specsText ? ", " + specsText : ""}. Equipo confiable para tu próxima salida de pesca.`;
      }
      break;

    case "Electrónica":
      desc = `<strong>${title}</strong>. Equipo profesional de red${vendor ? ` ${vendor}` : ""}${specsText ? ", " + specsText : ""}. Diseñado para instalaciones residenciales y comerciales que requieren alta performance y confiabilidad.`;
      break;

    case "Caza":
      desc = `<strong>${title}</strong>. Accesorio especializado para caza y tiro deportivo${vendor ? ` ${vendor}` : ""}${specsText ? ", " + specsText : ""}. Materiales duraderos diseñados para resistir las condiciones más exigentes del campo.`;
      break;

    case "Camping":
      desc = `<strong>${title}</strong>. Equipo esencial para camping y aventura outdoor${vendor ? ` ${vendor}` : ""}${specsText ? ", " + specsText : ""}. Confort y durabilidad para disfrutar la naturaleza sin preocupaciones.`;
      break;

    case "Outdoor":
      desc = `<strong>${title}</strong>. Accesorio outdoor${vendor ? ` ${vendor}` : ""}${specsText ? ", " + specsText : ""}. Versátil y resistente, pensado para acompañarte en cada expedición.`;
      break;

    case "Misceláneos":
      desc = `<strong>${title}</strong>${vendor ? ` de ${vendor}` : ""}${specsText ? ", " + specsText : ""}. Producto disponible en El Norteño con envío a toda Colombia.`;
      break;

    default:
      desc = `<strong>${title}</strong>${vendor ? ` de ${vendor}` : ""}${specsText ? ", " + specsText : ""}. Producto disponible en El Norteño con envío a toda Colombia.`;
  }

  // Agregar SKU y precio
  desc += ` <br><br><em>Referencia: ${sku}${price ? ` · Valor: $${Math.round(parseFloat(price)).toLocaleString("es-CO")}` : ""}. Disponible en tiendas Bucaramanga, Medellín y Valledupar. Envío nacional por Servientrega y Coordinadora.</em>`;

  return desc;
}

// ── Procesar ────────────────────────────────────────────────────────────────
console.log(`Procesando ${rows.length} productos...\n`);

const typeCounts = {};
const enriched = rows.map((row) => {
  const type = classifyProduct(row);
  const description = generateDescription(row);

  typeCounts[type] = (typeCounts[type] || 0) + 1;

  return {
    ...row,
    Type: type,
    "Product Category": type,
    "Body (HTML)": description,
  };
});

console.log("Distribución por tipo:");
Object.entries(typeCounts)
  .sort((a, b) => b[1] - a[1])
  .forEach(([t, c]) =>
    console.log(`  ${t.padEnd(15)} ${c.toString().padStart(5)}`),
  );

// Guardar CSV enriquecido
const out = stringify(enriched, { header: true });
fs.writeFileSync(OUTPUT_CSV, out);
console.log(`\n✅ CSV enriquecido guardado en: ${OUTPUT_CSV}`);

// Guardar también un JSON con solo los cambios para la API
const changes = enriched.map((r) => ({
  handle: r.Handle,
  type: r.Type,
  description: r["Body (HTML)"],
}));
fs.writeFileSync(
  path.resolve("data/shopify-product-changes.json"),
  JSON.stringify(changes, null, 2),
);
console.log(
  `✅ JSON de cambios guardado en: data/shopify-product-changes.json`,
);
