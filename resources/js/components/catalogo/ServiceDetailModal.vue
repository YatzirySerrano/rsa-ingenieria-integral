<script setup lang="ts">
import { watch } from 'vue'
import {
  X,
  Wrench,
  ShoppingCart,
  FileText,
  BadgeDollarSign,
} from 'lucide-vue-next'
import type { ServiceDetailItem } from '@/types/service-detail'

const props = defineProps<{
  open: boolean
  service: ServiceDetailItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add-to-cart', service: ServiceDetailItem): void
}>()

function close() {
  emit('close')
}

function addToCart() {
  if (!props.service) return
  emit('add-to-cart', props.service)
}

function money(v: unknown) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 'Precio por cotización'
  return n.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
  })
}

watch(
  () => props.open,
  (v) => {
    document.documentElement.classList.toggle('overflow-hidden', v)
  }
)
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open && service"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
      >
        <div
          class="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
          @click="close"
        />

        <div
          class="relative w-full max-w-3xl overflow-hidden rounded-[28px]
                 border border-slate-200/80 bg-white
                 shadow-[0_24px_80px_-24px_rgba(15,23,42,.35)]
                 dark:border-white/10 dark:bg-neutral-950"
        >
          <button
            type="button"
            class="absolute right-3 top-3 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full
                   bg-white/90 text-slate-900 shadow-md ring-1 ring-black/5 transition hover:scale-[1.03]
                   dark:bg-neutral-900/90 dark:text-white dark:ring-white/10"
            @click="close"
          >
            <X class="h-5 w-5" />
          </button>

          <div class="max-h-[88vh] overflow-y-auto p-5 sm:p-7">
            <div class="pr-12">
              <div class="mb-4 flex flex-wrap gap-2">
                <span
                  class="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-100
                         dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20"
                >
                  <BadgeDollarSign class="mr-1 h-4 w-4" />
                  {{ money(service.precio) }}
                </span>

                <span
                  class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200
                         dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"
                >
                  Servicio
                </span>
              </div>

              <h2 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {{ service.nombre }}
              </h2>

              <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Información general del servicio seleccionado.
              </p>
            </div>

            <div class="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
              <div class="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <FileText class="h-4 w-4" />
                Descripción
              </div>

              <p class="whitespace-pre-line text-sm leading-6 text-slate-700 dark:text-slate-300">
                {{ service.descripcion?.trim() || 'Este servicio no tiene descripción disponible por el momento.' }}
              </p>
            </div>

            <div
              class="mt-5 overflow-hidden rounded-3xl border border-slate-200
                     bg-gradient-to-br from-sky-50 via-white to-indigo-50
                     p-5 dark:border-white/10 dark:from-sky-500/10 dark:via-neutral-950 dark:to-indigo-500/10"
            >
              <div class="flex items-start gap-4">
                <div
                  class="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl
                         bg-white text-sky-700 shadow-sm ring-1 ring-slate-200
                         dark:bg-white/10 dark:text-sky-300 dark:ring-white/10"
                >
                  <Wrench class="h-7 w-7" />
                </div>

                <div>
                  <h3 class="text-lg font-black text-slate-950 dark:text-white">
                    Servicio listo para cotizar o agregar
                  </h3>

                  <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Puedes agregar este servicio a tu solicitud actual para integrarlo en tu cotización.
                  </p>
                </div>
              </div>
            </div>

            <div class="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
              <p class="text-xs leading-5 text-slate-500 dark:text-slate-400">
                El precio mostrado corresponde al precio base del servicio. Recomendamos una visita técnica para evaluar el sitio y brindarle una cotización más precisa según sus necesidades.
              </p>
            </div>

            <div class="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                class="inline-flex h-12 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold text-white
                       bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600
                       shadow-[0_14px_40px_-20px_rgba(37,99,235,.65)]
                       transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_55px_-22px_rgba(37,99,235,.85)]"
                @click="addToCart"
              >
                <ShoppingCart class="h-4 w-4" />
                Agregar servicio
              </button>

              <button
                type="button"
                class="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-extrabold text-slate-900
                       transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md
                       dark:border-white/10 dark:bg-white/5 dark:text-white"
                @click="close"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>