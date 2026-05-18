/**
 * deploy — Deploy de un sitio a Cloudflare Pages (o Worker en modo ecommerce).
 *
 * Uso: kinto deploy --site=<nombre>
 *
 * Detecta wrangler.jsonc: si existe, despliega el Worker; si no, sube el
 * directorio dist/ a Cloudflare Pages. Requiere `wrangler` autenticado.
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { findRoot } from "../lib/paths.js";
import { resolveSite } from "../lib/site.js";
import { log } from "../lib/log.js";

export default async function deploy({ flags }) {
  const root = findRoot();
  const site = resolveSite(flags, root);

  log.step(`Build previo al deploy: ${site.name}`);
  execSync("npm run build", { cwd: site.path, stdio: "inherit" });

  const hasWorker = existsSync(join(site.path, "wrangler.jsonc"));
  log.step(
    hasWorker ? "Deploy del Worker (Cloudflare)" : "Deploy a Cloudflare Pages",
  );
  const cmd = hasWorker
    ? "npx wrangler deploy"
    : `npx wrangler pages deploy dist --project-name=${site.name}`;

  try {
    execSync(cmd, { cwd: site.path, stdio: "inherit" });
    log.ok(`Deploy de "${site.name}" completado.`);
  } catch {
    throw new Error(
      "Falló el deploy. Verifica que wrangler esté instalado y autenticado.",
    );
  }
}
