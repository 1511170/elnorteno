#!/usr/bin/env node
/**
 * format-file.mjs — Hook PostToolUse: formatea SOLO el archivo editado.
 *
 * El hook anterior corría `prettier --write .` sobre todo el repo en cada
 * edición, generando ruido masivo en los diffs. Este lee el JSON del hook
 * por stdin, extrae el path del archivo tocado y formatea únicamente ese.
 */

const FORMATTABLE = /\.(js|mjs|cjs|ts|tsx|jsx|json|css|md|yml|yaml)$/;

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => (input += chunk));
process.stdin.on("end", async () => {
  try {
    const data = JSON.parse(input || "{}");
    const file = data.tool_input?.file_path;
    if (!file || !FORMATTABLE.test(file)) process.exit(0);

    const { execSync } = await import("node:child_process");
    execSync(`npx prettier --write "${file}"`, { stdio: "ignore" });
  } catch {
    // El formateo nunca debe romper el flujo del agente.
  }
  process.exit(0);
});
