/**
 * git.js — Helpers de git para `kinto update` y diagnóstico.
 */

import { execSync } from "child_process";

/** Ejecuta un comando git en `cwd`; devuelve stdout recortado o null si falla. */
export function git(args, cwd = process.cwd()) {
  try {
    return execSync(`git ${args}`, { cwd, stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    return null;
  }
}

/** ¿`dir` está dentro de un repo git? */
export function isRepo(dir) {
  return git("rev-parse --is-inside-work-tree", dir) === "true";
}

/** URL del remoto `origin`, o null. */
export function originUrl(dir) {
  return git("config --get remote.origin.url", dir);
}

/** ¿Hay cambios sin commitear en `dir`? */
export function isDirty(dir) {
  const status = git("status --porcelain", dir);
  return status !== null && status.length > 0;
}
