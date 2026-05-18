---
name: web-scraper
category: community
version: 1.0.0
description: Scraping de contenido para migración de sitios
tags: [scraping, migration]
requires: []
needs: []
recommendedFor: [static]
---

# Skill: web-scraper

Web scraping y crawling para extraer contenido, imágenes y assets de sitios web existentes.

## Qué hace

- 🔍 **Crawling** - Navega todo el sitio y encuentra todas las páginas
- 📝 **Extrae contenido** - Textos, títulos, descripciones, testimonios
- 🖼️ **Descarga imágenes** - Logos, fotos, iconos, banners
- 📊 **Genera reporte** - Estructura del sitio y contenido extraído
- 💾 **Guarda todo** - En formato JSON y descarga archivos locales

## Instalación

```bash
node scripts/skill-add.js web-scraper
npm install puppeteer cheerio --legacy-peer-deps
```

## Uso

### Scrapear sitio completo
```bash
node skills/community/web-scraper/scripts/scrape.js --url=https://ejemplo.com --output=./scraped-content
```

### Scrapear solo una página
```bash
node skills/community/web-scraper/scripts/scrape-page.js --url=https://ejemplo.com/pagina
```

### Extraer solo imágenes
```bash
node skills/community/web-scraper/scripts/download-images.js --url=https://ejemplo.com --output=./images
```

## Output

```
scraped-content/
├── content.json          # Todo el contenido estructurado
├── pages/                # HTML de cada página
│   ├── index.html
│   ├── nosotros.html
│   └── ...
├── images/               # Imágenes descargadas
│   ├── logo.png
│   ├── hero-banner.jpg
│   └── ...
└── report.md             # Resumen de lo encontrado
```

## Estructura del content.json

```json
{
  "site": {
    "url": "https://ejemplo.com",
    "title": "Nombre del Sitio",
    "description": "..."
  },
  "pages": [
    {
      "url": "...",
      "title": "...",
      "headings": [...],
      "paragraphs": [...],
      "testimonials": [...],
      "services": [...],
      "images": [...]
    }
  ]
}
```

## Requiere

- Puppeteer (para JavaScript rendering)
- Cheerio (para parsear HTML)
