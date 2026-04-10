#!/usr/bin/env node
/**
 * Web Scraper - Extrae contenido completo de un sitio
 * 
 * Uso:
 *   node scrape.cjs --url=https://ejemplo.com --output=./scraped
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Parsear argumentos
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  if (key && value) acc[key.replace('--', '')] = value;
  return acc;
}, {});

const config = {
  url: args.url || 'https://ejemplo.com',
  output: args.output || './scraped-content',
  maxPages: parseInt(args.maxPages) || 20,
  waitTime: parseInt(args.waitTime) || 3000
};

// Crear directorios
const dirs = {
  root: config.output,
  pages: path.join(config.output, 'pages'),
  images: path.join(config.output, 'images'),
  json: path.join(config.output, 'json')
};

Object.values(dirs).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Datos recolectados
const scrapedData = {
  site: {
    url: config.url,
    scrapedAt: new Date().toISOString(),
    pages: []
  }
};

const visitedUrls = new Set();
const urlsToVisit = [config.url];

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getBaseUrl(url) {
  try {
    const urlObj = new URL(url);
    return `${urlObj.protocol}//${urlObj.hostname}`;
  } catch {
    return config.url;
  }
}

function normalizeUrl(url, baseUrl) {
  try {
    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) return baseUrl + url;
    if (!url.startsWith('http')) return baseUrl + '/' + url;
    return url;
  } catch {
    return null;
  }
}

function isSameDomain(url, baseUrl) {
  try {
    const urlObj = new URL(url);
    const baseObj = new URL(baseUrl);
    return urlObj.hostname === baseObj.hostname;
  } catch {
    return false;
  }
}

async function downloadImage(page, imageUrl, filename) {
  try {
    const response = await page.goto(imageUrl, { waitUntil: 'networkidle0', timeout: 30000 });
    const buffer = await response.buffer();
    fs.writeFileSync(path.join(dirs.images, filename), buffer);
    return true;
  } catch (error) {
    console.log(`     ⚠️  Error descargando imagen: ${error.message}`);
    return false;
  }
}

async function scrapePage(browser, url) {
  const page = await browser.newPage();
  
  try {
    console.log(`🔍 Scraping: ${url}`);
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await sleep(config.waitTime);
    
    const baseUrl = getBaseUrl(url);
    
    // Extraer datos de la página
    const pageData = await page.evaluate((baseUrl) => {
      const data = {
        url: window.location.href,
        title: document.title,
        meta: {
          description: document.querySelector('meta[name="description"]')?.content || '',
          keywords: document.querySelector('meta[name="keywords"]')?.content || ''
        },
        headings: {
          h1: Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim()).filter(Boolean),
          h2: Array.from(document.querySelectorAll('h2')).map(h => h.innerText.trim()).filter(Boolean),
          h3: Array.from(document.querySelectorAll('h3')).map(h => h.innerText.trim()).filter(Boolean)
        },
        paragraphs: Array.from(document.querySelectorAll('p')).map(p => p.innerText.trim()).filter(t => t.length > 50),
        links: [],
        images: [],
        testimonials: [],
        services: [],
        contact: {
          emails: [],
          phones: [],
          addresses: []
        }
      };
      
      // Extraer todos los links
      document.querySelectorAll('a[href]').forEach(a => {
        data.links.push({
          text: a.innerText.trim(),
          href: a.href,
          title: a.title || ''
        });
      });
      
      // Extraer imágenes
      document.querySelectorAll('img').forEach(img => {
        data.images.push({
          src: img.src,
          alt: img.alt || '',
          title: img.title || ''
        });
      });
      
      // Buscar testimonios
      document.querySelectorAll('*').forEach(el => {
        const text = el.innerText || '';
        // Patrones comunes de testimonios
        if (text.includes('"') && text.length > 100 && text.length < 500) {
          const authorEl = el.querySelector('h4, h5, .author, .name, strong');
          const roleEl = el.querySelector('span, .role, .position, em');
          
          if (authorEl) {
            data.testimonials.push({
              quote: text.split('"')[1] || text,
              author: authorEl.innerText.trim(),
              role: roleEl?.innerText.trim() || ''
            });
          }
        }
      });
      
      // Buscar servicios
      document.querySelectorAll('h2, h3, h4').forEach(heading => {
        const section = heading.closest('section') || heading.parentElement;
        const desc = section?.querySelector('p')?.innerText || '';
        
        if (desc.length > 50 && desc.length < 300) {
          data.services.push({
            title: heading.innerText.trim(),
            description: desc
          });
        }
      });
      
      // Extraer información de contacto
      const bodyText = document.body.innerText;
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const phoneRegex = /[\+\(]?[1-9][0-9 \-\(\)]{7,}[0-9]/g;
      
      data.contact.emails = [...bodyText.matchAll(emailRegex)].map(m => m[0]);
      data.contact.phones = [...bodyText.matchAll(phoneRegex)].map(m => m[0]);
      
      return data;
    }, baseUrl);
    
    // Guardar HTML de la página
    const html = await page.content();
    const filename = url.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.html';
    fs.writeFileSync(path.join(dirs.pages, filename), html);
    
    // Descargar imágenes principales
    const imagePromises = pageData.images.slice(0, 10).map(async (img, idx) => {
      try {
        const imgUrl = normalizeUrl(img.src, baseUrl);
        if (!imgUrl) return;
        
        const ext = path.extname(new URL(imgUrl).pathname) || '.jpg';
        const imgFilename = `img_${Date.now()}_${idx}${ext}`;
        
        // Usar curl para descargar
        const { execSync } = require('child_process');
        execSync(`curl -sL "${imgUrl}" -o "${path.join(dirs.images, imgFilename)}"`, { timeout: 30000 });
        
        img.localFile = imgFilename;
        console.log(`     📸 Imagen: ${imgFilename}`);
      } catch (e) {
        // Ignorar errores de imágenes
      }
    });
    
    await Promise.all(imagePromises);
    
    // Encontrar nuevos links para visitar
    pageData.links.forEach(link => {
      const fullUrl = normalizeUrl(link.href, baseUrl);
      if (fullUrl && isSameDomain(fullUrl, config.url) && !visitedUrls.has(fullUrl)) {
        if (!fullUrl.includes('#') && !fullUrl.match(/\.(pdf|jpg|png|gif|css|js)$/i)) {
          urlsToVisit.push(fullUrl);
        }
      }
    });
    
    // Limpiar y guardar datos
    delete pageData.links; // No guardar todos los links en el JSON
    scrapedData.site.pages.push(pageData);
    
    console.log(`   ✅ Título: ${pageData.title}`);
    console.log(`   📝 Párrafos: ${pageData.paragraphs.length}`);
    console.log(`   📸 Imágenes: ${pageData.images.length}`);
    console.log(`   💬 Testimonios: ${pageData.testimonials.length}`);
    console.log(`   🔧 Servicios: ${pageData.services.length}`);
    
    return pageData;
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return null;
  } finally {
    await page.close();
  }
}

async function generateReport() {
  const report = `# Reporte de Scraping

**Sitio:** ${scrapedData.site.url}  
**Fecha:** ${new Date().toLocaleString()}  
**Páginas scrapeadas:** ${scrapedData.site.pages.length}

## Resumen de Contenido

${scrapedData.site.pages.map(page => `
### ${page.title}
- **URL:** ${page.url}
- **H1:** ${page.headings.h1.join(', ')}
- **Párrafos:** ${page.paragraphs.length}
- **Imágenes:** ${page.images.length}
- **Testimonios:** ${page.testimonials.length}
`).join('\n')}

## Contacto Encontrado

${scrapedData.site.pages.map(page => `
### ${page.title}
${page.contact.emails.length ? `- **Emails:** ${[...new Set(page.contact.emails)].join(', ')}` : ''}
${page.contact.phones.length ? `- **Teléfonos:** ${[...new Set(page.contact.phones)].join(', ')}` : ''}
`).join('\n')}

## Testimonios

${scrapedData.site.pages.flatMap(p => p.testimonials).map(t => `
> "${t.quote}"
> — **${t.author}**${t.role ? `, ${t.role}` : ''}
`).join('\n')}
`;

  fs.writeFileSync(path.join(config.output, 'report.md'), report);
}

async function main() {
  console.log('🕷️  Iniciando Web Scraper...\n');
  console.log(`📍 URL base: ${config.url}`);
  console.log(`📁 Output: ${config.output}\n`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    while (urlsToVisit.length > 0 && visitedUrls.size < config.maxPages) {
      const url = urlsToVisit.shift();
      
      if (visitedUrls.has(url)) continue;
      visitedUrls.add(url);
      
      await scrapePage(browser, url);
      console.log('');
    }
    
    // Guardar JSON
    fs.writeFileSync(
      path.join(dirs.json, 'content.json'),
      JSON.stringify(scrapedData, null, 2)
    );
    
    // Generar reporte
    await generateReport();
    
    console.log('\n✅ Scraping completado!');
    console.log(`📊 Páginas: ${scrapedData.site.pages.length}`);
    console.log(`📁 Resultados en: ${config.output}`);
    console.log(`📄 Reporte: ${path.join(config.output, 'report.md')}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await browser.close();
  }
}

main();
