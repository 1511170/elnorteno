#!/usr/bin/env bash
# KINTO CMS — instalador de una línea para macOS / Linux.
#
# Uso:
#   curl -fsSL get.kinto.co | bash
#
# Clona el repo kinto-cms en la carpeta actual y lanza el wizard `kinto start`
# dentro del repo. El sitio queda en kinto-cms/sites/<nombre>/.

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

if ! command -v git >/dev/null 2>&1; then
  echo "❌ git no encontrado. Instálalo desde https://git-scm.com"
  exit 1
fi

REPO_URL="https://github.com/1511170/kinto-cms.git"
TARGET="$(pwd)/kinto-cms"

if [ -d "$TARGET" ]; then
  echo "▸ 'kinto-cms' ya existe; actualizando con git pull..."
  git -C "$TARGET" pull --ff-only
else
  echo "▸ Clonando KINTO CMS en $TARGET ..."
  git clone "$REPO_URL" "$TARGET"
fi

cd "$TARGET"
echo "▸ Lanzando el wizard de KINTO..."
echo ""
# `curl | bash` deja el script en stdin; el wizard es interactivo, así que
# redirigimos stdin al terminal controlador.
exec node bin/kinto.js start < /dev/tty
