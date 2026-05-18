/**
 * skill — Gestión de site-skills (el marketplace de KINTO).
 *
 * Uso:
 *   kinto skill list
 *   kinto skill search <texto>
 *   kinto skill add <nombre> --site=<sitio>
 *   kinto skill remove <nombre> --site=<sitio>
 *   kinto skill create <nombre>
 *   kinto skill validate
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { findRoot, paths } from "../lib/paths.js";
import { resolveSite } from "../lib/site.js";
import { readRegistry, findSkill, generateRegistry } from "../lib/registry.js";
import { log } from "../lib/log.js";

export default async function skill({ _, flags }) {
  const [sub, ...rest] = _;
  const root = findRoot();
  switch (sub) {
    case "list":
      return listSkills(root);
    case "search":
      return searchSkills(root, rest.join(" "));
    case "add":
      return addSkill(root, rest[0], flags);
    case "remove":
      return removeSkill(root, rest[0], flags);
    case "create":
      return createSkill(root, rest[0]);
    case "validate":
      return validateSkills(root);
    default:
      throw new Error(
        "Subcomando inválido. Usa: list | search | add | remove | create | validate",
      );
  }
}

function listSkills(root) {
  const registry = readRegistry(root);
  log.info(`\n🧩 Site-skills disponibles (${registry.count}):\n`);
  for (const s of registry.skills) {
    const tags = s.tags.length ? `  [${s.tags.join(", ")}]` : "";
    log.info(`  • ${s.name} (${s.category}) v${s.version}${tags}`);
    if (s.description) log.info(`      ${s.description}`);
  }
}

function searchSkills(root, query) {
  if (!query) throw new Error("Indica un texto de búsqueda.");
  const q = query.toLowerCase();
  const matches = readRegistry(root).skills.filter((s) =>
    [s.name, s.description, ...s.tags].join(" ").toLowerCase().includes(q),
  );
  if (!matches.length) return log.warn(`Sin resultados para "${query}".`);
  log.info(`\n🔍 Resultados para "${query}":\n`);
  for (const s of matches) log.info(`  • ${s.name} — ${s.description}`);
}

function addSkill(root, name, flags) {
  if (!name) throw new Error("Indica el nombre de la skill.");
  const site = resolveSite(flags, root);
  const skillEntry = findSkill(root, name);
  if (!skillEntry) {
    throw new Error(
      `La skill "${name}" no existe. Crea una con: kinto skill create ${name}`,
    );
  }

  const activePath = join(site.path, "skills-active.json");
  const active = JSON.parse(readFileSync(activePath, "utf8"));
  active.skills = active.skills || [];

  // Resuelve dependencias declaradas en `requires`.
  const toInstall = [name];
  for (const dep of skillEntry.requires) {
    if (!active.skills.includes(dep) && !toInstall.includes(dep))
      toInstall.push(dep);
  }

  let installed = 0;
  for (const skillName of toInstall) {
    if (active.skills.includes(skillName)) continue;
    active.skills.push(skillName);
    installed++;
    log.ok(`Skill "${skillName}" añadida a ${site.name}.`);
  }
  if (!installed)
    return log.warn(`"${name}" ya estaba instalada en ${site.name}.`);

  writeFileSync(activePath, JSON.stringify(active, null, 2) + "\n");

  if (skillEntry.needs.length) {
    log.warn(
      `Requisitos externos de "${name}": ${skillEntry.needs.join(", ")}`,
    );
  }
  log.hint(`Verifica con: kinto build --site=${site.name}`);
}

function removeSkill(root, name, flags) {
  if (!name) throw new Error("Indica el nombre de la skill.");
  const site = resolveSite(flags, root);
  const activePath = join(site.path, "skills-active.json");
  const active = JSON.parse(readFileSync(activePath, "utf8"));
  if (!active.skills?.includes(name)) {
    return log.warn(`"${name}" no estaba instalada en ${site.name}.`);
  }
  active.skills = active.skills.filter((s) => s !== name);
  writeFileSync(activePath, JSON.stringify(active, null, 2) + "\n");
  log.ok(`Skill "${name}" eliminada de ${site.name}.`);
}

function createSkill(root, name) {
  if (!name) throw new Error("Indica el nombre de la skill.");
  if (!/^[a-z0-9-]+$/.test(name)) {
    throw new Error("El nombre debe ser kebab-case (a-z, 0-9, guiones).");
  }
  const p = paths(root);
  const dir = join(p.skillsCommunity, name);
  if (existsSync(dir)) throw new Error(`La skill "${name}" ya existe.`);

  mkdirSync(join(dir, "components"), { recursive: true });
  mkdirSync(join(dir, "config"), { recursive: true });

  const pascal = name
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join("");

  writeFileSync(
    join(dir, "SKILL.md"),
    `---
name: ${name}
category: community
version: 0.1.0
description: TODO — describe en una línea qué hace esta skill
tags: []
requires: []
needs: []
recommendedFor: [static]
---

# ${pascal}

## Qué hace
TODO — describe la skill.

## Instalación
\`\`\`bash
kinto skill add ${name} --site=<sitio>
\`\`\`

## Uso
\`\`\`astro
---
import { ${pascal} } from '../../../skills/community/${name}/index.ts';
---
<${pascal} />
\`\`\`

## Props
| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| —    | —    | —       | —           |
`,
  );

  writeFileSync(
    join(dir, "index.ts"),
    `export { default as ${pascal} } from './components/${pascal}.astro';\n`,
  );

  writeFileSync(
    join(dir, "components", `${pascal}.astro`),
    `---
// Componente ${pascal} — skill "${name}"
interface Props {}
---

<section class="${name}">
  <!-- TODO: implementar -->
</section>
`,
  );

  generateRegistry(root);
  log.ok(`Skill "${name}" creada en skills/community/${name}/`);
  log.hint(
    "Implementa el componente, completa SKILL.md y abre un PR (ver CONTRIBUTING.md).",
  );
}

function validateSkills(root) {
  const p = paths(root);
  const registry = generateRegistry(root);
  let errors = 0;
  for (const s of registry.skills) {
    const dir = join(root, s.path);
    // index.ts solo es obligatorio para skills de componentes; las skills de
    // tooling/config (tunnels, scrapers, deploy) no exportan componentes.
    if (
      existsSync(join(dir, "components")) &&
      !existsSync(join(dir, "index.ts"))
    ) {
      log.error(
        `${s.name}: tiene components/ pero falta index.ts que los exporte`,
      );
      errors++;
    }
    if (!existsSync(join(dir, "SKILL.md"))) {
      log.error(`${s.name}: falta SKILL.md`);
      errors++;
    }
    if (!s.description || s.description.startsWith("TODO")) {
      log.warn(`${s.name}: description vacía o sin completar`);
    }
    if (s.version === "0.0.0") {
      log.warn(`${s.name}: falta frontmatter de versión en SKILL.md`);
    }
  }
  if (errors)
    throw new Error(`${errors} skill(s) con errores. Registry: ${p.registry}`);
  log.ok(
    `${registry.count} skills válidas. Registry regenerado: skills/registry.json`,
  );
}
