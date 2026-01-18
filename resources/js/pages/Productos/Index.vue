<!-- 
  VISTA PRINCIPAL DE PRODUCTOS - Index.vue
  =========================================
  
  Descripción: 
  - Vista principal de gestión de productos con diseño responsivo completo
  - Incluye: Filtros avanzados, CRUD en modales, gestión de imágenes, preview de medias
  - Diseño moderno con Tailwind (sm, md, lg, xl, 2xl)
  - Integración completa con Inertia.js y SweetAlert2
  
  Características nuevas:
  1. Vista de imágenes de productos con preview
  2. Modal de gestión de imágenes con drag & drop
  3. Efectos visuales modernos (hovers, transitions, shadows)
  4. Completamente responsive en todos los breakpoints
  5. Modal de cierre con botón X
  6. KPIs mejorados con badges visuales
  
  Autor: [Tu nombre aquí]
  Fecha: [Fecha actual]
  Versión: 2.0
-->

<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import { computed, ref, onMounted } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'
import PaginationLinks from '@/components/ui/PaginationLinks.vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProductoMediaManager from '@/components/ProductoMediaManager.vue'

import type { Paginated } from '@/types/common'
import type { Producto, MarcaLite, CategoriaLite } from '@/composables/crud/useProductoCrud'
import { useProductoCrud } from '@/composables/crud/useProductoCrud'

import { 
  Plus, Pencil, Power, RefreshCw, Search, Filter, 
  Tag, Layers, Barcode, DollarSign, Package, Image, 
  X, Eye, Grid, List, ChevronDown, ChevronUp, 
  TrendingUp, TrendingDown, AlertCircle, CheckCircle
} from 'lucide-vue-next'

// ============================================================================
// PROPS Y CONFIGURACIÓN INICIAL
// ============================================================================

/**
 * Props recibidos desde el controlador Laravel via Inertia.js
 */
const props = defineProps<{
  items: Paginated<Producto>
  filters: Partial<{ q: string; status: string; marca_id: string; categoria_id: string }>
  meta: {
    statuses: string[]
    marcas: { data?: MarcaLite[] } | MarcaLite[]
    categorias: { data?: CategoriaLite[] } | CategoriaLite[]
  }
}>()

// ============================================================================
// COMPUTED PROPERTIES Y ESTADOS LOCALES
// ============================================================================

/**
 * Normaliza los catálogos de marcas y categorías
 */
const marcas = computed<MarcaLite[]>(() => {
  const v: any = props.meta.marcas
  return Array.isArray(v) ? v : (v?.data ?? [])
})

const categorias = computed<CategoriaLite[]>(() => {
  const v: any = props.meta.categorias
  return Array.isArray(v) ? v : (v?.data ?? [])
})

/**
 * Composable principal para CRUD de productos
 */
const crud = useProductoCrud({
  initialFilters: props.filters,
  baseUrl: '/productos',
})

// ============================================================================
// ESTADOS PARA MODALES Y VISTAS
// ============================================================================

const showMediaModal = ref(false)
const selectedProductForMedia = ref<Producto | null>(null)
const isGridView = ref(false)

// ============================================================================
// KPIs Y ESTADÍSTICAS
// ============================================================================

/**
 * Calcula KPIs y estadísticas de la página actual
 */
const kpi = computed(() => {
  const d = props.items.data ?? []
  const activos = d.filter((x) => x.status === 'activo').length
  const inactivos = d.filter((x) => x.status === 'inactivo').length
  const stockTotal = d.reduce((acc, x) => acc + (Number(x.stock ?? 0) || 0), 0)
  
  let margenPromedio = 0
  if (d.length > 0) {
    const margenes = d.filter(p => {
      const costo = Number(p.costo_lista) || 0
      const precio = Number(p.precio_venta) || 0
      return costo > 0 && precio > 0
    }).map(p => {
      const costo = Number(p.costo_lista)
      const precio = Number(p.precio_venta)
      return ((precio - costo) / costo) * 100
    })
    
    if (margenes.length > 0) {
      margenPromedio = margenes.reduce((a, b) => a + b, 0) / margenes.length
    }
  }
  
  return { 
    page: d.length, 
    activos, 
    inactivos, 
    stockTotal,
    margenPromedio: Math.round(margenPromedio * 100) / 100
  }
})

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Formatea números como moneda mexicana
 */
function money(v: any): string {
  const n = Number(v)
  if (!Number.isFinite(n)) return String(v ?? '')
  return n.toLocaleString('es-MX', { 
    style: 'currency', 
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

/**
 * Devuelve clases CSS para el badge de estado
 */
function statusPill(status: string): string {
  return status === 'activo'
    ? 'bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30 dark:ring-emerald-500/50 shadow-lg shadow-emerald-500/10'
    : 'bg-gradient-to-r from-rose-500/20 to-rose-600/10 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30 dark:ring-rose-500/50 shadow-lg shadow-rose-500/10'
}

/**
 * Devuelve clases CSS para el punto indicador de estado
 */
function rowDot(status: string): string {
  return status === 'activo'
    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_15px_rgba(16,185,129,.3)] animate-pulse-subtle'
    : 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-[0_0_15px_rgba(244,63,94,.3)]'
}

/**
 * Determina las clases para el botón de estado
 */
function getStatusButtonClasses(status: string): string {
  if (status === 'activo') {
    return 'bg-gradient-to-r from-rose-600 to-pink-500 text-white hover:from-rose-500 hover:to-pink-400'
  } else {
    return 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-400'
  }
}

/**
 * Abre modal de gestión de imágenes para un producto
 */
function openMediaModal(producto: Producto): void {
  selectedProductForMedia.value = producto
  showMediaModal.value = true
}

/**
 * Cierra el modal de gestión de imágenes
 */
function closeMediaModal(): void {
  showMediaModal.value = false
  setTimeout(() => {
    selectedProductForMedia.value = null
  }, 300)
}

// ============================================================================
// EFECTOS DE MONTAJE
// ============================================================================

onMounted(() => {
  if (window.innerWidth < 1024) {
    isGridView.value = true
  }
})
</script>

<template>
  <Head title="Gestión de Productos" />

  <AppLayout>
    <div class="px-4 py-5 sm:px-6 md:px-8 lg:px-10 xl:px-12 2xl:px-14">
      
      <!-- SECCIÓN 1: ENCABEZADO CON KPIs Y ACCIONES -->
      <div class="mb-6 lg:mb-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
          <div class="space-y-2">
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 dark:text-zinc-100">
              Gestión de Productos
            </h1>
            <p class="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-medium">
              Administra, crea y visualiza todos los productos del catálogo
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              v-if="!isGridView"
              type="button"
              variant="outline"
              size="sm"
              class="hidden lg:flex gap-2 items-center"
              @click="isGridView = !isGridView"
            >
              <Grid class="h-4 w-4" />
              <span class="text-xs sm:text-sm">Vista tarjetas</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              class="gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              @click="crud.resetFilters"
              :disabled="!crud.hasActiveFilters"
            >
              <RefreshCw class="h-4 w-4" />
              <span class="hidden sm:inline text-xs sm:text-sm font-semibold">Reiniciar</span>
            </Button>

            <Button
              type="button"
              size="sm"
              class="gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-500 hover:to-teal-400 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-emerald-500/25"
              @click="crud.openForm({ marcas: marcas, categorias: categorias })"
            >
              <Plus class="h-4 w-4" />
              <span class="text-xs sm:text-sm font-extrabold">Nuevo Producto</span>
            </Button>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 2: KPIs Y ESTADÍSTICAS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 lg:mb-8">
        <div class="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/20 dark:to-zinc-900 rounded-2xl p-4 sm:p-5 border border-emerald-100 dark:border-emerald-800/30 shadow-lg shadow-emerald-500/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300">Activos</p>
              <p class="text-xl sm:text-2xl lg:text-3xl font-black text-emerald-900 dark:text-emerald-200">
                {{ kpi.activos }}
              </p>
            </div>
            <div class="p-2 sm:p-3 bg-emerald-100 dark:bg-emerald-900/40 rounded-full">
              <CheckCircle class="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-rose-50 to-white dark:from-rose-900/20 dark:to-zinc-900 rounded-2xl p-4 sm:p-5 border border-rose-100 dark:border-rose-800/30 shadow-lg shadow-rose-500/5 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm font-semibold text-rose-800 dark:text-rose-300">Inactivos</p>
              <p class="text-xl sm:text-2xl lg:text-3xl font-black text-rose-900 dark:text-rose-200">
                {{ kpi.inactivos }}
              </p>
            </div>
            <div class="p-2 sm:p-3 bg-rose-100 dark:bg-rose-900/40 rounded-full">
              <AlertCircle class="h-5 w-5 sm:h-6 sm:w-6 text-rose-600 dark:text-rose-400" />
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-zinc-900 rounded-2xl p-4 sm:p-5 border border-blue-100 dark:border-blue-800/30 shadow-lg shadow-blue-500/5 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-300">Stock Total</p>
              <p class="text-xl sm:text-2xl lg:text-3xl font-black text-blue-900 dark:text-blue-200">
                {{ kpi.stockTotal }}
              </p>
            </div>
            <div class="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/40 rounded-full">
              <Package class="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div class="bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-zinc-900 rounded-2xl p-4 sm:p-5 border border-purple-100 dark:border-purple-800/30 shadow-lg shadow-purple-500/5 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-xs sm:text-sm font-semibold text-purple-800 dark:text-purple-300">Margen Prom.</p>
              <p class="text-xl sm:text-2xl lg:text-3xl font-black text-purple-900 dark:text-purple-200">
                {{ kpi.margenPromedio }}%
              </p>
            </div>
            <div class="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/40 rounded-full">
              <TrendingUp class="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 3: FILTROS AVANZADOS -->
      <div class="mb-6 lg:mb-8">
        <div class="rounded-2xl lg:rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/80 dark:bg-zinc-950/50 p-4 sm:p-5 lg:p-6 shadow-xl shadow-slate-200/20 dark:shadow-black/20 backdrop-blur-sm hover:backdrop-blur transition-all duration-300">
          
          <div class="flex items-center justify-between mb-4 sm:mb-5">
            <h3 class="text-lg sm:text-xl font-bold text-slate-900 dark:text-zinc-100">
              Filtros de Búsqueda
            </h3>
            <Filter class="h-5 w-5 text-slate-400 dark:text-zinc-500" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
            
            <div class="lg:col-span-4">
              <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300">
                <Search class="h-4 w-4" />
                Buscar Producto
              </label>
              <div class="relative">
                <Input
                  v-model="crud.filters.q"
                  placeholder="SKU, nombre, descripción..."
                  class="h-11 sm:h-12 pl-4 pr-12 text-sm sm:text-base border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
                />
                <div class="absolute inset-y-0 right-3 flex items-center">
                  <Search class="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 dark:text-zinc-500" />
                </div>
              </div>
            </div>

            <div class="lg:col-span-3">
              <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300">
                <Tag class="h-4 w-4" />
                Marca
              </label>
              <select
                v-model="crud.filters.marca_id"
                class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base font-medium border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 rounded-xl transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
              >
                <option :value="crud.ALL">Todas las Marcas</option>
                <option v-for="m in marcas" :key="m.id" :value="String(m.id)">
                  {{ m.nombre }}
                </option>
              </select>
            </div>

            <div class="lg:col-span-3">
              <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300">
                <Layers class="h-4 w-4" />
                Categoría
              </label>
              <select
                v-model="crud.filters.categoria_id"
                class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base font-medium border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 rounded-xl transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
              >
                <option :value="crud.ALL">Todas las Categorías</option>
                <option v-for="c in categorias" :key="c.id" :value="String(c.id)">
                  {{ c.nombre }}
                </option>
              </select>
            </div>

            <div class="lg:col-span-2">
              <label class="mb-2 flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300">
                <Filter class="h-4 w-4" />
                Estado
              </label>
              <select
                v-model="crud.filters.status"
                class="w-full h-11 sm:h-12 px-3 sm:px-4 text-sm sm:text-base font-medium border-2 border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-white/5 rounded-xl transition-all duration-200 focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
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

      <!-- SECCIÓN 4: LISTADO DE PRODUCTOS (TABLA DESKTOP) -->
      <div v-if="!isGridView" class="hidden lg:block">
        <div class="rounded-2xl lg:rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950/40 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-black/20 transition-all duration-300 hover:shadow-2xl">
          
          <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950">
            <div>
              <h4 class="text-lg font-black text-slate-900 dark:text-zinc-100">Listado de Productos</h4>
              <p class="text-sm text-slate-500 dark:text-zinc-500">
                Mostrando {{ items.data.length }} de {{ items.total }} productos
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              class="gap-2"
              @click="isGridView = true"
            >
              <Grid class="h-4 w-4" />
              Vista tarjetas
            </Button>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-sm lg:text-base">
              <thead class="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-white/5 dark:to-white/2">
                <tr>
                  <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">ID</th>
                  <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">SKU</th>
                  <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">Producto</th>
                  <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">Marca</th>
                  <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">Categoría</th>
                  <th class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">Stock</th>
                  <th class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">Costo</th>
                  <th class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">Venta</th>
                  <th class="px-6 py-4 text-left font-extrabold text-slate-900 dark:text-zinc-100">Estado</th>
                  <th class="px-6 py-4 text-right font-extrabold text-slate-900 dark:text-zinc-100">Acciones</th>
                </tr>
              </thead>

              <tbody>
                <tr
                  v-for="p in props.items.data"
                  :key="p.id"
                  class="border-t border-slate-100 dark:border-white/10 transition-all duration-200 hover:bg-slate-50/80 dark:hover:bg-white/[0.03] group hover:scale-[1.002]"
                >
                  <td class="px-6 py-4 text-sm font-medium text-slate-500 dark:text-zinc-500">
                    #{{ p.id }}
                  </td>

                  <td class="px-6 py-4">
                    <div class="flex items-center gap-2 group-hover:gap-3 transition-all duration-200">
                      <Barcode class="h-4 w-4 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-500" />
                      <span class="font-bold text-slate-900 dark:text-zinc-100">{{ p.sku }}</span>
                    </div>
                  </td>

                  <td class="px-6 py-4">
                    <div class="flex items-center gap-3">
                      <span class="h-3 w-3 rounded-full" :class="rowDot(p.status)" />
                      
                      <div class="min-w-0 flex-1">
                        <p class="truncate font-extrabold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                          {{ p.nombre }}
                        </p>
                        
                        <p v-if="p.descripcion" 
                           class="truncate text-xs text-slate-500 dark:text-zinc-500 mt-1">
                          {{ p.descripcion }}
                        </p>
                        
                        <div v-if="p.medias && p.medias.length > 0" 
                             class="flex items-center gap-1 mt-1">
                          <Image class="h-3 w-3 text-slate-400" />
                          <span class="text-xs text-slate-500">
                            {{ p.medias.length }} imagen{{ p.medias.length !== 1 ? 'es' : '' }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>

                  <td class="px-6 py-4 text-slate-700 dark:text-zinc-200 font-medium">
                    {{ p.marca?.nombre ?? '—' }}
                  </td>

                  <td class="px-6 py-4 text-slate-700 dark:text-zinc-200 font-medium">
                    {{ p.categoria?.nombre ?? '—' }}
                  </td>

                  <td class="px-6 py-4 text-right">
                    <span class="inline-flex items-center gap-2 justify-end font-bold text-slate-900 dark:text-zinc-100">
                      <Package class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      {{ p.stock }}
                    </span>
                  </td>

                  <td class="px-6 py-4 text-right">
                    <span class="inline-flex items-center gap-1 font-bold text-slate-900 dark:text-zinc-100">
                      <DollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      {{ money(p.costo_lista) }}
                    </span>
                  </td>

                  <td class="px-6 py-4 text-right">
                    <span class="inline-flex items-center gap-1 font-extrabold text-slate-900 dark:text-zinc-100">
                      <DollarSign class="h-4 w-4 text-slate-400 dark:text-zinc-500" />
                      {{ money(p.precio_venta) }}
                    </span>
                  </td>

                  <td class="px-6 py-4">
                    <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all duration-200 hover:scale-105" 
                          :class="statusPill(p.status)">
                      {{ p.status.charAt(0).toUpperCase() + p.status.slice(1) }}
                    </span>
                  </td>

                  <td class="px-6 py-4 text-right">
                    <div class="inline-flex items-center gap-2 justify-end">
                      
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        class="gap-2 border-slate-200 bg-white/70 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-slate-50 dark:hover:bg-white/10"
                        @click.prevent="openMediaModal(p)"
                        :title="`Gestionar imágenes (${p.medias?.length || 0})`"
                      >
                        <Image class="h-4 w-4" />
                        <span class="font-bold">Imágenes</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        class="gap-2 border-slate-200 bg-white/70 text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-zinc-100 transition-all duration-200 hover:scale-105 active:scale-95 hover:bg-slate-50 dark:hover:bg-white/10"
                        @click.prevent="crud.openForm({ marcas: marcas, categorias: categorias }, p)"
                      >
                        <Pencil class="h-4 w-4" />
                        <span class="font-bold">Editar</span>
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        class="gap-2 transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg shadow-rose-500/10 hover:shadow-xl"
                        :class="getStatusButtonClasses(p.status)"
                        @click.prevent="crud.toggleStatus(p)"
                      >
                        <Power class="h-4 w-4" />
                        <span class="font-bold">
                          {{ p.status === 'activo' ? 'Desactivar' : 'Activar' }}
                        </span>
                      </Button>
                    </div>
                  </td>
                </tr>

                <tr v-if="!props.items.data.length">
                  <td colspan="10" class="px-6 py-16 text-center">
                    <div class="flex flex-col items-center justify-center gap-3">
                      <Package class="h-12 w-12 text-slate-300 dark:text-zinc-700" />
                      <p class="text-lg font-medium text-slate-500 dark:text-zinc-500">
                        No se encontraron productos
                      </p>
                      <p class="text-sm text-slate-400 dark:text-zinc-600">
                        Intenta con otros filtros de búsqueda
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="border-t border-slate-200 dark:border-white/10 px-6 py-4 bg-slate-50/50 dark:bg-white/2">
            <PaginationLinks :links="props.items.links" />
          </div>
        </div>
      </div>

      <!-- SECCIÓN 5: VISTA DE TARJETAS (MOBILE/TABLET) -->
      <div v-else class="lg:hidden">
        <div class="flex items-center justify-between mb-4">
          <h4 class="text-lg font-bold text-slate-900 dark:text-zinc-100">
            Productos ({{ items.total }})
          </h4>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="gap-2"
            @click="isGridView = false"
          >
            <List class="h-4 w-4" />
            Vista tabla
          </Button>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          
          <div
            v-for="p in props.items.data"
            :key="p.id"
            class="rounded-2xl border border-slate-200/70 dark:border-white/10 bg-white/90 dark:bg-zinc-950/40 p-4 sm:p-5 shadow-lg shadow-slate-200/10 dark:shadow-black/10 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-emerald-200 dark:hover:border-emerald-500/30 group"
          >
            <div class="flex items-start justify-between gap-4 mb-4">
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-xs font-bold text-slate-500 dark:text-zinc-500">#{{ p.id }}</span>
                  <span class="h-2 w-2 rounded-full" :class="rowDot(p.status)" />
                  <span class="text-xs font-extrabold px-2 py-1 rounded-full" :class="statusPill(p.status)">
                    {{ p.status }}
                  </span>
                </div>

                <h5 class="text-base sm:text-lg font-black text-slate-900 dark:text-zinc-100 truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {{ p.nombre }}
                </h5>

                <div class="flex items-center gap-2 mt-1 text-sm text-slate-700 dark:text-zinc-200">
                  <Barcode class="h-3.5 w-3.5 text-slate-400" />
                  <span class="font-bold">{{ p.sku }}</span>
                </div>

                <p v-if="p.descripcion" 
                   class="mt-2 text-xs text-slate-500 dark:text-zinc-500 line-clamp-2">
                  {{ p.descripcion }}
                </p>
              </div>

              <div v-if="p.medias && p.medias.length > 0" 
                   class="relative flex-shrink-0">
                <div class="h-14 w-14 sm:h-16 sm:w-16 rounded-xl overflow-hidden border-2 border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-zinc-800">
                  <img 
                    :src="`/storage/${p.medias[0].url}`" 
                    :alt="`Imagen de ${p.nombre}`"
                    class="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  <div class="absolute -top-2 -right-2 bg-emerald-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {{ p.medias.length }}
                  </div>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
              <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-2 sm:p-3">
                <p class="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1">Marca</p>
                <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  {{ p.marca?.nombre ?? '—' }}
                </p>
              </div>

              <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-2 sm:p-3">
                <p class="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1">Categoría</p>
                <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  {{ p.categoria?.nombre ?? '—' }}
                </p>
              </div>

              <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-2 sm:p-3">
                <p class="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1">Stock</p>
                <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  {{ p.stock }} unidades
                </p>
              </div>

              <div class="rounded-xl border border-slate-200/50 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 p-2 sm:p-3">
                <p class="text-xs font-bold text-slate-500 dark:text-zinc-400 mb-1">Precio</p>
                <p class="text-sm font-extrabold text-slate-900 dark:text-zinc-100">
                  {{ money(p.precio_venta) }}
                </p>
              </div>
            </div>

            <div class="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                class="flex-1 gap-2 text-xs"
                @click.prevent="openMediaModal(p)"
              >
                <Image class="h-3.5 w-3.5" />
                Imágenes
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                class="flex-1 gap-2 text-xs"
                @click.prevent="crud.openForm({ marcas: marcas, categorias: categorias }, p)"
              >
                <Pencil class="h-3.5 w-3.5" />
                Editar
              </Button>

              <Button
                type="button"
                size="sm"
                class="flex-1 gap-2 text-xs"
                :class="getStatusButtonClasses(p.status)"
                @click.prevent="crud.toggleStatus(p)"
              >
                <Power class="h-3.5 w-3.5" />
                {{ p.status === 'activo' ? 'Desactivar' : 'Activar' }}
              </Button>
            </div>
          </div>

          <div
            v-if="!props.items.data.length"
            class="col-span-full rounded-2xl border-2 border-dashed border-slate-300 dark:border-white/20 bg-white/50 dark:bg-zinc-950/30 p-10 sm:p-12 text-center"
          >
            <div class="flex flex-col items-center justify-center gap-4">
              <Package class="h-16 w-16 text-slate-300 dark:text-zinc-700" />
              <div>
                <p class="text-lg font-bold text-slate-500 dark:text-zinc-400">
                  No se encontraron productos
                </p>
                <p class="text-sm text-slate-400 dark:text-zinc-600 mt-1">
                  Intenta ajustar los filtros o crear un nuevo producto
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                class="mt-2 gap-2"
                @click="crud.openForm({ marcas: marcas, categorias: categorias })"
              >
                <Plus class="h-4 w-4" />
                Crear primer producto
              </Button>
            </div>
          </div>
        </div>

        <div v-if="props.items.data.length" class="mt-6">
          <div class="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-zinc-950/40 p-4">
            <PaginationLinks :links="props.items.links" />
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE GESTIÓN DE IMÁGENES -->
    <div v-if="showMediaModal && selectedProductForMedia" 
         class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" 
           @click="closeMediaModal"></div>
      
      <div class="relative w-full max-w-6xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl lg:rounded-3xl shadow-2xl shadow-black/30 border border-slate-200 dark:border-white/10 transform transition-all duration-300 scale-100"
           @click.stop>
        
        <div class="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-slate-50 to-white dark:from-zinc-800 dark:to-zinc-900">
          <div>
            <h3 class="text-xl lg:text-2xl font-black text-slate-900 dark:text-zinc-100">
              Gestión de Imágenes
            </h3>
            <p class="text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {{ selectedProductForMedia.nombre }} ({{ selectedProductForMedia.sku }})
            </p>
          </div>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200 hover:scale-110"
            @click="closeMediaModal"
          >
            <X class="h-5 w-5" />
          </Button>
        </div>
        
        <div class="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <ProductoMediaManager 
            :producto-id="selectedProductForMedia.id"
            :initial-medias="selectedProductForMedia.medias || []"
            @media-updated="crud.applyFilters"
          />
        </div>
        
        <div class="p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/2">
          <div class="flex items-center justify-between">
            <p class="text-sm text-slate-500 dark:text-zinc-400">
              Las imágenes se guardarán automáticamente
            </p>
            <Button
              type="button"
              variant="outline"
              @click="closeMediaModal"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<style scoped>
@keyframes pulse-subtle {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-pulse-subtle {
  animation: pulse-subtle 2s ease-in-out infinite;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.modal-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
}

.modal-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.modal-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.modal-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.3);
  border-radius: 20px;
}

.hover-lift {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}
</style>