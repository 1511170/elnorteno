/**
 * build — Build estático de un sitio.
 *
 * Uso: kinto build --site=<nombre>
 */

import { execSync } from "child_process";
import { findRoot } from "../lib/paths.js";
import { resolveSite } from "../lib/site.js";
import { log } from "../lib/log.js";

export default async function build({ flags }) {
  const root = findRoot();
  const site = resolveSite(flags, root);

  log.step(`Build: ${site.name}`);
  execSync("npm run build", { cwd: site.path, stdio: "inherit" });
  log.ok(`Build completado: sites/${site.name}/dist/`);
}
