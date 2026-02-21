<script setup lang="ts">
import { Head, Link, router } from '@inertiajs/vue3'
import { computed, ref, watch } from 'vue'
import PublicLayout from '@/layouts/PublicLayout.vue'
import * as CotizarRoutes from '@/routes/cotizar'
import { Search, SlidersHorizontal, ArrowRight, Loader2, X } from 'lucide-vue-next'

const COTIZAR_URL = urlFrom(CotizarRoutes as any, ['create', 'cotizarCreate'], '/cotizar')

function urlFrom(mod: any, keys: string[], fallback: string) {
  for (const k of keys) {
    const fn = mod?.[k]
    if (typeof fn === 'function') {
      try {
        const r = fn()
        const url = r?.url ?? r?.href
        if (url) return String(url)
      } catch {
        // noop
      }
    }
  }
  return fallback
}

type MarcaLite = { id: number; nombre: string }
type CategoriaLite = { id: number; nombre: string }

type ProductoMedia = {
  id: number
  url: string
  tipo?: 'imagen' | 'video'
  principal: boolean
  orden: number
  status: 'activo' | 'inactivo'
}

type Producto = {
  id: number
  sku?: string | null
  nombre: string
  descripcion?: string | null
  stock?: number | null
  costo_lista?: string | number | null
  precio_venta?: string | number | null
  status: 'activo' | 'inactivo'
  marca?: { id: number; nombre: string } | null
  categoria?: { id: number; nombre: string } | null
  medias?: ProductoMedia[]
}

type ResourceCollection<T> = {
  data: T[]
  meta?: any
  links?: any
}

const props = defineProps<{
  items: ResourceCollection<Producto>
  filters: { q?: string; marca_id?: string | number | null; categoria_id?: string | number | null }
  meta: { marcas: ResourceCollection<MarcaLite>; categorias: ResourceCollection<CategoriaLite> }
}>()

const q = ref(String(props.filters?.q ?? ''))
const marcaId = ref<any>(props.filters?.marca_id ?? '')
const categoriaId = ref<any>(props.filters?.categoria_id ?? '')

const marcas = computed(() => props.meta?.marcas?.data ?? [])
const categorias = computed(() => props.meta?.categorias?.data ?? [])

const activeMarca = computed(() => (marcaId.value ? String(marcaId.value) : ''))
const activeCategoria = computed(() => (categoriaId.value ? String(categoriaId.value) : ''))

function normalizeStorageUrl(url: string): string {
  if (!url) return '/img/placeholder-product.png'
  if (url.startsWith('http')) return url
  if (url.startsWith('/storage/')) return url
  const clean = url.replace(/^storage\//, '').replace(/^\/storage\//, '')
  return `/storage/${clean}`
}

function firstImage(p: Producto) {
  const medias = (p.medias ?? []).filter((m) => m.status === 'activo' && (m.tipo ?? 'imagen') === 'imagen')
  if (!medias.length) return '/img/placeholder-product.png'
  const main =
    medias.find((m) => m.principal) ?? medias.slice().sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))[0]
  return normalizeStorageUrl(main.url)
}

function money(v: any) {
  const n = Number(v)
  if (!Number.isFinite(n)) return null
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function clearFilters() {
  q.value = ''
  marcaId.value = ''
  categoriaId.value = ''
}

function toggleMarca(id: number) {
  const v = String(id)
  marcaId.value = activeMarca.value === v ? '' : id
}

function setCategoria(id: number | '') {
  categoriaId.value = id === '' ? '' : id
}

const hasActiveFilters = computed(() => {
  const term = q.value.trim()
  return !!term || !!activeMarca.value || !!activeCategoria.value
})

// ----- debounce filters -----
let t: number | null = null
watch([q, marcaId, categoriaId], () => {
  if (t) window.clearTimeout(t)
  t = window.setTimeout(() => {
    router.get(
      '/catalogo',
      {
        q: q.value.trim() || undefined,
        marca_id: marcaId.value || undefined,
        categoria_id: categoriaId.value || undefined,
      },
      { preserveScroll: true, preserveState: true, replace: true }
    )
  }, 320)
})

// ----- Load more real (append) -----
const list = ref<Producto[]>(props.items?.data ?? [])
const nextUrl = computed<string | null>(() => {
  const l = props.items?.links
  if (!l) return null
  if (typeof l === 'object' && l.next) return String(l.next)
  if (Array.isArray(l)) {
    const n = l.find((x: any) => x?.rel === 'next' || x?.label === 'Next' || x?.label === 'Siguiente')
    return n?.url ? String(n.url) : null
  }
  return null
})
const hasNext = computed(() => !!nextUrl.value)
const loadingMore = ref(false)

watch(
  () => props.items,
  (v) => {
    const page = Number(v?.meta?.current_page ?? 1)
    if (page <= 1) {
      list.value = v?.data ?? []
      return
    }
    const incoming = v?.data ?? []
    const seen = new Set(list.value.map((x) => x.id))
    for (const it of incoming) if (!seen.has(it.id)) list.value.push(it)
  },
  { deep: true }
)

function loadMore() {
  if (!nextUrl.value || loadingMore.value) return
  loadingMore.value = true
  router.get(nextUrl.value, {}, { preserveScroll: true, preserveState: true, replace: true, onFinish: () => (loadingMore.value = false) })
}
</script>

<template>
  <Head title="Catálogo | RSA" />

  <PublicLayout>
    <section class="relative w-full pt-24 sm:pt-28">
      <!-- Background -->
      <div
        class="pointer-events-none absolute inset-0 -z-10
               bg-[radial-gradient(1100px_520px_at_10%_0%,rgba(14,165,233,0.10),transparent_55%)]
               dark:bg-[radial-gradient(1100px_520px_at_10%_0%,rgba(56,189,248,0.10),transparent_55%)]"
        aria-hidden="true"
      />
      <div
        class="pointer-events-none absolute inset-x-0 top-0 -z-10 h-72
               bg-gradient-to-b from-slate-50/80 via-transparent to-transparent
               dark:from-neutral-950/70"
        aria-hidden="true"
      />

      <div class="mx-auto w-full max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div class="min-w-0">
            <h1 class="text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Catálogo para cotización
            </h1>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Filtra rápido, revisa precios/stock y manda tu solicitud. Sin fricción.
            </p>
            <p class="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              Mostrando <span class="font-black text-slate-900 dark:text-white">{{ list.length }}</span> productos
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-extrabold text-slate-900
                     backdrop-blur transition-all duration-200
                     hover:-translate-y-0.5 hover:bg-white hover:shadow-md
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40
                     dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              @click="clearFilters"
              :disabled="!hasActiveFilters"
              :class="!hasActiveFilters ? 'opacity-60 cursor-not-allowed hover:translate-y-0 hover:shadow-none' : ''"
            >
              <X class="h-4 w-4" />
              Limpiar
            </button>

            <Link
              href="/"
              class="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 text-sm font-extrabold text-slate-900
                     backdrop-blur transition-all duration-200
                     hover:-translate-y-0.5 hover:bg-white hover:shadow-md
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40
                     dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            >
              Volver
            </Link>

            <Link
              :href="COTIZAR_URL"
              class="group relative inline-flex h-11 items-center justify-center gap-2 rounded-2xl px-5 text-sm font-extrabold tracking-tight text-white
                     bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600
                     shadow-[0_14px_40px_-20px_rgba(37,99,235,.65)]
                     ring-1 ring-white/15
                     transition-all duration-200
                     hover:-translate-y-0.5 hover:shadow-[0_18px_55px_-22px_rgba(37,99,235,.85)]
                     hover:ring-white/25
                     active:translate-y-0 active:scale-[.99]
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
            >
              <span
                class="absolute inset-0 rounded-2xl opacity-0 blur-xl
                       bg-gradient-to-r from-sky-500/40 via-blue-500/40 to-indigo-500/40
                       transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              <span
                class="absolute inset-0 rounded-2xl opacity-70
                       bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,.35),transparent_60%)]
                       transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              <span class="relative">Solicitar cotización</span>
              <ArrowRight class="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <!-- Filters -->
        <div
          class="mt-8 rounded-3xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-xl
                 shadow-[0_18px_60px_-40px_rgba(2,6,23,0.22)]
                 dark:border-white/10 dark:bg-neutral-950/70"
        >
          <div class="flex items-center gap-2">
            <div class="inline-flex h-9 items-center gap-2 rounded-2xl bg-slate-900/5 px-3 text-xs font-extrabold text-slate-700 dark:bg-white/5 dark:text-slate-200">
              <SlidersHorizontal class="h-4 w-4" />
              Filtros
            </div>

            <div v-if="hasActiveFilters" class="ml-auto text-xs font-semibold text-slate-500 dark:text-slate-400">
              Activos:
              <span v-if="q.trim()" class="font-black text-slate-900 dark:text-white"> búsqueda</span>
              <span v-if="activeCategoria" class="font-black text-slate-900 dark:text-white"> · categoría</span>
              <span v-if="activeMarca" class="font-black text-slate-900 dark:text-white"> · marca</span>
            </div>
          </div>

          <div class="mt-4 grid gap-4 lg:grid-cols-12">
            <!-- Search -->
            <div class="lg:col-span-7">
              <label class="text-xs font-extrabold text-slate-700 dark:text-slate-200" for="q">Buscar</label>
              <div class="relative mt-2">
                <span class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                  <Search class="h-4 w-4" />
                </span>
                <input
                  id="q"
                  v-model="q"
                  type="search"
                  placeholder="Buscar por SKU o nombre..."
                  class="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none
                         transition-all duration-200
                         focus:border-sky-300 focus:ring-2 focus:ring-sky-200
                         dark:border-white/10 dark:bg-neutral-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                />
              </div>
            </div>

            <!-- Category select -->
            <div class="lg:col-span-5">
              <label class="text-xs font-extrabold text-slate-700 dark:text-slate-200" for="cat">Categoría</label>
              <select
                id="cat"
                v-model="categoriaId"
                class="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none
                       transition-all duration-200
                       focus:border-sky-300 focus:ring-2 focus:ring-sky-200
                       dark:border-white/10 dark:bg-neutral-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
              >
                <option value="">Todas</option>
                <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
              </select>
            </div>
          </div>

          <!-- Category chips (desktop) -->
          <div class="mt-4 hidden lg:block">
            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200
                       border border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40
                       dark:border-white/10 dark:bg-neutral-950 dark:text-slate-100 dark:hover:bg-white/10"
                :class="activeCategoria === '' ? 'ring-2 ring-sky-200 dark:ring-sky-400/30' : ''"
                @click="setCategoria('')"
              >
                Todas
              </button>

              <button
                v-for="c in categorias"
                :key="c.id"
                type="button"
                class="rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200
                       border border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40
                       dark:border-white/10 dark:bg-neutral-950 dark:text-slate-100 dark:hover:bg-white/10"
                :class="activeCategoria === String(c.id) ? 'ring-2 ring-sky-200 dark:ring-sky-400/30' : ''"
                @click="setCategoria(c.id)"
              >
                {{ c.nombre }}
              </button>
            </div>
          </div>

          <!-- Brands -->
          <div class="mt-5 border-t border-slate-200/70 pt-5 dark:border-white/10">
            <div class="flex items-center justify-between gap-3">
              <p class="text-xs font-extrabold uppercase tracking-wide text-slate-600 dark:text-slate-300">Marcas</p>
              <button
                type="button"
                class="text-xs font-extrabold text-slate-700 underline-offset-4 hover:underline dark:text-slate-200"
                @click="marcaId = ''"
              >
                Ver todas
              </button>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <button
                v-for="m in marcas"
                :key="m.id"
                type="button"
                class="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-extrabold transition-all duration-200
                       border border-slate-200 bg-white text-slate-800 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40
                       dark:border-white/10 dark:bg-neutral-950 dark:text-slate-100 dark:hover:bg-white/10"
                :class="activeMarca === String(m.id) ? 'ring-2 ring-sky-200 dark:ring-sky-400/30' : ''"
                @click="toggleMarca(m.id)"
              >
                <span
                  class="h-2 w-2 rounded-full bg-slate-300 transition group-hover:bg-slate-400
                         dark:bg-slate-600 dark:group-hover:bg-slate-500"
                  aria-hidden="true"
                />
                {{ m.nombre }}
              </button>
            </div>
          </div>
        </div>

        <!-- Grid -->
        <div class="mt-8">
          <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <article
              v-for="p in list"
              :key="p.id"
              class="group overflow-hidden rounded-3xl border border-slate-200 bg-white/85 shadow-sm
                     transition-all duration-300 ease-out
                     hover:-translate-y-1 hover:shadow-[0_22px_70px_-42px_rgba(2,6,23,0.45)]
                     hover:ring-2 hover:ring-sky-500/10
                     dark:border-white/10 dark:bg-neutral-950/80"
            >
              <div class="relative aspect-[4/3] w-full overflow-hidden bg-slate-100/40 dark:bg-neutral-900/40">
                <img
                  :src="firstImage(p)"
                  alt=""
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  loading="lazy"
                  decoding="async"
                />
                <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />

                <!-- Pills -->
                <div class="absolute left-3 top-3 flex flex-wrap gap-2">
                  <span
                    v-if="p.categoria?.nombre"
                    class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur"
                  >
                    {{ p.categoria.nombre }}
                  </span>
                  <span
                    v-if="p.marca?.nombre"
                    class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur"
                  >
                    {{ p.marca.nombre }}
                  </span>
                </div>

                <div class="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-2">
                  <span
                    class="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur"
                  >
                    {{ p.sku ? `SKU: ${p.sku}` : 'SKU: —' }}
                  </span>

                  <span
                    class="inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-extrabold text-white backdrop-blur"
                  >
                    <span v-if="p.stock != null">Stock: {{ p.stock }}</span>
                    <span v-else>Stock: —</span>
                  </span>
                </div>

                <div class="absolute right-3 top-3">
                  <span
                    class="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-black text-slate-900 shadow-sm ring-1 ring-black/5
                           dark:bg-neutral-950/75 dark:text-white dark:ring-white/10"
                  >
                    {{ money(p.precio_venta) ?? 'Cotizar' }}
                  </span>
                </div>
              </div>

              <div class="p-5">
                <h3 class="text-base font-black text-slate-950 dark:text-white line-clamp-2" :title="p.nombre">
                  {{ p.nombre }}
                </h3>

                <p v-if="p.descripcion" class="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                  {{ p.descripcion }}
                </p>
                <p v-else class="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Sin descripción.
                </p>

                <div class="mt-4 flex items-center justify-between gap-3">
                  <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span class="font-black text-slate-900 dark:text-white">
                      {{ money(p.precio_venta) ?? 'Precio por cotización' }}
                    </span>
                  </div>

                  <Link
                    :href="COTIZAR_URL"
                    class="inline-flex h-10 items-center justify-center gap-2 rounded-2xl px-4 text-xs font-extrabold
                           bg-sky-600 text-white shadow-sm transition-all duration-200
                           hover:-translate-y-0.5 hover:bg-sky-500 hover:shadow-md
                           active:scale-[.99]"
                  >
                    Cotizar
                    <ArrowRight class="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </article>
          </div>

          <div
            v-if="!list.length"
            class="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-700
                   dark:border-white/10 dark:bg-neutral-950 dark:text-slate-200"
          >
            No se encontraron productos con esos filtros.
          </div>

          <div v-if="hasNext" class="mt-10 flex justify-center">
            <button
              type="button"
              class="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/80 px-6 text-sm font-extrabold text-slate-900
                     backdrop-blur transition-all duration-200
                     hover:-translate-y-0.5 hover:bg-white hover:shadow-md
                     focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/40
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
                     dark:border-white/10 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              @click="loadMore"
              :disabled="loadingMore"
            >
              <Loader2 v-if="loadingMore" class="h-4 w-4 animate-spin" />
              {{ loadingMore ? 'Cargando...' : 'Cargar más' }}
            </button>
          </div>
        </div>

        <!-- Sticky CTA (mobile) -->
        <div class="fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div class="mx-auto max-w-7xl px-4 pb-4">
            <div
              class="rounded-3xl border border-black/5 bg-white/85 p-3 shadow-lg backdrop-blur
                     dark:border-white/10 dark:bg-neutral-950/80"
            >
              <Link
                :href="COTIZAR_URL"
                class="group relative flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-extrabold text-white
                       bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600
                       shadow-[0_14px_40px_-20px_rgba(37,99,235,.65)]
                       ring-1 ring-white/15
                       transition-all duration-200
                       active:scale-[.99]
                       focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
              >
                <span class="relative">Solicitar cotización</span>
                <ArrowRight class="relative h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  </PublicLayout>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>