# Estructura de KINTO CMS

```
kinto-cms/
├── README.md                          # Documentación principal
├── STRUCTURE.md                       # Este archivo
├── package.json                       # Root package
├── kinto.js                           # CLI principal
├── .gitignore
│
├── core/                              # 🎯 MOTOR MÍNIMO
│   ├── package.json
│   ├── astro.config.mjs
│   ├── tailwind.config.mjs
│   └── src/
│       ├── layouts/
│       │   └── Layout.astro           # Layout base mínimo
│       ├── pages/
│       │   └── index.astro            # Página welcome core
│       ├── components/                # (vacío - llenar con skills)
│       └── utils/
│           └── skill-loader.ts        # Loader de skills
│
├── skills/                            # 🧩 MARKETPLACE DE SKILLS
│   ├── official/                      # Skills oficiales mantenidas
│   │   └── cms-sveltia/               # CMS framework
│   │       ├── SKILL.md               # Documentación
│   │       ├── index.ts               # Entry point
│   │       └── components/
│   │           └── Admin.astro        # Panel admin
│   │
│   └── community/                     # Skills creadas por IA
│       └── testimonials/              # Ejemplo: testimonios
│           ├── SKILL.md               # Qué hace, cómo usar
│           ├── index.ts               # Lógica de instalación
│           ├── components/
│           │   ├── TestimonialsGrid.astro
│           │   └── TestimonialCard.astro
│           └── config/
│               └── cms-fields.yml     # Config CMS
│
├── sites/                             # 🌐 SITIOS DE CLIENTES (vacío en repo)
│   └── [nombre-cliente]/              # Creado con ./kinto create-site
│       ├── package.json
│       ├── astro.config.mjs
│       ├── tailwind.config.mjs
│       ├── skills-active.json         # Skills activas (arranca vacío)
│       │
│       ├── config/
│       │   ├── site.config.ts         # Config dominio, CMS oculto
│       │   └── cms.config.yml         # Config Sveltia
│       │
│       ├── scripts/                   # 🛠️ Utilidades
│       │   ├── skill-add.js           # Instalar skill
│       │   ├── skill-create.js        # Crear nueva skill
│       │   └── skill-list.js          # Listar skills
│       │
│       └── src/
│           ├── layouts/
│           │   └── Layout.astro       # Extiende core
│           ├── pages/
│           │   └── index.astro        # Página inicio
│           ├── components/            # Específicos del sitio
│           ├── content/               # Contenido editable CMS
│           │   ├── pages/
│           │   ├── blog/
│           │   └── [carpetas por skill]
│           └── styles/
│
├── templates/                         # 📋 TEMPLATES BASE
│   └── enterprise/                    # Template corporativo
│       └── (estructura base)
│
└── docs/                              # 📚 DOCUMENTACIÓN
    └── AI_GENERATION.md               # Guía para IA
```

## 🎯 Principio: Core Mínimo + Skills Bajo Demanda

### Estado Inicial (Core Limpio)
```json
// skills-active.json
{
  "site": "nombre-cliente",
  "skills": []
}
```

### Después de instalar skills
```json
// skills-active.json
{
  "site": "nombre-cliente", 
  "skills": [
    "cms-sveltia",
    "seo-ai-citations",
    "testimonials",
    "forms-cloudflare"
  ]
}
```

## 🔐 Seguridad: CMS Oculto

```typescript
// site.config.ts
cms: {
  enabled: true,
  subdomain: 'admin.tudominio.com',  // No enlazado públicamente
  hidden: true,                       // Solo accesible por URL directa
  githubRepo: 'tu-org/tu-repo'
}
```

- **Público**: `tudominio.com`
- **Admin**: `admin.tudominio.com` (oculto)

## 🚀 Workflow

```bash
# 1. Crear nuevo sitio
./kinto create-site nombre-cliente

# 2. IA revisa skills disponibles
node scripts/skill-list.js

# 3. IA instala skills necesarias
node scripts/skill-add.js cms-sveltia
node scripts/skill-add.js testimonials

# 4. IA crea skills que faltan
node scripts/skill-create.js fleet-tracker
# → Crea en skills/community/fleet-tracker/
# → Disponible para todos los sitios

# 5. IA genera sitio usando skills

# 6. Desarrollo
npm run dev

# 7. Build
npm run build
```

## 🧩 Ejemplo de Skill

```typescript
// skills/community/mi-skill/index.ts
export const config = {
  name: 'mi-skill',
  version: '1.0.0',
  category: 'ui',
  reusable: true  // <- Puede usarse en cualquier sitio
};

export function install(context) {
  context.addComponent('MiComponente', './components/Mi.astro');
  context.addCMSCollection({...});
}
```

## 📊 Multi-Site

```
sites/
├── cliente-logistica/       # Logística
├── cliente-dental/          # Dentista
├── cliente-abogados/        # Abogados
└── cliente-startup/         # Startup

Cada uno: core + skills específicas
```

## 🎨 Para IA (Kimi Code / Claude Code)

**Prompt clave:**
```
Estás usando KINTO CMS.
1. Crea sitio con: ./kinto create-site [nombre]
2. Revisa skills/ antes de escribir código
3. Si existe skill similar → ÚSALA
4. Si no existe → CREA skill reutilizable
5. NUNCA copies código entre sitios
```

## ✅ Listo para usar

El sistema está diseñado para:
- ✅ Generación completa por IA
- ✅ Skills bajo demanda
- ✅ Reutilización máxima
- ✅ CMS oculto configurable
- ✅ SEO/AI citations nativo
- ✅ Deploy a Cloudflare Pages
