import cctvHeroImg from '@/img/cctv.jpg'

import accessproLogo from '@/img/brands/accesspro.png'
import epcomLogo from '@/img/brands/epcom.png'
import ezvizLogo from '@/img/brands/ezviz.svg'
import hikvisionLogo from '@/img/brands/hikvision.svg'
import hilookLogo from '@/img/brands/hilook.png'
import ruptelaLogo from '@/img/brands/ruptela.png'
import syscomLogo from '@/img/brands/syscom.svg'
import tpLinkLogo from '@/img/brands/tplink.svg'
import ubiquitiLogo from '@/img/brands/ubiquiti.svg'
import zktecoLogo from '@/img/brands/zkTeco.svg'

export const cctvService = {
  hero: {
    badge: 'RSA · Videovigilancia profesional',
    title: 'Cámaras de seguridad\n(CCTV)',
    description:
      'Control visual 24/7 con evidencia confiable. Diseñamos e instalamos sistemas estables con cobertura optimizada y grabación continua, ajustados al nivel de riesgo de cada proyecto.',
    image: cctvHeroImg,
    applications: ['Residencial', 'Comercial', 'Corporativo', 'Industrial'],
    highlights: [
      { title: 'HD / 4MP / 8MP', text: 'Calidad según el proyecto' },
      { title: 'NVR / DVR', text: 'Respaldo seguro de evidencia' },
      { title: 'Acceso local y remoto', text: 'Monitoreo estable desde app' },
      { title: 'Soporte técnico', text: 'Mantenimiento y seguimiento' }
    ],
    bottomText:
      'Incluye: configuración por ingeniería, pruebas completas y entrega documentada.'
  },

  details: {
    sectionText: 'Componentes y alcance operativo del servicio CCTV.',
    includes: [
      {
        title: 'Cámaras profesionales',
        text: 'HD / 4MP / 8MP según el nivel de riesgo, cobertura y necesidades del proyecto.'
      },
      {
        title: 'NVR / DVR',
        text: 'Grabación continua con respaldo seguro de evidencia para consulta y seguimiento.'
      },
      {
        title: 'Acceso local y remoto',
        text: 'Operación desde sitio y monitoreo desde app o computadora con configuración estable.'
      },
      {
        title: 'Ingeniería + soporte',
        text: 'Configuración, pruebas, entrega, ajustes y mantenimiento para continuidad operativa.'
      }
    ],
    resultTitle: 'Resultado esperado',
    resultText:
      'Un sistema de videovigilancia estable y escalable, con cobertura optimizada, evidencia utilizable y una operación diaria clara. Diseñado para prevenir, documentar y responder.',
    resultCards: [
      {
        title: 'Enfoque',
        text: 'Continuidad + evidencia + prevención.'
      },
      {
        title: 'Entregables',
        text: 'Pruebas, ajustes y guía operativa.'
      }
    ]
  },

  benefitsSection: {
    image: cctvHeroImg,
    badge: 'RSA • CCTV',
    imageTitles: [
      'Evidencia que sí sirve.',
      'Grabación útil y confiable.',
      'Monitoreo desde donde estés.',
      'Instalación limpia y profesional.',
      'Continuidad operativa real.'
    ],
    imageTexts: [
      'Menos “instalación”, más solución operativa.',
      'Respaldo visual pensado para cuando realmente se necesita.',
      'Consulta local o remota con configuración estable.',
      'Orden, canalización y puesta en marcha profesional.',
      'Seguimiento preventivo para mantener el sistema disponible.'
    ]
  },

  benefits: [
    {
      title: 'Cobertura optimizada (sin puntos ciegos)',
      text: 'Levantamos requerimientos, definimos ángulos, distancias y zonas críticas para diseñar una cobertura realmente útil. La distribución de cámaras se plantea según riesgo operativo, flujo de personas y puntos sensibles, reduciendo improvisaciones y evitando áreas sin visibilidad.'
    },
    {
      title: 'Evidencia confiable y respaldada',
      text: 'Configuramos grabación continua o por eventos según el proyecto, cuidando calidad de imagen, almacenamiento y respaldo de evidencia. El objetivo no es solo “grabar”, sino asegurar que cuando se necesite revisar un incidente, el material exista, sea claro y esté disponible.'
    },
    {
      title: 'Acceso local y remoto, bien configurado',
      text: 'Dejamos el sistema preparado para consulta local y remota con una configuración estable, segura y funcional. Esto permite supervisar cámaras desde monitor, celular o computadora, con accesos definidos correctamente para que la operación diaria sea simple y confiable.'
    },
    {
      title: 'Instalación limpia y profesional',
      text: 'Cuidamos canalización, sujeción, organización del cableado, montaje y puesta en marcha para entregar una instalación ordenada y duradera. No solo buscamos que funcione el sistema, sino que quede bien presentado, fácil de mantener y alineado con un estándar profesional.'
    },
    {
      title: 'Soporte y mantenimiento preventivo',
      text: 'Damos seguimiento para conservar el sistema en condiciones óptimas, detectando fallas antes de que afecten la operación. El mantenimiento preventivo ayuda a extender la vida útil de equipos, mantener la calidad de grabación y asegurar continuidad en el servicio.'
    }
  ],

  steps: [
    {
      n: '01',
      title: 'Diagnóstico del sitio',
      text: 'Revisamos objetivos, áreas críticas, iluminación, alturas, red y rutas de cableado para proponer cobertura real.'
    },
    {
      n: '02',
      title: 'Propuesta técnica + presupuesto',
      text: 'Te presentamos opciones por nivel de riesgo y presupuesto, sin sacrificar estabilidad ni evidencia.'
    },
    {
      n: '03',
      title: 'Instalación y configuración por ingeniería',
      text: 'Montaje, cableado, grabación, accesos, ajustes finos y pruebas. Todo con entrega ordenada.'
    },
    {
      n: '04',
      title: 'Capacitación + entrega con evidencia',
      text: 'Te dejamos operación clara: cómo buscar eventos, exportar evidencia y administrar accesos.'
    },
    {
      n: '05',
      title: 'Soporte y mantenimiento',
      text: 'Seguimiento post-instalación y mantenimiento preventivo para mantener disponibilidad y calidad de imagen.'
    }
  ],

  cta: {
    title: '¿Listo para videovigilancia profesional?',
    text: 'Te armamos propuesta por riesgo y presupuesto, con instalación limpia y evidencia confiable.'
  },

  brands: [
    { name: 'Hikvision', logo: hikvisionLogo },
    { name: 'Epcom', logo: epcomLogo },
    { name: 'SYSCOM', logo: syscomLogo },
    { name: 'Hilook', logo: hilookLogo },
    { name: 'EZVIZ', logo: ezvizLogo },
    { name: 'TP-Link', logo: tpLinkLogo },
    { name: 'Ubiquiti', logo: ubiquitiLogo },
    { name: 'ZKTeco', logo: zktecoLogo },
    { name: 'Ruptela', logo: ruptelaLogo },
    { name: 'AccessPro', logo: accessproLogo }
  ]
}