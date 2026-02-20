<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch, onBeforeUnmount } from 'vue'
import { Head, Link } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { useCotizacionCart, type Cotizacion, type Detalle } from '@/composables/crud/useCotizacionCart'

import {
  ArrowLeft,
  ExternalLink,
  Copy,
  Plus,
  Minus,
  Send,
  CheckCircle2,
  ShoppingCart,
  Trash2,
  Search,
  Package,
  Briefcase,
  ImageOff,
} from 'lucide-vue-next'
import type { BreadcrumbItem } from '@/types'

type ProductoMedia = { id: number; url: string; principal?: boolean; orden?: number; tipo?: string }
type Producto = { id: number; sku?: string | null; nombre: string; precio_venta: number | string; image_url?: string | null; medias?: ProductoMedia[] }
type Servicio = { id: number; nombre: string; precio: number | string }

const props = defineProps<{
  item: Cotizacion
  meta: { estatuses?: string[]; productos: Producto[]; servicios: Servicio[] }
}>()

const cotizacion = computed(() => props.item)

const cart = useCotizacionCart({
  baseUrl: '/cotizaciones',
  cotizacion,
})

const estatusUpper = computed(() => String(cotizacion.value.estatus ?? '').toUpperCase().trim())
const isEnviada = computed(() => estatusUpper.value === 'ENVIADA')
const canAct = computed(() => cotizacion.value.status === 'activo')
const canEditCart = computed(() => canAct.value && !isEnviada.value)

const estadoLabel = computed(() => {
  if (estatusUpper.value === 'ENVIADA') return 'Enviada'
  if (estatusUpper.value === 'DEVUELTA') return 'Devuelta (lista para enviar)'
  if (estatusUpper.value === 'EN_REVISION') return 'En revisión'
  return 'Nueva'
})

const estadoTone = computed(() => {
  if (estatusUpper.value === 'ENVIADA') return 'bg-emerald-500/10 text-emerald-700 ring-emerald-500/20 dark:text-emerald-300'
  if (estatusUpper.value === 'DEVUELTA') return 'bg-amber-500/10 text-amber-800 ring-amber-500/20 dark:text-amber-300'
  if (estatusUpper.value === 'EN_REVISION') return 'bg-sky-500/10 text-sky-800 ring-sky-500/20 dark:text-sky-300'
  return 'bg-slate-900/5 text-slate-700 ring-black/5 dark:bg-white/5 dark:text-zinc-300 dark:ring-white/10'
})

const totalDetalles = computed(() => cart.detallesActivos.value.length)

function guestLink() {
  return `${window.location.origin}/cotizacion/${cotizacion.value.token}`
}

const breadcrumbs: BreadcrumbItem[] = [
  { title: 'Cotizaciones', href: '/cotizaciones' },
  { title: `Cotización #${props.item.folio}`, href: `/cotizaciones/${props.item.id}` },
]

/* Toast ligero (no Swal) */
const toast = reactive({ show: false, title: '', subtitle: '' })
let tToast: number | null = null
function showToast(title: string, subtitle = '') {
  toast.title = title
  toast.subtitle = subtitle
  toast.show = true
  if (tToast) window.clearTimeout(tToast)
  tToast = window.setTimeout(() => (toast.show = false), 1200)
}

async function copyGuestLink() {
  const link = guestLink()
  try {
    await navigator.clipboard.writeText(link)
    showToast('Link copiado', 'Pégalo en WhatsApp o correo.')
  } catch {
    showToast('No se pudo copiar', 'Tu navegador bloqueó el portapapeles.')
  }
}

onBeforeUnmount(() => {
  if (tToast) window.clearTimeout(tToast)
})

/* Cantidad inline (no letras) */
const qty = reactive<Record<number, string>>({})
const timers: Record<number, number> = {}

function onlyDigitsKeydown(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  const allowed = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
  if (allowed.includes(e.key)) return
  if (!/^\d$/.test(e.key)) e.preventDefault()
}

function sanitizeDigits(v: string) {
  return String(v ?? '').replace(/[^\d]/g, '')
}

function syncQtyFromProps() {
  for (const d of cart.detallesActivos.value) {
    const n = Math.max(1, Number(d.cantidad) || 1)
    qty[d.id] = String(n)
  }
}

watch(
  () => cart.detallesActivos.value.map((d) => `${d.id}:${d.cantidad}`),
  () => syncQtyFromProps(),
  { immediate: true }
)

function scheduleUpdate(d: Detalle, next: number) {
  if (!canEditCart.value) return
  const safe = Math.max(1, next | 0)
  qty[d.id] = String(safe)

  if (timers[d.id]) window.clearTimeout(timers[d.id])
  timers[d.id] = window.setTimeout(() => {
    cart.updateCantidad(d.id, safe)
  }, 260)
}

function onQtyInput(d: Detalle, ev: Event) {
  if (!canEditCart.value) return
  const el = ev.target as HTMLInputElement
  const clean = sanitizeDigits(el.value)
  el.value = clean
  qty[d.id] = clean
}

function onQtyBlur(d: Detalle) {
  if (!canEditCart.value) return
  const n = parseInt(qty[d.id] || '0', 10)
  if (!Number.isFinite(n) || n < 1) {
    const cur = Math.max(1, Number(d.cantidad) || 1)
    qty[d.id] = String(cur)
    return
  }
  scheduleUpdate(d, n)
}

function inc(d: Detalle) {
  const cur = parseInt(qty[d.id] || '1', 10) || 1
  scheduleUpdate(d, cur + 1)
}

function dec(d: Detalle) {
  const cur = parseInt(qty[d.id] || '1', 10) || 1
  scheduleUpdate(d, Math.max(1, cur - 1))
}

/* Catálogo precargado */
const tab = ref<'PRODUCTO' | 'SERVICIO'>('PRODUCTO')
const q = ref('')
const brokenImgs = reactive(new Set<number>())

function toNumber(v: any) {
  const n = typeof v === 'string' ? Number(v) : Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}
function money(v: any) {
  return toNumber(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
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

function pickImage(p: Producto) {
  if (brokenImgs.has(p.id)) return ''
  const primaryFromArray = p.medias?.find((m) => !!m.principal)?.url || p.medias?.[0]?.url || null
  const src = p.image_url || primaryFromArray || null
  return resolveUrl(src)
}
function onImgError(id: number) {
  brokenImgs.add(id)
}

const productosFiltrados = computed(() => {
  const term = q.value.trim().toLowerCase()
  const all = props.meta.productos ?? []
  if (!term) return all
  return all.filter((p) => `${p.sku ?? ''} ${p.nombre}`.toLowerCase().includes(term))
})

const serviciosFiltrados = computed(() => {
  const term = q.value.trim().toLowerCase()
  const all = props.meta.servicios ?? []
  if (!term) return all
  return all.filter((s) => `${s.nombre}`.toLowerCase().includes(term))
})

function addProducto(id: number) {
  if (!canEditCart.value) return
  cart.addItem({ tipo: 'PRODUCTO', producto_id: id, cantidad: 1 })
  const p = props.meta.productos.find((x) => x.id === id)
  showToast('Agregado al carrito', p?.nombre || 'Producto')
}
function addServicio(id: number) {
  if (!canEditCart.value) return
  cart.addItem({ tipo: 'SERVICIO', servicio_id: id, cantidad: 1 })
  const s = props.meta.servicios.find((x) => x.id === id)
  showToast('Agregado al carrito', s?.nombre || 'Servicio')
}

/* Reply inline (sin modal Swal) */
const replyForm = reactive({
  email_destino: String(cotizacion.value.email_destino ?? ''),
  telefono_destino: String(cotizacion.value.telefono_destino ?? ''),
})

watch(
  () => [cotizacion.value.email_destino, cotizacion.value.telefono_destino],
  () => {
    replyForm.email_destino = String(cotizacion.value.email_destino ?? '')
    replyForm.telefono_destino = String(cotizacion.value.telefono_destino ?? '')
  }
)

function cleanEmail(v: string) {
  return v.trim()
}
function cleanPhone(v: string) {
  return v.replace(/[^\d]/g, '').trim()
}

async function submitReply() {
  const email = cleanEmail(replyForm.email_destino)
  const tel = cleanPhone(replyForm.telefono_destino)

  if (!email && !tel) {
    showToast('Falta contacto', 'Captura correo o teléfono.')
    return
  }

  await cart.reply({
    email_destino: email || null,
    telefono_destino: tel || null,
  })
}

onMounted(() => {
  const url = new URL(window.location.href)
  if (url.searchParams.get('reply') === '1') {
    const el = document.getElementById('reply-card')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
})
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head :title="`Cotización ${cotizacion.folio}`" />

    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-150"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div v-if="toast.show" class="fixed left-1/2 top-5 z-[9999] -translate-x-1/2">
          <div class="rounded-2xl border border-black/5 bg-white/85 backdrop-blur px-4 py-3 shadow-lg dark:border-white/10 dark:bg-zinc-900/80">
            <div class="flex items-start gap-3">
              <div class="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
              <div class="min-w-[240px]">
                <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{{ toast.title }}</p>
                <p v-if="toast.subtitle" class="text-xs font-semibold text-slate-600 dark:text-zinc-400">{{ toast.subtitle }}</p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div class="w-full px-3 sm:px-4 lg:px-6 xl:px-8 2xl:px-10 py-6 bg-gradient-to-b from-slate-50 to-white dark:from-zinc-950 dark:to-zinc-950">
      <!-- Header -->
      <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <!-- Actions -->
        <div class="flex flex-wrap gap-2">
          <Link href="/cotizaciones">
            <Button
              variant="secondary"
              class="h-11 rounded-2xl font-extrabold gap-2 border border-black/5 bg-white/80 backdrop-blur shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[.99] dark:border-white/10 dark:bg-white/5"
            >
              <ArrowLeft class="h-4 w-4" />
              Volver
            </Button>
          </Link>

          <Button
                class="h-11 rounded-2xl font-extrabold gap-2 bg-sky-600 text-white shadow-sm transition-all duration-200 hover:bg-sky-500 hover:-translate-y-0.5 hover:shadow-md active:scale-[.99]"
                :disabled="!canAct"
                @click="submitReply"
              >
                <Send class="h-4 w-4" />
                Marcar DEVUELTA
            </Button>

        </div>

        <div class="space-y-2">
          <div class="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-black/5 bg-white/80 backdrop-blur p-3 shadow-sm dark:border-white/10 dark:bg-white/5">
            <div class="min-w-0">
              <p class="text-[11px] font-extrabold text-slate-500 dark:text-zinc-400">Link Guest</p>
              <a
                class="block truncate text-sm font-black text-slate-900 underline decoration-slate-300 underline-offset-4 transition-colors hover:text-sky-700 dark:text-zinc-100 dark:hover:text-sky-300"
                :href="guestLink()"
                target="_blank"
              >
                {{ guestLink() }}
              </a>
            </div>

            <div class="flex flex-wrap gap-2">
              <Button
                variant="secondary"
                class="h-10 rounded-2xl font-extrabold gap-2 border border-black/5 bg-white/80 backdrop-blur shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[.99] dark:border-white/10 dark:bg-white/5"
                type="button"
                @click="copyGuestLink"
              >
                <Copy class="h-4 w-4" />
                Copiar
              </Button>

              <a :href="guestLink()" target="_blank">
                <Button
                  variant="secondary"
                  class="h-10 rounded-2xl font-extrabold gap-2 border border-black/5 bg-white/80 backdrop-blur shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:scale-[.99] dark:border-white/10 dark:bg-white/5"
                  type="button"
                >
                  <ExternalLink class="h-4 w-4" />
                  Abrir
                </Button>
              </a>

                        <div class="flex flex-wrap items-center gap-2">
            <span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1" :class="estadoTone">
              {{ estadoLabel }}
            </span>
            <span
              v-if="isEnviada"
              class="inline-flex items-center rounded-full px-3 py-1 text-xs font-black ring-1 bg-rose-500/10 text-rose-700 ring-rose-500/20 dark:text-rose-300"
              title="Carrito congelado"
            >
              Carrito bloqueado
            </span>
          </div>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Left -->
        <div class="lg:col-span-8 space-y-4">
          <!-- Carrito -->
          <div class="rounded-3xl border border-black/5 bg-white/80 backdrop-blur shadow-sm dark:bg-white/5 dark:border-white/10">
            <div class="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h2 class="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100">Carrito</h2>
              </div>

              <div class="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-slate-900/5 text-slate-700 ring-1 ring-black/5 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10">
                <ShoppingCart class="h-4 w-4" />
                <span class="text-sm font-black">{{ totalDetalles }}</span>
              </div>
            </div>

            <div class="border-t border-black/5 dark:border-white/10">
              <div v-if="cart.detallesActivos.value.length === 0" class="p-8 text-center">
                <p class="text-sm font-semibold text-slate-600 dark:text-zinc-400">Aún no hay ítems.</p>
              </div>

              <TransitionGroup
                v-else
                tag="div"
                class="p-4 sm:p-5 space-y-3"
                enter-active-class="transition-all duration-200"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-150"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-2"
                move-class="transition-transform duration-200"
              >
                <div
                  v-for="d in cart.detallesActivos.value"
                  :key="d.id"
                  class="group rounded-3xl border border-black/5 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-2 hover:ring-sky-500/10 dark:border-white/10 dark:bg-zinc-950/40"
                >
                  <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div class="min-w-0">
                      <p class="font-black text-slate-900 dark:text-zinc-100 truncate">{{ cart.itemLabel(d) }}</p>

                      <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 dark:text-zinc-400">
                        <span class="font-semibold">
                          Unitario: <span class="font-black text-slate-900 dark:text-zinc-100">{{ cart.money(d.precio_unitario) }}</span>
                        </span>
                        <span class="opacity-60">·</span>
                        <span class="font-semibold">
                          Total: <span class="font-black text-slate-900 dark:text-zinc-100">{{ cart.money(d.total_linea) }}</span>
                        </span>
                      </div>
                    </div>

                    <!-- Qty controls -->
                    <div class="flex items-center gap-2 sm:justify-end">
                      <button
                        type="button"
                        class="inline-flex h-11 w-11 items-center justify-center rounded-2xl
                               border border-black/5 bg-slate-100 text-slate-900
                               transition-all duration-200
                               hover:bg-slate-200 hover:-translate-y-0.5 active:scale-[.96]
                               disabled:opacity-50 disabled:cursor-not-allowed
                               dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                        :disabled="!canEditCart"
                        @click="dec(d)"
                        title="Disminuir"
                      >
                        <Minus class="h-4 w-4" />
                      </button>

                      <input
                        class="h-11 w-[92px] rounded-2xl border border-black/5 bg-white px-3 text-center
                               text-sm font-black text-slate-900 outline-none
                               transition-all duration-200
                               focus:ring-2 focus:ring-sky-500/20
                               disabled:opacity-60 disabled:cursor-not-allowed
                               dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-100"
                        :disabled="!canEditCart"
                        inputmode="numeric"
                        pattern="[0-9]*"
                        :value="qty[d.id] ?? String(Math.max(1, Number(d.cantidad) || 1))"
                        @keydown="onlyDigitsKeydown"
                        @input="onQtyInput(d, $event)"
                        @blur="onQtyBlur(d)"
                      />

                      <button
                        type="button"
                        class="inline-flex h-11 w-11 items-center justify-center rounded-2xl
                               border border-black/5 bg-slate-100 text-slate-900
                               transition-all duration-200
                               hover:bg-slate-200 hover:-translate-y-0.5 active:scale-[.96]
                               disabled:opacity-50 disabled:cursor-not-allowed
                               dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                        :disabled="!canEditCart"
                        @click="inc(d)"
                        title="Aumentar"
                      >
                        <Plus class="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        class="inline-flex h-11 w-11 items-center justify-center rounded-2xl
                               bg-rose-600 text-white transition-all duration-200
                               hover:bg-rose-500 hover:-translate-y-0.5 hover:shadow-md active:scale-[.96]
                               disabled:opacity-50 disabled:cursor-not-allowed"
                        :disabled="!canEditCart"
                        @click="cart.removeDetalle(d)"
                        title="Quitar"
                      >
                        <Trash2 class="h-4 w-4 transition-transform duration-200 group-hover:rotate-6" />
                      </button>
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- Catálogo -->
          <div class="rounded-3xl border border-black/5 bg-white/80 backdrop-blur shadow-sm dark:bg-white/5 dark:border-white/10">
            <div class="p-4 sm:p-5">
              <div class="flex flex-col gap-3 md:flex-row md:items-center">
                <div class="inline-flex rounded-2xl p-1 bg-slate-900/5 dark:bg-white/5">
                  <button
                    class="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5"
                    :class="tab === 'PRODUCTO'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-900 hover:bg-black/5 dark:text-zinc-100 dark:hover:bg-white/10'"
                    @click="tab = 'PRODUCTO'"
                    type="button"
                  >
                    <Package class="h-4 w-4" />
                    Productos
                  </button>

                  <button
                    class="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold transition-all duration-200 hover:-translate-y-0.5"
                    :class="tab === 'SERVICIO'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'text-slate-900 hover:bg-black/5 dark:text-zinc-100 dark:hover:bg-white/10'"
                    @click="tab = 'SERVICIO'"
                    type="button"
                  >
                    <Briefcase class="h-4 w-4" />
                    Servicios
                  </button>
                </div>

                <div class="md:ml-auto w-full md:w-[340px]">
                  <div class="relative">
                    <Input
                      v-model="q"
                      class="h-11 rounded-2xl pr-10 border-black/5 bg-white/70 backdrop-blur
                             text-slate-900 placeholder:text-slate-400
                             transition-all duration-200
                             focus-visible:ring-2 focus-visible:ring-sky-500/20
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                      :placeholder="tab === 'PRODUCTO' ? 'Buscar por SKU o nombre…' : 'Buscar servicio…'"
                    />
                    <span class="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <Search class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                    </span>
                  </div>
                </div>
              </div>

              <div class="mt-4">
                <div v-if="tab === 'PRODUCTO'" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <div
                    v-for="p in productosFiltrados"
                    :key="p.id"
                    class="group relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm
                           transition-all duration-200
                           hover:-translate-y-1 hover:shadow-md hover:ring-2 hover:ring-sky-500/10
                           dark:border-white/10 dark:bg-zinc-950/40"
                  >
                    <div class="relative aspect-[4/3] overflow-hidden">
                      <div class="absolute inset-0 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-white/5 dark:to-white/0" />

                      <img
                        v-if="pickImage(p)"
                        :src="pickImage(p)"
                        class="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.07]"
                        loading="lazy"
                        decoding="async"
                        @error="onImgError(p.id)"
                      />

                      <div v-else class="absolute inset-0 grid place-items-center">
                        <div class="flex flex-col items-center gap-2 text-slate-400 dark:text-zinc-500">
                          <ImageOff class="h-7 w-7" />
                          <p class="text-xs font-bold">Sin imagen</p>
                        </div>
                      </div>

                      <div
                        class="absolute left-3 top-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-black
                               bg-white/90 text-slate-900 shadow-sm ring-1 ring-black/5
                               dark:bg-zinc-950/70 dark:text-zinc-100 dark:ring-white/10"
                      >
                        {{ money(p.precio_venta) }}
                      </div>
                    </div>

                    <div class="p-4">
                      <p class="text-sm font-black text-slate-900 dark:text-zinc-100 line-clamp-2">
                        <span v-if="p.sku" class="text-slate-500 dark:text-zinc-400">{{ p.sku }} · </span>
                        {{ p.nombre }}
                      </p>

                      <Button
                        class="mt-3 w-full h-11 rounded-2xl font-extrabold gap-2
                               bg-sky-600 text-white shadow-sm
                               transition-all duration-200
                               hover:bg-sky-500 hover:-translate-y-0.5 hover:shadow-md
                               active:scale-[.99]
                               disabled:opacity-60 disabled:cursor-not-allowed"
                        :disabled="!canEditCart"
                        @click="addProducto(p.id)"
                        type="button"
                      >
                        <ShoppingCart class="h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                  </div>

                  <div
                    v-if="!productosFiltrados.length"
                    class="col-span-full rounded-3xl border border-dashed border-black/10 bg-white/70 p-10 text-center
                           text-slate-600 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-400"
                  >
                    Sin resultados en productos.
                  </div>
                </div>

                <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  <div
                    v-for="s in serviciosFiltrados"
                    :key="s.id"
                    class="group relative overflow-hidden rounded-3xl border border-black/5 bg-white shadow-sm
                           transition-all duration-200
                           hover:-translate-y-1 hover:shadow-md hover:ring-2 hover:ring-sky-500/10
                           dark:border-white/10 dark:bg-zinc-950/40"
                  >
                    <div class="p-4">
                      <div class="flex items-start justify-between gap-3">
                        <p class="text-sm font-black text-slate-900 dark:text-zinc-100 line-clamp-2">
                          {{ s.nombre }}
                        </p>
                        <span
                          class="shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-black
                                 bg-slate-900/5 text-slate-700 ring-1 ring-black/5
                                 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10"
                        >
                          {{ money(s.precio) }}
                        </span>
                      </div>

                      <Button
                        class="mt-3 w-full h-11 rounded-2xl font-extrabold gap-2
                               bg-sky-600 text-white shadow-sm
                               transition-all duration-200
                               hover:bg-sky-500 hover:-translate-y-0.5 hover:shadow-md
                               active:scale-[.99]
                               disabled:opacity-60 disabled:cursor-not-allowed"
                        :disabled="!canEditCart"
                        @click="addServicio(s.id)"
                        type="button"
                      >
                        <ShoppingCart class="h-4 w-4" />
                        Agregar
                      </Button>
                    </div>
                  </div>

                  <div
                    v-if="!serviciosFiltrados.length"
                    class="col-span-full rounded-3xl border border-dashed border-black/10 bg-white/70 p-10 text-center
                           text-slate-600 dark:border-white/10 dark:bg-zinc-950/40 dark:text-zinc-400"
                  >
                    Sin resultados en servicios.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Reply inline -->
          <div id="reply-card" class="rounded-3xl border border-black/5 bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5 dark:bg-white/5 dark:border-white/10">
            <h3 class="font-black text-slate-900 dark:text-zinc-100">Contacto del cliente</h3>
            <p class="mt-1 text-xs text-slate-600 dark:text-zinc-400">
              Captura correo o teléfono y marca DEVUELTA para ajustar antes de reenviar.
            </p>

            <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div class="space-y-1">
                <label class="text-xs font-extrabold text-slate-700 dark:text-zinc-300">Correo</label>
                <Input v-model="replyForm.email_destino" class="h-11 rounded-2xl" placeholder="cliente@correo.com" :disabled="!canAct" />
              </div>
              <div class="space-y-1">
                <label class="text-xs font-extrabold text-slate-700 dark:text-zinc-300">Teléfono</label>
                <Input v-model="replyForm.telefono_destino" class="h-11 rounded-2xl" placeholder="7771234567" :disabled="!canAct" />
              </div>
            </div>
          </div>
        </div>

        <!-- Right -->
        <div class="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
          <div class="rounded-3xl border border-black/5 bg-white/80 backdrop-blur shadow-sm p-4 sm:p-5 dark:bg-white/5 dark:border-white/10">
            <h3 class="text-base font-black text-slate-900 dark:text-zinc-100">Resumen</h3>

            <div class="mt-4 space-y-2 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-slate-600 dark:text-zinc-400">Subtotal</span>
                <span class="font-black text-slate-900 dark:text-zinc-100">{{ cart.money(cotizacion.subtotal) }}</span>
              </div>

              <div class="flex items-center justify-between">
                <span class="text-slate-600 dark:text-zinc-400">Total</span>
                <span class="font-black text-slate-900 dark:text-zinc-100">{{ cart.money(cotizacion.total) }}</span>
              </div>
            </div>

            <div class="mt-5 flex flex-col gap-2">
              <Button
                v-if="!isEnviada"
                variant="outline"
                class="h-11 rounded-2xl font-extrabold gap-2 border-black/10
               bg-sky-600 text-white shadow-sm transition-all duration-200 hover:bg-sky-500 backdrop-blur hover:-translate-y-0.5 hover:shadow-md active:scale-[.99] dark:bg-white/5 dark:border-white/10"
                :disabled="!canAct"
                @click="cart.markSent"
            >
                <CheckCircle2 class="h-4 w-4" />
                Marcar ENVIADA
            </Button>

            <Button
                v-else
                variant="secondary"
                class="h-11 rounded-2xl font-extrabold gap-2 border border-black/5 bg-white/80 backdrop-blur shadow-sm dark:border-white/10 dark:bg-white/5"
                disabled
            >
                <CheckCircle2 class="h-4 w-4" />
                Enviada
            </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>
