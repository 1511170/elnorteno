/**
 * get.kinto.co — proxy inteligente para los instaladores de KINTO CMS.
 *
 * Rutas:
 *   GET /                  -> install.ps1 o install.sh según User-Agent
 *   GET /install.ps1       -> install.ps1 (forzado)
 *   GET /install.sh        -> install.sh (forzado)
 *   GET /version           -> versión actual del paquete (proxy a npm registry)
 *   GET /health            -> { ok: true }
 *
 * Todos los scripts se sirven desde raw.githubusercontent.com/1511170/kinto-cms/main/.
 * Cache 5 min en el edge; el usuario siempre puede forzar refresh con ?nocache=1.
 */

const REPO_RAW = "https://raw.githubusercontent.com/1511170/kinto-cms/main";
const NPM_PKG = "https://registry.npmjs.org/kinto-cms/latest";

const FILES = {
  ps1: { path: "install.ps1", type: "text/plain; charset=utf-8" },
  sh: { path: "install.sh", type: "text/x-shellscript; charset=utf-8" },
};

function pickInstaller(ua) {
  // PowerShell, curl en Windows, o cualquier UA que mencione Windows -> ps1.
  // El resto (curl/wget en Mac/Linux, bash, etc.) -> sh.
  return /Windows|PowerShell|WindowsPowerShell/i.test(ua) ? "ps1" : "sh";
}

async function serveInstaller(kind, request) {
  const file = FILES[kind];
  const url = new URL(request.url);
  const cache =
    url.searchParams.get("nocache") === "1"
      ? "no-store"
      : "public, max-age=300";

  const upstream = await fetch(`${REPO_RAW}/${file.path}`, {
    cf: { cacheTtl: 300, cacheEverything: true },
  });

  if (!upstream.ok) {
    return new Response(
      `# Upstream ${upstream.status}: ${file.path} no disponible\n`,
      {
        status: 502,
        headers: { "content-type": file.type },
      },
    );
  }

  return new Response(upstream.body, {
    status: 200,
    headers: {
      "content-type": file.type,
      "cache-control": cache,
      "x-kinto-source": `${REPO_RAW}/${file.path}`,
      "access-control-allow-origin": "*",
    },
  });
}

async function serveVersion() {
  try {
    const res = await fetch(NPM_PKG, {
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!res.ok) throw new Error(`npm registry ${res.status}`);
    const json = await res.json();
    return Response.json(
      { name: json.name, version: json.version, description: json.description },
      { headers: { "cache-control": "public, max-age=300" } },
    );
  } catch (e) {
    return Response.json({ error: e.message }, { status: 502 });
  }
}

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (path === "/health") {
      return Response.json({ ok: true, service: "get.kinto.co" });
    }
    if (path === "/version") {
      return serveVersion();
    }
    if (path === "/install.ps1") {
      return serveInstaller("ps1", request);
    }
    if (path === "/install.sh") {
      return serveInstaller("sh", request);
    }
    if (path === "/") {
      const ua = request.headers.get("user-agent") || "";
      return serveInstaller(pickInstaller(ua), request);
    }

    return new Response(
      [
        "KINTO CMS — get.kinto.co",
        "",
        "Endpoints:",
        "  GET /              -> instalador detectado por User-Agent",
        "  GET /install.ps1   -> Windows PowerShell",
        "  GET /install.sh    -> macOS / Linux",
        "  GET /version       -> versión actual del paquete npm",
        "  GET /health        -> healthcheck",
        "",
        "Repo: https://github.com/1511170/kinto-cms",
        "",
      ].join("\n"),
      { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } },
    );
  },
};
