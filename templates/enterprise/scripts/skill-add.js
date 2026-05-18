#!/usr/bin/env node
/**
 * skill-add.js — Wrapper: instala una skill en este sitio.
 * Equivale a `kinto skill add <nombre> --site=<este-sitio>`.
 */

import { basename } from "path";
import { runKinto } from "./_kinto.js";

const skillName = process.argv[2];
if (!skillName) {
  console.error("Uso: node scripts/skill-add.js <skill-name>");
  process.exit(1);
}
runKinto(["skill", "add", skillName, `--site=${basename(process.cwd())}`]);
