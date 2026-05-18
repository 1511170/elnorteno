# Nueva skill: <nombre>

## Qué hace

<!-- Una o dos frases. ¿Qué problema resuelve? -->

## Tipo

- [ ] Site-skill (`skills/community/` o `skills/official/`)
- [ ] Agent-skill (`.claude/skills/`)

## Checklist

- [ ] La carpeta sigue la estructura estándar (SKILL.md, index.ts, components/)
- [ ] `SKILL.md` tiene frontmatter completo (name, category, version, description, tags, recommendedFor)
- [ ] Corrí `kinto skill validate` y commiteé `skills/registry.json` + `MARKETPLACE.md`
- [ ] Cero hardcode de cliente (dominios, nombres, APIs específicas)
- [ ] La skill es reutilizable en cualquier sitio
- [ ] No modifiqué `core/`
- [ ] Props documentados en una tabla en SKILL.md
- [ ] schema.org incluido donde aplica
- [ ] `kinto build` pasa con la skill instalada

## Notas para el reviewer

<!-- Cualquier decisión de diseño, dependencia externa (needs:) o limitación -->
