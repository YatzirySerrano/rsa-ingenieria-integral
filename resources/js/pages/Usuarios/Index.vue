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
  filters,
  hasFilters,
  resetFilters,
  changePerPage,

  modalOpen,
  mode,
  busy,
  busyText,
  form,
  errors,

  personaLoading,
  personaResults,
  selectedPersona,

  openCreate,
  openEdit,
  closeModal,
  submit,
  toggleUser,
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

// evita duplicados por re-render / partial reload
const last = { success: '', error: '' }

watch(
  () => [flash.value?.success, flash.value?.error],
  ([s, e]) => {
    const ss = s ? String(s) : ''
    const ee = e ? String(e) : ''

    if (ss && ss !== last.success) {
      last.success = ss
      setTimeout(() => swalNotify(ss, 'success'), 0)
    }
    if (ee && ee !== last.error) {
      last.error = ee
      setTimeout(() => swalNotify(ee, 'error'), 0)
    }
  },
  { immediate: true }
)

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') closeModal()
}
window.addEventListener('keydown', onKeydown)
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

import type { BreadcrumbItem } from '@/types'

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Usuarios', href: '/admin/usuarios' },
]
</script>

<template>
  <Head title="Usuarios" />

  <AppLayout :breadcrumbs="breadcrumbs">
    <div class="mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">

      <div class="mt-0 rounded-3xl border border-slate-200/70 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950 sm:p-5">
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
              Estatus
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
                <span class="transition-transform duration-200 group-hover:scale-[1.03]">Registrar usuario</span>
            </button>
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

      <div class="mt-6">
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
            class="group border-b border-slate-100 px-6 py-5 last:border-b-0 transition-all duration-200
                   hover:bg-slate-50/70 dark:border-slate-900 dark:hover:bg-slate-900/30"
          >
            <div class="grid grid-cols-12 items-start gap-6">
              <div class="col-span-4 min-w-0">
                <div class="flex items-start gap-3">
                  <div class="mt-0.5 h-10 w-10 shrink-0 rounded-2xl bg-slate-100 ring-1 ring-slate-200 dark:bg-white/10 dark:ring-white/10" />
                  <div class="min-w-0">
                    <div class="truncate text-sm font-black text-slate-900 dark:text-slate-100">{{ u.name }}</div>
                    <div class="mt-0.5 truncate text-xs font-semibold text-slate-600 dark:text-slate-300">{{ u.email }}</div>
                  </div>
                </div>
              </div>

              <div class="col-span-4">
                <div class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <div v-if="u.persona?.nombre_completo" class="text-sm font-black text-slate-900 dark:text-slate-100">
                    {{ u.persona.nombre_completo }}
                  </div>
                  <div v-else class="italic">Sin persona</div>
                </div>
              </div>

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

              <div class="col-span-2">
                <div class="flex justify-end gap-2">
                  <button
                    type="button"
                    class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900
                           transition-all duration-200
                           hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-sm
                           dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                    @click="openEdit(u)"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    class="rounded-2xl border px-3 py-2 text-xs font-black transition-all duration-200"
                    :class="u.status === 'activo'
                      ? 'border-rose-200 bg-rose-50 text-rose-900 hover:-translate-y-[1px] hover:bg-rose-100 hover:shadow-sm dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:-translate-y-[1px] hover:bg-emerald-100 hover:shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/70'"
                    @click="toggleUser(u)"
                  >
                    {{ u.status === 'activo' ? 'Eliminar' : 'Activar' }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- MOBILE / TABLET: cards (sin tabla) -->
        <div class="lg:hidden">
        <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div class="border-b border-slate-200 px-4 py-4 dark:border-slate-800">
            <div class="text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                Usuarios
            </div>
            </div>

            <div v-if="rows.length === 0" class="px-4 py-14 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
            Sin resultados.
            </div>

            <div v-else class="divide-y divide-slate-100 dark:divide-slate-900">
            <div
                v-for="u in rows"
                :key="u.id"
                class="p-4 transition-all duration-200 hover:bg-slate-50/70 dark:hover:bg-slate-900/30"
            >
                <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                    <div class="truncate text-sm font-black text-slate-900 dark:text-slate-100">
                    {{ u.name }}
                    </div>
                    <div class="mt-0.5 truncate text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {{ u.email }}
                    </div>

                    <div class="mt-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <div v-if="u.persona?.nombre_completo" class="text-sm font-black text-slate-900 dark:text-slate-100">
                        {{ u.persona.nombre_completo }}
                    </div>
                    <div v-else class="italic">Sin persona</div>
                    </div>

                    <div class="mt-3 flex flex-wrap gap-2">
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

                <div class="flex shrink-0 flex-col gap-2">
                    <button
                    type="button"
                    class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900
                            transition-all duration-200 hover:bg-slate-50 hover:shadow-sm
                            dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                    @click="openEdit(u)"
                    >
                    Editar
                    </button>

                    <button
                    type="button"
                    class="rounded-2xl border px-3 py-2 text-xs font-black transition-all duration-200"
                    :class="u.status === 'activo'
                        ? 'border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100 hover:shadow-sm dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 hover:shadow-sm dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-200 dark:hover:bg-emerald-950/70'"
                    @click="toggleUser(u)"
                    >
                    {{ u.status === 'activo' ? 'Eliminar' : 'Activar' }}
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
      </div>

      <div class="mt-6">
        <PaginationLinks
          :meta="props.users.meta"
          :links="props.users.links?.map(l => ({ ...l, label: prettyLabel(l.label) }))"
          :per-page="typeof props.filters?.per_page === 'number' ? props.filters.per_page : (props.users.per_page ?? 10)"
          @change-per-page="changePerPage"
        />
      </div>

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
          <div class="w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-slate-950 dark:ring-white/10">
            <div class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800">
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
                  class="rounded-2xl p-2 text-slate-500 transition hover:text-slate-900 hover:bg-slate-100
                         dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-900"
                  @click="closeModal()"
                  aria-label="Cerrar"
                >
                  ✕
                </button>
              </div>
            </div>

            <div class="p-5 sm:p-6">
              <div class="grid grid-cols-1 gap-4">
                <div class="rounded-3xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-900/30 sm:p-5">
                  <h4 class="text-sm font-black text-slate-900 dark:text-slate-100">Persona</h4>

                  <div v-if="mode === 'create'" class="mt-3">
                    <SearchSelect
                      v-model="form.persona_id"
                      :options="personaResults"
                      search-key="nombre_completo"
                      display-key="nombre_completo"
                      value-key="id"
                      placeholder="Buscar persona…"
                      :disabled="busy"
                      :max-items="5000"
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

                  <div v-else class="mt-3">
                    <input
                      :value="selectedPersona?.nombre_completo || 'Sin persona'"
                      disabled
                      class="w-full rounded-2xl border-2 border-slate-200/70 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 opacity-90
                             dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                    />
                    <p class="mt-2 text-xs text-slate-600 dark:text-slate-300">
                      Esta persona queda fija para este usuario (no se puede cambiar).
                    </p>
                  </div>
                </div>

                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div class="sm:col-span-2">
                    <label class="text-xs font-black text-slate-700 dark:text-slate-200">Nombre</label>
                    <input
                      v-model="form.name"
                      type="text"
                      disabled
                      class="mt-1 w-full rounded-2xl border-2 border-slate-200/70 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-900 opacity-90
                             dark:border-white/10 dark:bg-white/5 dark:text-slate-100"
                      placeholder="Se forma desde la persona"
                    />
                    <p class="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      El nombre se arma automáticamente desde la persona (no editable).
                    </p>
                  </div>

                  <div class="sm:col-span-2">
                    <label class="text-xs font-black text-slate-700 dark:text-slate-200">Email</label>
                    <input
                      v-model="form.email"
                      type="email"
                      placeholder="correo@dominio.com"
                      class="mt-1 w-full rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none
                             transition-all duration-200 hover:border-slate-300
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
                             transition-all duration-200 hover:border-slate-300
                             focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15
                             dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/15 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
                    >
                      <option v-for="r in props.catalogs.roles" :key="r" :value="r">{{ r }}</option>
                    </select>
                    <p v-if="errors.rol" class="mt-1 text-xs font-bold text-rose-600">{{ errors.rol }}</p>
                  </div>

                  <div v-if="mode === 'edit'">
                    <label class="text-xs font-black text-slate-700 dark:text-slate-200">Reset password (opcional)</label>
                    <input
                      v-model="form.password"
                      type="password"
                      placeholder="Dejar vacío para no cambiar"
                      class="mt-1 w-full rounded-2xl border-2 border-slate-200/70 bg-white px-4 py-3 text-sm font-semibold text-slate-900 outline-none
                             transition-all duration-200 hover:border-slate-300
                             focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/15
                             dark:border-white/10 dark:bg-white/5 dark:text-slate-100 dark:hover:border-white/15 dark:focus:border-emerald-400/50 dark:focus:ring-emerald-400/10"
                    />
                    <p v-if="errors.password" class="mt-1 text-xs font-bold text-rose-600">{{ errors.password }}</p>
                  </div>

                  <div v-else class="sm:col-span-2">
                    <p class="text-xs text-slate-600 dark:text-slate-300">
                      Al crear el usuario, la contraseña se genera automáticamente y se envía por correo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div class="flex flex-col-reverse gap-2 border-t border-slate-200 p-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-end sm:p-6">
              <div
                v-if="busy && mode === 'create'"
                class="mr-auto flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                <span class="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-transparent dark:border-slate-700 dark:border-t-transparent" />
                <span>Espere un momento, {{ busyText }}</span>
              </div>

              <button
                type="button"
                class="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-900
                       transition-all duration-200 hover:-translate-y-[1px] hover:bg-slate-50 hover:shadow-sm
                       dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900 sm:w-auto"
                :disabled="busy"
                @click="closeModal()"
              >
                Cancelar
              </button>

              <button
                type="button"
                class="w-full rounded-2xl bg-slate-900 px-4 py-3 text-sm font-black text-white shadow-sm
                       transition-all duration-200 hover:-translate-y-[1px] hover:shadow-lg hover:shadow-slate-900/10
                       disabled:opacity-50 dark:bg-white dark:text-slate-900 dark:hover:shadow-white/10 sm:w-auto"
                :disabled="busy"
                @click="submit()"
              >
                {{ busy ? (mode === 'create' ? 'Enviando…' : 'Guardando…') : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </AppLayout>
</template>
