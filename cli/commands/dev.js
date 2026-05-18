/**
 * dev — Levanta el servidor de desarrollo de un sitio.
 *
 * Uso: kinto dev --site=<nombre>
 */

import { execSync } from "child_process";
import { existsSync } from "fs";
import { join } from "path";
import { findRoot } from "../lib/paths.js";
import { resolveSite } from "../lib/site.js";
import { log } from "../lib/log.js";

export default async function dev({ flags }) {
  const root = findRoot();
  const site = resolveSite(flags, root);

  if (!existsSync(join(site.path, "node_modules"))) {
    log.step("Instalando dependencias");
    execSync("npm install", { cwd: site.path, stdio: "inherit" });
  }

  log.step(`Servidor de desarrollo: ${site.name}`);
  execSync("npm run dev", { cwd: site.path, stdio: "inherit" });
}
