/**
 * doctor — Diagnóstico del entorno de desarrollo de KINTO CMS.
 *
 * Uso: kinto doctor
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { findRoot, paths } from "../lib/paths.js";
import { isRepo } from "../lib/git.js";
import { log } from "../lib/log.js";

/** Ejecuta un comando y devuelve su salida, o null si falla. */
function probe(cmd) {
  try {
    return execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

export default async function doctor() {
  const root = findRoot();
  const p = paths(root);
  log.info("\n🩺 KINTO CMS — diagnóstico del entorno\n");

  const checks = [];

  // Node >= 18
  const nodeMajor = parseInt(process.versions.node.split(".")[0], 10);
  checks.push([
    nodeMajor >= 18,
    `Node ${process.versions.node}`,
    "Se requiere Node >= 18.",
  ]);

  // npm
  const npm = probe("npm --version");
  checks.push([
    !!npm,
    npm ? `npm ${npm}` : "npm no encontrado",
    "Instala Node con npm.",
  ]);

  // git
  const gitVersion = probe("git --version");
  checks.push([
    !!gitVersion,
    gitVersion || "git no encontrado",
    "Instala git.",
  ]);
  checks.push([isRepo(root), "Repo git inicializado", "Ejecuta `git init`."]);

  // Python — opcional, solo para la agent-skill graphify.
  const python = probe("python --version") || probe("python3 --version");
  checks.push([
    !!python,
    python ? `${python} (opcional)` : "Python no encontrado (opcional)",
    "Solo necesario si activas la agent-skill graphify (pip install graphifyy).",
  ]);

  // Registry de skills
  const hasRegistry = existsSync(p.registry);
  checks.push([
    hasRegistry,
    "skills/registry.json presente",
    "Ejecuta `kinto skill validate` para generarlo.",
  ]);

  // Agent-skills vendorizadas
  for (const agentSkill of ["boris", "graphify"]) {
    const present = existsSync(join(p.claudeSkills, agentSkill, "SKILL.md"));
    checks.push([
      present,
      `agent-skill ${agentSkill}`,
      `Falta .claude/skills/${agentSkill}/`,
    ]);
  }

  let failed = 0;
  for (const [ok, label, hint] of checks) {
    if (ok) {
      log.ok(label);
    } else {
      log.warn(`${label} — ${hint}`);
      failed++;
    }
  }
  log.info("");
  if (failed) log.warn(`${failed} aviso(s). Revisa lo anterior.`);
  else log.ok("Entorno listo.");
}
