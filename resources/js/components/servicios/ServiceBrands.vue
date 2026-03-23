<script setup lang="ts">
type Brand = {
  name: string
  logo?: string
}

defineProps<{
  brands: Brand[]
}>()
</script>

<template>
  <section id="marcas" class="bg-slate-50 py-14 dark:bg-neutral-900/40">
    <div class="mx-auto max-w-7xl px-4">
      <div class="mb-10 text-center">
        <h2 class="text-2xl font-semibold text-slate-950 dark:text-white">
          Marcas y tecnologías con las que trabajamos
        </h2>
      </div>

      <div class="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-5">
        <div
          v-for="b in brands"
          :key="b.name"
          class="flex min-h-[96px] items-center justify-center rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900"
        >
          <img
            v-if="b.logo"
            :src="b.logo"
            :alt="b.name"
            class="max-h-10 w-auto object-contain"
          >

          <span
            v-else
            class="text-center text-sm font-semibold leading-snug text-slate-700 dark:text-slate-200"
          >
            {{ b.name }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>