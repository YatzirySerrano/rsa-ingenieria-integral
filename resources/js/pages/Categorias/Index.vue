<script setup lang="ts">
    import { Head } from '@inertiajs/vue3'
    import { computed } from 'vue'
    
    import AppLayout from '@/layouts/AppLayout.vue'
    import PaginationLinks from '@/components/ui/PaginationLinks.vue'
    import { Button } from '@/components/ui/button'
    import { Input } from '@/components/ui/input'
    
    import type { Paginated } from '@/types/common'
    import type { Categoria } from '@/composables/crud/useCategoriaCrud'
    import { useCategoriaCrud } from '@/composables/crud/useCategoriaCrud'
    
    import { Plus, Pencil, Power, RefreshCw, Search, Filter } from 'lucide-vue-next'
    
    /**
     * Props desde Inertia:
     * - items: paginación
     * - filters: filtros actuales (q/tipo/status)
     * - meta: opciones para selects
     */
    const props = defineProps<{
      items: Paginated<Categoria>
      filters: Partial<{ q: string; tipo: string; status: string }>
      meta: { tipos: string[]; statuses: string[] }
    }>()
    
    /**
     * Composable:
     * - Mantiene lógica de filtros y acciones (create/edit/activar/desactivar)
     * - El status NO se edita en el modal; solo se cambia con activar/desactivar
     */
    const crud = useCategoriaCrud({
      initialFilters: props.filters,
      baseUrl: '/categorias',
    })
    
    /**
     * KPIs compactos (claros y sin gritar):
     * - total del page actual + activos/inactivos del page actual
     * Nota: si quieres total global real, tu backend debe mandar counts.
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
      <Head title="Categorías" />
    
      <AppLayout>
        <!-- Contenedor con aire lateral real (no pegado al sidebar) -->
        <div class="px-4 py-5 sm:px-6 lg:px-10 2xl:px-14">
          <!-- Top bar: título + KPIs + filtros + acciones (todo arriba) -->
          <div
            class="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur
                   dark:border-white/10 dark:bg-zinc-950/50"
          >
            <div class="flex flex-col gap-4">
              <!-- Row 1: título + acciones -->
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <h1
                    class="truncate text-lg font-black tracking-tight text-slate-900
                           sm:text-xl lg:text-2xl dark:text-zinc-100"
                  >
                    Categorías
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
    
              <!-- Row 3: filtros (arriba, no laterales) -->
              <div class="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-end">
                <!-- Buscar -->
                <div class="md:col-span-6 lg:col-span-5">
                  <label class="mb-1 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    <Search class="h-4 w-4 opacity-70" />
                    Buscar
                  </label>
    
                  <div class="relative">
                    <Input
                      v-model="crud.filters.q"
                      placeholder="Nombre de categoría…"
                      class="h-10 border-slate-200 bg-white/70 pr-10 text-slate-900 placeholder:text-slate-400
                             transition focus-visible:ring-emerald-500/30
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <Search class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    </span>
                  </div>
                </div>
    
                <!-- Tipo -->
                <div class="md:col-span-3 lg:col-span-3">
                  <label class="mb-1 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    <Filter class="h-4 w-4 opacity-70" />
                    Tipo
                  </label>
    
                  <select
                    v-model="crud.filters.tipo"
                    class="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 pr-9 text-sm font-semibold text-slate-900
                            shadow-sm outline-none transition
                            hover:bg-slate-50 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15
                            dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800/60
                            [color-scheme:dark] dark:[color-scheme:dark]"
                    >
                    <option :value="crud.ALL">Todos</option>
                    <option v-for="t in props.meta.tipos" :key="t" :value="t">{{ t }}</option>
                    </select>
                </div>
    
                <!-- Status -->
                <div class="md:col-span-3 lg:col-span-2">
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
              </div>
    
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                    <tr>
                      <th class="px-5 py-3 text-left font-extrabold">ID</th>
                      <th class="px-5 py-3 text-left font-extrabold">Nombre</th>
                      <th class="px-5 py-3 text-left font-extrabold">Tipo</th>
                      <th class="px-5 py-3 text-left font-extrabold">Estado</th>
                      <th class="px-5 py-3 text-right font-extrabold">Acciones</th>
                    </tr>
                  </thead>
    
                  <tbody>
                    <tr
                      v-for="c in props.items.data"
                      :key="c.id"
                      class="border-t border-slate-100 transition hover:bg-slate-50/70 dark:border-white/10 dark:hover:bg-white/[0.06]"
                    >
                      <td class="px-5 py-4 text-slate-500 dark:text-zinc-500">#{{ c.id }}</td>
    
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                          <span class="h-2.5 w-2.5 rounded-full" :class="rowDot(c.status)" />
                          <span class="font-extrabold text-slate-900 dark:text-zinc-100">
                            {{ c.nombre }}
                          </span>
                        </div>
                      </td>
    
                      <td class="px-5 py-4">
                        <span
                          class="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200
                                 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10"
                        >
                          {{ c.tipo }}
                        </span>
                      </td>
    
                      <td class="px-5 py-4">
                        <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="statusPill(c.status)">
                          {{ c.status }}
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
                            @click.prevent="crud.openForm(c)"
                          >
                            <Pencil class="h-4 w-4" />
                            <span class="font-extrabold">Editar</span>
                          </Button>
    
                          <Button
                            type="button"
                            size="sm"
                            class="gap-2 transition active:scale-[.99]"
                            :class="c.status === 'activo'
                              ? 'bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:text-white dark:hover:bg-rose-400'
                              : 'bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400'"
                            @click.prevent="crud.toggleStatus(c)"
                          >
                            <Power class="h-4 w-4" />
                            <span class="font-extrabold">
                              {{ c.status === 'activo' ? 'Desactivar' : 'Activar' }}
                            </span>
                          </Button>
                        </div>
                      </td>
                    </tr>
    
                    <tr v-if="!props.items.data.length">
                      <td colspan="5" class="px-5 py-14 text-center text-slate-500 dark:text-zinc-500">
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
                v-for="c in props.items.data"
                :key="c.id"
                class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50
                       dark:border-white/10 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/50"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <p class="text-xs font-bold text-slate-500 dark:text-zinc-500">#{{ c.id }}</p>
    
                    <div class="mt-1 flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full" :class="rowDot(c.status)" />
                      <p
                        class="truncate text-base font-black text-slate-900 sm:text-lg dark:text-zinc-100"
                      >
                        {{ c.nombre }}
                      </p>
                    </div>
    
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        class="rounded-full bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700 ring-1 ring-slate-200
                               dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10"
                      >
                        {{ c.tipo }}
                      </span>
                      <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="statusPill(c.status)">
                        {{ c.status }}
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
                      @click.prevent="crud.openForm(c)"
                    >
                      <Pencil class="h-4 w-4" />
                      Editar
                    </Button>
    
                    <Button
                      type="button"
                      size="sm"
                      class="gap-2 transition"
                      :class="c.status === 'activo'
                        ? 'bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400'
                        : 'bg-emerald-600 text-white hover:bg-emerald-500 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400'"
                      @click.prevent="crud.toggleStatus(c)"
                    >
                      <Power class="h-4 w-4" />
                      {{ c.status === 'activo' ? 'Desactivar' : 'Activar' }}
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
    