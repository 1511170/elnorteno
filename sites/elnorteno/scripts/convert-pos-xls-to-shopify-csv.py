#!/usr/bin/env python3
"""Convert El Norteño POS Excel stock export into a Shopify-compatible CSV.

Input format observed in `productos-el-norteno-julio-9.xls`:
- Sheet: `archivo de pagina web`
- Header row at Excel row 6 / zero-index 5
- Product rows start at zero-index 6

This script is deterministic and has no network side effects. It writes:
- data/shopify-import-enriched.csv
- data/shopify-import-current-stock.csv
- data/productos-el-norteno-julio-9-summary.json
"""
from __future__ import annotations

import argparse
import csv
import json
import re
import unicodedata
from collections import Counter
from pathlib import Path

import pandas as pd

SHOPIFY_COLUMNS = [
    "Handle", "Title", "Body (HTML)", "Vendor", "Product Category", "Type", "Tags", "Published",
    "Option1 Name", "Option1 Value", "Option2 Name", "Option2 Value", "Option3 Name", "Option3 Value",
    "Variant SKU", "Variant Grams", "Variant Inventory Tracker", "Variant Inventory Qty", "Variant Inventory Policy",
    "Variant Fulfillment Service", "Variant Price", "Variant Compare At Price", "Variant Requires Shipping", "Variant Taxable",
    "Variant Barcode", "Image Src", "Image Position", "Image Alt Text", "Gift Card", "SEO Title", "SEO Description",
    "Google Shopping / Google Product Category", "Google Shopping / Gender", "Google Shopping / Age Group",
    "Google Shopping / MPN", "Google Shopping / Condition", "Google Shopping / Custom Product",
    "Variant Weight Unit", "Status",
]

DEPT_TYPE = {
    "PESCA": "Pesca",
    "OUTDOOR": "Outdoor",
    "CACERIA": "Caza",
    "CAZA": "Caza",
    "TIRO DEPORTIVO": "Caza",
    "CAMPING": "Camping",
    "ANTENAS": "Electrónica",
    "BEBIDAS": "Bebidas",
}

SHOPIFY_CATEGORY = {
    "Pesca": "Sporting Goods > Outdoor Recreation > Fishing",
    "Camping": "Sporting Goods > Outdoor Recreation > Camping & Hiking",
    "Outdoor": "Sporting Goods > Outdoor Recreation",
    "Caza": "Sporting Goods > Outdoor Recreation > Hunting & Shooting",
    "Electrónica": "Electronics > Networking",
    "Bebidas": "Food, Beverages & Tobacco > Beverages",
    "Otros": "Sporting Goods",
}

KEYWORD_TYPE = [
    (["carpa", "colchoneta", "colchón", "campingaz", "saco de dormir", "sleeping"], "Camping"),
    (["rifle", "pistola", "diabolo", "diábolo", "balin", "balín", "gamo", "crosman", "co2", "mira ", "municion", "munición"], "Caza"),
    (["router", "switch", "antena", "ubiquiti", "mikrotik", "poe", "access point"], "Electrónica"),
    (["linterna", "navaja", "victorinox", "multiherramienta", "gorra", "brujula", "brújula", "cuchillo"], "Outdoor"),
    (["caña", "cana", "molinete", "anzuelo", "señuelo", "senuelo", "nylon", "sedal", "flotador", "jig", "rapala", "berkley", "yo zuri", "yo-zuri", "eagle claw"], "Pesca"),
]


def clean(value) -> str:
    if value is None or pd.isna(value):
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def slugify(text: str, fallback: str) -> str:
    normalized = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    normalized = normalized.lower().replace("&", " y ")
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    normalized = re.sub(r"-+", "-", normalized)
    return normalized or fallback


def infer_type(row: dict) -> str:
    dept = clean(row.get("Departamento")).upper()
    title = clean(row.get("DescripcionProducto")).lower()
    if dept in DEPT_TYPE:
        # Correct obvious POS department drift with stronger product keywords.
        for words, typ in KEYWORD_TYPE:
            if any(w in title for w in words):
                return typ
        return DEPT_TYPE[dept]
    for words, typ in KEYWORD_TYPE:
        if any(w in title for w in words):
            return typ
    return "Otros"


def infer_vendor(row: dict) -> str:
    for field in ("Marca", "CasaComercial", "Proveedor"):
        value = clean(row.get(field))
        if value and value.upper() != "NO ASIGNADO":
            return value.title()
    return "El Norteño"


def build_tags(row: dict, typ: str) -> str:
    tags = [typ, "Colombia", "El Norteño", "Envío nacional", "Bucaramanga", "Medellín", "Valledupar"]
    for field in ("Departamento", "Seccion", "Familia", "SubFamilia", "Clasificacion", "Marca"):
        value = clean(row.get(field))
        if value and value.upper() != "NO ASIGNADO":
            tags.append(value.title())
    seen = []
    for tag in tags:
        if tag not in seen:
            seen.append(tag)
    return ", ".join(seen)


def body_html(title: str, row: dict, typ: str) -> str:
    sku = clean(row.get("Id"))
    barcode = clean(row.get("CodigoAlterno"))
    ref = clean(row.get("Referencia"))
    vendor = infer_vendor(row)
    dept = clean(row.get("Departamento"))
    return (
        f"<p><strong>{title}</strong> disponible en El Norteño Colombia con envío nacional "
        f"y asesoría desde Bucaramanga, Medellín y Valledupar.</p>"
        f"<ul>"
        f"<li>SKU / referencia interna: {sku}</li>"
        f"<li>Código alterno / barcode: {barcode or 'Consultar'}</li>"
        f"<li>Referencia proveedor: {ref or 'Consultar'}</li>"
        f"<li>Marca / proveedor: {vendor}</li>"
        f"<li>Categoría: {typ} ({dept or 'General'})</li>"
        f"</ul>"
        f"<p>Confirma disponibilidad, ciudad de entrega, garantía y compatibilidad por WhatsApp antes de comprar.</p>"
    )


def read_pos_excel(path: Path) -> pd.DataFrame:
    raw = pd.read_excel(path, sheet_name=0, engine="xlrd", header=None, dtype=object)
    header = [clean(v) for v in raw.iloc[5].values]
    df = raw.iloc[6:].copy()
    df.columns = header
    df = df[df["Id"].notna() & df["DescripcionProducto"].notna()].copy()
    for col in ["Existencia", "PrecioVenta", "PrecioCosto", "PrecioCostoPromedio"]:
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)
    return df


def convert(df: pd.DataFrame, only_in_stock: bool) -> list[dict]:
    rows = []
    used_handles = Counter()
    for raw in df.to_dict("records"):
        stock = int(float(raw.get("Existencia") or 0))
        if only_in_stock and stock <= 0:
            continue
        title = clean(raw.get("DescripcionProducto"))
        sku = clean(raw.get("Id"))
        barcode = clean(raw.get("CodigoAlterno"))
        typ = infer_type(raw)
        base_handle = slugify(title, f"producto-{sku}")
        used_handles[base_handle] += 1
        handle = base_handle if used_handles[base_handle] == 1 else f"{base_handle}-{sku}"
        price = float(raw.get("PrecioVenta") or 0)
        seo_title = f"{title} en Colombia"
        seo_description = f"{title} en Colombia. Ref. {sku}. Envío nacional y asesoría en Bucaramanga, Medellín y Valledupar."
        row = {col: "" for col in SHOPIFY_COLUMNS}
        row.update({
            "Handle": handle,
            "Title": title,
            "Body (HTML)": body_html(title, raw, typ),
            "Vendor": infer_vendor(raw),
            "Product Category": SHOPIFY_CATEGORY.get(typ, SHOPIFY_CATEGORY["Otros"]),
            "Type": typ,
            "Tags": build_tags(raw, typ),
            "Published": "TRUE",
            "Option1 Name": "Title",
            "Option1 Value": "Default Title",
            "Variant SKU": sku,
            "Variant Inventory Tracker": "shopify",
            "Variant Inventory Qty": str(stock),
            "Variant Inventory Policy": "deny",
            "Variant Fulfillment Service": "manual",
            "Variant Price": f"{price:.0f}",
            "Variant Requires Shipping": "TRUE",
            "Variant Taxable": "TRUE",
            "Variant Barcode": barcode,
            "Gift Card": "FALSE",
            "SEO Title": seo_title[:70],
            "SEO Description": seo_description[:320],
            "Google Shopping / MPN": sku,
            "Google Shopping / Condition": "new",
            "Google Shopping / Custom Product": "TRUE",
            "Variant Weight Unit": "kg",
            "Status": "active" if stock > 0 else "draft",
        })
        rows.append(row)
    return rows


def write_csv(path: Path, rows: list[dict]):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=SHOPIFY_COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("input", type=Path)
    ap.add_argument("--out", type=Path, default=Path("data/shopify-import-enriched.csv"))
    ap.add_argument("--stock-out", type=Path, default=Path("data/shopify-import-current-stock.csv"))
    ap.add_argument("--summary", type=Path, default=Path("data/productos-el-norteno-julio-9-summary.json"))
    args = ap.parse_args()

    df = read_pos_excel(args.input)
    all_rows = convert(df, only_in_stock=False)
    stock_rows = convert(df, only_in_stock=True)
    write_csv(args.out, all_rows)
    write_csv(args.stock_out, stock_rows)

    type_counts = Counter(r["Type"] for r in all_rows)
    stock_type_counts = Counter(r["Type"] for r in stock_rows)
    summary = {
        "source": str(args.input),
        "total_rows": len(all_rows),
        "in_stock_rows": len(stock_rows),
        "zero_stock_rows": len(all_rows) - len(stock_rows),
        "types": dict(type_counts),
        "in_stock_types": dict(stock_type_counts),
        "departments": dict(Counter(clean(x) for x in df["Departamento"].tolist())),
        "outputs": {"all": str(args.out), "in_stock": str(args.stock_out)},
    }
    args.summary.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
