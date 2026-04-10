# 🤖 AGENTS.md - Inicio Rápido para Cualquier IA

> **Para:** Kimi Code, Claude Code, Cursor, o cualquier IA agente

## 🎯 Tú Entras Aquí y Lees ESTO Primero

### Contexto Inmediato
- **Sistema**: KINTO CMS - Generador de sitios estáticos con arquitectura de skills
- **Stack**: Astro 5 + Tailwind 3 + Sveltia CMS
- **Estado**: Core limpio, sin sitios creados aún

### Tu Misión (Si eliges aceptarla)
Crear un nuevo sitio web para el cliente:
1. Crear el sitio con `./kinto create-site <nombre>`
2. Instalar skills necesarias
3. Generar páginas según requerimientos del cliente
4. Configurar CMS para que el cliente edite contenido

---

## ⚡ Empezar (Flujo Paso a Paso)

### Paso 1: Crear Nuevo Sitio
```bash
./kinto create-site nombre-cliente
```

### Paso 2: Entrar al Sitio y Ver Skills Disponibles
```bash
cd sites/nombre-cliente
node scripts/skill-list.js
```

### Paso 3: Instalar Skills Necesarias
```bash
node scripts/skill-add.js cms-sveltia
node scripts/skill-add.js testimonials
# ... otras skills según necesidad
```

### Paso 4: Generar Contenido
- Editar `src/pages/index.astro`
- Crear páginas adicionales
- Configurar CMS en `config/site.config.ts`

---

## 📁 Estructura Importante

```
kinto-cms/
├── KINTO.md              # ← Guía completa del sistema (léela)
├── sites/
│   └── [nombre-cliente]/ # ← Se crea con ./kinto create-site
│       ├── KINTO.md      # ← Brief del cliente (léelo si existe)
│       └── src/pages/    # ← Aquí trabajas
└── skills/
    ├── official/         # Skills oficiales
    └── community/        # Skills comunitarias
```

---

## 🔗 Referencias

- Guía sistema completa: `KINTO.md`
- Brief del proyecto: `sites/[nombre-cliente]/KINTO.md` (si existe)
- Arquitectura: `STRUCTURE.md`

---

**TL;DR**: Crea sitio con `./kinto create-site <nombre>`, instala skills, genera el sitio.
