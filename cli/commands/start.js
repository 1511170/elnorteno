/**
 * start — Wizard "Start Kinto": crea, configura y levanta un sitio de cero.
 *
 * Uso interactivo:    kinto start
 * Uso no-interactivo: kinto start --site=acme --template=ecommerce \
 *                       --skills=cms-sveltia,testimonials --yes [--dev]
 *
 * Es la experiencia out-of-the-box: un solo comando deja todo corriendo.
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { findRoot, paths } from "../lib/paths.js";
import { readRegistry } from "../lib/registry.js";
import { text, select, confirm } from "../prompt.js";
import { log } from "../lib/log.js";
import createSite from "./create-site.js";
import skill from "./skill.js";

export default async function start({ flags }) {
  const root = findRoot();
  const p = paths(root);

  log.info("\n🚀 KINTO CMS — Start\n");

  // 1. Nombre del sitio.
  let siteName = flags.site || (await text("Nombre del sitio", "mi-sitio"));
  siteName = String(siteName).trim();
  if (existsSync(p.sitePath(siteName))) {
    throw new Error(`El sitio "${siteName}" ya existe. Elige otro nombre.`);
  }

  // 2. Tipo de sitio.
  const template =
    flags.template ||
    (
      await select("Tipo de sitio:", [
        { label: "static — corporativo / informativo", value: "static" },
        { label: "ecommerce — tienda Shopify", value: "ecommerce" },
      ])
    ).value;

  // 3. Skills recomendadas.
  const registry = readRegistry(root);
  let skills;
  if (flags.skills) {
    skills = String(flags.skills)
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  } else {
    const recommended = registry.skills
      .filter((s) => s.recommendedFor.includes(template))
      .map((s) => s.name);
    skills = [];
    for (const name of recommended) {
      if (await confirm(`¿Instalar skill "${name}"?`, true)) skills.push(name);
    }
  }

  // 4. Agent-skills (Boris / graphify) — informativo.
  const borisPresent = existsSync(join(p.claudeSkills, "boris", "SKILL.md"));
  if (borisPresent)
    log.info("🧠 Metodología Boris activa (.claude/skills/boris).");
  const graphifyPresent = existsSync(
    join(p.claudeSkills, "graphify", "SKILL.md"),
  );
  if (graphifyPresent && !flags.yes) {
    const useGraphify = await confirm(
      "¿Usarás graphify? (requiere Python + pip install graphifyy)",
      false,
    );
    if (useGraphify) log.hint("Instala graphify con: pip install graphifyy");
  }

  // 5. Ejecución.
  log.step("Creando el sitio");
  await createSite({ _: [siteName], flags: { template } });

  const sitePath = p.sitePath(siteName);
  if (flags["no-install"] !== true) {
    log.step("Instalando dependencias");
    execSync("npm install", { cwd: sitePath, stdio: "inherit" });
  }

  for (const name of skills) {
    try {
      await skill({ _: ["add", name], flags: { site: siteName } });
    } catch (err) {
      log.warn(`No se pudo instalar "${name}": ${err.message}`);
    }
  }

  log.step("Build de verificación");
  try {
    execSync("npm run build", { cwd: sitePath, stdio: "inherit" });
    log.ok("Build correcto.");
  } catch {
    log.warn("El build falló — revisa los errores antes de continuar.");
  }

  log.info("");
  log.ok(`Sitio "${siteName}" listo en sites/${siteName}/`);
  log.info(`  kinto dev --site=${siteName}     # servidor local`);
  log.info(`  kinto deploy --site=${siteName}  # publicar`);

  if (flags.dev) {
    log.step("Levantando servidor de desarrollo");
    execSync("npm run dev", { cwd: sitePath, stdio: "inherit" });
  }
}
