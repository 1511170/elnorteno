/**
 * _kinto.js — Localiza el CLI de KINTO y delega un subcomando.
 *
 * Los scripts per-site (skill-add, skill-list, skill-create) son wrappers
 * finos sobre el CLI central. La lógica real vive en cli/.
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { dirname, join } from "path";

/** Sube por el árbol hasta encontrar bin/kinto.js. */
export function findCli(start = process.cwd()) {
  let dir = start;
  while (dir !== dirname(dir)) {
    const cli = join(dir, "bin", "kinto.js");
    if (existsSync(cli)) return cli;
    dir = dirname(dir);
  }
  console.error("❌ No se encontró el CLI de KINTO (bin/kinto.js).");
  process.exit(1);
}

/** Ejecuta `kinto <args>` heredando stdio. */
export function runKinto(args) {
  execSync(`node "${findCli()}" ${args.join(" ")}`, { stdio: "inherit" });
}
