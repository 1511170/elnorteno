/**
 * personalize.js — Reemplazo uniforme de placeholders `{CLAVE}` en templates.
 *
 * Reemplaza la lógica hardcodeada que vivía en kinto.js (literales de clientes
 * viejos como `serviworldlogistics.com`). Toda personalización pasa por aquí.
 */

import { readFileSync, writeFileSync } from "fs";

/**
 * Construye el mapa de placeholders a partir del nombre del sitio y overrides.
 * @param {string} siteName
 * @param {Record<string,string>} [overrides]
 */
export function buildTokens(siteName, overrides = {}) {
  const slug = siteName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const prefix = slug.slice(0, 3);
  return {
    SITE_NAME: siteName,
    SITE_SLUG: slug,
    CLIENT_NAME: siteName.charAt(0).toUpperCase() + siteName.slice(1),
    INDUSTRY: "Tu industria aquí",
    DOMAIN: `${slug}.com`,
    DESCRIPTION: `Sitio web de ${siteName}`,
    LANG: "es",
    CMS_PREFIX: prefix,
    CMS_SUBDOMAIN: `${prefix}.kinto.info`,
    GITHUB_REPO: `kinto-cms/${slug}-content`,
    AUTH_URL: `https://${prefix}-auth.kinto.workers.dev`,
    ...overrides,
  };
}

/** Reemplaza todos los `{CLAVE}` de `text` usando `tokens`. */
export function personalizeText(text, tokens) {
  return text.replace(/\{([A-Z0-9_]+)\}/g, (match, key) =>
    key in tokens ? tokens[key] : match,
  );
}

/** Lee un archivo, reemplaza placeholders y lo reescribe en sitio. */
export function personalizeFile(filePath, tokens) {
  const content = readFileSync(filePath, "utf8");
  const next = personalizeText(content, tokens);
  if (next !== content) writeFileSync(filePath, next);
}
