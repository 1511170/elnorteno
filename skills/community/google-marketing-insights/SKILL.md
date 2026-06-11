---
name: google-marketing-insights
category: community
version: 0.1.0
description: Conectores operativos para Google Search Console, GA4 y preparación de Google Ads usando Service Account/OAuth sin commitear secretos
tags: [google, search-console, analytics, ga4, ads, seo, reporting]
requires: [tracking-analytics, seo-ai-citations]
needs: [google-service-account, search-console-access, ga4-property-access]
recommendedFor: [ecommerce, static]
---

# google-marketing-insights

Skill operativa para conectar un sitio KINTO con datos de Google Search Console, Google Analytics 4 y, cuando aplique, Google Ads. Está pensada para auditorías SEO, priorización de páginas/productos, recuperación de tráfico orgánico y medición de conversiones en tiendas Shopify headless.

## Qué hace

- Define el contrato de variables de entorno para credenciales Google.
- Incluye un CLI sin dependencias externas para consultar:
  - Search Console: sitios disponibles, performance por query/página, indexación básica cuando la API lo permita.
  - GA4 Data API: sesiones, usuarios, eventos, conversiones y ecommerce básico.
- Deja preparada la configuración de Google Ads sin guardar secretos en el repo.
- Complementa:
  - `tracking-analytics` para medición en frontend.
  - `seo-ai-citations` para SEO/AEO técnico.
  - `shopify-ecommerce` para cruzar tráfico con catálogo/productos.

## Instalación

```bash
kinto skill add google-marketing-insights --site=<sitio>
```

Esto agrega las variables de `.env.example` al sitio. Luego crea el `.env` real localmente y completa los valores.

## Credenciales seguras

Nunca commitees el JSON de Service Account. Guarda el archivo en una ruta local ignorada, por ejemplo:

```txt
sites/elnorteno/.secrets/google-service-account.json
```

Y en `sites/elnorteno/.env`:

```bash
GOOGLE_APPLICATION_CREDENTIALS=.secrets/google-service-account.json
GSC_SITE_URL=https://elnorteno.com/
GA4_PROPERTY_ID=123456789
```

Alternativamente puedes usar `GOOGLE_SERVICE_ACCOUNT_JSON` con el JSON completo en una variable de entorno local/secreta, pero para operación manual suele ser más cómodo y menos propenso a errores usar archivo.

## Permisos mínimos requeridos

### Google Search Console

1. Entra a Search Console.
2. Agrega el email de la Service Account como usuario de la propiedad.
3. Permiso recomendado: `Full` si necesitamos consultar todo; `Restricted` puede bastar para algunos reportes.
4. La propiedad debe coincidir con `GSC_SITE_URL`, por ejemplo:
   - `https://elnorteno.com/`
   - o `sc-domain:elnorteno.com`

### GA4

1. En Admin → Property access management.
2. Agrega el email de la Service Account.
3. Rol mínimo: `Viewer` / `Analyst` para reportes.
4. Define `GA4_PROPERTY_ID` con el ID numérico de la propiedad, no el Measurement ID `G-...`.

### Google Ads

Google Ads API normalmente requiere:

- Developer token.
- Customer ID.
- Login customer ID si se usa MCC.
- OAuth refresh token en muchos setups.

Service Account sólo funciona en escenarios específicos con delegación/configuración empresarial. Por eso esta skill deja Ads preparado, pero no asume que el JSON por sí solo baste. Si Ads no acepta Service Account, se debe conectar con OAuth y guardar refresh token localmente como secreto.

## CLI incluido

Ruta:

```txt
skills/community/google-marketing-insights/scripts/google-insights.mjs
```

Desde la raíz del sitio:

```bash
cd sites/elnorteno
node ../../skills/community/google-marketing-insights/scripts/google-insights.mjs gsc:sites
node ../../skills/community/google-marketing-insights/scripts/google-insights.mjs gsc:performance --days=28 --dimensions=query,page --limit=100
node ../../skills/community/google-marketing-insights/scripts/google-insights.mjs ga4:overview --days=28
node ../../skills/community/google-marketing-insights/scripts/google-insights.mjs ga4:pages --days=28 --limit=100
```

## Flujo recomendado para SEO de ecommerce

1. `gsc:performance --dimensions=query,page`
   - Detecta queries con impresiones altas y CTR bajo.
   - Prioriza títulos/metadescripciones y copy de categorías.

2. `gsc:performance --dimensions=page`
   - Detecta páginas con caída o potencial.
   - Cruza con sitemap y redirects legacy.

3. `ga4:pages`
   - Mide landing pages reales, engagement y conversiones.
   - Prioriza categorías/productos con tráfico pero bajo engagement.

4. Acciones en KINTO:
   - Mejorar títulos H1/meta title/meta description.
   - Agregar texto visible de categoría.
   - Fortalecer schema JSON-LD.
   - Agregar FAQ en categorías clave.
   - Revisar redirects 301 para URLs con tráfico en GSC.

5. Validación:
   - `npm run build`
   - `npm run deploy`
   - Revisión de Search Console después de indexación.

## Salidas JSON

El CLI imprime JSON para que un agente pueda consumirlo sin scraping de texto. Ejemplo:

```json
{
  "source": "search-console",
  "siteUrl": "https://elnorteno.com/",
  "rows": [
    {
      "keys": ["cañas de pesca", "https://elnorteno.com/store/pesca/"],
      "clicks": 12,
      "impressions": 340,
      "ctr": 0.035,
      "position": 8.2
    }
  ]
}
```

## Reglas

- Nunca guardar `client_email`, `private_key`, refresh tokens o developer tokens en git.
- No modificar campañas de Ads automáticamente sin revisión humana.
- Respetar políticas de Google Ads y Merchant Center, especialmente para armas de aire, caza, municiones, pólvora, cuchillos y categorías reguladas.
- Para cambios SEO, preferir mejoras legítimas: contenido útil, estructura clara, schema correcto, performance, enlaces internos y redirects limpios.
- No crear doorway pages, cloaking, keyword stuffing ni contenido engañoso para IA/buscadores.

## Verificación

- `kinto skill validate` pasa.
- `kinto skill add google-marketing-insights --site=<sitio>` agrega env vars al `.env.example`.
- Con credenciales reales:
  - `gsc:sites` lista propiedades.
  - `gsc:performance` devuelve filas o un JSON vacío válido.
  - `ga4:overview` devuelve métricas de la propiedad.
- `git status` no muestra `.env` ni `.secrets/`.
