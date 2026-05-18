#!/usr/bin/env node
/**
 * skill-list.js — Wrapper: lista las skills disponibles.
 * Equivale a `kinto skill list`.
 */

import { runKinto } from "./_kinto.js";

runKinto(["skill", "list"]);
