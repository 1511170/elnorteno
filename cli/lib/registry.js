/**
 * registry.js — Lectura y generación del marketplace de site-skills.
 *
 * El registry (`skills/registry.json`) es la fuente de verdad del marketplace.
 * Se genera escaneando el frontmatter de cada `skills/<cat>/<skill>/SKILL.md`.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { paths } from "./paths.js";
import { parseFrontmatter } from "./frontmatter.js";

const CATEGORIES = ["official", "community"];

/** Escanea el árbol de skills y devuelve la lista de entradas del registry. */
export function scanSkills(root) {
  const p = paths(root);
  const skills = [];
  for (const category of CATEGORIES) {
    const catDir = join(p.skills, category);
    if (!existsSync(catDir)) continue;
    for (const entry of readdirSync(catDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const skillDir = join(catDir, entry.name);
      const skillMd = join(skillDir, "SKILL.md");
      if (!existsSync(skillMd)) continue;
      const { data } = parseFrontmatter(readFileSync(skillMd, "utf8"));
      skills.push({
        name: data.name || entry.name,
        category: data.category || category,
        version: data.version || "0.0.0",
        description: data.description || "",
        tags: data.tags || [],
        requires: data.requires || [],
        needs: data.needs || [],
        recommendedFor: data.recommendedFor || [],
        path: `skills/${category}/${entry.name}`,
      });
    }
  }
  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

/** Genera y escribe `skills/registry.json` + `MARKETPLACE.md`. */
export function generateRegistry(root) {
  const p = paths(root);
  const registry = {
    generated: new Date().toISOString(),
    count: 0,
    skills: scanSkills(root),
  };
  registry.count = registry.skills.length;
  writeFileSync(p.registry, JSON.stringify(registry, null, 2) + "\n");
  writeFileSync(join(p.root, "MARKETPLACE.md"), renderMarketplace(registry));
  return registry;
}

/** Renderiza MARKETPLACE.md (catálogo legible) a partir del registry. */
function renderMarketplace(registry) {
  const lines = [
    "# 🛍️ KINTO Marketplace",
    "",
    "> Catálogo de site-skills instalables. **Generado automáticamente** desde",
    "> `skills/registry.json` — no lo edites a mano (corre `kinto skill validate`).",
    "",
    `Total: **${registry.count} skills** · Última generación: ${registry.generated.slice(0, 10)}`,
    "",
    "Instala cualquier skill con: `kinto skill add <nombre> --site=<sitio>`",
    "",
  ];
  for (const category of ["official", "community"]) {
    const group = registry.skills.filter((s) => s.category === category);
    if (!group.length) continue;
    lines.push(
      `## ${category === "official" ? "✅ Oficiales" : "🌐 Comunidad"}`,
      "",
    );
    lines.push("| Skill | Versión | Descripción | Tags | Requisitos |");
    lines.push("|-------|---------|-------------|------|------------|");
    for (const s of group) {
      const tags = s.tags.length ? s.tags.join(", ") : "—";
      const needs = s.needs.length ? s.needs.join(", ") : "—";
      lines.push(
        `| \`${s.name}\` | ${s.version} | ${s.description} | ${tags} | ${needs} |`,
      );
    }
    lines.push("");
  }
  lines.push(
    "---",
    "",
    "¿Quieres aportar una skill? Lee [CONTRIBUTING.md](./CONTRIBUTING.md).",
    "",
  );
  return lines.join("\n");
}

/** Lee el registry desde disco; lo regenera si no existe. */
export function readRegistry(root) {
  const p = paths(root);
  if (!existsSync(p.registry)) return generateRegistry(root);
  return JSON.parse(readFileSync(p.registry, "utf8"));
}

/** Busca una skill por nombre exacto en el registry. */
export function findSkill(root, name) {
  return readRegistry(root).skills.find((s) => s.name === name) || null;
}
