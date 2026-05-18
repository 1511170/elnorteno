---
name: blog
category: community
version: 1.0.0
description: Sistema de blog con listados, posts y schema.org BlogPosting
tags: [blog, content, seo]
requires: []
needs: []
recommendedFor: [static]
---

# Skill: blog

Sistema de blog completo con listado, posts individuales y componentes reutilizables.

## Qué hace

- ✅ Listado de posts con filtros por categoría
- ✅ Página individual de post
- ✅ Cards de blog reutilizables
- ✅ Schema.org BlogPosting para SEO
- ✅ Soporte para CMS (colección "blog")
- ✅ Responsive y estilado con Tailwind

## Instalación

```bash
node scripts/skill-add.js blog
```

## Uso

### Listado de posts

```astro
---
import { BlogList } from '@skills/community/blog';
const posts = await getCollection('blog');
---

<BlogList posts={posts} />
```

### Card individual

```astro
import { BlogCard } from '@skills/community/blog';

<BlogCard 
  title="Título del post"
  excerpt="Resumen del contenido..."
  date="2024-01-15"
  author="Autor"
  category="Categoría"
  slug="url-del-post"
/>
```

## CMS Integration

La skill configura automáticamente la colección "blog" en Sveltia CMS con campos:

- title
- excerpt
- date
- author
- category
- tags
- image
- published

## Metadata

- **Categoría**: community
- **Creada**: 2026-02-10
- **Versión**: 1.0.0
- **Reutilizable**: Sí
