<!-- resources/js/Pages/Personas/Index.vue -->
<script setup lang="ts">
    import { Head } from '@inertiajs/vue3'
    import { computed, onMounted } from 'vue'
    import AppLayout from '@/layouts/AppLayout.vue'
    import PaginationLinks from '@/components/ui/PaginationLinks.vue'
    import { Button } from '@/components/ui/button'
    import { Input } from '@/components/ui/input'
    
    import { usePersonaCrud, PERSONA_ALL, type Persona } from '@/composables/crud/usePersonaCrud'
    
    type Paginated<T> = {
      data: T[]
      links?: any
      meta?: any
    }
    
    const props = defineProps<{
      items: Paginated<Persona>
      filters: { q?: string; status?: string | null }
      meta: { statuses: string[] }
    }>()
    
    const initialStatus =
      (props.filters?.status && String(props.filters.status).trim()) ? String(props.filters.status) : 'activo'
    
    const {
      ALL,
      filters,
      hasActiveFilters,
      resetFilters,
    
      // modal / form
      modalOpen,
      mode,
      form,
      errors,
      busy,
      openCreate,
      openEdit,
      closeModal,
      submit,
    
      // actions
      toggleStatus,
      displayName,
    } = usePersonaCrud({
      baseUrl: '/personas',
      initialFilters: {
        q: props.filters?.q ?? '',
        // default activo
        status: initialStatus ?? 'activo',
      },
    })
    
    const personas = computed(() => props.items?.data ?? [])
    const statuses = computed(() => props.meta?.statuses ?? ['activo', 'inactivo'])
    
    function badgeClasses(status: Persona['status']) {
      return status === 'activo'
        ? 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20 dark:bg-emerald-400/10 dark:text-emerald-200'
        : 'bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20 dark:bg-rose-400/10 dark:text-rose-200'
    }
    
    function rowTone(status: Persona['status']) {
      return status === 'activo'
        ? 'hover:bg-emerald-50/40 dark:hover:bg-emerald-500/5'
        : 'hover:bg-rose-50/40 dark:hover:bg-rose-500/5'
    }
    
    function fmt(v: any) {
      const s = String(v ?? '').trim()
      return s ? s : '—'
    }
    </script>
    
    <template>
      <Head title="Personas" />
    
      <AppLayout>
        <div class="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <!-- Background flourish -->
          <div class="relative">
            <div
              class="pointer-events-none absolute -top-10 right-0 h-32 w-32 rounded-full blur-3xl opacity-20
                     bg-emerald-400 dark:opacity-25"
            />
            <div
              class="pointer-events-none absolute -top-8 left-10 h-32 w-32 rounded-full blur-3xl opacity-15
                     bg-sky-400 dark:opacity-20"
            />
          </div>
    
          <!-- Header -->
          <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div class="min-w-0">
              <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Personas
              </h1>
            </div>
    
            <Button class="font-extrabold shadow-sm hover:shadow-md transition" @click="openCreate()">
              Nueva persona
            </Button>
          </div>
    
          <!-- Filters -->
          <div
            class="mt-5 rounded-2xl border border-slate-200 bg-white/80 backdrop-blur p-4
                   shadow-sm dark:border-slate-800 dark:bg-slate-950/50"
          >
            <div class="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div class="md:col-span-7">
                <label class="text-xs font-black text-slate-700 dark:text-slate-200">
                  Búsqueda
                </label>
                <Input
                  v-model="filters.q"
                  placeholder="Nombre, empresa, teléfono, RFC…"
                  class="h-11 mt-1"
                />
              </div>
    
              <div class="md:col-span-3">
                <label class="text-xs font-black text-slate-700 dark:text-slate-200">
                  Estatus
                </label>
                <select
                  v-model="filters.status"
                  class="h-11 mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-900
                         focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/40
                         dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option :value="ALL">Todos</option>
                  <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
    
              <div class="md:col-span-2 flex items-end">
                <Button
                  variant="secondary"
                  class="w-full font-extrabold"
                  :disabled="!hasActiveFilters"
                  @click="resetFilters"
                >
                  Recargar
                </Button>
              </div>
            </div>
          </div>
    
          <!-- Empty state -->
          <div
            v-if="!personas.length"
            class="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center
                   dark:border-slate-700 dark:bg-slate-950/40"
          >
            <div class="mx-auto max-w-md">
              <div class="mx-auto mb-3 h-12 w-12 rounded-2xl bg-slate-900/5 dark:bg-white/10 grid place-items-center">
                <span class="text-sm font-black text-slate-700 dark:text-slate-200">N/A</span>
              </div>
              <h3 class="text-lg font-black text-slate-900 dark:text-slate-100">Sin registros</h3>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Crea tu primera persona para empezar a operar.
              </p>
              <div class="mt-4">
                <Button class="font-extrabold" @click="openCreate()">Nueva persona</Button>
              </div>
            </div>
          </div>
    
          <!-- Mobile/Tablet cards (md: 2 cols) -->
          <div v-else class="mt-6 lg:hidden">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <article
                v-for="p in personas"
                :key="p.id"
                class="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white
                       shadow-sm transition hover:shadow-md hover:-translate-y-[1px]
                       dark:border-slate-800 dark:bg-slate-950"
              >
                <!-- Accent bar -->
                <div
                  class="absolute inset-x-0 top-0 h-1"
                  :class="p.status === 'activo' ? 'bg-emerald-500/70' : 'bg-rose-500/70'"
                />
    
                <div class="p-4 sm:p-5">
                  <!-- Top row -->
                  <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                      <h3 class="truncate text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                        {{ displayName(p) }}
                      </h3>
                      <p class="mt-0.5 truncate text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                        {{ p.empresa ? p.empresa : 'Sin empresa' }}
                      </p>
                    </div>
    
                    <div class="flex flex-col items-end gap-2">
                      <span
                        class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-black"
                        :class="badgeClasses(p.status)"
                      >
                        {{ p.status }}
                      </span>
                      <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        ID #{{ p.id }}
                      </span>
                    </div>
                  </div>
    
                  <!-- Details -->
                  <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                      <p class="text-[11px] font-black text-slate-500 dark:text-slate-400">Teléfono</p>
                      <p class="mt-0.5 font-bold text-slate-900 dark:text-slate-100">{{ fmt(p.telefono) }}</p>
                    </div>
    
                    <div class="rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                      <p class="text-[11px] font-black text-slate-500 dark:text-slate-400">RFC</p>
                      <p class="mt-0.5 font-bold text-slate-900 dark:text-slate-100">{{ fmt(p.rfc) }}</p>
                    </div>
    
                    <div class="col-span-2 rounded-xl bg-slate-50 p-3 dark:bg-slate-900/40">
                      <p class="text-[11px] font-black text-slate-500 dark:text-slate-400">Dirección</p>
                      <p class="mt-0.5 text-slate-900 dark:text-slate-100 line-clamp-2">
                        {{ fmt(p.direccion) }}
                      </p>
                    </div>
                  </div>
    
                  <!-- Actions -->
                  <div class="mt-4 grid grid-cols-2 gap-2">
                    <Button
                      variant="secondary"
                      class="w-full font-extrabold group-hover:shadow-sm transition"
                      @click="openEdit(p)"
                    >
                      Editar
                    </Button>
    
                    <Button
                      class="w-full font-extrabold transition"
                      :variant="p.status === 'activo' ? 'destructive' : 'default'"
                      @click="toggleStatus(p)"
                    >
                      {{ p.status === 'activo' ? 'Eliminar' : 'Activar' }}
                    </Button>
                  </div>
                </div>
    
                <!-- subtle hover glow -->
                <div
                  class="pointer-events-none absolute -bottom-16 -right-16 h-40 w-40 rounded-full blur-3xl opacity-0
                         transition group-hover:opacity-30"
                  :class="p.status === 'activo' ? 'bg-emerald-400' : 'bg-rose-400'"
                />
              </article>
            </div>
    
            <div class="mt-4">
              <PaginationLinks :links="props.items.links" :meta="props.items.meta" />
            </div>
          </div>
    
          <!-- Desktop table -->
          <div class="mt-6 hidden lg:block">
            <div class="overflow-hidden rounded-2xl border border-slate-200 bg-white/80 backdrop-blur
                        shadow-sm dark:border-slate-800 dark:bg-slate-950/50">
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                  <thead class="bg-slate-50/70 dark:bg-slate-900/40">
                    <tr>
                      <th class="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        Persona
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        Empresa
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        Teléfono
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        RFC
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        Dirección
                      </th>
                      <th class="px-4 py-3 text-left text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        Estatus
                      </th>
                      <th class="px-4 py-3 text-right text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
                        Acciones
                      </th>
                    </tr>
                  </thead>
    
                  <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr
                      v-for="p in personas"
                      :key="p.id"
                      class="transition"
                      :class="rowTone(p.status)"
                    >
                      <td class="px-4 py-3">
                        <div class="font-black text-slate-900 dark:text-slate-100">
                          {{ displayName(p) }}
                        </div>
                        <div class="text-xs text-slate-500 dark:text-slate-400">
                          ID: {{ p.id }}
                        </div>
                      </td>
    
                      <td class="px-4 py-3 text-sm text-slate-800 dark:text-slate-200">
                        {{ p.empresa ?? '—' }}
                      </td>
    
                      <td class="px-4 py-3 text-sm text-slate-800 dark:text-slate-200">
                        {{ p.telefono ?? '—' }}
                      </td>
    
                      <td class="px-4 py-3 text-sm text-slate-800 dark:text-slate-200">
                        {{ p.rfc ?? '—' }}
                      </td>
    
                      <td class="px-4 py-3 text-sm text-slate-800 dark:text-slate-200 max-w-[320px]">
                        <div class="truncate">
                          {{ p.direccion ?? '—' }}
                        </div>
                      </td>
    
                      <td class="px-4 py-3">
                        <span
                          class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-black"
                          :class="badgeClasses(p.status)"
                        >
                          {{ p.status }}
                        </span>
                      </td>
    
                      <td class="px-4 py-3">
                        <div class="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            class="font-extrabold hover:shadow-sm transition"
                            @click="openEdit(p)"
                          >
                            Editar
                          </Button>
    
                          <Button
                            size="sm"
                            class="font-extrabold hover:shadow-sm transition"
                            :variant="p.status === 'activo' ? 'destructive' : 'default'"
                            @click="toggleStatus(p)"
                          >
                            {{ p.status === 'activo' ? 'Eliminar' : 'Activar' }}
                          </Button>
                        </div>
                      </td>
                    </tr>
    
                    <tr v-if="!personas.length">
                      <td colspan="7" class="px-4 py-10 text-center text-slate-600 dark:text-slate-300">
                        No hay personas para mostrar.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
    
              <div class="p-4 border-t border-slate-200 dark:border-slate-800">
                <PaginationLinks :links="props.items.links" :meta="props.items.meta" />
              </div>
            </div>
          </div>
    
          <!-- MODAL -->
          <transition name="fade">
            <div
              v-if="modalOpen"
              class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm px-4"
              @click.self="closeModal()"
            >
              <div
                class="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-slate-950 dark:ring-white/10"
              >
                <!-- Header modal -->
                <div
                class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800
                bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-950"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                        {{ mode === 'edit' ? 'Editar persona' : 'Nueva persona' }}
                      </h3>
    
                      <p
                        v-if="errors.form"
                        class="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700
                               dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
                      >
                        {{ errors.form }}
                      </p>
                    </div>
    
                    <button
                      type="button"
                      class="rounded-xl p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition
                             dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900"
                      @click="closeModal()"
                      aria-label="Cerrar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
    
                <!-- Body -->
                <div class="p-5 sm:p-6">
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                    <div class="sm:col-span-2">
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Nombre(s)</label>
                      <Input v-model="form.nombre" class="mt-1 h-11" placeholder="Ej. Juan Carlos" />
                      <p v-if="errors.nombre" class="text-xs text-rose-600 mt-1">{{ errors.nombre }}</p>
                    </div>
    
                    <div>
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Apellido paterno</label>
                      <Input v-model="form.apellido_paterno" class="mt-1 h-11" placeholder="Ej. Pérez" />
                      <p v-if="errors.apellido_paterno" class="text-xs text-rose-600 mt-1">{{ errors.apellido_paterno }}</p>
                    </div>
    
                    <div>
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Apellido materno</label>
                      <Input v-model="form.apellido_materno" class="mt-1 h-11" placeholder="Ej. López" />
                      <p v-if="errors.apellido_materno" class="text-xs text-rose-600 mt-1">{{ errors.apellido_materno }}</p>
                    </div>
    
                    <div>
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Teléfono</label>
                      <Input v-model="form.telefono" class="mt-1 h-11" placeholder="10 dígitos" />
                      <p v-if="errors.telefono" class="text-xs text-rose-600 mt-1">{{ errors.telefono }}</p>
                    </div>
    
                    <div>
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">RFC</label>
                      <Input v-model="form.rfc" class="mt-1 h-11" placeholder="Ej. XAXX010101000" />
                      <p v-if="errors.rfc" class="text-xs text-rose-600 mt-1">{{ errors.rfc }}</p>
                    </div>
    
                    <div class="sm:col-span-2">
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Empresa</label>
                      <Input v-model="form.empresa" class="mt-1 h-11" placeholder="Opcional" />
                      <p v-if="errors.empresa" class="text-xs text-rose-600 mt-1">{{ errors.empresa }}</p>
                    </div>
    
                    <div class="sm:col-span-2">
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Dirección</label>
                      <textarea
                        v-model="form.direccion"
                        rows="3"
                        placeholder="Opcional"
                        class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-900
                               focus:outline-none focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/40
                               dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                      />
                      <p v-if="errors.direccion" class="text-xs text-rose-600 mt-1">{{ errors.direccion }}</p>
                    </div>
                  </div>
                </div>
    
                <!-- Footer -->
                <div
                  class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 p-5 sm:p-6
                         border-t border-slate-200 dark:border-slate-800"
                >
                  <Button variant="secondary" class="w-full sm:w-auto" :disabled="busy" @click="closeModal()">
                    Cancelar
                  </Button>
                  <Button class="w-full sm:w-auto" :disabled="busy" @click="submit()">
                    {{ busy ? 'Guardando…' : 'Guardar' }}
                  </Button>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </AppLayout>
    </template>
    
    <style scoped>
    .fade-enter-active,
    .fade-leave-active {
      transition: opacity 0.18s ease;
    }
    .fade-enter-from,
    .fade-leave-to {
      opacity: 0;
    }
    </style>
    