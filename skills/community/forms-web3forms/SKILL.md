---
name: forms-web3forms
category: community
version: 1.0.0
description: Formularios serverless vía Web3Forms (sin backend propio)
tags: [forms, serverless]
requires: []
needs: []
recommendedFor: [static]
---

# Skill: forms-web3forms

Formularios de contacto funcionales sin backend propio, usando Web3Forms.

## Qué hace

- Envía formularios a email del cliente vía Web3Forms (gratis)
- Sin branding, sin límites estrictos
- Validación del lado cliente
- Mensajes de éxito/error incluidos

## Instalación

```bash
node scripts/skill-add.js forms-web3forms
```

## Configuración

1. Obtener API Key gratis en: https://web3forms.com/
2. Usar el componente pasando la key como prop:

## Uso

```astro
---
import { ContactForm } from '../../../skills/community/forms-web3forms';

// Obtener de variables de entorno o config
const WEB3FORMS_KEY = import.meta.env.WEB3FORMS_KEY || '';
---

<ContactForm 
  title="Contáctanos"
  subtitle="Te responderemos en 24 horas"
  recipientEmail="hola@tudominio.com"
  web3formsKey={WEB3FORMS_KEY}
  siteName="Tu Empresa"
/>
```

### Con selector de servicios personalizado

```astro
<ContactForm 
  title="Solicita una cotización"
  subtitle="Cuéntanos sobre tu proyecto"
  recipientEmail="ventas@tudominio.com"
  web3formsKey={WEB3FORMS_KEY}
  siteName="Tu Empresa"
  serviceSelect={true}
  services={[
    { value: "", label: "Selecciona un servicio" },
    { value: "diseno", label: "Diseño Web" },
    { value: "seo", label: "SEO" },
    { value: "marketing", label: "Marketing Digital" },
  ]}
/>
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `title` | string | "Contáctanos" | Título del formulario |
| `subtitle` | string | "" | Subtítulo descriptivo |
| `recipientEmail` | string | "" | Email del destinatario |
| `submitLabel` | string | "Enviar mensaje" | Texto del botón |
| `showPhone` | boolean | true | Mostrar campo teléfono |
| `showCompany` | boolean | true | Mostrar campo empresa |
| `serviceSelect` | boolean | false | Mostrar selector de servicios |
| `services` | array | [...] | Opciones para el selector |
| `web3formsKey` | string | "" | API key de Web3Forms |
| `siteName` | string | "" | Nombre del sitio (para el subject) |
| `subject` | string | auto | Asunto del email |

## Sin Configuración (Modo Demo)

Si no hay API key configurada (`web3formsKey`), el formulario muestra un mensaje de éxito simulado para demo.
