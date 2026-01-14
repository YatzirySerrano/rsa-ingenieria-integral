<script setup lang="ts">
    import { Head } from '@inertiajs/vue3'
    import { computed } from 'vue'
    
    import AppLayout from '@/layouts/AppLayout.vue'
    import PaginationLinks from '@/components/ui/PaginationLinks.vue'
    import { Button } from '@/components/ui/button'
    import { Input } from '@/components/ui/input'
    
    import type { Paginated } from '@/types/common'
    import type { Servicio, CategoriaLite } from '@/composables/crud/useServicioCrud'
    import { useServicioCrud } from '@/composables/crud/useServicioCrud'
    
    import { Plus, Pencil, Power, RefreshCw, Search, Filter, Layers, DollarSign, Wrench } from 'lucide-vue-next'
    
    /**
     * Props desde Inertia:
     * - items: listado paginado
     * - filters: q/status/categoria_id
     * - meta: catálogos para selects
     */
    const props = defineProps<{
      items: Paginated<Servicio>
      filters: Partial<{ q: string; status: string; categoria_id: string }>
      meta: {
        statuses: string[]
        categorias: { data?: CategoriaLite[] } | CategoriaLite[]
      }
    }>()
    
    /**
     * Normalizamos categorías (Resource::collection puede venir como {data:[...]}).
     */
    const categorias = computed<CategoriaLite[]>(() => {
      const v: any = props.meta.categorias
      return Array.isArray(v) ? v : (v?.data ?? [])
    })
    
    /**
     * Composable centraliza lógica (filtros + modales + activación).
     */
    const crud = useServicioCrud({
      initialFilters: props.filters,
      baseUrl: '/servicios',
    })
    
    /**
     * KPIs rápidos (sin “sección fea”; más claro para usuario).
     */
    const kpi = computed(() => {
      const d = props.items.data ?? []
      const activos = d.filter((x) => x.status === 'activo').length
      const inactivos = d.filter((x) => x.status === 'inactivo').length
      return { page: d.length, activos, inactivos }
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
      <Head title="Servicios" />
    
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
                    Servicios
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
                    @click="crud.openForm({ categorias: categorias })"
                  >
                    <Plus class="h-4 w-4" />
                    <span class="text-sm font-extrabold">Nuevo</span>
                  </Button>
                </div>
              </div>
    
              <!-- Row 3: filtros -->
              <div class="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-end">
                <!-- Buscar -->
                <div class="md:col-span-12 lg:col-span-6">
                  <label class="mb-1 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    <Search class="h-4 w-4 opacity-70" />
                    Buscar (nombre)
                  </label>
    
                  <div class="relative">
                    <Input
                      v-model="crud.filters.q"
                      placeholder="Ej. Instalación, Mantenimiento…"
                      class="h-10 border-slate-200 bg-white/70 pr-10 text-slate-900 placeholder:text-slate-400
                             transition focus-visible:ring-emerald-500/30
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <Search class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    </span>
                  </div>
                </div>
    
                <!-- Categoría -->
                <div class="md:col-span-6 lg:col-span-4">
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
                <div class="md:col-span-6 lg:col-span-2">
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
                <p class="text-xs text-slate-500 dark:text-zinc-500">Acciones claras, UI limpia.</p>
              </div>
    
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                    <tr>
                      <th class="px-5 py-3 text-left font-extrabold">ID</th>
                      <th class="px-5 py-3 text-left font-extrabold">Servicio</th>
                      <th class="px-5 py-3 text-left font-extrabold">Categoría</th>
                      <th class="px-5 py-3 text-right font-extrabold">Precio</th>
                      <th class="px-5 py-3 text-left font-extrabold">Estado</th>
                      <th class="px-5 py-3 text-right font-extrabold">Acciones</th>
                    </tr>
                  </thead>
    
                  <tbody>
                    <tr
                      v-for="s in props.items.data"
                      :key="s.id"
                      class="border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-white/10 dark:hover:bg-white/[0.06]"
                    >
                      <td class="px-5 py-4 text-slate-500 dark:text-zinc-500">#{{ s.id }}</td>
    
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                          <span class="h-2.5 w-2.5 rounded-full" :class="rowDot(s.status)" />
                          <div class="min-w-0">
                            <p class="truncate font-extrabold text-slate-900 dark:text-zinc-100">{{ s.nombre }}</p>
                            <p v-if="s.descripcion" class="truncate text-xs text-slate-500 dark:text-zinc-500">
                              {{ s.descripcion }}
                            </p>
                          </div>
                        </div>
                      </td>
    
                      <td class="px-5 py-4 text-slate-700 dark:text-zinc-200">
                        {{ s.categoria?.nombre ?? '—' }}
                      </td>
    
                      <td class="px-5 py-4 text-right text-slate-900 dark:text-zinc-100">
                        <span class="inline-flex items-center gap-1 font-extrabold">
                          <DollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          {{ money(s.precio) }}
                        </span>
                      </td>
    
                      <td class="px-5 py-4">
                        <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="statusPill(s.status)">
                          {{ s.status }}
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
                            @click.prevent="crud.openForm({ categorias: categorias }, s)"
                          >
                            <Pencil class="h-4 w-4" />
                            <span class="font-extrabold">Editar</span>
                          </Button>
    
                          <Button
                            type="button"
                            size="sm"
                            class="gap-2 transition active:scale-[.99]"
                            :class="s.status === 'activo'
                              ? 'bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400'"
                            @click.prevent="crud.toggleStatus(s)"
                          >
                            <Power class="h-4 w-4" />
                            <span class="font-extrabold">
                              {{ s.status === 'activo' ? 'Desactivar' : 'Activar' }}
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
    
                    <tr v-if="!props.items.data.length">
                      <td colspan="6" class="px-5 py-14 text-center text-slate-500 dark:text-zinc-500">
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
                v-for="s in props.items.data"
                :key="s.id"
                class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50
                       dark:border-white/10 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/50"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-500 dark:text-zinc-500">#{{ s.id }}</p>
    
                    <div class="mt-1 flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full" :class="rowDot(s.status)" />
                      <p class="truncate text-base font-black text-slate-900 sm:text-lg dark:text-zinc-100">
                        {{ s.nombre }}
                      </p>
                    </div>
    
                    <div class="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div class="rounded-2xl border border-slate-200 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
                        <p class="font-bold text-slate-500 dark:text-zinc-400">Categoría</p>
                        <p class="mt-0.5 font-extrabold text-slate-900 dark:text-zinc-100">
                          {{ s.categoria?.nombre ?? '—' }}
                        </p>
                      </div>
    
                      <div class="rounded-2xl border border-slate-200 bg-white/60 p-2 dark:border-white/10 dark:bg-white/5">
                        <p class="font-bold text-slate-500 dark:text-zinc-400">Precio</p>
                        <p class="mt-0.5 font-extrabold text-slate-900 dark:text-zinc-100">
                          {{ money(s.precio) }}
                        </p>
                      </div>
                    </div>
    
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="statusPill(s.status)">
                        {{ s.status }}
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
                      @click.prevent="crud.openForm({ categorias: categorias }, s)"
                    >
                      <Pencil class="h-4 w-4" />
                      Editar
                    </Button>
    
                    <Button
                      type="button"
                      size="sm"
                      class="gap-2 transition"
                      :class="s.status === 'activo'
                        ? 'bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400'"
                      @click.prevent="crud.toggleStatus(s)"
                    >
                      <Power class="h-4 w-4" />
                      {{ s.status === 'activo' ? 'Desactivar' : 'Activar' }}
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
    