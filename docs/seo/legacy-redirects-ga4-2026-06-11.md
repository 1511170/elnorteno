# Legacy redirects driven by GA4 — 2026-06-11

## Context

GA4 access for `El Norteño - GA4` (`properties/387065953`) showed that a large share of traffic still lands on legacy WordPress/WooCommerce URLs.

Analysis window used during implementation:

- Source: GA4 Data API
- Range: last 90 days
- Rows inspected: top 500 page paths
- Legacy rows in top 500: 473
- Legacy sessions in top 500: 32,091

## Highest-priority legacy patterns observed

### Legacy category archives

Examples:

- `/categoria-productos/tiro-deportivo/armas-de-aire/rifles-de-aire-comprimido/`
- `/categoria-productos/tiro-deportivo/armas-de-aire/rifles-de-aire-comprimido/page/2/`
- `/categoria-productos/tiro-deportivo/`
- `/categoria-productos/tiro-deportivo/armas-de-aire/`
- `/categoria-productos/pesca/`
- `/categoria-productos/camping/`
- `/categoria-productos/outdoor/`
- `/categoria-productos/marcas/gamo/`

### Legacy nested product URLs

Examples:

- `/tienda/pesca/combos-cana-para-pesca/combos-spinning/cana-combo-shakespeare-wild-series-walleye-combo-wildwye662m30/`
- `/tienda/tiro-deportivo/armas-de-aire/rifles-de-aire-comprimido/rifle-gamo-delta-4-5/`
- `/tienda/tiro-deportivo/armas-de-aire/rifles-de-aire-comprimido/rifle-gamo-delta-fox-gt-cal-4-5/`

### Legacy brand/tag archives

Examples:

- `/marca/gamo/`
- `/brand/gamo/`
- `/product-tag/shakespeare/`

## Redirect behavior implemented

### Category archive redirects

The Worker now supports plural `categoria-productos` in addition to previous singular/category patterns:

- `/categoria-productos/.../rifles-de-aire-comprimido/` → `/store/rifles-de-aire-comprimido`
- `/categoria-productos/.../rifles-de-aire-comprimido/page/2/` → `/store/rifles-de-aire-comprimido`
- `/categoria-productos/pesca/` → `/store/pesca`
- `/categoria-productos/pesca/canas-para-pesca/` → `/store/canas-para-pesca`
- `/categoria-productos/camping/carpas/` → `/store/camping`

### Nested WooCommerce product redirects

The Worker now handles nested `/tienda/.../{product-slug}` and `/shop/.../{product-slug}` URLs.

Safety rule:

- If the final slug matches a current Shopify product handle or a generated product alias, redirect to `/products/{handle}`.
- If it does not match a known product, collapse to the nearest known category or `/store` instead of creating a 301 to a missing product page.

### Brand/tag archive redirects

Known brand/category slugs now redirect to the closest available collection.

Examples:

- `/marca/gamo/` → `/store/armas-de-aire`
- `/brand/gamo/` → `/store/armas-de-aire`
- unknown tag/brand archives → `/store`

## Production verification

Verified after Cloudflare deploy:

- `/categoria-productos/tiro-deportivo/armas-de-aire/rifles-de-aire-comprimido/` → 301 → `/store/rifles-de-aire-comprimido` → 200
- `/categoria-productos/tiro-deportivo/armas-de-aire/rifles-de-aire-comprimido/page/2/` → 301 → `/store/rifles-de-aire-comprimido` → 200
- `/categoria-productos/pesca/` → 301 → `/store/pesca` → 200
- `/categoria-productos/pesca/canas-para-pesca/` → 301 → `/store/canas-para-pesca` → 200
- `/categoria-productos/camping/carpas/` → 301 → `/store/camping`
- `/marca/gamo/` → 301 → `/store/armas-de-aire`
- `/tienda/pesca/combos-cana-para-pesca/combos-spinning/cana-combo-shakespeare-wild-series-walleye-combo-wildwye662m30/` → 301 → `/products/cana-combo-shakespeare-wild-series-walleye-combo-wildwye662m30` → 200
- `/tienda/tiro-deportivo/armas-de-aire/rifles-de-aire-comprimido/rifle-gamo-delta-4-5/` → 301 → `/products/rifle-gamo-delta-4-5` → 200

## Deploy

Cloudflare Worker version deployed during verification:

```txt
c18b4a09-52a3-4d23-9a22-65c9559b4352
```

## Next SEO follow-ups

1. Continue extracting GA4 top legacy paths weekly.
2. Add specific collection pages for high-traffic legacy categories that currently collapse to broader collections.
3. Submit updated sitemap in Search Console once GSC starts returning performance rows.
4. Track reduction in legacy 404s and migration of traffic into `/store/*` and `/products/*` paths.
