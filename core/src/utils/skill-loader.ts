/**
 * Skill Loader - Core utility para cargar skills dinámicamente
 * 
 * Las skills se cargan desde skills/[official|community]/[name]/
 * y se integran en el sitio activo.
 */

import { readdirSync, existsSync } from 'fs';
import { join, resolve } from 'path';

export interface SkillConfig {
  name: string;
  version: string;
  description: string;
  dependencies?: string[];
  install: (context: SiteContext) => void;
}

export interface SiteContext {
  sitePath: string;
  addComponent: (name: string, path: string) => void;
  addRoute: (path: string, component: string) => void;
  addCMSField: (collection: string, field: any) => void;
  addCMSCollection: (collection: string, fields: any[]) => void;
  addSchemaType: (type: string, data?: Record<string, any>) => void;
  addConfigFile: (filename: string, content: string | object) => void;
  addMetaTag: (attrs: Record<string, string>) => void;
  addScript: (src: string, attrs?: Record<string, string>) => void;
  addStyle: (css: string) => void;
}

const SKILLS_ROOT = resolve(process.cwd(), '../../skills');

export function listAvailableSkills(): string[] {
  const skills: string[] = [];
  
  for (const category of ['official', 'community']) {
    const categoryPath = join(SKILLS_ROOT, category);
    if (!existsSync(categoryPath)) continue;
    
    const dirs = readdirSync(categoryPath, { withFileTypes: true })
      .filter(d => d.isDirectory())
      .map(d => `${category}/${d.name}`);
    
    skills.push(...dirs);
  }
  
  return skills;
}

export async function loadSkill(skillPath: string): Promise<SkillConfig | null> {
  const fullPath = join(SKILLS_ROOT, skillPath, 'index.ts');
  
  if (!existsSync(fullPath)) {
    console.warn(`Skill not found: ${skillPath}`);
    return null;
  }
  
  try {
    const module = await import(fullPath);
    return module.default || module;
  } catch (error) {
    console.error(`Error loading skill ${skillPath}:`, error);
    return null;
  }
}

export function getSiteActiveSkills(sitePath: string): string[] {
  const configPath = join(sitePath, 'skills-active.json');
  
  if (!existsSync(configPath)) {
    return [];
  }
  
  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content).skills || [];
  } catch {
    return [];
  }
}
