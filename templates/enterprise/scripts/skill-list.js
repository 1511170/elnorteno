#!/usr/bin/env node
/**
 * Script: skill-list.js
 * Lista skills disponibles y activas
 */

import { readdirSync, existsSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

const skillsRoot = resolve(process.cwd(), '../../skills');
const activeSkillsPath = join(process.cwd(), 'skills-active.json');

console.log('🧩 KINTO CMS - Skills\n');

// Skills activas en este sitio
let activeConfig = { site: 'unknown', skills: [] };
if (existsSync(activeSkillsPath)) {
  try {
    activeConfig = JSON.parse(readFileSync(activeSkillsPath, 'utf-8'));
  } catch {
    console.warn('⚠️  skills-active.json corrupto, usando defaults');
  }
} else {
  console.warn('⚠️  No skills-active.json encontrado. ¿Estás dentro de un sitio?');
}
console.log(`📍 Sitio: ${activeConfig.site}`);
console.log(`✅ Skills activas: ${activeConfig.skills.length ? activeConfig.skills.join(', ') : 'Ninguna (core limpio)'}`);
console.log('');

// Skills disponibles
console.log('📦 Skills disponibles:\n');

for (const category of ['official', 'community']) {
  const catPath = join(skillsRoot, category);
  if (!existsSync(catPath)) continue;
  
  const skills = readdirSync(catPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => {
      const isActive = activeConfig.skills.includes(d.name);
      return `  ${isActive ? '✅' : '○'} ${d.name}${isActive ? ' (activa)' : ''}`;
    });
  
  if (skills.length) {
    console.log(`${category.toUpperCase()}:`);
    skills.forEach(s => console.log(s));
    console.log('');
  }
}

console.log('💡 Comandos:');
console.log('   node scripts/skill-add.js [nombre]     - Instalar skill');
console.log('   node scripts/skill-create.js [nombre]  - Crear nueva skill');
