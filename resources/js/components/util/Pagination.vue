<script setup lang="ts">
import { computed } from 'vue'
import { router } from '@inertiajs/vue3'

const props = defineProps<{
  meta: any
  links: any[]
  perPage: number
}>()

const emit = defineEmits<{
  (e: 'change-per-page', value: number): void
}>()

const perPageOptions = [
  { label: '10', value: 10 },
  { label: '15', value: 15 },
  { label: '20', value: 20 },
  { label: 'Todos', value: 0 },
]

function go(url: string | null) {
  if (!url) return
  router.get(url, {}, { preserveScroll: true, preserveState: true })
}

function onPerPageChange(e: Event) {
  const v = Number((e.target as HTMLSelectElement).value)
  emit('change-per-page', v)
}

const showingText = computed(() => {
  if (!props.meta?.from) return 'Mostrando todos los registros'
  return `Mostrando ${props.meta.from}–${props.meta.to} de ${props.meta.total}`
})
</script>

<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center">
      <span class="text-sm text-slate-600 dark:text-slate-400">
        {{ showingText }}
      </span>

      <select
        :value="perPage"
        @change="onPerPageChange"
        class="w-36 rounded-2xl border-2 border-slate-200/70 dark:border-white/10
               bg-white/90 dark:bg-white/5 px-3 py-2 text-sm font-semibold
               shadow-sm transition-all
               hover:border-emerald-400/50
               focus:border-emerald-500/60 focus:ring-4 focus:ring-emerald-500/20"
      >
        <option v-for="o in perPageOptions" :key="o.value" :value="o.value">
          {{ o.label }} por página
        </option>
      </select>
    </div>

    <div class="flex flex-wrap items-center gap-2">
      <button
        v-for="link in links"
        :key="link.label"
        @click="go(link.url)"
        v-html="link.label"
        :disabled="!link.url"
        class="min-w-[42px] rounded-2xl px-3 py-2 text-sm font-extrabold
               transition-all duration-200
               disabled:cursor-not-allowed disabled:opacity-40
               hover:-translate-y-[1px] hover:shadow-md
               hover:bg-slate-100 dark:hover:bg-zinc-800"
        :class="{
          'bg-emerald-600 text-white hover:bg-emerald-500': link.active,
          'text-slate-600 dark:text-zinc-200': !link.active,
        }"
      />
    </div>
  </div>
</template>