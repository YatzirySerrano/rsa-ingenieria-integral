<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { X, Package, Tag, Boxes, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import type { ProductDetailItem } from '@/types/product-detail.ts'

const props = defineProps<{
  open: boolean
  product: ProductDetailItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'add-to-cart', product: ProductDetailItem): void
}>()

const currentIndex = ref(0)

function close() {
  emit('close')
}

function addToCart() {
  if (!props.product) return
  emit('add-to-cart', props.product)
}

function money(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return 'Precio por cotización'
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function normalizeStorageUrl(url?: string | null): string {
  if (!url) return 'https://via.placeholder.com/800x600?text=Sin+imagen'
  if (url.startsWith('http')) return url
  if (url.startsWith('/storage/')) return url
  const clean = url.replace(/^storage\//, '').replace(/^\/storage\//, '')
  return `/storage/${clean}`
}

const images = computed(() => {
  const medias = (props.product?.medias ?? [])
    .filter((m) => (m.status ?? 'activo') === 'activo' && (m.tipo ?? 'imagen') === 'imagen')
    .sort((a, b) => {
      if (!!a.principal !== !!b.principal) return a.principal ? -1 : 1
      return (a.orden ?? 9999) - (b.orden ?? 9999)
    })

  if (!medias.length) return ['/img/placeholder-product.png']
  return medias.map((m) => normalizeStorageUrl(m.url))
})

const currentImage = computed(() => images.value[currentIndex.value] ?? '/img/placeholder-product.png')

function prevImage() {
  if (!images.value.length) return
  currentIndex.value = currentIndex.value === 0 ? images.value.length - 1 : currentIndex.value - 1
}

function nextImage() {
  if (!images.value.length) return
  currentIndex.value = currentIndex.value === images.value.length - 1 ? 0 : currentIndex.value + 1
}

function setImage(i: number) {
  currentIndex.value = i
}

watch(
  () => props.open,
  (v) => {
    document.documentElement.classList.toggle('overflow-hidden', v)
    if (v) currentIndex.value = 0
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
        v-if="open && product"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4"
      >
        <div
          class="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
          @click="close"
        />

        <div
          class="relative w-full max-w-4xl overflow-hidden rounded-[28px]
                 border border-slate-200/80 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,.35)]
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

          <div class="grid max-h-[88vh] grid-cols-1 overflow-y-auto lg:grid-cols-[0.9fr_1.1fr]">
            <div class="border-b border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-neutral-900 lg:border-b-0 lg:border-r">
              <div class="mx-auto max-w-md">
                <div class="relative overflow-hidden rounded-3xl border border-slate-200 bg-white dark:border-white/10 dark:bg-neutral-950">
                  <div class="aspect-[4/3] w-full">
                    <img
                      :src="currentImage"
                      :alt="product.nombre"
                      class="h-full w-full object-cover"
                    />
                  </div>

                  <button
                    v-if="images.length > 1"
                    type="button"
                    class="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full
                           bg-white/90 text-slate-900 shadow-md ring-1 ring-black/5 transition hover:scale-[1.03]
                           dark:bg-neutral-900/90 dark:text-white dark:ring-white/10"
                    @click="prevImage"
                  >
                    <ChevronLeft class="h-5 w-5" />
                  </button>

                  <button
                    v-if="images.length > 1"
                    type="button"
                    class="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full
                           bg-white/90 text-slate-900 shadow-md ring-1 ring-black/5 transition hover:scale-[1.03]
                           dark:bg-neutral-900/90 dark:text-white dark:ring-white/10"
                    @click="nextImage"
                  >
                    <ChevronRight class="h-5 w-5" />
                  </button>
                </div>

                <div
                  v-if="images.length > 1"
                  class="mt-3 grid grid-cols-4 gap-2 sm:grid-cols-5"
                >
                  <button
                    v-for="(img, i) in images.slice(0, 10)"
                    :key="`${product.id}-${i}`"
                    type="button"
                    class="overflow-hidden rounded-2xl border bg-white transition-all duration-200 dark:bg-neutral-950"
                    :class="i === currentIndex
                      ? 'border-sky-500 ring-2 ring-sky-500/20'
                      : 'border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20'"
                    @click="setImage(i)"
                  >
                    <div class="aspect-square">
                      <img :src="img" :alt="`${product.nombre} ${i + 1}`" class="h-full w-full object-cover" />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div class="p-5 sm:p-7">
              <div class="mb-4 flex flex-wrap gap-2">
                <span
                  class="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-xs font-black text-sky-700 ring-1 ring-sky-100
                         dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/20"
                >
                  {{ money(product.precio_venta) }}
                </span>

                <span
                  class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200
                         dark:bg-white/5 dark:text-slate-200 dark:ring-white/10"
                >
                  SKU: {{ product.sku || '—' }}
                </span>
              </div>

              <h2 class="text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {{ product.nombre }}
              </h2>

              <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <div class="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <Tag class="h-4 w-4" />
                    Marca
                  </div>
                  <p class="text-sm font-extrabold text-slate-900 dark:text-white">
                    {{ product.marca?.nombre ?? '—' }}
                  </p>
                </div>

                <div class="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 dark:border-white/10 dark:bg-white/5">
                  <div class="mb-1 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    <Boxes class="h-4 w-4" />
                    Categoría
                  </div>
                  <p class="text-sm font-extrabold text-slate-900 dark:text-white">
                    {{ product.categoria?.nombre ?? '—' }}
                  </p>
                </div>
              </div>

              <div class="mt-5 rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <div class="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <Package class="h-4 w-4" />
                  Descripción
                </div>

                <p class="text-sm leading-6 text-slate-700 dark:text-slate-300">
                  {{ product.descripcion?.trim() || 'Este producto no tiene descripción disponible por el momento.' }}
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
                  Agregar al carrito
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
      </div>
    </Transition>
  </Teleport>
</template>
