<script setup lang="ts">
    import { computed, ref } from 'vue'
    
    type SortDir = 'asc' | 'desc'
    
    export type DataTableColumn<T> = {
      key: keyof T | string
      label: string
      sortable?: boolean
      headerClass?: string
      cellClass?: string
    }
    
    const props = defineProps<{
      rows: any[]
      columns: DataTableColumn<any>[]
      /**
       * Keys para búsqueda (si no los pasas, usa las columnas).
       * Ej: ['sku','nombre','marca.nombre']
       */
      searchKeys?: string[]
      /**
       * Placeholder del buscador
       */
      searchPlaceholder?: string
      /**
       * Texto cuando no hay resultados
       */
      emptyText?: string
    }>()
    
    const search = ref('')
    
    const sortKey = ref<string | null>(null)
    const sortDir = ref<SortDir>('asc')
    
    function toggleSort(key: string) {
      if (sortKey.value !== key) {
        sortKey.value = key
        sortDir.value = 'asc'
        return
      }
      sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
    }
    
    function getByPath(row: any, path: string) {
      // soporta "marca.nombre"
      return path.split('.').reduce((acc, k) => (acc != null ? acc[k] : undefined), row)
    }
    
    const effectiveSearchKeys = computed(() => {
      if (props.searchKeys?.length) return props.searchKeys
      return props.columns.map((c) => String(c.key))
    })
    
    const filteredRows = computed(() => {
      const q = search.value.trim().toLowerCase()
      if (!q) return props.rows ?? []
    
      return (props.rows ?? []).filter((row) => {
        return effectiveSearchKeys.value.some((k) => {
          const val = getByPath(row, k)
          if (val == null) return false
          return String(val).toLowerCase().includes(q)
        })
      })
    })
    
    const sortedRows = computed(() => {
      const rows = [...filteredRows.value]
      if (!sortKey.value) return rows
    
      const key = sortKey.value
      const dir = sortDir.value
    
      rows.sort((a, b) => {
        const av = getByPath(a, key)
        const bv = getByPath(b, key)
    
        // nulls last
        if (av == null && bv == null) return 0
        if (av == null) return 1
        if (bv == null) return -1
    
        // numbers
        const an = Number(av)
        const bn = Number(bv)
        const bothNumbers = !Number.isNaN(an) && !Number.isNaN(bn)
    
        let res = 0
        if (bothNumbers) {
          res = an - bn
        } else {
          res = String(av).localeCompare(String(bv), 'es', { sensitivity: 'base' })
        }
    
        return dir === 'asc' ? res : -res
      })
    
      return rows
    })
    
    function headerSortIcon(key: string) {
      if (sortKey.value !== key) return '↕'
      return sortDir.value === 'asc' ? '↑' : '↓'
    }
    </script>
    
    <template>
      <div class="w-full">
        <!-- Search -->
        <div class="mb-3 flex items-center gap-2">
          <input
            v-model="search"
            :placeholder="searchPlaceholder ?? 'Buscar...'"
            class="w-full sm:w-80 rounded-xl border border-black/10 dark:border-white/10
                   bg-white dark:bg-neutral-900 text-slate-900 dark:text-white
                   px-3 py-2 text-sm outline-none
                   focus:ring-2 focus:ring-slate-300 dark:focus:ring-neutral-700 transition"
          />
          <button
            type="button"
            class="rounded-xl px-3 py-2 text-sm font-semibold border border-black/10 dark:border-white/10
                   bg-white dark:bg-neutral-900 text-slate-700 dark:text-neutral-200 hover:bg-slate-50 dark:hover:bg-neutral-800 transition"
            @click="search = ''"
          >
            Limpiar
          </button>
        </div>
    
        <!-- Table -->
        <div class="overflow-x-auto rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 dark:bg-neutral-800/60 text-slate-700 dark:text-neutral-200">
              <tr>
                <th
                  v-for="col in columns"
                  :key="String(col.key)"
                  class="text-left px-4 py-3 font-semibold select-none"
                  :class="col.headerClass"
                >
                  <button
                    v-if="col.sortable"
                    type="button"
                    class="inline-flex items-center gap-2 hover:opacity-80 transition"
                    @click="toggleSort(String(col.key))"
                  >
                    <span>{{ col.label }}</span>
                    <span class="text-xs">{{ headerSortIcon(String(col.key)) }}</span>
                  </button>
    
                  <span v-else>{{ col.label }}</span>
                </th>
              </tr>
            </thead>
    
            <tbody>
              <tr
                v-for="row in sortedRows"
                :key="row.id ?? JSON.stringify(row)"
                class="border-t border-black/5 dark:border-white/10 hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition"
              >
                <td
                  v-for="col in columns"
                  :key="String(col.key)"
                  class="px-4 py-3"
                  :class="col.cellClass"
                >
                  <!-- Slot por columna: cell-sku, cell-nombre, etc -->
                  <slot
                    :name="`cell-${String(col.key)}`"
                    :row="row"
                    :value="getByPath(row, String(col.key))"
                  >
                    {{ getByPath(row, String(col.key)) ?? '—' }}
                  </slot>
                </td>
              </tr>
    
              <tr v-if="sortedRows.length === 0">
                <td :colspan="columns.length" class="px-4 py-10 text-center text-slate-600 dark:text-neutral-300">
                  {{ emptyText ?? 'Sin resultados.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
    