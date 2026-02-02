<script setup lang="ts">
    import { Head } from '@inertiajs/vue3'
    import { computed } from 'vue'
    
    import AppLayout from '@/layouts/AppLayout.vue'
    import PaginationLinks from '@/components/ui/PaginationLinks.vue'
    import { Button } from '@/components/ui/button'
    import { Input } from '@/components/ui/input'
    
    import type { Paginated } from '@/types/common'
    import type { Marca } from '@/composables/crud/useMarcaCrud'
    import { useMarcaCrud } from '@/composables/crud/useMarcaCrud'
    
    import { Plus, Pencil, Power, RefreshCw, Search, Filter } from 'lucide-vue-next'
    
    /**
     * Props desde Inertia:
     * - items: paginación de marcas
     * - filters: filtros actuales (q/status)
     * - meta: opciones para selects
     */
    const props = defineProps<{
      items: Paginated<Marca>
      filters: Partial<{ q: string; status: string }>
      meta: { statuses: string[] }
    }>()
    
    /**
     * Composable:
     * - Toda la lógica de filtros y acciones vive aquí
     * - La vista solo “consume” funciones
     */
    const crud = useMarcaCrud({
      initialFilters: props.filters,
      baseUrl: '/marcas',
    })
    
    /**
     * KPIs compactos (de la página actual).
     * Si necesitas totales globales reales, se mandan desde backend en meta.
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
    </script>
    
    <template>
      <Head title="Marcas" />
    
      <AppLayout>
        <div class="px-4 py-5 sm:px-6 lg:px-10 2xl:px-14">
          <!-- Header único: título + acciones + filtros arriba -->
          <div
            class="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur
                   dark:border-white/10 dark:bg-zinc-950/50"
          >
            <div class="flex flex-col gap-4">
              <!-- Row 1 -->
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <h1 class="truncate text-lg font-black tracking-tight text-slate-900
                           sm:text-xl lg:text-2xl dark:text-zinc-100"
                  >  Marcas
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
                    <span class="text-sm font-semibold">Actualizar</span>
                  </Button>
    
                  <Button
                    type="button"
                    class="gap-2 bg-emerald-600 text-white transition hover:bg-emerald-500 active:scale-[.99]
                           dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                    @click="crud.openForm()"
                  >
                    <Plus class="h-4 w-4" />
                    <span class="text-sm font-extrabold">Nueva</span>
                  </Button>
                </div>
              </div>
    
              <!-- Row 3: filtros -->
              <div class="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-end">
                <div class="md:col-span-8 lg:col-span-7">
                  <label class="mb-1 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    <Search class="h-4 w-4 opacity-70" />
                    Buscar
                  </label>
    
                  <div class="relative">
                    <Input
                      v-model="crud.filters.q"
                      placeholder="Nombre de marca…"
                      class="h-10 border-slate-200 bg-white/70 pr-10 text-slate-900 placeholder:text-slate-400
                             transition focus-visible:ring-emerald-500/30
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <Search class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    </span>
                  </div>
                </div>
    
                <div class="md:col-span-4 lg:col-span-3">
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
    
                <div class="hidden lg:col-span-2 lg:block">
                  <div
                    class="rounded-2xl border border-slate-200 bg-white/60 px-3 py-2 text-xs text-slate-600
                           dark:border-white/10 dark:bg-white/5 dark:text-zinc-400"
                  >
                    <span class="font-bold">Regla:</span> el estado se cambia con Activar/Desactivar.
                  </div>
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
              </div>
    
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                    <tr>
                      <th class="px-5 py-3 text-left font-extrabold">ID</th>
                      <th class="px-5 py-3 text-left font-extrabold">Nombre</th>
                      <th class="px-5 py-3 text-left font-extrabold">Estado</th>
                      <th class="px-5 py-3 text-right font-extrabold">Acciones</th>
                    </tr>
                  </thead>
    
                  <tbody>
                    <tr
                      v-for="m in props.items.data"
                      :key="m.id"
                      class="border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-white/10 dark:hover:bg-white/[0.06]"
                    >
                      <td class="px-5 py-4 text-slate-500 dark:text-zinc-500">#{{ m.id }}</td>
    
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                          <span class="h-2.5 w-2.5 rounded-full" :class="rowDot(m.status)" />
                          <span class="font-extrabold text-slate-900 dark:text-zinc-100">
                            {{ m.nombre }}
                          </span>
                        </div>
                      </td>
    
                      <td class="px-5 py-4">
                        <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="statusPill(m.status)">
                          {{ m.status }}
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
                            @click.prevent="crud.openForm(m)"
                          >
                            <Pencil class="h-4 w-4" />
                            <span class="font-extrabold">Editar</span>
                          </Button>
    
                          <Button
                            type="button"
                            size="sm"
                            class="gap-2 transition active:scale-[.99]"
                            :class="m.status === 'activo'
                              ? 'bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400'"
                            @click.prevent="crud.toggleStatus(m)"
                          >
                            <Power class="h-4 w-4" />
                            <span class="font-extrabold">
                              {{ m.status === 'activo' ? 'Desactivar' : 'Activar' }}
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
    
                    <tr v-if="!props.items.data.length">
                      <td colspan="4" class="px-5 py-14 text-center text-slate-500 dark:text-zinc-500">
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
                v-for="m in props.items.data"
                :key="m.id"
                class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50
                       dark:border-white/10 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/50"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-500 dark:text-zinc-500">#{{ m.id }}</p>
    
                    <div class="mt-1 flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full" :class="rowDot(m.status)" />
                      <p class="truncate text-base font-black text-slate-900 sm:text-lg dark:text-zinc-100">
                        {{ m.nombre }}
                      </p>
                    </div>
    
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="statusPill(m.status)">
                        {{ m.status }}
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
                      @click.prevent="crud.openForm(m)"
                    >
                      <Pencil class="h-4 w-4" />
                      Editar
                    </Button>
    
                    <Button
                      type="button"
                      size="sm"
                      class="gap-2 transition"
                      :class="m.status === 'activo'
                        ? 'bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400'"
                      @click.prevent="crud.toggleStatus(m)"
                    >
                      <Power class="h-4 w-4" />
                      {{ m.status === 'activo' ? 'Desactivar' : 'Activar' }}
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
    