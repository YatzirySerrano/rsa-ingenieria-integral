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
    title: 'Cámaras de seguridad (CCTV)',
    subtitle: 'Videovigilancia profesional',
    description:
      'Control visual 24/7 con evidencia confiable. Diseñamos e instalamos sistemas estables con cobertura optimizada y grabación continua.',
    image: cctvHeroImg
  },

  features: [
    { title: 'HD / 4MP / 8MP', text: 'Calidad según el proyecto' },
    { title: 'NVR / DVR', text: 'Respaldo seguro de evidencia' },
    { title: 'Acceso remoto', text: 'Monitoreo desde app' },
    { title: 'Soporte técnico', text: 'Mantenimiento y seguimiento' }
  ],

  includes: [
    'Cámaras profesionales',
    'Grabación con NVR / DVR',
    'Acceso desde app',
    'Instalación profesional'
  ],

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

  brands: [
    { name: 'Hikvision', logo: hikvisionLogo },
    { name: 'Epcom', logo: epcomLogo, navyCard: true },
    { name: 'SYSCOM', logo: syscomLogo },
    { name: 'Hilook', logo: hilookLogo },
    { name: 'EZVIZ', logo: ezvizLogo },
    { name: 'TP-Link', logo: tpLinkLogo },
    { name: 'Ubiquiti', logo: ubiquitiLogo },
    { name: 'ZKTeco', logo: zktecoLogo },
    { name: 'Ruptela', logo: ruptelaLogo, navyCard: true },
    { name: 'AccessPro', logo: accessproLogo }
  ]
}