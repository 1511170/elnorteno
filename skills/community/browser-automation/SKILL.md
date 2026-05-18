---
name: browser-automation
category: community
version: 1.0.0
description: Testing E2E y screenshots con Puppeteer
tags: [testing, qa, puppeteer]
requires: []
needs: []
recommendedFor: [static, ecommerce]
---

# Skill: browser-automation

Automatización de navegador con Puppeteer + Chromium para testing visual y funcional.

## Qué hace

- 📸 **Screenshots** de todas las páginas del sitio
- 🖱️ **Testing de navegación** (clicks, hover, scroll)
- ✅ **Validación de elementos** (existencia, visibilidad, texto)
- 📱 **Testing responsive** (móvil, tablet, desktop)
- 🎨 **Visual regression** (comparar con versiones anteriores)
- 📊 **Reportes** con resultados de los tests

## Instalación

```bash
node scripts/skill-add.js browser-automation
```

Instala dependencias:
```bash
npm install puppeteer --legacy-peer-deps
```

## Uso

### 1. Screenshots de todo el sitio
```bash
npm run test:visual
```

### 2. Testing de navegación
```bash
npm run test:e2e
```

### 3. Validar página específica
```bash
node skills/community/browser-automation/test-runner.js --url=https://tusitio.com --action=screenshot
```

## Tests incluidos

- ✅ Links funcionan (no rotos)
- ✅ Botones responden al click
- ✅ Formularios se envían correctamente
- ✅ Navegación móvil (menú hamburguesa)
- ✅ Carga de imágenes
- ✅ CSS aplicado correctamente

## Reportes

Generados en `test-results/`:
- `screenshots/` - Capturas de pantalla
- `report.html` - Reporte visual interactivo
- `errors.json` - Errores encontrados

## Configuración

En `config/site.config.ts`:

```typescript
browserAutomation: {
  enabled: true,
  baseUrl: 'http://localhost:3000',
  viewports: [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1920, height: 1080 }
  ],
  pagesToTest: ['/', '/servicios', '/nosotros', '/contacto', '/blog']
}
```

## Requiere

- Node.js 18+
- Puppeteer (se instala automáticamente)
- Chromium (se descarga automáticamente con Puppeteer)
