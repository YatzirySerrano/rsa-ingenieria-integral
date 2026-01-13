<script setup lang="ts">
    import { computed } from 'vue'
    import { Head } from '@inertiajs/vue3'
    import AppLayout from '@/layouts/AppLayout.vue'
    
    import { useCotizacionShow } from '@/composables/crud/useCotizacionShow'
    
    import PrimaryButton from '@/components/ui/PrimaryButton.vue'
    import SecondaryButton from '@/components/ui/SecondaryButton.vue'
    
    /**
     * UI state (props + acciones) provisto por tu composable.
     * No tocamos backend, solo consumimos lo que ya llega.
     */
    const ui = useCotizacionShow()
    
    /**
     * Null-safety:
     * Si por alguna razón los props tardan o vienen incompletos,
     * evitamos que el template truene.
     */
    const cotizacion = computed(() => ui.props?.cotizacion)
    
    /**
     * Formateo simple de dinero (sin dependencias).
     * Si tus campos ya vienen formateados como string, esto lo respeta.
     */
    function money(v: unknown) {
      if (v === null || v === undefined) return '0.00'
      const n = typeof v === 'number' ? v : Number(v)
      if (Number.isNaN(n)) return String(v)
      return n.toFixed(2)
    }
    </script>
    
    <template>
      <AppLayout>
        <Head :title="cotizacion ? `Cotización ${cotizacion.folio}` : 'Cotización'" />
    
        <div class="px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Cotización {{ cotizacion?.folio ?? '—' }}
              </h1>
              <p class="mt-1 text-sm text-slate-600 dark:text-neutral-300">
                Ticket con detalle de productos/servicios. El envío dispara el correo.
              </p>
            </div>
    
            <div class="flex gap-2">
              <SecondaryButton @click="ui.createDraft">Nueva cotización</SecondaryButton>
            </div>
          </div>
    
          <div class="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div
              class="xl:col-span-2 rounded-2xl border border-black/10 dark:border-white/10
                     bg-white dark:bg-neutral-900 shadow-sm overflow-hidden"
            >
              <div class="px-4 py-4 border-b border-black/5 dark:border-white/10">
                <div class="flex items-center justify-between">
                  <div class="text-sm font-semibold text-slate-900 dark:text-white">Detalles</div>
                  <div class="text-xs text-slate-600 dark:text-neutral-400">
                    Estatus:
                    <b>{{ cotizacion?.estatus ?? '—' }}</b>
                  </div>
                </div>
              </div>
    
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                  <thead class="bg-slate-50 dark:bg-neutral-800/60 text-slate-700 dark:text-neutral-200">
                    <tr>
                      <th class="text-left px-4 py-3 font-semibold">Tipo</th>
                      <th class="text-left px-4 py-3 font-semibold">Item</th>
                      <th class="text-right px-4 py-3 font-semibold">Cant.</th>
                      <th class="text-right px-4 py-3 font-semibold">PU</th>
                      <th class="text-right px-4 py-3 font-semibold">Total</th>
                      <th class="text-right px-4 py-3 font-semibold">Acciones</th>
                    </tr>
                  </thead>
    
                  <tbody>
                    <tr
                      v-for="d in (cotizacion?.detalles ?? [])"
                      :key="d.id"
                      class="border-t border-black/5 dark:border-white/10 hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition"
                    >
                      <td class="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                        {{ d.tipo }}
                      </td>
    
                      <td class="px-4 py-3 text-slate-800 dark:text-neutral-200">
                        <div class="font-semibold">
                          {{ d.producto ? `${d.producto.sku} — ${d.producto.nombre}` : (d.servicio?.nombre ?? '—') }}
                        </div>
                      </td>
    
                      <td class="px-4 py-3 text-right">{{ d.cantidad }}</td>
    
                      <td class="px-4 py-3 text-right">
                        ${{ money(d.precio_unitario) }}
                      </td>
    
                      <td class="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                        ${{ money(d.total_linea) }}
                      </td>
    
                      <td class="px-4 py-3 text-right">
                        <button
                          type="button"
                          class="rounded-xl px-3 py-2 text-sm font-semibold transition
                                 bg-rose-600 text-white hover:bg-rose-700 hover:-translate-y-[1px] active:translate-y-0"
                          @click="ui.removeDetalle(d.id)"
                        >
                          Quitar
                        </button>
                      </td>
                    </tr>
    
                    <tr v-if="(cotizacion?.detalles?.length ?? 0) === 0">
                      <td colspan="6" class="px-4 py-10 text-center text-slate-600 dark:text-neutral-300">
                        Aún no hay items en esta cotización.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
    
              <div class="px-4 py-4 border-t border-black/5 dark:border-white/10 flex justify-end">
                <div class="text-right">
                  <div class="text-sm text-slate-600 dark:text-neutral-300">
                    Subtotal: ${{ money(cotizacion?.subtotal) }}
                  </div>
                  <div class="text-lg font-extrabold text-slate-900 dark:text-white">
                    Total: ${{ money(cotizacion?.total) }}
                  </div>
                </div>
              </div>
            </div>
    
            <div class="rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm p-4 sm:p-5">
              <h3 class="text-sm font-bold text-slate-900 dark:text-white">Enviar por correo</h3>
              <p class="mt-1 text-xs text-slate-600 dark:text-neutral-400">
                Esto enviará el ticket al email destino y actualizará estatus.
              </p>
    
              <form class="mt-4 grid grid-cols-1 gap-3" @submit.prevent="ui.send">
                <div>
                  <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Email destino *</label>
                  <input
                    v-model="ui.sendForm.email_destino"
                    type="email"
                    autocomplete="email"
                    class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                  />
                  <div v-if="ui.sendForm.errors.email_destino" class="mt-1 text-xs text-rose-600">
                    {{ ui.sendForm.errors.email_destino }}
                  </div>
                </div>
    
                <div>
                  <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Teléfono</label>
                  <input
                    v-model="ui.sendForm.telefono_destino"
                    inputmode="tel"
                    autocomplete="tel"
                    class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
                  />
                  <div v-if="ui.sendForm.errors.telefono_destino" class="mt-1 text-xs text-rose-600">
                    {{ ui.sendForm.errors.telefono_destino }}
                  </div>
                </div>
    
                <div class="flex justify-end gap-2 pt-2">
                  <PrimaryButton type="submit" :disabled="ui.sendForm.processing">
                    {{ ui.sendForm.processing ? 'Enviando...' : 'Enviar' }}
                  </PrimaryButton>
                </div>
              </form>
            </div>
          </div>
        </div>
      </AppLayout>
    </template>
    