# 🤖 AGENTS.md — Guía Maestra para Agentes de Código

> **Para:** Claude Code, Kimi Code, Qwen Code, Codex, Cursor, GitHub Copilot, o
> cualquier agente de código.
> **Versión:** 3.0.0 — "Agent-Native"
> **Esta es la fuente única de verdad.** `CLAUDE.md`, `.cursorrules` y demás son
> punteros finos a este archivo.

---

## 🎯 Contexto Inmediato (Leer Esto Primero)

| Campo       | Valor                                                                   |
| ----------- | ----------------------------------------------------------------------- |
| **Sistema** | KINTO CMS — generador de sitios estáticos con arquitectura de skills    |
| **Stack**   | Astro 5 + Tailwind 3 + Sveltia CMS (+ Cloudflare Worker en modo tienda) |
| **Patrón**  | Core mínimo + skills bajo demanda                                       |
| **CLI**     | `kinto` (ver `bin/kinto.js`) — punto de entrada a todo                  |

**Tu misión:** crear y mantener sitios web para clientes usando solo skills
reutilizables. Nunca escribas código ad-hoc si existe o puedes crear una skill.

---

## ⚡ Arranque en un comando

```bash
# Proyecto nuevo desde cero (instala, configura y levanta todo):
npx kinto-cms@latest start
# o el instalador de una línea (Worker get.kinto.co detecta el SO):
#   Windows : irm get.kinto.co | iex
#   Unix    : curl -fsSL get.kinto.co | bash

# Dentro de un repo KINTO ya clonado:
kinto start                 # wizard interactivo
kinto doctor                # diagnostica el entorno
```

---

## 🛠️ El CLI `kinto` — todos los comandos

| Comando                                              | Qué hace                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------- |
| `kinto start`                                        | Wizard: crea, configura y levanta un sitio                        |
| `kinto doctor`                                       | Diagnostica el entorno (Node, npm, git, Python)                   |
| `kinto update`                                       | Actualiza core/skills/templates desde upstream (no toca `sites/`) |
| `kinto create-site <n> --template=static\|ecommerce` | Crea un sitio nuevo                                               |
| `kinto dev --site=<n>`                               | Servidor de desarrollo                                            |
| `kinto build --site=<n>`                             | Build estático                                                    |
| `kinto deploy --site=<n>`                            | Deploy a Cloudflare                                               |
| `kinto marketplace`                                  | Lista las site-skills instalables                                 |
| `kinto skill add <n> --site=<s>`                     | Instala una skill en un sitio                                     |
| `kinto skill remove <n> --site=<s>`                  | Desinstala una skill                                              |
| `kinto skill create <n>`                             | Scaffold de una skill nueva                                       |
| `kinto skill search <texto>`                         | Busca skills por nombre/tag/descripción                           |
| `kinto skill validate`                               | Valida skills y regenera el registry                              |
| `kinto sites list \| clone`                          | Gestión de sitios                                                 |

---

## 🧩 Dos tipos de "skill" — no los confundas

| Tipo            | Qué es                                            | Dónde vive                     |
| --------------- | ------------------------------------------------- | ------------------------------ |
| **Site-skill**  | Plugin de componentes Astro para construir sitios | `skills/{official,community}/` |
| **Agent-skill** | Capacidad del agente que trabaja en el repo       | `.claude/skills/`              |

El **marketplace** (`kinto marketplace`, `MARKETPLACE.md`) es de site-skills.
Las agent-skills incluidas son `boris` (metodología) y `graphify` (knowledge
graph, opt-in, requiere Python).

---

## 🧠 Principios de Oro (metodología Boris Cherny)

KINTO adopta la metodología de [howborisusesclaudecode.com](https://howborisusesclaudecode.com).
La agent-skill `boris` (`.claude/skills/boris/`) tiene el detalle completo.

### 1. Planifica antes de tocar 3+ archivos

Plan escrito primero: objetivo, archivos, skills a usar/crear, cómo verificar.

### 2. Verificación es todo

> _"Dale al agente un loop de feedback y la calidad mejora 2-3x."_

Tras cada cambio significativo: `kinto build` debe pasar y `kinto dev` debe verse
bien. Build + preview son **obligatorios** antes de entregar.

### 3. Skills > código ad-hoc

Si existe una skill → úsala. Si no → créala con `kinto skill create`. Nunca
copies componentes entre sitios.

### 4. Zero hardcode

Nada de valores de cliente en código de skill. Usa `config/site.config.ts`,
props y variables de entorno (`.env`, nunca commitear).

### 5. Documentación viva

Si cometes un error y lo corriges, **actualiza este AGENTS.md** (sección
Anti-Patrones) para que no se repita.

### 6. Commits incrementales

Commits pequeños y enfocados por unidad lógica de trabajo, bien documentados.

---

## 📁 Estructura del Proyecto

```
kinto-cms/
├── AGENTS.md             ← Estás aquí (fuente de verdad para todo agente)
├── CLAUDE.md             ← Puntero fino para Claude Code
├── MARKETPLACE.md        ← Catálogo de skills (autogenerado, no editar)
├── CONTRIBUTING.md       ← Cómo aportar una skill vía PR
├── bin/kinto.js          ← Entry point del CLI
├── cli/                  ← Implementación del CLI (commands/, lib/)
│
├── core/                 ← 🚫 NO TOCAR. Motor Astro + Tailwind
│
├── skills/               ← 🧩 Marketplace de site-skills
│   ├── registry.json     ← Manifest autogenerado
│   ├── official/         ← Skills mantenidas (cms-sveltia, shopify-ecommerce…)
│   └── community/        ← Skills de la comunidad
│
├── sites/                ← 🌐 Sitios de clientes (creados con kinto create-site)
│
├── templates/
│   ├── enterprise/       ← Template de sitio estático/corporativo
│   └── ecommerce/        ← Template de tienda Shopify
│
└── .claude/
    ├── agents/           ← Subagentes especializados
    ├── commands/         ← Slash commands
    ├── hooks/            ← Hooks (formato scoped al archivo editado)
    ├── skills/           ← Agent-skills: boris, graphify
    └── settings.json
```

---

## 🔧 Workflows

### Crear un sitio estático (corporativo / informativo)

```bash
kinto create-site mi-cliente --template=static
cd sites/mi-cliente && npm install
kinto skill add cms-sveltia --site=mi-cliente
kinto build --site=mi-cliente   # verificar
```

### Crear una tienda (ecommerce)

```bash
kinto create-site mi-tienda --template=ecommerce
cd sites/mi-tienda && npm install
# Copia .env.example a .env y completa credenciales de Shopify.
kinto build --site=mi-tienda
```

La skill `shopify-ecommerce` provee catálogo, carrito, checkout, búsqueda, SEO y
un Worker de Cloudflare. Namespace de metafields configurable
(`METAFIELD_NAMESPACE` en `config/shopify.graphql.ts`, default `kinto`).
Ver `skills/official/shopify-ecommerce/docs/METAFIELDS_SETUP.md`.

### Crear una skill nueva

```bash
kinto skill create mi-skill     # scaffold con frontmatter listo
# implementa, completa SKILL.md, valida y abre PR
kinto skill validate
```

Detalle completo del flujo de PR: `CONTRIBUTING.md`.

### Actualizar el motor KINTO en un proyecto existente

```bash
kinto update    # actualiza core/skills/templates/.claude; sites/ queda intacto
```

---

## ❌ Anti-Patrones (NO Hacer)

> **Regla:** si descubres uno nuevo, agrégalo aquí.

| #   | Anti-Patrón                                      | Por qué está mal                  | En su lugar                         |
| --- | ------------------------------------------------ | --------------------------------- | ----------------------------------- |
| 1   | Hardcodear valores de cliente en una skill       | La skill deja de ser reutilizable | `site.config.ts` o props            |
| 2   | Copiar componentes entre sitios                  | Duplicación imposible de mantener | Extraer a `skills/community/`       |
| 3   | Modificar `core/`                                | Rompe todos los sitios            | Crear una skill                     |
| 4   | Instalar skills que el brief no pide             | Bloat, builds lentos              | Solo lo necesario                   |
| 5   | Olvidar `kinto build` antes de terminar          | Errores en producción             | Build + preview obligatorios        |
| 6   | Commitear `.env` o secrets                       | Riesgo de seguridad               | `.env` está en `.gitignore`         |
| 7   | Editar `MARKETPLACE.md` o `registry.json` a mano | Se sobrescriben                   | `kinto skill validate` los regenera |
| 8   | Confundir site-skill con agent-skill             | Van en carpetas distintas         | Ver la tabla de arriba              |

---

## 🔗 Referencias

| Recurso                         | Para qué                             |
| ------------------------------- | ------------------------------------ |
| `CONTRIBUTING.md`               | Aportar una skill vía PR             |
| `MARKETPLACE.md`                | Catálogo de skills instalables       |
| `KINTO.md`                      | Filosofía y deep-dive del sistema    |
| `STRUCTURE.md`                  | Arquitectura detallada               |
| `.claude/skills/boris/SKILL.md` | Metodología Boris completa (87 tips) |

---

## 🚀 TL;DR

```bash
npx kinto-cms@latest start          # arranque out-of-the-box
kinto create-site cliente --template=static
kinto skill add testimonials --site=cliente
kinto build --site=cliente          # verificar SIEMPRE
```

**Recuerda:** planifica antes de tocar 3+ archivos · verifica con build ·
skills > código ad-hoc · cero hardcode · commits incrementales.
