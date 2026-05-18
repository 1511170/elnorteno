#!/usr/bin/env bash
# KINTO CMS — instalador de una línea para macOS / Linux.
#
# Uso:
#   curl -fsSL https://raw.githubusercontent.com/1511170/kinto-cms/main/install.sh | bash
#
# Verifica Node >= 18 y lanza el wizard `kinto start` vía npx.

set -euo pipefail

echo ""
echo "KINTO CMS — instalador"
echo ""

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js no encontrado. Instálalo desde https://nodejs.org (>= 18)."
  exit 1
fi

NODE_MAJOR="$(node -v | sed 's/v\([0-9]*\).*/\1/')"
if [ "$NODE_MAJOR" -lt 18 ]; then
  echo "❌ Se requiere Node >= 18 (tienes $(node -v))."
  exit 1
fi

echo "✅ Node $(node -v)"
echo "▸ Lanzando el wizard de KINTO..."
echo ""
exec npx --yes kinto-cms@latest start
