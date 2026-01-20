<script setup lang="ts">
    import { Head, Link, router } from '@inertiajs/vue3'
    import { computed, ref, watch } from 'vue'
    import PublicLayout from '@/layouts/PublicLayout.vue'
    
    type MarcaLite = { id: number; nombre: string }
    type CategoriaLite = { id: number; nombre: string }
    
    type ProductoMedia = {
      id: number
      url: string
      tipo: 'imagen' | 'video'
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
    
    // -------------------- state --------------------
    const q = ref(props.filters?.q ?? '')
    const marcaId = ref(props.filters?.marca_id ?? '')
    const categoriaId = ref(props.filters?.categoria_id ?? '')
    
    const marcas = computed(() => props.meta?.marcas?.data ?? [])
    const categorias = computed(() => props.meta?.categorias?.data ?? [])
    const productos = computed(() => props.items?.data ?? [])
    
    const activeMarca = computed(() => (marcaId.value ? String(marcaId.value) : ''))
    const activeCategoria = computed(() => (categoriaId.value ? String(categoriaId.value) : ''))
    
    // -------------------- debounce filters --------------------
    let t: number | null = null
    watch([q, marcaId, categoriaId], () => {
      if (t) window.clearTimeout(t)
      t = window.setTimeout(() => {
        router.get(
          '/catalogo',
          {
            q: q.value || undefined,
            marca_id: marcaId.value || undefined,
            categoria_id: categoriaId.value || undefined,
          },
          { preserveScroll: true, preserveState: true, replace: true }
        )
      }, 320)
    })
    
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
    
    function firstImage(p: Producto) {
      const medias = (p.medias ?? []).filter((m) => m.status === 'activo' && m.tipo === 'imagen')
      if (!medias.length) return '/img/placeholder-product.png'
      const main = medias.find((m) => m.principal) ?? medias.sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))[0]
      return main.url.startsWith('http') ? main.url : `/storage/${main.url}`
    }
    
    function money(v: any) {
      const n = Number(v)
      if (!Number.isFinite(n)) return null
      return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
    }
    
    const hasNext = computed(() => !!props.items?.links?.next)
    function loadMore() {
      if (!props.items?.links?.next) return
      router.get(props.items.links.next, {}, { preserveScroll: true, preserveState: true, replace: true })
    }
    </script>
    
    <template>
      <Head title="Catálogo | RSA" />
    
      <PublicLayout>
        <!-- Espacio para navbar -->
        <section class="relative w-full pt-24 sm:pt-28">
          <!-- Fondo elegante -->
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
    
          <div class="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div class="min-w-0">
                <h1 class="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-4xl">
                  Catálogo para cotización
                </h1>
              </div>
    
              <div class="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  class="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-900
                         transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
                         dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900/60 dark:focus-visible:ring-sky-400/40"
                  @click="clearFilters"
                >
                  Limpiar filtros
                </button>
    
                <Link
                  href="/"
                  class="inline-flex h-10 items-center justify-center rounded-xl bg-blue-950 px-4 text-sm font-semibold text-white
                         transition hover:bg-blue-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                >
                  Volver
                </Link>
              </div>
            </div>
    
            <!-- Panel filtros (estilo 2da imagen) -->
            <div
              class="mt-8 rounded-3xl border border-slate-200/80 bg-white/70 p-5 backdrop-blur-xl
                     shadow-[0_18px_60px_-40px_rgba(2,6,23,0.22)]
                     dark:border-neutral-800/70 dark:bg-neutral-950/70"
            >
              <!-- fila 1: search + categoría select (si lo quieres) -->
              <div class="grid gap-4 lg:grid-cols-12">
                <!-- Search -->
                <div class="lg:col-span-8">
                  <label class="text-xs font-semibold text-slate-700 dark:text-slate-200" for="q">
                    Buscar
                  </label>
                  <div class="relative mt-2">
                    <span
                      class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                      aria-hidden="true"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="opacity-90">
                        <path
                          d="M21 21l-4.3-4.3m1.8-5.2a7 7 0 11-14 0 7 7 0 0114 0z"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                        />
                      </svg>
                    </span>
                    <input
                      id="q"
                      v-model="q"
                      type="search"
                      placeholder="Buscar por SKU o nombre..."
                      class="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none
                             transition focus:border-blue-300 focus:ring-2 focus:ring-blue-200
                             dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                    />
                  </div>
                </div>
    
                <!-- Categoría select (opcional, complementa chips) -->
                <div class="lg:col-span-4">
                  <label class="text-xs font-semibold text-slate-700 dark:text-slate-200" for="cat">
                    Categoría
                  </label>
                  <select
                    id="cat"
                    v-model="categoriaId"
                    class="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none
                           transition focus:border-blue-300 focus:ring-2 focus:ring-blue-200
                           dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:focus:border-sky-400 dark:focus:ring-sky-400/20"
                  >
                    <option value="">Todas</option>
                    <option v-for="c in categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                  </select>
                </div>
              </div>
    
              <!-- fila 2: chips categorías -->
              <div class="mt-4">
                <div class="flex flex-wrap gap-2">
                  <button
                    type="button"
                    class="rounded-full px-4 py-2 text-xs font-semibold transition
                           border border-slate-200 bg-white text-slate-800 hover:bg-slate-50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
                           dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-100 dark:hover:bg-neutral-900/60 dark:focus-visible:ring-sky-400/40"
                    :class="activeCategoria === '' ? 'ring-2 ring-blue-200 dark:ring-sky-400/30' : ''"
                    @click="setCategoria('')"
                  >
                    Todas
                  </button>
    
                  <button
                    v-for="c in categorias"
                    :key="c.id"
                    type="button"
                    class="rounded-full px-4 py-2 text-xs font-semibold transition
                           border border-slate-200 bg-white text-slate-800 hover:bg-slate-50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
                           dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-100 dark:hover:bg-neutral-900/60 dark:focus-visible:ring-sky-400/40"
                    :class="activeCategoria === String(c.id) ? 'ring-2 ring-blue-200 dark:ring-sky-400/30' : ''"
                    @click="setCategoria(c.id)"
                  >
                    {{ c.nombre }}
                  </button>
                </div>
              </div>
    
              <!-- fila 3: marcas como botones (lo que pediste) -->
              <div class="mt-5 border-t border-slate-200/70 pt-5 dark:border-neutral-800/70">
                <div class="flex items-center justify-between gap-3">
                  <p class="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                    Marcas
                  </p>
                  <button
                    type="button"
                    class="text-xs font-semibold text-slate-700 underline-offset-4 hover:underline
                           dark:text-slate-200"
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
                    class="group inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition
                           border border-slate-200 bg-white text-slate-800 hover:bg-slate-50
                           focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
                           dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-100 dark:hover:bg-neutral-900/60 dark:focus-visible:ring-sky-400/40"
                    :class="activeMarca === String(m.id) ? 'ring-2 ring-blue-200 dark:ring-sky-400/30' : ''"
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
    
            <!-- Grid productos -->
            <div class="mt-8">
              <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <article
                  v-for="p in productos"
                  :key="p.id"
                  class="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm
                         transition-all duration-300 ease-out hover:-translate-y-[2px]
                         hover:shadow-[0_18px_55px_-35px_rgba(2,6,23,0.35)]
                         dark:border-neutral-800 dark:bg-neutral-950"
                >
                  <!-- media -->
                  <div class="relative h-44 w-full bg-slate-100/40 dark:bg-neutral-900/40">
                    <img :src="firstImage(p)" alt="" class="h-full w-full object-cover" />
                    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
    
                    <!-- badges top -->
                    <div class="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span
                        v-if="p.categoria?.nombre"
                        class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur"
                      >
                        {{ p.categoria.nombre }}
                      </span>
                      <span
                        v-if="p.marca?.nombre"
                        class="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur"
                      >
                        {{ p.marca.nombre }}
                      </span>
                    </div>
    
                    <!-- hover overlay hint -->
                    <div
                      class="absolute bottom-3 left-4 right-4 flex items-center justify-between gap-2
                             opacity-0 transition group-hover:opacity-100"
                    >
                      <span class="text-xs font-semibold text-white/90">Vista rápida</span>
                      <span class="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
                        {{ p.sku ? `SKU: ${p.sku}` : 'SKU: —' }}
                      </span>
                    </div>
                  </div>
    
                  <!-- content -->
                  <div class="p-5">
                    <h3 class="truncate text-base font-semibold text-slate-950 dark:text-white" :title="p.nombre">
                      {{ p.nombre }}
                    </h3>
    
                    <p v-if="p.descripcion" class="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                      {{ p.descripcion }}
                    </p>
                    <p v-else class="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Sin descripción.
                    </p>
    
                    <div class="mt-4 flex items-end justify-between gap-3">
                      <div class="text-sm">
                        <div v-if="money(p.precio_venta)" class="font-semibold text-slate-950 dark:text-white">
                          {{ money(p.precio_venta) }}
                        </div>
                        <div v-else class="text-slate-500 dark:text-slate-400">Precio por cotización</div>
    
                        <div class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          <span v-if="p.stock != null">Stock: {{ p.stock }}</span>
                          <span v-else>Stock: —</span>
                        </div>
                      </div>
    
                      <!-- CTA (placeholder) -->
                      <button
                        type="button"
                        disabled
                        class="inline-flex h-10 items-center justify-center rounded-xl bg-blue-950 px-4 text-xs font-semibold text-white
                               opacity-70 cursor-not-allowed
                               transition group-hover:opacity-80"
                        title="Función en construcción"
                      >
                        Agregar a cotización
                      </button>
                    </div>
                  </div>
                </article>
              </div>
    
              <!-- Empty state -->
              <div
                v-if="!productos.length"
                class="mt-10 rounded-3xl border border-slate-200 bg-white p-8 text-center text-slate-700
                       dark:border-neutral-800 dark:bg-neutral-950 dark:text-slate-200"
              >
                No se encontraron productos con esos filtros.
              </div>
    
              <!-- Load more -->
              <div v-if="hasNext" class="mt-10 flex justify-center">
                <button
                  type="button"
                  class="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-900
                         transition hover:bg-slate-50
                         focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
                         dark:border-neutral-800 dark:bg-neutral-950 dark:text-white dark:hover:bg-neutral-900/60 dark:focus-visible:ring-sky-400/40"
                  @click="loadMore"
                >
                  Cargar más
                </button>
              </div>
            </div>
          </div>
        </section>
      </PublicLayout>
    </template>
    
    <style scoped>
    /* line-clamp fallback si no tienes plugin */
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    </style>
    