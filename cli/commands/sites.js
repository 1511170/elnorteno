/**
 * sites — Gestión de sitios del repo.
 *
 * Uso:
 *   kinto sites list
 *   kinto sites clone <origen> <destino>
 */

import {
  cpSync,
  existsSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { findRoot, paths } from "../lib/paths.js";
import { log } from "../lib/log.js";

export default async function sites({ _ }) {
  const [sub, ...rest] = _;
  const root = findRoot();
  switch (sub) {
    case "list":
      return listSites(root);
    case "clone":
      return cloneSite(root, rest[0], rest[1]);
    default:
      throw new Error("Subcomando inválido. Usa: list | clone");
  }
}

function listSites(root) {
  const p = paths(root);
  if (!existsSync(p.sites)) return log.warn("No hay directorio sites/.");
  const dirs = readdirSync(p.sites, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name);
  if (!dirs.length)
    return log.info("No hay sitios creados. Usa: kinto create-site <nombre>");
  log.info(`\n🌐 Sitios (${dirs.length}):\n`);
  for (const name of dirs) {
    const activePath = join(p.sites, name, "skills-active.json");
    let skills = "";
    if (existsSync(activePath)) {
      try {
        const active = JSON.parse(readFileSync(activePath, "utf8"));
        skills = active.skills?.length
          ? `  [${active.skills.join(", ")}]`
          : "  [sin skills]";
      } catch {
        /* ignora json inválido */
      }
    }
    log.info(`  • ${name}${skills}`);
  }
}

function cloneSite(root, from, to) {
  if (!from || !to)
    throw new Error("Uso: kinto sites clone <origen> <destino>");
  const p = paths(root);
  const src = p.sitePath(from);
  const dest = p.sitePath(to);
  if (!existsSync(src)) throw new Error(`El sitio "${from}" no existe.`);
  if (existsSync(dest)) throw new Error(`El sitio "${to}" ya existe.`);

  cpSync(src, dest, {
    recursive: true,
    filter: (s) => !s.includes("node_modules") && !s.includes(`${dest}\\dist`),
  });

  // Actualiza el nombre del sitio en skills-active.json.
  const activePath = join(dest, "skills-active.json");
  if (existsSync(activePath)) {
    const active = JSON.parse(readFileSync(activePath, "utf8"));
    active.site = to;
    writeFileSync(activePath, JSON.stringify(active, null, 2) + "\n");
  }
  log.ok(`Sitio "${from}" clonado como "${to}".`);
  log.hint(`Revisa sites/${to}/config/site.config.ts y actualiza dominio/CMS.`);
}
