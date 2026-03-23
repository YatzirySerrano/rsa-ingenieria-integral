import dashcamHeroImg from '@/img/dashcam.png'

import hikvisionLogo from '@/img/brands/hikvision.svg'
import epcomLogo from '@/img/brands/epcom.png'
import syscomLogo from '@/img/brands/syscom.svg'
import tpLinkLogo from '@/img/brands/tplink.svg'

export const dashcamService = {
  hero: {
    badge: 'RSA · Dash cam vehicular',
    title: 'Instalación de\nDash Cam vehicular',
    description:
      'Instalamos dash cams para vehículos particulares, flotillas y operación comercial, con opciones de cámara frontal o frontal + trasera. Configuramos almacenamiento, app, Wi-Fi y funciones como G-Sensor o ADAS según el modelo y el nivel de seguridad que se requiera.',
    image: dashcamHeroImg,
    applications: ['Particular', 'Flotillas', 'Comercial', 'Empresarial'],
    highlights: [
      { title: 'Frontal o frontal + trasera', text: 'Cobertura según el tipo de uso' },
      { title: 'Wi-Fi + App', text: 'Consulta local de grabaciones y eventos' },
      { title: 'G-Sensor', text: 'Protección de evidencia ante impacto' },
      { title: 'ADAS opcional', text: 'Asistencia y alertas para conducción' }
    ],
    bottomText:
      'Incluye: selección del modelo, instalación, configuración, pruebas y entrega operativa.'
  },

  details: {
    sectionText: 'Alcance operativo del servicio de dash cam vehicular.',
    includes: [
      {
        title: 'Dash cam frontal o dual',
        text: 'Opciones de una sola cámara frontal o configuración frontal + trasera según el vehículo y la cobertura que se necesite.'
      },
      {
        title: 'Grabación local y evidencia',
        text: 'Configuración de almacenamiento en microSD con grabación continua, sobrescritura y protección de eventos importantes.'
      },
      {
        title: 'Conectividad y app',
        text: 'Modelos compatibles con Wi-Fi y aplicación móvil para consulta local, revisión de clips y administración básica del equipo.'
      },
      {
        title: 'Funciones adicionales',
        text: 'Dependiendo del modelo, es posible contar con G-Sensor, detección de movimiento, pantalla, audio integrado y tecnología ADAS.'
      }
    ],
    resultTitle: 'Resultado esperado',
    resultText:
      'Un sistema de grabación vehicular confiable para documentar trayectos, incidentes y maniobras relevantes, con evidencia clara y una configuración adaptada al uso real del vehículo o la flota.',
    resultCards: [
      {
        title: 'Enfoque',
        text: 'Evidencia + seguridad + operación.'
      },
      {
        title: 'Entregables',
        text: 'Instalación, configuración y guía operativa.'
      }
    ]
  },

  benefitsSection: {
    image: dashcamHeroImg,
    badge: 'RSA • Dash Cam',
    imageTitles: [
      'Evidencia durante cada trayecto.',
      'Cobertura según el tipo de vehículo.',
      'Grabación protegida ante impacto.',
      'ADAS para una conducción más asistida.',
      'Instalación práctica y profesional.'
    ],
    imageTexts: [
      'Más respaldo visual para incidentes, maniobras o recorridos.',
      'Frontal o doble cámara según el nivel de supervisión requerido.',
      'Eventos importantes resguardados con G-Sensor.',
      'Alertas y apoyo visual según el modelo compatible.',
      'Configuración limpia, estable y lista para operar.'
    ]
  },

  benefits: [
    {
      title: 'Evidencia útil para incidentes y trayectos',
      text: 'La dash cam permite documentar recorridos, maniobras, incidentes viales y situaciones relevantes durante la conducción. Esto ofrece un respaldo visual útil para revisión, aclaraciones y seguimiento, tanto en uso particular como en operación comercial.'
    },
    {
      title: 'Opciones de cobertura según la necesidad',
      text: 'No todos los vehículos requieren la misma configuración. Por eso trabajamos opciones de cámara frontal o frontal + trasera, permitiendo adaptar la cobertura al tipo de uso, nivel de exposición, operación de flotilla o preferencia del cliente.'
    },
    {
      title: 'Mayor protección de grabaciones relevantes',
      text: 'Funciones como G-Sensor ayudan a identificar impactos o vibraciones y proteger la evidencia asociada a ese evento. Esto mejora la conservación de grabaciones importantes y reduce el riesgo de perder clips útiles dentro del ciclo normal de sobrescritura.'
    },
    {
      title: 'Tecnología ADAS como valor agregado',
      text: 'En modelos compatibles, ADAS aporta alertas y asistencia relacionadas con el entorno del vehículo. Estas funciones ayudan a mejorar seguridad activa y percepción del conductor durante el trayecto, agregando valor más allá de la simple grabación.'
    },
    {
      title: 'Solución práctica para operación diaria',
      text: 'Una dash cam bien instalada y configurada ofrece una solución accesible y funcional para tener visibilidad sobre el vehículo. La combinación de video, audio, almacenamiento local y consulta desde app facilita el uso diario sin complicar la operación.'
    }
  ],

  steps: [
    {
      n: '01',
      title: 'Diagnóstico del vehículo y necesidad',
      text: 'Revisamos el tipo de vehículo, uso previsto, ubicación de montaje, alimentación y si se requiere cámara frontal o frontal + trasera.'
    },
    {
      n: '02',
      title: 'Propuesta técnica + presupuesto',
      text: 'Definimos el modelo adecuado según resolución, almacenamiento, app, G-Sensor, pantalla, Wi-Fi o tecnología ADAS.'
    },
    {
      n: '03',
      title: 'Instalación y configuración',
      text: 'Montamos la cámara, organizamos el cableado, configuramos grabación, microSD, conectividad y ajustes básicos del equipo.'
    },
    {
      n: '04',
      title: 'Pruebas y validación',
      text: 'Comprobamos ángulos, calidad de imagen, audio, eventos, app y funcionamiento general para dejar el sistema correctamente operando.'
    },
    {
      n: '05',
      title: 'Entrega y soporte',
      text: 'Te dejamos la dash cam lista para uso diario, con guía básica de operación y seguimiento para dudas, ajustes o mantenimiento.'
    }
  ],

  cta: {
    title: '¿Listo para llevar evidencia a bordo?',
    text: 'Te ayudamos a elegir e instalar una dash cam adecuada para tu vehículo, con configuración clara y funcionamiento confiable.'
  },

  brands: [
    { name: 'Hikvision', logo: hikvisionLogo },
    { name: 'Epcom', logo: epcomLogo },
    { name: 'SYSCOM', logo: syscomLogo },
    { name: 'TP-Link', logo: tpLinkLogo },
    { name: '1080p / 1600p' },
    { name: 'Wi-Fi + App' },
    { name: 'G-Sensor' },
    { name: 'ADAS' },
    { name: 'MicroSD' },
    { name: 'Frontal + trasera' }
  ]
}