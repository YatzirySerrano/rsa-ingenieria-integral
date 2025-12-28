<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import PublicLayout from '@/layouts/PublicLayout.vue'

type ServicioCta = { k: string; v: string }
type ServicioTile = {
  title: string
  subtitle: string
  desc: string
  image: string
  span: string
  theme: 'light' | 'dark'
  ctas?: ServicioCta[]
  pill?: string
}

const waLink =
  'https://wa.me/527774972364?text=Hola%2C%20quiero%20solicitar%20una%20cotizaci%C3%B3n.'

function goTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const headerOffset = 84
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

const stats = [
  { value: '24/7', label: 'Enfoque en continuidad' },
  { value: 'Mensual', label: 'Reportes a administración' },
  { value: 'Formal', label: 'Contrato y facturación' },
] as const

/**
 * SERVICIOS: diseño tipo mosaico como tu imagen
 * Cambia las rutas de imágenes en /public/img/servicios/
 */
const serviciosTiles: ServicioTile[] = [
  {
    title: 'Terminales biométricas',
    subtitle: 'Facial y huella dactilar',
    desc: 'Identificación rápida y control de acceso en puntos críticos.',
    image: '/img/servicios/biometria.jpg',
    span: 'lg:col-span-2',
    theme: 'light',
    ctas: [
      { k: '0.2 seg.', v: 'velocidad de comparación' },
      { k: '2 seg.', v: 'velocidad de registro' },
    ],
  },
  {
    title: 'Lectores RFID, QR y móviles',
    subtitle: 'Acceso flexible',
    desc: 'Escala de una puerta a cientos con la misma línea de lectores.',
    image: '/img/servicios/rfid.jpg',
    span: 'lg:col-span-1',
    theme: 'dark',
  },
  {
    title: 'Controladores inteligentes',
    subtitle: 'Centralizado y cifrado',
    desc: 'Control escalable para múltiples puertas con operación estable.',
    image: '/img/servicios/controladores.jpg',
    span: 'lg:col-span-1',
    theme: 'light',
  },
  {
    title: 'Cerraduras inalámbricas',
    subtitle: 'Instalación rápida',
    desc: 'Control en puertas interiores con implementaciones sin cableado.',
    image: '/img/servicios/cerraduras.jpg',
    span: 'lg:col-span-2',
    theme: 'light',
  },
  {
    title: 'Red de instaladores',
    subtitle: 'Implementación a medida',
    desc: 'Instalaciones rápidas con enfoque en continuidad y calidad.',
    image: '/img/servicios/instaladores.jpg',
    span: 'lg:col-span-2',
    theme: 'light',
    pill: 'OBTENER PRESUPUESTO',
  },
  {
    title: 'Soporte premium',
    subtitle: 'Atención prioritaria',
    desc: 'Mantenimiento preventivo/correctivo y respuesta con SLA operativo.',
    image: '/img/servicios/soporte.jpg',
    span: 'lg:col-span-1',
    theme: 'light',
  },
]

type ProductoCard = { title: string; desc: string; image: string }

const productos: ProductoCard[] = [
  {
    title: 'CCTV / Videovigilancia',
    desc: 'Cámaras, DVR/NVR, almacenamiento y accesorios. Instalación opcional.',
    image: '/img/productos/cctv.jpg',
  },
  {
    title: 'Control de acceso',
    desc: 'Lectores, tags, aperturas, casetas y control administrativo.',
    image: '/img/productos/acceso.jpg',
  },
  {
    title: 'GPS / Seguimiento',
    desc: 'Dispositivos y soporte para rastreo desde aplicación.',
    image: '/img/productos/gps.jpg',
  },
]

const navyBtn =
  'inline-flex h-11 items-center justify-center rounded-xl bg-blue-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300'

const secondaryBtn =
  'inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900'
</script>

<template>
  <Head title="RSA Ingeniería Integral" />

  <PublicLayout :wa-link="waLink" logo-src="/images/logoRSA.jpg">
    <!-- HERO con imagen de fondo -->
    <section class="relative overflow-hidden">
      <div class="absolute inset-0 -z-20">
        <img src="/img/hero-rsa.jpg" alt="" class="h-full w-full object-cover" />
      </div>

      <div
        class="absolute inset-0 -z-10 bg-gradient-to-b from-white/85 via-white/70 to-white dark:from-neutral-950/85 dark:via-neutral-950/70 dark:to-neutral-950"
        aria-hidden="true"
      />

      <div class="mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div class="grid items-center gap-10 lg:grid-cols-2">
          <div class="space-y-6">
            <div class="w-fit rounded-full bg-white/70 px-4 py-2 text-xs font-semibold text-slate-900 backdrop-blur dark:bg-neutral-950/60 dark:text-white">
              Seguridad para fraccionamientos y empresas
            </div>

            <h1 class="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl dark:text-white">
              RSA Ingeniería Integral
              <span class="block text-slate-700 dark:text-slate-200">
                Instalación y mantenimiento profesional de seguridad
              </span>
            </h1>

            <p class="max-w-xl text-base leading-relaxed text-slate-700 sm:text-lg dark:text-slate-200">
              CCTV, control de accesos, alarmas, cercas eléctricas y seguimiento GPS.
              Operación estable, reportes mensuales y soporte con enfoque preventivo.
            </p>

            <div class="flex flex-col gap-3 sm:flex-row">
              <a :href="waLink" target="_blank" rel="noopener noreferrer" :class="navyBtn">
                Solicitar cotización
              </a>

              <button type="button" :class="secondaryBtn" @click="goTo('servicios')">
                Ver servicios
              </button>
            </div>

            <div class="grid grid-cols-3 gap-3 pt-2 sm:gap-4">
              <div
                v-for="s in stats"
                :key="s.label"
                class="rounded-2xl border border-white/40 bg-white/60 p-3 text-center backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/50"
              >
                <div class="text-lg font-semibold text-slate-950 dark:text-white">
                  {{ s.value }}
                </div>
                <div class="text-xs text-slate-700 dark:text-slate-200">
                  {{ s.label }}
                </div>
              </div>
            </div>
          </div>

          <div class="relative">
            <div class="relative overflow-hidden rounded-3xl border border-white/40 bg-white/60 p-6 shadow-sm backdrop-blur dark:border-neutral-800/70 dark:bg-neutral-950/50">
              <div class="flex items-center justify-between">
                <div class="space-y-1">
                  <div class="text-sm font-medium text-slate-950 dark:text-white">
                    Panel de monitoreo
                  </div>
                  <div class="text-xs text-slate-700 dark:text-slate-200">
                    Visibilidad y control en tiempo real
                  </div>
                </div>
                <div class="rounded-full bg-blue-950 px-3 py-1 text-xs font-semibold text-white">
                  RSA
                </div>
              </div>

              <div class="my-5 h-px bg-white/60 dark:bg-neutral-800"></div>

              <div class="grid grid-cols-2 gap-4">
                <div class="rounded-2xl border border-white/50 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                  <div class="text-sm font-semibold text-slate-950 dark:text-white">CCTV</div>
                  <div class="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Cobertura optimizada y evidencia confiable.
                  </div>
                </div>

                <div class="rounded-2xl border border-white/50 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                  <div class="text-sm font-semibold text-slate-950 dark:text-white">Accesos</div>
                  <div class="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Control y trazabilidad en casetas.
                  </div>
                </div>

                <div class="rounded-2xl border border-white/50 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                  <div class="text-sm font-semibold text-slate-950 dark:text-white">GPS</div>
                  <div class="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Seguimiento desde app en tiempo real.
                  </div>
                </div>

                <div class="rounded-2xl border border-white/50 bg-white p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
                  <div class="text-sm font-semibold text-slate-950 dark:text-white">Soporte</div>
                  <div class="mt-1 text-xs text-slate-600 dark:text-slate-300">
                    Preventivo, correctivo y reportes mensuales.
                  </div>
                </div>
              </div>

              <div class="mt-6 rounded-2xl bg-blue-950 p-4 text-white">
                <div class="text-sm font-semibold">Operación sin sorpresas</div>
                <div class="mt-1 text-xs opacity-90">
                  Mantenimiento programado + reportes claros para administración.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SERVICIOS (mosaico tipo tu imagen) -->
    <section id="servicios" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="mb-7">
        <h2 class="text-2xl font-semibold text-slate-950 dark:text-white">Servicios</h2>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Portafolio de seguridad y control, listo para escalar.
        </p>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <article
          v-for="tile in serviciosTiles"
          :key="tile.title"
          class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
          :class="tile.span"
        >
          <div class="absolute inset-0">
            <img :src="tile.image" alt="" class="h-full w-full object-cover" />
            <div
              class="absolute inset-0"
              :class="tile.theme === 'dark' ? 'bg-black/55' : 'bg-white/70 dark:bg-neutral-950/60'"
              aria-hidden="true"
            />
          </div>

          <div class="relative p-7 sm:p-8">
            <div
              class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              :class="tile.theme === 'dark' ? 'bg-white/15 text-white' : 'bg-blue-950 text-white'"
            >
              RSA
              <span class="opacity-90">•</span>
              <span class="opacity-95">{{ tile.subtitle }}</span>
            </div>

            <h3
              class="mt-4 text-2xl font-semibold leading-tight"
              :class="tile.theme === 'dark' ? 'text-white' : 'text-slate-950 dark:text-white'"
            >
              {{ tile.title }}
            </h3>

            <p
              class="mt-2 max-w-xl text-sm leading-relaxed"
              :class="tile.theme === 'dark' ? 'text-white/85' : 'text-slate-600 dark:text-slate-300'"
            >
              {{ tile.desc }}
            </p>

            <div v-if="tile.ctas?.length" class="mt-6 grid grid-cols-2 gap-6">
              <div v-for="c in tile.ctas" :key="c.k">
                <div class="text-2xl font-semibold" :class="tile.theme === 'dark' ? 'text-white' : 'text-slate-950 dark:text-white'">
                  {{ c.k }}
                </div>
                <div class="mt-1 text-xs" :class="tile.theme === 'dark' ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'">
                  {{ c.v }}
                </div>
              </div>
            </div>

            <a
              v-if="tile.pill"
              :href="waLink"
              target="_blank"
              rel="noopener noreferrer"
              class="mt-7 inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-950 to-blue-700 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:opacity-95"
            >
              {{ tile.pill }}
            </a>
          </div>
        </article>
      </div>
    </section>

    <!-- SOLUCIONES -->
    <section id="soluciones" class="bg-slate-50 py-14 dark:bg-neutral-900/40">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="text-2xl font-semibold text-slate-950 dark:text-white">Soluciones clave</h2>
        <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Integración de seguridad con enfoque operativo.
        </p>

        <div class="mt-8 grid gap-5 md:grid-cols-3">
          <div class="rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
            <div class="text-base font-semibold text-slate-950 dark:text-white">Seguimiento GPS</div>
            <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Rastreo desde app, visibilidad y control.
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
            <div class="text-base font-semibold text-slate-950 dark:text-white">Seguridad integrada</div>
            <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              CCTV + accesos + perímetro bajo un mismo estándar.
            </div>
          </div>

          <div class="rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
            <div class="text-base font-semibold text-slate-950 dark:text-white">Venta de equipos</div>
            <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Equipos listos para proyecto con soporte.
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- PROCESO -->
    <section id="proceso" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <h2 class="text-2xl font-semibold text-slate-950 dark:text-white">Proceso de trabajo</h2>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Diagnóstico → propuesta → ejecución → soporte.
      </p>

      <div class="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        <div class="rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">01</div>
          <div class="mt-1 text-base font-semibold text-slate-950 dark:text-white">Diagnóstico</div>
          <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">Levantamiento técnico del sitio.</div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">02</div>
          <div class="mt-1 text-base font-semibold text-slate-950 dark:text-white">Propuesta</div>
          <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">Alcance claro y tiempos definidos.</div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">03</div>
          <div class="mt-1 text-base font-semibold text-slate-950 dark:text-white">Ejecución</div>
          <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">Instalación, pruebas y entrega.</div>
        </div>

        <div class="rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950">
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">04</div>
          <div class="mt-1 text-base font-semibold text-slate-950 dark:text-white">Soporte</div>
          <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">Mantenimiento y reportes.</div>
        </div>
      </div>
    </section>

    <!-- PRODUCTOS con imagen arriba -->
    <section id="productos" class="bg-slate-50 py-14 dark:bg-neutral-900/40">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between gap-6">
          <div>
            <h2 class="text-2xl font-semibold text-slate-950 dark:text-white">Productos</h2>
            <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
              Cards listas para catálogo: imagen + descripción.
            </p>
          </div>

          <a :href="waLink" target="_blank" rel="noopener noreferrer" :class="navyBtn" class="hidden sm:inline-flex">
            Solicitar cotización
          </a>
        </div>

        <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="p in productos"
            :key="p.title"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div class="h-44 w-full bg-slate-100 dark:bg-neutral-900">
              <img :src="p.image" alt="" class="h-full w-full object-cover" />
            </div>

            <div class="p-6">
              <div class="text-base font-semibold text-slate-950 dark:text-white">
                {{ p.title }}
              </div>
              <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">
                {{ p.desc }}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- CONTACTO -->
    <section id="contacto" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-slate-200 bg-white p-8 dark:border-neutral-800 dark:bg-neutral-950">
        <div class="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 class="text-2xl font-semibold text-slate-950 dark:text-white">
              ¿Listos para asegurar tu operación?
            </h2>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Diagnóstico, propuesta y ejecución. Si ya tienes equipos, también damos mantenimiento.
            </p>

            <div class="mt-5 flex flex-col gap-3 sm:flex-row">
              <a :href="waLink" target="_blank" rel="noopener noreferrer" :class="navyBtn">
                Solicitar cotización por WhatsApp
              </a>
              <button type="button" :class="secondaryBtn" @click="goTo('servicios')">
                Ver servicios
              </button>
            </div>
          </div>

          <div class="rounded-2xl bg-slate-50 p-6 dark:bg-neutral-900/40">
            <div class="text-sm font-semibold text-slate-950 dark:text-white">RSA Ingeniería Integral</div>
            <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Blvd. Paseo Cuauhnáhuac Km 5.5 Tejalpa 62570 Jiutepec, México.
            </div>
            <div class="mt-4 text-sm text-slate-600 dark:text-slate-300">
              Correo:
              <a class="underline underline-offset-4" href="mailto:rsaingenieriaintegral@gmail.com">
                rsaingenieriaintegral@gmail.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>
