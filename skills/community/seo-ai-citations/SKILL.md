---
name: seo-ai-citations
category: community
version: 1.0.0
description: SEO + schema.org (6+ tipos) optimizado para citaciones de IA
tags: [seo, schema-org, ai]
requires: []
needs: []
recommendedFor: [static, ecommerce]
---

# Skill: seo-ai-citations

SEO + AEO (AI Citation Optimization) con Schema.org completo para máxima visibilidad en buscadores y LLMs.

## Qué hace

- ✅ **SEOHead.astro** - Meta tags completos (Open Graph, Twitter Cards, Canonical, AI Citations)
- ✅ **SchemaOrg.astro** - JSON-LD structured data para todos los schemas importantes
- ✅ Schemas soportados:
  - Organization
  - WebSite
  - LocalBusiness
  - Service
  - FinancialService (para fintech)
  - BreadcrumbList
  - FAQPage
  - HowTo
  - BlogPosting
  - SoftwareApplication
  - AboutPage
  - ContactPage

## Instalación

```bash
node scripts/skill-add.js seo-ai-citations
```

## Uso

### 1. Layout Principal (Recomendado)

Modifica tu `Layout.astro` para incluir los componentes SEO:

```astro
---
// src/layouts/Layout.astro
import { SEOHead, SchemaOrg } from '@skills/community/seo-ai-citations';

interface Props {
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  keywords?: string[];
  schemaType?: string[];
  schemaData?: Record<string, any>;
}

const { 
  title = 'Mi Sitio',
  description = 'Descripción por defecto',
  type = 'website',
  keywords = [],
  schemaType = ['Organization', 'WebSite'],
  schemaData = {}
} = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  
  <!-- SEO + AI Citations -->
  <SEOHead 
    title={title}
    description={description}
    type={type}
    keywords={keywords}
  />
  
  <!-- Structured Data -->
  <SchemaOrg 
    type={schemaType}
    data={schemaData}
  />
</head>
<body>
  <main id="main-content">
    <slot />
  </main>
</body>
</html>
```

### 2. Uso en Páginas

```astro
---
// src/pages/index.astro
import Layout from '../layouts/Layout.astro';
---

<Layout 
  title="Inicio - Mi Sitio"
  description="Bienvenidos a mi sitio web"
  keywords={["inicio", "bienvenida"]}
>
  <h1>Bienvenidos</h1>
</Layout>
```

### Página de servicio

```astro
<SchemaOrg 
  type={["Organization", "WebSite", "FinancialService"]}
  data={{
    name: "International Student Payments",
    description: "Send money to universities worldwide",
    serviceType: "Payment Service",
    areaServed: "Global",
    fees: "Competitive rates from 0.5%"
  }}
/>
```

### Página con FAQ

```astro
<SchemaOrg 
  type={["Organization", "FAQPage"]}
  faqs={[
    { q: "How long do transfers take?", a: "1-2 business days" },
    { q: "What currencies are supported?", a: "50+ currencies" }
  ]}
/>
```

### Página con Breadcrumbs

```astro
<SchemaOrg 
  type={["Organization", "BreadcrumbList"]}
  breadcrumbs={[
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: "Student Payments", url: "/services/student-payments" }
  ]}
/>
```

### Página con HowTo

```astro
<SchemaOrg 
  type={["Organization", "HowTo"]}
  howToName="How to send money"
  howToDescription="Step by step guide to send money"
  steps={[
    { name: "Create account", text: "Sign up for free" },
    { name: "Add recipient", text: "Enter university details" },
    { name: "Send money", text: "Confirm and send" }
  ]}
/>
```

## Optimización de Imágenes SEO

### Open Graph / WhatsApp / redes sociales

El componente genera automáticamente los meta tags necesarios para que el thumbnail se vea correctamente al compartir en WhatsApp, Telegram, Facebook, Twitter/X y LinkedIn:

```html
<meta property="og:image"        content="https://tusitio.com/images/og-home.png" />
<meta property="og:image:alt"    content="Título de la página" />
<meta property="og:image:width"  content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:type"   content="image/png" />
<meta name="twitter:image"       content="https://tusitio.com/images/og-home.png" />
<meta name="twitter:image:alt"   content="Título de la página" />
```

**Recomendaciones para la imagen OG:**
- Tamaño ideal: **1200 × 630 px** (ratio 1.91:1)
- Formato: PNG o JPG (< 8 MB, idealmente < 1 MB)
- Asigna una imagen diferente por página para mejor CTR: `<Layout image="/images/og-pagina.png">`

### Estrategia de carga de imágenes en página

Para maximizar LCP (Largest Contentful Paint) y minimizar CLS:

**Imágenes hero / above-the-fold (primera imagen visible):**
```astro
<img
  src="/images/hero.png"
  alt="Descripción detallada con keywords"
  loading="eager"
  fetchpriority="high"
  decoding="sync"
/>
```

**Imágenes below-the-fold (catálogo, bio, extras):**
```astro
<img
  src="/images/product.png"
  alt="Descripción detallada con keywords"
  loading="lazy"
  decoding="async"
/>
```

**Alt text SEO-optimizado:** Incluye nombre de persona/producto, año, ubicación y contexto. Ejemplo: `"Portada del libro Una Voz al paso del Eclipse — Adriana Cristina Rueda, Bogotá 2026"`.

## Props SEOHead

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| title | string | required | Título de la página |
| description | string | required | Meta description |
| canonical | string | Astro.url.href | URL canónica |
| image | string | '/logo.png' | Imagen OG/Twitter (1200×630 px recomendado) |
| type | 'website' \| 'article' | 'website' | Tipo de contenido |
| publishedTime | string | - | Fecha de publicación |
| modifiedTime | string | - | Fecha de modificación |
| author | string | siteConfig.site.name | Autor |
| noindex | boolean | false | No indexar página |
| keywords | string[] | [] | Keywords para meta tag |

## Props SchemaOrg

| Prop | Tipo | Descripción |
|------|------|-------------|
| type | SchemaType \| SchemaType[] | Tipo(s) de schema |
| data | Record<string, any> | Datos adicionales del schema |
| breadcrumbs | Array<{name, url}> | Items de breadcrumb |
| faqs | Array<{q, a}> | Preguntas y respuestas |
| steps | Array<{name, text, url?}> | Pasos para HowTo |

## Metadata

- **Categoría**: community
- **Creada**: 2026-02-12
- **Versión**: 1.1.0
- **Basada en**: KINTO CMS Community
- **Reutilizable**: Sí
