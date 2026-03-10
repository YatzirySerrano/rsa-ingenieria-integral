import cctvHeroImg from '@/img/cctv.jpg'

import accessproLogo from '@/img/brands/accesspro.png'
import epcomLogo from '@/img/brands/epcom.png'
import ezvizLogo from '@/img/brands/ezviz.svg'
import hikvisionLogo from '@/img/brands/hikvision.svg'
import hilookLogo from '@/img/brands/hilook.png'
import ruptelaLogo from '@/img/brands/ruptela.svg'
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
      title: 'Cobertura optimizada',
      text: 'Diseñamos distribución de cámaras según el riesgo.'
    },
    {
      title: 'Evidencia confiable',
      text: 'Grabación continua y respaldo seguro.'
    },
    {
      title: 'Acceso remoto',
      text: 'Visualiza desde tu teléfono.'
    },
    {
      title: 'Instalación profesional',
      text: 'Canalización limpia y pruebas completas.'
    }
  ],

  steps: [
    {
      n: '01',
      title: 'Diagnóstico',
      text: 'Revisión del sitio y definición de cobertura.'
    },
    {
      n: '02',
      title: 'Propuesta',
      text: 'Diseño técnico y presupuesto.'
    },
    {
      n: '03',
      title: 'Instalación',
      text: 'Montaje, cableado y configuración.'
    },
    {
      n: '04',
      title: 'Entrega',
      text: 'Capacitación y pruebas.'
    },
    {
      n: '05',
      title: 'Soporte',
      text: 'Seguimiento y mantenimiento.'
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