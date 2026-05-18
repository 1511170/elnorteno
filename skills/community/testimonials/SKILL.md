---
name: testimonials
category: community
version: 1.0.0
description: Testimonios de clientes con schema.org Review
tags: [social-proof, seo]
requires: []
needs: []
recommendedFor: [static, ecommerce]
---

# Skill: testimonials

Sistema de testimonios con schema.org Review markup para SEO/AI citations.

## Qué hace

- Componente `TestimonialsGrid` para mostrar testimonios
- Schema.org Review markup automático
- CMS collection para que clientes agreguen testimonios
- Optimizado para AI citations (ratings, author, reviewBody)

## Instalación

```bash
node scripts/skill-add.js testimonials
```

## Uso en Astro

```astro
---
import TestimonialsGrid from '@skills/community/testimonials/components/TestimonialsGrid.astro';
---

<TestimonialsGrid limit={6} showRatings={true} />
```

## Datos (CMS)

El cliente puede agregar testimonios via CMS:

```yaml
- author: "Juan Pérez"
  company: "Importadora XYZ"
  quote: "Excelente servicio logístico..."
  rating: 5
  image: "/uploads/juan.jpg"
  date: "2024-01-15"
```

## Schema.org generado

```json
{
  "@context": "https://schema.org",
  "@type": "Review",
  "author": {"@type": "Person", "name": "Juan Pérez"},
  "reviewRating": {"@type": "Rating", "ratingValue": "5"},
  "reviewBody": "Excelente servicio..."
}
```

## Creó esta skill

- **Fecha**: 2024
- **Proyecto**: kinto-cms (inicial)
- **IA**: Kimi Code
- **Reutilizable**: Sí, para cualquier sitio que necesite testimonios
