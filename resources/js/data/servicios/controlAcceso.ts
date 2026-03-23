import controlAccesoHeroImg from '@/img/control-acceso.png'

import hikvisionLogo from '@/img/brands/hikvision.svg'
import epcomLogo from '@/img/brands/epcom.png'
import syscomLogo from '@/img/brands/syscom.svg'
import zktecoLogo from '@/img/brands/zkTeco.svg'
import tpLinkLogo from '@/img/brands/tplink.svg'
import ubiquitiLogo from '@/img/brands/ubiquiti.svg'

export const controlAccesoService = {
  hero: {
    badge: 'RSA · Control de acceso',
    title: 'Control de acceso\npara entradas seguras',
    description:
      'Diseñamos e instalamos soluciones de control de acceso para casas, oficinas, privadas, edificios y negocios. Integramos validación por huella, tarjeta, PIN, QR, app o videoportero según el nivel de seguridad, flujo de usuarios y operación requerida.',
    image: controlAccesoHeroImg,
    applications: ['Residencial', 'Corporativo', 'Condominios', 'Comercial'],
    highlights: [
      { title: 'Huella / tarjeta / PIN', text: 'Acceso según perfil de usuario' },
      { title: 'QR / App / videoportero', text: 'Opciones modernas de validación' },
      { title: 'Registro y trazabilidad', text: 'Control de entradas y salidas' },
      { title: 'Integración profesional', text: 'Acceso, red y monitoreo en un mismo proyecto' }
    ],
    bottomText:
      'Incluye: diagnóstico, instalación, configuración, pruebas y entrega operativa del sistema.'
  },

  details: {
    sectionText: 'Alcance operativo del servicio de control de acceso.',
    includes: [
      {
        title: 'Terminales y lectores',
        text: 'Equipos para validar acceso por huella, tarjeta MIFARE, PIN, QR, app o combinaciones según el proyecto.'
      },
      {
        title: 'Videoportero y cámara integrada',
        text: 'Opciones con videollamada, visualización en vivo y atención remota desde app para mayor control.'
      },
      {
        title: 'Gestión de usuarios y permisos',
        text: 'Alta, baja, horarios, áreas, perfiles y sincronización de accesos según operación y estructura del cliente.'
      },
      {
        title: 'Instalación + configuración',
        text: 'Montaje, energía, red, pruebas, ajustes y puesta en marcha con enfoque profesional y ordenado.'
      }
    ],
    resultTitle: 'Resultado esperado',
    resultText:
      'Un sistema de acceso más ordenado, seguro y fácil de administrar, con validación confiable, control de usuarios y mejor trazabilidad sobre quién entra, cuándo entra y bajo qué permisos.',
    resultCards: [
      {
        title: 'Enfoque',
        text: 'Seguridad + control + trazabilidad.'
      },
      {
        title: 'Entregables',
        text: 'Configuración, pruebas, accesos y guía operativa.'
      }
    ]
  },

  benefitsSection: {
    image: controlAccesoHeroImg,
    badge: 'RSA • Control de acceso',
    imageTitles: [
      'Accesos más seguros.',
      'Más control sobre usuarios.',
      'Validación moderna y flexible.',
      'Trazabilidad útil para operar.',
      'Instalación profesional y confiable.'
    ],
    imageTexts: [
      'Menos improvisación, más seguridad en cada entrada.',
      'Permisos definidos según áreas, horarios y perfiles.',
      'Huella, tarjeta, PIN, QR, app o videoportero según necesidad.',
      'Consulta de eventos y movimientos para mejor supervisión.',
      'Montaje, red y puesta en marcha con enfoque operativo.'
    ]
  },

  benefits: [
    {
      title: 'Control real de quién entra y sale',
      text: 'El sistema permite administrar accesos con reglas claras por usuario, área, puerta u horario. Esto ayuda a reducir entradas no autorizadas, mejorar el orden interno y tener una validación más profesional que una llave tradicional o un control sin registro.'
    },
    {
      title: 'Múltiples métodos de autenticación',
      text: 'Dependiendo del proyecto, se puede configurar acceso por huella, tarjeta MIFARE, PIN, código QR, app o funciones de videoportero. Esto hace posible adaptar la solución al flujo real del sitio, ya sea un negocio, edificio, oficina, privada o acceso residencial.'
    },
    {
      title: 'Trazabilidad y registro de eventos',
      text: 'Una ventaja importante es la consulta de eventos y movimientos. Saber quién accedió, en qué momento y por qué puerta permite tener mejor supervisión, resolver incidentes con mayor claridad y mantener una administración más controlada del sitio.'
    },
    {
      title: 'Administración centralizada de usuarios',
      text: 'La gestión de altas, bajas, permisos y cambios de acceso puede organizarse de forma más eficiente, incluso por áreas o perfiles. Esto facilita operación diaria, rotación de personal, cambios de usuarios y actualización del sistema sin depender de soluciones improvisadas.'
    },
    {
      title: 'Equipos resistentes e integración profesional',
      text: 'Trabajamos soluciones para exterior e interior, incluyendo opciones antivandálicas y con protección ambiental según el sitio. Además, el control de acceso puede integrarse con red, videovigilancia o videoportero para entregar una solución más completa y estable.'
    }
  ],

  steps: [
    {
      n: '01',
      title: 'Diagnóstico del acceso',
      text: 'Revisamos tipo de puerta o entrada, flujo de personas, horarios, nivel de seguridad, red, energía y necesidades operativas.'
    },
    {
      n: '02',
      title: 'Propuesta técnica + presupuesto',
      text: 'Definimos la solución adecuada según el sitio: huella, tarjeta, PIN, QR, app, videoportero o combinación de métodos.'
    },
    {
      n: '03',
      title: 'Instalación y configuración',
      text: 'Montamos equipos, lectores, cerraduras o relevadores, realizamos conexión eléctrica y de red, y dejamos el sistema ajustado.'
    },
    {
      n: '04',
      title: 'Alta de usuarios y pruebas',
      text: 'Configuramos usuarios, permisos, horarios, accesos remotos y validamos funcionamiento real de apertura, eventos y registros.'
    },
    {
      n: '05',
      title: 'Entrega y soporte',
      text: 'Te dejamos el sistema operando con guía básica de administración y seguimiento para ajustes, crecimiento o mantenimiento.'
    }
  ],

  cta: {
    title: '¿Listo para modernizar tus accesos?',
    text: 'Te ayudamos a implementar un sistema de control de acceso confiable, profesional y adaptado al flujo real de tu operación.'
  },

  brands: [
    { name: 'Hikvision', logo: hikvisionLogo },
    { name: 'Epcom', logo: epcomLogo },
    { name: 'SYSCOM', logo: syscomLogo },
    { name: 'ZKTeco', logo: zktecoLogo },
    { name: 'TP-Link', logo: tpLinkLogo },
    { name: 'Ubiquiti', logo: ubiquitiLogo },
    { name: 'Huella' },
    { name: 'Tarjeta MIFARE' },
    { name: 'PIN' },
    { name: 'QR / App' }
  ]
}