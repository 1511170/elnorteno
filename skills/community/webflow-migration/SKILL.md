---
name: webflow-migration
category: community
version: 1.0.0
description: Conversor de sitios Webflow a Astro
tags: [migration, webflow]
requires: []
needs: []
recommendedFor: [static]
---

# Webflow Migration

Skill para migrar sitios Webflow a Astro manteniendo el diseño original.

## Uso Rápido

```bash
# Exportar desde Webflow
# 1. Webflow → Export Code → Descargar ZIP
# 2. Descomprimir en sites/[nombre]/

# Migrar a Astro
./migrate.sh [nombre-sitio]
```

## Flujo de Migración

### 1. Exportar desde Webflow

1. Abrir proyecto en Webflow
2. Click en "Export Code" (icono de código)
3. Descargar ZIP
4. Descomprimir en `sites/[nombre]/`

### 2. Estructura Webflow Export

```
webflow-export/
├── index.html              # Página principal
├── css/
│   └── [sitio].webflow.[hash].css  # CSS principal
├── js/
│   └── webflow.js          # JS de Webflow
├── images/                 # Assets
└── [otras-paginas].html
```

### 3. Migrar a Astro

#### Opción A: Mantener CSS Original (Recomendado para producción rápida)

```bash
# 1. Copiar CSS a public/
mkdir -p sites/mi-sitio/public/css
cp webflow-export/css/*.css sites/mi-sitio/public/css/

# 2. Crear layout base
# src/layouts/Layout.astro
```

```astro
---
// Layout.astro - Usar CSS Webflow original
---
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/css/mi-sitio.webflow.css">
</head>
<body>
  <slot />
</body>
</html>
```

#### Opción B: Migrar a Tailwind (Para rediseño futuro)

```bash
# 1. Instalar Tailwind (ya incluido en el template)
# El template usa @astrojs/tailwind con Tailwind 3.4

# 2. Configurar astro.config.mjs (ya configurado)
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [tailwind()]
});
```

**⚠️ Advertencia:** Migrar CSS complejo de Webflow a Tailwind puede tomar mucho tiempo y causar problemas en producción.

### 4. Componentización

```
src/
├── components/
│   ├── shared/
│   │   ├── Header.astro    # Navegación
│   │   ├── Footer.astro    # Footer
│   │   └── Head.astro      # Meta tags, SEO
│   ├── home/
│   │   ├── Hero.astro      # Sección hero
│   │   ├── Features.astro  # Features grid
│   │   └── CTA.astro       # Call to action
│   └── ui/                 # Componentes reutilizables
├── layouts/
│   └── Layout.astro
└── pages/
    └── index.astro
```

### 5. Script de Migración

```bash
#!/bin/bash
# migrate.sh

SITE_NAME=$1
WEBFLOW_DIR="sites/$SITE_NAME/webflow-export"
ASTRO_DIR="sites/$SITE_NAME"

# Crear estructura Astro
mkdir -p "$ASTRO_DIR/src/components/shared"
mkdir -p "$ASTRO_DIR/src/layouts"
mkdir -p "$ASTRO_DIR/src/pages"
mkdir -p "$ASTRO_DIR/public/css"
mkdir -p "$ASTRO_DIR/public/js"
mkdir -p "$ASTRO_DIR/public/images"

# Copiar assets
cp "$WEBFLOW_DIR/css/"*.css "$ASTRO_DIR/public/css/" 2>/dev/null || true
cp "$WEBFLOW_DIR/js/"*.js "$ASTRO_DIR/public/js/" 2>/dev/null || true
cp -r "$WEBFLOW_DIR/images/"* "$ASTRO_DIR/public/images/" 2>/dev/null || true

echo "Migración completada para: $SITE_NAME"
```

## Lecciones Aprendidas

### ✅ Lo que funciona

1. **Mantener CSS original:** Más rápido, menos bugs
2. **Componentizar gradualmente:** No todo de una vez
3. **Usar Cloudflare Tunnel:** Testing en tiempo real
4. **Deploy temprano:** Probar en producción desde el inicio

### ❌ Lo que evitar

1. **Migrar a Tailwind de inmediato:** CSS complejo = problemas
2. **Cambiar todo el HTML:** Rompe el diseño
3. **Esperar al final para deploy:** Sorpresas desagradables
4. **Ignorar el build:** Siempre probar `npm run build`

## Problemas Comunes

### CSS no carga

```bash
# Verificar ruta en Layout.astro
<link rel="stylesheet" href="/css/archivo.css">
# NOTA: Sin "public/" en la ruta
```

### Imágenes rotas

```bash
# Mover a public/images/
# Referenciar como /images/archivo.jpg
```

### JavaScript no funciona

```bash
# Webflow JS depende de su estructura HTML
# Mantener IDs y clases originales
```

## Checklist de Migración

- [ ] Exportar código de Webflow
- [ ] Copiar CSS/JS/Imágenes a public/
- [ ] Crear Layout.astro con CSS original
- [ ] Crear páginas básicas
- [ ] Probar `npm run dev`
- [ ] Probar `npm run build`
- [ ] Deploy a Cloudflare Pages
- [ ] Componentizar secciones gradualmente

## Ejemplo: EduPayments

**Antes (Webflow):**
- 245KB CSS minificado
- HTML estático
- Sin componentes

**Después (Astro):**
- Mismo CSS (245KB)
- Componentes reutilizables
- SEO dinámico
- Cloudflare Pages

## Recursos

- [Astro Migration Guide](https://docs.astro.build/en/guides/migrate-to-astro/)
- [Webflow University](https://university.webflow.com/)
