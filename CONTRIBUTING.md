# Contribuir a KINTO CMS

KINTO CMS es un sistema de skills. La forma principal de aportar es **añadiendo
una site-skill al marketplace**. Cualquiera puede hacerlo con un PR.

## TL;DR — aportar una skill en 5 pasos

```bash
# 1. Clona y crea una rama
git clone <repo> && cd kinto-cms
git checkout -b skill/mi-skill

# 2. Genera el scaffold (crea SKILL.md con frontmatter, index.ts, components/)
kinto skill create mi-skill

# 3. Implementa el componente en skills/community/mi-skill/
#    y completa SKILL.md (descripción, props, ejemplo de uso)

# 4. Valida — regenera registry.json y MARKETPLACE.md
kinto skill validate

# 5. Commit + PR
git add skills/community/mi-skill skills/registry.json MARKETPLACE.md
git commit -m "feat(skill): mi-skill"
git push origin skill/mi-skill
```

Abre el PR usando la plantilla de skill. CI valida el frontmatter, regenera el
registry y hace un build de prueba. Una vez en `main`, tu skill es instalable
por **todos los proyectos** KINTO con `kinto skill add mi-skill`.

## Anatomía de una site-skill

```
skills/{official,community}/<nombre>/
├── SKILL.md          # Frontmatter de registry + documentación
├── index.ts          # Exporta los componentes (obligatorio si hay components/)
├── components/        # Componentes Astro
└── config/            # Config de CMS opcional
```

### Frontmatter obligatorio en SKILL.md

```yaml
---
name: mi-skill # kebab-case, == nombre de carpeta
category: community # official | community
version: 1.0.0 # semver
description: Una línea clara de qué hace la skill
tags: [tag1, tag2] # para búsqueda en el marketplace
requires: [] # otras site-skills de las que depende
needs: [] # requisitos externos: shopify, cloudflare-kv, python
recommendedFor: [static] # static | ecommerce
---
```

## Reglas (anti-patrones que CI y review rechazan)

1. **Cero hardcode de cliente.** Nada de dominios, nombres ni APIs de un cliente
   concreto en el código de la skill. Usa props o `config/site.config.ts`.
2. **Reutilizable.** Si solo sirve para un sitio, no es una skill.
3. **No toques `core/`.** El core es de solo lectura; extiende vía skills.
4. **Tailwind, no CSS ad-hoc.** Usa utility classes.
5. **schema.org cuando aplique.** SEO es parte del estándar KINTO.
6. **Documenta los props** en una tabla en SKILL.md.

## Tipos de skill

- **Site-skills** (`skills/`): plugins de componentes para construir sitios.
  Es lo que vive en el marketplace.
- **Agent-skills** (`.claude/skills/`): capacidades del agente que trabaja en el
  repo (ej. `boris`, `graphify`). Se aportan igual, pero van en `.claude/skills/`.

## Antes de aportar

Lee `AGENTS.md` — la guía maestra para cualquier agente de código (Claude, Kimi,
Qwen, Codex, Cursor). Define el workflow, los principios y los anti-patrones.
