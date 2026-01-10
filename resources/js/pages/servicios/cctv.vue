<!-- resources/js/Pages/Servicios/Cctv.vue -->
<script setup lang="ts">
import { Head, Link } from '@inertiajs/vue3'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import { RSA_PUBLIC } from '@/config/rsaPublic'

/**
 * Navegación interna (respeta header fijo)
 */
function goTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const headerOffset = 84
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

const waLink = RSA_PUBLIC.waLink

/**
 * Modal (placeholder)
 */
const contactOpen = ref(false)
function openContact() {
  contactOpen.value = true
}
function closeContact() {
  contactOpen.value = false
}

/**
 * Marcas (placeholders)
 */
type Brand = { name: string; logo?: string }
const brands: Brand[] = [
  { name: 'Hikvision' },
  { name: 'Dahua' },
  { name: 'Hilook' },
  { name: 'Ezviz' },
  { name: 'TP-Link' },
  { name: 'Ubiquiti' },
  { name: 'Ajax' },
  { name: 'ZKTeco' },
]

/**
 * Beneficios (tabs)
 */
type BenefitTab = { title: string; text: string }
const benefitTabs: BenefitTab[] = [
  {
    title: 'Cobertura optimizada (sin puntos ciegos)',
    text:
      'Levantamos requerimientos, definimos ángulos y distancias, y diseñamos la distribución de cámaras por riesgo. Menos improvisación, más evidencia útil.',
  },
  {
    title: 'Evidencia confiable y respaldada',
    text:
      'Grabación continua con NVR/DVR, retención según necesidad y buenas prácticas de resguardo. Si lo necesitas, la evidencia está.',
  },
  {
    title: 'Acceso local y remoto, bien configurado',
    text:
      'Visualiza desde sitio o desde tu teléfono de forma estable. Configuramos permisos y acceso con enfoque operativo, no “a ver si jala”.',
  },
  {
    title: 'Instalación limpia y profesional',
    text:
      'Canalización, terminaciones y pruebas. Entregamos un sistema presentable, documentado y listo para operar sin dolores de cabeza.',
  },
  {
    title: 'Soporte y mantenimiento preventivo',
    text:
      'Atención correctiva cuando se requiere y mantenimiento para evitar fallas antes de que cuesten. Continuidad operativa como KPI.',
  },
]
const activeBenefit = ref(0)

/**
 * Pasos
 */
type Step = { n: string; title: string; text: string; note?: string }
const steps: Step[] = [
  {
    n: '01',
    title: 'Diagnóstico del sitio',
    text: 'Revisamos objetivos, áreas críticas, iluminación, alturas, red y rutas de cableado para proponer cobertura real.',
    note: 'Salida: alcance y prioridades',
  },
  {
    n: '02',
    title: 'Propuesta técnica + presupuesto',
    text: 'Te presentamos opciones por nivel de riesgo y presupuesto, sin sacrificar estabilidad ni evidencia.',
    note: 'Salida: BOM + plan de instalación',
  },
  {
    n: '03',
    title: 'Instalación y configuración por ingeniería',
    text: 'Montaje, cableado, grabación, accesos, ajustes finos y pruebas. Todo con entrega ordenada.',
    note: 'Salida: sistema operando',
  },
  {
    n: '04',
    title: 'Capacitación + entrega con evidencia',
    text: 'Te dejamos operación clara: cómo buscar eventos, exportar evidencia y administrar accesos.',
    note: 'Salida: control y trazabilidad',
  },
  {
    n: '05',
    title: 'Soporte y mantenimiento',
    text: 'Seguimiento post-instalación y mantenimiento preventivo para mantener disponibilidad y calidad de imagen.',
    note: 'Salida: continuidad operativa',
  },
]

/**
 * Reveal
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
})

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
})

/**
 * Utilitarios visuales
 */
const sectionTitle = 'text-2xl font-semibold text-slate-950 dark:text-white'
const sectionSubtitle = 'mt-1 text-sm text-slate-600 dark:text-slate-300'

const glass =
  'border border-white/12 bg-white/10 backdrop-blur-xl ' +
  'shadow-[0_18px_60px_-40px_rgba(2,6,23,0.55)]'

const glassLight =
  'border border-slate-200/60 bg-white/70 backdrop-blur-xl ' +
  'shadow-[0_18px_60px_-40px_rgba(2,6,23,0.35)] ' +
  'dark:border-neutral-800/70 dark:bg-neutral-950/70'

const primaryBtn =
  'inline-flex h-11 items-center justify-center rounded-xl bg-blue-950 px-6 text-sm font-semibold text-white ' +
  'shadow-sm transition-all duration-300 ease-out hover:bg-blue-900 hover:shadow-md ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300'

const ghostBtn =
  'inline-flex h-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 px-6 text-sm font-semibold text-white ' +
  'backdrop-blur transition-all duration-300 ease-out hover:bg-white/14 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60'

const softHover =
  'transition-all duration-300 ease-out hover:-translate-y-[2px] hover:shadow-[0_14px_40px_-28px_rgba(2,6,23,0.25)]'
</script>

<template>
  <Head title="Cámaras de seguridad (CCTV) | RSA" />

  <PublicLayout>
    <div class="relative w-full overflow-x-hidden">
      <!-- Glow corporativo -->
      <div
        class="pointer-events-none absolute inset-0 -z-10
               bg-[radial-gradient(1200px_600px_at_15%_0%,rgba(14,165,233,0.10),transparent_55%)]
               dark:bg-[radial-gradient(1200px_600px_at_15%_0%,rgba(56,189,248,0.08),transparent_55%)]"
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
        :style="{ backgroundImage: `url('/img/cctv.jpg')` }"
      >
        <div class="absolute inset-0 bg-black/45" aria-hidden="true" />
        <div class="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/55" aria-hidden="true" />

        <!-- FIX: padding superior para que NO lo tape el header -->
        <div class="relative pt-[calc(var(--rsa-header,84px)+24px)]">
          <div class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
            <div class="grid gap-10 lg:grid-cols-12 lg:items-end">
              <!-- Copy -->
              <div class="lg:col-span-6" data-reveal>
                <div class="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  RSA <span class="opacity-70">•</span> Videovigilancia profesional
                </div>

                <h1 class="mt-5 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                  Cámaras de seguridad (CCTV)
                </h1>

                <p class="mt-4 max-w-2xl text-base leading-relaxed text-white/90">
                  Control visual <span class="font-semibold text-white">24/7</span> con evidencia confiable.
                  Diseñamos e instalamos sistemas estables con cobertura optimizada y grabación continua,
                  ajustados al nivel de riesgo de cada proyecto.
                </p>

                <div class="mt-7 flex flex-wrap gap-3">
                  <button type="button" :class="primaryBtn" @click="openContact">Contáctanos</button>
                  <button type="button" :class="ghostBtn" @click="goTo('detalle')">Saber más</button>

                  <a
                    :href="waLink"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/0 px-6 text-sm font-semibold text-white
                           backdrop-blur transition-all duration-300 ease-out hover:bg-white/10
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                  >
                    WhatsApp
                  </a>
                </div>

                <div class="mt-6 text-xs text-white/70">
                  Aplicaciones: <span class="font-semibold text-white/85">Residencial</span> · Comercial · Corporativo · Industrial
                </div>
              </div>

              <!-- Feature panel -->
              <div class="lg:col-span-6" data-reveal>
                <div class="rounded-3xl p-6 sm:p-7" :class="[glass, 'text-white']">
                  <div class="grid gap-5 sm:grid-cols-2">
                    <div class="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                      <div class="flex items-start gap-3">
                        <div class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                          <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white/90" aria-hidden="true">
                            <path
                              d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12c-3 0-5-2.5-5-5s2-5 5-5 5 2.5 5 5-2 5-5 5zm0-8a3 3 0 1 0 3 3 3 3 0 0 0-3-3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-semibold">HD / 4MP / 8MP</div>
                          <div class="mt-1 text-xs text-white/80">Calidad según el proyecto</div>
                        </div>
                      </div>
                    </div>

                    <div class="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                      <div class="flex items-start gap-3">
                        <div class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                          <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white/90" aria-hidden="true">
                            <path d="M4 6h16v12H4V6zm2 2v8h12V8H6zm1 9h10v1H7v-1z" />
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-semibold">NVR / DVR</div>
                          <div class="mt-1 text-xs text-white/80">Respaldo seguro de evidencia</div>
                        </div>
                      </div>
                    </div>

                    <div class="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                      <div class="flex items-start gap-3">
                        <div class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                          <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white/90" aria-hidden="true">
                            <path
                              d="M12 2a6 6 0 0 0-6 6v3H4v11h16V11h-2V8a6 6 0 0 0-6-6zm4 9H8V8a4 4 0 0 1 8 0v3z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-semibold">Acceso local y remoto</div>
                          <div class="mt-1 text-xs text-white/80">Monitoreo estable desde app</div>
                        </div>
                      </div>
                    </div>

                    <div class="rounded-2xl border border-white/10 bg-white/6 p-5 backdrop-blur">
                      <div class="flex items-start gap-3">
                        <div class="mt-0.5 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                          <svg viewBox="0 0 24 24" class="h-5 w-5 fill-white/90" aria-hidden="true">
                            <path
                              d="M22 19l-6.2-6.2a6 6 0 0 1-7.6-7.6L10 7l3-3-1.8-1.8a6 6 0 0 1 7.6 7.6L25 16l-3 3zM5 21l6-6 2 2-6 6H5z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div class="text-sm font-semibold">Soporte técnico</div>
                          <div class="mt-1 text-xs text-white/80">Mantenimiento y seguimiento</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="mt-6 rounded-2xl border border-white/10 bg-white/6 p-5 text-xs text-white/80 backdrop-blur">
                    Incluye: configuración por ingeniería, pruebas completas y entrega documentada.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- separación visual al siguiente bloque -->
          <div class="h-10 bg-gradient-to-b from-transparent to-slate-50 dark:to-neutral-950" aria-hidden="true" />
        </div>
      </section>

      <!-- DETALLE -->
      <section
        id="detalle"
        class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 scroll-mt-[calc(var(--rsa-header,84px)+16px)]"
      >
        <div class="grid gap-10 lg:grid-cols-12 lg:items-start">
          <div class="lg:col-span-5" data-reveal>
            <h2 :class="sectionTitle">Qué incluye</h2>
            <p :class="sectionSubtitle">Componentes y alcance operativo del servicio CCTV.</p>

            <div class="mt-6 space-y-3">
              <div class="rounded-2xl p-5" :class="[glassLight, softHover]">
                <div class="text-sm font-semibold text-slate-950 dark:text-white">Cámaras profesionales</div>
                <div class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  HD / 4MP / 8MP según el nivel de riesgo y cobertura.
                </div>
              </div>
              <div class="rounded-2xl p-5" :class="[glassLight, softHover]">
                <div class="text-sm font-semibold text-slate-950 dark:text-white">NVR / DVR</div>
                <div class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Grabación continua con respaldo seguro de evidencia.
                </div>
              </div>
              <div class="rounded-2xl p-5" :class="[glassLight, softHover]">
                <div class="text-sm font-semibold text-slate-950 dark:text-white">Acceso local y remoto</div>
                <div class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Operación desde sitio y monitoreo desde app.
                </div>
              </div>
              <div class="rounded-2xl p-5" :class="[glassLight, softHover]">
                <div class="text-sm font-semibold text-slate-950 dark:text-white">Ingeniería + soporte</div>
                <div class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                  Configuración, pruebas, entrega y mantenimiento.
                </div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-7" data-reveal>
            <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
              <div class="absolute inset-0 bg-[radial-gradient(900px_420px_at_15%_0%,rgba(30,64,175,0.08),transparent_55%)]" />
              <div class="relative p-8 sm:p-9">
                <div class="text-sm font-semibold text-slate-950 dark:text-white">Resultado esperado</div>
                <div class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  Un sistema de videovigilancia estable y escalable, con cobertura optimizada, evidencia utilizable y una operación diaria clara.
                  Diseñado para prevenir, documentar y responder.
                </div>

                <div class="mt-6 grid gap-4 sm:grid-cols-2">
                  <div class="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-5 dark:border-neutral-800/70 dark:bg-neutral-900/40">
                    <div class="text-xs font-semibold text-slate-950 dark:text-white">Enfoque</div>
                    <div class="mt-1 text-sm text-slate-600 dark:text-slate-300">Continuidad + evidencia + prevención.</div>
                  </div>
                  <div class="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-5 dark:border-neutral-800/70 dark:bg-neutral-900/40">
                    <div class="text-xs font-semibold text-slate-950 dark:text-white">Entregables</div>
                    <div class="mt-1 text-sm text-slate-600 dark:text-slate-300">Pruebas, ajustes y guía operativa.</div>
                  </div>
                </div>

                <div class="mt-7 flex flex-wrap gap-3">
                  <button type="button" :class="primaryBtn" @click="openContact">Contáctanos</button>
                  <button
                    type="button"
                    class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-950
                           transition hover:bg-slate-50 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900/40"
                    @click="goTo('marcas')"
                  >
                    Ver marcas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MARCAS -->
    <section id="marcas" class="relative py-16 bg-slate-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="text-center" data-reveal>
        <div class="text-xs font-semibold tracking-wide text-slate-500">
            Trusted by
        </div>

        <h2 class="mt-3 text-2xl font-semibold text-slate-950">
            Marcas con las que trabajamos
        </h2>

        <p class="mt-2 text-sm text-slate-600">
            Si quieres, reemplazamos estos nombres por logos y queda nivel “enterprise”.
        </p>
        </div>

        <div
        class="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4"
        data-reveal
        >
        <div
            v-for="b in brands"
            :key="b.name"
            class="flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-7
                text-slate-800 font-semibold shadow-sm transition
                hover:shadow-md hover:-translate-y-[1px]"
        >
            {{ b.name }}
        </div>
        </div>
    </div>
    </section>


      <!-- BENEFICIOS -->
      <section
        id="beneficios"
        class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 scroll-mt-[calc(var(--rsa-header,84px)+16px)]"
      >
        <div class="mb-8" data-reveal>
          <h2 :class="sectionTitle">Beneficios con RSA</h2>
          <p :class="sectionSubtitle">
            Enfoque corporativo: diseño, ejecución y continuidad. Selecciona un punto y cambia el detalle.
          </p>
        </div>

        <div class="grid gap-8 lg:grid-cols-12 lg:items-stretch">
          <div class="lg:col-span-5" data-reveal>
            <div class="relative h-[320px] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
              <img src="/img/cctv.jpg" alt="" class="absolute inset-0 h-full w-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
              <div class="relative p-7">
                <div class="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                  RSA • CCTV
                </div>
                <div class="mt-4 text-xl font-semibold text-white">Evidencia que sí sirve.</div>
                <div class="mt-2 text-sm text-white/80">Menos “instalación”, más solución operativa.</div>
              </div>
            </div>
          </div>

          <div class="lg:col-span-7" data-reveal>
            <div class="rounded-3xl p-7" :class="[glassLight]">
              <div class="grid gap-6 lg:grid-cols-12">
                <div class="lg:col-span-5">
                  <div class="space-y-2">
                    <button
                      v-for="(t, i) in benefitTabs"
                      :key="t.title"
                      type="button"
                      class="w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition"
                      :class="
                        i === activeBenefit
                          ? 'border-blue-950/30 bg-blue-950/10 text-slate-950 dark:border-sky-200/20 dark:bg-white/6 dark:text-white'
                          : 'border-slate-200 bg-white/50 text-slate-700 hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950/40 dark:text-slate-200 dark:hover:bg-neutral-900/40'
                      "
                      @click="activeBenefit = i"
                    >
                      {{ t.title }}
                    </button>
                  </div>
                </div>

                <div class="lg:col-span-7">
                  <div class="rounded-2xl border border-slate-200 bg-white/55 p-6 dark:border-neutral-800 dark:bg-neutral-950/40">
                    <div class="text-base font-semibold text-slate-950 dark:text-white">
                      {{ benefitTabs[activeBenefit].title }}
                    </div>
                    <p class="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                      {{ benefitTabs[activeBenefit].text }}
                    </p>

                    <div class="mt-6 flex flex-wrap gap-3">
                      <button type="button" :class="primaryBtn" @click="openContact">Contáctanos</button>
                      <button
                        type="button"
                        class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-slate-950
                               transition hover:bg-slate-50 dark:border-neutral-800 dark:text-white dark:hover:bg-neutral-900/40"
                        @click="goTo('pasos')"
                      >
                        Ver pasos
                      </button>
                    </div>
                  </div>

                  <div class="mt-4 text-xs text-slate-500 dark:text-slate-400">
                    Tip: en mobile, tabs arriba y detalle abajo. Sin overlays que tapen texto.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- PASOS PARA CONTRATAR -->
    <section id="pasos" class="relative py-16 bg-white">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-10" data-reveal>
        <h2 class="text-2xl font-semibold text-slate-950">
            Pasos para contratar
        </h2>
        <p class="mt-2 text-sm text-slate-600">
            Proceso claro, sin fricción: de diagnóstico a continuidad operativa.
        </p>
        </div>

        <!-- Steps container -->
        <div
        class="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50"
        data-reveal
        >
        <div
            v-for="(s, idx) in steps"
            :key="s.n"
            class="grid gap-6 px-6 py-8 sm:px-8 lg:grid-cols-12
                border-b border-slate-200 last:border-b-0"
        >
            <!-- Número + título -->
            <div class="lg:col-span-5">
            <div class="flex items-start gap-4">
                <div
                class="flex h-10 w-10 items-center justify-center rounded-xl
                        bg-blue-950 text-sm font-semibold text-white"
                >
                {{ s.n }}
                </div>

                <div>
                <div class="text-lg font-semibold text-slate-950">
                    {{ s.title }}
                </div>
                <div
                    v-if="s.note"
                    class="mt-1 text-xs text-slate-500"
                >
                    {{ s.note }}
                </div>
                </div>
            </div>
            </div>

            <!-- Descripción -->
            <div class="lg:col-span-7">
            <p class="text-sm leading-relaxed text-slate-600">
                {{ s.text }}
            </p>
            </div>
        </div>
        </div>

        <!-- CTA -->
        <div class="mt-10 flex flex-wrap gap-3" data-reveal>
        <button
            type="button"
            :class="primaryBtn"
            @click="openContact"
        >
            Contáctanos
        </button>

        <Link
            href="/"
            class="inline-flex h-11 items-center justify-center rounded-xl
                border border-slate-200 px-6 text-sm font-semibold text-slate-950
                transition hover:bg-slate-50"
        >
            Volver al inicio
        </Link>
        </div>
    </div>
    </section>


      <!-- CTA final -->
      <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div class="rounded-3xl p-8 sm:p-9" :class="[glassLight]" data-reveal>
          <div class="grid gap-6 lg:grid-cols-12 lg:items-center">
            <div class="lg:col-span-8">
              <div class="text-lg font-semibold text-slate-950 dark:text-white">
                ¿Listo para videovigilancia profesional?
              </div>
              <div class="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Te armamos propuesta por riesgo y presupuesto, con instalación limpia y evidencia confiable.
              </div>
            </div>
            <div class="lg:col-span-4 lg:flex lg:justify-end">
              <div class="flex flex-wrap gap-3">
                <button type="button" :class="primaryBtn" @click="openContact">Contáctanos</button>
                <a
                  :href="waLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-950
                         transition hover:bg-slate-50 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900/40"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- MODAL -->
      <div
        v-if="contactOpen"
        class="fixed inset-0 z-[20000] flex items-end justify-center p-4 sm:items-center"
        aria-modal="true"
        role="dialog"
      >
        <button type="button" class="absolute inset-0 bg-black/55" @click="closeContact" aria-label="Cerrar" />

        <div class="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/12 bg-black/70 p-6 text-white backdrop-blur-xl">
          <div class="flex items-start justify-between gap-3">
            <div>
              <div class="text-sm font-semibold">Contáctanos</div>
              <div class="mt-1 text-xs text-white/70">(Placeholder) Luego lo migramos a shadcn con validación y envío.</div>
            </div>
            <button
              type="button"
              class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-white/10 text-white/90 transition hover:bg-white/15"
              @click="closeContact"
              aria-label="Cerrar"
              title="Cerrar"
            >
              ✕
            </button>
          </div>

          <form class="mt-5 space-y-3">
            <input
              type="text"
              placeholder="Nombre"
              class="h-11 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-sm text-white placeholder:text-white/55 outline-none
                     focus:border-white/25"
            />
            <input
              type="text"
              placeholder="Teléfono / WhatsApp"
              class="h-11 w-full rounded-2xl border border-white/12 bg-white/8 px-4 text-sm text-white placeholder:text-white/55 outline-none
                     focus:border-white/25"
            />
            <textarea
              rows="4"
              placeholder="Cuéntanos tu necesidad (residencial, comercial, corporativo, industrial)…"
              class="w-full rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm text-white placeholder:text-white/55 outline-none
                     focus:border-white/25"
            />

            <div class="mt-4 flex flex-wrap gap-3">
              <button type="button" :class="primaryBtn" @click="closeContact">Enviar (demo)</button>
              <a
                :href="waLink"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex h-11 items-center justify-center rounded-xl border border-white/15 bg-white/0 px-6 text-sm font-semibold text-white
                       backdrop-blur transition hover:bg-white/10"
              >
                Abrir WhatsApp
              </a>
            </div>
          </form>
        </div>
      </div>
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

/* Reduce motion */
@media (prefers-reduced-motion: reduce) {
  [data-reveal] {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>
