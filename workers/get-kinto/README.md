# get-kinto — Worker para `get.kinto.co`

Worker de Cloudflare que sirve los instaladores de KINTO CMS detectando el
User-Agent. Convierte `curl raw.githubusercontent.com/1511170/kinto-cms/...` en
un one-liner mucho más corto:

```powershell
# Windows
irm get.kinto.co | iex
```

```bash
# macOS / Linux
curl -fsSL get.kinto.co | bash
```

## Endpoints

| Ruta               | Devuelve                                                       |
| ------------------ | -------------------------------------------------------------- |
| `GET /`            | `install.ps1` o `install.sh` según User-Agent                  |
| `GET /install.ps1` | siempre el script de Windows                                   |
| `GET /install.sh`  | siempre el script de Unix                                      |
| `GET /version`     | última versión publicada en npm (proxy a `registry.npmjs.org`) |
| `GET /health`      | `{ ok: true }`                                                 |

Todo se sirve desde `raw.githubusercontent.com/1511170/kinto-cms/main/`. Cache 5
min en el edge — fuerza refresh con `?nocache=1`.

## Deploy

```bash
cd workers/get-kinto
npm install
npx wrangler login            # solo la primera vez
npx wrangler deploy
```

El primer deploy mostrará un warning si el custom domain `get.kinto.co` aún no
existe. Para configurarlo:

1. Cloudflare dashboard → Workers & Pages → `get-kinto` → Settings → Domains & Routes
2. **Add → Custom Domain** → `get.kinto.co`
3. Cloudflare crea el registro DNS automáticamente.

A partir de ahí, `https://get.kinto.co` resuelve al Worker.

## Verificar

```bash
curl -fsSL https://get.kinto.co/health
curl -fsSL https://get.kinto.co/version
curl -fsSL -A "PowerShell/7" https://get.kinto.co | head -5    # debe servir ps1
curl -fsSL -A "curl/8" https://get.kinto.co | head -5          # debe servir sh
```
