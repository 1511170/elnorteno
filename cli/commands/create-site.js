/**
 * create-site — Crea un sitio nuevo desde un template y lo personaliza.
 *
 * Uso: kinto create-site <nombre> [--template=static|ecommerce]
 */

import { cpSync, existsSync } from "fs";
import { join } from "path";
import { findRoot, paths } from "../lib/paths.js";
import { buildTokens, personalizeFile } from "../lib/personalize.js";
import { log } from "../lib/log.js";

/** Mapea nombres de template amigables a la carpeta real en templates/. */
const TEMPLATE_ALIASES = {
  static: "enterprise",
  corporate: "enterprise",
  enterprise: "enterprise",
  ecommerce: "ecommerce",
  shop: "ecommerce",
  store: "ecommerce",
};

/** Archivos que reciben reemplazo de placeholders tras copiar el template. */
const PERSONALIZE = [
  "KINTO.md",
  "package.json",
  "config/site.config.ts",
  "config/cms.config.yml",
  "skills-active.json",
  ".env.example",
  "wrangler.jsonc",
];

export default async function createSite({ _, flags }) {
  const siteName = _[0];
  if (!siteName)
    throw new Error("Falta el nombre del sitio: kinto create-site <nombre>");

  const root = findRoot();
  const p = paths(root);
  const sitePath = p.sitePath(siteName);
  if (existsSync(sitePath))
    throw new Error(`El sitio "${siteName}" ya existe.`);

  const templateKey = String(flags.template || "static").toLowerCase();
  const templateName = TEMPLATE_ALIASES[templateKey];
  if (!templateName) {
    throw new Error(
      `Template desconocido "${flags.template}". Usa: static | ecommerce.`,
    );
  }
  const templatePath = p.templatePath(templateName);
  if (!existsSync(templatePath)) {
    throw new Error(`El template "${templateName}" no existe en templates/.`);
  }

  log.step(`Creando sitio "${siteName}" desde template "${templateName}"`);
  cpSync(templatePath, sitePath, { recursive: true });

  const tokens = buildTokens(siteName);
  for (const rel of PERSONALIZE) {
    const file = join(sitePath, rel);
    if (existsSync(file)) personalizeFile(file, tokens);
  }

  log.ok(`Sitio creado en sites/${siteName}/`);
  log.info("");
  log.info("Siguientes pasos:");
  log.info(`  cd sites/${siteName}`);
  log.info("  npm install");
  log.info(`  kinto dev --site=${siteName}`);
  if (templateName === "ecommerce") {
    log.hint(
      "Modo tienda: copia .env.example a .env y completa las credenciales de Shopify.",
    );
  }
}
