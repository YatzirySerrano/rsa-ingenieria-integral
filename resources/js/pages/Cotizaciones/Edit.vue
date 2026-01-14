<!-- resources/js/Pages/Cotizaciones/Edit.vue -->
<script setup lang="ts">
import { computed } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

// Si tienes estos componentes shadcn ya instalados, úsalos.
// Si no, puedes reemplazar por botones/inputs normales.
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { Paginated } from '@/types/common' // si no existe, no se usa aquí
import { useCotizacionCart } from '@/composables/crud/useCotizacionCart'

/**
 * Props desde backend:
 * - item: CotizacionResource con cabecera + detalles (detalles incluyen producto/servicio)
 * - meta: catálogos mínimos para acciones (tipos_item, estatuses...)
 *
 * Nota: si tu Resource trae otra forma, ajusta types abajo, no el flujo.
 */
type Detalle = {
  id: number
  producto_id?: number | null
  servicio_id?: number | null
  cantidad: number | string
  precio_unitario: number | string
  total_linea: number | string
  status: 'activo' | 'inactivo'
  producto?: { id: number; sku?: string | null; nombre: string } | null
  servicio?: { id: number; nombre: string } | null
}

type Cotizacion = {
  id: number
  folio: string
  estatus: string
  email_destino?: string | null
  telefono_destino?: string | null
  subtotal: number | string
  total: number | string
  status: 'activo' | 'inactivo'
  detalles?: Detalle[]
}

const props = defineProps<{
  item: { data: Cotizacion } | Cotizacion // a veces Resource viene como {data:{...}}
  meta?: {
    // si lo mandas en controller
    tipos_item?: string[]
    estatuses?: string[]
  }
}>()

/**
 * Normalizamos item (por si viene envuelto por Resource).
 */
const cotizacion = computed<Cotizacion>(() => {
  return (props.item as any)?.data ? (props.item as any).data : (props.item as any)
})

/**
 * Lógica de carrito (acciones y modales)
 */
const cart = useCotizacionCart({
  baseUrl: '/cotizaciones',
  cotizacion: cotizacion,
})

/**
 * UI: tabs simples (solo ENVIADAS / RECIBIDAS en index; aquí es carrito)
 * En este workspace no mostramos “pipeline”; mostramos “Estado” entendible.
 */
const estadoLabel = computed(() => {
  const e = String(cotizacion.value.estatus ?? '').toUpperCase().trim()
  if (e === 'ENVIADA') return 'Enviada'
  if (e === 'RECIBIDA') return 'Recibida'
  if (e === 'DEVUELTA') return 'Devuelta (revisa tu correo)'
  // BORRADOR u otros = carrito en edición
  return 'En edición'
})

const totalDetalles = computed(() => cart.detallesActivos.value.length)
</script>

<template>
  <AppLayout>
    <Head :title="`Cotización ${cotizacion.folio}`" />

    <div class="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6">
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="space-y-1">
          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
            Cotización <span class="opacity-80">#{{ cotizacion.folio }}</span>
          </h1>

          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span
              class="inline-flex items-center rounded-full px-3 py-1 font-bold
                     bg-emerald-500/10 text-emerald-700 dark:text-emerald-300
                     ring-1 ring-emerald-500/20"
            >
              {{ estadoLabel }}
            </span>

            <span
              class="inline-flex items-center rounded-full px-3 py-1 font-semibold
                     bg-slate-900/5 text-slate-700 dark:bg-white/5 dark:text-zinc-300
                     ring-1 ring-black/5 dark:ring-white/10"
            >
              Ítems: {{ totalDetalles }}
            </span>

            <span
              v-if="cotizacion.status === 'inactivo'"
              class="inline-flex items-center rounded-full px-3 py-1 font-bold
                     bg-rose-500/10 text-rose-700 dark:text-rose-300
                     ring-1 ring-rose-500/20"
            >
              Inactiva
            </span>
          </div>
        </div>

        <div class="flex flex-wrap gap-2">
          <Link href="/cotizaciones">
            <Button variant="secondary" class="font-extrabold">
              Volver
            </Button>
          </Link>

          <Button
            class="font-extrabold"
            :disabled="cotizacion.status === 'inactivo'"
            @click="cart.openAddItem()"
          >
            Agregar producto/servicio
          </Button>

          <Button
            variant="outline"
            class="font-extrabold"
            :disabled="cotizacion.status === 'inactivo'"
            @click="cart.openSend()"
          >
            Enviar cotización
          </Button>
        </div>
      </div>

      <!-- Body -->
      <div class="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <!-- Izquierda: detalle / carrito -->
        <div class="lg:col-span-2 space-y-4">
          <!-- Tabla / lista -->
          <div
            class="rounded-2xl border border-black/5 bg-white shadow-sm
                   dark:bg-zinc-900/60 dark:border-white/10"
          >
            <div class="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100">
                  Carrito
                </h2>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-zinc-400">
                  Agrega productos/servicios y ajusta cantidades. El total se recalcula solo.
                </p>
              </div>
            </div>

            <div class="border-t border-black/5 dark:border-white/10">
              <div v-if="cart.detallesActivos.value.length === 0" class="p-6 text-center">
                <p class="text-sm text-slate-600 dark:text-zinc-400">
                  Aún no hay ítems. Presiona <span class="font-bold">“Agregar producto/servicio”</span>.
                </p>
              </div>

              <div v-else class="divide-y divide-black/5 dark:divide-white/10">
                <div
                  v-for="d in cart.detallesActivos.value"
                  :key="d.id"
                  class="p-4 sm:p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div class="min-w-0">
                    <p class="font-black text-slate-900 dark:text-zinc-100 truncate">
                      {{ cart.itemLabel(d) }}
                    </p>
                    <p class="text-xs text-slate-600 dark:text-zinc-400">
                      Cantidad: <span class="font-bold">{{ d.cantidad }}</span>
                      · Precio: <span class="font-bold">{{ cart.money(d.precio_unitario) }}</span>
                    </p>
                  </div>

                  <div class="flex flex-wrap gap-2 sm:justify-end">
                    <Button variant="secondary" class="font-extrabold" @click="cart.openEditDetalle(d)">
                      Editar
                    </Button>
                    <Button
                      variant="destructive"
                      class="font-extrabold"
                      @click="cart.removeDetalle(d)"
                    >
                      Quitar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Nota / info de envío -->
          <div
            class="rounded-2xl border border-black/5 bg-white shadow-sm p-4 sm:p-5
                   dark:bg-zinc-900/60 dark:border-white/10"
          >
            <h3 class="font-black text-slate-900 dark:text-zinc-100">Datos del cliente</h3>
            <p class="text-sm text-slate-600 dark:text-zinc-400 mt-1">
              Solo para enviar la cotización. Puedes dejarlo vacío y completarlo al final.
            </p>

            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-xs font-extrabold text-slate-700 dark:text-zinc-300">Correo</label>
                <Input
                  :model-value="cotizacion.email_destino ?? ''"
                  readonly
                  class="opacity-80"
                />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-extrabold text-slate-700 dark:text-zinc-300">Teléfono</label>
                <Input
                  :model-value="cotizacion.telefono_destino ?? ''"
                  readonly
                  class="opacity-80"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Derecha: resumen -->
        <div class="space-y-4">
          <div
            class="rounded-2xl border border-black/5 bg-white shadow-sm p-4 sm:p-5
                   dark:bg-zinc-900/60 dark:border-white/10"
          >
            <h3 class="text-base font-black text-slate-900 dark:text-zinc-100">Resumen</h3>

            <div class="mt-4 space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-600 dark:text-zinc-400">Subtotal</span>
                <span class="font-black text-slate-900 dark:text-zinc-100">
                  {{ cart.money(cotizacion.subtotal) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-slate-600 dark:text-zinc-400">Total</span>
                <span class="font-black text-slate-900 dark:text-zinc-100">
                  {{ cart.money(cotizacion.total) }}
                </span>
              </div>
            </div>

            <div class="mt-5 flex flex-col gap-2">
              <Button
                class="font-extrabold"
                :disabled="cotizacion.status === 'inactivo' || cart.detallesActivos.value.length === 0"
                @click="cart.openSend()"
              >
                Enviar
              </Button>

              <Button
                variant="secondary"
                class="font-extrabold"
                :disabled="cotizacion.status === 'inactivo'"
                @click="cart.openAddItem()"
              >
                Agregar más
              </Button>
            </div>

            <p class="mt-4 text-xs text-slate-600 dark:text-zinc-400">
              “Devuelta” significa que el cliente debe revisar su correo para la respuesta.
            </p>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
