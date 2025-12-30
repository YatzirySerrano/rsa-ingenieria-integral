<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { RSA_PUBLIC } from '@/config/rsaPublic'

function goTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const headerOffset = 84
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

const waLink = RSA_PUBLIC.waLink

/**
 * Cards derecha en HERO (ya las tenías)
 */
const stats = [
  { value: '24/7', label: 'Enfoque en continuidad' },
  { value: 'Mensual', label: 'Reportes a administración' },
  { value: 'Formal', label: 'Contrato y facturación' },
] as const

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

/**
 * ✅ SOLO CAMBIO: SERVICIOS (mismo diseño, nueva info RSA)
 * Revisa imágenes en /public/img/servicios/
 */
const serviciosTiles: ServicioTile[] = [
  {
    title: 'Cámaras de seguridad (CCTV)',
    subtitle: 'Videovigilancia profesional',
    desc: 'Instalación y mantenimiento con cobertura optimizada, grabación estable y evidencia confiable.',
    image: '/img/cctv.jpg',
    span: 'lg:col-span-2',
    theme: 'light',
    ctas: [
      { k: 'HD/4MP/8MP', v: 'calidad según proyecto' },
      { k: 'NVR/DVR', v: 'grabación y respaldo' },
    ],
  },
  {
    title: 'Alarmas para casa y negocios',
    subtitle: 'Detección y disuasión',
    desc: 'Sensores, paneles y sirenas con instalación limpia, pruebas y configuración profesional.',
    image: '/img/alarmas.png',
    span: 'lg:col-span-1',
    theme: 'dark',
  },
  {
    title: 'GPS y rastreo vehicular',
    subtitle: 'Control en tiempo real',
    desc: 'Monitoreo desde app, alertas y soporte para flotillas y vehículos particulares.',
    image: '/img/gps.jpg',
    span: 'lg:col-span-1',
    theme: 'light',
  },
  {
    title: 'Cercas eléctricas',
    subtitle: 'Perímetro reforzado',
    desc: 'Protección disuasiva con instalación segura, señalización y mantenimiento preventivo.',
    image: '/img/cerca-electrica.png',
    span: 'lg:col-span-2',
    theme: 'light',
  },
  {
    title: 'Control de acceso',
    subtitle: 'Trazabilidad y control',
    desc: 'Acceso por tarjeta/biometría con administración y reportes para empresa y fraccionamientos.',
    image: '/img/control-acceso.png',
    span: 'lg:col-span-2',
    theme: 'light',
    pill: 'OBTENER PRESUPUESTO',
  },
  {
    title: 'Dash cam profesional',
    subtitle: 'Evidencia en ruta',
    desc: 'Cámaras vehiculares con grabación continua, configuración y soporte profesional.',
    image: '/img/dashcam.png',
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

type Testimonio = { name: string; role: string; text: string }
const testimonios: Testimonio[] = [
  {
    name: 'Cliente residencial',
    role: 'Fraccionamiento',
    text: 'Instalación rápida, cableado limpio y soporte real. Se nota el enfoque preventivo.',
  },
  {
    name: 'Administración',
    role: 'Empresa',
    text: 'Reportes mensuales claros y seguimiento puntual. Operación estable y sin sorpresas.',
  },
  {
    name: 'Seguridad',
    role: 'Caseta',
    text: 'Control de accesos más ágil y trazabilidad completa. Excelente atención.',
  },
  {
    name: 'Logística',
    role: 'Flotilla',
    text: 'GPS con visibilidad en tiempo real y soporte inmediato cuando se requiere.',
  },
]

const reasons = [
  { title: 'Ejecución limpia', desc: 'Instalación profesional con estándares: orden, pruebas y entrega documentada.' },
  { title: 'Soporte preventivo', desc: 'Mantenimiento programado, atención correctiva y reportes mensuales.' },
  { title: 'Escalabilidad', desc: 'De una casa a un corporativo: accesos, CCTV y perímetro integrados.' },
  { title: 'Trazabilidad', desc: 'Control administrativo: evidencia, bitácoras y visibilidad operativa.' },
  { title: 'Enfoque empresarial', desc: 'Continuidad, SLA y comunicación clara para administración.' },
  { title: 'Cobertura integral', desc: 'CCTV, alarmas, cercas eléctricas, control de acceso y rastreo GPS.' },
] as const

const babyBlue = 'text-sky-300'

/**
 * Botón "Descubrir más" (ya lo tenías)
 */
const primaryWhiteBtn =
  'inline-flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-semibold text-slate-950 shadow-sm transition-all duration-300 hover:bg-blue-950 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60'

const sectionTitle = 'text-2xl font-semibold text-slate-950 dark:text-white'
const sectionSubtitle = 'mt-1 text-sm text-slate-600 dark:text-slate-300'

/**
 * Carrusel: scroll horizontal con snap + botones (sin libs).
 */
function scrollCarousel(dir: 'left' | 'right') {
  const el = document.getElementById('testimonios-track')
  if (!el) return
  const amount = Math.max(320, Math.floor(el.clientWidth * 0.85))
  el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' })
}
</script>

<template>
  <Head title="RSA Ingeniería Integral" />

  <PublicLayout>
    <!-- ✅ HERO (FIX: que sí se vea la imagen de fondo) -->
    <section
      class="relative overflow-hidden bg-cover bg-center bg-no-repeat"
      :style="{ backgroundImage: `url('${RSA_PUBLIC.heroSrc}')` }"
    >
      <!--
        Antes lo tenías muy oscuro (black/65 + gradient oscuro), por eso “desaparecía” la foto.
        Ajuste: overlay más ligero + gradient suave para legibilidad SIN matar la imagen.
      -->
      <div class="absolute inset-0 bg-black/35" aria-hidden="true" />
      <div class="absolute inset-0 bg-gradient-to-r from-black/45 via-black/15 to-black/45" aria-hidden="true" />

      <div class="relative mx-auto max-w-7xl px-4 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-24">
        <div class="grid items-center gap-10 lg:grid-cols-2">
          <!-- LEFT -->
          <div class="space-y-6">
            <div class="w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
              No somos una opción, somos tu solución
            </div>

            <h1 class="text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
              <span :class="babyBlue">RSA Ingeniería Integral</span>
              <span class="block text-white/90">
                Instalación y mantenimiento profesional de seguridad
              </span>
            </h1>

            <p class="max-w-xl text-base leading-relaxed text-white/90 sm:text-lg">
              CCTV, control de accesos, alarmas, cercas eléctricas y seguimiento GPS.
              Operación estable, reportes mensuales y soporte con enfoque preventivo.
            </p>

            <div class="flex">
              <button type="button" :class="primaryWhiteBtn" @click="goTo('servicios')">
                Descubrir más
              </button>
            </div>
          </div>

          <!-- RIGHT: stats en una fila -->
          <div class="relative">
            <div class="grid grid-cols-3 gap-3">
              <div
                v-for="s in stats"
                :key="s.label"
                class="rounded-2xl border border-white/25 bg-white/10 p-4 text-center backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:bg-white/15"
              >
                <div class="text-2xl font-semibold text-white">{{ s.value }}</div>
                <div class="mt-1 text-xs text-white/90">{{ s.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="relative mt-12 h-10 bg-gradient-to-b from-transparent to-white dark:to-neutral-950" aria-hidden="true" />
    </section>

    <!-- SERVICIOS (mismo diseño, nueva info) -->
    <section id="servicios" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="mb-7">
        <h2 :class="sectionTitle">Servicios</h2>
        <p :class="sectionSubtitle">Portafolio de seguridad y control, listo para escalar.</p>
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
              :class="tile.theme === 'dark' ? 'bg-black/60' : 'bg-white/70 dark:bg-neutral-950/60'"
              aria-hidden="true"
            />
          </div>

          <div class="relative p-7 sm:p-8">
            <div
              class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
              :class="tile.theme === 'dark' ? 'bg-white/15 text-white' : 'bg-blue-950 text-white'"
            >
              RSA <span class="opacity-90">•</span> <span class="opacity-95">{{ tile.subtitle }}</span>
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
                <div
                  class="text-2xl font-semibold"
                  :class="tile.theme === 'dark' ? 'text-white' : 'text-slate-950 dark:text-white'"
                >
                  {{ c.k }}
                </div>
                <div
                  class="mt-1 text-xs"
                  :class="tile.theme === 'dark' ? 'text-white/80' : 'text-slate-600 dark:text-slate-300'"
                >
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

    <!-- ¿POR QUÉ ELEGIRNOS? -->
    <section id="porque" class="bg-slate-50 py-14 dark:bg-neutral-900/40">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 :class="sectionTitle">¿Por qué elegirnos?</h2>
        <p :class="sectionSubtitle">
          No vendemos “instalaciones”; entregamos continuidad operativa y control.
        </p>

        <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="r in reasons"
            :key="r.title"
            class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div class="text-base font-semibold text-slate-950 dark:text-white">
              {{ r.title }}
            </div>
            <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {{ r.desc }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TESTIMONIOS (carrusel) -->
    <section id="testimonios" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="flex items-end justify-between gap-6">
        <div>
          <h2 :class="sectionTitle">Testimonios</h2>
          <p :class="sectionSubtitle">Recomendaciones reales: confianza que se demuestra.</p>
        </div>

        <div class="hidden items-center gap-2 sm:flex">
          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
            @click="scrollCarousel('left')"
            aria-label="Anterior"
            title="Anterior"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5 fill-slate-900 dark:fill-white" aria-hidden="true">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>

          <button
            type="button"
            class="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900"
            @click="scrollCarousel('right')"
            aria-label="Siguiente"
            title="Siguiente"
          >
            <svg viewBox="0 0 24 24" class="h-5 w-5 fill-slate-900 dark:fill-white" aria-hidden="true">
              <path d="m8.59 16.59 1.41 1.41 6-6-6-6-1.41 1.41L13.17 12z" />
            </svg>
          </button>
        </div>
      </div>

      <div
        id="testimonios-track"
        class="mt-6 flex gap-5 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style="scroll-snap-type: x mandatory;"
      >
        <article
          v-for="t in testimonios"
          :key="t.name + t.role"
          class="min-w-[280px] max-w-[380px] flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
          style="scroll-snap-align: start;"
        >
          <div class="text-sm font-semibold text-slate-950 dark:text-white">{{ t.name }}</div>
          <div class="text-xs text-slate-500 dark:text-slate-400">{{ t.role }}</div>

          <p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            “{{ t.text }}”
          </p>

          <div class="mt-5 flex items-center gap-1">
            <span v-for="i in 5" :key="i" class="text-yellow-500">★</span>
          </div>
        </article>
      </div>
    </section>

    <!-- PRODUCTOS -->
    <section id="productos" class="bg-slate-50 py-14 dark:bg-neutral-900/40">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="flex items-end justify-between gap-6">
          <div>
            <h2 :class="sectionTitle">Productos</h2>
            <p :class="sectionSubtitle">Cards listas para catálogo: imagen + descripción.</p>
          </div>

          <a
            href="/productos"
            class="inline-flex h-11 items-center justify-center rounded-xl bg-blue-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
          >
            Ver más productos
          </a>
        </div>

        <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="p in productos"
            :key="p.title"
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md dark:border-neutral-800 dark:bg-neutral-950"
          >
            <div class="h-44 w-full bg-slate-100 dark:bg-neutral-900">
              <img :src="p.image" alt="" class="h-full w-full object-cover" />
            </div>

            <div class="p-6">
              <div class="text-base font-semibold text-slate-950 dark:text-white">{{ p.title }}</div>
              <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ p.desc }}</div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- CONTACTO -->
    <section id="contacto" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
        <div class="grid gap-6 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 :class="sectionTitle">¿Listos para asegurar tu operación?</h2>
            <p :class="sectionSubtitle">
              Diagnóstico, propuesta y ejecución. Si ya tienes equipos, también damos mantenimiento.
            </p>

            <div class="mt-5">
              <a
                :href="waLink"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-11 items-center justify-center rounded-xl bg-blue-950 px-5 text-sm font-semibold text-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-900 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
              >
                Solicitar cotización
              </a>
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
