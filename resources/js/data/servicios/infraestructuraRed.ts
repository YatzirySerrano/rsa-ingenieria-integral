import infraestructuraRedHeroImg from '@/img/infraestructura-red-hero.jpeg'
import infraestructuraRedBeneficiosImg from '@/img/infraestructura-red-beneficios.jpg'

import hikvisionLogo from '@/img/brands/hikvision.svg'
import syscomLogo from '@/img/brands/syscom.svg'
import tpLinkLogo from '@/img/brands/tplink.svg'
import ubiquitiLogo from '@/img/brands/ubiquiti.svg'
import epcomLogo from '@/img/brands/epcom.png'

export const infraestructuraRedService = {
  hero: {
    badge: 'RSA · Infraestructura de red empresarial',
    title: 'Infraestructura de red\nempresarial',
    description:
      'Diseñamos e instalamos redes estables, ordenadas y preparadas para crecer. Integramos cableado estructurado, switches, routers, puntos de acceso WiFi y equipos de comunicación para mantener conectados tus sistemas de voz, datos, video y seguridad.',
    image: infraestructuraRedHeroImg,
    applications: ['Oficinas', 'Comercios', 'Corporativo', 'Industria'],
    highlights: [
      { title: 'Cableado estructurado', text: 'Red ordenada y preparada para operación' },
      { title: 'Switches y routers', text: 'Conectividad estable y administrable' },
      { title: 'WiFi empresarial', text: 'Cobertura optimizada por área' },
      { title: 'Certificación de puntos', text: 'Validación técnica de nodos de red' },
    ],
    bottomText:
      'Incluye: diagnóstico, diseño de red, instalación, pruebas, organización y entrega operativa.',
  },

  details: {
    sectionText:
      'Alcance operativo del servicio de infraestructura de red para empresas, oficinas, comercios y proyectos de seguridad electrónica.',
    includes: [
      {
        title: 'Cableado estructurado',
        text: 'Instalación de puntos de red, canalización, tubería, charolas, racks, patch panels y organización del cableado según el proyecto.',
      },
      {
        title: 'Switches, routers y equipos de comunicación',
        text: 'Configuración e integración de equipos para mantener una red estable, ordenada y preparada para los dispositivos del negocio.',
      },
      {
        title: 'WiFi empresarial',
        text: 'Distribución de puntos de acceso considerando cobertura, interferencias, cantidad de usuarios y áreas críticas.',
      },
      {
        title: 'Pruebas y certificación de puntos',
        text: 'Validamos nodos de red con equipo de prueba para confirmar continuidad, velocidad y correcta conexión.',
      },
    ],
    resultTitle: 'Resultado esperado',
    resultText:
      'Una red empresarial ordenada, funcional y escalable, capaz de soportar equipos de cómputo, cámaras IP, controles de acceso, teléfonos IP, puntos WiFi y otros sistemas conectados.',
    resultCards: [
      {
        title: 'Enfoque',
        text: 'Estabilidad + orden + crecimiento.',
      },
      {
        title: 'Entregables',
        text: 'Puntos de red, pruebas, organización y configuración base.',
      },
    ],
  },

  benefitsSection: {
    image: infraestructuraRedBeneficiosImg,
    badge: 'RSA • Redes empresariales',
    imageTitles: [
      'Red estable y ordenada.',
      'Cableado listo para operar.',
      'WiFi con mejor cobertura.',
      'Mantenimiento más sencillo.',
      'Infraestructura preparada para crecer.',
    ],
    imageTexts: [
      'Diseño técnico para conectar equipos, cámaras, accesos y usuarios.',
      'Canalización, etiquetado y organización profesional.',
      'Puntos de acceso ubicados según operación y demanda real.',
      'Una red ordenada facilita diagnóstico, soporte y ampliaciones.',
      'Base tecnológica para integrar nuevos servicios sin rehacer todo.',
    ],
  },

  benefits: [
    {
      title: 'Rendimiento óptimo y menos interrupciones',
      text: 'Una red bien diseñada mejora la transferencia de datos, reduce caídas de conexión y permite que los equipos trabajen con mayor estabilidad. Esto impacta directamente en la operación diaria de oficinas, comercios y sistemas de seguridad.',
    },
    {
      title: 'Fácil mantenimiento y diagnóstico',
      text: 'Al contar con cableado ordenado, etiquetado y concentrado correctamente en rack o gabinete, es más rápido identificar fallas, cambiar equipos, ampliar puntos o dar soporte sin afectar toda la operación.',
    },
    {
      title: 'Escalabilidad para crecimiento futuro',
      text: 'La infraestructura se plantea pensando en nuevas áreas, más usuarios, cámaras IP, controles de acceso, teléfonos, servidores o puntos WiFi. Así el negocio puede crecer sin improvisar instalaciones.',
    },
    {
      title: 'Integración de voz, datos, video y seguridad',
      text: 'Una misma red puede soportar múltiples tecnologías como CCTV IP, VoIP, controles de acceso, equipos de cómputo y WiFi empresarial, siempre que esté diseñada con el criterio técnico adecuado.',
    },
    {
      title: 'Instalación limpia y profesional',
      text: 'Cuidamos canalización, peinado de racks, conectores, patch panels y distribución del cableado para entregar una instalación funcional, estética y segura.',
    },
  ],

  steps: [
    {
      n: '01',
      title: 'Diagnóstico de infraestructura',
      text: 'Revisamos áreas de trabajo, equipos actuales, cobertura WiFi, rutas de cableado, puntos necesarios, rack o gabinete y necesidades futuras de crecimiento.',
    },
    {
      n: '02',
      title: 'Diseño técnico + propuesta',
      text: 'Definimos topología, cantidad de nodos, categoría de cableado, equipos recomendados, canalización, puntos de acceso y presupuesto del proyecto.',
    },
    {
      n: '03',
      title: 'Instalación y canalización',
      text: 'Realizamos tendido de cable, tubería, canaleta, rack, patch panel, conectores, puntos de red y organización física de la infraestructura.',
    },
    {
      n: '04',
      title: 'Configuración y pruebas',
      text: 'Configuramos equipos de red, validamos conexión, continuidad, rendimiento, cobertura WiFi y funcionamiento de los puntos instalados.',
    },
    {
      n: '05',
      title: 'Entrega y soporte',
      text: 'Entregamos la red operando, explicamos el uso básico y brindamos seguimiento para mantenimiento, ampliaciones o ajustes posteriores.',
    },
  ],

  cta: {
    title: '¿Listo para mejorar la red de tu empresa?',
    text: 'Te ayudamos a diseñar una infraestructura estable, ordenada y preparada para conectar tus equipos, cámaras, accesos y usuarios.',
  },

  brands: [
    { name: 'Ubiquiti', logo: ubiquitiLogo },
    { name: 'TP-Link Omada', logo: tpLinkLogo },
    { name: 'Hikvision', logo: hikvisionLogo },
    { name: 'SYSCOM', logo: syscomLogo },
    { name: 'Epcom', logo: epcomLogo },
    { name: 'Cableado Cat 6' },
    { name: 'Cableado Cat 6A' },
    { name: 'Patch panels' },
    { name: 'Racks y gabinetes' },
    { name: 'Access Points' },
  ],
}