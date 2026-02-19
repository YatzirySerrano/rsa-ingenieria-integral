<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { computed, ref } from 'vue'

import AppLayout from '@/layouts/AppLayout.vue'
import PaginationLinks from '@/components/ui/PaginationLinks.vue'
import SearchSelect from '@/components/util/SearchSelect.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import ProductoMediaManager from '@/components/ProductoMediaManager.vue'

import type { Paginated } from '@/types/common'
import type { Producto, ProductoMedia, MarcaLite, CategoriaLite } from '@/composables/crud/useProductoCrud'
import { useProductoCrud } from '@/composables/crud/useProductoCrud'

import Swal from 'sweetalert2'
import { swalNotify } from '@/lib/swal'

import {
  Plus,
  Pencil,
  Power,
  RefreshCw,
  Search,
  Filter,
  Tag,
  Layers,
  Barcode,
  DollarSign,
  Package,
  Image as ImageIcon,
  X,
  Upload,
  Trash2,
  Sparkles,
  Eye,
} from 'lucide-vue-next'

const props = defineProps<{
  items: Paginated<Producto>
  filters: Partial<{ q: string; status: string; marca_id: string; categoria_id: string; per_page?: number | string }>
  meta: {
    statuses: string[]
    marcas: { data?: MarcaLite[] } | MarcaLite[]
    categorias: { data?: CategoriaLite[] } | CategoriaLite[]
  }
}>()

const items = computed(() => {
  const it = props.items as any
  const safeLinks = Array.isArray(it?.links)
    ? it.links
    : it?.meta?.links && Array.isArray(it.meta.links)
      ? it.meta.links
      : []
  const safeData = Array.isArray(it?.data) ? it.data : []
  return {
    ...props.items,
    data: safeData,
    links: safeLinks,
  } as Paginated<Producto> & { links: any[]; data: Producto[] }
})

const rows = computed<Producto[]>(() => items.value.data ?? [])
const total = computed(() => (items.value.meta?.total ?? rows.value.length) as number)

const marcas = computed<MarcaLite[]>(() => {
  const v: any = props.meta.marcas
  return Array.isArray(v) ? v : v?.data || []
})
const categorias = computed<CategoriaLite[]>(() => {
  const v: any = props.meta.categorias
  return Array.isArray(v) ? v : v?.data || []
})

const crud = useProductoCrud({
  initialFilters: props.filters as any,
  baseUrl: '/productos',
  autoApply: true,
  debounceMs: 350,
})

const perPage = computed<number>(() => {
  const n0 = Number((crud.filters as any).per_page ?? NaN)
  if (Number.isFinite(n0)) return n0

  const n1 = Number(props.filters?.per_page ?? NaN)
  if (Number.isFinite(n1)) return n1

  const n2 = Number((items.value.meta as any)?.per_page ?? NaN)
  if (Number.isFinite(n2)) return n2

  return 10
})

const marcaFilterModel = computed<any>({
  get: () => (crud.filters.marca_id === crud.ALL ? '' : crud.filters.marca_id),
  set: (v: any) => {
    const s = String(v ?? '').trim()
    crud.filters.marca_id = s ? s : crud.ALL
  },
})
const categoriaFilterModel = computed<any>({
  get: () => (crud.filters.categoria_id === crud.ALL ? '' : crud.filters.categoria_id),
  set: (v: any) => {
    const s = String(v ?? '').trim()
    crud.filters.categoria_id = s ? s : crud.ALL
  },
})

const showMediaModal = ref(false)
const selectedProductForMedia = ref<Producto | null>(null)

function openMediaModal(p: Producto) {
  selectedProductForMedia.value = p
  showMediaModal.value = true
}
function closeMediaModal() {
  showMediaModal.value = false
  selectedProductForMedia.value = null
}

type MediaTipo = 'imagen' | 'video'
const mediaManagerInitial = computed<ProductoMedia[]>(() => {
  const p = selectedProductForMedia.value
  if (!p) return []
  return (p.medias ?? []).map((m) => ({
    ...m,
    tipo: ((m as any).tipo ?? 'imagen') as MediaTipo,
    producto_id: p.id,
  })) as any
})

function money(v: unknown): string {
  if (v === null || v === undefined || v === '') return '$0.00'
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  return n.toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
function statusPill(status: string): string {
  return status === 'activo'
    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20'
    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/20'
}
function rowDot(status: string): string {
  return status === 'activo' ? 'bg-emerald-500' : 'bg-rose-500'
}
function getStatusButtonClasses(status: string): string {
  return status === 'activo'
    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-500/20'
    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
}
function normalizeStorageUrl(url: string): string {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/storage/')) return url
  const clean = url.replace(/^storage\//, '').replace(/^\/storage\//, '')
  return `/storage/${clean}`
}
function getActiveMedias(producto: Producto): ProductoMedia[] {
  return (producto.medias || []).filter((m) => m.status === 'activo')
}
function getActiveMediaCount(producto: Producto): number {
  return getActiveMedias(producto).length
}
function getFirstActiveImage(producto: Producto): string {
  const medias = getActiveMedias(producto)
  if (!medias.length) return ''
  const main =
    medias.find((m) => !!m.principal) ||
    medias.slice().sort((a, b) => (a.orden ?? 9999) - (b.orden ?? 9999))[0]
  return normalizeStorageUrl(main.url)
}

const modalMarcaModel = computed<any>({
  get: () => crud.form.marca_id ?? '',
  set: (v: any) => {
    const n = Number(v)
    crud.form.marca_id = Number.isFinite(n) && n > 0 ? n : null
  },
})
const modalCategoriaModel = computed<any>({
  get: () => crud.form.categoria_id ?? '',
  set: (v: any) => {
    const n = Number(v)
    crud.form.categoria_id = Number.isFinite(n) && n > 0 ? n : null
  },
})

function onFotosChange(e: Event) {
  const input = e.target as HTMLInputElement
  crud.setFotos(input.files)
}
function clearFotosInput() {
  crud.clearFotos()
  const el = document.getElementById('producto_fotos_input') as HTMLInputElement | null
  if (el) el.value = ''
}

async function showProducto(p: Producto) {
  const isDark = document.documentElement.classList.contains('dark')
  const imgs = (p.medias ?? [])
    .filter((m: any) => (m?.tipo ?? 'imagen') === 'imagen' && m.status === 'activo')
    .sort((a, b) => (a.orden ?? 9999) - (b.orden ?? 9999))
    .map((m) => normalizeStorageUrl((m as any).url))

  const gallery =
    imgs.length > 0
      ? `
        <div style="display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:12px">
          ${imgs
            .slice(0, 12)
            .map(
              (src) => `
              <div style="aspect-ratio:1/1;overflow:hidden;border-radius:14px;border:1px solid rgba(148,163,184,.35)">
                <img src="${src}" style="width:100%;height:100%;object-fit:cover" />
              </div>
            `
            )
            .join('')}
        </div>
        ${imgs.length > 12 ? `<div style="margin-top:10px;font-weight:700;opacity:.75">+${imgs.length - 12} más</div>` : ''}
      `
      : `<div style="margin-top:10px;opacity:.75;font-weight:700">Sin imágenes activas.</div>`

  await Swal.fire({
    title: `<div style="text-align:left;font-weight:900">${p.nombre}</div>`,
    html: `
      <div style="text-align:left">
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          <span style="padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.35);font-weight:800">SKU: ${p.sku}</span>
          <span style="padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.35);font-weight:800">Stock: ${p.stock}</span>
          <span style="padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.35);font-weight:800">Venta: ${money(p.precio_venta)}</span>
          <span style="padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.35);font-weight:800">Estado: ${p.status}</span>
        </div>

        <div style="margin-top:12px;font-weight:800;opacity:.85">
          Marca: <span style="font-weight:900">${p.marca?.nombre ?? '—'}</span>
          &nbsp;&nbsp;|&nbsp;&nbsp;
          Categoría: <span style="font-weight:900">${p.categoria?.nombre ?? '—'}</span>
        </div>

        ${p.descripcion ? `<div style="margin-top:10px;opacity:.85">${p.descripcion}</div>` : ''}

        ${gallery}
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Cerrar',
    width: 980,
    background: isDark ? '#0b0f19' : '#ffffff',
    color: isDark ? '#e4e4e7' : '#0f172a',
    heightAuto: false,
  })
}

async function confirmToggleStatus(p: Producto) {
  const isDark = document.documentElement.classList.contains('dark')

  const { isConfirmed } = await Swal.fire({
    title: p.status === 'activo' ? 'Desactivar producto' : 'Activar producto',
    text:
      p.status === 'activo'
        ? `El producto "${p.nombre}" quedará inactivo.`
        : `El producto "${p.nombre}" volverá a estar activo.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: p.status === 'activo' ? 'Desactivar' : 'Activar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    background: isDark ? '#0b0f19' : '#ffffff',
    color: isDark ? '#e4e4e7' : '#0f172a',
    heightAuto: false,
  })

  if (!isConfirmed) return

  const ok = await crud.toggleStatus(p)
  if (ok) {
    swalNotify(p.status === 'activo' ? 'Producto desactivado.' : 'Producto activado.', 'success')
    crud.applyFilters()
  } else {
    swalNotify('No se pudo cambiar el estado. Revisa el endpoint.', 'error')
  }
}
</script>

<template>
  <Head title="Productos" />

  <AppLayout>
    <div class="px-4 py-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14">
      <div class="mb-6 lg:mb-8">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div class="space-y-1">
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
              Productos
            </h1>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="gap-2 transition-all hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
              @click="crud.resetFilters"
              :disabled="!crud.hasActiveFilters"
            >
              <RefreshCw class="h-4 w-4" />
              <span class="text-xs sm:text-sm font-semibold">Reiniciar</span>
            </Button>

            <Button
              type="button"
              size="sm"
              class="gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white
                     hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/25
                     transition-all hover:-translate-y-[1px] active:translate-y-0"
              @click="crud.openCreate({ marcas: marcas, categorias: categorias })"
            >
              <Plus class="h-4 w-4" />
              <span class="text-xs sm:text-sm font-extrabold">Nuevo</span>
            </Button>
          </div>
        </div>
      </div>

      <div class="mb-6 lg:mb-8">
        <div
          class="rounded-2xl lg:rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-zinc-950/50
                 p-4 sm:p-5 lg:p-6 shadow-xl shadow-slate-200/20 dark:shadow-black/20 backdrop-blur-sm
                 transition-all hover:shadow-2xl"
        >
          <div class="flex items-center justify-between mb-4 sm:mb-5">
            <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">Filtros</h3>
            <Filter class="h-5 w-5 text-slate-400 dark:text-zinc-500" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
            <div class="lg:col-span-4">
              <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                <Search class="h-4 w-4" />
                Buscar
              </label>
              <div class="relative">
                <Input
                  v-model="crud.filters.q"
                  placeholder="SKU o nombre..."
                  class="h-11 sm:h-12 pl-4 pr-11 text-sm sm:text-base border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         transition-all hover:border-emerald-400/50
                         focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
                />
                <div class="absolute inset-y-0 right-3 flex items-center">
                  <Search class="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-zinc-500" />
                </div>
              </div>
            </div>

            <div class="lg:col-span-3">
              <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                <Tag class="h-4 w-4" />
                Marca
              </label>
              <SearchSelect
                v-model="marcaFilterModel"
                :options="marcas"
                search-key="nombre"
                display-key="nombre"
                value-key="id"
                placeholder="Buscar marca..."
              />
            </div>

            <div class="lg:col-span-3">
              <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                <Layers class="h-4 w-4" />
                Categoría
              </label>
              <SearchSelect
                v-model="categoriaFilterModel"
                :options="categorias"
                search-key="nombre"
                display-key="nombre"
                value-key="id"
                placeholder="Buscar categoría..."
              />
            </div>

            <div class="lg:col-span-2">
              <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                <Filter class="h-4 w-4" />
                Estado
              </label>
              <select
                v-model="crud.filters.status"
                class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base font-semibold
                       border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 rounded-xl
                       transition-all hover:border-emerald-400/50
                       focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
              >
                <option :value="crud.ALL">Todos</option>
                <option v-for="s in props.meta.statuses" :key="s" :value="s">
                  {{ s.charAt(0).toUpperCase() + s.slice(1) }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="mb-4">
        <div
          class="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-zinc-950/40
                 p-3 sm:p-4 shadow-lg shadow-slate-200/20 dark:shadow-black/20 backdrop-blur-sm"
        >
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-zinc-400">
              <Sparkles class="h-4 w-4 text-emerald-500" />
              <span class="font-extrabold text-slate-900 dark:text-zinc-100">{{ total }}</span>
              <span>productos</span>
              <span class="text-slate-400 dark:text-zinc-600">•</span>
              <span class="font-semibold">
                mostrando <span class="font-extrabold">{{ rows.length }}</span>
              </span>
            </div>

            <div v-if="rows.length" class="w-full sm:w-auto">
              <PaginationLinks
                :meta="items.meta"
                :per-page="perPage"
                @change-per-page="crud.setPerPage"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div
          v-if="rows.length"
          class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4"
        >
          <div
            v-for="p in rows"
            :key="p.id"
            class="group relative rounded-2xl border border-slate-200/70 dark:border-white/10
                   bg-white/90 dark:bg-zinc-950/40 p-4 sm:p-5 shadow-lg
                   transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
                   hover:border-emerald-400/30 dark:hover:border-emerald-400/20"
          >
            <div
              class="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300
                     bg-gradient-to-br from-emerald-500/10 via-transparent to-teal-500/10"
            />

            <div class="relative flex items-start justify-between gap-3 mb-4">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="text-[11px] font-black text-slate-500 dark:text-zinc-500">#{{ p.id }}</span>
                  <span class="h-2 w-2 rounded-full" :class="rowDot(p.status)" />
                  <span class="text-[11px] font-extrabold px-2 py-1 rounded-full" :class="statusPill(p.status)">
                    {{ p.status }}
                  </span>
                </div>

                <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 truncate">
                  {{ p.nombre }}
                </h3>

                <div class="flex items-center gap-2 mt-1 text-sm text-slate-700 dark:text-zinc-200">
                  <Barcode class="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                  <span class="font-extrabold truncate">{{ p.sku }}</span>
                </div>
              </div>

              <div class="relative flex-shrink-0">
                <div
                  class="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10
                         bg-slate-100 dark:bg-zinc-800 shadow-sm transition-transform duration-300
                         group-hover:scale-[1.03]"
                >
                  <img
                    v-if="getFirstActiveImage(p)"
                    :src="getFirstActiveImage(p)"
                    :alt="`Imagen de ${p.nombre}`"
                    class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    @error="(e: any) => { if (e?.target) e.target.style.display = 'none' }"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center">
                    <ImageIcon class="h-5 w-5 text-slate-400 dark:text-zinc-500" />
                  </div>
                </div>

                <div
                  v-if="getActiveMediaCount(p) > 0"
                  class="absolute -top-2 -right-2 bg-emerald-500 text-white text-[11px] font-black rounded-full h-6 w-6
                         flex items-center justify-center shadow-md"
                  :title="`${getActiveMediaCount(p)} imágenes activas`"
                >
                  {{ getActiveMediaCount(p) }}
                </div>
              </div>
            </div>

            <div class="relative grid grid-cols-2 gap-2 mb-4">
              <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-3">
                <p class="text-[11px] font-black text-slate-500 dark:text-zinc-400 mb-1">Marca</p>
                <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100 truncate">{{ p.marca?.nombre ?? '—' }}</p>
              </div>
              <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-3">
                <p class="text-[11px] font-black text-slate-500 dark:text-zinc-400 mb-1">Categoría</p>
                <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100 truncate">{{ p.categoria?.nombre ?? '—' }}</p>
              </div>
              <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-3">
                <p class="text-[11px] font-black text-slate-500 dark:text-zinc-400 mb-1">Stock</p>
                <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{{ p.stock }}</p>
              </div>
              <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 p-3">
                <p class="text-[11px] font-black text-slate-500 dark:text-zinc-400 mb-1">Venta</p>
                <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">{{ money(p.precio_venta) }}</p>
              </div>
            </div>

            <p v-if="p.descripcion" class="relative text-xs text-slate-500 dark:text-zinc-500 line-clamp-2 mb-4">
              {{ p.descripcion }}
            </p>

            <div class="relative grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                class="gap-2 text-xs transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
                @click.prevent="showProducto(p)"
              >
                <Eye class="h-3.5 w-3.5" />
                Ver
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                class="gap-2 text-xs transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
                @click.prevent="openMediaModal(p)"
              >
                <ImageIcon class="h-3.5 w-3.5" />
                Imágenes
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                class="gap-2 text-xs transition-all duration-200 hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
                @click.prevent="crud.openEdit({ marcas: marcas, categorias: categorias }, p)"
              >
                <Pencil class="h-3.5 w-3.5" />
                Editar
              </Button>

              <Button
                type="button"
                size="sm"
                class="gap-2 text-xs transition-all duration-200 hover:-translate-y-[1px] active:translate-y-0"
                :class="getStatusButtonClasses(p.status)"
                @click.prevent="confirmToggleStatus(p)"
              >
                <Power class="h-3.5 w-3.5" />
                {{ p.status === 'activo' ? 'Desactivar' : 'Activar' }}
              </Button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-zinc-950/40
                 p-10 sm:p-14 text-center shadow-lg"
        >
          <p class="text-slate-600 dark:text-zinc-400 font-extrabold">No se encontraron productos con los filtros actuales.</p>
          <p class="text-sm text-slate-500 dark:text-zinc-500 mt-2">Ajusta búsqueda, marca, categoría o estado.</p>
        </div>
      </div>

      <div v-if="crud.modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="crud.closeModal" />

        <div
          class="relative w-full max-w-[980px] xl:max-w-[1040px]
                 max-h-[86vh] sm:max-h-[88vh]
                 overflow-hidden rounded-2xl lg:rounded-3xl
                 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 shadow-2xl"
          @click.stop
        >
          <div
            class="flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-slate-200 dark:border-white/10
                   bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950"
          >
            <div class="min-w-0">
              <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">
                {{ crud.modalMode === 'create' ? 'Nuevo producto' : 'Editar producto' }}
              </h3>
              <p v-if="crud.errors.general" class="mt-2 text-sm font-extrabold text-rose-600 dark:text-rose-300">
                {{ crud.errors.general }}
              </p>
            </div>

            <Button type="button" variant="ghost" size="sm" class="h-10 w-10 rounded-full" @click="crud.closeModal">
              <X class="h-5 w-5" />
            </Button>
          </div>

          <div class="p-4 sm:p-5 overflow-y-auto max-h-[calc(86vh-128px)] sm:max-h-[calc(88vh-128px)]">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4">
              <div class="lg:col-span-6">
                <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  <Tag class="h-4 w-4" />
                  Marca
                </label>
                <SearchSelect
                  v-model="modalMarcaModel"
                  :options="crud.modalMarcas"
                  search-key="nombre"
                  display-key="nombre"
                  value-key="id"
                  placeholder="Buscar marca..."
                />
                <p v-if="crud.errors.marca_id" class="mt-2 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                  {{ crud.errors.marca_id }}
                </p>
              </div>

              <div class="lg:col-span-6">
                <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  <Layers class="h-4 w-4" />
                  Categoría
                </label>
                <SearchSelect
                  v-model="modalCategoriaModel"
                  :options="crud.modalCategorias"
                  search-key="nombre"
                  display-key="nombre"
                  value-key="id"
                  placeholder="Buscar categoría..."
                />
                <p v-if="crud.errors.categoria_id" class="mt-2 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                  {{ crud.errors.categoria_id }}
                </p>
              </div>

              <div class="lg:col-span-4">
                <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  <Barcode class="h-4 w-4" />
                  SKU
                </label>
                <Input
                  v-model="crud.form.sku"
                  placeholder="Ej: PROD-001"
                  class="h-11 sm:h-12 border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/60"
                />
                <p v-if="crud.errors.sku" class="mt-2 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                  {{ crud.errors.sku }}
                </p>
              </div>

              <div class="lg:col-span-4">
                <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  <Package class="h-4 w-4" />
                  Stock
                </label>
                <Input
                  v-model="crud.form.stock"
                  type="number"
                  min="0"
                  step="1"
                  class="h-11 sm:h-12 border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/60"
                />
                <p v-if="crud.errors.stock" class="mt-2 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                  {{ crud.errors.stock }}
                </p>
              </div>

              <div class="lg:col-span-4">
                <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  <DollarSign class="h-4 w-4" />
                  Precio venta
                </label>
                <Input
                  v-model="crud.form.precio_venta"
                  type="number"
                  min="0"
                  step="0.01"
                  class="h-11 sm:h-12 border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/60"
                />
                <p v-if="crud.errors.precio_venta" class="mt-2 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                  {{ crud.errors.precio_venta }}
                </p>
              </div>

              <div class="lg:col-span-6">
                <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  <DollarSign class="h-4 w-4" />
                  Costo lista
                </label>
                <Input
                  v-model="crud.form.costo_lista"
                  type="number"
                  min="0"
                  step="0.01"
                  class="h-11 sm:h-12 border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/60"
                />
                <p v-if="crud.errors.costo_lista" class="mt-2 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                  {{ crud.errors.costo_lista }}
                </p>
              </div>

              <div class="lg:col-span-6">
                <label class="mb-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  Nombre del producto
                </label>
                <Input
                  v-model="crud.form.nombre"
                  placeholder="Nombre comercial"
                  class="h-11 sm:h-12 border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/60"
                />
                <p v-if="crud.errors.nombre" class="mt-2 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                  {{ crud.errors.nombre }}
                </p>
              </div>

              <div class="lg:col-span-12">
                <label class="mb-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  Descripción
                </label>
                <textarea
                  v-model="crud.form.descripcion"
                  rows="4"
                  class="w-full rounded-xl border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         px-4 py-3 text-sm sm:text-base text-slate-900 dark:text-zinc-100
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/60"
                  placeholder="Describe el producto (opcional)"
                />
              </div>

              <div class="lg:col-span-12">
                <div class="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 p-4 sm:p-5">
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p class="text-sm font-black text-slate-900 dark:text-zinc-100">Fotos del producto</p>
                      <p class="text-xs text-slate-500 dark:text-zinc-400">
                        Si subes fotos, el submit se va por multipart automáticamente.
                      </p>
                    </div>

                    <div class="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        class="gap-2 hover:shadow-md transition-all"
                        @click="clearFotosInput"
                        :disabled="!crud.form.fotos.length"
                      >
                        <Trash2 class="h-4 w-4" />
                        Quitar
                      </Button>
                    </div>
                  </div>

                  <div class="mt-4">
                    <label
                      class="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300/70 dark:border-white/15
                             bg-white/60 dark:bg-white/5 px-4 py-6 cursor-pointer
                             hover:border-emerald-400/60 hover:bg-emerald-500/5 transition"
                    >
                      <Upload class="h-5 w-5 text-slate-500 dark:text-zinc-400" />
                      <span class="text-sm font-extrabold text-slate-700 dark:text-zinc-200">
                        Seleccionar imágenes
                      </span>
                      <input
                        id="producto_fotos_input"
                        type="file"
                        class="hidden"
                        accept="image/*"
                        multiple
                        @change="onFotosChange"
                      />
                    </label>
                  </div>

                  <div v-if="crud.form.fotos.length" class="mt-4 flex flex-wrap gap-2">
                    <span
                      v-for="(f, idx) in crud.form.fotos.slice(0, 10)"
                      :key="idx"
                      class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold
                             border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5
                             text-slate-700 dark:text-zinc-200"
                      :title="f.name"
                    >
                      {{ f.name }}
                    </span>
                    <span
                      v-if="crud.form.fotos.length > 10"
                      class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-extrabold
                             border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5
                             text-slate-500 dark:text-zinc-400"
                    >
                      +{{ crud.form.fotos.length - 10 }} más
                    </span>
                  </div>

                  <div v-if="(crud.fotoPreviews?.length ?? 0) > 0" class="mt-4 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
                    <div
                      v-for="(p, idx) in crud.fotoPreviews"
                      :key="idx"
                      class="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800"
                    >
                      <img :src="p.url" :alt="p.name" class="w-full h-full object-cover" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" class="hover:shadow-md" @click="crud.closeModal" :disabled="crud.saving">
              Cancelar
            </Button>

            <Button
              type="button"
              class="gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white
                     hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-500/25"
              @click="crud.submit"
              :disabled="crud.saving"
            >
              <span class="font-extrabold">
                {{ crud.saving ? 'Guardando...' : crud.modalMode === 'create' ? 'Crear' : 'Guardar' }}
              </span>
            </Button>
          </div>
        </div>
      </div>

      <div v-if="showMediaModal && selectedProductForMedia" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="closeMediaModal"></div>

        <div
          class="relative w-full max-w-[1050px] 2xl:max-w-[1180px]
                 max-h-[86vh] sm:max-h-[88vh]
                 bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl shadow-2xl
                 border border-slate-200 dark:border-white/10 overflow-hidden"
          @click.stop
        >
          <div class="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-zinc-900">
            <div class="min-w-0">
              <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">
                Imágenes del producto
              </h3>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 truncate">
                {{ selectedProductForMedia.nombre }} ({{ selectedProductForMedia.sku }})
              </p>
            </div>

            <Button type="button" variant="ghost" size="sm" class="h-10 w-10 rounded-full" @click="closeMediaModal">
              <X class="h-5 w-5" />
            </Button>
          </div>

          <div class="p-4 sm:p-5 overflow-y-auto max-h-[calc(86vh-118px)] sm:max-h-[calc(88vh-118px)]">
            <ProductoMediaManager
              :producto-id="selectedProductForMedia.id"
              :initial-medias="mediaManagerInitial"
              @media-updated="crud.applyFilters"
            />
          </div>

          <div class="p-4 sm:p-5 border-t border-slate-200 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 flex items-center justify-end">
            <Button type="button" variant="outline" class="hover:shadow-md" @click="closeMediaModal">Cerrar</Button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
@media (prefers-reduced-motion: reduce) {
  .group,
  .group * {
    transition: none !important;
    animation: none !important;
  }
}
</style>
