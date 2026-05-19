# KINTO CMS

Generador de sitios web estáticos **agent-native** con arquitectura de skills.
Core mínimo + skills bajo demanda = sitios ultra-rápidos, escalables y fáciles
de mantener por agentes de IA (Claude Code, Kimi, Qwen, Codex, Cursor).

## 🚀 Arranque en un comando

```bash
# Windows (PowerShell)
irm get.kinto.co | iex

# macOS / Linux
curl -fsSL get.kinto.co | bash

# o directamente con npx
npx kinto-cms@latest start
```

El wizard `kinto start` instala dependencias, te pregunta el tipo de sitio
(estático o tienda), instala las skills recomendadas y deja todo corriendo.

## 🎯 Filosofía

```
CORE (Astro 5 + Tailwind 3)  →  mínimo, read-only, sin features
        +
SKILLS bajo demanda          →  kinto skill add <nombre>
        =
SITIO del cliente            →  core + skills activas
```

Una skill creada queda disponible para **todos** los sitios. El marketplace
(`kinto marketplace`) es el catálogo; aportar una skill es un simple PR.

## 🛠️ El CLI `kinto`

| Comando                                              | Qué hace                              |
| ---------------------------------------------------- | ------------------------------------- |
| `kinto start`                                        | Wizard de arranque out-of-the-box     |
| `kinto doctor`                                       | Diagnostica el entorno                |
| `kinto update`                                       | Actualiza el motor sin tocar `sites/` |
| `kinto create-site <n> --template=static\|ecommerce` | Crea un sitio                         |
| `kinto dev \| build \| deploy --site=<n>`            | Desarrollo / build / deploy           |
| `kinto marketplace`                                  | Catálogo de skills instalables        |
| `kinto skill add\|remove\|create\|search\|validate`  | Gestión de skills                     |
| `kinto sites list\|clone`                            | Gestión de sitios                     |

## 🏗️ Estructura

```
kinto-cms/
├── bin/ cli/             # El CLI kinto
├── core/                 # Motor Astro + Tailwind (read-only)
├── skills/               # Marketplace: official/ + community/ + registry.json
├── sites/                # Sitios de clientes
├── templates/            # enterprise/ (estático) y ecommerce/ (tienda)
└── .claude/              # agents/, commands/, skills/ (boris, graphify), hooks/
```

## 🧩 Dos tipos de skill

- **Site-skills** (`skills/`): plugins de componentes para construir sitios.
  Ej: `cms-sveltia`, `blog`, `testimonials`, `shopify-ecommerce`.
- **Agent-skills** (`.claude/skills/`): capacidades del agente. Ej: `boris`
  (metodología de trabajo) y `graphify` (knowledge graph, opt-in).

## 🛒 Modo Ecommerce

`kinto create-site mi-tienda --template=ecommerce` crea una tienda Shopify
headless completa (catálogo, carrito, checkout, búsqueda, SEO, Worker de
Cloudflare) vía la skill oficial `shopify-ecommerce`.

## 📚 Documentación

- **`AGENTS.md`** — guía maestra para cualquier agente de código (empieza aquí)
- **`CONTRIBUTING.md`** — cómo aportar una skill
- **`MARKETPLACE.md`** — catálogo de skills (autogenerado)
- **`KINTO.md`** — filosofía y deep-dive
- **`.claude/skills/boris/`** — metodología Boris Cherny embebida

---

**KINTO CMS v3** — Agent-native. Core mínimo + skills bajo demanda.
