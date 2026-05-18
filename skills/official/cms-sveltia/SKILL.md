---
name: cms-sveltia
category: official
version: 1.0.0
description: CMS visual Git-based con Sveltia — panel de edición para el cliente
tags: [cms, sveltia, content]
requires: []
needs: []
recommendedFor: [static, ecommerce]
---

# Skill: cms-sveltia

Integra Sveltia CMS para edición visual de contenido vía Git.

## Qué hace

- Añade panel de admin en `/admin`
- Permite edición visual sin código
- Auto-deploy a Cloudflare Pages en cada cambio
- Git-based: rollback completo del historial

## Instalación

```bash
node scripts/skill-add.js cms-sveltia
```

## Configuración

Configura en `config/site.config.ts`:

```typescript
cms: {
  enabled: true,
  subdomain: 'swl.kinto.info',  // Oculto
  hidden: true,
  githubRepo: 'tu-usuario/tu-repo-content'
}
```

## Uso por el cliente

1. Accede a: `https://swl.kinto.info/admin`
2. Autentica con GitHub
3. Edita contenido visualmente
4. Click "Publish" → Deploy automático en ~60s

## Collections disponibles

Esta skill es el framework. Otras skills añaden sus collections:
- `skill:pages` → Añade colección de páginas
- `skill:blog` → Añade colección de blog
- `skill:team` → Añade colección de equipo
