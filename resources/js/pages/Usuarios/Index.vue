<!-- resources/js/Pages/Usuarios/Index.vue -->
<script setup lang="ts">
import { Head, usePage } from '@inertiajs/vue3'
import { computed, onBeforeUnmount, watch } from 'vue'
import AppLayout from '@/layouts/AppLayout.vue'

import PaginationLinks from '@/components/ui/PaginationLinks.vue'
import SearchSelect from '@/components/util/SearchSelect.vue'

import { useUserCrud, type UserRow } from '@/composables/crud/useUserCrud'
import { swalNotify } from '@/lib/swal'

type LinkItem = { url: string | null; label: string; active: boolean }

type Paginated<T> = {
  data: T[]
  links: LinkItem[]
  meta?: any
  current_page?: number
  last_page?: number
  total: number
  per_page?: number
}

const props = defineProps<{
  users: Paginated<UserRow>
  filters: { q: string; rol: string; status: string; per_page?: number | null }
  catalogs: { roles: string[]; statuses: string[] }
}>()

const page = usePage()
const rows = computed(() => props.users?.data ?? [])
const flash = computed(() => (page.props.flash ?? {}) as any)

const {
  // filters
  filters,
  hasFilters,
  resetFilters,
  changePerPage,

  // modal / form
  modalOpen,
  mode,
  busy,
  form,
  errors,

  // personas (SearchSelect)
  personaLoading,
  personaResults,
  selectedPersona,
  clearPersonaSelection,

  // actions
  openCreate,
  openEdit,
  closeModal,
  submit,
  deleteUser,
} = useUserCrud({
  baseUrl: '/admin/usuarios',
  lookupUrl: '/admin/usuarios/personas-lookup',
  initialFilters: props.filters,
  initialPerPage: typeof props.filters?.per_page === 'number' ? props.filters.per_page : null,
})

function prettyLabel(raw: string) {
  const t = (raw || '').replace(/<[^>]*>/g, '').trim()
  const lower = t.toLowerCase()
  if (lower.includes('previous') || lower.includes('pagination.previous') || t === '«') return 'Atrás'
  if (lower.includes('next') || lower.includes('pagination.next') || t === '»') return 'Siguiente'
  return t
}

/**
 * ✅ Flash -> toast (una vez por cambio)
 * Evita que se dispare múltiples veces por reactividad.
 */
watch(
  () => [flash.value?.success, flash.value?.error],
  ([s, e]) => {
    if (s) void swalNotify(String(s), 'success')
    if (e) void swalNotify(String(e), 'error')
  },
  { immediate: true }
)

// Cerrar modal con Escape
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
}
window.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Head title="Usuarios" />

  <AppLayout>
    <div class="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div
        class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
      >
        <div class="min-w-0">
          <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Usuarios
          </h1>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            class="group inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-sm
                   transition-all duration-200
                   hover:-translate-y-[1px] hover:shadow-lg hover:shadow-slate-900/10
                   active:translate-y-0 active:shadow-sm
                   dark:bg-white dark:text-slate-900 dark:hover:shadow-white/10 sm:w-auto"
            @click="openCreate()"
          >
            <span class="transition-transform duration-200 group-hover:scale-[1.03]">Crear usuario</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div
        class="mt-6 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm
               dark:border-white/10 dark:bg-slate-950 sm:p-5"
      >
        <div class="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:items-end">
          <div class="lg:col-span-6">
            <label class="mb-1 block text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Buscar
            </label>
            <div
              class="group flex items-center gap-2 rounded-2xl border-2 border-slate-200/70 bg-white/95 px-4 py-3
                     shadow-sm shadow-transparent transition-all duration-200
                     hover:border-slate-300 hover:shadow-slate-900/5
                     focus-within:border-emerald-500/60 focus-within:ring-4 focus-within:ring-emerald-500/15
                     dark:border-white/10 dark:bg-white/5 dark:hover:border-white/15 dark:focus-within:border-emerald-400/50 dark:focus-within:ring-emerald-400/10"
            >
              <input
                v-model="filters.q"
                type="text"
                placeholder="Nombre o email…"
                class="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400
                       dark:text-slate-100 dark:placeholder:text-slate-500"
              />
              <span class="text-xs font-black text-slate-400 dark:text-slate-500">
                ⌘K
              </span>
            </div>
          </div>

          <div class="lg:col-span-3">
            <label class="mb-1 block text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Rol
            </label>
            <select
              v-model="filters.rol"
              class="w-full rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none
                     transition-all duration-200
                     hover:border-slate-300
                     focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15
                     dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/15 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
            >
              <option value="__all__">Todos</option>
              <option v-for="r in props.catalogs.roles" :key="r" :value="r">{{ r }}</option>
            </select>
          </div>

          <div class="lg:col-span-3">
            <label class="mb-1 block text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
              Status
            </label>
            <select
              v-model="filters.status"
              class="w-full rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none
                     transition-all duration-200
                     hover:border-slate-300
                     focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15
                     dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/15 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
            >
              <option value="__all__">Todos</option>
              <option v-for="s in props.catalogs.statuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>

        <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <span class="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 font-black text-slate-900 dark:bg-white/10 dark:text-slate-100">
              {{ props.users.total }}
            </span>
            <span>Total de usuarios</span>
          </div>

          <button
            v-if="hasFilters"
            type="button"
            class="inline-flex w-full items-center justify-center rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-2.5 text-xs font-black text-slate-900
                   transition-all duration-200
                   hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-sm
                   active:translate-y-0
                   dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:bg-white/10 sm:w-auto"
            @click="resetFilters()"
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- List (Desktop table + Mobile cards) -->
      <div class="mt-6">
        <!-- Desktop: table -->
        <div class="hidden overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:block">
          <div class="border-b border-slate-200 px-6 py-4 dark:border-slate-800">
            <div class="grid grid-cols-12 text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
              <div class="col-span-4">Usuario</div>
              <div class="col-span-4">Persona</div>
              <div class="col-span-2">Rol / Status</div>
              <div class="col-span-2 text-right">Acciones</div>
            </div>
          </div>

          <div v-if="rows.length === 0" class="px-6 py-14 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
            Sin resultados.
          </div>

          <div
            v-for="u in rows"
            :key="u.id"
            class="group border-b border-slate-100 px-6 py-5 last:border-b-0
                   transition-all duration-200
                   hover:bg-slate-50/70 dark:border-slate-900 dark:hover:bg-slate-900/30"
          >
            <div class="grid grid-cols-12 items-start gap-6">
              <!-- Usuario -->
              <div class="col-span-4 min-w-0">
                <div class="flex items-start gap-3">
                  <div
                    class="mt-0.5 h-10 w-10 shrink-0 rounded-2xl bg-slate-100 ring-1 ring-slate-200
                           transition-all duration-200
                           group-hover:shadow-sm
                           dark:bg-white/10 dark:ring-white/10"
                  />
                  <div class="min-w-0">
                    <div class="truncate text-sm font-black text-slate-900 dark:text-slate-100">
                      {{ u.name }}
                    </div>
                    <div class="mt-0.5 truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
                      {{ u.email }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- Persona -->
              <div class="col-span-4">
                <div class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <div v-if="u.persona?.nombre_completo" class="text-sm font-black text-slate-900 dark:text-slate-100">
                    {{ u.persona.nombre_completo }}
                  </div>
                  <div class="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                    <span v-if="u.persona?.telefono" class="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 font-black text-slate-900 dark:bg-white/10 dark:text-slate-100">
                      Tel: {{ u.persona.telefono }}
                    </span>
                    <span v-if="u.persona?.empresa" class="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 font-black text-slate-900 dark:bg-white/10 dark:text-slate-100">
                      {{ u.persona.empresa }}
                    </span>
                  </div>
                  <div v-if="!u.persona" class="italic">Sin persona</div>
                </div>
              </div>

              <!-- Rol / Status -->
              <div class="col-span-2">
                <div class="flex flex-col gap-2">
                  <span class="inline-flex w-fit rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-900 dark:bg-white/10 dark:text-slate-100">
                    {{ u.rol }}
                  </span>
                  <span
                    class="inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-black"
                    :class="u.status === 'activo'
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                      : 'bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200'"
                  >
                    {{ u.status }}
                  </span>
                </div>
              </div>

              <!-- Acciones -->
              <div class="col-span-2">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900
                           transition-all duration-200
                           hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-sm
                           active:translate-y-0
                           dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                    @click="openEdit(u)"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    :disabled="u.status !== 'activo'"
                    class="rounded-2xl border px-3 py-2 text-xs font-black
                           transition-all duration-200
                           disabled:cursor-not-allowed disabled:opacity-50"
                    :class="u.status === 'activo'
                      ? 'border-rose-200 bg-rose-50 text-rose-900 hover:-translate-y-[1px] hover:bg-rose-100 hover:shadow-sm dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70'
                      : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300'"
                    @click="deleteUser(u)"
                  >
                    {{ u.status === 'activo' ? 'Desactivar' : 'Inactivo' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile/Tablet: cards -->
        <div class="grid grid-cols-1 gap-3 lg:hidden">
          <div
            v-for="u in rows"
            :key="u.id"
            class="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-4 shadow-sm
                   transition-all duration-200
                   hover:-translate-y-[1px] hover:shadow-md
                   dark:border-slate-800 dark:bg-slate-950 dark:hover:shadow-white/5 sm:p-5"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <div class="truncate text-base font-black text-slate-900 dark:text-slate-100">
                  {{ u.name }}
                </div>
                <div class="mt-0.5 truncate text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {{ u.email }}
                </div>
              </div>

              <span
                class="inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-black"
                :class="u.status === 'activo'
                  ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                  : 'bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200'"
              >
                {{ u.status }}
              </span>
            </div>

            <div class="mt-3 flex flex-wrap gap-2">
              <span class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-900 dark:bg-white/10 dark:text-slate-100">
                Rol: {{ u.rol }}
              </span>
              <span v-if="u.persona?.nombre_completo" class="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-900 dark:bg-white/10 dark:text-slate-100">
                {{ u.persona.nombre_completo }}
              </span>
            </div>

            <div class="mt-3 text-sm text-slate-600 dark:text-slate-300">
              <div v-if="u.persona?.telefono"><span class="font-black">Tel:</span> {{ u.persona.telefono }}</div>
              <div v-if="u.persona?.empresa"><span class="font-black">Empresa:</span> {{ u.persona.empresa }}</div>
              <div v-if="!u.persona" class="italic">Sin persona</div>
            </div>

            <div class="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-900
                       transition-all duration-200
                       hover:bg-slate-50
                       dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 sm:w-auto"
                @click="openEdit(u)"
              >
                Editar
              </button>

              <button
                type="button"
                :disabled="u.status !== 'activo'"
                class="w-full rounded-2xl border px-4 py-2.5 text-sm font-black
                       transition-all duration-200
                       disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                :class="u.status === 'activo'
                  ? 'border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70'
                  : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900/30 dark:text-slate-300'"
                @click="deleteUser(u)"
              >
                {{ u.status === 'activo' ? 'Desactivar' : 'Inactivo' }}
              </button>
            </div>
          </div>

          <div v-if="rows.length === 0" class="rounded-3xl border border-slate-200 bg-white px-4 py-12 text-center text-sm font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
            Sin resultados.
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="mt-6">
        <PaginationLinks
          :meta="props.users.meta"
          :links="props.users.links?.map(l => ({ ...l, label: prettyLabel(l.label) }))"
          :per-page="typeof props.filters?.per_page === 'number' ? props.filters.per_page : (props.users.per_page ?? 10)"
          @change-per-page="changePerPage"
        />
      </div>

      <!-- MODAL -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0 translate-y-2"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-2"
      >
        <div
          v-if="modalOpen"
          class="fixed inset-0 z-50 grid place-items-center bg-black/55 backdrop-blur-sm p-4 sm:p-6"
          @click.self="closeModal()"
        >
          <div
            class="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5
                   dark:bg-slate-950 dark:ring-white/10"
          >
            <!-- Header -->
            <div
              class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800
                     bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-950"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                    {{ mode === 'edit' ? 'Editar usuario' : 'Crear usuario' }}
                  </h3>
                  <p
                    v-if="errors.form"
                    class="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700
                           dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200"
                  >
                    {{ errors.form }}
                  </p>
                </div>

                <button
                  type="button"
                  class="rounded-2xl p-2 text-slate-500 transition
                         hover:text-slate-900 hover:bg-slate-100
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
              <div class="grid grid-cols-1 gap-4 lg:grid-cols-12">
                <!-- Persona -->
                <div class="lg:col-span-12">
                  <div class="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/30 sm:p-5">
                    <div class="flex items-start justify-between gap-3">
                      <div>
                        <h4 class="text-sm font-black text-slate-900 dark:text-slate-100">Persona</h4>
                        <p class="text-xs text-slate-600 dark:text-slate-300">
                          Se muestran personas sin usuario. Escribe para filtrar.
                        </p>
                      </div>

                      <button
                        v-if="selectedPersona"
                        type="button"
                        class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 transition-all duration-200
                               hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-sm
                               dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                        @click="clearPersonaSelection()"
                      >
                        Cambiar
                      </button>
                    </div>

                    <div class="mt-3">
                      <SearchSelect
                        v-model="form.persona_id"
                        :options="personaResults"
                        search-key="nombre_completo"
                        display-key="nombre_completo"
                        value-key="id"
                        placeholder="Buscar persona…"
                        :disabled="busy"
                        :max-items="200"
                      />

                      <div class="mt-2 flex flex-col gap-1">
                        <p v-if="personaLoading" class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Cargando personas…
                        </p>
                        <p v-if="errors.persona_id" class="text-xs font-bold text-rose-600">
                          {{ errors.persona_id }}
                        </p>
                      </div>
                    </div>

                    <!-- Selected persona preview -->
                    <div
                      v-if="selectedPersona"
                      class="mt-4 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-4
                             dark:border-emerald-900/40 dark:bg-emerald-950/30"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div class="truncate text-sm font-black text-emerald-900 dark:text-emerald-100">
                            {{ selectedPersona.nombre_completo }}
                          </div>
                          <div class="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-emerald-900/80 dark:text-emerald-100/80">
                            <span v-if="selectedPersona.telefono" class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 font-black text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
                              Tel: {{ selectedPersona.telefono }}
                            </span>
                            <span v-if="selectedPersona.empresa" class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 font-black text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
                              {{ selectedPersona.empresa }}
                            </span>
                            <span v-if="selectedPersona.rfc" class="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 font-black text-emerald-900 dark:bg-emerald-900/30 dark:text-emerald-100">
                              RFC: {{ selectedPersona.rfc }}
                            </span>
                          </div>
                        </div>

                        <span class="inline-flex rounded-full px-2.5 py-1 text-[11px] font-black bg-emerald-600 text-white dark:bg-emerald-500">
                          Confirmada
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Campos usuario -->
                <div class="lg:col-span-12">
                  <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div class="sm:col-span-2">
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Nombre</label>
                      <input
                        v-model="form.name"
                        type="text"
                        placeholder="Nombre del usuario"
                        class="mt-1 w-full rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none
                               transition-all duration-200
                               hover:border-slate-300
                               focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15
                               dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/15 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
                      />
                      <p v-if="errors.name" class="mt-1 text-xs font-bold text-rose-600">{{ errors.name }}</p>
                    </div>

                    <div class="sm:col-span-2">
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Email</label>
                      <input
                        v-model="form.email"
                        type="email"
                        placeholder="correo@dominio.com"
                        class="mt-1 w-full rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none
                               transition-all duration-200
                               hover:border-slate-300
                               focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15
                               dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/15 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
                      />
                      <p v-if="errors.email" class="mt-1 text-xs font-bold text-rose-600">{{ errors.email }}</p>
                    </div>

                    <div>
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Rol</label>
                      <select
                        v-model="form.rol"
                        class="mt-1 w-full rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none
                               transition-all duration-200
                               hover:border-slate-300
                               focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15
                               dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/15 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
                      >
                        <option v-for="r in props.catalogs.roles" :key="r" :value="r">{{ r }}</option>
                      </select>
                      <p v-if="errors.rol" class="mt-1 text-xs font-bold text-rose-600">{{ errors.rol }}</p>
                    </div>

                    <div>
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Status</label>
                      <select
                        v-model="form.status"
                        class="mt-1 w-full rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none
                               transition-all duration-200
                               hover:border-slate-300
                               focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15
                               dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/15 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
                      >
                        <option v-for="s in props.catalogs.statuses" :key="s" :value="s">{{ s }}</option>
                      </select>
                      <p v-if="errors.status" class="mt-1 text-xs font-bold text-rose-600">{{ errors.status }}</p>
                    </div>

                    <div class="sm:col-span-2">
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">
                        Password
                        <span class="font-semibold text-slate-500 dark:text-slate-400">
                          {{ mode === 'edit' ? '(opcional)' : '(obligatorio)' }}
                        </span>
                      </label>
                      <input
                        v-model="form.password"
                        type="password"
                        :placeholder="mode === 'edit' ? 'Dejar vacío para no cambiar' : 'Mínimo 8 caracteres'"
                        class="mt-1 w-full rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none
                               transition-all duration-200
                               hover:border-slate-300
                               focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15
                               dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/15 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
                      />
                      <p v-if="errors.password" class="mt-1 text-xs font-bold text-rose-600">{{ errors.password }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex flex-col-reverse gap-2 border-t border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-end sm:p-6">
              <button
                type="button"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900
                       transition-all duration-200
                       hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-sm
                       active:translate-y-0
                       disabled:opacity-50
                       dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 sm:w-auto"
                :disabled="busy"
                @click="closeModal()"
              >
                Cancelar
              </button>

              <button
                type="button"
                class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-sm
                       transition-all duration-200
                       hover:-translate-y-[1px] hover:shadow-lg hover:shadow-slate-900/10
                       active:translate-y-0
                       disabled:opacity-50
                       dark:bg-white dark:text-slate-900 dark:hover:shadow-white/10 sm:w-auto"
                :disabled="busy"
                @click="submit()"
              >
                {{ busy ? 'Guardando…' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </AppLayout>
</template>