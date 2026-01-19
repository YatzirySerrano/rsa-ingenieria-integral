<script setup lang="ts">
    import { Head, usePage } from '@inertiajs/vue3'
    import { computed } from 'vue'
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
    
    const crud = useUserCrud({
      baseUrl: '/admin/users',
      initialFilters: props.filters,
    })
    
    const rows = computed(() => props.users?.data ?? [])
    
    const flash = computed(() => (page.props.flash ?? {}) as any)
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
                Gestión administrativa de cuentas. Personas se manejan aparte.
              </p>
            </div>
    
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:opacity-95 active:scale-[0.99] dark:bg-white dark:text-slate-900"
                @click="crud.upsertUser({ mode: 'create', roles: props.catalogs.roles, statuses: props.catalogs.statuses })"
              >
                Crear usuario
              </button>
            </div>
          </div>
    
          <!-- Flash -->
          <div v-if="flash.success" class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100">
            {{ flash.success }}
          </div>
          <div v-if="flash.error" class="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-100">
            {{ flash.error }}
          </div>
    
          <!-- Filters -->
          <div class="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950">
            <div class="grid grid-cols-1 gap-3 md:grid-cols-12 md:items-end">
              <div class="md:col-span-6">
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Buscar
                </label>
                <input
                  v-model="crud.filters.q"
                  type="text"
                  placeholder="Nombre o email..."
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600"
                />
              </div>
    
              <div class="md:col-span-3">
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Rol
                </label>
                <select
                  v-model="crud.filters.rol"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600"
                >
                  <option value="__all__">Todos</option>
                  <option v-for="r in props.catalogs.roles" :key="r" :value="r">{{ r }}</option>
                </select>
              </div>
    
              <div class="md:col-span-3">
                <label class="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
                  Status
                </label>
                <select
                  v-model="crud.filters.status"
                  class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-900 outline-none transition focus:border-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-600"
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
                v-if="crud.hasFilters"
                class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                @click="crud.resetFilters()"
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
                <div class="col-span-2 hidden md:block">Rol</div>
                <div class="col-span-2 text-right">Acciones</div>
              </div>
            </div>
    
            <div v-if="rows.length === 0" class="px-4 py-10 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
              Sin resultados.
            </div>
    
            <div v-for="u in rows" :key="u.id" class="border-b border-slate-100 px-4 py-4 last:border-b-0 dark:border-slate-900">
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
                          : 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200'"
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
                        : 'bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200'"
                    >
                      {{ u.status }}
                    </span>
                  </div>
                </div>
    
                <div class="col-span-4 md:col-span-1 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black text-slate-900 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900"
                      @click="crud.upsertUser({ mode: 'edit', user: u, roles: props.catalogs.roles, statuses: props.catalogs.statuses })"
                    >
                      Editar
                    </button>
    
                    <button
                      class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-900 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/40 dark:text-rose-200 dark:hover:bg-rose-950/70"
                      @click="crud.deleteUser(u)"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
    
          <!-- Pagination (simple) -->
          <div class="mt-6 flex flex-wrap items-center gap-2">
            <a
              v-for="(l, i) in props.users.links"
              :key="i"
              :href="l.url || '#'"
              class="rounded-xl px-3 py-2 text-xs font-black transition"
              :class="l.active
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:hover:bg-slate-900'"
              v-html="l.label"
              @click.prevent="l.url && $inertia.visit(l.url, { preserveScroll: true, preserveState: true })"
            />
          </div>
        </div>
      </AppLayout>
    </template>
    