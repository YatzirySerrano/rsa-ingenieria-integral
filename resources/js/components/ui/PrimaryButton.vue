<script setup lang="ts">
defineProps<{
  type?: 'button' | 'submit'
  disabled?: boolean
}>()
</script>

<template>
  <button
    :type="type ?? 'button'"
    :disabled="disabled"
    class="inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold
           bg-slate-900 text-white shadow-sm transition
           hover:shadow-md hover:-translate-y-[1px] active:translate-y-0
           disabled:opacity-60 disabled:cursor-not-allowed
           dark:bg-white dark:text-slate-900"
  >
    <slot />
  </button>
</template>
