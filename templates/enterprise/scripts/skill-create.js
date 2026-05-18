#!/usr/bin/env node
/**
 * skill-create.js — Wrapper: crea el scaffold de una skill nueva.
 * Equivale a `kinto skill create <nombre>`.
 */

import { runKinto } from "./_kinto.js";

const skillName = process.argv[2];
if (!skillName) {
  console.error("Uso: node scripts/skill-create.js <skill-name>");
  process.exit(1);
}
runKinto(["skill", "create", skillName]);
