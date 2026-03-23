import alarmasHeroImg from '@/img/alarmas.png'

import hikvisionLogo from '@/img/brands/hikvision.svg'
import epcomLogo from '@/img/brands/epcom.png'
import syscomLogo from '@/img/brands/syscom.svg'
import tpLinkLogo from '@/img/brands/tplink.svg'
import ubiquitiLogo from '@/img/brands/ubiquiti.svg'

export const alarmasService = {
  hero: {
    badge: 'RSA · Sistemas de alarma',
    title: 'Alarmas para casa\ny negocios',
    description:
      'Diseñamos e instalamos sistemas de alarma para detección, aviso y respuesta ante intrusión o eventos de riesgo. Integramos panel, sensores, sirenas, conectividad y configuración según el tipo de inmueble, nivel de seguridad y operación requerida.',
    image: alarmasHeroImg,
    applications: ['Residencial', 'Comercial', 'Oficinas', 'Bodegas'],
    highlights: [
      { title: 'Sensores y zonas', text: 'Cobertura según riesgo y distribución' },
      { title: 'Sirenas y alertamiento', text: 'Respuesta sonora local inmediata' },
      { title: 'Wi-Fi / Ethernet', text: 'Comunicación estable según el sitio' },
      { title: 'Respaldo y continuidad', text: 'Operación aun ante cortes de energía' }
    ],
    bottomText:
      'Incluye: diagnóstico, instalación, configuración, pruebas y entrega operativa del sistema.'
  },

  details: {
    sectionText: 'Alcance operativo del servicio de alarmas y detección.',
    includes: [
      {
        title: 'Panel de alarma',
        text: 'Unidad central para administrar zonas, sensores, salidas, sirenas y eventos según la configuración del proyecto.'
      },
      {
        title: 'Sensores y detectores',
        text: 'Soluciones para intrusión, movimiento, apertura, áreas sensibles y otras condiciones según el nivel de protección requerido.'
      },
      {
        title: 'Sirenas y alertamiento',
        text: 'Aviso sonoro para disuasión y notificación local, con diferentes niveles de volumen y comportamiento según el sistema.'
      },
      {
        title: 'Conectividad + respaldo',
        text: 'Configuración de red, enlaces, baterías y pruebas de continuidad para mantener operación ante fallas o cortes eléctricos.'
      }
    ],
    resultTitle: 'Resultado esperado',
    resultText:
      'Un sistema de alarma confiable para detectar eventos, alertar oportunamente y mejorar la capacidad de respuesta del inmueble. Diseñado para proteger accesos, zonas críticas y dar mayor tranquilidad operativa.',
    resultCards: [
      {
        title: 'Enfoque',
        text: 'Detección + aviso + disuasión.'
      },
      {
        title: 'Entregables',
        text: 'Configuración, pruebas, zonas y guía operativa.'
      }
    ]
  },

  benefitsSection: {
    image: alarmasHeroImg,
    badge: 'RSA • Alarmas',
    imageTitles: [
      'Detección más oportuna.',
      'Cobertura según zonas reales.',
      'Alertamiento que sí se percibe.',
      'Sistema más confiable y estable.',
      'Instalación profesional desde el inicio.'
    ],
    imageTexts: [
      'Menos reacción tardía, más capacidad de respuesta.',
      'Sensores ubicados según accesos y puntos vulnerables.',
      'Sirenas y configuración alineadas al tipo de inmueble.',
      'Red, energía y respaldo pensados para continuidad.',
      'Montaje, pruebas y entrega con enfoque operativo.'
    ]
  },

  benefits: [
    {
      title: 'Protección por zonas según el riesgo real',
      text: 'Diseñamos la cobertura considerando accesos, perímetros, ventanas, pasillos y áreas sensibles del inmueble. Esto permite que el sistema responda de forma más útil, evitando depender de una sola detección y logrando una protección alineada al uso real del espacio.'
    },
    {
      title: 'Detección y disuasión en un mismo sistema',
      text: 'Una alarma no solo detecta eventos; también ayuda a disuadir mediante sirenas, avisos y reacción inmediata. La combinación correcta de panel, sensores y alertamiento mejora la respuesta local y reduce el margen de tiempo de una intrusión o incidente.'
    },
    {
      title: 'Flexibilidad para crecer o adaptar el proyecto',
      text: 'Dependiendo de la solución, el sistema puede trabajar con varias zonas, sensores, sirenas y accesorios compatibles. Esto permite iniciar con una protección bien definida y ampliar después conforme cambian las necesidades del sitio, sin improvisar desde cero.'
    },
    {
      title: 'Mayor continuidad ante fallas eléctricas',
      text: 'La incorporación de respaldo con batería y la correcta configuración de comunicación ayudan a mantener operatividad ante cortes de energía o interrupciones puntuales. Esto es importante porque una alarma solo sirve si sigue funcionando cuando más se necesita.'
    },
    {
      title: 'Configuración profesional y menos falsas molestias',
      text: 'Una instalación bien hecha no depende solo del equipo; también requiere correcta ubicación de sensores, sensibilidad apropiada, pruebas y ajustes. Esto ayuda a reducir activaciones no deseadas y mejora el rendimiento diario del sistema.'
    }
  ],

  steps: [
    {
      n: '01',
      title: 'Diagnóstico del inmueble',
      text: 'Revisamos accesos, zonas vulnerables, distribución, puntos de riesgo, energía, red y necesidades de protección del cliente.'
    },
    {
      n: '02',
      title: 'Propuesta técnica + presupuesto',
      text: 'Definimos panel, sensores, sirenas, conectividad y alcance de la solución según el tipo de inmueble y nivel de seguridad requerido.'
    },
    {
      n: '03',
      title: 'Instalación y configuración',
      text: 'Montamos panel, detectores, sirenas y accesorios, realizamos alimentación, pruebas de comunicación y configuración de zonas.'
    },
    {
      n: '04',
      title: 'Pruebas y ajuste operativo',
      text: 'Validamos detecciones, tiempos, alertamiento, respaldo, sensibilidad y comportamiento general para asegurar una operación confiable.'
    },
    {
      n: '05',
      title: 'Entrega y soporte',
      text: 'Te dejamos el sistema funcionando con guía básica de uso y seguimiento para ajustes, crecimiento o mantenimiento preventivo.'
    }
  ],

  cta: {
    title: '¿Listo para proteger mejor tu inmueble?',
    text: 'Te ayudamos a implementar un sistema de alarma confiable, bien configurado y adaptado a la operación real de tu casa o negocio.'
  },

  brands: [
    { name: 'Hikvision', logo: hikvisionLogo },
    { name: 'Epcom', logo: epcomLogo },
    { name: 'SYSCOM', logo: syscomLogo },
    { name: 'TP-Link', logo: tpLinkLogo },
    { name: 'Ubiquiti', logo: ubiquitiLogo },
    { name: 'AX PRO' },
    { name: 'AX HOME' },
    { name: 'PIR' },
    { name: 'Wi-Fi / Ethernet' },
    { name: 'Sirenas inalámbricas' }
  ]
}