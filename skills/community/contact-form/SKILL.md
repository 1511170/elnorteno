---
name: contact-form
category: community
version: 1.0.0
description: Formulario de contacto con validación y estilos Tailwind
tags: [forms, contact]
requires: []
needs: []
recommendedFor: [static]
---

# Skill: contact-form

Formulario de contacto profesional con validación y estilos Tailwind.

## Qué hace

- ✅ Formulario de contacto completo (nombre, email, teléfono, mensaje)
- ✅ Validación de campos requeridos
- ✅ Diseño responsive con Tailwind CSS
- ✅ Estados de éxito y error
- ✅ Integración lista para backend/API
- ✅ Schema.org ContactPoint para SEO

## Instalación

```bash
node scripts/skill-add.js contact-form
```

## Uso

### Formulario básico

```astro
---
import { ContactForm } from '@skills/community/contact-form';
---

<ContactForm />
```

### Formulario personalizado

```astro
<ContactForm 
  title="Solicita una cotización"
  subtitle="Te responderemos en menos de 24 horas"
  submitLabel="Enviar solicitud"
  showPhone={true}
  showCompany={true}
  serviceSelect={true}
/>
```

### Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| title | string | "Contáctanos" | Título del formulario |
| subtitle | string | "" | Subtítulo descriptivo |
| submitLabel | string | "Enviar mensaje" | Texto del botón |
| showPhone | boolean | true | Mostrar campo teléfono |
| showCompany | boolean | true | Mostrar campo empresa |
| serviceSelect | boolean | false | Selector de servicio |
| action | string | "/api/contact" | URL del endpoint |

## Backend

El formulario envía un POST a `/api/contact` con:

```json
{
  "name": "string",
  "email": "string",
  "phone": "string (opcional)",
  "company": "string (opcional)",
  "service": "string (opcional)",
  "message": "string",
  "privacy": true
}
```

## Metadata

- **Categoría**: community
- **Creada**: 2026-02-10
- **Versión**: 1.0.0
- **Reutilizable**: Sí
