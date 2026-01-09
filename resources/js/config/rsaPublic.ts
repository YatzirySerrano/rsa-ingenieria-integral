export type NavLink = { label: string; id: string }

export const RSA_PUBLIC = {
  logoSrc: '/img/logoRSA.png',
  logoBlancoSrc:'/img/logoBlancoRSA.png',
  heroSrc: '/img/hero-rsa.png',
  waLink: 'https://wa.me/527774972364?text=Hola%2C%20quiero%20solicitar%20una%20cotizaci%C3%B3n.',
  links: [
    { label: 'Servicios', id: 'servicios' },
    { label: '¿Por qué elegirnos?', id: 'porque' },
    { label: 'Testimonios', id: 'testimonios' },
    { label: 'Productos', id: 'productos' },
    { label: 'Contacto', id: 'contacto' },
  ] as const satisfies readonly NavLink[],
} as const
