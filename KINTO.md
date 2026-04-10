# 🚀 KINTO CMS - Guía de Inicio Rápido para IA

> **TL;DR**: Sistema de sitios estáticos con arquitectura de **skills bajo demanda**. Core mínimo (Astro + Tailwind) + skills que se instalan solo cuando se necesitan.

---

## ⚡ Comandos Esenciales (Empezar Aquí)

```bash
# 1. Crear nuevo sitio para el cliente
./kinto create-site nombre-cliente

# 2. Entrar al sitio
cd sites/nombre-cliente

# 3. Ver skills disponibles
node scripts/skill-list.js

# 4. Instalar skills necesarias
node scripts/skill-add.js cms-sveltia
node scripts/skill-add.js testimonials

# 5. Crear nueva skill (si no existe la que necesitas)
node scripts/skill-create.js mi-nueva-skill

# 6. Instalar dependencias y correr
npm install
npm run dev
```

---

## 🧠 Principios Clave

### 1. **ZERO Skills por Defecto**
Cada sitio arranca limpio (solo Astro + Tailwind). No instales nada que no se pida explícitamente.

### 2. **Skills = Plugins Reutilizables**
- Ubicación: `kinto-cms/skills/{official,community}/`
- Una vez creada una skill → disponible para TODOS los sitios
- Si necesitas funcionalidad nueva, crea una skill, no código ad-hoc

### 3. **CMS Oculto**
- Sitio público: `tudominio.com`
- CMS privado: `admin.tudominio.com` (sin enlaces públicos)
- El cliente edita contenido sin tocar código

---

## 📁 Estructura de Trabajo

```
kinto-cms/
├── skills/
│   ├── official/          # Skills oficiales (CMS, SEO, etc)
│   │   └── cms-sveltia/
│   └── community/         # Skills creadas por IA
│       └── testimonials/
├── sites/
│   └── [nombre-cliente]/  # ← Trabajas aquí
│       ├── src/pages/     # Páginas Astro
│       ├── config/        # site.config.ts
│       └── skills-active.json  # Skills instaladas
└── core/                  # No tocar - motor base
```

---

## 🎯 Workflow de Generación

### Paso 1: Crear el Sitio
```bash
./kinto create-site nombre-cliente
cd sites/nombre-cliente
```

### Paso 2: Analizar el Brief
Ejemplo: *"Necesito página de inicio con hero, servicios, testimonios y un formulario de contacto"*

### Paso 3: Revisar Skills Existentes
```bash
node scripts/skill-list.js
```

**Skills disponibles actualmente:**
- ✅ `cms-sveltia` - Panel de admin para el cliente
- ✅ `testimonials` - Testimonios con schema.org

### Paso 4: Instalar Skills Necesarias
```bash
node scripts/skill-add.js cms-sveltia
node scripts/skill-add.js testimonials
```

### Paso 5: Generar Contenido
Editar `src/pages/index.astro` y crear las páginas necesarias usando las skills instaladas.

### Paso 6: Si Falta una Skill, Crearla
```bash
# Ejemplo: Necesitamos un formulario de contacto
node scripts/skill-create.js contact-form

# Esto crea: skills/community/contact-form/
# Luego implementas la skill y la usas
```

---

## 🛠️ Crear una Nueva Skill

Cuando el cliente necesita algo que no existe:

```bash
node scripts/skill-create.js nombre-skill
```

Esto crea:
```
skills/community/nombre-skill/
├── SKILL.md              # Documentación
├── index.ts              # Entry point
├── components/           # Componentes Astro
└── config/               # Configuración
```

**Reglas para crear skills:**
1. La skill debe ser **reutilizable** en otros sitios
2. Documentar en `SKILL.md` cómo usarla
3. Exportar componentes en `index.ts`
4. Usar `schema.org` si aplica (SEO)

---

## 📋 Checklist antes de entregar

- [ ] Todas las skills necesarias instaladas en `skills-active.json`
- [ ] CMS configurado en `config/site.config.ts`
- [ ] Schema.org en lugares relevantes (SEO)
- [ ] Imágenes optimizadas en `public/`
- [ ] Build exitoso: `npm run build`
- [ ] Preview funciona: `npm run preview`

---

## 🔗 Referencias Rápidas

| Recurso | Ubicación |
|---------|-----------|
| Config sitio | `sites/[nombre-cliente]/config/site.config.ts` |
| Skills activas | `sites/[nombre-cliente]/skills-active.json` |
| Skills disponibles | `kinto-cms/skills/` |
| Guía completa IA | `kinto-cms/docs/AI_GENERATION.md` |
| Arquitectura | `kinto-cms/STRUCTURE.md` |

---

## 💡 Patrones Comunes

### Importar una skill en una página:
```astro
---
import { TestimonialsGrid } from '../../../skills/community/testimonials/index.ts';
---

<TestimonialsGrid category="logistics" max={6} />
```

### Verificar si una skill está activa:
```typescript
import activeSkills from '../skills-active.json';

const hasTestimonials = activeSkills.skills.includes('testimonials');
```

---

## 🆘 ¿Atascado?

1. **Ver skills disponibles**: `node scripts/skill-list.js`
2. **Ver config del sitio**: `cat config/site.config.ts`
3. **Ver skills activas**: `cat skills-active.json`
4. **Leer documentación**: `cat docs/AI_GENERATION.md`

---

**Empieza aquí:**
```bash
./kinto create-site mi-cliente && cd sites/mi-cliente && node scripts/skill-list.js
```
