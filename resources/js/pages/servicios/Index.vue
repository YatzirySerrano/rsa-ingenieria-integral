<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

import { useServiciosIndex } from '@/composables/crud/useServiciosIndex'

import PrimaryButton from '@/components/ui/PrimaryButton.vue'
import SecondaryButton from '@/components/ui/SecondaryButton.vue'
import ModalShell from '@/components/ui/ModalShell.vue'
import PaginationLinks from '@/components/ui/PaginationLinks.vue'

const ui = useServiciosIndex()
</script>

<template>
  <AppLayout>
    <Head title="Servicios" />

    <div class="px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            Servicios
          </h1>
          <p class="mt-1 text-sm text-slate-600 dark:text-neutral-300">
            Servicios cotizables. Eliminación lógica por status.
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-2 sm:items-center">
          <div class="flex gap-2">
            <input
              v-model="ui.q"
              class="w-full sm:w-72 rounded-xl border border-black/10 dark:border-white/10
                     bg-white dark:bg-neutral-900 text-slate-900 dark:text-white
                     px-3 py-2 text-sm outline-none transition"
              placeholder="Buscar por nombre"
              @keyup.enter="ui.applyFilters"
            />
            <select
              v-model="ui.status"
              class="rounded-xl border border-black/10 dark:border-white/10
                     bg-white dark:bg-neutral-900 text-slate-900 dark:text-white
                     px-3 py-2 text-sm transition"
              @change="ui.applyFilters"
            >
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="todos">Todos</option>
            </select>
          </div>

          <div class="flex gap-2">
            <SecondaryButton @click="ui.resetFilters">Limpiar</SecondaryButton>
            <PrimaryButton @click="ui.openCreate">Nuevo</PrimaryButton>
          </div>
        </div>
      </div>

      <div class="mt-6 rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full text-sm">
            <thead class="bg-slate-50 dark:bg-neutral-800/60 text-slate-700 dark:text-neutral-200">
              <tr>
                <th class="text-left px-4 py-3 font-semibold">Nombre</th>
                <th class="text-left px-4 py-3 font-semibold hidden lg:table-cell">Categoría</th>
                <th class="text-right px-4 py-3 font-semibold">Precio</th>
                <th class="text-center px-4 py-3 font-semibold">Status</th>
                <th class="text-right px-4 py-3 font-semibold">Acciones</th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="s in ui.props.servicios.data"
                :key="s.id"
                class="border-t border-black/5 dark:border-white/10 hover:bg-slate-50/70 dark:hover:bg-neutral-800/40 transition"
              >
                <td class="px-4 py-3">
                  <div class="font-semibold text-slate-900 dark:text-white">{{ s.nombre }}</div>
                  <div class="text-xs text-slate-500 dark:text-neutral-400 line-clamp-1">{{ s.descripcion ?? '—' }}</div>
                </td>
                <td class="px-4 py-3 hidden lg:table-cell text-slate-700 dark:text-neutral-300">
                  {{ s.categoria?.nombre ?? '—' }}
                </td>
                <td class="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                  ${{ s.precio }}
                </td>
                <td class="px-4 py-3 text-center">
                  <span
                    class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border"
                    :class="s.status === 'activo'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20'
                      : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20'"
                  >
                    {{ s.status }}
                  </span>
                </td>
                <td class="px-4 py-3">
                  <div class="flex justify-end gap-2">
                    <SecondaryButton @click="ui.view(s)">Ver</SecondaryButton>
                    <SecondaryButton @click="ui.openEdit(s)">Editar</SecondaryButton>
                    <button
                      class="rounded-xl px-3 py-2 text-sm font-semibold transition
                             bg-rose-600 text-white hover:bg-rose-700 hover:-translate-y-[1px] active:translate-y-0"
                      @click="ui.remove(s)"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>

              <tr v-if="ui.props.servicios.data.length === 0">
                <td colspan="5" class="px-4 py-10 text-center text-slate-600 dark:text-neutral-300">
                  Sin resultados.
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-4">
          <div class="text-xs text-slate-600 dark:text-neutral-400">
            Página {{ ui.props.servicios.meta.current_page }} de {{ ui.props.servicios.meta.last_page }} —
            Total: {{ ui.props.servicios.meta.total }}
          </div>
          <PaginationLinks :links="ui.props.servicios.links" />
        </div>
      </div>

      <ModalShell
        :open="ui.modalOpen"
        :title="ui.isEditing ? 'Editar servicio' : 'Nuevo servicio'"
        subtitle="Validación inline. Guardado vía Inertia."
        @close="ui.closeModal"
      >
        <form class="grid grid-cols-1 lg:grid-cols-2 gap-4" @submit.prevent="ui.submit">
          <div class="lg:col-span-2">
            <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Categoría</label>
            <select
              v-model="ui.form.categoria_id"
              class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm"
            >
              <option :value="null">—</option>
              <option v-for="c in ui.props.categorias" :key="c.id" :value="c.id">{{ c.nombre }}</option>
            </select>
            <div v-if="ui.form.errors.categoria_id" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.categoria_id }}</div>
          </div>

          <div class="lg:col-span-2">
            <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Nombre *</label>
            <input v-model="ui.form.nombre" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
            <div v-if="ui.form.errors.nombre" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.nombre }}</div>
          </div>

          <div class="lg:col-span-2">
            <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Descripción</label>
            <textarea v-model="ui.form.descripcion" rows="3" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
            <div v-if="ui.form.errors.descripcion" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.descripcion }}</div>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Precio *</label>
            <input type="number" step="0.01" v-model="ui.form.precio" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm" />
            <div v-if="ui.form.errors.precio" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.precio }}</div>
          </div>

          <div>
            <label class="text-xs font-semibold text-slate-700 dark:text-neutral-300">Status</label>
            <select v-model="ui.form.status" class="mt-1 w-full rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 px-3 py-2 text-sm">
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>
            <div v-if="ui.form.errors.status" class="mt-1 text-xs text-rose-600">{{ ui.form.errors.status }}</div>
          </div>

          <div class="lg:col-span-2 flex justify-end gap-2 pt-2">
            <SecondaryButton @click="ui.closeModal">Cancelar</SecondaryButton>
            <PrimaryButton type="submit" :disabled="ui.form.processing">
              {{ ui.form.processing ? 'Guardando...' : 'Guardar' }}
            </PrimaryButton>
          </div>
        </form>
      </ModalShell>
    </div>
  </AppLayout>
</template>
