export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: string;
  updated: string;
  intro: string;
  sections: { heading: string; body: string; bullets?: string[] }[];
  steps: { name: string; text: string }[];
  faqs: { q: string; a: string }[];
  links: { label: string; href: string }[];
  compliance?: string;
};

export const GUIDES: Guide[] = [
  {
    slug: 'como-elegir-rifle-aire-comprimido-colombia',
    title: 'Cómo elegir un rifle de aire comprimido en Colombia',
    description: 'Guía responsable para comparar rifles de aire comprimido: calibre, uso, accesorios, mantenimiento, disponibilidad y normativa aplicable en Colombia.',
    category: 'Tiro deportivo',
    updated: '2026-06-12',
    intro: 'Elegir un rifle de aire comprimido no depende sólo de marca o precio. Conviene revisar el uso previsto, calibre, sistema de propulsión, peso, accesorios compatibles, disponibilidad de diábolos y condiciones de uso responsable.',
    sections: [
      { heading: 'Define el uso antes de comprar', body: 'Un rifle para iniciación recreativa no exige lo mismo que uno para práctica de precisión. Antes de elegir, aclara dónde lo usarás, qué nivel de experiencia tienes y qué accesorios necesitas.', bullets: ['Práctica recreativa o iniciación.', 'Tiro deportivo responsable.', 'Uso de campo permitido y sujeto a normativa aplicable.'] },
      { heading: 'Calibre, potencia y munición', body: 'El calibre influye en trayectoria, disponibilidad de diábolos, mantenimiento y experiencia de uso. Confirma siempre qué calibre maneja la referencia y qué consumibles están disponibles.' },
      { heading: 'Miras, estuches y mantenimiento', body: 'Algunas referencias se venden como combo y otras requieren accesorios por separado. Revisa si incluye mira, estuche, monturas, repuestos o recomendaciones de limpieza.' },
    ],
    steps: [
      { name: 'Elige el uso principal', text: 'Define si será para iniciación, práctica deportiva o uso de campo permitido.' },
      { name: 'Compara calibre y accesorios', text: 'Revisa calibre, sistema, mira, estuche, diábolos compatibles y mantenimiento.' },
      { name: 'Confirma disponibilidad', text: 'Consulta inventario, despacho, garantía y condiciones aplicables antes de comprar.' },
    ],
    faqs: [
      { q: '¿Qué debo revisar antes de comprar un rifle de aire comprimido?', a: 'Uso previsto, calibre, potencia, peso, accesorios incluidos, disponibilidad de diábolos, garantía y normativa aplicable.' },
      { q: '¿El Norteño asesora para elegir rifle de aire?', a: 'Sí. Puedes consultar por WhatsApp o en tienda física para validar calibre, accesorios y disponibilidad.' },
      { q: '¿La compra está sujeta a condiciones?', a: 'Sí. La disponibilidad, despacho y uso pueden estar sujetos a edad mínima, validaciones internas, logística y normativa colombiana aplicable.' },
    ],
    links: [
      { label: 'Ver rifles de aire comprimido', href: '/store/rifles-de-aire-comprimido/' },
      { label: 'Ver armas de aire', href: '/store/armas-de-aire/' },
      { label: 'Ver tiro deportivo', href: '/store/tiro-deportivo/' },
      { label: 'Contactar asesor', href: '/contacto' },
    ],
    compliance: 'Esta guía es informativa y promueve práctica deportiva responsable. No reemplaza revisión normativa ni asesoría específica para compra, transporte o uso.',
  },
  {
    slug: 'como-elegir-cana-pesca',
    title: 'Cómo elegir una caña de pesca',
    description: 'Guía para escoger cañas de pesca según técnica, acción, potencia, longitud, señuelo, línea, molinete y ambiente de pesca.',
    category: 'Pesca deportiva',
    updated: '2026-06-12',
    intro: 'La caña correcta depende de la técnica, especie objetivo, peso del señuelo, tipo de línea y ambiente de pesca. Una buena elección evita incompatibilidades con el molinete y mejora control, lance y sensibilidad.',
    sections: [
      { heading: 'Spinning, casting o combo', body: 'Las cañas spinning son versátiles y amigables para iniciar; las de casting ofrecen control con carretes específicos; los combos simplifican la compatibilidad para quienes buscan una solución lista.', bullets: ['Spinning: versatilidad y facilidad de uso.', 'Casting: control y técnica.', 'Combo: caña y molinete compatibles.'] },
      { heading: 'Potencia, acción y longitud', body: 'La potencia indica la carga que soporta la caña; la acción describe dónde flexiona; la longitud afecta lance, palanca y maniobrabilidad.' },
      { heading: 'Compatibilidad con línea y señuelos', body: 'Antes de comprar, revisa rango de línea y peso de señuelo recomendado. Si el señuelo o línea exceden el rango, el equipo puede rendir mal o desgastarse más rápido.' },
    ],
    steps: [
      { name: 'Define técnica y ambiente', text: 'Identifica si pescarás en río, lago, costa o mar y qué especie buscas.' },
      { name: 'Revisa especificaciones', text: 'Compara longitud, potencia, acción, tramos y rangos de línea/señuelo.' },
      { name: 'Valida compatibilidad', text: 'Asegura que caña, molinete, línea y señuelo trabajen en el mismo rango.' },
    ],
    faqs: [
      { q: '¿Qué diferencia hay entre caña spinning y casting?', a: 'Spinning usa molinete abierto y es versátil; casting usa carrete baitcasting y requiere más control técnico.' },
      { q: '¿Conviene comprar combo de caña y molinete?', a: 'Un combo es práctico para iniciar porque ya trae piezas compatibles; una caña sola permite armar un equipo más personalizado.' },
      { q: '¿El Norteño asesora para elegir caña?', a: 'Sí. Puedes indicar lugar de pesca, especie, presupuesto y técnica para recibir orientación sobre referencias disponibles.' },
    ],
    links: [
      { label: 'Ver cañas para pesca', href: '/store/canas-para-pesca/' },
      { label: 'Ver combos caña', href: '/store/combos-cana-para-pesca/' },
      { label: 'Ver molinetes', href: '/store/molinetes-de-pesca/' },
      { label: 'Ver pesca', href: '/store/pesca/' },
    ],
  },
  {
    slug: 'equipo-basico-camping-colombia',
    title: 'Equipo básico para camping en Colombia',
    description: 'Lista guía para preparar una salida de camping: carpa, descanso, iluminación, hidratación, cocina, clima, organización y asesoría.',
    category: 'Camping',
    updated: '2026-06-12',
    intro: 'Un kit básico de camping debe responder al clima, número de personas, duración del viaje y facilidad de transporte. En Colombia es común pasar de clima cálido a frío o lluvia en pocas horas, así que conviene priorizar protección, descanso e iluminación.',
    sections: [
      { heading: 'Dormir y protegerse', body: 'La base del equipo es una carpa adecuada, colchoneta o colchón inflable, aislante y protección contra lluvia. Revisa capacidad real, ventilación, impermeabilidad y tamaño empacado.' },
      { heading: 'Iluminación y energía', body: 'Linternas, lámparas y baterías son esenciales para campamento, camino y emergencias. Considera autonomía, tipo de batería y resistencia.' },
      { heading: 'Cocina, hidratación y organización', body: 'Dependiendo del plan, necesitarás recipientes, agua, elementos de cocina, bolsas secas, herramientas y accesorios para mantener el equipo ordenado.' },
    ],
    steps: [
      { name: 'Define destino y clima', text: 'Revisa temperatura, lluvia, acceso y duración del viaje.' },
      { name: 'Arma el kit base', text: 'Prioriza carpa, descanso, iluminación, agua, protección y organización.' },
      { name: 'Ajusta por grupo', text: 'Adapta capacidad y peso según número de personas y transporte disponible.' },
    ],
    faqs: [
      { q: '¿Qué equipo básico necesito para acampar?', a: 'Carpa, colchoneta o colchón inflable, linterna, agua, elementos de cocina, protección contra lluvia y accesorios de organización.' },
      { q: '¿Cómo elijo una carpa?', a: 'Revisa capacidad, impermeabilidad, ventilación, peso, facilidad de armado y clima donde la usarás.' },
      { q: '¿El Norteño ayuda a armar un kit de camping?', a: 'Sí. Puedes consultar según destino, duración del viaje, número de personas y presupuesto.' },
    ],
    links: [
      { label: 'Ver camping', href: '/store/camping/' },
      { label: 'Ver colchones y colchonetas', href: '/store/colchones-inflables-y-colchonetas/' },
      { label: 'Ver outdoor', href: '/store/outdoor/' },
      { label: 'Contactar tiendas', href: '/contacto' },
    ],
  },
  {
    slug: 'tiro-deportivo-responsable',
    title: 'Tiro deportivo responsable: qué revisar antes de comprar',
    description: 'Guía informativa sobre compra responsable de productos de tiro deportivo: categoría, accesorios, disponibilidad, asesoría y cumplimiento.',
    category: 'Tiro deportivo',
    updated: '2026-06-12',
    intro: 'El tiro deportivo responsable requiere elegir productos adecuados, entender accesorios compatibles y respetar condiciones de compra, transporte, uso y normativa aplicable. La asesoría previa ayuda a evitar compras incompatibles o usos no recomendados.',
    sections: [
      { heading: 'Compra con asesoría', body: 'Antes de comprar, confirma disponibilidad, calibre, accesorios, repuestos y garantía. Un asesor puede ayudarte a comparar referencias según experiencia y uso previsto.' },
      { heading: 'Accesorios y mantenimiento', body: 'Miras, diábolos, estuches, kits de limpieza y repuestos influyen en la experiencia. Verifica compatibilidad y disponibilidad de consumibles.' },
      { heading: 'Cumplimiento y uso responsable', body: 'Respeta edad mínima, condiciones de despacho, restricciones logísticas, normas locales y recomendaciones del fabricante. Evita usos no permitidos o inseguros.' },
    ],
    steps: [
      { name: 'Identifica la categoría', text: 'Rifle, pistola, mira, diábolo o accesorio tienen requisitos y compatibilidades diferentes.' },
      { name: 'Consulta condiciones', text: 'Pregunta por disponibilidad, despacho, garantía y normativa aplicable.' },
      { name: 'Usa responsablemente', text: 'Sigue recomendaciones del fabricante, normas locales y prácticas seguras.' },
    ],
    faqs: [
      { q: '¿Qué significa compra responsable en tiro deportivo?', a: 'Significa validar categoría, uso previsto, accesorios, disponibilidad, edad mínima, condiciones logísticas y normativa aplicable antes de comprar.' },
      { q: '¿Puedo comprar accesorios por separado?', a: 'Depende de inventario y compatibilidad. Consulta miras, diábolos, estuches y mantenimiento según la referencia.' },
      { q: '¿Esta guía reemplaza asesoría legal?', a: 'No. Es información general. Para casos específicos debes revisar normativa aplicable y consultar con un asesor antes de comprar.' },
    ],
    links: [
      { label: 'Ver tiro deportivo', href: '/store/tiro-deportivo/' },
      { label: 'Ver armas de aire', href: '/store/armas-de-aire/' },
      { label: 'Ver rifles de aire comprimido', href: '/store/rifles-de-aire-comprimido/' },
      { label: 'Contacto', href: '/contacto' },
    ],
    compliance: 'Contenido informativo y policy-safe. No promueve usos indebidos ni reemplaza la revisión de normas aplicables en Colombia.',
  },
];
