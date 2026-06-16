# Google Merchant Center — El Norteño

Merchant Center ID proporcionado por Camilo:

```txt
120808507
```

## Feed inicial recomendado

URL del feed policy-safe:

```txt
https://elnorteno.com/feeds/google-shopping.xml
```

Tipo:

```txt
Scheduled fetch / Recuperación programada
```

Formato:

```txt
RSS/XML con namespace g de Google Merchant
```

Frecuencia sugerida:

```txt
Diaria
```

## Estrategia de seguridad

El feed inicial excluye categorías y términos sensibles para reducir riesgo de rechazos o suspensión en Merchant Center:

- armas de aire
- rifles
- pistolas
- tiro deportivo
- caza
- cuchillos/navajas
- munición/pólvora
- arquería/ballesta/flechas
- marcas o términos que suelen aparecer en productos sensibles

Incluye inicialmente productos de menor riesgo:

- pesca
- cañas
- molinetes
- señuelos y carnadas
- nylon/fluorocarbono/monofilamento
- anzuelos/jigs/terminales
- camping

## Pasos en Merchant Center

1. Entrar a Google Merchant Center.
2. Seleccionar cuenta `120808507`.
3. Verificar/reclamar dominio `elnorteno.com` si aún no está reclamado.
4. Configurar información de negocio:
   - dirección
   - teléfono
   - atención al cliente
   - políticas de envío
   - políticas de devolución
   - métodos de pago/checkout
5. Ir a Products → Data sources.
6. Add product source → Scheduled fetch.
7. Usar la URL:
   - `https://elnorteno.com/feeds/google-shopping.xml`
8. País: Colombia.
9. Idioma: español.
10. Moneda: COP.
11. Revisar Diagnostics después de la primera ingestión.

## Optimización posterior

Después de los diagnósticos iniciales:

- corregir productos rechazados
- añadir GTIN/códigos de barras en Shopify cuando existan
- mejorar títulos y descripciones de productos de alto potencial
- mapear categorías Google más específicas
- habilitar más categorías sólo si cumplen políticas
- conectar Google Ads/Performance Max únicamente con productos aprobados
