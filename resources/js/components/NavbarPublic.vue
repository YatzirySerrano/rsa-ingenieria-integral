<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
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

const open = ref(false)

function go(id: string) {
  open.value = false
  props.onNav(id)
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') open.value = false
}

// Scroll lock (evita que el fondo se mueva cuando el menú está abierto)
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

/** =========
 *  Estilos base (siempre “scrolled”)
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
            <button
              v-for="l in props.links"
              :key="l.id"
              type="button"
              :class="[itemBase, underline]"
              @click="go(l.id)"
            >
              {{ l.label }}
            </button>

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

    <!-- ✅ MOBILE SHEET (overlay + panel) -->
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
          @click="open = false"
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
            class="absolute right-0 top-0 h-full w-[86%] max-w-[360px]
                   border-l border-white/10 bg-white/85 shadow-2xl backdrop-blur-xl
                   dark:bg-neutral-950/85 dark:border-white/10"
            role="dialog"
            aria-modal="true"
          >
            <!-- header sheet -->
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
                @click="open = false"
              >
                <svg viewBox="0 0 24 24" class="h-5 w-5 fill-current" aria-hidden="true">
                  <path
                    d="M18.3 5.71L12 12l6.3 6.29-1.41 1.42L12 13.41l-4.89 6.3-1.42-1.42L10.59 12 4.29 5.71 5.71 4.29 12 10.59l6.29-6.3 1.42 1.42z"
                  />
                </svg>
              </button>
            </div>

            <!-- content -->
            <div class="px-5 pb-6">
              <div class="rounded-2xl border border-slate-200 bg-white/70 p-2 dark:border-neutral-800 dark:bg-white/5">
                <nav class="flex flex-col">
                  <button
                    v-for="l in props.links"
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
                </nav>
              </div>

              <!-- CTA abajo -->
              <div class="mt-4">
                <Link href="/register" :class="btnPrimary" @click="open = false">
                  Registrarse
                </Link>
              </div>

              <!-- Nota rápida (opcional, da sensación premium) -->
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
