export const CITY_PAGE_COPY: Record<string, {
  slug: string;
  region: string;
  intro: string;
  neighborhoods: string[];
  highlights: string[];
}> = {
  Bucaramanga: {
    slug: 'bucaramanga',
    region: 'Santander',
    intro: 'Tienda El Norteño en Bucaramanga para pesca deportiva, camping, outdoor, tiro deportivo responsable y equipo de campo. Atiende compras locales, recogida en tienda y envíos a Santander y toda Colombia.',
    neighborhoods: ['Cabecera', 'Centro', 'Cañaveral', 'Floridablanca', 'Girón', 'Piedecuesta'],
    highlights: ['Asesoría para pesca en Santander y salidas de campo', 'Recogida en tienda en Bucaramanga', 'Despacho nacional desde Colombia'],
  },
  Medellín: {
    slug: 'medellin',
    region: 'Antioquia',
    intro: 'Tienda El Norteño en Medellín para comprar equipo outdoor, pesca, camping y tiro deportivo responsable con asesoría local, atención por WhatsApp y envíos a Antioquia y toda Colombia.',
    neighborhoods: ['El Poblado', 'Laureles', 'Envigado', 'Sabaneta', 'Bello', 'Itagüí'],
    highlights: ['Atención local en Galerías de San Diego', 'Equipo para camping y pesca en Antioquia', 'Envío nacional y recogida según disponibilidad'],
  },
  Valledupar: {
    slug: 'valledupar',
    region: 'Cesar',
    intro: 'Tienda El Norteño en Valledupar para pesca, camping, equipo outdoor, campo y tiro deportivo responsable. Atención local, WhatsApp y envíos al Cesar, la Costa Caribe y toda Colombia.',
    neighborhoods: ['Centro', 'Novalito', 'La Nevada', 'Aguachica', 'Bosconia', 'Costa Caribe'],
    highlights: ['Asesoría para campo, pesca y outdoor en el Cesar', 'Recogida en tienda en Valledupar', 'Despacho a ciudades de Colombia'],
  },
};
