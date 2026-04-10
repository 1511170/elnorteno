/**
 * Skill: testimonials
 * Sistema de testimonios con schema.org markup
 * Reutilizable para cualquier sitio
 */

// Exportar componentes para uso directo
export { default as TestimonialsGrid } from './components/TestimonialsGrid.astro';
export { default as TestimonialCard } from './components/TestimonialCard.astro';

export const config = {
  name: 'testimonials',
  version: '1.0.0',
  description: 'Testimonials system with schema.org markup for AI citations',
  category: 'content',
  author: 'Kimi Code',
  createdFor: 'kinto-cms',
  reusable: true
};

export function install(context: any) {
  // Registra componentes
  context.addComponent('TestimonialsGrid', './components/TestimonialsGrid.astro');
  context.addComponent('TestimonialCard', './components/TestimonialCard.astro');
  
  // Añade CMS collection
  context.addCMSCollection({
    name: 'testimonials',
    label: 'Testimonios',
    folder: 'src/content/testimonials',
    create: true,
    fields: [
      { label: 'Autor', name: 'author', widget: 'string', required: true },
      { label: 'Empresa', name: 'company', widget: 'string' },
      { label: 'Testimonio', name: 'quote', widget: 'markdown', required: true },
      { label: 'Foto', name: 'image', widget: 'image', required: false },
      { label: 'Calificación', name: 'rating', widget: 'number', min: 1, max: 5, default: 5 },
      { label: 'Fecha', name: 'date', widget: 'datetime' },
      { label: 'Publicado', name: 'published', widget: 'boolean', default: true }
    ]
  });
  
  // Añade schema.org script
  context.addSchemaType('Review');
  
  console.log('✅ Skill testimonials instalada');
  console.log('   Componentes: TestimonialsGrid, TestimonialCard');
  console.log('   CMS: Colección "testimonials" creada');
}
