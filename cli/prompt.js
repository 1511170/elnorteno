/**
 * prompt.js — Prompt interactivo mínimo basado en readline (cero dependencias).
 *
 * Usado por el wizard `kinto start`. Todas las funciones respetan el modo
 * no-interactivo: si stdin no es TTY devuelven el valor por defecto.
 */

import readline from "readline";

const interactive = process.stdin.isTTY === true;

function ask(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

/** Pregunta de texto libre. */
export async function text(message, defaultValue = "") {
  if (!interactive) return defaultValue;
  const suffix = defaultValue ? ` (${defaultValue})` : "";
  const answer = (await ask(`${message}${suffix}: `)).trim();
  return answer || defaultValue;
}

/** Pregunta sí/no. */
export async function confirm(message, defaultValue = true) {
  if (!interactive) return defaultValue;
  const hint = defaultValue ? "S/n" : "s/N";
  const answer = (await ask(`${message} [${hint}]: `)).trim().toLowerCase();
  if (!answer) return defaultValue;
  return answer === "s" || answer === "si" || answer === "sí" || answer === "y";
}

/** Selección de una opción de una lista. */
export async function select(message, options, defaultIndex = 0) {
  if (!interactive) return options[defaultIndex];
  console.log(`\n${message}`);
  options.forEach((opt, i) => {
    const label = typeof opt === "string" ? opt : opt.label;
    console.log(
      `  ${i + 1}) ${label}${i === defaultIndex ? " (por defecto)" : ""}`,
    );
  });
  const answer = (await ask("Elige un número: ")).trim();
  const idx = answer ? parseInt(answer, 10) - 1 : defaultIndex;
  if (Number.isNaN(idx) || idx < 0 || idx >= options.length)
    return options[defaultIndex];
  return options[idx];
}
