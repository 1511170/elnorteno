#!/usr/bin/env node
/**
 * KINTO CMS — entry point del CLI.
 * La lógica vive en cli/. Este archivo solo arranca el dispatcher.
 */

import { run } from "../cli/index.js";

run(process.argv.slice(2)).catch((err) => {
  console.error(`❌ ${err.message || err}`);
  process.exit(1);
});
