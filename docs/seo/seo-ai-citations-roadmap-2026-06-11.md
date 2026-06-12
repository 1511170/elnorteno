# SEO + AI Citations Roadmap — El Norteño

Fecha: 2026-06-11
Fuente principal: GA4 Data API + auditoría de código Astro/KINTO

## 1. Datos reales de GA4 — últimos 90 días

### Visión general

- Sesiones: 14,279
- Usuarios: 11,259
- Pageviews: 46,410
- Engagement rate: 46.64%
- Event count: 109,953
- Conversiones: 0
- Revenue reportado: 0

### Eventos actuales

- `page_view`: 46,410
- `user_engagement`: 39,124
- `session_start`: 13,579
- `first_visit`: 10,808
- `whatsapp_click_floating`: 13
- `add_to_cart`: 7
- `whatsapp_click_product`: 7
- `begin_checkout`: 4
- `remove_from_cart`: 1

Conclusión: el sitio tiene tráfico, pero la medición de conversiones y eventos de intención alta está incompleta. Hay que medir búsqueda interna, selección de producto desde búsqueda, clics en categorías, clics de WhatsApp con contexto y checkout.

### Productos actuales más vistos en `/products/`

Los productos nuevos todavía muestran bajo volumen directo porque gran parte del tráfico venía por URLs legacy. Top observados:

- Rifle Gamo Delta Fox GT Cal 4.5
- Pistola Colt Defender 1911
- Rifle PCP Crosman Wildfire 4.5
- Caña Combo Shakespeare Wild Series Walleye
- Caña Shakespeare Sturdy Stik Spinning
- Molinete Abu Garcia Silver Max
- Rifle Crosman Optimus 5.5 con mira
- Diabolo Gamo Match 4.5
- Mira telescópica 4x28 Gamo
- Rifle Big Cat 5.5 Gamo

### Categorías actuales más vistas en `/store/`

- `/store/`
- `/store/tiro-deportivo/`
- `/store/pesca/`
- `/store/camping/`
- `/store/caza/`
- `/store/armas-de-aire/`
- `/store/rifles-de-aire-comprimido/`
- `/store/canas-de-spinning/`
- `/store/canas-para-pesca/`
- `/store/outdoor/`

### Legacy URLs con mayor tráfico

El tráfico histórico todavía está concentrado en:

- `/categoria-productos/tiro-deportivo/armas-de-aire/rifles-de-aire-comprimido/`
- `/categoria-productos/tiro-deportivo/armas-de-aire/rifles-de-aire-comprimido/page/2/`
- `/categoria-productos/tiro-deportivo/`
- `/categoria-productos/tiro-deportivo/armas-de-aire/`
- `/categoria-productos/pesca/`
- `/tienda/`
- `/categoria-productos/tiro-deportivo/armas-de-aire/pistolas/`
- URLs de producto legacy bajo `/tienda/.../rifle-*`, `/tienda/.../pistola-*`, etc.

Ya se implementó una primera capa de redirects para estos patrones.

## 2. Brechas SEO/AEO detectadas

### 2.1 Producto individual

Estado actual:

- Tiene meta title/description básico.
- Tiene `ProductSchema` básico.
- Tiene imagen Open Graph.
- Tiene WhatsApp CTA.
- Tiene productos relacionados.

Faltantes críticos:

1. Descripción única y útil por producto.
   - Muchas páginas dependen de descripción de Shopify o texto genérico.
   - Hay copy genérico en tabs tipo “Cada pieza pasa por una revisión manual...”, que no representa todos los productos.

2. Product schema más completo.
   - Agregar `@id` estable.
   - Agregar `gtin`, `mpn`, SKU, marca limpia si existen.
   - Agregar `category`.
   - Agregar `itemCondition`.
   - Agregar `shippingDetails`.
   - Agregar `hasMerchantReturnPolicy`.
   - Conectar `seller` a `El Norteño`, no al vendor del producto.

3. Breadcrumb schema.
   - Hay breadcrumb visual, pero falta JSON-LD `BreadcrumbList` en PDP.

4. FAQ por producto o por categoría.
   - Existe `ProductFAQSchema`, pero sólo funciona si hay metafields `faqs`.
   - Necesitamos FAQs por tipo de producto cuando no haya metafields.

5. Contenido de intención/comparación.
   - “¿Para qué sirve?”
   - “Ideal para...”
   - “Qué tener en cuenta antes de comprar...”
   - “Compatibilidad / calibre / uso recomendado” según categoría.

6. Internal linking.
   - Cada PDP debe enlazar a colección principal, marca, productos complementarios y WhatsApp contextual.

### 2.2 Colecciones/categorías

Estado actual:

- Algunas categorías principales tienen SEO copy definido.
- Hay grid de productos y filtros.
- Hay navegación de subcolecciones.

Faltantes críticos:

1. JSON-LD de `CollectionPage` + `ItemList`.
   - Existe `CollectionListSchema` en la skill, pero no está integrado en `store/[handle].astro`.

2. Breadcrumb schema.
   - Hay breadcrumb visual, falta schema.

3. FAQ por colección.
   - Prioridad: rifles de aire comprimido, armas de aire, tiro deportivo, pesca, camping, cañas, señuelos, molinetes.

4. Copy enriquecido below-the-fold.
   - Guías cortas para elegir producto.
   - Bloques de “marcas disponibles”.
   - Texto de cumplimiento responsable para categorías sensibles.

5. Páginas dedicadas para categorías legacy de alto tráfico.
   - `pistolas`
   - `airsoft`
   - `miras`
   - `munición`
   - `arcos/ballestas`
   - `carpas`
   - `binoculares`
   - `cuchillos y navajas`

### 2.3 Home

Faltantes:

1. Reforzar propuesta de valor above-the-fold.
2. Mejorar imágenes faltantes/hero/category assets.
3. Bloques por intención:
   - Pesca deportiva
   - Tiro deportivo responsable
   - Camping
   - Outdoor
4. Enlaces internos hacia categorías top por tráfico.
5. Sección “El Norteño desde 1987” con entidad/autoridad para IA.
6. Schema WebSite con SearchAction apuntando al buscador real del sitio.

### 2.4 Tracking / medición

Problema detectado:

- GA4 no estaba registrando búsquedas internas (`view_search_results`).
- No existía `search_term` personalizado válido.

Acción implementada:

- Search overlay ahora envía `view_search_results` con:
  - `search_term`
  - `results_count`
  - `search_category`
- También envía `select_item` cuando el usuario abre un resultado desde búsqueda.

Siguiente:

- Revisar GA4 en 24-72 horas para validar términos de búsqueda.
- Si GA4 no expone `search_term` automáticamente, crear dimensión personalizada `search_term` / `results_count` / `search_category`.

## 3. Roadmap priorizado

### Fase 1 — Medición y recuperación SEO técnica

- [x] Conectar GA4 y Search Console vía Service Account.
- [x] Detectar tráfico legacy.
- [x] Implementar redirects legacy principales.
- [x] Activar tracking de búsqueda interna.
- [ ] Validar eventos de búsqueda en GA4 DebugView/Realtime.
- [ ] Crear dimensión personalizada para `search_term` si hace falta.
- [ ] Crear reporte semanal de términos buscados y páginas con más intención.

### Fase 2 — Colecciones que deben rankear

Prioridad por tráfico y negocio:

1. Rifles de aire comprimido
2. Armas de aire
3. Tiro deportivo
4. Pesca
5. Pistolas
6. Camping
7. Cañas de pesca
8. Señuelos y carnadas
9. Molinetes de pesca
10. Outdoor

Implementar en cada colección:

- `CollectionPage` schema.
- `ItemList` schema.
- `BreadcrumbList` schema.
- FAQ visible + JSON-LD.
- Copy de compra útil.
- Links internos a subcategorías y productos top.
- Avisos de cumplimiento para categorías sensibles.

### Fase 3 — Producto al 100

Para cada producto:

- Title SEO limpio: `Producto | Marca | El Norteño Colombia`.
- Meta description única con categoría, marca, disponibilidad/asesoría.
- H1 único.
- Product schema completo.
- Breadcrumb schema.
- FAQ dinámico por categoría.
- Copy no genérico.
- Bloque de especificaciones reales.
- Enlaces a colección/marca/complementarios.
- WhatsApp CTA medido.

### Fase 4 — AI citation visibility

Objetivo: que ChatGPT, Gemini, Claude, Grok y otros puedan citar la tienda correctamente.

Acciones:

- Mejorar `/llms.txt` con entidades, categorías, ciudades, políticas, enlaces top.
- Crear páginas informativas tipo guía:
  - “Cómo elegir un rifle de aire comprimido en Colombia”
  - “Cómo elegir caña de pesca para río/lago/mar”
  - “Equipo básico para camping en Colombia”
- Usar schema `FAQPage`, `HowTo`, `CollectionPage`, `Product`, `LocalBusiness`.
- Mantener contenido claro, verificable y policy-safe.
- No usar tácticas spam, doorway pages ni keyword stuffing.

### Fase 5 — Conversión

- Medir `whatsapp_click_*` con categoría/producto.
- Mejorar CTA en productos de alto tráfico.
- Crear bloques de confianza: tiendas físicas, envío nacional, asesoría experta.
- Añadir “consultar disponibilidad” por WhatsApp con texto específico.
- Validar checkout/cart y eventos ecommerce.

## 4. Primera implementación recomendada después del tracking

Implementar schema + FAQ + copy enriquecido para:

```txt
/store/rifles-de-aire-comprimido/
/store/armas-de-aire/
/store/tiro-deportivo/
```

Motivo: concentran la mayor parte del tráfico histórico y tienen intención comercial clara.
