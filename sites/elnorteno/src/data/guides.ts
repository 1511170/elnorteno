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
      { label: 'Comparar calibre 4.5 y 5.5', href: '/guias/rifles-aire-55-precio-colombia/' },
      { label: 'Elegir mira para rifle de aire', href: '/guias/miras-para-rifles-de-aire-colombia/' },
      { label: 'Ver armas de aire', href: '/store/armas-de-aire/' },
      { label: 'Ver tiro deportivo', href: '/store/tiro-deportivo/' },
      { label: 'Contactar asesor', href: '/contacto' },
    ],
    compliance: 'Esta guía es informativa y promueve práctica deportiva responsable. No reemplaza revisión normativa ni asesoría específica para compra, transporte o uso.',
  },
  {
    slug: 'rifles-aire-55-precio-colombia',
    title: 'Rifles de aire 5.5: precio y cómo elegir en Colombia',
    description: 'Guía para comparar rifles de aire calibre 5.5 en Colombia: precio, uso deportivo, potencia, diábolos, accesorios, marcas, disponibilidad y asesoría responsable.',
    category: 'Tiro deportivo',
    updated: '2026-06-14',
    intro: 'Las búsquedas de rifles de aire 5.5 suelen mezclar precio, marca, potencia y disponibilidad. Esta guía ayuda a comparar opciones de forma responsable, entendiendo qué cambia frente al calibre 4.5 y qué revisar antes de comprar en Colombia.',
    sections: [
      { heading: 'Qué significa calibre 5.5', body: 'El calibre 5.5 mm describe el diámetro aproximado del diábolo compatible. Frente a 4.5, suele buscarse por sensación de impacto, peso del proyectil y uso deportivo específico, pero la elección depende del rifle, experiencia, lugar de práctica y disponibilidad de consumibles.', bullets: ['Confirma siempre que los diábolos sean del mismo calibre del rifle.', 'Revisa peso del diábolo, recomendación del fabricante y disponibilidad.', 'No compres sólo por potencia: ergonomía, garantía y mantenimiento también importan.'] },
      { heading: 'Precio: por qué varía tanto', body: 'El precio de un rifle de aire 5.5 puede variar por marca, sistema, potencia, materiales, mira incluida, estuche, garantía, importación y disponibilidad local. Por eso conviene comparar referencias activas y confirmar inventario antes de decidir.' },
      { heading: 'Marcas, accesorios y compatibilidad', body: 'En El Norteño puedes encontrar referencias de marcas como Gamo y otras según inventario. Antes de comprar, valida mira, monturas, estuche, diábolos, limpieza y repuestos compatibles para evitar compras incompletas.' },
      { heading: 'Compra responsable en Colombia', body: 'La compra y el despacho pueden estar sujetos a disponibilidad, edad mínima, validaciones internas, logística y normativa aplicable. Esta guía es informativa y no reemplaza la revisión de condiciones específicas antes de comprar.' },
    ],
    steps: [
      { name: 'Define uso y experiencia', text: 'Aclara si buscas iniciación, práctica deportiva responsable o una referencia específica de marca/calibre.' },
      { name: 'Compara precio total', text: 'Incluye rifle, diábolos, mira, estuche, mantenimiento, garantía y envío; no mires sólo el precio base.' },
      { name: 'Confirma disponibilidad', text: 'Antes de comprar, valida inventario, despacho, garantía y condiciones aplicables con un asesor de El Norteño.' },
    ],
    faqs: [
      { q: '¿Cuánto cuesta un rifle de aire 5.5 en Colombia?', a: 'El precio cambia según marca, sistema, potencia, accesorios incluidos, garantía e inventario. Revisa la categoría de rifles de aire comprimido y confirma disponibilidad actual por WhatsApp antes de comprar.' },
      { q: '¿Qué diferencia hay entre calibre 4.5 y 5.5?', a: 'Ambos son calibres de diábolos. 4.5 suele ser común para iniciación y práctica de precisión; 5.5 se busca por diábolos más pesados y usos deportivos específicos. La mejor opción depende de experiencia, rifle, consumibles y condiciones de uso responsable.' },
      { q: '¿Qué accesorios debo comprar junto con un rifle 5.5?', a: 'Revisa diábolos compatibles, mira o monturas si aplica, estuche, elementos de limpieza y recomendaciones del fabricante. Un asesor puede validar compatibilidad según la referencia.' },
      { q: '¿El Norteño vende rifles Gamo 5.5?', a: 'La disponibilidad de Gamo y otras marcas cambia por inventario e importación. Consulta la categoría de rifles de aire comprimido o escribe por WhatsApp para confirmar referencias activas.' },
    ],
    links: [
      { label: 'Ver rifles de aire comprimido', href: '/store/rifles-de-aire-comprimido/' },
      { label: 'Ver armas de aire', href: '/store/armas-de-aire/' },
      { label: 'Guía general de rifles de aire', href: '/guias/como-elegir-rifle-aire-comprimido-colombia/' },
      { label: 'Elegir mira para rifle de aire', href: '/guias/miras-para-rifles-de-aire-colombia/' },
      { label: 'Tiro deportivo responsable', href: '/guias/tiro-deportivo-responsable/' },
      { label: 'Contactar asesor', href: '/contacto' },
    ],
    compliance: 'Contenido informativo y policy-safe para compra responsable. No promueve usos indebidos ni reemplaza la revisión de normativa, edad mínima, logística o condiciones aplicables en Colombia.',
  },
  {
    slug: 'miras-para-rifles-de-aire-colombia',
    title: 'Miras para rifles de aire: cómo elegir en Colombia',
    description: 'Guía responsable para elegir miras para rifles de aire y tiro deportivo en Colombia: aumentos, monturas, compatibilidad, ajuste, mantenimiento y asesoría.',
    category: 'Tiro deportivo',
    updated: '2026-06-15',
    intro: 'Las miras para rifles de aire se buscan como accesorio para mejorar observación y precisión en práctica deportiva responsable. La decisión no depende sólo del aumento: también importan compatibilidad con el rifle, monturas, distancia de uso, ajuste, resistencia y asesoría antes de comprar.',
    sections: [
      { heading: 'Compatibilidad antes que aumento', body: 'Una mira debe ser compatible con el riel, monturas, retroceso o vibración del equipo y uso previsto. Antes de comprar, confirma si el rifle usa riel de 11 mm, Picatinny/Weaver u otra base, y si requiere monturas específicas.', bullets: ['Verifica riel y diámetro del tubo de la mira.', 'Confirma si el rifle trae mira incluida o si se compra por separado.', 'Evita elegir sólo por aumentos altos: una mira estable y compatible suele ser más útil.'] },
      { heading: 'Aumentos, objetivo y distancia de uso', body: 'Los aumentos fijos o variables deben elegirse según distancia, iluminación, experiencia y estabilidad del equipo. Un lente objetivo mayor puede captar más luz, pero también aumenta peso y tamaño.' },
      { heading: 'Montaje, calibración y mantenimiento', body: 'El montaje correcto evita desajustes y daños. Revisa monturas, nivelación, torque recomendado, protección de lentes, limpieza y recalibración después de transportar el equipo.' },
      { heading: 'Compra responsable y asesoría', body: 'La disponibilidad de miras y accesorios cambia por inventario. Para productos de tiro deportivo, El Norteño recomienda confirmar compatibilidad, condiciones de compra, edad mínima cuando aplique, logística y normativa vigente en Colombia.' },
    ],
    steps: [
      { name: 'Identifica el rifle y el riel', text: 'Ten a la mano marca, modelo, calibre y tipo de riel o base para validar compatibilidad.' },
      { name: 'Define distancia y uso deportivo', text: 'Elige aumentos y tamaño según práctica responsable, iluminación, estabilidad y experiencia.' },
      { name: 'Confirma monturas y disponibilidad', text: 'Consulta si requiere anillas, adaptadores, protección, instalación o accesorios adicionales antes de comprar.' },
    ],
    faqs: [
      { q: '¿Qué mira sirve para un rifle de aire?', a: 'Depende del modelo del rifle, tipo de riel, monturas, distancia de uso y resistencia requerida. Lo ideal es validar compatibilidad con un asesor antes de comprar.' },
      { q: '¿Más aumento siempre es mejor?', a: 'No. Más aumento puede reducir campo visual, exigir más estabilidad y aumentar peso. Para práctica deportiva conviene equilibrar aumentos, claridad, montaje y distancia real de uso.' },
      { q: '¿Necesito monturas o anillas aparte?', a: 'Muchas miras requieren monturas o anillas compatibles con el riel y el diámetro del tubo. Algunas referencias pueden venir en combo, pero la disponibilidad varía.' },
      { q: '¿El Norteño asesora para elegir miras?', a: 'Sí. Puedes consultar por WhatsApp o en tienda indicando rifle, calibre, tipo de riel y uso previsto para validar opciones disponibles.' },
    ],
    links: [
      { label: 'Ver tiro deportivo', href: '/store/tiro-deportivo/' },
      { label: 'Ver rifles de aire comprimido', href: '/store/rifles-de-aire-comprimido/' },
      { label: 'Ver armas de aire', href: '/store/armas-de-aire/' },
      { label: 'Guía de rifles de aire', href: '/guias/como-elegir-rifle-aire-comprimido-colombia/' },
      { label: 'Tiro deportivo responsable', href: '/guias/tiro-deportivo-responsable/' },
      { label: 'Contactar asesor', href: '/contacto' },
    ],
    compliance: 'Contenido informativo y policy-safe para accesorios de tiro deportivo. No promueve usos indebidos ni reemplaza revisión normativa, edad mínima, logística o condiciones aplicables en Colombia.',
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
