#!/usr/bin/env node
/** Retry failed inventory updates from a previous POS sync report.
 * Enables Shopify inventory tracking on variants that failed with
 * "Inventory item does not have inventory tracking enabled", then sets stock.
 */
import fs from 'node:fs';
import path from 'node:path';

const args = Object.fromEntries(process.argv.slice(2).map((arg)=>{const [k,...v]=arg.replace(/^--/,'').split('='); return [k, v.length ? v.join('=') : true];}));
const cwd=process.cwd();
const input=path.resolve(cwd,args.input||'data/shopify-sync-existing-apply.json');
const output=path.resolve(cwd,args.output||'data/shopify-sync-inventory-tracking-retry.json');
const apply=Boolean(args.apply);
const delayMs=args.delay?Number(args.delay):500;
const limit=args.limit?Number(args.limit):Infinity;
loadEnv(path.resolve(cwd,'.env'));
const DOMAIN=process.env.SHOPIFY_STORE_DOMAIN;
const TOKEN=process.env.SHOPIFY_ACCESS_TOKEN||process.env.SHOPIFY_ADMIN_ACCESS_TOKEN||process.env.SHOPIFY_ADMIN_TOKEN;
const API_VERSION=process.env.SHOPIFY_API_VERSION||'2025-10';
if(!DOMAIN||!TOKEN){console.error('Missing Shopify env'); process.exit(1)}
function loadEnv(file){if(!fs.existsSync(file))return; for(const line of fs.readFileSync(file,'utf8').split('\n')){const m=line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/); if(m&&!process.env[m[1]]) process.env[m[1]]=m[2].trim();}}
function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
async function rest(method, endpoint, body, attempt=1){
 const url=endpoint.startsWith('http')?endpoint:`https://${DOMAIN}/admin/api/${API_VERSION}${endpoint}`;
 const res=await fetch(url,{method,headers:{'Content-Type':'application/json','X-Shopify-Access-Token':TOKEN},body:body?JSON.stringify(body):undefined});
 const text=await res.text(); let json={}; try{json=text?JSON.parse(text):{}}catch{json={raw:text}}
 if(res.status===429 && attempt<=6){const retry=Number(res.headers.get('retry-after')||2); await sleep(retry*1000+500); return rest(method,endpoint,body,attempt+1)}
 if(!res.ok) throw new Error(`Shopify ${method} ${endpoint} failed ${res.status}: ${JSON.stringify(json).slice(0,500)}`);
 return json;
}
const report=JSON.parse(fs.readFileSync(input,'utf8'));
const failed=(report.updates||[]).filter(u=>u.applied===false && u.inventory?.changed && u.inventoryItemId);
const retry={mode:apply?'apply':'dry-run', input, generatedAt:new Date().toISOString(), candidates:failed.length, applied:0, errors:[], updates:[]};
console.log(`${apply?'APPLY':'DRY-RUN'} retry inventory tracking for ${failed.length} variants`);
let i=0;
for(const u of failed.slice(0,limit)){
 const item={sku:u.sku, handle:u.handle, variantId:u.variantId, inventoryItemId:u.inventoryItemId, quantity:u.inventory.new};
 try{
  if(apply){
   await rest('PUT', `/variants/${u.variantId}.json`, {variant:{id:u.variantId, inventory_management:'shopify'}});
   await sleep(delayMs);
   await rest('POST','/inventory_levels/set.json',{location_id:report.location.id, inventory_item_id:u.inventoryItemId, available:u.inventory.new});
   item.applied=true; retry.applied++;
  } else item.applied=false;
 }catch(err){item.applied=false; item.error=err.message; retry.errors.push(item)}
 retry.updates.push(item); i++;
 if(i%50===0) console.log(`Processed ${i}/${Math.min(failed.length,limit)}`);
 await sleep(delayMs);
}
fs.writeFileSync(output,JSON.stringify(retry,null,2));
console.log(`Report: ${output}`);
console.log(JSON.stringify({candidates:retry.candidates, attempted:retry.updates.length, applied:retry.applied, errors:retry.errors.length},null,2));
