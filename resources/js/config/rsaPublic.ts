export type NavLink = { label: string; id: string }

export const RSA_PUBLIC = {
  logoSrc: '/img/logoRSA.jpg',
  heroSrc: '/img/hero-rsa.png',
  waLink: 'https://wa.me/527774972364?text=Hola%2C%20quiero%20solicitar%20una%20cotizaci%C3%B3n.',
  links: [
    { label: 'Servicios', id: 'servicios' },
    { label: 'Soluciones', id: 'soluciones' },
    { label: 'Proceso', id: 'proceso' },
    { label: 'Productos', id: 'productos' },
    { label: 'Contacto', id: 'contacto' },
  ] as const satisfies readonly NavLink[],
} as const
