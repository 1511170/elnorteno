/**
 * index.js — Parser de argumentos y dispatch de comandos del CLI KINTO.
 *
 * Comandos: create-site · dev · build · deploy · skill · sites · start ·
 *           update · doctor · marketplace · help
 */

import { log, fail } from "./lib/log.js";

const COMMANDS = {
  "create-site": () => import("./commands/create-site.js"),
  init: () => import("./commands/create-site.js"), // alias legacy
  dev: () => import("./commands/dev.js"),
  build: () => import("./commands/build.js"),
  deploy: () => import("./commands/deploy.js"),
  skill: () => import("./commands/skill.js"),
  sites: () => import("./commands/sites.js"),
  start: () => import("./commands/start.js"),
  update: () => import("./commands/update.js"),
  doctor: () => import("./commands/doctor.js"),
  marketplace: () => import("./commands/marketplace.js"),
};

const HELP = `
🚀 KINTO CMS — generador de sitios estáticos con arquitectura de skills

Uso: kinto <comando> [opciones]

Arranque
  start                          Wizard: crea, configura y levanta un sitio
  doctor                         Diagnostica el entorno (Node, npm, git, Python)
  update                         Actualiza core/skills/templates desde upstream

Sitios
  create-site <nombre>           Crea un sitio nuevo desde un template
                  --template=<static|ecommerce>
  dev --site=<nombre>            Servidor de desarrollo
  build --site=<nombre>          Build estático
  deploy --site=<nombre>         Deploy a Cloudflare
  sites list                     Lista los sitios del repo
  sites clone <origen> <destino> Clona un sitio existente

Skills (marketplace)
  marketplace                    Lista las site-skills instalables
  skill list                     Igual que marketplace
  skill search <texto>           Busca skills por nombre/tag/descripción
  skill add <nombre> --site=<s>  Instala una skill en un sitio
  skill remove <nombre> --site=<s>  Desinstala una skill
  skill create <nombre>          Crea el scaffold de una skill nueva
  skill validate                 Valida skills y regenera el registry

Ejemplos
  kinto start
  kinto create-site acme --template=ecommerce
  kinto skill add testimonials --site=acme
  kinto update
`;

/** Parsea argv en { _: positionales, flags: {} }. */
export function parseArgs(argv) {
  const positional = [];
  const flags = {};
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const [key, ...rest] = arg.slice(2).split("=");
      flags[key] = rest.length ? rest.join("=") : true;
    } else {
      positional.push(arg);
    }
  }
  return { _: positional, flags };
}

export async function run(argv) {
  const [command, ...rest] = argv;

  if (
    !command ||
    command === "help" ||
    command === "--help" ||
    command === "-h"
  ) {
    log.info(HELP);
    return;
  }

  const loader = COMMANDS[command];
  if (!loader) {
    log.error(`Comando desconocido: "${command}"`);
    log.hint("Ejecuta `kinto help` para ver los comandos disponibles.");
    process.exit(1);
  }

  try {
    const mod = await loader();
    await mod.default(parseArgs(rest));
  } catch (err) {
    fail(err.message || String(err));
  }
}
