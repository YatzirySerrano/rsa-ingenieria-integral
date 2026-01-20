<!-- resources/js/Pages/Usuarios/Index.vue -->
<script setup lang="ts">
    import { Head, usePage, router } from '@inertiajs/vue3'
    import { computed, onBeforeUnmount } from 'vue'
    import AppLayout from '@/layouts/AppLayout.vue'
    import { useUserCrud, type UserRow } from '@/composables/crud/useUserCrud'
    
    type Paginated<T> = {
      data: T[]
      links: Array<{ url: string | null; label: string; active: boolean }>
      current_page: number
      last_page: number
      total: number
    }
    
    const props = defineProps<{
      users: Paginated<UserRow>
      filters: { q: string; rol: string; status: string }
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
    
      // modal / form
      modalOpen,
      mode,
      busy,
      form,
      errors,
    
      // persona lookup
      personaQuery,
      personaLoading,
      personaResults,
      selectedPersona,
      pickerOpen,
      openPicker,
      closePickerSoon,
      selectPersona,
      clearPersonaSelection,
    
      // actions
      openCreate,
      openEdit,
      closeModal,
      submit,
      deleteUser,
    } = useUserCrud({
      baseUrl: '/admin/usuarios',
      lookupUrl: '/admin/users/personas-lookup',
      initialFilters: props.filters,
    })
    
    function go(url: string | null) {
      if (!url) return
      router.visit(url, { preserveScroll: true, preserveState: true })
    }
    
    function prettyLabel(raw: string) {
      const t = (raw || '').replace(/<[^>]*>/g, '').trim()
      const lower = t.toLowerCase()
      if (lower.includes('previous') || lower.includes('pagination.previous') || t === '«') return 'Atrás'
      if (lower.includes('next') || lower.includes('pagination.next') || t === '»') return 'Siguiente'
      return t
    }
    
    // Cerrar picker con Escape, sin tocar el TS
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
          <div class="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 class="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
                Usuarios
              </h1>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Primero selecciona una persona. Luego creas/actualizas su cuenta.
              </p>
            </div>
    
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white shadow-sm transition
                       hover:shadow-md hover:-translate-y-[1px] active:translate-y-0
                       dark:bg-white dark:text-slate-900"
                @click="openCreate()"
              >
                Crear usuario
              </button>
            </div>
          </div>
    
          <!-- Flash -->
          <div
            v-if="flash.success"
            class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900
                   dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100"
          >
            {{ flash.success }}
          </div>
          <div
            v-if="flash.error"
            class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900
                   dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100"
          >
            {{ flash.error }}
          </div>
    
          <!-- Filters -->
          <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
              <div class="md:col-span-6">
                <label class="mb-1 block text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Buscar
                </label>
                <input
                  v-model="filters.q"
                  type="text"
                  placeholder="Nombre o email..."
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition
                         focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5
                         dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-white/10"
                />
              </div>
    
              <div class="md:col-span-3">
                <label class="mb-1 block text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Rol
                </label>
                <select
                  v-model="filters.rol"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition
                         focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5
                         dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-white/10"
                >
                  <option value="__all__">Todos</option>
                  <option v-for="r in props.catalogs.roles" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
    
              <div class="md:col-span-3">
                <label class="mb-1 block text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Status
                </label>
                <select
                  v-model="filters.status"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition
                         focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5
                         dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-white/10"
                >
                  <option value="__all__">Todos</option>
                  <option v-for="s in props.catalogs.statuses" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>
    
            <div class="mt-3 flex items-center justify-between">
              <div class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Total: {{ props.users.total }}
              </div>
    
              <button
                v-if="hasFilters"
                type="button"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-50
                       dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                @click="resetFilters()"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
    
          <!-- List -->
          <div class="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
              <div class="grid grid-cols-12 text-xs font-black uppercase tracking-wide text-slate-600 dark:text-slate-300">
                <div class="col-span-5">Usuario</div>
                <div class="col-span-3 hidden md:block">Persona</div>
                <div class="col-span-2 hidden md:block">Rol / Status</div>
                <div class="col-span-2 text-right">Acciones</div>
              </div>
            </div>
    
            <div v-if="rows.length === 0" class="px-4 py-10 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
              Sin resultados.
            </div>
    
            <div
              v-for="u in rows"
              :key="u.id"
              class="border-b border-slate-100 px-4 py-4 last:border-b-0 dark:border-slate-900 hover:bg-slate-50/60 dark:hover:bg-slate-900/30 transition"
            >
              <div class="grid grid-cols-12 items-start gap-3">
                <div class="col-span-8 md:col-span-5">
                  <div class="flex items-center justify-between gap-3">
                    <div>
                      <div class="text-sm font-black text-slate-900 dark:text-slate-100">
                        {{ u.name }}
                      </div>
                      <div class="mt-0.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {{ u.email }}
                      </div>
                    </div>
    
                    <div class="md:hidden">
                      <span
                        class="inline-flex rounded-full px-2 py-1 text-xs font-black"
                        :class="u.status === 'activo'
                          ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'"
                      >
                        {{ u.status }}
                      </span>
                    </div>
                  </div>
    
                  <div class="mt-2 flex flex-wrap gap-2 md:hidden">
                    <span class="rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                      Rol: {{ u.rol }}
                    </span>
                  </div>
                </div>
    
                <div class="col-span-12 md:col-span-3">
                  <div class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    <div v-if="u.persona?.nombre_completo" class="font-black text-slate-900 dark:text-slate-100">
                      {{ u.persona.nombre_completo }}
                    </div>
                    <div v-if="u.persona?.telefono">{{ u.persona.telefono }}</div>
                    <div v-if="u.persona?.empresa">{{ u.persona.empresa }}</div>
                    <div v-if="!u.persona" class="italic">Sin persona</div>
                  </div>
                </div>
    
                <div class="col-span-3 hidden md:block">
                  <div class="flex flex-col gap-2">
                    <span class="inline-flex w-fit rounded-full bg-slate-100 px-2 py-1 text-xs font-black text-slate-900 dark:bg-slate-900 dark:text-slate-100">
                      {{ u.rol }}
                    </span>
                    <span
                      class="inline-flex w-fit rounded-full px-2 py-1 text-xs font-black"
                      :class="u.status === 'activo'
                        ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200'"
                    >
                      {{ u.status }}
                    </span>
                  </div>
                </div>
    
                <div class="col-span-4 md:col-span-1 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      type="button"
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-50
                             dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                      @click="openEdit(u)"
                    >
                      Editar
                    </button>
    
                    <button
                      type="button"
                      :disabled="u.status !== 'activo'"
                      class="rounded-xl border px-3 py-2 text-xs font-black transition disabled:opacity-50 disabled:cursor-not-allowed"
                      :class="u.status === 'activo'
                        ? 'border-rose-200 bg-rose-50 text-rose-900 hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70'
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
    
          <!-- Pagination -->
          <div v-if="props.users.links?.length" class="mt-6 flex flex-wrap items-center gap-2">
            <button
              v-for="(l, i) in props.users.links"
              :key="i"
              type="button"
              class="rounded-xl px-3 py-2 text-xs font-black transition"
              :disabled="!l.url"
              :class="[
                l.active
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900',
                !l.url ? 'opacity-40 cursor-not-allowed hover:bg-white dark:hover:bg-slate-950' : ''
              ]"
              @click="go(l.url)"
            >
              {{ prettyLabel(l.label) }}
            </button>
          </div>
    
          <!-- MODAL -->
          <transition name="fade">
            <div
              v-if="modalOpen"
              class="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm px-4"
              @click.self="closeModal()"
            >
              <div class="w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 dark:bg-slate-950 dark:ring-white/10">
                <!-- Header -->
                <div class="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-slate-950">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <h3 class="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">
                        {{ mode === 'edit' ? 'Editar usuario' : 'Crear usuario' }}
                      </h3>
                      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        Selecciona la persona primero (abre la lista o escribe 2+ letras). Luego confirma datos del usuario.
                      </p>
    
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
                <div class="p-5 sm:p-6 space-y-5">
                  <!-- Persona picker -->
                  <div class="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-800 dark:bg-slate-900/30">
                    <div class="flex items-center justify-between gap-3">
                      <div>
                        <h4 class="text-sm font-black text-slate-900 dark:text-slate-100">Persona</h4>
                        <p class="text-xs text-slate-600 dark:text-slate-300">
                          Vacío = lista (limitada). 2+ letras = filtra.
                        </p>
                      </div>
    
                      <button
                        v-if="selectedPersona"
                        type="button"
                        class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-50
                               dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                        @click="clearPersonaSelection()"
                      >
                        Cambiar persona
                      </button>
                    </div>
    
                    <div class="mt-3 relative">
                      <input
                        v-model="personaQuery"
                        type="text"
                        placeholder="Ej. Jesus Arizmendi..."
                        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition
                               focus:border-emerald-400 focus:ring-4 focus:ring-emerald-500/10
                               dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500/60 dark:focus:ring-emerald-400/10"
                        @focus="openPicker()"
                        @blur="closePickerSoon()"
                      />
    
                      <p v-if="errors.persona_id" class="mt-1 text-xs font-bold text-rose-600">
                        {{ errors.persona_id }}
                      </p>
    
                      <!-- dropdown results (SOLO cuando pickerOpen y no hay seleccionada) -->
                      <div
                        v-if="pickerOpen && !selectedPersona"
                        class="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg
                               dark:border-slate-800 dark:bg-slate-950"
                      >
                        <div v-if="personaLoading" class="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          Buscando...
                        </div>
    
                        <div v-else-if="personaResults.length === 0" class="px-4 py-3 text-sm font-semibold text-slate-600 dark:text-slate-300">
                          Sin coincidencias.
                        </div>
    
                        <div v-else class="divide-y divide-slate-100 dark:divide-slate-900">
                          <div
                            v-for="p in personaResults"
                            :key="p.id"
                            class="flex items-start justify-between gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition"
                          >
                            <div class="min-w-0">
                              <div class="text-sm font-black text-slate-900 dark:text-slate-100 truncate">
                                {{ p.nombre_completo }}
                              </div>
                              <div class="mt-0.5 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap gap-x-3 gap-y-1">
                                <span v-if="p.telefono">Tel: {{ p.telefono }}</span>
                                <span v-if="p.empresa">Empresa: {{ p.empresa }}</span>
                                <span v-if="p.rfc">RFC: {{ p.rfc }}</span>
                              </div>
                            </div>
    
                            <!-- mousedown para que NO se cierre por blur antes del click -->
                            <button
                              type="button"
                              class="shrink-0 inline-flex items-center justify-center rounded-xl bg-emerald-600 px-3 py-2 text-xs font-black text-white
                                     shadow-sm transition hover:bg-emerald-700 active:scale-[0.99]
                                     dark:bg-emerald-500 dark:hover:bg-emerald-400"
                              @mousedown.prevent
                              @click="selectPersona(p)"
                              title="Seleccionar persona"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
    
                    <!-- Selected persona preview -->
                    <div
                      v-if="selectedPersona"
                      class="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4
                             dark:border-emerald-900/40 dark:bg-emerald-950/30"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div class="text-sm font-black text-emerald-900 dark:text-emerald-100 truncate">
                            {{ selectedPersona.nombre_completo }}
                          </div>
                          <div class="mt-1 text-xs text-emerald-900/80 dark:text-emerald-100/80 flex flex-wrap gap-x-3 gap-y-1">
                            <span v-if="selectedPersona.telefono">Tel: {{ selectedPersona.telefono }}</span>
                            <span v-if="selectedPersona.empresa">Empresa: {{ selectedPersona.empresa }}</span>
                            <span v-if="selectedPersona.rfc">RFC: {{ selectedPersona.rfc }}</span>
                          </div>
                        </div>
    
                        <span class="inline-flex rounded-full px-2 py-1 text-[11px] font-black bg-emerald-600 text-white dark:bg-emerald-500">
                          Confirmada
                        </span>
                      </div>
                    </div>
                  </div>
    
                  <!-- User fields -->
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div class="sm:col-span-2">
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Nombre</label>
                      <input
                        v-model="form.name"
                        type="text"
                        placeholder="Nombre del usuario"
                        class="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition
                               focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5
                               dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-white/10"
                      />
                      <p v-if="errors.name" class="mt-1 text-xs font-bold text-rose-600">{{ errors.name }}</p>
                    </div>
    
                    <div class="sm:col-span-2">
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Email</label>
                      <input
                        v-model="form.email"
                        type="email"
                        placeholder="correo@dominio.com"
                        class="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition
                               focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5
                               dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-white/10"
                      />
                      <p v-if="errors.email" class="mt-1 text-xs font-bold text-rose-600">{{ errors.email }}</p>
                    </div>
    
                    <div>
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Rol</label>
                      <select
                        v-model="form.rol"
                        class="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition
                               focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5
                               dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-white/10"
                      >
                        <option v-for="r in props.catalogs.roles" :key="r" :value="r">{{ r }}</option>
                      </select>
                      <p v-if="errors.rol" class="mt-1 text-xs font-bold text-rose-600">{{ errors.rol }}</p>
                    </div>
    
                    <div>
                      <label class="text-xs font-black text-slate-700 dark:text-slate-200">Status</label>
                      <select
                        v-model="form.status"
                        class="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition
                               focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5
                               dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-white/10"
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
                        class="mt-1 w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-900 outline-none transition
                               focus:border-slate-400 focus:ring-4 focus:ring-slate-900/5
                               dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-600 dark:focus:ring-white/10"
                      />
                      <p v-if="errors.password" class="mt-1 text-xs font-bold text-rose-600">{{ errors.password }}</p>
                    </div>
                  </div>
                </div>
    
                <!-- Footer -->
                <div class="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 p-5 sm:p-6 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    class="w-full sm:w-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-900 transition hover:bg-slate-50
                           disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                    :disabled="busy"
                    @click="closeModal()"
                  >
                    Cancelar
                  </button>
    
                  <button
                    type="button"
                    class="w-full sm:w-auto rounded-xl bg-slate-900 px-4 py-2 text-sm font-black text-white shadow-sm transition
                           hover:shadow-md hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50
                           dark:bg-white dark:text-slate-900"
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
    
    <style scoped>
    .fade-enter-active,
    .fade-leave-active { transition: opacity .18s ease; }
    .fade-enter-from,
    .fade-leave-to { opacity: 0; }
    </style>
    