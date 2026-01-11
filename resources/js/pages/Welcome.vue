<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import Autoplay from 'embla-carousel-autoplay'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { RSA_PUBLIC } from '@/config/rsaPublic'

// shadcn-vue
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel'

function goTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const headerOffset = 84
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

const waLink = RSA_PUBLIC.waLink

/**
 * HERO - typing en labels de stats
 */
const stats = [
  { value: '24/7', label: 'Enfoque en continuidad' },
  { value: 'Mensual', label: 'Reportes a administración' },
  { value: 'Formal', label: 'Contrato y facturación' },
] as const

const typedLabels = ref<string[]>(stats.map(() => ''))
const typingDone = ref(false)

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false
}

async function runTyping() {
  if (prefersReducedMotion()) {
    typedLabels.value = stats.map((s) => s.label)
    typingDone.value = true
    return
  }

  typedLabels.value = stats.map(() => '')
  typingDone.value = false

  const baseDelay = 140
  const charDelay = 18

  for (let i = 0; i < stats.length; i++) {
    await new Promise((r) => setTimeout(r, baseDelay))
    const text = stats[i].label
    let acc = ''
    for (const ch of text) {
      acc += ch
      typedLabels.value[i] = acc
      await new Promise((r) => setTimeout(r, charDelay))
    }
  }

  typingDone.value = true
}

/**
 * Servicios (agrego href como en navbar)
 */
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
  href: string
}

const serviciosTiles: ServicioTile[] = [
  {
    title: 'Cámaras de seguridad (CCTV)',
    subtitle: 'Videovigilancia profesional',
    desc: 'Instalación y mantenimiento con cobertura optimizada, grabación estable y evidencia confiable.',
    image: '/img/cctv.jpg',
    span: 'lg:col-span-2',
    theme: 'light',
    href: '/Servicios/cctv',
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
    href: '/servicios/alarmas',
  },
  {
    title: 'GPS y rastreo vehicular',
    subtitle: 'Control en tiempo real',
    desc: 'Monitoreo desde app, alertas y soporte para flotillas y vehículos particulares.',
    image: '/img/gps.jpg',
    span: 'lg:col-span-1',
    theme: 'light',
    href: '/servicios/gps',
  },
  {
    title: 'Cercas eléctricas',
    subtitle: 'Perímetro reforzado',
    desc: 'Protección disuasiva con instalación segura, señalización y mantenimiento preventivo.',
    image: '/img/cerca-electrica.png',
    span: 'lg:col-span-2',
    theme: 'light',
    href: '/servicios/cercas-electricas',
  },
  {
    title: 'Control de acceso',
    subtitle: 'Trazabilidad y control',
    desc: 'Acceso por tarjeta/biometría con administración y reportes para empresa y fraccionamientos.',
    image: '/img/control-acceso.png',
    span: 'lg:col-span-2',
    theme: 'light',
    href: '/servicios/control-de-acceso',
    pill: 'OBTENER PRESUPUESTO',
  },
  {
    title: 'Dash cam profesional',
    subtitle: 'Evidencia en ruta',
    desc: 'Cámaras vehiculares con grabación continua, configuración y soporte profesional.',
    image: '/img/dashcam.png',
    span: 'lg:col-span-1',
    theme: 'light',
    href: '/servicios/dashcam',
  },
]

/**
 * Productos (Más vendidos)
 */
type ProductoCard = { title: string; desc: string; image: string }
const productos: ProductoCard[] = [
  { title: 'CCTV / Videovigilancia', desc: 'Cámaras, DVR/NVR, almacenamiento y accesorios. Instalación opcional.', image: '/img/cctv.jpg' },
  { title: 'Control de acceso', desc: 'Lectores, tags, aperturas, casetas y control administrativo.', image: '/img/control-acceso.png' },
  { title: 'GPS / Seguimiento', desc: 'Dispositivos y soporte para rastreo desde aplicación.', image: '/img/gps.jpg' },
]

const activeProduct = ref<number | null>(null)

/**
 * Testimonios
 */
type Testimonio = {
  name: string
  meta: string // ej: "9 opiniones · 6 fotos"
  time: string // ej: "Hace un mes"
  text: string
  rating: number // 1-5
}

const testimonios: Testimonio[] = [
  {
    name: 'Ahtziri Jaimes',
    meta: '3 opiniones',
    time: 'Hace un mes',
    text: 'Excelente servicio, muy amables y la calidad buenísima. Super recomendado 👌🏽…',
    rating: 5,
  },
  {
    name: 'Ángeles MontesBrito',
    meta: '9 opiniones · 6 fotos',
    time: '3 semanas atrás',
    text: 'Excelente atención, con opciones que se ajustan al presupuesto sin perder la calidad',
    rating: 5,
  },
  {
    name: 'Ivan Rojas Martinez',
    meta: '2 opiniones',
    time: 'Hace un mes',
    text: 'Exelente servicio y calidad. Ajustándose al presupuesto deseado.',
    rating: 5,
  },
  {
    name: 'BIANKA HERNANDEZ',
    meta: '1 opinión',
    time: '3 semanas atrás',
    text: 'Muy buena la experiencia, muy recomendados, siempre atentos a los detalles y a mis necesidades, precio justo.',
    rating: 5,
  },
  {
    name: 'Alexis Olivetto',
    meta: '1 opinión',
    time: 'Hace un mes',
    text: 'Buen servicio y te antienden bien',
    rating: 5,
  },
  {
    name: 'Daniel Martinez',
    meta: '1 opinión',
    time: 'Hace un mes',
    text: 'Está bien organizada y completa la tienda, la atención al cliente son muy amables. Te resuelven tus dudas y se acoplan a tus necesidades y presupuestos.',
    rating: 5,
  },
  {
    name: 'Luis Estrada',
    meta: '4 opiniones · 1 foto',
    time: 'Hace un mes',
    text: 'Excelente servicio, me asesoraron y recomendaron las mejores cámaras según mi presupuesto y mis necesidades',
    rating: 5,
  },
  {
    name: 'Ana Alvarez',
    meta: '2 opiniones · 2 fotos',
    time: 'una semana atrás',
    text: 'Servicio de calidad, la mejor opción para proteger tus bienes. Brindan un servicio de calidad y eficacia.',
    rating: 5,
  },
]

// helper de estrellas
function stars(n: number) {
  return Array.from({ length: 5 }, (_, i) => i < Math.max(0, Math.min(5, n)))
}

/**
 * Razones
 */
type Reason = { title: string; desc: string; icon: 'check' | 'shield' | 'scale' | 'clock' | 'chat' | 'tool' }
const reasons: readonly Reason[] = [
  { title: 'Ejecución limpia', desc: 'Instalación con orden, pruebas y entrega documentada. Cableado y terminaciones profesionales.', icon: 'check' },
  { title: 'Soporte preventivo', desc: 'Mantenimientos programados, atención correctiva y reportes ejecutivos para administración.', icon: 'tool' },
  { title: 'Escalabilidad', desc: 'Soluciones que crecen contigo: casa, negocio o corporativo, con arquitectura lista para expandir.', icon: 'scale' },
  { title: 'Continuidad operativa', desc: 'Diseño orientado a disponibilidad: configuraciones estables, recomendaciones técnicas y mejores prácticas.', icon: 'clock' },
  { title: 'Atención y seguimiento', desc: 'Comunicación clara, puntualidad y acompañamiento post-instalación para cierre completo.', icon: 'chat' },
  { title: 'Seguridad reforzada', desc: 'Criterios de hardening, prevención y disuasión para proteger perímetro, accesos y evidencia.', icon: 'shield' },
] as const

function iconSvg(kind: Reason['icon']) {
  switch (kind) {
    case 'check':
      return { d: 'M9.2 16.2 4.8 11.8 3.4 13.2l5.8 5.8L20.6 7.6 19.2 6.2z' }
    case 'shield':
      return { d: 'M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3zm0 18c-3.1-1.2-6-4.6-6-9V6.3L12 4l6 2.3V11c0 4.4-2.9 7.8-6 9z' }
    case 'scale':
      return { d: 'M12 2h2v4h4v2h-4v14h-2V8H6V6h6V2zm-7 7h4l-2 5-2-5zm10 0h4l-2 5-2-5zM7 16c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3zm10 0c-1.7 0-3-1.3-3-3h6c0 1.7-1.3 3-3 3z' }
    case 'clock':
      return { d: 'M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8zm1-13h-2v6l5 3 1-1.7-4-2.3z' }
    case 'chat':
      return { d: 'M4 4h16v11H7l-3 3V4zm2 2v8.2L6.8 13H18V6H6z' }
    case 'tool':
      return { d: 'M22 19l-6.2-6.2a6 6 0 0 1-7.6-7.6L10 7l3-3-1.8-1.8a6 6 0 0 1 7.6 7.6L25 16l-3 3zM5 21l6-6 2 2-6 6H5z' }
  }
}

const babyBlue = 'text-sky-200'

/**
 * Hover suave (global)
 */
const softHoverCard =
  'transition-all duration-300 ease-out ' +
  'hover:-translate-y-[2px] hover:shadow-[0_14px_40px_-28px_rgba(2,6,23,0.25)] ' +
  'hover:bg-slate-50/60 dark:hover:bg-neutral-900/40'

/**
 * Glass (como navbar)
 */
const glassCard =
  'border border-slate-200/60 bg-white/70 backdrop-blur-xl ' +
  'shadow-[0_18px_60px_-40px_rgba(2,6,23,0.45)] ' +
  'dark:border-neutral-800/70 dark:bg-neutral-950/70'

const primaryWhiteBtn =
  'inline-flex h-11 items-center justify-center rounded-xl bg-white/95 px-6 text-sm font-semibold text-slate-950 shadow-sm ' +
  'transition-colors duration-300 hover:bg-blue-950 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60'

/**
 * Botón Ver servicio (glass premium visible sobre imagen)
 */
const serviceBtn =
  'inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-xs font-semibold ' +
  'border border-white/25 bg-white/12 text-white backdrop-blur ' +
  'shadow-[0_10px_30px_-18px_rgba(0,0,0,0.45)] ' +
  'transition-all duration-300 ease-out ' +
  'hover:bg-white/18 hover:-translate-y-[1px] hover:shadow-[0_18px_55px_-32px_rgba(0,0,0,0.65)] ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60'

const sectionTitle = 'text-2xl font-semibold text-slate-950 dark:text-white'
const sectionSubtitle = 'mt-1 text-sm text-slate-600 dark:text-slate-300'

/**
 * Slider automático (Por qué)
 */
type WhyImage = { src: string; alt: string; caption?: string }
const whyImages: WhyImage[] = [
  { src: '/img/carrusel1.png', alt: 'Instalación profesional RSA', caption: 'Instalación limpia y ordenada' },
  { src: '/img/carrusel2.png', alt: 'Monitoreo y operación', caption: 'Control y monitoreo en operación' },
  { src: '/img/carrusel3.png', alt: 'Evidencia y trazabilidad', caption: 'Evidencia y trazabilidad' },
]

const whyIndex = ref(0)
let whyTimer: number | null = null

function nextWhy() {
  whyIndex.value = (whyIndex.value + 1) % whyImages.length
}

function startWhyAuto() {
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  if (reduce) return
  stopWhyAuto()
  whyTimer = window.setInterval(nextWhy, 4500)
}

function stopWhyAuto() {
  if (whyTimer) window.clearInterval(whyTimer)
  whyTimer = null
}

/**
 * Testimonios: autoplay plugin embla
 * - stopOnMouseEnter: true
 * - stopOnInteraction: false
 */
const testiPlugin = Autoplay({
  delay: 4200,
  stopOnMouseEnter: true,
  stopOnInteraction: false,
})

/**
 * Scroll reveal
 */
let observer: IntersectionObserver | null = null

onMounted(() => {
  const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'))
  if (els.length) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-in')
            observer?.unobserve(e.target)
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -10% 0px' }
    )
    els.forEach((el) => observer?.observe(el))
  }

  startWhyAuto()
  runTyping()
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  stopWhyAuto()
})
</script>

<template>
  <Head title="RSA Ingeniería Integral" />

  <PublicLayout>
    <div class="relative w-full overflow-x-hidden">
      <!-- Glow + gradientes -->
      <div
        class="pointer-events-none absolute inset-0 -z-10
               bg-[radial-gradient(1200px_600px_at_15%_0%,rgba(14,165,233,0.12),transparent_55%)]
               dark:bg-[radial-gradient(1200px_600px_at_15%_0%,rgba(56,189,248,0.10),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute inset-0 -z-10
               bg-[radial-gradient(900px_500px_at_90%_30%,rgba(30,64,175,0.10),transparent_55%)]
               dark:bg-[radial-gradient(900px_500px_at_90%_30%,rgba(30,64,175,0.16),transparent_55%)]"
        aria-hidden="true"
      />

      <!-- HERO -->
      <section
        class="relative w-full overflow-hidden bg-cover bg-center bg-no-repeat"
        :style="{ backgroundImage: `url('${RSA_PUBLIC.heroSrc}')` }"
      >
        <div class="absolute inset-0 bg-black/35" aria-hidden="true" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/45" aria-hidden="true" />

        <div class="relative min-h-[calc(100svh-84px)] sm:min-h-[calc(100vh-84px)]">
          <div class="mx-auto flex min-h-[calc(100svh-84px)] sm:min-h-[calc(100vh-84px)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
            <div class="mx-auto max-w-3xl text-center" data-reveal>
              <div class="mx-auto w-fit rounded-full bg-white/15 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
                No somos una opción. Somos tu solución.
              </div>

              <h1 class="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                <span :class="babyBlue">RSA Ingeniería Integral</span>
              </h1>

              <div class="mt-3 text-lg font-semibold text-white/90 sm:text-xl">
                Diseñamos, instalamos y mantenemos sistemas profesionales de seguridad electrónica
              </div>

              <div class="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div
                  v-for="(s, idx) in stats"
                  :key="s.value"
                  class="rounded-2xl border border-white/25 bg-white/10 p-5 text-center backdrop-blur
                        transition-all duration-300 ease-out
                        hover:bg-white/14 hover:shadow-[0_10px_30px_-18px_rgba(0,0,0,0.55)]"
                >
                  <div class="text-2xl font-semibold text-white">{{ s.value }}</div>
                  <div class="mt-1 text-xs text-white/90">
                    <span>{{ typedLabels[idx] }}</span>
                    <span
                      v-if="!typingDone && typedLabels[idx].length < s.label.length"
                      class="ml-0.5 inline-block w-[1px] animate-caret bg-white/80 align-middle"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>

              <div class="mt-8 flex justify-center">
                <button type="button" :class="primaryWhiteBtn" @click="goTo('servicios')">
                  Descubrir más
                </button>
              </div>
            </div>
          </div>

          <div
            class="pointer-events-none absolute bottom-0 left-0 right-0 h-24
                  bg-gradient-to-b from-transparent to-slate-50 dark:to-neutral-950"
            aria-hidden="true"
          />
        </div>
      </section>

      <!-- SERVICIOS -->
      <section id="servicios" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div class="mb-7" data-reveal>
          <h2 :class="sectionTitle">Servicios</h2>
          <p :class="sectionSubtitle">Portafolio de seguridad y control, listo para escalar.</p>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <article
            v-for="tile in serviciosTiles"
            :key="tile.title"
            class="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm
                   dark:border-neutral-800 dark:bg-neutral-950"
            :class="[tile.span, softHoverCard]"
            data-reveal
          >
            <div class="absolute inset-0">
              <img :src="tile.image" alt="" class="h-full w-full object-cover" />
              <div class="absolute inset-0 bg-blue-950/22" aria-hidden="true" />
              <div class="absolute inset-0 bg-gradient-to-b from-blue-950/12 via-blue-950/22 to-blue-950/34" aria-hidden="true" />
            </div>

            <div class="relative p-7 sm:p-8">
              <div class="inline-flex items-center gap-2 rounded-full bg-blue-950/85 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                RSA <span class="opacity-90">•</span> <span class="opacity-95">{{ tile.subtitle }}</span>
              </div>

              <h3 class="mt-4 text-2xl font-semibold leading-tight text-white">
                {{ tile.title }}
              </h3>

              <p class="mt-2 max-w-xl text-sm leading-relaxed text-white/90">
                {{ tile.desc }}
              </p>

              <div v-if="tile.ctas?.length" class="mt-6 grid grid-cols-2 gap-6">
                <div v-for="c in tile.ctas" :key="c.k">
                  <div class="text-2xl font-semibold text-white">{{ c.k }}</div>
                  <div class="mt-1 text-xs text-white/85">{{ c.v }}</div>
                </div>
              </div>

              <div class="mt-7 flex flex-wrap items-center gap-3">
                <Link :href="tile.href" :class="serviceBtn">
                  Ver servicio
                  <svg viewBox="0 0 24 24" class="h-4 w-4 fill-white/90" aria-hidden="true">
                    <path d="M14 3h7v7h-2V6.4l-9.3 9.3-1.4-1.4L17.6 5H14V3zM5 5h6v2H7v10h10v-4h2v6H5V5z" />
                  </svg>
                </Link>

                <a
                  v-if="tile.pill"
                  :href="waLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-semibold text-blue-950 shadow-sm transition-colors duration-300 hover:bg-slate-50"
                >
                  {{ tile.pill }}
                </a>
              </div>
            </div>
          </article>
        </div>
      </section>

      <!-- ¿POR QUÉ ELEGIRNOS? -->
      <section id="porque" class="relative py-14">
        <div class="absolute inset-0 -z-10 bg-slate-50 dark:bg-neutral-900/40" aria-hidden="true" />

        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-reveal>
            <h2 :class="sectionTitle">¿Por qué elegirnos?</h2>
            <p :class="sectionSubtitle">Razones operativas y medibles para confiar tu seguridad a RSA.</p>
          </div>

          <div class="mt-8 grid gap-8 lg:grid-cols-12">
            <div class="lg:col-span-5" data-reveal>
              <Carousel orientation="vertical" class="relative w-full" :opts="{ align: 'start' }">
                <CarouselContent class="h-[460px] sm:h-[520px] gap-3 py-3 pr-2">
                  <CarouselItem v-for="r in reasons" :key="r.title" class="basis-auto">
                    <Card class="border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950" :class="softHoverCard">
                      <CardContent class="p-6">
                        <div class="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-950/10">
                          <svg viewBox="0 0 24 24" class="h-6 w-6 fill-blue-950 dark:fill-sky-200" aria-hidden="true">
                            <path :d="iconSvg(r.icon).d" />
                          </svg>
                        </div>

                        <div class="text-base font-semibold text-slate-950 dark:text-white">
                          {{ r.title }}
                        </div>
                        <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">
                          {{ r.desc }}
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                </CarouselContent>

                <CarouselPrevious class="top-2" />
                <CarouselNext class="bottom-2" />
              </Carousel>
            </div>

            <div class="lg:col-span-7" data-reveal>
              <div
                class="group relative h-[460px] sm:h-[520px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm
                       dark:border-neutral-800 dark:bg-neutral-950"
                @mouseenter="stopWhyAuto"
                @mouseleave="startWhyAuto"
              >
                <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-950/10 via-transparent to-sky-500/10 dark:from-blue-950/20" />

                <Transition name="whyfade" mode="out-in">
                  <img
                    :key="whyIndex"
                    :src="whyImages[whyIndex].src"
                    :alt="whyImages[whyIndex].alt"
                    class="absolute inset-0 h-full w-full object-cover"
                  />
                </Transition>

                <div class="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />

                <div class="absolute bottom-0 left-0 right-0 p-6 sm:p-7">
                  <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                    RSA <span class="opacity-80">•</span>
                    <span class="opacity-95">{{ whyImages[whyIndex].caption ?? 'Seguridad y control' }}</span>
                  </div>

                  <div class="mt-3 max-w-xl text-sm text-white/90">
                    Evidencia visual de ejecución, operación y trazabilidad. (Autoplay; al pasar el mouse se pausa.)
                  </div>

                  <div class="mt-4 flex items-center gap-2">
                    <button
                      v-for="(_, i) in whyImages"
                      :key="i"
                      type="button"
                      class="h-2.5 w-2.5 rounded-full transition-all duration-300"
                      :class="i === whyIndex ? 'bg-white' : 'bg-white/40 hover:bg-white/70'"
                      @click="whyIndex = i"
                      aria-label="Cambiar imagen"
                      title="Cambiar imagen"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

<!-- TESTIMONIOS (Autoplay + flechas abajo en mobile, laterales en md+) -->
  <section id="testimonios" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
    <div class="flex items-end justify-between gap-6" data-reveal>
      <div>
        <h2 :class="sectionTitle">Testimonios</h2>
        <p :class="sectionSubtitle">Opiniones de Google Maps: confianza validada por clientes.</p>
      </div>
    </div>

    <div class="mt-6" data-reveal>
      <Carousel
        class="relative w-full"
        :opts="{ align: 'start' }"
        :plugins="prefersReducedMotion() ? [] : [testiPlugin]"
        @mouseenter="!prefersReducedMotion() && testiPlugin.stop()"
        @mouseleave="!prefersReducedMotion() && (testiPlugin.reset(), testiPlugin.play())"
      >
        <CarouselContent class="-ml-4">
          <CarouselItem
            v-for="t in testimonios"
            :key="t.name + t.time"
            class="pl-4 md:basis-1/2 lg:basis-1/3"
          >
            <Card
              class="h-full border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
              :class="softHoverCard"
            >
              <CardContent class="p-6">
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <div class="truncate text-sm font-semibold text-slate-950 dark:text-white">
                      {{ t.name }}
                    </div>
                    <div class="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {{ t.meta }}
                    </div>
                  </div>

                  <div class="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                    {{ t.time }}
                  </div>
                </div>

                <!-- rating -->
                <div class="mt-4 flex items-center gap-1">
                  <span
                    v-for="(on, i) in stars(t.rating)"
                    :key="i"
                    class="text-sm"
                    :class="on ? 'text-yellow-500' : 'text-slate-200 dark:text-neutral-800'"
                    aria-hidden="true"
                  >
                    ★
                  </span>
                  <span class="ml-2 text-xs text-slate-500 dark:text-slate-400">
                    {{ t.rating.toFixed(1) }}
                  </span>
                </div>

                <!--texto: padding extra lateral para que jamás “choque” con flechas en layouts raros -->
                <p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300 pr-1">
                  “{{ t.text }}”
                </p>

                <div class="mt-5 text-xs text-slate-500 dark:text-slate-400">
                  Fuente: Google Maps
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        </CarouselContent>

        <!-- Desktop: laterales -->
        <CarouselPrevious class="hidden md:flex testi-nav testi-nav-left" />
        <CarouselNext class="hidden md:flex testi-nav testi-nav-right" />

        <!-- Mobile: abajo -->
        <div class="mt-5 flex items-center justify-center gap-3 md:hidden">
          <CarouselPrevious class="testi-nav testi-nav-bottom" />
          <CarouselNext class="testi-nav testi-nav-bottom" />
        </div>
      </Carousel>
    </div>
  </section>

      <!-- PRODUCTOS (cards glass como navbar) -->
      <section id="productos" class="relative py-14">
        <div class="absolute inset-0 -z-10 bg-slate-50 dark:bg-neutral-900/40" aria-hidden="true" />

        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div class="flex items-end justify-between gap-6" data-reveal>
            <div>
              <h2 :class="sectionTitle">Productos</h2>
              <p :class="sectionSubtitle">Los más vendidos: selección rápida de lo que más se instala.</p>
            </div>

            <a
              href="/productos"
              class="inline-flex h-11 items-center justify-center rounded-xl bg-blue-950 px-5 text-sm font-semibold text-white shadow-sm
                     transition-all duration-300 ease-out hover:bg-blue-900 hover:shadow-md
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
            >
              Ver todos
            </a>
          </div>

          <!-- Mobile/tablet -->
          <div class="mt-8 grid gap-5 sm:grid-cols-2 lg:hidden">
            <article
              v-for="p in productos"
              :key="p.title"
              class="overflow-hidden rounded-2xl"
              :class="[glassCard, softHoverCard]"
              data-reveal
            >
              <div class="h-44 w-full bg-slate-100/40 dark:bg-neutral-900/40">
                <img :src="p.image" alt="" class="h-full w-full object-cover" />
              </div>

              <div class="p-6">
                <div class="text-base font-semibold text-slate-950 dark:text-white">{{ p.title }}</div>
                <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ p.desc }}</div>
              </div>
            </article>
          </div>

          <!-- Desktop expand -->
          <div class="mt-8 hidden gap-5 lg:flex" data-reveal>
            <article
              v-for="(p, i) in productos"
              :key="p.title"
              class="group relative overflow-hidden rounded-3xl"
              :class="[glassCard, activeProduct === i ? 'flex-[1.35]' : 'flex-1', 'transition-all duration-400 ease-out']"
              @mouseenter="activeProduct = i"
              @mouseleave="activeProduct = null"
            >
              <div class="absolute inset-0">
                <img :src="p.image" alt="" class="h-full w-full object-cover" />
                <div class="absolute inset-0 bg-blue-950/45" />
                <div class="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-blue-950/35 to-blue-950/15" />
              </div>

              <div class="relative flex min-h-[280px] flex-col justify-end p-7">
                <div class="inline-flex w-fit items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  Más vendido
                </div>

                <div class="mt-3 text-xl font-semibold text-white">
                  {{ p.title }}
                </div>
                <div class="mt-2 text-sm text-white/85">
                  {{ p.desc }}
                </div>

                <div class="mt-5">
                  <a
                    href="/productos"
                    class="inline-flex h-10 items-center justify-center rounded-full border border-white/20 bg-white/10 px-4 text-xs font-semibold text-white backdrop-blur
                           transition hover:bg-white/16 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    Ver catálogo
                  </a>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      <!-- CONTACTO -->
      <section id="contacto" class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div class="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-950" data-reveal>
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
                  class="inline-flex h-11 items-center justify-center rounded-xl bg-blue-950 px-5 text-sm font-semibold text-white shadow-sm
                         transition-all duration-300 ease-out hover:bg-blue-900 hover:shadow-md
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
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
    </div>
  </PublicLayout>
</template>

<style scoped>
/* Reveal base */
[data-reveal] {
  opacity: 0;
  transform: translateY(14px);
  transition:
    opacity 700ms cubic-bezier(0.2, 0.8, 0.2, 1),
    transform 700ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: opacity, transform;
}
[data-reveal].is-in {
  opacity: 1;
  transform: translateY(0);
}

/* slider why */
.whyfade-enter-active,
.whyfade-leave-active {
  transition: opacity 520ms ease, transform 720ms cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: opacity, transform;
}
.whyfade-enter-from {
  opacity: 0;
  transform: scale(1.03);
}
.whyfade-enter-to {
  opacity: 1;
  transform: scale(1);
}
.whyfade-leave-from {
  opacity: 1;
  transform: scale(1);
}
.whyfade-leave-to {
  opacity: 0;
  transform: scale(1.01);
}

/* caret typing */
@keyframes caretBlink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.animate-caret {
  height: 0.9em;
  animation: caretBlink 900ms infinite;
}

/* ✅ Testimonios: estilo pro para flechas (y que no tapen contenido) */
.testi-nav {
  z-index: 50 !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

/* Desktop: laterales y centradas */
.testi-nav-left {
  position: absolute !important;
  left: -0.25rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}
.testi-nav-right {
  position: absolute !important;
  right: -0.25rem !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
}

/* Mobile: botones abajo (no overlay) */
.testi-nav-bottom {
  position: static !important;
  transform: none !important;
}

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
  .whyfade-enter-active,
  .whyfade-leave-active {
    transition: none !important;
  }
  .animate-caret {
    animation: none !important;
  }
}
</style>
