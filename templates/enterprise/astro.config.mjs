import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Cargar skills activas
let activeSkills = [];
try {
  const skillsData = JSON.parse(
    fs.readFileSync(join(__dirname, 'skills-active.json'), 'utf-8')
  );
  activeSkills = skillsData.skills || [];
  console.log('✅ Skills activas:', activeSkills.length ? activeSkills.join(', ') : 'Ninguna (core limpio)');
} catch (error) {
  console.log('⚠️  No se pudo cargar skills-active.json:', error.message);
}

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://example.com', // Se actualiza en cada proyecto
  
  // Integración oficial de Tailwind 3 para Astro
  integrations: [tailwind()],
  
  build: {
    format: 'directory',
    compressHTML: true,
  },
  
  vite: {
    resolve: {
      alias: {
        // Alias para skills - permite importar fácilmente
        '@skills': join(__dirname, '../../skills'),
        '@skills-official': join(__dirname, '../../skills/official'),
        '@skills-community': join(__dirname, '../../skills/community'),
        
        // Alias para el sitio
        '@site': join(__dirname, 'src'),
        '@components': join(__dirname, 'src/components'),
        '@layouts': join(__dirname, 'src/layouts'),
        '@pages': join(__dirname, 'src/pages'),
        '@config': join(__dirname, 'config'),
      }
    },
    css: {
      // Tailwind 3 se configura via @astrojs/tailwind
    }
  }
});
