/**
 * marketplace — Vista del marketplace de site-skills.
 *
 * Uso: kinto marketplace [--tag=<tag>] [--for=static|ecommerce]
 *
 * Es un alias enriquecido de `kinto skill list`: agrupa por categoría y
 * permite filtrar por tag o por tipo de sitio recomendado.
 */

import { findRoot } from "../lib/paths.js";
import { readRegistry } from "../lib/registry.js";
import { log } from "../lib/log.js";

export default async function marketplace({ flags }) {
  const root = findRoot();
  let skills = readRegistry(root).skills;

  if (flags.tag) skills = skills.filter((s) => s.tags.includes(flags.tag));
  if (flags.for)
    skills = skills.filter((s) => s.recommendedFor.includes(flags.for));

  log.info("\n🛍️  KINTO Marketplace — site-skills instalables\n");
  for (const category of ["official", "community"]) {
    const group = skills.filter((s) => s.category === category);
    if (!group.length) continue;
    log.info(`${category.toUpperCase()}`);
    for (const s of group) {
      log.info(`  • ${s.name}  v${s.version}`);
      log.info(`      ${s.description}`);
      const meta = [];
      if (s.tags.length) meta.push(`tags: ${s.tags.join(", ")}`);
      if (s.needs.length) meta.push(`requiere: ${s.needs.join(", ")}`);
      if (meta.length) log.info(`      ${meta.join("  ·  ")}`);
    }
    log.info("");
  }
  log.hint("Instala con: kinto skill add <nombre> --site=<sitio>");
}
