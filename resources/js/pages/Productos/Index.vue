<script setup lang="ts">
    
    import { Head } from '@inertiajs/vue3'
    import { computed, ref } from 'vue'
    
    import AppLayout from '@/layouts/AppLayout.vue'
    import PaginationLinks from '@/components/ui/PaginationLinks.vue'
    import { Button } from '@/components/ui/button'
    import { Input } from '@/components/ui/input'
    
    import ProductoMediaManager from '@/components/ProductoMediaManager.vue'
    
    import type { Paginated } from '@/types/common'
    import type { Producto, ProductoMedia, MarcaLite, CategoriaLite } from '@/composables/crud/useProductoCrud'
    import { useProductoCrud } from '@/composables/crud/useProductoCrud'
    
    import {
      Plus,
      Pencil,
      Power,
      RefreshCw,
      Search,
      Filter,
      Tag,
      Layers,
      Barcode,
      DollarSign,
      Package,
      Image as ImageIcon,
      X,
      Grid,
      List,
    } from 'lucide-vue-next'
    
    const props = defineProps<{
      items: Paginated<Producto>
      filters: Partial<{ q: string; status: string; marca_id: string; categoria_id: string }>
      meta: {
        statuses: string[]
        marcas: { data?: MarcaLite[] } | MarcaLite[]
        categorias: { data?: CategoriaLite[] } | CategoriaLite[]
      }
    }>()
    
    /*
      Importante:
      props.items viene de ProductoResource::collection($paginator)
      Por eso el total esta en props.items.meta.total (no en props.items.total).
    */
    const items = computed(() => props.items)
    const total = computed(() => items.value.meta?.total ?? items.value.data.length)
    
    const marcas = computed<MarcaLite[]>(() => {
      const v = props.meta.marcas
      return Array.isArray(v) ? v : v?.data || []
    })
    
    const categorias = computed<CategoriaLite[]>(() => {
      const v = props.meta.categorias
      return Array.isArray(v) ? v : v?.data || []
    })
    
    const crud = useProductoCrud({
      initialFilters: props.filters,
      baseUrl: '/productos',
    })
    
    /* UI */
    const showMediaModal = ref(false)
    const selectedProductForMedia = ref<Producto | null>(null)
    
    function openMediaModal(p: Producto) {
      selectedProductForMedia.value = p
      showMediaModal.value = true
    }
    function closeMediaModal() {
      showMediaModal.value = false
      selectedProductForMedia.value = null
    }
    
    function money(v: unknown): string {
      if (v === null || v === undefined || v === '') return '$0.00'
      const n = Number(v)
      if (!Number.isFinite(n)) return String(v)
      return n.toLocaleString('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    }
    
    function statusPill(status: string): string {
      return status === 'activo'
        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20'
        : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/20'
    }
    
    function rowDot(status: string): string {
      return status === 'activo' ? 'bg-emerald-500' : 'bg-rose-500'
    }
    
    function getStatusButtonClasses(status: string): string {
      return status === 'activo'
        ? 'bg-rose-600 hover:bg-rose-500 text-white'
        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
    }
    
    function getImageUrl(media: ProductoMedia): string {
      if (!media?.url) return ''
      if (media.url.startsWith('http')) return media.url
      return `/storage/${media.url.replace(/^storage\//, '')}`
    }
    
    /** SOLO activas */
    function getActiveMedias(producto: Producto): ProductoMedia[] {
      return (producto.medias || []).filter((m) => m.status === 'activo')
    }
    
    function getActiveMediaCount(producto: Producto): number {
      return getActiveMedias(producto).length
    }
    
    /** Principal (activa) o primera activa */
    function getFirstActiveImage(producto: Producto): string {
    const medias = getActiveMedias(producto)
    if (!medias.length) return ''
    const main = medias.find(m => m.principal)
        || medias.slice().sort((a,b) => (a.orden ?? 9999) - (b.orden ?? 9999))[0]
    return getImageUrl(main)
    }
</script>
    
<template>
      <Head title="Productos" />
    
      <AppLayout>
        <div class="px-4 py-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14">
          <!-- Header -->
          <div class="mb-6 lg:mb-8">
            <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
              <div class="space-y-1">
                <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
                  Productos
                </h1>
              </div>
    
              <div class="flex flex-wrap items-center gap-2 sm:gap-3">
    
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  class="gap-2 transition-all hover:shadow-md"
                  @click="crud.resetFilters"
                  :disabled="!crud.hasActiveFilters"
                >
                  <RefreshCw class="h-4 w-4" />
                  <span class="text-xs sm:text-sm font-semibold">Reiniciar</span>
                </Button>
    
                <Button
                  type="button"
                  size="sm"
                  class="gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white
                         hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/25
                         transition-all active:scale-[0.99]"
                  @click="crud.openForm({ marcas: marcas, categorias: categorias })"
                >
                  <Plus class="h-4 w-4" />
                  <span class="text-xs sm:text-sm font-extrabold">Nuevo</span>
                </Button>
              </div>
            </div>
          </div>
    
          <!-- Filtros -->
          <div class="mb-6 lg:mb-8">
            <div
              class="rounded-2xl lg:rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-zinc-950/50
                     p-4 sm:p-5 lg:p-6 shadow-xl shadow-slate-200/20 dark:shadow-black/20 backdrop-blur-sm
                     transition-all hover:shadow-2xl"
            >
              <div class="flex items-center justify-between mb-4 sm:mb-5">
                <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">
                  Filtros
                </h3>
                <Filter class="h-5 w-5 text-slate-400 dark:text-zinc-500" />
              </div>
    
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
                <div class="lg:col-span-4">
                  <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                    <Search class="h-4 w-4" />
                    Buscar
                  </label>
                  <div class="relative">
                    <Input
                      v-model="crud.filters.q"
                      placeholder="SKU o nombre..."
                      class="h-11 sm:h-12 pl-4 pr-11 text-sm sm:text-base border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                             focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
                    />
                    <div class="absolute inset-y-0 right-3 flex items-center">
                      <Search class="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-zinc-500" />
                    </div>
                  </div>
                </div>
    
                <div class="lg:col-span-3">
                  <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                    <Tag class="h-4 w-4" />
                    Marca
                  </label>
                  <select
                    v-model="crud.filters.marca_id"
                    class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base font-semibold
                           border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 rounded-xl
                           focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
                  >
                    <option :value="crud.ALL">Todas</option>
                    <option v-for="m in marcas" :key="m.id" :value="String(m.id)">{{ m.nombre }}</option>
                  </select>
                </div>
    
                <div class="lg:col-span-3">
                  <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                    <Layers class="h-4 w-4" />
                    Categoría
                  </label>
                  <select
                    v-model="crud.filters.categoria_id"
                    class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base font-semibold
                           border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 rounded-xl
                           focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
                  >
                    <option :value="crud.ALL">Todas</option>
                    <option v-for="c in categorias" :key="c.id" :value="String(c.id)">{{ c.nombre }}</option>
                  </select>
                </div>
    
                <div class="lg:col-span-2">
                  <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                    <Filter class="h-4 w-4" />
                    Estado
                  </label>
                  <select
                    v-model="crud.filters.status"
                    class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base font-semibold
                           border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 rounded-xl
                           focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
                  >
                    <option :value="crud.ALL">Todos</option>
                    <option v-for="s in props.meta.statuses" :key="s" :value="s">
                      {{ s.charAt(0).toUpperCase() + s.slice(1) }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Tabla (desktop) -->
          <div class="hidden 2xl:block">
            <div class="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950/40 overflow-hidden shadow-xl">
              <div
                class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10
                       bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950"
              >
                <div>
                  <h4 class="text-lg font-black text-slate-900 dark:text-zinc-100">Listado</h4>
                  <p class="text-sm text-slate-500 dark:text-zinc-500">
                    Mostrando {{ items.data.length }} de {{ total }} productos
                  </p>
                </div>
              </div>
    
              <div class="overflow-x-auto">
                <table class="w-full text-sm lg:text-base">
                  <thead class="bg-slate-100 dark:bg-white/5 sticky top-0 z-10">
                    <tr>
                      <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">ID</th>
                      <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">Imagen</th>
                      <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">SKU</th>
                      <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">Producto</th>
                      <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">Marca</th>
                      <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">Categoría</th>
                      <th class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">Stock</th>
                      <th class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">Costo</th>
                      <th class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">Venta</th>
                      <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">Estado</th>
                      <th class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">Acciones</th>
                    </tr>
                  </thead>
    
                  <tbody>
                    <tr
                      v-for="p in items.data"
                      :key="p.id"
                      class="border-t border-slate-100 dark:border-white/10
                             hover:bg-slate-50/80 dark:hover:bg-white/[0.03]
                             transition-colors"
                    >
                      <td class="px-6 py-4 text-sm font-semibold text-slate-500 dark:text-zinc-500">#{{ p.id }}</td>
    
                      <!-- Preview + count activas -->
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <div
                            class="relative h-12 w-12 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10
                                   bg-slate-100 dark:bg-zinc-800 shadow-sm"
                          >
                            <img
                              v-if="getFirstActiveImage(p)"
                              :src="getFirstActiveImage(p)"
                              :alt="`Imagen de ${p.nombre}`"
                              class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                              @error="(e: any) => { if (e?.target) e.target.style.display = 'none' }"
                            />
                            <div v-else class="w-full h-full flex items-center justify-center">
                              <ImageIcon class="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                            </div>
    
                            <div
                              v-if="getActiveMediaCount(p) > 0"
                              class="absolute -top-2 -right-2 bg-emerald-500 text-white text-[11px] font-black
                                     rounded-full h-6 w-6 flex items-center justify-center shadow-md"
                              :title="`${getActiveMediaCount(p)} imágenes activas`"
                            >
                              {{ getActiveMediaCount(p) }}
                            </div>
                          </div>
    
                          <div class="min-w-0">
                            <button
                              type="button"
                              class="text-xs font-extrabold text-emerald-700 dark:text-emerald-300 hover:underline"
                              @click.prevent="openMediaModal(p)"
                            >
                              Gestionar imágenes
                            </button>
                            <p class="text-[11px] text-slate-500 dark:text-zinc-500">
                              Cuenta solo activas
                            </p>
                          </div>
                        </div>
                      </td>
    
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <Barcode class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          <span class="font-extrabold text-slate-900 dark:text-zinc-100">{{ p.sku }}</span>
                        </div>
                      </td>
    
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-3">
                          <span class="h-3 w-3 rounded-full" :class="rowDot(p.status)" />
                          <div class="min-w-0">
                            <p class="truncate font-black text-slate-900 dark:text-zinc-100">
                              {{ p.nombre }}
                            </p>
                            <p v-if="p.descripcion" class="truncate text-xs text-slate-500 dark:text-zinc-500">
                              {{ p.descripcion }}
                            </p>
                          </div>
                        </div>
                      </td>
    
                      <td class="px-6 py-4 font-semibold text-slate-700 dark:text-zinc-200">
                        {{ p.marca?.nombre ?? '—' }}
                      </td>
    
                      <td class="px-6 py-4 font-semibold text-slate-700 dark:text-zinc-200">
                        {{ p.categoria?.nombre ?? '—' }}
                      </td>
    
                      <td class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">
                        <span class="inline-flex items-center gap-2 justify-end">
                          <Package class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          {{ p.stock }}
                        </span>
                      </td>
    
                      <td class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">
                        <span class="inline-flex items-center gap-1">
                          <DollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          {{ money(p.costo_lista) }}
                        </span>
                      </td>
    
                      <td class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">
                        <span class="inline-flex items-center gap-1">
                          <DollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          {{ money(p.precio_venta) }}
                        </span>
                      </td>
    
                      <td class="px-6 py-4">
                        <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold" :class="statusPill(p.status)">
                          {{ p.status.charAt(0).toUpperCase() + p.status.slice(1) }}
                        </span>
                      </td>
    
                      <td class="px-6 py-4 text-right">
                        <div class="inline-flex items-center gap-2 justify-end">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            class="gap-2 transition-all hover:shadow-md"
                            @click.prevent="openMediaModal(p)"
                          >
                            <ImageIcon class="h-4 w-4" />
                            <span class="font-extrabold">Imágenes</span>
                          </Button>
    
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            class="gap-2 transition-all hover:shadow-md"
                            @click.prevent="crud.openForm({ marcas: marcas, categorias: categorias }, p)"
                          >
                            <Pencil class="h-4 w-4" />
                            <span class="font-extrabold">Editar</span>
                          </Button>
    
                          <Button
                            type="button"
                            size="sm"
                            class="gap-2 transition-all active:scale-[0.99]"
                            :class="getStatusButtonClasses(p.status)"
                            @click.prevent="crud.toggleStatus(p)"
                          >
                            <Power class="h-4 w-4" />
                            <span class="font-extrabold">
                              {{ p.status === 'activo' ? 'Desactivar' : 'Activar' }}
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
    
                    <tr v-if="!items.data.length">
                      <td colspan="11" class="px-6 py-16 text-center text-slate-500 dark:text-zinc-500 font-semibold">
                        No se encontraron productos con los filtros actuales.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
    
              <div class="border-t border-slate-200 dark:border-white/10 px-6 py-4 bg-slate-50/50 dark:bg-white/5">
                <PaginationLinks :links="items.links" />
              </div>
            </div>
          </div>
    
          <!-- Cards (mobile/tablet) -->
          <div class="2xl:hidden">
            <div class="flex items-center justify-between mb-4">
              <h4 class="text-lg font-black text-slate-900 dark:text-zinc-100">
                Productos ({{ total }})
              </h4>
            </div>
    
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div
                v-for="p in items.data"
                :key="p.id"
                class="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-zinc-950/40
                       p-4 sm:p-5 shadow-lg transition-all hover:shadow-2xl hover:-translate-y-0.5"
              >
                <div class="flex items-start justify-between gap-4 mb-4">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2 mb-2">
                      <span class="text-xs font-bold text-slate-500 dark:text-zinc-500">#{{ p.id }}</span>
                      <span class="h-2 w-2 rounded-full" :class="rowDot(p.status)" />
                      <span class="text-xs font-extrabold px-2 py-1 rounded-full" :class="statusPill(p.status)">
                        {{ p.status }}
                      </span>
                    </div>
    
                    <h5 class="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 truncate">
                      {{ p.nombre }}
                    </h5>
    
                    <div class="flex items-center gap-2 mt-1 text-sm text-slate-700 dark:text-zinc-200">
                      <Barcode class="h-3.5 w-3.5 text-slate-400" />
                      <span class="font-extrabold">{{ p.sku }}</span>
                    </div>
                  </div>
    
                  <!-- Preview + count activas -->
                  <div class="relative flex-shrink-0">
                    <div
                      class="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800
                             shadow-sm"
                    >
                      <img
                        v-if="getFirstActiveImage(p)"
                        :src="getFirstActiveImage(p)"
                        :alt="`Imagen de ${p.nombre}`"
                        class="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                        @error="(e: any) => { if (e?.target) e.target.style.display = 'none' }"
                      />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <ImageIcon class="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                      </div>
                    </div>
    
                    <div
                      v-if="getActiveMediaCount(p) > 0"
                      class="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-black rounded-full h-6 w-6
                             flex items-center justify-center shadow-md"
                      :title="`${getActiveMediaCount(p)} imágenes activas`"
                    >
                      {{ getActiveMediaCount(p) }}
                    </div>
                  </div>
                </div>
    
                <div class="grid grid-cols-2 gap-2 mb-4">
                  <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-3">
                    <p class="text-xs font-black text-slate-500 dark:text-zinc-400 mb-1">Marca</p>
                    <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{{ p.marca?.nombre ?? '—' }}</p>
                  </div>
    
                  <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-3">
                    <p class="text-xs font-black text-slate-500 dark:text-zinc-400 mb-1">Categoría</p>
                    <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{{ p.categoria?.nombre ?? '—' }}</p>
                  </div>
    
                  <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-3">
                    <p class="text-xs font-black text-slate-500 dark:text-zinc-400 mb-1">Stock</p>
                    <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{{ p.stock }}</p>
                  </div>
    
                  <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-3">
                    <p class="text-xs font-black text-slate-500 dark:text-zinc-400 mb-1">Venta</p>
                    <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{{ money(p.precio_venta) }}</p>
                  </div>
                </div>
    
                <div class="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    class="flex-1 gap-2 text-xs transition-all hover:shadow-md"
                    @click.prevent="openMediaModal(p)"
                  >
                    <ImageIcon class="h-3.5 w-3.5" />
                    Imágenes
                  </Button>
    
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    class="flex-1 gap-2 text-xs transition-all hover:shadow-md"
                    @click.prevent="crud.openForm({ marcas: marcas, categorias: categorias }, p)"
                  >
                    <Pencil class="h-3.5 w-3.5" />
                    Editar
                  </Button>
    
                  <Button
                    type="button"
                    size="sm"
                    class="flex-1 gap-2 text-xs transition-all active:scale-[0.99]"
                    :class="getStatusButtonClasses(p.status)"
                    @click.prevent="crud.toggleStatus(p)"
                  >
                    <Power class="h-3.5 w-3.5" />
                    {{ p.status === 'activo' ? 'Desactivar' : 'Activar' }}
                  </Button>
                </div>
              </div>
            </div>
    
            <div v-if="items.data.length" class="mt-6">
              <div class="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950/40 p-4">
                <PaginationLinks :links="items.links" />
              </div>
            </div>
          </div>
        </div>
    
        <!-- Modal imagenes -->
        <div v-if="showMediaModal && selectedProductForMedia" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
          <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeMediaModal"></div>
    
          <div
            class="relative w-full max-w-6xl max-h-[92vh] bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl shadow-2xl
                   border border-slate-200 dark:border-white/10 overflow-hidden"
            @click.stop
          >
            <div class="flex items-center justify-between p-4 sm:p-6 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900">
              <div class="min-w-0">
                <h3 class="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-zinc-100">
                  Imágenes del producto
                </h3>
                <p class="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 truncate">
                  {{ selectedProductForMedia.nombre }} ({{ selectedProductForMedia.sku }})
                </p>
              </div>
    
              <Button type="button" variant="ghost" size="sm" class="h-10 w-10 rounded-full" @click="closeMediaModal">
                <X class="h-5 w-5" />
              </Button>
            </div>
    
            <div class="p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-140px)]">
              <ProductoMediaManager
                :producto-id="selectedProductForMedia.id"
                :initial-medias="selectedProductForMedia.medias || []"
                @media-updated="crud.applyFilters"
              />
            </div>
    
            <div class="p-4 sm:p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 flex items-center justify-end">
              <Button type="button" variant="outline" @click="closeMediaModal">Cerrar</Button>
            </div>
          </div>
        </div>
      </AppLayout>
    </template>
    