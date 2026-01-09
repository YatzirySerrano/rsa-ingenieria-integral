<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import { Link } from '@inertiajs/vue3'
import { RSA_PUBLIC } from '@/config/rsaPublic'

type NavLink = { label: string; id: string }

const props = withDefaults(
  defineProps<{
    links?: readonly NavLink[]
    onNav: (id: string) => void
    logoSrc?: string
  }>(),
  {
    links: () => RSA_PUBLIC.links,
    logoSrc: RSA_PUBLIC.logoSrc,
  }
)

/**
 * ====== Submenús ======
 * Servicios: mismas imágenes que Welcome.vue (serviciosTiles.image)
 * Ajusta hrefs a tus rutas finales cuando las crees.
 */
type ServicioItem = { label: string; desc: string; image: string; href: string }

const serviceItems: readonly ServicioItem[] = [
  {
    label: 'Cámaras de seguridad (CCTV)',
    desc: 'Videovigilancia profesional',
    image: '/img/cctv.jpg',
    href: '/servicios/cctv',
  },
  {
    label: 'Alarmas para casa y negocios',
    desc: 'Detección y disuasión',
    image: '/img/alarmas.png',
    href: '/servicios/alarmas',
  },
  {
    label: 'GPS y rastreo vehicular',
    desc: 'Control en tiempo real',
    image: '/img/gps.jpg',
    href: '/servicios/gps',
  },
  {
    label: 'Cercas eléctricas',
    desc: 'Perímetro reforzado',
    image: '/img/cerca-electrica.png',
    href: '/servicios/cercas-electricas',
  },
  {
    label: 'Control de acceso',
    desc: 'Trazabilidad y control',
    image: '/img/control-acceso.png',
    href: '/servicios/control-de-acceso',
  },
  {
    label: 'Dash cam profesional',
    desc: 'Evidencia en ruta',
    image: '/img/dashcam.png',
    href: '/servicios/dashcam',
  },
]

/**
 * Productos:
 * - Los más vendidos: mismo comportamiento que hoy (scroll a #productos en Welcome.vue)
 * - Todos los productos: página /productos
 */
type ProductoItem = { label: string; desc: string; kind: 'scroll' | 'link'; id?: string; href?: string }
const productsItems: readonly ProductoItem[] = [
  { label: 'Los más vendidos', desc: 'Ir a la sección en inicio', kind: 'scroll', id: 'productos' },
  { label: 'Todos los productos', desc: 'Ver catálogo completo', kind: 'link', href: '/productos' },
]

/**
 * ====== Estado general ======
 */
const open = ref(false)
const mobileServiciosOpen = ref(false)
const mobileProductosOpen = ref(false)

/**
 * ====== Dropdown state (desktop) ======
 * Se mantiene abierto mientras el mouse esté sobre trigger o panel.
 */
const serviciosOpen = ref(false)
const productosOpen = ref(false)
let closeTimer: number | null = null

function clearCloseTimer() {
  if (closeTimer) window.clearTimeout(closeTimer)
  closeTimer = null
}

function scheduleClose(which: 'servicios' | 'productos') {
  clearCloseTimer()
  closeTimer = window.setTimeout(() => {
    if (which === 'servicios') serviciosOpen.value = false
    if (which === 'productos') productosOpen.value = false
  }, 110) // “grace delay” para evitar flicker
}

function openServicios() {
  clearCloseTimer()
  serviciosOpen.value = true
  productosOpen.value = false
}

function openProductos() {
  clearCloseTimer()
  productosOpen.value = true
  serviciosOpen.value = false
}

function closeAllDropdowns() {
  clearCloseTimer()
  serviciosOpen.value = false
  productosOpen.value = false
}

/**
 * ====== Navegación ======
 */
function go(id: string) {
  open.value = false
  closeAllDropdowns()
  props.onNav(id)
}

function closeMobile() {
  open.value = false
  mobileServiciosOpen.value = false
  mobileProductosOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    closeMobile()
    closeAllDropdowns()
  }
}

// Scroll lock
function setBodyLock(lock: boolean) {
  const body = document.body
  if (lock) {
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
  } else {
    body.style.overflow = ''
    body.style.touchAction = ''
  }
}

watch(open, (v) => setBodyLock(v))

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  setBodyLock(false)
})

/**
 * Links base: “Servicios” y “Productos” se manejan manualmente
 */
const otherLinks = computed(() =>
  (props.links ?? []).filter((l) => l.id !== 'servicios' && l.id !== 'productos')
)

/** =========
 *  Estilos base
 *  ========= */
const pill =
  'mx-auto w-fit max-w-[calc(100%-1rem)] rounded-full ' +
  'border border-slate-200/60 bg-white/70 backdrop-blur-xl ' +
  'shadow-[0_18px_60px_-40px_rgba(2,6,23,0.45)] ' +
  'dark:border-neutral-800/70 dark:bg-neutral-950/70'

const pillInner =
  'flex items-center justify-between gap-4 px-4 py-3 sm:gap-6 sm:px-6'

const itemBase =
  'relative text-sm font-medium text-slate-700 dark:text-slate-200 ' +
  'hover:text-slate-950 dark:hover:text-white transition'

const underline =
  'after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 ' +
  'after:bg-slate-950 after:transition-all after:duration-300 hover:after:w-full ' +
  'dark:after:bg-white'

const btnSoft =
  'inline-flex h-10 items-center justify-center rounded-full ' +
  'border border-white/25 bg-white/35 px-4 text-sm font-semibold ' +
  'text-slate-950 backdrop-blur transition hover:bg-white/55 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60 ' +
  'dark:border-white/12 dark:bg-white/8 dark:text-white dark:hover:bg-white/12'

const btnPrimary =
  'inline-flex h-10 items-center justify-center rounded-full bg-blue-950 px-4 ' +
  'text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 ' +
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300'

/**
 * Dropdown panel (premium)
 */
const ddPanel =
  'absolute left-1/2 top-full mt-3 -translate-x-1/2 overflow-hidden ' +
  'rounded-2xl border border-slate-200 bg-white/95 shadow-2xl backdrop-blur-xl ' +
  'ring-1 ring-black/5 ' +
  'dark:border-neutral-800 dark:bg-neutral-950/95 dark:ring-white/10'

const ddTitle = 'text-sm font-semibold text-slate-950 dark:text-white'
const ddDesc = 'text-xs text-slate-600 dark:text-slate-300'
</script>

<template>
  <header class="fixed top-0 left-0 right-0 z-50">
    <div class="px-2 pt-3 sm:px-4 sm:pt-4">
      <div :class="pill">
        <div :class="pillInner">
          <!-- Logo -->
          <button
            type="button"
            class="flex items-center gap-3"
            @click="go('servicios')"
            aria-label="Ir al inicio"
          >
            <img :src="props.logoSrc" alt="RSA" class="h-9 w-15 object-contain" />
          </button>

          <!-- Desktop nav -->
          <nav class="hidden items-center gap-7 md:flex">
            <!-- ===== Servicios (Dropdown - stays open while hovered) ===== -->
            <div
              class="relative"
              @mouseenter="openServicios"
              @mouseleave="scheduleClose('servicios')"
            >
              <button
                type="button"
                :class="[itemBase, underline]"
                class="inline-flex items-center gap-2"
                aria-haspopup="menu"
                :aria-expanded="serviciosOpen ? 'true' : 'false'"
                @focus="openServicios"
              >
                Servicios
                <svg
                  viewBox="0 0 24 24"
                  class="h-4 w-4 fill-slate-500 transition dark:fill-slate-300"
                  :class="serviciosOpen ? 'rotate-180' : ''"
                  aria-hidden="true"
                >
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </button>

              <transition
                enter-active-class="transition duration-180 ease-out"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div v-if="serviciosOpen" :class="ddPanel" class="w-[720px]">
                  <div class="p-3">
                    <!-- Header del dropdown -->
                    <div class="flex items-center justify-between gap-3 px-2 pb-2">
                      <div>
                        <div class="text-sm font-semibold text-slate-950 dark:text-white">Servicios</div>
                        <div class="text-xs text-slate-600 dark:text-slate-300">
                          Selecciona un servicio o ve el portafolio en inicio.
                        </div>
                      </div>

                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold
                               text-slate-700 hover:bg-slate-100/70 transition
                               dark:text-slate-200 dark:hover:bg-white/5"
                        @click="go('servicios')"
                      >
                        Ver todos
                        <svg viewBox="0 0 24 24" class="h-4 w-4 fill-current" aria-hidden="true">
                          <path d="M9 18l6-6-6-6-1.4 1.4L12.2 12l-4.6 4.6L9 18z" />
                        </svg>
                      </button>
                    </div>

                    <div class="grid gap-2 sm:grid-cols-2">
                      <Link
                        v-for="s in serviceItems"
                        :key="s.href"
                        :href="s.href"
                        class="group flex items-center gap-3 rounded-xl p-3 transition
                               hover:bg-slate-100/70 dark:hover:bg-white/5"
                        @click="closeAllDropdowns"
                      >
                        <div
                          class="h-12 w-12 overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10"
                        >
                          <img :src="s.image" alt="" class="h-full w-full object-cover" />
                        </div>

                        <div class="min-w-0">
                          <div :class="ddTitle" class="truncate">{{ s.label }}</div>
                          <div :class="ddDesc" class="truncate">{{ s.desc }}</div>
                        </div>

                        <svg
                          viewBox="0 0 24 24"
                          class="ml-auto h-4 w-4 fill-slate-400 transition group-hover:fill-slate-600 dark:fill-slate-400"
                          aria-hidden="true"
                        >
                          <path d="M9 18l6-6-6-6-1.4 1.4L12.2 12l-4.6 4.6L9 18z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <!-- ===== Links normales (sin productos) ===== -->
            <button
              v-for="l in otherLinks"
              :key="l.id"
              type="button"
              :class="[itemBase, underline]"
              @click="go(l.id)"
            >
              {{ l.label }}
            </button>

            <!-- ===== Productos (Dropdown - stays open while hovered) ===== -->
            <div
              class="relative"
              @mouseenter="openProductos"
              @mouseleave="scheduleClose('productos')"
            >
              <button
                type="button"
                :class="[itemBase, underline]"
                class="inline-flex items-center gap-2"
                aria-haspopup="menu"
                :aria-expanded="productosOpen ? 'true' : 'false'"
                @focus="openProductos"
              >
                Productos
                <svg
                  viewBox="0 0 24 24"
                  class="h-4 w-4 fill-slate-500 transition dark:fill-slate-300"
                  :class="productosOpen ? 'rotate-180' : ''"
                  aria-hidden="true"
                >
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </button>

              <transition
                enter-active-class="transition duration-180 ease-out"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-150 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <div v-if="productosOpen" :class="ddPanel" class="w-[360px]">
                  <div class="p-3">
                    <div class="px-2 pb-2">
                      <div class="text-sm font-semibold text-slate-950 dark:text-white">Productos</div>
                      <div class="text-xs text-slate-600 dark:text-slate-300">Accesos rápidos</div>
                    </div>

                    <div class="space-y-1">
                      <!-- Los más vendidos (scroll) -->
                      <button
                        type="button"
                        class="group flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition
                               hover:bg-slate-100/70 dark:hover:bg-white/5"
                        @click="go('productos')"
                      >
                        <div class="mt-0.5 h-9 w-9 rounded-xl bg-emerald-500/12 ring-1 ring-emerald-500/15 dark:bg-white/5 dark:ring-white/10" />
                        <div class="min-w-0">
                          <div :class="ddTitle">Los más vendidos</div>
                          <div :class="ddDesc">Ir a la sección en inicio</div>
                        </div>
                        <svg viewBox="0 0 24 24" class="ml-auto h-4 w-4 fill-slate-400 group-hover:fill-slate-600 dark:fill-slate-400" aria-hidden="true">
                          <path d="M9 18l6-6-6-6-1.4 1.4L12.2 12l-4.6 4.6L9 18z" />
                        </svg>
                      </button>

                      <!-- Todos los productos (link) -->
                      <Link
                        href="/productos"
                        class="group flex items-start gap-3 rounded-xl px-3 py-3 transition
                               hover:bg-slate-100/70 dark:hover:bg-white/5"
                        @click="closeAllDropdowns"
                      >
                        <div class="mt-0.5 h-9 w-9 rounded-xl bg-blue-500/12 ring-1 ring-blue-500/15 dark:bg-white/5 dark:ring-white/10" />
                        <div class="min-w-0">
                          <div :class="ddTitle">Todos los productos</div>
                          <div :class="ddDesc">Ver catálogo completo</div>
                        </div>
                        <svg viewBox="0 0 24 24" class="ml-auto h-4 w-4 fill-slate-400 group-hover:fill-slate-600 dark:fill-slate-400" aria-hidden="true">
                          <path d="M9 18l6-6-6-6-1.4 1.4L12.2 12l-4.6 4.6L9 18z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </transition>
            </div>

            <!-- CTAs -->
            <div class="ml-2 flex items-center gap-2">
              <Link href="/login" :class="btnSoft">Iniciar sesión</Link>
              <Link href="/register" :class="btnPrimary">Registrarse</Link>
            </div>
          </nav>

          <!-- Mobile: Logo | Login | Hamburguesa -->
          <div class="flex items-center gap-2 md:hidden">
            <Link href="/login" :class="btnSoft">
              Iniciar sesión
            </Link>

            <button
              type="button"
              class="inline-flex h-10 w-10 items-center justify-center rounded-full
                     border border-white/25 bg-white/35 backdrop-blur transition
                     hover:bg-white/55 dark:border-white/12 dark:bg-white/8 dark:hover:bg-white/12
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              @click="open = true"
              aria-label="Abrir menú"
            >
              <svg viewBox="0 0 24 24" class="h-5 w-5 fill-slate-900 dark:fill-white" aria-hidden="true">
                <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ MOBILE SHEET -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="open" class="fixed inset-0 z-[70] md:hidden">
        <!-- overlay -->
        <button
          type="button"
          class="absolute inset-0 bg-slate-950/45 backdrop-blur-[2px]"
          aria-label="Cerrar menú"
          @click="closeMobile"
        />

        <!-- panel -->
        <transition
          enter-active-class="transition duration-250 ease-out"
          enter-from-class="translate-x-full"
          enter-to-class="translate-x-0"
          leave-active-class="transition duration-200 ease-in"
          leave-from-class="translate-x-0"
          leave-to-class="translate-x-full"
        >
          <aside
            class="absolute right-0 top-0 h-full w-[86%] max-w-[380px]
                   border-l border-white/10 bg-white/90 shadow-2xl backdrop-blur-xl
                   dark:bg-neutral-950/90 dark:border-white/10"
            role="dialog"
            aria-modal="true"
          >
            <div class="flex items-center justify-between px-5 py-4">
              <div class="flex items-center gap-3">
                <img :src="props.logoSrc" alt="RSA" class="h-8 w-14 object-contain" />
                <div class="text-sm font-semibold text-slate-950 dark:text-white">Menú</div>
              </div>

              <button
                type="button"
                class="inline-flex h-10 w-10 items-center justify-center rounded-full
                       border border-slate-200 bg-white/70 text-slate-900
                       hover:bg-white transition
                       dark:border-neutral-800 dark:bg-white/8 dark:text-white dark:hover:bg-white/12"
                aria-label="Cerrar"
                @click="closeMobile"
              >
                <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current" aria-hidden="true">
                  <path
                    d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L12 13.41l-4.89 6.3-1.42-1.42L10.59 12 4.29 5.71 5.71 4.29 12 10.59l6.29-6.3 1.42 1.42z"
                  />
                </svg>
              </button>
            </div>

            <div class="px-5 pb-6">
              <div class="rounded-2xl border border-slate-200 bg-white/70 p-2 dark:border-neutral-800 dark:bg-white/5">
                <nav class="flex flex-col">
                  <!-- Servicios (collapsible con imágenes) -->
                  <button
                    type="button"
                    class="flex items-center justify-between rounded-xl px-4 py-3 text-left
                           text-sm font-semibold text-slate-900 hover:bg-slate-100/80 transition
                           dark:text-white dark:hover:bg-white/10"
                    @click="mobileServiciosOpen = !mobileServiciosOpen"
                  >
                    <span>Servicios</span>
                    <svg viewBox="0 0 24 24" class="h-4 w-4 fill-slate-400 dark:fill-slate-300 transition" :class="mobileServiciosOpen ? 'rotate-180' : ''">
                      <path d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </button>

                  <transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="mobileServiciosOpen" class="px-2 pb-2">
                      <button
                        type="button"
                        class="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-900 hover:bg-slate-100/80 transition dark:text-white dark:hover:bg-white/10"
                        @click="go('servicios')"
                      >
                        Ver todos (inicio)
                      </button>

                      <Link
                        v-for="s in serviceItems"
                        :key="s.href"
                        :href="s.href"
                        class="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-slate-100/80
                               dark:hover:bg-white/10"
                        @click="closeMobile"
                      >
                        <div class="h-10 w-10 overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10">
                          <img :src="s.image" alt="" class="h-full w-full object-cover" />
                        </div>
                        <div class="min-w-0">
                          <div class="text-sm font-semibold text-slate-900 dark:text-white truncate">{{ s.label }}</div>
                          <div class="text-xs text-slate-500 dark:text-slate-300 truncate">{{ s.desc }}</div>
                        </div>
                      </Link>
                    </div>
                  </transition>

                  <!-- Links normales (sin productos) -->
                  <button
                    v-for="l in otherLinks"
                    :key="l.id"
                    type="button"
                    class="flex items-center justify-between rounded-xl px-4 py-3 text-left
                           text-sm font-semibold text-slate-900 hover:bg-slate-100/80 transition
                           dark:text-white dark:hover:bg-white/10"
                    @click="go(l.id)"
                  >
                    <span>{{ l.label }}</span>
                    <svg viewBox="0 0 24 24" class="h-4 w-4 fill-slate-400 dark:fill-slate-300" aria-hidden="true">
                      <path d="M9 18l6-6-6-6-1.4 1.4L12.2 12l-4.6 4.6L9 18z" />
                    </svg>
                  </button>

                  <!-- Productos (collapsible) -->
                  <button
                    type="button"
                    class="flex items-center justify-between rounded-xl px-4 py-3 text-left
                           text-sm font-semibold text-slate-900 hover:bg-slate-100/80 transition
                           dark:text-white dark:hover:bg-white/10"
                    @click="mobileProductosOpen = !mobileProductosOpen"
                  >
                    <span>Productos</span>
                    <svg viewBox="0 0 24 24" class="h-4 w-4 fill-slate-400 dark:fill-slate-300 transition" :class="mobileProductosOpen ? 'rotate-180' : ''">
                      <path d="M7 10l5 5 5-5H7z" />
                    </svg>
                  </button>

                  <transition
                    enter-active-class="transition duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1"
                    enter-to-class="opacity-100 translate-y-0"
                    leave-active-class="transition duration-150 ease-in"
                    leave-from-class="opacity-100 translate-y-0"
                    leave-to-class="opacity-0 -translate-y-1"
                  >
                    <div v-if="mobileProductosOpen" class="px-2 pb-2">
                      <button
                        type="button"
                        class="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-900 hover:bg-slate-100/80 transition dark:text-white dark:hover:bg-white/10"
                        @click="go('productos')"
                      >
                        Los más vendidos (inicio)
                      </button>

                      <Link
                        href="/productos"
                        class="block rounded-xl px-3 py-2 text-left text-sm font-semibold text-slate-900 hover:bg-slate-100/80 transition
                               dark:text-white dark:hover:bg-white/10"
                        @click="closeMobile"
                      >
                        Todos los productos
                      </Link>
                    </div>
                  </transition>
                </nav>
              </div>

              <div class="mt-4">
                <Link href="/register" :class="btnPrimary" @click="closeMobile">
                  Registrarse
                </Link>
              </div>

              <div class="mt-4 text-xs text-slate-600 dark:text-slate-300">
                Seguridad, control y soporte con enfoque preventivo.
              </div>
            </div>
          </aside>
        </transition>
      </div>
    </transition>
  </header>
</template>
