<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { computed } from 'vue'

import AppLayout from '@/layouts/AppLayout.vue'
import PaginationLinks from '@/components/ui/PaginationLinks.vue'
import SearchSelect from '@/components/util/SearchSelect.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { Paginated } from '@/types/common'
import type { Servicio, CategoriaLite } from '@/composables/crud/useServicioCrud'
import { useServicioCrud } from '@/composables/crud/useServicioCrud'

import Swal from 'sweetalert2'
import { Plus, Pencil, RefreshCw, Search, Filter, Layers, DollarSign, X, Eye } from 'lucide-vue-next'

const props = defineProps<{
  items: Paginated<Servicio>
  filters: Partial<{ q: string; status: string; categoria_id: string; per_page?: number | string }>
  meta: {
    statuses: string[]
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
  return { ...props.items, data: safeData, links: safeLinks } as Paginated<Servicio> & { links: any[]; data: Servicio[] }
})

const rows = computed<Servicio[]>(() => items.value.data ?? [])
const total = computed(() => (items.value.meta?.total ?? rows.value.length) as number)

const categorias = computed<CategoriaLite[]>(() => {
  const v: any = props.meta.categorias
  return Array.isArray(v) ? v : v?.data || []
})

const crud = useServicioCrud({
  initialFilters: props.filters as any,
  baseUrl: '/servicios',
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

function toId(v: any): number | null {
  if (v && typeof v === 'object') {
    const n = Number((v as any).id)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
}

const categoriaFilterModel = computed<any>({
  get: () => (crud.filters.categoria_id === crud.ALL ? '' : crud.filters.categoria_id),
  set: (v: any) => {
    const id = toId(v)
    crud.filters.categoria_id = id ? String(id) : crud.ALL
  },
})

const modalCategoriaModel = computed<any>({
  get: () => crud.form.categoria_id ?? '',
  set: (v: any) => {
    crud.form.categoria_id = toId(v)
  },
})

function money(v: unknown): string {
  if (v === null || v === undefined || v === '') return '$0.00'
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v)
  return n.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function statusPill(status: string): string {
  return status === 'activo'
    ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 ring-1 ring-emerald-500/20'
    : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 ring-1 ring-rose-500/20'
}

function rowDot(status: string): string {
  return status === 'activo' ? 'bg-emerald-500' : 'bg-rose-500'
}

function ensureSwalZ() {
  const exist = document.getElementById('swal-z-20000')
  if (exist) return
  const s = document.createElement('style')
  s.id = 'swal-z-20000'
  s.textContent = `.swal2-container{z-index:20000 !important}`
  document.head.appendChild(s)
}

const Toast = Swal.mixin({
  toast: true,
  position: 'top-end',
  showConfirmButton: false,
  timer: 2400,
  timerProgressBar: true,
})

async function toast(message: string, icon: 'success' | 'error') {
  ensureSwalZ()
  await Toast.fire({ icon, title: message })
}

async function showServicio(s: Servicio) {
  const isDark = document.documentElement.classList.contains('dark')
  ensureSwalZ()

  await Swal.fire({
    title: `<div style="text-align:left;font-weight:900">${s.nombre}</div>`,
    html: `
      <div style="text-align:left">
        <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
          <span style="padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.35);font-weight:800">Precio: ${money(s.precio)}</span>
          <span style="padding:6px 10px;border-radius:999px;border:1px solid rgba(148,163,184,.35);font-weight:800">Estado: ${s.status}</span>
        </div>

        <div style="margin-top:12px;font-weight:800;opacity:.85">
          Categoría: <span style="font-weight:900">${s.categoria?.nombre ?? '—'}</span>
        </div>

        ${s.descripcion ? `<div style="margin-top:10px;opacity:.85">${s.descripcion}</div>` : ''}
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'Cerrar',
    width: 880,
    background: isDark ? '#0b0f19' : '#ffffff',
    color: isDark ? '#e4e4e7' : '#0f172a',
    heightAuto: false,
  })
}

async function confirmDeactivate(s: Servicio) {
  const isDark = document.documentElement.classList.contains('dark')
  ensureSwalZ()

  const { isConfirmed } = await Swal.fire({
    title: 'Dar de baja servicio',
    text: `El servicio "${s.nombre}" quedará inactivo.`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Dar de baja',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    background: isDark ? '#0b0f19' : '#ffffff',
    color: isDark ? '#e4e4e7' : '#0f172a',
    heightAuto: false,
  })

  if (!isConfirmed) return

  const ok = await crud.destroy(s)
  if (ok) {
    await toast('Servicio dado de baja.', 'success')
    crud.applyFilters()
  } else {
    await toast('No se pudo dar de baja. Revisa el endpoint.', 'error')
  }
}

async function confirmReactivate(s: Servicio) {
  const isDark = document.documentElement.classList.contains('dark')
  ensureSwalZ()

  const { isConfirmed } = await Swal.fire({
    title: 'Reactivar servicio',
    text: `El servicio "${s.nombre}" volverá a estar activo.`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'Reactivar',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    background: isDark ? '#0b0f19' : '#ffffff',
    color: isDark ? '#e4e4e7' : '#0f172a',
    heightAuto: false,
  })

  if (!isConfirmed) return

  const ok = await crud.reactivate(s)
  if (ok) {
    await toast('Servicio reactivado.', 'success')
    crud.applyFilters()
  } else {
    await toast('No se pudo reactivar. Revisa el endpoint.', 'error')
  }
}

function actionBtnClass(status: string) {
  return status === 'activo'
    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm shadow-rose-500/20'
    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
}
</script>

<template>
  <Head title="Servicios" />

  <AppLayout>
    <div class="px-4 py-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14">
      <div class="mb-6 lg:mb-8">
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div class="space-y-1">
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
              Servicios
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
              @click="crud.openCreate({ categorias: categorias })"
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
                 p-4 sm:p-5 lg:p-6 shadow-xl shadow-slate-200/20 dark:shadow-black/20 backdrop-blur-sm"
        >
          <div class="flex items-center justify-between mb-4 sm:mb-5">
            <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">Filtros</h3>
            <Filter class="h-5 w-5 text-slate-400 dark:text-zinc-500" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
            <div class="lg:col-span-5">
              <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                <Search class="h-4 w-4" />
                Buscar
              </label>
              <div class="relative">
                <Input
                  v-model="crud.filters.q"
                  placeholder="Nombre o descripción..."
                  class="h-11 sm:h-12 pl-4 pr-11 text-sm sm:text-base border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
                />
                <div class="absolute inset-y-0 right-3 flex items-center">
                  <Search class="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-zinc-500" />
                </div>
              </div>
            </div>

            <div class="lg:col-span-4">
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

            <div class="lg:col-span-3">
              <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                <Filter class="h-4 w-4" />
                Estado
              </label>
              <select
                v-model="crud.filters.status"
                class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base font-semibold
                       border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 rounded-xl
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
              <span class="font-extrabold text-slate-900 dark:text-zinc-100">{{ total }}</span>
              <span>servicios</span>
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
            v-for="s in rows"
            :key="s.id"
            class="group relative rounded-2xl border border-slate-200/70 dark:border-white/10
                   bg-white/90 dark:bg-zinc-950/40 p-4 sm:p-5 shadow-lg
                   transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
          >
            <div class="relative flex items-start justify-between gap-3 mb-4">
              <div class="min-w-0">
                <div class="flex flex-wrap items-center gap-2 mb-2">
                  <span class="text-[11px] font-black text-slate-500 dark:text-zinc-500">#{{ s.id }}</span>
                  <span class="h-2 w-2 rounded-full" :class="rowDot(s.status)" />
                  <span class="text-[11px] font-extrabold px-2 py-1 rounded-full" :class="statusPill(s.status)">
                    {{ s.status }}
                  </span>
                </div>

                <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 truncate">
                  {{ s.nombre }}
                </h3>

                <div class="mt-1 text-sm text-slate-700 dark:text-zinc-200 truncate">
                  {{ s.categoria?.nombre ?? '—' }}
                </div>
              </div>

              <div class="flex-shrink-0 text-right">
                <div class="text-[11px] font-black text-slate-500 dark:text-zinc-500">Precio</div>
                <div class="text-sm font-extrabold text-slate-900 dark:text-zinc-100 flex items-center justify-end gap-1">
                  <DollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                  <span>{{ money(s.precio) }}</span>
                </div>
              </div>
            </div>

            <p v-if="s.descripcion" class="relative text-xs text-slate-500 dark:text-zinc-500 line-clamp-2 mb-4">
              {{ s.descripcion }}
            </p>

            <div class="relative grid grid-cols-2 gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                class="gap-2 text-xs transition-all hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
                @click.prevent="showServicio(s)"
              >
                <Eye class="h-3.5 w-3.5" />
                Ver
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                class="gap-2 text-xs transition-all hover:shadow-md hover:-translate-y-[1px] active:translate-y-0"
                @click.prevent="crud.openEdit({ categorias: categorias }, s)"
              >
                <Pencil class="h-3.5 w-3.5" />
                Editar
              </Button>

              <!-- UN SOLO BOTÓN: BAJA / REACTIVAR -->
              <Button
                type="button"
                size="sm"
                class="col-span-2 gap-2 text-xs transition-all hover:-translate-y-[1px] active:translate-y-0"
                :class="actionBtnClass(s.status)"
                @click.prevent="s.status === 'activo' ? confirmDeactivate(s) : confirmReactivate(s)"
              >
                <span class="font-extrabold">
                  {{ s.status === 'activo' ? 'Dar de baja' : 'Reactivar' }}
                </span>
              </Button>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-zinc-950/40
                 p-10 sm:p-14 text-center shadow-lg"
        >
          <p class="text-slate-600 dark:text-zinc-400 font-extrabold">No se encontraron servicios con los filtros actuales.</p>
        </div>
      </div>

      <!-- MODAL -->
      <div v-if="crud.modalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" @click="crud.closeModal" />

        <div
          class="relative w-full max-w-[980px] xl:max-w-[1040px]
                 max-h-[86vh] sm:max-h-[88vh]
                 overflow-hidden rounded-2xl lg:rounded-3xl
                 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 shadow-2xl"
          @click.stop
        >
          <div class="flex items-start justify-between gap-4 p-4 sm:p-5 border-b border-slate-200 dark:border-white/10
                      bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950">
            <div class="min-w-0">
              <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100">
                {{ crud.modalMode === 'create' ? 'Nuevo servicio' : 'Editar servicio' }}
              </h3>
            </div>

            <Button type="button" variant="ghost" size="sm" class="h-10 w-10 rounded-full" @click="crud.closeModal">
              <X class="h-5 w-5" />
            </Button>
          </div>

          <div class="p-4 sm:p-5 overflow-y-auto max-h-[calc(86vh-128px)] sm:max-h-[calc(88vh-128px)]">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-1">
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

              <div class="md:col-span-1">
                <label class="mb-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  Nombre
                </label>
                <Input
                  v-model="crud.form.nombre"
                  placeholder="Servicio"
                  class="h-11 sm:h-12 border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/60"
                />
                <p v-if="crud.errors.nombre" class="mt-2 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                  {{ crud.errors.nombre }}
                </p>
              </div>

              <div class="md:col-span-1">
                <label class="mb-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  Precio
                </label>
                <Input
                  v-model="crud.form.precio"
                  type="number"
                  min="0"
                  step="0.01"
                  class="h-11 sm:h-12 border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/60"
                />
                <p v-if="crud.errors.precio" class="mt-2 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                  {{ crud.errors.precio }}
                </p>
              </div>

              <div class="md:col-span-2">
                <label class="mb-2 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-zinc-300">
                  Descripción
                </label>
                <textarea
                  v-model="crud.form.descripcion"
                  rows="4"
                  class="w-full rounded-xl border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5
                         px-4 py-3 text-sm sm:text-base text-slate-900 dark:text-zinc-100
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/60"
                  placeholder="Opcional"
                />
                <p v-if="crud.errors.descripcion" class="mt-2 text-xs font-extrabold text-rose-600 dark:text-rose-300">
                  {{ crud.errors.descripcion }}
                </p>
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
