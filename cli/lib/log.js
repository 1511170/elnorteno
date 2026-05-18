/**
 * log.js — Salida de consola consistente para el CLI de KINTO.
 */

export const log = {
  info: (msg) => console.log(msg),
  step: (msg) => console.log(`\n▸ ${msg}`),
  ok: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.log(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
  hint: (msg) => console.log(`💡 ${msg}`),
};

/** Imprime un error y termina el proceso con código 1. */
export function fail(msg) {
  log.error(msg);
  process.exit(1);
}
