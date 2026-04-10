# KINTO Content Management System (kinto-cms)

Sistema generador de sitios web estáticos empresariales con arquitectura de skills/plugins bajo demanda.

## 🎯 Filosofía: Core Mínimo + Skills Bajo Demanda

```
┌─────────────────────────────────────────────┐
│           KINTO CMS Architecture            │
├─────────────────────────────────────────────┤
│  CORE (Astro + Tailwind) - Mínimo, limpio   │
│  └── Sin skills activas por defecto         │
├─────────────────────────────────────────────┤
│  SKILLS - Se instalan SOLO cuando se        │
│  necesitan via: kinto skill add [name]      │
│  └── Una vez creada, disponible para todos  │
└─────────────────────────────────────────────┘
```

## 🏗️ Estructura

```
kinto-cms/
├── core/                    # Motor mínimo (sin skills)
├── skills/                  # Marketplace de skills
│   ├── official/            # Skills oficiales (SEO, CMS, etc)
│   └── community/           # Skills creadas por IA/usuarios
├── sites/                   # Sitios de clientes
│   └── [client]/            # Cada sitio = core + skills activas
└── templates/               # Templates base
```

## 🚀 Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Astro 5 (SSG) |
| Styling | Tailwind CSS 3 |
| CMS | Sveltia CMS (Git-based) |
| Hosting | Cloudflare Pages |
| Testing | Puppeteer + Browser Automation |
| Animaciones | GSAP + ScrollTrigger |

## 📦 Skills Disponibles (9 total)

### Oficiales
- `cms-sveltia` - Gestión de contenido

### Community
- `blog` - Sistema de blog con schema.org
- `contact-form` - Formularios profesionales
- `forms-web3forms` - Formularios sin backend
- `testimonials` - Testimonios con AI citations
- `cloudflare-tunnel` - Túneles permanentes
- `web-scraper` - Scraping de contenido
- `browser-automation` - Testing visual/E2E
- `webflow-effects` - Animaciones premium GSAP

[Ver catálogo completo →](SKILLS_CATALOG.md)

## 🧩 Sistema de Skills

### Principios

1. **Zero skills por defecto** - El core es puro Astro + Tailwind
2. **Instalación bajo demanda** - `kinto skill add [nombre]`
3. **Reutilización** - Una skill creada queda disponible para todos los sitios
4. **Composición** - Skills pueden depender de otras skills

### Comandos de Skills

```bash
# Ver skills disponibles
kinto skills:list

# Instalar skill en un sitio
kinto skill add seo-ai-citations --site=nombre-cliente

# Crear nueva skill (con ayuda de IA)
kinto skill:create testimonials --site=nombre-cliente
# → Crea en skills/community/testimonials/
# → Disponible para todos los sitios futuros

# Remover skill
kinto skill remove testimonials --site=nombre-cliente
```

### Estructura de una Skill

```
skills/community/testimonials/
├── SKILL.md                 # Doc: qué hace, cómo usar
├── index.ts                 # Entry point
├── components/              # Componentes Astro
├── cms-fields.yml           # Config de campos para Sveltia
└── example/                 # Ejemplo de uso
    └── page.astro
```

## 📝 Workflow de Generación con IA

### 1. Inicializar Sitio (Core limpio)

```bash
./kinto create-site nombre-cliente
# Crea: sites/nombre-cliente/ con solo Astro + Tailwind
```

### 2. IA Analiza y Sugiere Skills

```
IA: "Este sitio necesita:
  - seo-ai-citations (para AI citations)
  - cms-sveltia (para que el cliente edite)
  - forms-cloudflare (formulario de contacto)
  - testimonials (testimonios con schema.org)"
```

### 3. Instalar Skills Necesarias

```bash
node scripts/skill-add.js seo-ai-citations
node scripts/skill-add.js cms-sveltia
node scripts/skill-add.js forms-cloudflare
```

### 4. Si no existe una skill → Crearla

```bash
# IA crea nueva skill que luego se reutiliza
node scripts/skill-create.js fleet-tracker
# → Guardado en skills/community/fleet-tracker/
# → Disponible para todos los sitios futuros
```

## 🎨 Generación con Modelos de IA

### Prompt para Kimi Code / Claude Code

```
Estás usando KINTO CMS - sistema de sitios estáticos con skills.

CONTEXTO ACTUAL:
- Ubicación: /ruta/a/kinto-cms/
- Site de trabajo: sites/[nombre-cliente]/
- Core: Astro 5 + Tailwind 3 (sin skills activas)
- Skills disponibles: [ver en skills/]

REGLAS DE ORO:
1. CORE PRIMERO: Usa solo Astro + Tailwind nativo
2. SKILL SI EXISTE: Si necesitas funcionalidad, revisa skills/ primero
3. CREAR SKILL SI NO EXISTE: Si no hay skill similar, créala en skills/community/
4. NUNCA repitas código entre sitios - usa/refina skills existentes

TAREA:
Generar sitio completo para [DESCRIPCIÓN]

PASOS:
1. Revisa skills/ para ver qué funcionalidades ya existen
2. Instala las skills necesarias
3. Si falta alguna funcionalidad → crea nueva skill documentada
4. Genera el sitio usando skills instaladas + código específico

OUTPUT:
- Qué skills usaste/instalaste
- Qué skills nuevas creaste (si aplica)
- Estructura del sitio generado
```

## 🔐 CMS Oculto Configurable

En `sites/[client]/config/site.config.ts`:

```typescript
export default {
  site: {
    domain: 'tudominio.com',
    name: 'Nombre del Cliente'
  },
  cms: {
    enabled: true,
    subdomain: 'admin.tudominio.com',  // Oculto, no enlazado públicamente
    hidden: true,
    // Skills activas definen las colecciones disponibles
    collections: ['pages', 'blog']  // Auto-populado por skills
  }
};
```

## 📁 Estructura de un Sitio

```
sites/nombre-cliente/
├── src/
│   ├── components/          # Componentes específicos (sin skills)
│   ├── layouts/
│   ├── pages/               # Rutas Astro
│   ├── content/             # Contenido editable (definido por skills)
│   └── styles/
├── public/
├── skills-active.json       # Skills activas para ESTE sitio
├── config/
│   ├── site.config.ts
│   └── cms.config.yml       # Auto-generado de skills activas
└── package.json
```

## 🛠️ Ejemplo: Flujo Completo

```bash
# 1. Crear sitio para nuevo cliente
./kinto create-site nombre-cliente

# 2. IA analiza y decide skills necesarias
#    - seo-ai-citations (sí existe)
#    - cms-sveltia (sí existe)
#    - tracking-map (NO existe)

# 3. Instalar existentes
kinto skill add seo-ai-citations cms-sveltia

# 4. Crear skill nueva (IA genera)
kinto skill:create tracking-map
# IA crea: skills/community/tracking-map/
#          con componente de mapa, CMS fields, schema.org

# 5. Instalar skill nueva
kinto skill add tracking-map

# 6. IA genera el sitio completo
# Usa: core + skills activas + código específico del cliente

# 7. Deploy
kinto deploy
```

**Resultado**: La skill `tracking-map` ahora existe y puede usarse en:
- `logistics-corp.com`
- `transport-x.com`
- Cualquier sitio futuro que necesite tracking

## 📚 Documentación

- [Catálogo de Skills](SKILLS_CATALOG.md) - Todas las skills disponibles
- [Guía de Skills](docs/SKILLS.md) - Crear y usar skills
- [AI Generation](docs/AI_GENERATION.md) - Workflows con IA
- [CMS Setup](docs/CMS_SETUP.md)

## 🆕 Novedades v2.0

- ✅ **9 skills disponibles** (vs 5 en v1.0)
- ✅ **Testing automatizado** con browser-automation
- ✅ **Web scraping** para migrar contenido existente
- ✅ **Animaciones premium** tipo Webflow con GSAP
- ✅ **Formularios sin backend** vía Web3Forms
- ✅ **Túneles Cloudflare** con setup automatizado
- ✅ **Exports automáticos** en skill-create.js

---
**KINTO CMS**: Core mínimo + Skills bajo demanda = Sitios ultra-rápidos, escalables.
