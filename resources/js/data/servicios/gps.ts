import gpsHeroImg from '@/img/gps.jpg'
import epcomLogo from '@/img/brands/epcom.png'
import ruptelaLogo from '@/img/brands/ruptela.png'

export const gpsService = {
  hero: {
    badge: 'RSA · Rastreo vehicular',
    title: 'Instalación de GPS\ny rastreo vehicular',
    description:
      'Monitoreo en tiempo real con EpcomGPS, historial por rangos, geocercas con alertas y control remoto para una respuesta operativa más rápida y confiable.',
    image: gpsHeroImg,
    applications: ['Personal', 'Flotas', 'Empresas', 'Logística'],
    highlights: [
      { title: 'Tiempo real', text: 'Monitoreo desde EpcomGPS' },
      { title: 'Historial', text: 'Consulta por rangos de fecha y hora' },
      { title: 'Geocercas + alertas', text: 'Entrada y salida de zonas' },
      { title: 'Control remoto', text: 'Paro y encendido según configuración' }
    ],
    bottomText:
      'Incluye: instalación oculta, configuración en app y validación completa de operación.'
  },

  details: {
    sectionText: 'Alcance operativo del servicio de GPS y rastreo.',
    includes: [
      {
        title: 'Instalación oculta',
        text: 'Montaje discreto para reducir manipulación y mantener continuidad operativa.'
      },
      {
        title: 'App EpcomGPS',
        text: 'Monitoreo en vivo, historial por rangos y notificaciones desde distintos dispositivos.'
      },
      {
        title: 'Multiusuario / cuentas espejo',
        text: 'Operación compartida con acceso desde varios equipos según necesidades del cliente.'
      },
      {
        title: 'Geocercas y control remoto',
        text: 'Alertas por entrada y salida, además de funciones remotas según configuración del proyecto.'
      }
    ],
    resultTitle: 'Resultado esperado',
    resultText:
      'Un sistema de rastreo vehicular estable, discreto y útil para control, trazabilidad y respuesta operativa. Diseñado para supervisar, reaccionar y mantener visibilidad real sobre cada unidad.',
    resultCards: [
      {
        title: 'Enfoque',
        text: 'Control + trazabilidad + reacción.'
      },
      {
        title: 'Entregables',
        text: 'Instalación, pruebas, configuración y guía operativa.'
      }
    ]
  },

  benefitsSection: {
    image: gpsHeroImg,
    badge: 'RSA • GPS',
    imageTitles: [
      'Control en tiempo real.',
      'Historial que sí ayuda a decidir.',
      'Alertas por zona y movimiento.',
      'Respuesta remota con más control.',
      'Instalación discreta y confiable.'
    ],
    imageTexts: [
      'Menos incertidumbre, más visibilidad operativa.',
      'Trazabilidad clara para supervisión y validación.',
      'Geocercas y eventos pensados para operación real.',
      'Funciones remotas según configuración del proyecto.',
      'Montaje oculto para continuidad y menor manipulación.'
    ]
  },

  benefits: [
    {
      title: 'Monitoreo en tiempo real',
      text: 'Dejamos el sistema configurado para visualizar la ubicación del vehículo en vivo desde EpcomGPS, con acceso desde distintos dispositivos según la operación. Esto permite seguimiento inmediato, mejor coordinación y mayor control tanto para usuarios individuales como para flotas.'
    },
    {
      title: 'Historial detallado de recorridos',
      text: 'El sistema permite consultar rutas y movimientos por rangos de fecha, hora y puntos específicos, facilitando auditoría, validación de recorridos y revisión de eventos. No se trata solo de saber dónde está la unidad, sino de tener trazabilidad clara para tomar decisiones.'
    },
    {
      title: 'Geocercas con alertas útiles',
      text: 'Configuramos zonas personalizadas para recibir alertas cuando un vehículo entra o sale de un perímetro determinado. Esto ayuda a mejorar control operativo, seguimiento de rutas autorizadas y supervisión de movimientos fuera de horario o fuera de zona.'
    },
    {
      title: 'Control remoto según configuración',
      text: 'Según el proyecto y la configuración aplicada, es posible habilitar funciones como paro o encendido remoto de motor desde la plataforma. Esto aporta una capa adicional de respuesta operativa y seguridad, siempre con un enfoque responsable y técnicamente validado.'
    },
    {
      title: 'Instalación discreta y segura',
      text: 'La instalación se realiza de forma oculta para reducir riesgo de manipulación, con cableado protegido, fijación adecuada y pruebas funcionales completas. La intención no es solo colocar un GPS, sino entregar una solución estable, difícil de identificar y preparada para operar correctamente.'
    }
  ],

  steps: [
    {
      n: '01',
      title: 'Diagnóstico del vehículo',
      text: 'Validamos tipo de unidad, alimentación, zonas de instalación y necesidades operativas para definir el alcance correcto del servicio.'
    },
    {
      n: '02',
      title: 'Propuesta técnica + presupuesto',
      text: 'Definimos equipo, configuración y alcances como monitoreo en tiempo real, historial, geocercas y opciones de control remoto según el proyecto.'
    },
    {
      n: '03',
      title: 'Instalación oculta y pruebas',
      text: 'Realizamos montaje discreto, cableado protegido, validación de señal GPS y red móvil, además de pruebas funcionales para asegurar estabilidad.'
    },
    {
      n: '04',
      title: 'Configuración de EpcomGPS',
      text: 'Dejamos lista la cuenta, accesos, visualización desde app, historial, notificaciones y geocercas para que el sistema quede listo para operar.'
    },
    {
      n: '05',
      title: 'Soporte y mantenimiento',
      text: 'Brindamos seguimiento post-instalación para ajustes, validaciones, cambios de unidad y continuidad operativa del servicio.'
    }
  ],

  cta: {
    title: '¿Listo para tener control total de tu vehículo?',
    text: 'Te instalamos GPS oculto y dejamos EpcomGPS listo con historial, geocercas y control remoto.'
  },

  brands: [
    { name: 'RUPTELA', logo: ruptelaLogo },
    { name: 'EPCOM GPS', logo: epcomLogo },
    { name: 'LTE / LTE-M' },
    { name: 'GNSS U-blox' },
    { name: 'TLS 1.2' },
    { name: 'MiKado IP54' },
    { name: 'BLE 5.0' },
    { name: '2G Backup' }
  ]
}