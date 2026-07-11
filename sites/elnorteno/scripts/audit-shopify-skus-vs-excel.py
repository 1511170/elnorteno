from pathlib import Path
import os,re,json,csv,urllib.request,time,collections

def skey(s):
    s=str(s)
    return (0,int(s)) if s.isdigit() else (1,s)

for line in Path('.env').read_text().splitlines():
    if '=' in line and not line.strip().startswith('#'):
        k,v=line.split('=',1); os.environ.setdefault(k.strip(),v.strip())
DOMAIN=os.environ['SHOPIFY_STORE_DOMAIN']; TOKEN=os.environ['SHOPIFY_ACCESS_TOKEN']; API=os.environ.get('SHOPIFY_API_VERSION','2025-10')
with open('data/shopify-import-enriched.csv', newline='', encoding='utf-8') as f:
    excel_rows=[r for r in csv.DictReader(f) if str(r.get('Variant SKU') or '').strip()]
excel_by_sku={str(r['Variant SKU']).strip():r for r in excel_rows}; excel_skus=set(excel_by_sku)
shopify_products=0; shopify_variants=0; empty_sku=[]; sku_to_variants=collections.defaultdict(list)
query='limit=250' + chr(38) + 'fields=id,handle,title,status,variants'
url=f'https://{DOMAIN}/admin/api/{API}/products.json?'+query
pages=0
while url and pages<120:
    req=urllib.request.Request(url,headers={'X-Shopify-Access-Token':TOKEN})
    try:
        with urllib.request.urlopen(req,timeout=60) as resp:
            data=json.loads(resp.read().decode()); link=resp.headers.get('Link','')
    except urllib.error.HTTPError as e:
        if e.code==429:
            time.sleep(int(e.headers.get('Retry-After','2'))); continue
        raise
    for p in data.get('products',[]):
        shopify_products+=1
        for v in p.get('variants') or []:
            shopify_variants+=1; sku=str(v.get('sku') or '').strip()
            rec={'product_id':p.get('id'),'variant_id':v.get('id'),'handle':p.get('handle'),'title':p.get('title'),'status':p.get('status'),'sku':sku,'price':v.get('price'),'inventory_quantity':v.get('inventory_quantity')}
            if sku: sku_to_variants[sku].append(rec)
            else: empty_sku.append(rec)
    m=re.search(r'<([^>]+)>;\s*rel="next"',link or '')
    url=m.group(1) if m else None; pages+=1
shopify_skus=set(sku_to_variants); duplicates={sku:vars for sku,vars in sku_to_variants.items() if len(vars)>1}
matched=excel_skus.intersection(shopify_skus)
missing_in_shopify=sorted(excel_skus.difference(shopify_skus), key=skey)
shopify_not_in_excel=sorted(shopify_skus.difference(excel_skus), key=skey)
missing_in_stock=[sku for sku in missing_in_shopify if float(excel_by_sku[sku].get('Variant Inventory Qty') or 0)>0]
price_diffs=[]; stock_diffs=[]
for sku in matched:
    vars=sku_to_variants[sku]
    if len(vars)!=1: continue
    v=vars[0]; r=excel_by_sku[sku]
    ep=round(float(r.get('Variant Price') or 0)); sp=round(float(v.get('price') or 0))
    if ep!=sp: price_diffs.append({'sku':sku,'title':r.get('Title'),'shopify':sp,'excel':ep,'handle':v['handle']})
    eq=round(float(r.get('Variant Inventory Qty') or 0)); sq=round(float(v.get('inventory_quantity') if v.get('inventory_quantity') is not None else -999999))
    if eq!=sq: stock_diffs.append({'sku':sku,'title':r.get('Title'),'shopify':sq,'excel':eq,'handle':v['handle']})
report={'generated_at':time.strftime('%Y-%m-%dT%H:%M:%S%z'),'shopify_products':shopify_products,'shopify_variants':shopify_variants,'shopify_unique_skus':len(shopify_skus),'shopify_variants_without_sku':len(empty_sku),'shopify_duplicate_skus':len(duplicates),'excel_unique_skus':len(excel_skus),'matched_excel_skus_in_shopify':len(matched),'excel_skus_missing_in_shopify':len(missing_in_shopify),'excel_missing_in_shopify_with_stock':len(missing_in_stock),'shopify_skus_not_in_excel':len(shopify_not_in_excel),'matched_unique_price_diffs':len(price_diffs),'matched_unique_inventory_diffs':len(stock_diffs),'samples':{'shopify_variants_without_sku':empty_sku[:30],'duplicate_skus':[{'sku':sku,'variants':vars[:5]} for sku,vars in list(duplicates.items())[:30]],'missing_in_shopify':[{'sku':sku,'title':excel_by_sku[sku].get('Title'),'stock':excel_by_sku[sku].get('Variant Inventory Qty'),'price':excel_by_sku[sku].get('Variant Price')} for sku in missing_in_shopify[:30]],'missing_in_shopify_with_stock':[{'sku':sku,'title':excel_by_sku[sku].get('Title'),'stock':excel_by_sku[sku].get('Variant Inventory Qty'),'price':excel_by_sku[sku].get('Variant Price')} for sku in missing_in_stock[:30]],'shopify_not_in_excel':[{'sku':sku,'variants':sku_to_variants[sku][:3]} for sku in shopify_not_in_excel[:30]],'price_diffs':price_diffs[:30],'stock_diffs':stock_diffs[:30]}}
Path('data/shopify-sku-audit-vs-excel-julio-9.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({k:v for k,v in report.items() if k!='samples'},ensure_ascii=False,indent=2))
print('report=data/shopify-sku-audit-vs-excel-julio-9.json')
