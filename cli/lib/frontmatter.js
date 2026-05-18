/**
 * frontmatter.js — Parser mínimo de frontmatter YAML (sin dependencias).
 *
 * Soporta el subconjunto que usan los SKILL.md de KINTO:
 *   key: valor escalar
 *   key: [a, b, c]        (arrays inline)
 *   key: "valor citado"
 * No soporta YAML anidado/multilínea a propósito — los SKILL.md son planos.
 */

/**
 * Extrae el bloque frontmatter `--- ... ---` del inicio de un documento.
 * @returns {{ data: Record<string, any>, body: string }}
 */
export function parseFrontmatter(raw) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(raw);
  if (!match) return { data: {}, body: raw };
  return { data: parseYamlBlock(match[1]), body: raw.slice(match[0].length) };
}

/** Parsea el cuerpo de un bloque YAML plano clave/valor. */
function parseYamlBlock(block) {
  const data = {};
  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf(":");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const rawValue = trimmed.slice(idx + 1).trim();
    data[key] = parseValue(rawValue);
  }
  return data;
}

function parseValue(value) {
  if (value === "") return "";
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((item) => unquote(item.trim()))
      .filter(Boolean);
  }
  if (value === "true") return true;
  if (value === "false") return false;
  return unquote(value);
}

function unquote(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

/** Serializa un objeto plano a un bloque frontmatter YAML. */
export function stringifyFrontmatter(data) {
  const lines = ["---"];
  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.join(", ")}]`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }
  lines.push("---");
  return lines.join("\n");
}
