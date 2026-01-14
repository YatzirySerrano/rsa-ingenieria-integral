<script setup lang="ts">
    import { Head } from '@inertiajs/vue3'
    import { computed } from 'vue'
    
    import AppLayout from '@/layouts/AppLayout.vue'
    import PaginationLinks from '@/components/ui/PaginationLinks.vue'
    import { Button } from '@/components/ui/button'
    import { Input } from '@/components/ui/input'
    
    import type { Paginated } from '@/types/common'
    import type { Producto, MarcaLite, CategoriaLite } from '@/composables/crud/useProductoCrud'
    import { useProductoCrud } from '@/composables/crud/useProductoCrud'
    
    import { Plus, Pencil, Power, RefreshCw, Search, Filter, Tag, Layers, Barcode, DollarSign, Package } from 'lucide-vue-next'
    
    /**
     * Props desde Inertia:
     * - items: lista paginada de productos (con marca/categoria eager loaded)
     * - filters: filtros actuales (q/status/marca_id/categoria_id)
     * - meta: catálogos para selects
     */
    const props = defineProps<{
      items: Paginated<Producto>
      filters: Partial<{ q: string; status: string; marca_id: string; categoria_id: string }>
      meta: {
        statuses: string[]
        marcas: { data?: MarcaLite[] } | MarcaLite[]
        categorias: { data?: CategoriaLite[] } | CategoriaLite[]
      }
    }>()
    
    /**
     * Normalizamos meta.marcas/meta.categorias por si llegan como Resource::collection()
     * (a veces viene {data:[...]}).
     */
    const marcas = computed<MarcaLite[]>(() => {
      const v: any = props.meta.marcas
      return Array.isArray(v) ? v : (v?.data ?? [])
    })
    
    const categorias = computed<CategoriaLite[]>(() => {
      const v: any = props.meta.categorias
      return Array.isArray(v) ? v : (v?.data ?? [])
    })
    
    /**
     * Composable:
     * - filtros + acciones centralizadas
     */
    const crud = useProductoCrud({
      initialFilters: props.filters,
      baseUrl: '/productos',
    })
    
    /**
     * KPIs de la página actual (rápidos y claros).
     */
    const kpi = computed(() => {
      const d = props.items.data ?? []
      const activos = d.filter((x) => x.status === 'activo').length
      const inactivos = d.filter((x) => x.status === 'inactivo').length
      const stockTotal = d.reduce((acc, x) => acc + (Number(x.stock ?? 0) || 0), 0)
      return { page: d.length, activos, inactivos, stockTotal }
    })
    
    function statusPill(status: string) {
      return status === 'activo'
        ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-200'
        : 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-200'
    }
    
    function rowDot(status: string) {
      return status === 'activo'
        ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.12)]'
        : 'bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,.12)]'
    }
    
    function money(v: any) {
      const n = Number(v)
      if (!Number.isFinite(n)) return String(v ?? '')
      return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
    }
    </script>
    
    <template>
      <Head title="Productos" />
    
      <AppLayout>
        <div class="px-4 py-5 sm:px-6 lg:px-10 2xl:px-14">
          <!-- Header: acciones + filtros arriba -->
          <div
            class="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur
                   dark:border-white/10 dark:bg-zinc-950/50"
          >
            <div class="flex flex-col gap-4">
              <!-- Row 1 -->
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <h1
                    class="truncate text-lg font-black tracking-tight text-slate-900
                           sm:text-xl lg:text-2xl dark:text-zinc-100"
                  >
                    Productos
                  </h1>
                </div>
    
                <div class="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    class="gap-2 border-slate-200 bg-white/70 text-slate-900 transition hover:bg-slate-50
                           dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                    @click="crud.resetFilters"
                    :disabled="!crud.hasActiveFilters"
                  >
                    <RefreshCw class="h-4 w-4" />
                    <span class="text-sm font-semibold">Reiniciar</span>
                  </Button>
    
                  <Button
                    type="button"
                    class="gap-2 bg-emerald-600 text-white transition hover:bg-emerald-500 active:scale-[.99]
                           dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                    @click="crud.openForm({ marcas: marcas, categorias: categorias })"
                  >
                    <Plus class="h-4 w-4" />
                    <span class="text-sm font-extrabold">Nuevo</span>
                  </Button>
                </div>
              </div>
    
              <!-- Row 3: filtros -->
              <div class="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-end">
                <!-- Buscar -->
                <div class="md:col-span-12 lg:col-span-5">
                  <label class="mb-1 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    <Search class="h-4 w-4 opacity-70" />
                    Buscar (SKU o nombre)
                  </label>
    
                  <div class="relative">
                    <Input
                      v-model="crud.filters.q"
                      placeholder="Ej. HK-1234 o Cámara…"
                      class="h-10 border-slate-200 bg-white/70 pr-10 text-slate-900 placeholder:text-slate-400
                             transition focus-visible:ring-emerald-500/30
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <Search class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    </span>
                  </div>
                </div>
    
                <!-- Marca -->
                <div class="md:col-span-6 lg:col-span-3">
                  <label class="mb-1 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    <Tag class="h-4 w-4 opacity-70" />
                    Marca
                  </label>
    
                  <select
                    v-model="crud.filters.marca_id"
                    class="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm font-semibold text-slate-900
                           outline-none transition hover:bg-white focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/15
                           dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    <option :value="crud.ALL">Todas</option>
                    <option v-for="m in marcas" :key="m.id" :value="String(m.id)">{{ m.nombre }}</option>
                  </select>
                </div>
    
                <!-- Categoría -->
                <div class="md:col-span-6 lg:col-span-3">
                  <label class="mb-1 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    <Layers class="h-4 w-4 opacity-70" />
                    Categoría
                  </label>
    
                  <select
                    v-model="crud.filters.categoria_id"
                    class="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm font-semibold text-slate-900
                           outline-none transition hover:bg-white focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/15
                           dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    <option :value="crud.ALL">Todas</option>
                    <option v-for="c in categorias" :key="c.id" :value="String(c.id)">{{ c.nombre }}</option>
                  </select>
                </div>
    
                <!-- Estado -->
                <div class="md:col-span-6 lg:col-span-1">
                  <label class="mb-1 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    <Filter class="h-4 w-4 opacity-70" />
                    Estado
                  </label>
    
                  <select
                    v-model="crud.filters.status"
                    class="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm font-semibold text-slate-900
                           outline-none transition hover:bg-white focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/15
                           dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    <option :value="crud.ALL">Todos</option>
                    <option v-for="s in props.meta.statuses" :key="s" :value="s">{{ s }}</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Listado -->
          <div class="mt-5">
            <!-- Desktop table -->
            <div
              class="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block
                     dark:border-white/10 dark:bg-zinc-950/40"
            >
              <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
                <p class="text-sm font-black text-slate-900 dark:text-zinc-100">Listado</p>
                <p class="text-xs text-slate-500 dark:text-zinc-500">Operación rápida, sin ruido visual.</p>
              </div>
    
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                    <tr>
                      <th class="px-5 py-3 text-left font-extrabold">ID</th>
                      <th class="px-5 py-3 text-left font-extrabold">SKU</th>
                      <th class="px-5 py-3 text-left font-extrabold">Producto</th>
                      <th class="px-5 py-3 text-left font-extrabold">Marca</th>
                      <th class="px-5 py-3 text-left font-extrabold">Categoría</th>
                      <th class="px-5 py-3 text-right font-extrabold">Stock</th>
                      <th class="px-5 py-3 text-right font-extrabold">Costo</th>
                      <th class="px-5 py-3 text-right font-extrabold">Venta</th>
                      <th class="px-5 py-3 text-left font-extrabold">Estado</th>
                      <th class="px-5 py-3 text-right font-extrabold">Acciones</th>
                    </tr>
                  </thead>
    
                  <tbody>
                    <tr
                      v-for="p in props.items.data"
                      :key="p.id"
                      class="border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-white/10 dark:hover:bg-white/[0.06]"
                    >
                      <td class="px-5 py-4 text-slate-500 dark:text-zinc-500">#{{ p.id }}</td>
    
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-2">
                          <Barcode class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          <span class="font-extrabold text-slate-900 dark:text-zinc-100">{{ p.sku }}</span>
                        </div>
                      </td>
    
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                          <span class="h-2.5 w-2.5 rounded-full" :class="rowDot(p.status)" />
                          <div class="min-w-0">
                            <p class="truncate font-extrabold text-slate-900 dark:text-zinc-100">{{ p.nombre }}</p>
                            <p v-if="p.descripcion" class="truncate text-xs text-slate-500 dark:text-zinc-500">
                              {{ p.descripcion }}
                            </p>
                          </div>
                        </div>
                      </td>
    
                      <td class="px-5 py-4 text-slate-700 dark:text-zinc-200">
                        {{ p.marca?.nombre ?? '—' }}
                      </td>
    
                      <td class="px-5 py-4 text-slate-700 dark:text-zinc-200">
                        {{ p.categoria?.nombre ?? '—' }}
                      </td>
    
                      <td class="px-5 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">
                        <span class="inline-flex items-center gap-2">
                          <Package class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          {{ p.stock }}
                        </span>
                      </td>
    
                      <td class="px-5 py-4 text-right text-slate-900 dark:text-zinc-100">
                        <span class="inline-flex items-center gap-1 font-extrabold">
                          <DollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          {{ money(p.costo_lista) }}
                        </span>
                      </td>
    
                      <td class="px-5 py-4 text-right text-slate-900 dark:text-zinc-100">
                        <span class="inline-flex items-center gap-1 font-extrabold">
                          <DollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          {{ money(p.precio_venta) }}
                        </span>
                      </td>
    
                      <td class="px-5 py-4">
                        <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="statusPill(p.status)">
                          {{ p.status }}
                        </span>
                      </td>
    
                      <td class="px-5 py-4 text-right">
                        <div class="inline-flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            class="gap-2 border-slate-200 bg-white/70 text-slate-900 transition hover:bg-slate-50 active:scale-[.99]
                                   dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                            @click.prevent="crud.openForm({ marcas: marcas, categorias: categorias }, p)"
                          >
                            <Pencil class="h-4 w-4" />
                            <span class="font-extrabold">Editar</span>
                          </Button>
    
                          <Button
                            type="button"
                            size="sm"
                            class="gap-2 transition active:scale-[.99]"
                            :class="p.status === 'activo'
                              ? 'bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400'"
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
    
                    <tr v-if="!props.items.data.length">
                      <td colspan="10" class="px-5 py-14 text-center text-slate-500 dark:text-zinc-500">
                        Sin resultados
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
    
              <div class="border-t border-slate-200 px-5 py-4 dark:border-white/10">
                <PaginationLinks :links="props.items.links" />
              </div>
            </div>
    
            <!-- Mobile cards -->
            <div class="space-y-3 lg:hidden">
              <div
                v-for="p in props.items.data"
                :key="p.id"
                class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50
                       dark:border-white/10 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/50"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-500 dark:text-zinc-500">#{{ p.id }}</p>
    
                    <div class="mt-1 flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full" :class="rowDot(p.status)" />
                      <p class="truncate text-base font-black text-slate-900 sm:text-lg dark:text-zinc-100">
                        {{ p.nombre }}
                      </p>
                    </div>
    
                    <div class="mt-1 flex items-center gap-2 text-sm text-slate-700 dark:text-zinc-200">
                      <Barcode class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      <span class="font-extrabold">{{ p.sku }}</span>
                    </div>
    
                    <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div class="rounded-2xl border border-slate-200 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
                        <p class="font-bold text-slate-500 dark:text-zinc-400">Marca</p>
                        <p class="mt-0.5 font-extrabold text-slate-900 dark:text-zinc-100">{{ p.marca?.nombre ?? '—' }}</p>
                      </div>
    
                      <div class="rounded-2xl border border-slate-200 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
                        <p class="font-bold text-slate-500 dark:text-zinc-400">Categoría</p>
                        <p class="mt-0.5 font-extrabold text-slate-900 dark:text-zinc-100">{{ p.categoria?.nombre ?? '—' }}</p>
                      </div>
    
                      <div class="rounded-2xl border border-slate-200 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
                        <p class="font-bold text-slate-500 dark:text-zinc-400">Stock</p>
                        <p class="mt-0.5 font-extrabold text-slate-900 dark:text-zinc-100">{{ p.stock }}</p>
                      </div>
    
                      <div class="rounded-2xl border border-slate-200 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
                        <p class="font-bold text-slate-500 dark:text-zinc-400">Venta</p>
                        <p class="mt-0.5 font-extrabold text-slate-900 dark:text-zinc-100">{{ money(p.precio_venta) }}</p>
                      </div>
                    </div>
    
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="statusPill(p.status)">
                        {{ p.status }}
                      </span>
                    </div>
                  </div>
    
                  <div class="flex flex-col gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      class="gap-2 border-slate-200 bg-white/70 text-slate-900 transition hover:bg-slate-50
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                      @click.prevent="crud.openForm({ marcas: marcas, categorias: categorias }, p)"
                    >
                      <Pencil class="h-4 w-4" />
                      Editar
                    </Button>
    
                    <Button
                      type="button"
                      size="sm"
                      class="gap-2 transition"
                      :class="p.status === 'activo'
                        ? 'bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400'"
                      @click.prevent="crud.toggleStatus(p)"
                    >
                      <Power class="h-4 w-4" />
                      {{ p.status === 'activo' ? 'Desactivar' : 'Activar' }}
                    </Button>
                  </div>
                </div>
              </div>
    
              <div
                v-if="!props.items.data.length"
                class="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center text-slate-500
                       dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-500"
              >
                Sin resultados
              </div>
    
              <div
                v-if="props.items.data.length"
                class="rounded-3xl border border-slate-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-zinc-950/40"
              >
                <PaginationLinks :links="props.items.links" />
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    </template>
    