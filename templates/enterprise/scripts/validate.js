#!/usr/bin/env node
/**
 * validate.js - Verifica que el sitio está correctamente configurado
 * Uso: node scripts/validate.js
 * O: npm run validate
 */

import fs from 'fs';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

console.log('🔍 Validando configuración del sitio...\n');

const checks = [];
let hasErrors = false;

// Helper para agregar checks
function check(name, test, fix = '') {
  checks.push({ name, test, fix });
}

// 1. Verificar archivos esenciales
check(
  'skills-active.json existe',
  () => fs.existsSync(path.join(rootDir, 'skills-active.json')),
  'Crear skills-active.json: node scripts/skill-list.js'
);

check(
  'site.config.ts existe',
  () => fs.existsSync(path.join(rootDir, 'config', 'site.config.ts')),
  'Crear config/site.config.ts'
);

check(
  'Layout.astro existe',
  () => fs.existsSync(path.join(rootDir, 'src', 'layouts', 'Layout.astro')),
  'Crear src/layouts/Layout.astro'
);

// 2. Verificar dependencias
check(
  'node_modules instalado',
  () => fs.existsSync(path.join(rootDir, 'node_modules')),
  'Ejecutar: npm install'
);

check(
  '@astrojs/tailwind configurado',
  () => {
    const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));
    return pkg.devDependencies && pkg.devDependencies['@astrojs/tailwind'];
  },
  'Instalar: npm install -D @astrojs/tailwind tailwindcss@^3.4.0'
);

// 3. Verificar skills activas
check(
  'Skills activas válidas',
  () => {
    try {
      const data = JSON.parse(fs.readFileSync(
        path.join(rootDir, 'skills-active.json'), 
        'utf-8'
      ));
      return Array.isArray(data.skills);
    } catch {
      return false;
    }
  },
  'Verificar formato de skills-active.json'
);

// 4. Verificar build (opcional, puede ser lento)
const skipBuild = process.argv.includes('--skip-build');

if (!skipBuild) {
  check(
    'Build funciona',
    () => {
      try {
        execSync('npm run build', { 
          cwd: rootDir,
          stdio: 'pipe',
          timeout: 60000
        });
        return true;
      } catch {
        return false;
      }
    },
    'Revisar errores de build: npm run build'
  );
} else {
  console.log('⏭️  Build omitido (--skip-build)\n');
}

// Ejecutar checks
let passed = 0;
let failed = 0;

for (const { name, test, fix } of checks) {
  const result = test();
  const icon = result ? '✅' : '❌';
  console.log(`${icon} ${name}`);
  
  if (!result) {
    hasErrors = true;
    failed++;
    if (fix) {
      console.log(`   💡 Fix: ${fix}`);
    }
  } else {
    passed++;
  }
}

// Resultado
console.log('\n' + '='.repeat(50));
console.log(`Resultado: ${passed}/${checks.length} checks pasaron`);

if (hasErrors) {
  console.log(`❌ ${failed} errores encontrados`);
  console.log('\nPara ver más detalles, ejecuta:');
  console.log('  npm run build');
  process.exit(1);
} else {
  console.log('✅ Configuración válida. Todo listo para desarrollar!');
  process.exit(0);
}
