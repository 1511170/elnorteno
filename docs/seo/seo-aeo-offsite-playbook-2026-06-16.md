# El Norteño — Playbook SEO/AEO + off-site (2026-06-16)

## Fuentes revisadas

- Google Search Central — ecommerce SEO: `https://developers.google.com/search/docs/specialty/ecommerce`
- Google Search Central — contenido útil, confiable y people-first: `https://developers.google.com/search/docs/fundamentals/creating-helpful-content`
- Google Search Central — Product structured data: `https://developers.google.com/search/docs/appearance/structured-data/product`
- Google Search Central — crawlers y fetchers: `https://developers.google.com/search/docs/crawling-indexing/overview-google-crawlers`
- Schema.org — vocabulario Product/Organization/WebSite.

## Estándar aplicado en el sitio

1. Entity SEO / AEO
   - Organization con `@id` estable `https://elnorteno.com/#organization`.
   - WebSite con SearchAction hacia `/store?q={search_term_string}`.
   - Organization enriquecida con `foundingDate`, `areaServed`, `knowsAbout` y `contactPoint`.
   - Guías con autor tipo Organization apuntando al entity ID.

2. People-first + E-E-A-T operativo
   - Guías visibles y no JS-only.
   - Bloque editorial visible: quién, cómo y por qué.
   - FAQs reales y específicas por intención.
   - Lenguaje responsable para categorías sensibles.

3. Ecommerce technical SEO
   - Product schema con Offer, shipping, returns y seller El Norteño.
   - CollectionPage + ItemList + BreadcrumbList + FAQPage en categorías prioritarias.
   - Redirects legacy para no perder demanda de WordPress/WooCommerce.
   - `llms.txt` como mapa canónico para asistentes de IA.

## Próximas optimizaciones on-site de alto impacto

1. Legacy traffic recovery
   - Continuar creando redirects exactos para URLs legacy con sesiones/impresiones.
   - Prioridad actual: rifles, armas de aire, pistolas, tiro deportivo paginado, pesca y camping.

2. Guías por intención long-tail
   - Pistolas de aire en Colombia: compra responsable y accesorios.
   - Diábolos/calibres 4.5 vs 5.5 vs 6.35.
   - Cañas spinning vs casting.
   - Señuelos para pesca en río/lago/mar.
   - Camping en Colombia por clima/destino.

3. PDP uniqueness
   - Enriquecer productos ganadores con copy específico desde Shopify/metafields.
   - Priorizar productos con sesiones GA4 legacy y consultas GSC.

4. Datos estructurados adicionales
   - Revisar posibilidad de `MerchantReturnPolicy`, `OfferShippingDetails`, `AggregateOffer` y `ItemList` por cluster.
   - Evitar reviews/rating si no hay fuente verificable.

## Off-site / fuera del sitio

1. Google Business Profile
   - Asegurar que cada sede tenga categoría correcta, NAP consistente, fotos actualizadas, productos/servicios principales y enlaces al sitio.
   - Publicaciones periódicas con guías: rifles de aire, pesca, camping.

2. Citaciones locales/NAP
   - Directorios colombianos y mapas deben usar el mismo nombre, teléfono, ciudad, dirección y URL.
   - Evitar spam de directorios; priorizar fuentes reales y verificables.

3. Digital PR / backlinks útiles
   - Guías citables para blogs outdoor, pesca, camping, clubes de tiro deportivo responsable, turismo local y medios regionales.
   - Enlaces contextuales a guías, no sólo home.

4. Marketplaces/perfiles externos
   - Revisar perfiles existentes de marca y enlaces hacia categorías canónicas.
   - Mantener consistencia con políticas de Google Ads/Merchant para productos sensibles.

5. Contenido distribuido
   - Shorts/Reels/TikTok/YouTube con asesoría: cómo elegir caña, rifle de aire, mira, camping básico.
   - Cada pieza debe enlazar o mencionar guía canónica.

## Datos que conviene pedir de Ahrefs / SEMrush

Exportar en CSV/XLSX, idealmente últimos 6-12 meses:

1. Organic keywords del dominio `elnorteno.com`
   - keyword, URL, posición, volumen, KD/dificultad, tráfico estimado, CPC, SERP features.

2. Organic pages / top pages
   - URL, tráfico estimado, keywords, posición promedio, backlinks si aplica.

3. Competitor gap / keyword gap
   - Comparar contra 5-10 competidores o tiendas similares en Colombia/LatAm.
   - Campos: keyword, volumen, KD, competidores ranking, URL competidora, posición de cada dominio.

4. Backlinks y referring domains
   - source URL, target URL, anchor, DR/AS, tráfico del dominio, follow/nofollow, primera/última vez visto.

5. Broken backlinks
   - backlinks que apuntan a URLs antiguas/404 para convertirlos en redirects o outreach.

6. Content gap por categorías
   - rifles de aire, armas de aire, pistolas de aire, miras, diábolos, pesca, cañas, molinetes, señuelos, camping, outdoor.

7. SERP competitors por keyword cluster
   - top 10 resultados para los clusters principales con URL, title, snippet, intent y tipo de contenido.

8. Ads/paid keywords si están disponibles
   - keywords pagas de competidores, CPC, landing page, copy de anuncio y políticas sensibles detectadas.

## Regla de seguridad

Para armas de aire, caza, pólvora, cuchillos, arquería y accesorios: mantener contenido informativo, responsable, compatible con políticas y sin promesas agresivas. Validar claims sensibles antes de publicidad pagada.
