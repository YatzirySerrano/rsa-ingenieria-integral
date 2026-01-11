<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import type { PaginationLink } from '@/types/pagination'

defineProps<{ links: PaginationLink[] }>()
</script>

<template>
  <nav class="flex flex-wrap items-center gap-2">
    <Link
      v-for="(l, idx) in links"
      :key="idx"
      :href="l.url ?? ''"
      class="px-3 py-1.5 rounded-lg text-sm transition border
             border-black/10 dark:border-white/10
             text-slate-700 dark:text-neutral-200
             hover:bg-slate-100 dark:hover:bg-neutral-800"
      :class="[
        !l.url ? 'opacity-50 pointer-events-none' : '',
        l.active ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : ''
      ]"
      v-html="l.label"
    />
  </nav>
</template>
