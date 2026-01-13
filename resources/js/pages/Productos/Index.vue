<script setup lang="ts">
    import { Head } from '@inertiajs/vue3'
    import { computed } from 'vue'
    import AppLayout from '@/layouts/AppLayout.vue'
    
    import { useProductosIndex } from '@/composables/crud/useProductosIndex'
    
    import PrimaryButton from '@/components/ui/PrimaryButton.vue'
    import SecondaryButton from '@/components/ui/SecondaryButton.vue'
    import ModalShell from '@/components/ui/ModalShell.vue'
    import PaginationLinks from '@/components/ui/PaginationLinks.vue'
    import DataTable, { type DataTableColumn } from '@/components/ui/DataTable.vue'
    
    import type { Producto } from '@/types/catalogo'
    
    const ui = useProductosIndex()
    
    // Paginated normalizado desde el composable
    const rows = computed(() => ui.productos.value.data)
    const links = computed(() => ui.productos.value.links)
    const meta = computed(() => ui.productos.value.meta)
    
    const columns = computed<DataTableColumn<Producto>[]>(() => [
      { key: 'sku', label: 'SKU', sortable: true, cellClass: 'font-semibold text-slate-900 dark:text-white' },
      { key: 'nombre', label: 'Nombre', sortable: true },
      { key: 'marca.nombre', label: 'Marca', sortable: true, headerClass: 'hidden md:table-cell', cellClass: 'hidden md:table-cell' },
      { key: 'categoria.nombre', label: 'Categoría', sortable: true, headerClass: 'hidden lg:table-cell', cellClass: 'hidden lg:table-cell' },
      { key: 'precio_venta', label: 'Precio', sortable: true, headerClass: 'text-right', cellClass: 'text-right font-semibold text-slate-900 dark:text-white' },
      { key: 'stock', label: 'Stock', sortable: true, headerClass: 'text-center hidden sm:table-cell', cellClass: 'text-center hidden sm:table-cell' },
      { key: 'status', label: 'Status', sortable: true, headerClass: 'text-center', cellClass: 'text-center' },
      { key: 'acciones', label: 'Acciones', headerClass: 'text-right', cellClass: 'text-right' },
    ])
    </script>
    
    <template>
      <AppLayout>
        <Head title="Productos" />
    
        <div class="px-4 sm:px-6 lg:px-8 py-6">
          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Productos
              </h1>
              <p class="mt-1 text-sm text-slate-600 dark:text-neutral-300">
                Gestión de catálogo, precios y media. Eliminación lógica por status.
              </p>
            </div>
    
            <!-- Filtros server-side -->
            <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
              <div class="flex gap-2">
                <input
                  v-model="ui.q"
                  class="w-full sm:w-72 rounded-xl border border-black/10 dark:border-white/10
                         bg-white dark:bg-neutral-900 text-slate-900 dark:text-white
                         px-3 py-2 text-sm outline-none
                         focus:ring-2 focus:ring-slate-300 dark:focus:ring-neutral-700 transition"
                  placeholder="Buscar por SKU o nombre"
                  @keyup.enter="ui.applyFilters"
                />
                <select
                  v-model="ui.status"
                  class="rounded-xl border border-black/10 dark:border-white/10
                         bg-white dark:bg-neutral-900 text-slate-900 dark:text-white
                         px-3 py-2 text-sm outline-none transition"
                  @change="ui.applyFilters"
                >
                  <option value="activo">Activos</option>
                  <option value="inactivo">Inactivos</option>
                  <option value="todos">Todos</option>
                </select>
              </div>
    
              <div class="flex gap-2">
                <SecondaryButton type="button" @click="ui.resetFilters">Limpiar</SecondaryButton>
                <PrimaryButton type="button" @click="ui.openCreate">Nuevo</PrimaryButton>
              </div>
            </div>
          </div>
    
          <!-- Tabla reutilizable (con búsqueda/orden CLIENT-side en tiempo real) -->
          <div class="mt-6">
            <DataTable
              :rows="rows"
              :columns="columns"
              :search-keys="['sku','nombre','marca.nombre','categoria.nombre','status']"
              search-placeholder="Buscar en la tabla (tiempo real)"
              empty-text="Sin resultados. Ajusta filtros o crea un producto."
            >
              <!-- Nombre con descripción -->
              <template #cell-nombre="{ row }">
                <div class="text-slate-800 dark:text-neutral-200">
                  <div class="font-semibold">{{ row.nombre }}</div>
                  <div class="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1">
                    {{ row.descripcion ?? '—' }}
                  </div>
                </div>
              </template>
    
              <!-- Marca/Categoría (si vienen null) -->
              <template #cell-marca.nombre="{ value }">
                <span class="text-slate-700 dark:text-neutral-300">{{ value ?? '—' }}</span>
              </template>
              <template #cell-categoria.nombre="{ value }">
                <span class="text-slate-700 dark:text-neutral-300">{{ value ?? '—' }}</span>
              </template>
    
              <!-- Status badge -->
              <template #cell-status="{ row }">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border"
                  :class="row.status === 'activo'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                    : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20'"
                >
                  {{ row.status }}
                </span>
              </template>
    
              <!-- Acciones -->
              <template #cell-acciones="{ row }">
                <div class="flex justify-end gap-2">
                  <SecondaryButton type="button" @click="ui.view(row)">Ver</SecondaryButton>
                  <SecondaryButton type="button" @click="ui.openEdit(row)">Editar</SecondaryButton>
                  <button
                    type="button"
                    class="rounded-xl px-3 py-2 text-sm font-semibold transition
                           bg-rose-600 text-white hover:bg-rose-700 hover:-translate-y-[1px] active:translate-y-0"
                    @click="ui.remove(row)"
                  >
                    Eliminar
                  </button>
                </div>
              </template>
            </DataTable>
          </div>
    
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1 py-4">
            <div class="text-xs text-slate-600 dark:text-neutral-400">
              Página {{ meta.current_page }} de {{ meta.last_page }} — Total: {{ meta.total }}
            </div>
            <PaginationLinks :links="links" />
          </div>
    
          <!-- Modal Create/Edit -->
          <ModalShell
            :key="ui.isEditing ? 'edit' : 'create'"
            :open="ui.modalOpen"
            :title="ui.isEditing ? 'Editar producto' : 'Nuevo producto'"
            subtitle="Validación inline. Guardado vía Inertia."
            @close="ui.closeModal"
          >
            <form class="grid grid-cols-1 lg:grid-cols-2 gap-4" @submit.prevent="ui.submit">
              <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Marca</label>
                  <select
                    v-model="ui.form.marca_id"
                    class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10
                           bg-white dark:bg-neutral-900 text-slate-900 dark:text-white px-3 py-2 text-sm"
                  >
                    <option :value="null">—</option>
                    <option v-for="m in ui.marcas" :key="m.id" :value="m.id">{{ m.nombre }}</option>
                  </select>
                  <div v-if="ui.form.errors.marca_id" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.marca_id }}</div>
                </div>
    
                <div>
                  <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Categoría</label>
                  <select
                    v-model="ui.form.categoria_id"
                    class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10
                           bg-white dark:bg-neutral-900 text-slate-900 dark:text-white px-3 py-2 text-sm"
                  >
                    <option :value="null">—</option>
                    <option v-for="c in ui.categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
                  </select>
                  <div v-if="ui.form.errors.categoria_id" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.categoria_id }}</div>
                </div>
              </div>
    
              <div>
                <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">SKU *</label>
                <input v-model="ui.form.sku" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
                <div v-if="ui.form.errors.sku" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.sku }}</div>
              </div>
    
              <div>
                <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Nombre *</label>
                <input v-model="ui.form.nombre" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
                <div v-if="ui.form.errors.nombre" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.nombre }}</div>
              </div>
    
              <div class="lg:col-span-2">
                <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Descripción</label>
                <textarea v-model="ui.form.descripcion" rows="3" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
                <div v-if="ui.form.errors.descripcion" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.descripcion }}</div>
              </div>
    
              <div class="grid grid-cols-2 gap-4 lg:col-span-2">
                <div>
                  <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Stock *</label>
                  <input type="number" v-model="ui.form.stock" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
                  <div v-if="ui.form.errors.stock" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.stock }}</div>
                </div>
    
                <div>
                  <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Status</label>
                  <select v-model="ui.form.status" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm">
                    <option value="activo">activo</option>
                    <option value="inactivo">inactivo</option>
                  </select>
                  <div v-if="ui.form.errors.status" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.status }}</div>
                </div>
              </div>
    
              <div class="grid grid-cols-2 gap-4 lg:col-span-2">
                <div>
                  <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Costo lista *</label>
                  <input type="number" step="0.01" v-model="ui.form.costo_lista" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
                  <div v-if="ui.form.errors.costo_lista" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.costo_lista }}</div>
                </div>
    
                <div>
                  <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Precio venta *</label>
                  <input type="number" step="0.01" v-model="ui.form.precio_venta" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
                  <div v-if="ui.form.errors.precio_venta" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.precio_venta }}</div>
                </div>
              </div>
    
              <div class="lg:col-span-2 flex flex-col sm:flex-row justify-end gap-2 pt-2">
                <SecondaryButton type="button" @click="ui.closeModal">Cancelar</SecondaryButton>
                <PrimaryButton type="submit" :disabled="ui.form.processing">
                  {{ ui.form.processing ? 'Guardando...' : 'Guardar' }}
                </PrimaryButton>
              </div>
    
              <!-- Media -->
              <div class="lg:col-span-2 mt-4 border-t border-black/10 dark:border-white/10 pt-4">
                <h4 class="text-sm font-bold text-slate-900 dark:text-white">Media (fotos/videos)</h4>
                <p class="text-xs text-slate-600 dark:text-neutral-400 mt-1">
                  Se guarda URL (imagen/video). Requiere estar en modo edición (producto existente).
                </p>
    
                <div class="mt-3 grid grid-cols-1 md:grid-cols-4 gap-3">
                  <select v-model="ui.mediaForm.tipo" class="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm">
                    <option value="imagen">imagen</option>
                    <option value="video">video</option>
                  </select>
    
                  <input v-model="ui.mediaForm.url" placeholder="https://..." class="md:col-span-2 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
                  <input type="number" v-model="ui.mediaForm.orden" class="rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
    
                  <label class="md:col-span-4 flex items-center gap-2 text-sm text-slate-700 dark:text-neutral-300">
                    <input type="checkbox" v-model="ui.mediaForm.principal" />
                    Marcar como principal
                  </label>
    
                  <div class="md:col-span-4 flex justify-end gap-2">
                    <SecondaryButton type="button" @click="ui.resetMediaForm">Limpiar</SecondaryButton>
                    <PrimaryButton type="button" :disabled="!ui.canAddMedia" @click="ui.addMedia">
                      Agregar media
                    </PrimaryButton>
                  </div>
    
                  <div v-if="ui.mediaForm.errors.url" class="md:col-span-4 text-xs text-rose-600">
                    {{ ui.mediaForm.errors.url }}
                  </div>
                </div>
              </div>
            </form>
          </ModalShell>
        </div>
      </AppLayout>
    </template>
    