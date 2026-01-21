<script setup lang="ts">
    import { Head } from '@inertiajs/vue3'
    import { computed } from 'vue'
    
    import AppLayout from '@/layouts/AppLayout.vue'
    import PaginationLinks from '@/components/ui/PaginationLinks.vue'
    import { Button } from '@/components/ui/button'
    import { Input } from '@/components/ui/input'
    
    import type { Paginated } from '@/types/common'
    import { useCotizacionPanel, type Cotizacion } from '@/composables/useCotizacionPanel'
    
    import {
      Search,
      RefreshCw,
      Hash,
      Mail,
      Phone,
      BadgeDollarSign,
      Inbox,
      Send,
      MessageCircle,
      FileCheck2,
      Undo2,
      AlertTriangle,
    } from 'lucide-vue-next'
    
    /**
     * Panel interno de cotizaciones
     * ----------------------------
     * - Recibes cotizaciones hechas en el public (guest)
     * - Aquí validas totales, aplicas descuento si aplica y devuelves al cliente
     * - Botones: Enviar por Gmail / Enviar por WhatsApp
     * - NOTA: No es ecommerce, es cotización (cotización manualmente revisada)
     */
    const props = defineProps<{
      items: Paginated<Cotizacion>
      filters: Partial<{ q: string; estatus: string }>
      meta: { estatuses: string[] }
    }>()
    
    const panel = useCotizacionPanel({
      initialFilters: props.filters,
      baseUrl: '/panel/cotizaciones',
    })
    
    // KPIs (operativos)
    const stats = computed(() => {
      const d = props.items.data ?? []
      const ui = d.map((x) => panel.uiEstatus(x))
      return {
        page: d.length,
        nuevas: ui.filter((x) => x === 'NUEVA').length,
        enRevision: ui.filter((x) => x === 'EN_REVISION').length,
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
    
    function pillUiEstatus(e: ReturnType<typeof panel.uiEstatus>) {
      const map: Record<string, string> = {
        NUEVA: 'bg-blue-500/10 text-blue-700 ring-1 ring-blue-500/20 dark:text-blue-200',
        EN_REVISION: 'bg-amber-500/10 text-amber-800 ring-1 ring-amber-500/20 dark:text-amber-200',
        DEVUELTA: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-200',
      }
      return map[e] ?? 'bg-slate-500/10 text-slate-700 ring-1 ring-slate-500/15 dark:text-zinc-200'
    }
    
    function estatusIcon(e: ReturnType<typeof panel.uiEstatus>) {
      if (e === 'NUEVA') return Inbox
      if (e === 'EN_REVISION') return FileCheck2
      if (e === 'DEVUELTA') return Undo2
      return Inbox
    }
    
    function diffBadgeClass(diff?: number | null) {
      const d = Number(diff ?? 0)
      if (!d) return 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-200'
      return 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-200'
    }
    </script>
    
    <template>
      <Head title="Cotizaciones | Panel" />
    
      <AppLayout>
        <div class="px-4 py-5 sm:px-6 lg:px-10 2xl:px-14">
          <!-- Header -->
          <div
            class="rounded-3xl border border-slate-200/70 bg-white/80 p-4 shadow-sm backdrop-blur
                   dark:border-white/10 dark:bg-zinc-950/50"
          >
            <div class="flex flex-col gap-4">
              <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div class="min-w-0">
                  <h1 class="truncate text-lg font-black tracking-tight text-slate-900 sm:text-xl lg:text-2xl dark:text-zinc-100">
                    Cotizaciones (Panel)
                  </h1>
                  <p class="mt-1 text-xs text-slate-600 sm:text-sm dark:text-zinc-400">
                    Aquí solo se revisa, se ajusta si aplica y se devuelve al cliente. No hay compras en línea.
                  </p>
                </div>
    
                <div class="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    class="gap-2 border-slate-200 bg-white/70 text-slate-900 transition hover:bg-slate-50 active:scale-[.99]
                           dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                    @click="panel.resetFilters"
                    :disabled="!panel.hasActiveFilters"
                  >
                    <RefreshCw class="h-4 w-4" />
                    <span class="text-sm font-semibold">Reiniciar</span>
                  </Button>
                </div>
              </div>
    
              <!-- KPIs -->
              <div class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 lg:max-w-4xl">
                <div class="rounded-2xl border border-slate-200 bg-white/60 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                  <p class="text-[11px] font-bold text-slate-500 dark:text-zinc-400">En esta página</p>
                  <p class="text-base font-black text-slate-900 sm:text-lg dark:text-zinc-100">{{ stats.page }}</p>
                </div>
    
                <div class="rounded-2xl border border-blue-200 bg-blue-50 px-3 py-2 dark:border-blue-500/20 dark:bg-blue-500/10">
                  <p class="text-[11px] font-bold text-blue-700/80 dark:text-blue-200/80">Nuevas</p>
                  <p class="text-base font-black text-blue-800 sm:text-lg dark:text-blue-200">{{ stats.nuevas }}</p>
                </div>
    
                <div class="rounded-2xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-500/20 dark:bg-amber-500/10">
                  <p class="text-[11px] font-bold text-amber-800/80 dark:text-amber-200/80">En revisión</p>
                  <p class="text-base font-black text-amber-900 sm:text-lg dark:text-amber-200">{{ stats.enRevision }}</p>
                </div>
    
                <div class="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-500/20 dark:bg-emerald-500/10">
                  <p class="text-[11px] font-bold text-emerald-700/80 dark:text-emerald-200/80">Devueltas</p>
                  <p class="text-base font-black text-emerald-800 sm:text-lg dark:text-emerald-200">{{ stats.devueltas }}</p>
                </div>
              </div>
    
              <!-- Filters -->
              <div class="grid grid-cols-1 gap-2 md:grid-cols-12 md:items-end">
                <div class="md:col-span-12 lg:col-span-6">
                  <label class="mb-1 flex items-center gap-2 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    <Search class="h-4 w-4 opacity-70" />
                    Buscar
                  </label>
    
                  <div class="relative">
                    <Input
                      v-model="panel.filters.q"
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
    
                <div class="md:col-span-6 lg:col-span-3">
                  <label class="mb-1 text-xs font-extrabold text-slate-700 dark:text-zinc-300">
                    Estatus
                  </label>
    
                  <select
                    v-model="panel.filters.estatus"
                    class="h-10 w-full rounded-xl border border-slate-200 bg-white/70 px-3 text-sm font-semibold text-slate-900
                           outline-none transition hover:bg-white focus:border-emerald-500/40 focus:ring-4 focus:ring-emerald-500/15
                           dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                  >
                    <option :value="panel.ALL">Todos</option>
                    <option v-for="e in props.meta.estatuses" :key="e" :value="e">{{ e }}</option>
                  </select>
                </div>
    
                <div class="md:col-span-6 lg:col-span-3">
                  <p class="text-xs text-slate-500 dark:text-zinc-500 md:pt-7">
                    Flujo: Public envía → Panel revisa → Panel devuelve por WhatsApp o Email.
                  </p>
                </div>
              </div>
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
                <p class="text-sm font-black text-slate-900 dark:text-zinc-100">Cotizaciones recibidas</p>
                <p class="text-xs text-slate-500 dark:text-zinc-500">
                  Responder = registrar ajuste/resumen y dejar lista para enviar.
                </p>
              </div>
    
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-slate-50 text-slate-700 dark:bg-white/5 dark:text-zinc-300">
                    <tr>
                      <th class="px-5 py-3 text-left font-extrabold">Folio</th>
                      <th class="px-5 py-3 text-left font-extrabold">Cliente</th>
                      <th class="px-5 py-3 text-left font-extrabold">Estatus</th>
                      <th class="px-5 py-3 text-left font-extrabold">Total</th>
                      <th class="px-5 py-3 text-left font-extrabold">Control</th>
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
                          :class="pillUiEstatus(panel.uiEstatus(c))"
                        >
                          <component :is="estatusIcon(panel.uiEstatus(c))" class="h-4 w-4" />
                          {{ panel.uiEstatus(c) }}
                        </span>
                        <p class="mt-1 text-xs text-slate-500 dark:text-zinc-500">
                          Backend: {{ c.estatus }}
                        </p>
                      </td>
    
                      <td class="px-5 py-4">
                        <p class="inline-flex items-center gap-2 font-extrabold text-slate-900 dark:text-zinc-100">
                          <BadgeDollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                          $ {{ money(c.total) }}
                        </p>
                        <p class="text-xs text-slate-500 dark:text-zinc-500">
                          Subtotal: $ {{ money(c.subtotal) }}
                        </p>
                      </td>
    
                      <td class="px-5 py-4">
                        <div class="flex flex-col gap-2">
                          <div class="inline-flex items-center gap-2">
                            <span class="text-xs font-bold text-slate-500 dark:text-zinc-500">Dif:</span>
                            <span
                              class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold"
                              :class="diffBadgeClass(c.diferencia_total ?? null)"
                              :title="c.diferencia_total ? 'Diferencia detectada (cliente vs sistema).' : 'OK'"
                            >
                              <component :is="(c.diferencia_total ? AlertTriangle : FileCheck2)" class="h-4 w-4" />
                              {{ c.diferencia_total ? money(c.diferencia_total) : 'OK' }}
                            </span>
                          </div>
    
                          <p class="text-xs text-slate-500 dark:text-zinc-500">
                            Calc: $ {{ c.total_calculado != null ? money(c.total_calculado) : '—' }}
                          </p>
                        </div>
                      </td>
    
                      <td class="px-5 py-4 text-right">
                        <div class="inline-flex flex-wrap items-center justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            class="gap-2 border-slate-200 bg-white/70 text-slate-900 transition hover:bg-slate-50 active:scale-[.99]
                                   dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                            @click.prevent="panel.openDetail(c)"
                          >
                            <Inbox class="h-4 w-4" />
                            <span class="font-extrabold">Abrir</span>
                          </Button>
    
                          <Button
                            type="button"
                            size="sm"
                            class="gap-2 bg-amber-600 text-white transition hover:bg-amber-500 active:scale-[.99]
                                   dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400"
                            @click.prevent="panel.replyFlow(c)"
                          >
                            <FileCheck2 class="h-4 w-4" />
                            <span class="font-extrabold">Responder</span>
                          </Button>
    
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            class="gap-2 border-slate-200 bg-white/70 text-slate-900 transition hover:bg-slate-50 active:scale-[.99]
                                   dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                            :disabled="!panel.canSendEmail(c)"
                            @click.prevent="panel.sendEmail(c)"
                            :title="panel.canSendEmail(c) ? 'Enviar respuesta por correo' : 'Primero responde o agrega correo válido'"
                          >
                            <Send class="h-4 w-4" />
                            <span class="font-extrabold">Gmail</span>
                          </Button>
    
                          <Button
                            type="button"
                            size="sm"
                            class="gap-2 bg-emerald-600 text-white transition hover:bg-emerald-500 active:scale-[.99]
                                   dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                            :disabled="!panel.canSendWhatsapp(c)"
                            @click.prevent="panel.sendWhatsapp(c)"
                            :title="panel.canSendWhatsapp(c) ? 'Enviar respuesta por WhatsApp' : 'Primero responde o agrega teléfono válido'"
                          >
                            <MessageCircle class="h-4 w-4" />
                            <span class="font-extrabold">WhatsApp</span>
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
                    <p class="truncate text-base font-black text-slate-900 sm:text-lg dark:text-zinc-100">
                      {{ c.folio }}
                    </p>
    
                    <div class="mt-2 flex flex-wrap gap-2">
                      <span
                        class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold"
                        :class="pillUiEstatus(panel.uiEstatus(c))"
                      >
                        <component :is="estatusIcon(panel.uiEstatus(c))" class="h-4 w-4" />
                        {{ panel.uiEstatus(c) }}
                      </span>
    
                      <span
                        class="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-extrabold"
                        :class="diffBadgeClass(c.diferencia_total ?? null)"
                      >
                        <component :is="(c.diferencia_total ? AlertTriangle : FileCheck2)" class="h-4 w-4" />
                        {{ c.diferencia_total ? ('Dif ' + money(c.diferencia_total)) : 'Totales OK' }}
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
                      @click.prevent="panel.openDetail(c)"
                    >
                      <Inbox class="h-4 w-4" />
                      Abrir
                    </Button>
    
                    <Button
                      type="button"
                      size="sm"
                      class="gap-2 bg-amber-600 text-white transition hover:bg-amber-500
                             dark:bg-amber-500 dark:text-zinc-950 dark:hover:bg-amber-400"
                      @click.prevent="panel.replyFlow(c)"
                    >
                      <FileCheck2 class="h-4 w-4" />
                      Responder
                    </Button>
    
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      class="gap-2 border-slate-200 bg-white/70 text-slate-900 transition hover:bg-slate-50
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                      :disabled="!panel.canSendEmail(c)"
                      @click.prevent="panel.sendEmail(c)"
                    >
                      <Send class="h-4 w-4" />
                      Gmail
                    </Button>
    
                    <Button
                      type="button"
                      size="sm"
                      class="gap-2 bg-emerald-600 text-white transition hover:bg-emerald-500
                             dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
                      :disabled="!panel.canSendWhatsapp(c)"
                      @click.prevent="panel.sendWhatsapp(c)"
                    >
                      <MessageCircle class="h-4 w-4" />
                      WhatsApp
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
    