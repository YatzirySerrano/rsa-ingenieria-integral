<script setup lang="ts">
import { computed } from 'vue'
import { Head } from '@inertiajs/vue3'
import PublicLayout from '@/layouts/PublicLayout.vue'
import {
  CheckCircle2,
  Clock3,
  FileText,
  Package,
  ShieldAlert,
  Sparkles,
  Mail,
  Phone,
} from 'lucide-vue-next'

type Detalle = {
  id: number
  cantidad: number | string
  precio_unitario: number | string
  total_linea: number | string
  producto?: {
    sku?: string | null
    nombre: string
    image_url?: string | null
  } | null
  servicio?: {
    nombre: string
  } | null
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
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function label(d: Detalle) {
  if (d.producto) return `${d.producto.sku ? d.producto.sku + ' · ' : ''}${d.producto.nombre}`
  if (d.servicio) return d.servicio.nombre
  return 'Item'
}

function itemType(d: Detalle) {
  return d.producto ? 'Producto' : d.servicio ? 'Servicio' : 'Ítem'
}

function resolveUrl(path?: string | null) {
  let p = String(path ?? '').trim()
  if (!p) return ''
  if (p.startsWith('http://') || p.startsWith('https://')) return p
  if (p.startsWith('storage/')) p = '/' + p
  if (!p.startsWith('/')) p = '/storage/' + p.replace(/^\/+/, '')
  p = p.replace('/storage//', '/storage/')
  return p
}

const statusUi = computed(() => {
  const e = String(props.item.estatus ?? '').toUpperCase()
  if (e === 'DEVUELTA') {
    return {
      text: 'Tu cotización está lista. Revisa tu correo o WhatsApp para más información.',
      badge: 'Lista',
      tone: 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300',
      icon: CheckCircle2,
    }
  }
  if (e === 'ENVIADA') {
    return {
      text: 'Tu cotización fue enviada correctamente.',
      badge: 'Enviada',
      tone: 'bg-sky-500/10 text-sky-700 ring-sky-500/20 dark:text-sky-300',
      icon: FileText,
    }
  }
  if (e === 'EN_REVISION') {
    return {
      text: 'Nuestro equipo está revisando tu solicitud.',
      badge: 'En revisión',
      tone: 'bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:text-amber-300',
      icon: Clock3,
    }
  }
  return {
    text: 'Hemos recibido tu solicitud.',
    badge: 'Recibida',
    tone: 'bg-slate-900/5 text-slate-700 ring-black/5 dark:bg-white/5 dark:text-zinc-300 dark:ring-white/10',
    icon: FileText,
  }
})

const totalItems = computed(() =>
  props.item.detalles.reduce((acc, d) => acc + (Number(d.cantidad) || 0), 0),
)
</script>

<template>
  <PublicLayout>
    <Head :title="`Cotización ${props.item.folio}`" />

    <div class="mx-auto w-full max-w-5xl px-4 pb-10 pt-24 sm:px-6 sm:pt-28 lg:px-8">
      <!-- Hero -->
      <div
        class="relative overflow-hidden rounded-[30px] border border-black/5 bg-white/90 shadow-sm backdrop-blur dark:border-white/10 dark:bg-zinc-900/70"
      >
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.12),transparent_32%)]" />

        <div class="relative p-5 sm:p-7">
          <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div class="max-w-3xl">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1"
                  :class="statusUi.tone"
                >
                  <component :is="statusUi.icon" class="mr-1.5 h-3.5 w-3.5" />
                  {{ statusUi.badge }}
                </span>

                <span
                  class="inline-flex items-center rounded-full bg-slate-900/5 px-3 py-1 text-xs font-black text-slate-700 ring-1 ring-black/5 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10"
                >
                  Folio {{ props.item.folio }}
                </span>
              </div>

              <h1 class="mt-4 text-2xl font-black tracking-tight text-slate-900 dark:text-zinc-100 sm:text-4xl">
                Gracias por tu preferencia
              </h1>

              <p class="mt-3 text-sm leading-6 text-slate-600 dark:text-zinc-400 sm:text-base">
                Nuestro equipo se pondrá en contacto contigo para brindarte más información.
              </p>

              <p class="mt-2 text-sm leading-6 text-slate-600 dark:text-zinc-400">
                {{ statusUi.text }}
              </p>
            </div>
          </div>

          <!-- Avisos -->
          <div class="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div class="rounded-2xl border border-sky-200/70 bg-sky-50/90 p-4 dark:border-sky-500/20 dark:bg-sky-500/10">
              <div class="flex items-start gap-3">
                <div class="rounded-xl bg-white/80 p-2 dark:bg-white/10">
                  <Sparkles class="h-5 w-5 text-sky-700 dark:text-sky-300" />
                </div>
                <div>
                  <p class="text-sm font-black text-slate-900 dark:text-zinc-100">Atención personalizada</p>
                  <p class="mt-1 text-xs leading-5 text-slate-600 dark:text-zinc-300">
                    Revisaremos tu solicitud para compartirte la mejor propuesta posible.
                  </p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-amber-200/70 bg-amber-50/90 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
              <div class="flex items-start gap-3">
                <div class="rounded-xl bg-white/80 p-2 dark:bg-white/10">
                  <ShieldAlert class="h-5 w-5 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <p class="text-sm font-black text-slate-900 dark:text-zinc-100">Disponibilidad</p>
                  <p class="mt-1 text-xs leading-5 text-slate-600 dark:text-zinc-300">
                    Los productos y servicios están sujetos a disponibilidad al momento de confirmar.
                  </p>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-fuchsia-200/70 bg-fuchsia-50/90 p-4 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/10">
              <div class="flex items-start gap-3">
                <div class="rounded-xl bg-white/80 p-2 dark:bg-white/10">
                  <Package class="h-5 w-5 text-fuchsia-700 dark:text-fuchsia-300" />
                </div>
                <div>
                  <p class="text-sm font-black text-slate-900 dark:text-zinc-100">Precios</p>
                  <p class="mt-1 text-xs leading-5 text-slate-600 dark:text-zinc-300">
                    Los precios mostrados están sujetos a disponibilidad y confirmación final.
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Detalle -->
      <div class="mt-6 rounded-[30px] border border-black/5 bg-white shadow-sm dark:border-white/10 dark:bg-zinc-900/60">
        <div class="border-b border-black/5 p-4 sm:p-5 dark:border-white/10">
          <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p class="text-lg font-black text-slate-900 dark:text-zinc-100">Detalle de tu cotización</p>
              <p class="text-sm text-slate-500 dark:text-zinc-400">
                Consulta los productos y servicios incluidos.
              </p>
            </div>
          </div>
        </div>

        <div v-if="props.item.detalles.length" class="divide-y divide-black/5 dark:divide-white/10">
          <div
            v-for="d in props.item.detalles"
            :key="d.id"
            class="group p-4 transition-all duration-300 hover:bg-slate-50/80 dark:hover:bg-white/[0.03] sm:p-5"
          >
            <div class="flex flex-col gap-4 sm:flex-row sm:items-start">
              <!-- Imagen -->
              <div
                class="h-24 w-full overflow-hidden rounded-2xl border border-black/5 bg-slate-100 dark:border-white/10 dark:bg-white/5 sm:w-28 sm:min-w-28"
              >
                <img
                  v-if="d.producto?.image_url"
                  :src="resolveUrl(d.producto.image_url)"
                  :alt="d.producto.nombre"
                  class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div v-else class="flex h-full items-center justify-center">
                  <Package class="h-8 w-8 text-slate-400 dark:text-zinc-500" />
                </div>
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div class="min-w-0">
                    <div class="flex flex-wrap items-center gap-2">
                      <span
                        class="inline-flex items-center rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] font-black text-slate-700 ring-1 ring-black/5 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10"
                      >
                        {{ itemType(d) }}
                      </span>
                    </div>

                    <p class="mt-2 text-base font-black text-slate-900 dark:text-zinc-100">
                      {{ label(d) }}
                    </p>

                    <div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <div class="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
                        <p class="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500">
                          Cantidad
                        </p>
                        <p class="mt-1 text-sm font-black text-slate-900 dark:text-zinc-100">
                          {{ d.cantidad }}
                        </p>
                      </div>

                      <div class="rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
                        <p class="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-500">
                          Precio unitario
                        </p>
                        <p class="mt-1 text-sm font-black text-slate-900 dark:text-zinc-100">
                          {{ money(d.precio_unitario) }}
                        </p>
                      </div>

                      <div class="rounded-2xl bg-sky-50 px-3 py-2 ring-1 ring-sky-500/10 dark:bg-sky-500/10 dark:ring-sky-500/20">
                        <p class="text-[11px] font-extrabold uppercase tracking-[0.12em] text-slate-500 dark:text-zinc-400">
                          Importe
                        </p>
                        <p class="mt-1 text-sm font-black text-slate-900 dark:text-zinc-100">
                          {{ money(d.total_linea) }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-else class="p-8 text-center">
          <p class="text-sm font-semibold text-slate-500 dark:text-zinc-400">
            No hay detalles disponibles en esta cotización.
          </p>
        </div>

        <!-- Totales -->
        <div class="border-t border-black/5 p-4 sm:p-5 dark:border-white/10">
          <div class="ml-auto max-w-md space-y-3">
            <div class="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-black/5 dark:bg-white/5 dark:ring-white/10">
              <span class="text-sm text-slate-600 dark:text-zinc-400">Subtotal</span>
              <span class="font-black text-slate-900 dark:text-zinc-100">{{ money(props.item.subtotal) }}</span>
            </div>

            <div class="flex items-center justify-between rounded-2xl bg-sky-50 px-4 py-3 ring-1 ring-sky-500/10 dark:bg-sky-500/10 dark:ring-sky-500/20">
              <span class="text-sm text-slate-700 dark:text-zinc-200">Total</span>
              <span class="text-lg font-black text-slate-900 dark:text-zinc-100">{{ money(props.item.total) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </PublicLayout>
</template>
