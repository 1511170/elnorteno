/**
 * paths.js — Resolución de rutas del repo KINTO CMS.
 *
 * Permite ejecutar el CLI desde la raíz del repo o desde dentro de un sitio
 * (sites/<name>/...). Sube por el árbol buscando el marcador de raíz.
 */

import { existsSync, readFileSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

/** Detecta la raíz del repo KINTO CMS subiendo desde `start`. */
export function findRoot(start = process.cwd()) {
  let dir = resolve(start);
  while (true) {
    if (isKintoRoot(dir)) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  // Fallback: raíz relativa a este archivo (cli/lib/paths.js -> ../../).
  const selfRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
  if (isKintoRoot(selfRoot)) {
    // Si el paquete vive dentro de node_modules, KINTO corre como dependencia
    // instalada o vía `npx` — no como repo clonado. Crear sitios aquí los
    // enterraría en la caché de npm (efímera e invisible). Error claro en vez
    // del fallback silencioso.
    if (selfRoot.split(/[\\/]/).includes("node_modules")) {
      throw new Error(
        "KINTO CMS se está ejecutando como paquete npm, no como repo clonado.\n" +
          "Clona el repo y ejecuta el wizard dentro:\n" +
          "  git clone https://github.com/1511170/kinto-cms.git\n" +
          "  cd kinto-cms && node bin/kinto.js start\n" +
          "O usa el instalador: irm get.kinto.co | iex",
      );
    }
    return selfRoot;
  }
  throw new Error(
    "No se encontró la raíz de KINTO CMS. Ejecuta el comando dentro del repo.",
  );
}

function isKintoRoot(dir) {
  if (!existsSync(join(dir, "skills")) || !existsSync(join(dir, "templates"))) {
    return false;
  }
  const pkgPath = join(dir, "package.json");
  if (!existsSync(pkgPath)) return false;
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    return pkg.name === "kinto-cms";
  } catch {
    return false;
  }
}

/** Conjunto de rutas derivadas de la raíz del repo. */
export function paths(root = findRoot()) {
  return {
    root,
    skills: join(root, "skills"),
    skillsOfficial: join(root, "skills", "official"),
    skillsCommunity: join(root, "skills", "community"),
    registry: join(root, "skills", "registry.json"),
    sites: join(root, "sites"),
    templates: join(root, "templates"),
    claudeSkills: join(root, ".claude", "skills"),
    sitePath: (name) => join(root, "sites", name),
    templatePath: (name) => join(root, "templates", name),
  };
}
