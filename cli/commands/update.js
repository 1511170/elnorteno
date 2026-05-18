/**
 * update — Actualiza el motor de KINTO CMS desde upstream.
 *
 * Uso: kinto update [--ref=origin/main] [--remote=upstream]
 *
 * Actualiza SOLO las rutas del motor (core, skills oficiales, templates,
 * config de agentes y el propio CLI). NUNCA toca sites/ ni skills/community/,
 * que son trabajo del cliente. Crea un backup antes de sobrescribir.
 */

import { cpSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { findRoot } from "../lib/paths.js";
import { git, isRepo, isDirty } from "../lib/git.js";
import { log } from "../lib/log.js";

/** Rutas gestionadas por el motor — se actualizan desde upstream. */
const MANAGED = [
  "core",
  "skills/official",
  "templates",
  ".claude",
  "cli",
  "bin",
];

export default async function update({ flags }) {
  const root = findRoot();

  if (!isRepo(root)) {
    throw new Error(
      "Este directorio no es un repo git. Para un proyecto nuevo usa: npx kinto-cms@latest start",
    );
  }
  if (isDirty(root)) {
    log.warn(
      "Hay cambios sin commitear. Commitéalos o descártalos antes de actualizar.",
    );
    throw new Error("Working tree sucio — update cancelado por seguridad.");
  }

  const remote = flags.remote || "origin";
  const ref = flags.ref || `${remote}/main`;

  log.step(`Trayendo upstream (${remote})`);
  if (git(`fetch ${remote}`, root) === null) {
    throw new Error(
      `No se pudo hacer fetch de "${remote}". Verifica el remoto git.`,
    );
  }

  // Backup de las rutas gestionadas.
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupDir = join(root, ".kinto-backup", stamp);
  mkdirSync(backupDir, { recursive: true });
  log.step(`Backup en .kinto-backup/${stamp}/`);
  for (const rel of MANAGED) {
    const src = join(root, rel);
    if (existsSync(src)) {
      cpSync(src, join(backupDir, rel), { recursive: true });
    }
  }

  // Checkout selectivo de las rutas gestionadas desde upstream.
  log.step(`Actualizando motor desde ${ref}`);
  let updated = 0;
  for (const rel of MANAGED) {
    if (git(`checkout ${ref} -- "${rel}"`, root) !== null) {
      log.ok(rel);
      updated++;
    } else {
      log.warn(`No se pudo actualizar ${rel} (puede no existir en upstream).`);
    }
  }

  log.info("");
  log.ok(
    `Motor actualizado (${updated}/${MANAGED.length} rutas). sites/ intacto.`,
  );
  log.hint(
    "Revisa los cambios con `git diff --staged` y ejecuta `kinto doctor`.",
  );
}
