<script setup lang="ts">
import { computed } from 'vue'
import { Head } from '@inertiajs/vue3'
import PublicLayout from '@/layouts/PublicLayout.vue'

type Detalle = {
  id: number
  cantidad: number | string
  precio_unitario: number | string
  total_linea: number | string
  producto?: { sku?: string | null; nombre: string } | null
  servicio?: { nombre: string } | null
}

type Cotizacion = {
  folio: string
  token: string
  estatus: string
  email_destino?: string | null
  telefono_destino?: string | null
  subtotal: number | string
  total: number | string
  detalles: Detalle[]
}

const props = defineProps<{ item: Cotizacion }>()

function money(v: any) {
  const n = Number(v ?? 0)
  return n.toLocaleString('es-MX', { style:'currency', currency:'MXN' })
}

function label(d: Detalle) {
  if (d.producto) return `${d.producto.sku ? d.producto.sku + ' · ' : ''}${d.producto.nombre}`
  if (d.servicio) return d.servicio.nombre
  return 'Item'
}

const statusUi = computed(() => {
  const e = String(props.item.estatus ?? '').toUpperCase()
  if (e === 'DEVUELTA') return 'Tu cotización está lista. Revisa tu correo/WhatsApp.'
  if (e === 'ENVIADA') return 'Cotización enviada.'
  if (e === 'EN_REVISION') return 'En revisión.'
  return 'Recibida.'
})
</script>

<template>
  <PublicLayout>
    <Head :title="`Cotización ${props.item.folio}`" />

    <div class="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 pb-8 pt-24 sm:pt-28">
      <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
        Cotización {{ props.item.folio }}
      </h1>
      <p class="mt-2 text-sm text-slate-600 dark:text-zinc-400">{{ statusUi }}</p>

      <div class="mt-6 rounded-2xl border border-black/5 bg-white shadow-sm dark:bg-zinc-900/60 dark:border-white/10">
        <div class="p-4 sm:p-5 border-b border-black/5 dark:border-white/10">
          <p class="font-black text-slate-900 dark:text-zinc-100">Detalle</p>
        </div>

        <div class="divide-y divide-black/5 dark:divide-white/10">
          <div v-for="d in props.item.detalles" :key="d.id" class="p-4 sm:p-5">
            <p class="font-black text-slate-900 dark:text-zinc-100">{{ label(d) }}</p>
            <p class="text-xs text-slate-600 dark:text-zinc-400 mt-1">
              Cantidad {{ d.cantidad }} · Precio {{ money(d.precio_unitario) }} · Total {{ money(d.total_linea) }}
            </p>
          </div>
        </div>

        <div class="p-4 sm:p-5 border-t border-black/5 dark:border-white/10">
          <div class="flex items-center justify-between">
            <span class="text-slate-600 dark:text-zinc-400">Total</span>
            <span class="font-black text-slate-900 dark:text-zinc-100">{{ money(props.item.total) }}</span>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
