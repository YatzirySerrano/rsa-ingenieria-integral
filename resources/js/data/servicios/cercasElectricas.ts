import cercaHeroImg from '@/img/cerca-electrica.png'

import hikvisionLogo from '@/img/brands/hikvision.svg'
import epcomLogo from '@/img/brands/epcom.png'
import syscomLogo from '@/img/brands/syscom.svg'
import tpLinkLogo from '@/img/brands/tplink.svg'
import ubiquitiLogo from '@/img/brands/ubiquiti.svg'

export const cercasElectricasService = {
  hero: {
    badge: 'RSA · Cercas eléctricas',
    title: 'Instalación de\ncercas eléctricas',
    description:
      'Diseñamos e instalamos cercas eléctricas para reforzar la protección perimetral en casas, negocios, bodegas y propiedades privadas. Configuramos el sistema según el perímetro, la estructura existente y el nivel de seguridad requerido.',
    image: cercaHeroImg,
    applications: ['Residencial', 'Comercial', 'Privadas', 'Bodegas'],
    highlights: [
      { title: 'Protección perimetral', text: 'Disuasión desde el primer contacto' },
      { title: 'Energizador + línea', text: 'Sistema configurado según el sitio' },
      { title: 'Aviso y respuesta', text: 'Mayor reacción ante intentos de intrusión' },
      { title: 'Instalación profesional', text: 'Montaje seguro, limpio y confiable' }
    ],
    bottomText:
      'Incluye: diagnóstico del perímetro, instalación, configuración, pruebas y entrega operativa.'
  },

  details: {
    sectionText: 'Alcance operativo del servicio de cercas eléctricas.',
    includes: [
      {
        title: 'Energizador y línea de protección',
        text: 'Configuramos el sistema de impulsos y la línea de cerca eléctrica según altura, longitud y nivel de resguardo requerido.'
      },
      {
        title: 'Postería, aisladores y tensado',
        text: 'Montaje de los elementos físicos necesarios para una instalación firme, ordenada y duradera en el perímetro.'
      },
      {
        title: 'Alimentación y respaldo',
        text: 'Conexión eléctrica y revisión de continuidad para mantener el sistema operando de forma estable y segura.'
      },
      {
        title: 'Pruebas y ajuste del sistema',
        text: 'Validación de funcionamiento, nivel de respuesta y comportamiento general para entregar un sistema correctamente configurado.'
      }
    ],
    resultTitle: 'Resultado esperado',
    resultText:
      'Un perímetro más protegido, con capacidad de disuasión visible y una barrera adicional que ayuda a reducir intentos de intrusión. Diseñado para reforzar la seguridad exterior con una instalación profesional y funcional.',
    resultCards: [
      {
        title: 'Enfoque',
        text: 'Perímetro + disuasión + refuerzo.'
      },
      {
        title: 'Entregables',
        text: 'Instalación, pruebas y guía operativa.'
      }
    ]
  },

  benefitsSection: {
    image: cercaHeroImg,
    badge: 'RSA • Cercas eléctricas',
    imageTitles: [
      'Refuerzo perimetral real.',
      'Más disuasión desde el exterior.',
      'Protección adaptada al sitio.',
      'Instalación segura y estable.',
      'Mayor tranquilidad operativa.'
    ],
    imageTexts: [
      'Menos vulnerabilidad en bardas y accesos exteriores.',
      'Una barrera visible que ayuda a desalentar intrusiones.',
      'Configuración según longitud, estructura y entorno.',
      'Montaje firme, tensado correcto y puesta en marcha profesional.',
      'Una capa adicional de seguridad para casa o negocio.'
    ]
  },

  benefits: [
    {
      title: 'Disuasión visible desde el perímetro',
      text: 'La cerca eléctrica no solo protege; también funciona como un elemento de disuasión visible desde el exterior. Esto ayuda a reducir intentos de acceso no autorizado antes de que se conviertan en una intrusión directa.'
    },
    {
      title: 'Protección perimetral complementaria',
      text: 'Es una solución pensada para reforzar bardas, muros y límites de propiedad, agregando una capa adicional de seguridad al inmueble. Se integra muy bien como complemento de cámaras, alarmas u otras medidas de protección.'
    },
    {
      title: 'Diseño según el sitio y el perímetro',
      text: 'Cada instalación debe adaptarse a la forma del perímetro, altura del muro, puntos vulnerables y condiciones del entorno. Esto permite entregar una solución más funcional y evitar montajes improvisados o poco durables.'
    },
    {
      title: 'Montaje profesional y mejor continuidad',
      text: 'Una correcta instalación de postes, aisladores, tensado, alimentación y conexiones influye directamente en el desempeño del sistema. Un montaje profesional ayuda a mantener estabilidad, durabilidad y mejor funcionamiento diario.'
    },
    {
      title: 'Más seguridad para vivienda o negocio',
      text: 'La cerca eléctrica ayuda a elevar el nivel de protección general del inmueble, especialmente en zonas donde el perímetro representa un punto crítico. Es una medida preventiva útil para reforzar seguridad residencial y comercial.'
    }
  ],

  steps: [
    {
      n: '01',
      title: 'Diagnóstico del perímetro',
      text: 'Revisamos bardas, longitud, alturas, accesos, puntos vulnerables, energía disponible y condiciones del entorno para definir la mejor solución.'
    },
    {
      n: '02',
      title: 'Propuesta técnica + presupuesto',
      text: 'Definimos materiales, distribución, nivel de cobertura y alcance de la instalación según las características del inmueble.'
    },
    {
      n: '03',
      title: 'Instalación del sistema',
      text: 'Montamos postes, aisladores, línea de cerca, energizador y conexiones eléctricas, cuidando orden, firmeza y seguridad en la ejecución.'
    },
    {
      n: '04',
      title: 'Pruebas y ajuste operativo',
      text: 'Validamos continuidad, funcionamiento del sistema y comportamiento general para asegurar que la cerca quede operando correctamente.'
    },
    {
      n: '05',
      title: 'Entrega y soporte',
      text: 'Te dejamos la instalación funcionando con indicaciones básicas de uso y seguimiento para mantenimiento o ajustes posteriores.'
    }
  ],

  cta: {
    title: '¿Listo para reforzar tu perímetro?',
    text: 'Te ayudamos a implementar una cerca eléctrica profesional, bien instalada y adaptada a las condiciones reales de tu propiedad.'
  },

  brands: [
    { name: 'Hikvision', logo: hikvisionLogo },
    { name: 'Epcom', logo: epcomLogo },
    { name: 'SYSCOM', logo: syscomLogo },
    { name: 'TP-Link', logo: tpLinkLogo },
    { name: 'Ubiquiti', logo: ubiquitiLogo },
    { name: 'Energizadores' },
    { name: 'Aisladores' },
    { name: 'Postería' },
    { name: 'Perímetro' },
    { name: 'Protección exterior' }
  ]
}