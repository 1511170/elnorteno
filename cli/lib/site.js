/**
 * site.js — Resolución del sitio destino para comandos que operan sobre un sitio.
 */

import { existsSync } from "fs";
import { basename, dirname } from "path";
import { paths } from "./paths.js";

/**
 * Determina el sitio destino: usa `--site=`, o detecta si el cwd está dentro
 * de `sites/<name>/`. Lanza un error claro si no se puede resolver.
 * @param {object} flags  flags parseados del comando
 * @param {string} root   raíz del repo
 */
export function resolveSite(flags, root) {
  const p = paths(root);
  let name = flags.site;

  if (!name) {
    let dir = process.cwd();
    while (dir !== dirname(dir)) {
      if (dirname(dir) === p.sites) {
        name = basename(dir);
        break;
      }
      dir = dirname(dir);
    }
  }

  if (!name) {
    throw new Error(
      "Especifica el sitio con --site=<nombre> o ejecuta el comando dentro de sites/<nombre>/.",
    );
  }
  const sitePath = p.sitePath(name);
  if (!existsSync(sitePath)) {
    throw new Error(`El sitio "${name}" no existe en sites/.`);
  }
  return { name, path: sitePath };
}
