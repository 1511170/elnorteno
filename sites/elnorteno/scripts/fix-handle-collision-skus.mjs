#!/usr/bin/env node
/** Fix products whose handle exists in Shopify but SKU does not match POS Excel.
 * Uses exact handle collisions from create-missing dry-run. Safe guard:
 * - only one Shopify product for handle
 * - one variant only
 * - target SKU not already present elsewhere
 */
import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
const args=Object.fromEntries(process.argv.slice(2).map(a=>{const [k,...v]=a.replace(/^--/,'').split('=');return [k,v.length?v.join('='):true]}));
const cwd=process.cwd(); const apply=Boolean(args.apply); const delayMs=args.delay?Number(args.delay):550;
const csvPath=path.resolve(cwd,args.csv||'data/shopify-import-enriched.csv');
const collisionsPath=path.resolve(cwd,args.collisions||'data/shopify-create-missing-retry-one.json');
const reportPath=path.resolve(cwd,args.report||`data/shopify-fix-handle-collision-skus-${new Date().toISOString().replace(/[:.]/g,'-')}.json`);
loadEnv(path.resolve(cwd,'.env'));
const DOMAIN=process.env.SHOPIFY_STORE_DOMAIN; const TOKEN=process.env.SHOPIFY_ACCESS_TOKEN||process.env.SHOPIFY_ADMIN_ACCESS_TOKEN||process.env.SHOPIFY_ADMIN_TOKEN; const API_VERSION=process.env.SHOPIFY_API_VERSION||'2025-10';
if(!DOMAIN||!TOKEN){console.error('Missing Shopify env');process.exit(1)}
function loadEnv(f){if(!fs.existsSync(f))return;for(const line of fs.readFileSync(f,'utf8').split('\n')){const m=line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);if(m&&!process.env[m[1]])process.env[m[1]]=m[2].trim();}}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function rest(method,endpoint,body,attempt=1){const url=endpoint.startsWith('http')?endpoint:`https://${DOMAIN}/admin/api/${API_VERSION}${endpoint}`;const res=await fetch(url,{method,headers:{'Content-Type':'application/json','X-Shopify-Access-Token':TOKEN},body:body?JSON.stringify(body):undefined});const text=await res.text();let json={};try{json=text?JSON.parse(text):{}}catch{json={raw:text}}if(res.status===429&&attempt<=8){await sleep(Number(res.headers.get('retry-after')||2)*1000+500);return rest(method,endpoint,body,attempt+1)}if(!res.ok)throw new Error(`Shopify ${method} ${endpoint} failed ${res.status}: ${JSON.stringify(json).slice(0,500)}`);return {json,headers:res.headers};}
function nextLink(h){const m=(h||'').match(/<([^>]+)>;\s*rel="next"/);return m?m[1]:null}
function int(v){const n=Number.parseFloat(String(v||'0').replace(/,/g,''));return Number.isFinite(n)?Math.round(n):0}
async function fetchAllSkuSet(){const skus=new Set();let url=`https://${DOMAIN}/admin/api/${API_VERSION}/products.json?limit=250&fields=id,handle,variants`;let pages=0;while(url&&pages<140){const {json,headers}=await rest('GET',url);for(const p of json.products||[])for(const v of p.variants||[]){const sku=String(v.sku||'').trim();if(sku)skus.add(sku)}url=nextLink(headers.get('link'));pages++;await sleep(100)}return skus}
async function getProductByHandle(handle){const {json}=await rest('GET',`/products.json?handle=${encodeURIComponent(handle)}&fields=id,handle,title,variants,status`);return json.products||[]}
async function getLocation(){const {json}=await rest('GET','/locations.json');return (json.locations||[]).find(l=>l.active!==false)||json.locations?.[0]}
const rows=parse(fs.readFileSync(csvPath,'utf8'),{columns:true,skip_empty_lines:true}); const bySku=new Map(rows.map(r=>[String(r['Variant SKU']).trim(),r]));
const collisionReport=JSON.parse(fs.readFileSync(collisionsPath,'utf8')); const collisions=collisionReport.handleCollisions||[];
async function main(){console.log(`${apply?'APPLY':'DRY-RUN'} fix ${collisions.length} handle/SKU collisions`);const skuSet=await fetchAllSkuSet();const location=await getLocation();const report={mode:apply?'apply':'dry-run',generatedAt:new Date().toISOString(),candidates:0,applied:0,skipped:[],errors:[],updates:[]};for(const c of collisions){const row=bySku.get(String(c.sku)); if(!row){report.skipped.push({...c,reason:'CSV row missing'});continue} if(skuSet.has(String(c.sku))){report.skipped.push({...c,reason:'target SKU already exists'});continue} const products=await getProductByHandle(c.handle); if(products.length!==1){report.skipped.push({...c,reason:`handle product count ${products.length}`});continue} const p=products[0]; if((p.variants||[]).length!==1){report.skipped.push({...c,reason:`variant count ${(p.variants||[]).length}`});continue} const v=p.variants[0]; const update={sku:String(c.sku),handle:c.handle,title:c.title,productId:p.id,variantId:v.id,inventoryItemId:v.inventory_item_id,oldSku:v.sku||'',newSku:String(c.sku),oldPrice:v.price,newPrice:String(int(row['Variant Price'])),newQty:int(row['Variant Inventory Qty'])}; report.candidates++; try{ if(apply){await rest('PUT',`/variants/${v.id}.json`,{variant:{id:v.id,sku:update.newSku,price:update.newPrice,barcode:row['Variant Barcode']||undefined,inventory_management:'shopify'}}); await sleep(delayMs); await rest('POST','/inventory_levels/set.json',{location_id:location.id,inventory_item_id:v.inventory_item_id,available:update.newQty}); update.applied=true; report.applied++; skuSet.add(update.newSku)} }catch(e){update.applied=false; update.error=e.message; report.errors.push(update)} report.updates.push(update); if(report.candidates%50===0)console.log(`Processed ${report.candidates}/${collisions.length}; applied ${report.applied}; errors ${report.errors.length}`); await sleep(delayMs)}fs.writeFileSync(reportPath,JSON.stringify(report,null,2));console.log(`Report: ${reportPath}`);console.log(JSON.stringify({candidates:report.candidates,applied:report.applied,skipped:report.skipped.length,errors:report.errors.length},null,2));}
main().catch(e=>{console.error(e);process.exitCode=1});
