<script setup lang="ts">
    import { Head } from '@inertiajs/vue3'
    import { computed } from 'vue'
    
    import AppLayout from '@/layouts/AppLayout.vue'
    import PaginationLinks from '@/components/ui/PaginationLinks.vue'
    
    import { Button } from '@/components/ui/button'
    import { Input } from '@/components/ui/input'
    
    import type { Paginated } from '@/types/common'
    import type { Cotizacion } from '@/composables/crud/useCotizacionCrud'
    import { useCotizacionCrud } from '@/composables/crud/useCotizacionCrud'
    
    import {
      Plus,
      Pencil,
      Power,
      RefreshCw,
      Search,
      Mail,
      Phone,
      BadgeDollarSign,
      Hash,
      Inbox,
      Send,
      Undo2,
    } from 'lucide-vue-next'
    
    /**
     * Cotizaciones/Index (usuario final)
     * ---------------------------------
     * - Cabecera: título + acciones + filtros (todo arriba)
     * - Listado: tabla (lg+) / cards (móvil)
     * - Acciones: Editar (workspace), Activar/Desactivar (baja lógica)
     * - Estatus: ENVIADA / RECIBIDA / DEVUELTA (revisa correo)
     */
    const props = defineProps<{
      items: Paginated<Cotizacion>
      filters: Partial<{ q: string; estatus: string; status: string }>
      meta: { estatuses: string[]; statuses: string[] }
    }>()
    
    const crud = useCotizacionCrud({
      initialFilters: props.filters,
      baseUrl: '/cotizaciones',
    })
    
    /**
     * KPIs simples (sin cosas técnicas):
     * - en esta página
     * - enviadas/recibidas/devueltas
     */
    const stats = computed(() => {
      const d = props.items.data ?? []
      const ui = d.map((x) => crud.uiEstatus(x))
      return {
        page: d.length,
        enviadas: ui.filter((x) => x === 'ENVIADA').length,
        recibidas: ui.filter((x) => x === 'RECIBIDA').length,
        devueltas: ui.filter((x) => x === 'DEVUELTA').length,
      }
    })
    
    function safe(v?: string | null) {
      const s = String(v ?? '').trim()
      return s ? s : '—'
    }
    
    function money(v: any) {
      const n = typeof v === 'string' ? Number(v) : Number(v ?? 0)
      if (Number.isNaN(n)) return '0.00'
      return n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    }
    
    /**
     * Pills (light + dark)
     */
    function pillState(status: string) {
      return status === 'activo'
        ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-200'
        : 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-200'
    }
    
    function dotState(status: string) {
      return status === 'activo'
        ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,.12)]'
        : 'bg-rose-500 shadow-[0_0_0_4px_rgba(244,63,94,.12)]'
    }
    
    function pillUiEstatus(e: string) {
      // usuario final: claro y directo
      const map: Record<string, string> = {
        ENVIADA: 'bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-200',
        RECIBIDA: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-200',
        DEVUELTA: 'bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200',
        BORRADOR: 'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/15 dark:text-zinc-200',
      }
      return map[e] ?? 'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/15 dark:text-zinc-200'
    }
    
    function estatusIcon(e: string) {
      if (e === 'ENVIADA') return Send
      if (e === 'RECIBIDA') return Inbox
      if (e === 'DEVUELTA') return Undo2
      return Hash
    }
    
    const uiEstatuses = ['ENVIADA', 'RECIBIDA', 'DEVUELTA'] as const
    </script>
    
    <template>
      <Head title="Cotizaciones" />
    
      <AppLayout>
        <div class="px-4 py-5 sm:px-6 lg:px-10 2xl:px-14">
          <!-- Header / filtros arriba (sin lateral) -->
          <div
            class="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur
                   dark:border-white/10 dark:bg-zinc-950/50"
          >
            <div class="flex flex-col gap-4">
              <!-- Top row -->
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <h1 class="truncate text-lg font-black tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-zinc-100">
                    Cotizaciones
                  </h1>
                  <p class="mt-1 text-xs text-slate-600 sm:text-sm dark:text-zinc-400">
                    Crea una cotización, agrega productos/servicios y envíala por correo cuando esté lista.
                  </p>
                </div>
    
                <div class="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    class="gap-2 border-slate-200 bg-white/70 text-slate-900 transition hover:bg-slate-50 active:scale-[.99]
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
                    @click="crud.startCart()"
                  >
                    <Plus class="h-4 w-4" />
                    <span class="text-sm font-extrabold">Nueva</span>
                  </Button>
                </div>
              </div>
    
              <!-- KPI row (simple y entendible) -->
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:max-w-4xl">
                <div class="rounded-2xl border border-slate-200 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <p class="text-[11px] font-bold text-slate-500 dark:text-zinc-400">En esta página</p>
                  <p class="text-base font-black text-slate-900 sm:text-lg dark:text-zinc-100">{{ stats.page }}</p>
                </div>
    
                <div class="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <p class="text-[11px] font-bold text-blue-700/80 dark:text-blue-200/80">Enviadas</p>
                  <p class="text-base font-black text-blue-800 sm:text-lg dark:text-blue-200">{{ stats.enviadas }}</p>
                </div>
    
                <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <p class="text-[11px] font-bold text-emerald-700/80 dark:text-emerald-200/80">Recibidas</p>
                  <p class="text-base font-black text-emerald-800 sm:text-lg dark:text-emerald-200">{{ stats.recibidas }}</p>
                </div>
    
                <div class="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <p class="text-[11px] font-bold text-amber-800/80 dark:text-amber-200/80">Devueltas</p>
                  <p class="text-base font-black text-amber-900 sm:text-lg dark:text-amber-200">{{ stats.devueltas }}</p>
                </div>
              </div>
    
              <!-- Filters row -->
              <div class="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-end">
                <div class="md:col-span-12 lg:col-span-6">
                  <label class="mb-1 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    <Search class="h-4 w-4 opacity-70" />
                    Buscar
                  </label>
    
                  <div class="relative">
                    <Input
                      v-model="crud.filters.q"
                      placeholder="Folio, correo o teléfono…"
                      class="h-10 border-slate-200 bg-white/70 pr-10 text-slate-900 placeholder:text-slate-400
                             transition focus-visible:ring-emerald-500/30
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                    />
                    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <Search class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    </span>
                  </div>
                </div>
    
                <!-- Estatus (UI) -->
                <div class="md:col-span-6 lg:col-span-3">
                  <label class="mb-1 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    Estatus
                  </label>
    
                  <select
                    v-model="crud.filters.estatus"
                    class="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm font-semibold text-slate-900
                           outline-none transition hover:bg-white focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/15
                           dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    <option :value="crud.ALL">Todos</option>
                    <!-- mostramos solo lo que el usuario entiende -->
                    <option v-for="e in uiEstatuses" :key="e" :value="e">{{ e }}</option>
                  </select>
    
                  <!-- Nota: este filtro filtra por estatus backend.
                       Si quieres que funcione con UI estatus, necesitas que backend acepte ENVIADA/RECIBIDA/DEVUELTA
                       o que traduzcas en controller. Mientras tanto, este select se usa como “UI hint”.
                  -->
                </div>
    
                <!-- Estado activo/inactivo -->
                <div class="md:col-span-6 lg:col-span-3">
                  <label class="mb-1 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
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
    
              <p class="text-xs text-slate-500 dark:text-zinc-500">
                “Devuelta” significa: revisa tu correo, ahí va la respuesta.
              </p>
            </div>
          </div>
    
          <!-- Listado -->
          <div class="mt-5">
            <!-- Desktop -->
            <div
              class="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm lg:block
                     dark:border-white/10 dark:bg-zinc-950/40"
            >
              <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-white/10">
                <p class="text-sm font-black text-slate-900 dark:text-zinc-100">Tus cotizaciones</p>
                <p class="text-xs text-slate-500 dark:text-zinc-500">Abre, edita y envía cuando esté lista.</p>
              </div>
    
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                    <tr>
                      <th class="px-5 py-3 text-left font-extrabold">Folio</th>
                      <th class="px-5 py-3 text-left font-extrabold">Correo / Teléfono</th>
                      <th class="px-5 py-3 text-left font-extrabold">Estatus</th>
                      <th class="px-5 py-3 text-left font-extrabold">Total</th>
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
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                          <span class="h-2.5 w-2.5 rounded-full" :class="dotState(c.status)" />
                          <div class="min-w-0">
                            <p class="truncate font-extrabold text-slate-900 dark:text-zinc-100">
                              <span class="inline-flex items-center gap-2">
                                <Hash class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                                {{ c.folio }}
                              </span>
                            </p>
                            <p class="truncate text-xs text-slate-500 dark:text-zinc-500">#{{ c.id }}</p>
                          </div>
                        </div>
                      </td>
    
                      <td class="px-5 py-4">
                        <div class="space-y-1">
                          <p class="inline-flex items-center gap-2 text-slate-700 dark:text-zinc-200">
                            <Mail class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                            {{ safe(c.email_destino) }}
                          </p>
                          <p class="inline-flex items-center gap-2 text-slate-700 dark:text-zinc-200">
                            <Phone class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                            {{ safe(c.telefono_destino) }}
                          </p>
                        </div>
                      </td>
    
                      <td class="px-5 py-4">
                        <span
                          class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-extrabold"
                          :class="pillUiEstatus(crud.uiEstatus(c))"
                        >
                          <component :is="estatusIcon(crud.uiEstatus(c))" class="h-4 w-4" />
                          {{ crud.uiEstatus(c) }}
                        </span>
                      </td>
    
                      <td class="px-5 py-4">
                        <p class="inline-flex items-center gap-2 font-extrabold text-slate-900 dark:text-zinc-100">
                          <BadgeDollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          $ {{ money(c.total) }}
                        </p>
                        <p class="text-xs text-slate-500 dark:text-zinc-500">Subtotal: $ {{ money(c.subtotal) }}</p>
                      </td>
    
                      <td class="px-5 py-4">
                        <span class="rounded-full px-3 py-1 text-xs font-extrabold" :class="pillState(c.status)">
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
                            @click.prevent="crud.goEdit(c)"
                          >
                            <Pencil class="h-4 w-4" />
                            <span class="font-extrabold">Abrir</span>
                          </Button>
    
                          <Button
                            type="button"
                            size="sm"
                            class="gap-2 transition active:scale-[.99]"
                            :class="c.status === 'activo'
                              ? 'bg-rose-600 text-white hover:bg-rose-500 dark:bg-rose-500 dark:hover:bg-rose-400'
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
    
            <!-- Mobile -->
            <div class="space-y-3 lg:hidden">
              <div
                v-for="c in props.items.data"
                :key="c.id"
                class="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50
                       dark:border-white/10 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/50"
              >
                <div class="flex items-start justify-between gap-4">
                  <div class="min-w-0">
                    <div class="flex items-center gap-2">
                      <span class="h-2.5 w-2.5 rounded-full" :class="dotState(c.status)" />
                      <p class="truncate text-base font-black text-slate-900 sm:text-lg dark:text-zinc-100">
                        {{ c.folio }}
                      </p>
                    </div>
    
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold"
                        :class="pillUiEstatus(crud.uiEstatus(c))"
                      >
                        <component :is="estatusIcon(crud.uiEstatus(c))" class="h-4 w-4" />
                        {{ crud.uiEstatus(c) }}
                      </span>
    
                      <span class="rounded-full px-3 py-1 text-[11px] font-extrabold" :class="pillState(c.status)">
                        {{ c.status }}
                      </span>
                    </div>
    
                    <div class="mt-3 space-y-1 text-xs">
                      <p class="inline-flex items-center gap-2 text-slate-700 dark:text-zinc-200">
                        <Mail class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                        {{ safe(c.email_destino) }}
                      </p>
                      <p class="inline-flex items-center gap-2 text-slate-700 dark:text-zinc-200">
                        <Phone class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                        {{ safe(c.telefono_destino) }}
                      </p>
    
                      <p class="inline-flex items-center gap-2 font-extrabold text-slate-900 dark:text-zinc-100">
                        <BadgeDollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                        $ {{ money(c.total) }}
                        <span class="font-semibold text-slate-500 dark:text-zinc-500">(subtotal {{ money(c.subtotal) }})</span>
                      </p>
                    </div>
                  </div>
    
                  <div class="flex flex-col gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      class="gap-2 border-slate-200 bg-white/70 text-slate-900 transition hover:bg-slate-50
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                      @click.prevent="crud.goEdit(c)"
                    >
                      <Pencil class="h-4 w-4" />
                      Abrir
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
    