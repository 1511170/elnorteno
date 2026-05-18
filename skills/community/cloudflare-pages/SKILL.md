---
name: cloudflare-pages
category: community
version: 1.0.0
description: Configuración de deploy a Cloudflare Pages
tags: [deploy, cloudflare]
requires: []
needs: []
recommendedFor: [static]
---

# Cloudflare Pages

Skill para deployar sitios estáticos Astro a Cloudflare Pages con flujo de trabajo dev/prod.

## Uso Rápido

```bash
# Deploy a producción
./deploy-production.sh

# O manualmente
cd sites/[nombre]
npm run build
wrangler pages deploy dist --project-name=[nombre-prod]
```

## Configuración

### 1. Instalar wrangler

```bash
npm install -g wrangler
wrangler login
```

### 2. Crear proyecto en Cloudflare Pages

```bash
# Para nuevo proyecto
wrangler pages project create [nombre-proyecto] --production-branch=main
```

### 3. Configurar wrangler.toml

```toml
name = "mi-proyecto"
compatibility_date = "2024-01-01"

[build]
command = "npm run build"
output_directory = "dist"

[site]
bucket = "./dist"
```

### 4. Configurar dominio personalizado

En el dashboard de Cloudflare Pages:
1. Ir a "Custom domains"
2. Agregar dominio: `tudominio.com`
3. Cloudflare configura DNS automáticamente

## Flujo de Trabajo Recomendado

### Desarrollo (Dev)
- **URL:** `*.1511170.xyz` o `*.611160.xyz`
- **Servidor:** Astro dev (hot reload)
- **Comando:** `./start-development.sh`

### Producción (Prod)
- **URL:** `*.kinto.info`
- **Servidor:** Cloudflare Pages (CDN)
- **Comando:** `./deploy-production.sh`

## Estructura de Proyecto

```
mi-proyecto/
├── sites/mi-sitio/
│   ├── src/
│   ├── public/
│   ├── dist/              # Build output (generado)
│   ├── package.json
│   └── wrangler.toml      # Config Cloudflare
├── deploy-production.sh   # Script de deploy
└── start-development.sh   # Script de desarrollo
```

## Scripts

### deploy-production.sh

```bash
#!/bin/bash
# Deploy a Cloudflare Pages

cd sites/mi-sitio
npm install
npm run build
wrangler pages deploy dist --project-name=mi-proyecto-prod --branch=main
```

### start-development.sh

```bash
#!/bin/bash
# Iniciar servidor de desarrollo

cd sites/mi-sitio
npm run dev -- --host --port 4321
```

## Variables de Entorno

Crear `.env` en el root del sitio:

```env
# Cloudflare
CLOUDFLARE_API_TOKEN=tu_token
CLOUDFLARE_ACCOUNT_ID=tu_account_id

# Site config
SITE_URL=https://tudominio.com
```

## GitHub Actions (Opcional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - name: Deploy
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          projectName: mi-proyecto-prod
          directory: dist
```

## Comandos Útiles

```bash
# Ver proyectos
wrangler pages project list

# Ver deploys
wrangler pages deployment list --project-name=mi-proyecto

# Ver logs
wrangler pages deployment tail --project-name=mi-proyecto

# Eliminar proyecto
wrangler pages project delete mi-proyecto
```

## Troubleshooting

### Build falla

```bash
# Limpiar y reintentar
rm -rf node_modules dist
npm install
npm run build
```

### Dominio no funciona

1. Verificar DNS en Cloudflare
2. Esperar propagación (puede tomar minutos)
3. Verificar SSL certificate

### Cache issues

```bash
# Purge cache en Cloudflare dashboard
# O agregar headers de cache en wrangler.toml
```

## Recursos

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Astro Adapter](https://docs.astro.build/en/guides/integrations-guide/cloudflare/)

## Ejemplos

### Deploy manual

```bash
cd /home/5toai/edupayments/sites/edupayments
npm run build
wrangler pages deploy dist --project-name=edupayments-kinto-prod
```

### Deploy con dominio personalizado

```bash
# 1. Crear proyecto
wrangler pages project create edupayments-kinto-prod --production-branch=main

# 2. Configurar dominio en dashboard
# Dashboard → Pages → edupayments-kinto-prod → Custom domains → Add

# 3. Deploy
wrangler pages deploy dist --project-name=edupayments-kinto-prod
```

## Notas

- Cloudflare Pages es **gratuito** para uso personal
- Límite: 500 builds por mes
- CDN global incluido
- SSL automático
- Soporta Astro, React, Vue, etc.
