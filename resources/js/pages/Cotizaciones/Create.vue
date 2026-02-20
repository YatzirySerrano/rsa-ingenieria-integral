<script setup lang="ts">
import { computed, reactive, ref, onBeforeUnmount, watch } from 'vue'
import { Head, router, Link } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { swalErr, swalLoading, swalClose, swalConfirm } from '@/lib/swal'

import {
  Search,
  ShoppingCart,
  Package,
  Briefcase,
  ImageOff,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
} from 'lucide-vue-next'

type ProductoMedia = {
  id: number
  url: string
  principal?: boolean
  orden?: number
  tipo?: string
}

type Producto = {
  id: number
  sku?: string | null
  nombre: string
  precio_venta: number | string
  image_url?: string | null
  medias?: ProductoMedia[]
}

type Servicio = { id: number; nombre: string; precio: number | string }

const props = defineProps<{
  meta: { productos: Producto[]; servicios: Servicio[] }
}>()

type CartItem = {
  tipo: 'PRODUCTO' | 'SERVICIO'
  producto_id?: number | null
  servicio_id?: number | null
  cantidad: number
}

const tab = ref<'PRODUCTO' | 'SERVICIO'>('PRODUCTO')
const q = ref('')

const form = reactive({
  email_destino: '',
  telefono_destino: '',
})

const cart = reactive<CartItem[]>([])
const brokenImgs = reactive(new Set<number>())

const prodMap = computed(() => new Map(props.meta.productos.map((p) => [p.id, p])))
const servMap = computed(() => new Map(props.meta.servicios.map((s) => [s.id, s])))

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
  const all = props.meta.productos
  if (!term) return all
  return all.filter((p) => `${p.sku ?? ''} ${p.nombre}`.toLowerCase().includes(term))
})

const serviciosFiltrados = computed(() => {
  const term = q.value.trim().toLowerCase()
  const all = props.meta.servicios
  if (!term) return all
  return all.filter((s) => `${s.nombre}`.toLowerCase().includes(term))
})

function labelItem(it: CartItem) {
  if (it.tipo === 'PRODUCTO') {
    const p = prodMap.value.get(it.producto_id as number)
    return p ? `${p.sku ? p.sku + ' · ' : ''}${p.nombre}` : 'Producto'
  }
  const s = servMap.value.get(it.servicio_id as number)
  return s ? s.nombre : 'Servicio'
}

function unitPrice(it: CartItem) {
  if (it.tipo === 'PRODUCTO') return toNumber(prodMap.value.get(it.producto_id as number)?.precio_venta ?? 0)
  return toNumber(servMap.value.get(it.servicio_id as number)?.precio ?? 0)
}

const itemsCount = computed(() => cart.reduce((sum, it) => sum + (Number(it.cantidad) || 0), 0))
const totalPreview = computed(() => cart.reduce((sum, it) => sum + unitPrice(it) * (Number(it.cantidad) || 0), 0))

/** Animaciones “pro”: bump + badge + toast fijo */
const cartBump = ref(false)
const totalBump = ref(false)

const cartBadge = reactive({ show: false, text: '+1' })
const toast = reactive({ show: false, title: '', subtitle: '' })

let tBump: number | null = null
let tBadge: number | null = null
let tToast: number | null = null

function triggerBump() {
  cartBump.value = false
  totalBump.value = false
  if (tBump) window.clearTimeout(tBump)
  tBump = window.setTimeout(() => {
    cartBump.value = true
    totalBump.value = true
    tBump = window.setTimeout(() => {
      cartBump.value = false
      totalBump.value = false
    }, 220)
  }, 0)
}

function showBadge(text = '+1') {
  cartBadge.text = text
  cartBadge.show = true
  if (tBadge) window.clearTimeout(tBadge)
  tBadge = window.setTimeout(() => (cartBadge.show = false), 650)
}

function showToast(title: string, subtitle = '') {
  toast.title = title
  toast.subtitle = subtitle
  toast.show = true
  if (tToast) window.clearTimeout(tToast)
  tToast = window.setTimeout(() => (toast.show = false), 1200)
}

onBeforeUnmount(() => {
  if (tBump) window.clearTimeout(tBump)
  if (tBadge) window.clearTimeout(tBadge)
  if (tToast) window.clearTimeout(tToast)
})

function addProducto(id: number) {
  const ex = cart.find((x) => x.tipo === 'PRODUCTO' && x.producto_id === id)
  if (ex) ex.cantidad += 1
  else cart.push({ tipo: 'PRODUCTO', producto_id: id, servicio_id: null, cantidad: 1 })

  triggerBump()
  showBadge('+1')
  const p = prodMap.value.get(id)
  showToast('Agregado al carrito', p?.nombre ? p.nombre : 'Producto')
}

function addServicio(id: number) {
  const ex = cart.find((x) => x.tipo === 'SERVICIO' && x.servicio_id === id)
  if (ex) ex.cantidad += 1
  else cart.push({ tipo: 'SERVICIO', producto_id: null, servicio_id: id, cantidad: 1 })

  triggerBump()
  showBadge('+1')
  const s = servMap.value.get(id)
  showToast('Agregado al carrito', s?.nombre ? s.nombre : 'Servicio')
}

function dec(i: number) {
  cart[i].cantidad = Math.max(1, cart[i].cantidad - 1)
}
function inc(i: number) {
  cart[i].cantidad += 1
}
function remove(i: number) {
  cart.splice(i, 1)
}

/** bump también cuando cambia total por cantidades/removes */
watch(
  () => totalPreview.value,
  () => {
    totalBump.value = false
    window.setTimeout(() => (totalBump.value = true), 0)
    window.setTimeout(() => (totalBump.value = false), 220)
  }
)

async function submit() {
  if (!cart.length) return swalErr('Agrega al menos 1 item.')
  const email = form.email_destino.trim()
  const tel = form.telefono_destino.trim()
  if (!email && !tel) return swalErr('Captura al menos correo o teléfono.')

  const { isConfirmed } = await swalConfirm('', {
    title: 'Confirmar creación',
    confirmText: 'Crear cotización',
  })
  if (!isConfirmed) return

  swalLoading('Creando...')
  router.post(
    '/cotizaciones',
    {
      email_destino: email || null,
      telefono_destino: tel || null,
      items: cart.map((it) => ({
        tipo: it.tipo,
        producto_id: it.tipo === 'PRODUCTO' ? it.producto_id : null,
        servicio_id: it.tipo === 'SERVICIO' ? it.servicio_id : null,
        cantidad: it.cantidad,
      })),
    },
    {
      preserveScroll: true,
      onFinish: () => swalClose(),
      onError: () => swalErr('No se pudo crear. Revisa datos e intenta otra vez.'),
    }
  )
}

import type { BreadcrumbItem } from '@/types'
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cotizaciones', href: '/cotizaciones' }]
</script>

<template>
  <AppLayout :breadcrumbs="breadcrumbs">
    <Head title="Cotizacion" />

    <!-- Toast fijo (no se recorta) -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-200"
        enter-from-class="opacity-0 translate-y-2 scale-95"
        enter-to-class="opacity-100 translate-y-0 scale-100"
        leave-active-class="transition-all duration-150"
        leave-from-class="opacity-100 translate-y-0 scale-100"
        leave-to-class="opacity-0 translate-y-2 scale-95"
      >
        <div
          v-if="toast.show"
          class="fixed left-1/2 top-5 z-[9999] -translate-x-1/2"
        >
          <div
            class="rounded-2xl border border-black/5 bg-white/85 backdrop-blur px-4 py-3 shadow-lg
                   dark:border-white/10 dark:bg-zinc-900/80"
          >
            <div class="flex items-start gap-3">
              <div class="mt-1 h-2.5 w-2.5 rounded-full bg-sky-500" />
              <div class="min-w-[220px]">
                <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{{ toast.title }}</p>
                <p v-if="toast.subtitle" class="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                  {{ toast.subtitle }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <div
      class="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6
             bg-gradient-to-b from-slate-50 to-white
             dark:from-zinc-950 dark:to-zinc-950"
    >
      <!-- Header -->
      <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <Link href="/cotizaciones">
            <Button
              variant="secondary"
              class="h-11 rounded-2xl font-extrabold gap-2
                     border border-black/5 bg-white/80 backdrop-blur shadow-sm
                     transition-all duration-200
                     hover:-translate-y-0.5 hover:shadow-md
                     active:scale-[.99]
                     dark:border-white/10 dark:bg-white/5"
            >
              <ArrowLeft class="h-4 w-4" />
              Volver
            </Button>
          </Link>

          <!-- Carrito KPI -->
          <div class="relative">
            <div
              class="inline-flex items-center gap-2 rounded-2xl px-3 py-2
                     border border-black/5 bg-white/80 backdrop-blur shadow-sm
                     transition-all duration-200
                     dark:border-white/10 dark:bg-white/5"
              :class="cartBump ? 'ring-2 ring-sky-500/20 shadow-[0_18px_50px_-28px_rgba(14,165,233,.45)] -translate-y-0.5' : ''"
            >
              <div class="relative">
                <ShoppingCart class="h-4 w-4 text-slate-700 dark:text-zinc-200" />

                <Transition
                  enter-active-class="transition-all duration-150"
                  enter-from-class="opacity-0 -translate-y-1 scale-90"
                  enter-to-class="opacity-100 translate-y-0 scale-100"
                  leave-active-class="transition-all duration-150"
                  leave-from-class="opacity-100 translate-y-0 scale-100"
                  leave-to-class="opacity-0 -translate-y-1 scale-90"
                >
                  <span
                    v-if="cartBadge.show"
                    class="absolute -right-2.5 -top-2.5 rounded-full bg-sky-600 px-2 py-0.5 text-[10px] font-black text-white shadow-sm"
                  >
                    {{ cartBadge.text }}
                  </span>
                </Transition>
              </div>

              <span class="text-sm font-black text-slate-900 dark:text-zinc-100">
                <Transition
                  enter-active-class="transition-all duration-150"
                  enter-from-class="opacity-0 translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition-all duration-150"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 -translate-y-1"
                >
                  <span :key="itemsCount">{{ itemsCount }}</span>
                </Transition>
                <span class="font-semibold text-slate-500 dark:text-zinc-400"> items</span>
              </span>
            </div>
          </div>

          <!-- Total KPI -->
          <div
            class="inline-flex items-center gap-2 rounded-2xl px-3 py-2
                   border border-black/5 bg-white/80 backdrop-blur shadow-sm
                   transition-all duration-200
                   dark:border-white/10 dark:bg-white/5"
            :class="totalBump ? 'ring-2 ring-sky-500/15 shadow-[0_18px_50px_-30px_rgba(14,165,233,.35)] -translate-y-0.5' : ''"
          >
            <span class="text-xs font-extrabold text-slate-500 dark:text-zinc-400">Total</span>
            <span class="text-sm font-black text-slate-900 dark:text-zinc-100">
              {{ money(totalPreview) }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        <!-- Catálogo -->
        <div class="lg:col-span-8 space-y-4">
          <div class="rounded-3xl border border-black/5 bg-white/80 backdrop-blur shadow-sm dark:bg-white/5 dark:border-white/10">
            <div class="p-4 sm:p-5">
              <div class="flex flex-col gap-3 md:flex-row md:items-center">
                <!-- Tabs -->
                <div class="inline-flex rounded-2xl p-1 bg-slate-900/5 dark:bg-white/5">
                  <button
                    class="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold
                           transition-all duration-200 hover:-translate-y-0.5"
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
                    class="inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-extrabold
                           transition-all duration-200 hover:-translate-y-0.5"
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

                <!-- Search -->
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
                <!-- Productos -->
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
                               active:scale-[.99]"
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

                <!-- Servicios -->
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
                               active:scale-[.99]"
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
        </div>

        <!-- Sidebar (pro) -->
        <div class="lg:col-span-4 space-y-4 lg:sticky lg:top-6">
          <!-- Carrito -->
          <div class="rounded-3xl border border-black/5 bg-white/80 backdrop-blur shadow-sm dark:bg-white/5 dark:border-white/10">
            <div class="p-4 sm:p-5 flex items-center justify-between">
              <div>
                <h2 class="text-base font-black text-slate-900 dark:text-zinc-100">Carrito</h2>
                <p class="text-xs text-slate-600 dark:text-zinc-400">Ajusta cantidades antes de crear.</p>
              </div>

              <div class="inline-flex items-center gap-2 rounded-2xl px-3 py-2 bg-slate-900/5 text-slate-700 ring-1 ring-black/5 dark:bg-white/5 dark:text-zinc-200 dark:ring-white/10">
                <ShoppingCart class="h-4 w-4" />
                <span class="text-sm font-black">{{ itemsCount }}</span>
              </div>
            </div>

            <div class="border-t border-black/5 dark:border-white/10">
              <div v-if="!cart.length" class="p-6 text-center text-sm text-slate-600 dark:text-zinc-400">
                Aún no agregas items.
              </div>

              <TransitionGroup
                v-else
                tag="div"
                class="max-h-[420px] overflow-y-auto p-4 space-y-2
                       [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                enter-active-class="transition-all duration-200"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition-all duration-150"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-2"
                move-class="transition-transform duration-200"
              >
                <div
                  v-for="(it, i) in cart"
                  :key="`${it.tipo}-${it.producto_id ?? 'x'}-${it.servicio_id ?? 'x'}`"
                  class="rounded-2xl border border-black/5 bg-white p-3 shadow-sm
                         transition-all duration-200 hover:shadow-md
                         dark:border-white/10 dark:bg-zinc-950/40"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <p class="text-sm font-black text-slate-900 dark:text-zinc-100 line-clamp-2">
                        {{ labelItem(it) }}
                      </p>
                      <p class="mt-0.5 text-xs font-semibold text-slate-600 dark:text-zinc-400">
                        Unitario: <span class="font-black text-slate-900 dark:text-zinc-100">{{ money(unitPrice(it)) }}</span>
                      </p>
                    </div>

                    <div class="shrink-0 text-right">
                      <p class="text-xs font-semibold text-slate-600 dark:text-zinc-400">Total</p>
                      <p class="text-sm font-black text-slate-900 dark:text-zinc-100">
                        {{ money(unitPrice(it) * it.cantidad) }}
                      </p>
                    </div>
                  </div>

                  <div class="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      class="inline-flex h-10 w-10 items-center justify-center rounded-2xl
                             border border-black/5 bg-slate-100 text-slate-900
                             transition-all duration-200
                             hover:bg-slate-200 hover:-translate-y-0.5 active:scale-[.98]
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                      @click="dec(i)"
                      title="Disminuir"
                    >
                      <Minus class="h-4 w-4" />
                    </button>

                    <div class="flex-1">
                      <div
                        class="h-10 rounded-2xl border border-black/5 bg-white px-3 grid place-items-center
                               text-sm font-black text-slate-900
                               dark:border-white/10 dark:bg-zinc-950/60 dark:text-zinc-100"
                      >
                        {{ it.cantidad }}
                      </div>
                    </div>

                    <button
                      type="button"
                      class="inline-flex h-10 w-10 items-center justify-center rounded-2xl
                             border border-black/5 bg-slate-100 text-slate-900
                             transition-all duration-200
                             hover:bg-slate-200 hover:-translate-y-0.5 active:scale-[.98]
                             dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 dark:hover:bg-white/10"
                      @click="inc(i)"
                      title="Aumentar"
                    >
                      <Plus class="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      class="inline-flex h-10 w-10 items-center justify-center rounded-2xl
                             bg-rose-600 text-white transition-all duration-200
                             hover:bg-rose-500 hover:-translate-y-0.5 active:scale-[.98]"
                      @click="remove(i)"
                      title="Quitar"
                    >
                      <Trash2 class="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </TransitionGroup>

              <div class="p-4 border-t border-black/5 dark:border-white/10">
                <div class="flex items-center justify-between text-sm">
                  <span class="text-slate-600 dark:text-zinc-400">Total estimado</span>
                  <span class="text-base font-black text-slate-900 dark:text-zinc-100">
                    {{ money(totalPreview) }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Contacto -->
          <div class="rounded-3xl border border-black/5 bg-white/80 backdrop-blur shadow-sm dark:bg-white/5 dark:border-white/10">
            <div class="p-4 sm:p-5">
              <h2 class="text-base font-black text-slate-900 dark:text-zinc-100">Contacto del cliente</h2>

              <div class="mt-4 space-y-3">
                <div class="space-y-1">
                  <label class="text-xs font-extrabold text-slate-700 dark:text-zinc-300">Correo</label>
                  <Input
                    v-model="form.email_destino"
                    placeholder="cliente@correo.com"
                    class="h-11 rounded-2xl border-black/5 bg-white/70 backdrop-blur
                           transition-all duration-200
                           focus-visible:ring-2 focus-visible:ring-sky-500/20
                           dark:border-white/10 dark:bg-white/5"
                  />
                </div>

                <div class="space-y-1">
                  <label class="text-xs font-extrabold text-slate-700 dark:text-zinc-300">Teléfono</label>
                  <Input
                    v-model="form.telefono_destino"
                    placeholder="7771234567"
                    class="h-11 rounded-2xl border-black/5 bg-white/70 backdrop-blur
                           transition-all duration-200
                           focus-visible:ring-2 focus-visible:ring-sky-500/20
                           dark:border-white/10 dark:bg-white/5"
                  />
                </div>

                <Button
                  class="w-full h-11 rounded-2xl font-extrabold gap-2
                         bg-sky-600 text-white shadow-sm
                         transition-all duration-200
                         hover:bg-sky-500 hover:-translate-y-0.5 hover:shadow-md
                         active:scale-[.99]"
                  @click="submit"
                  type="button"
                >
                  <ShoppingCart class="h-4 w-4" />
                  Crear cotización
                </Button>

                <p class="text-[11px] font-semibold text-slate-500 dark:text-zinc-400">
                  Puedes capturar solo correo o solo teléfono.
                </p>
              </div>
            </div>
          </div>
        </div>
        <!-- /sidebar -->
      </div>
    </div>
  </AppLayout>
</template>
