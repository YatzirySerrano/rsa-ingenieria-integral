<script setup lang="ts">

type Brand = {
  name: string
  logo: string
}

defineProps<{
  brands: Brand[]
}>()

</script>

<template>

<!-- section FULL WIDTH -->
<section id="marcas" class="bg-slate-50 dark:bg-neutral-900/40 py-14">

  <!-- container (limita el contenido) -->
  <div class="mx-auto max-w-7xl px-4">

    <!-- title -->
    <div class="text-center mb-10">
      <h2 class="text-2xl font-semibold text-slate-950 dark:text-white">
        Marcas con las que trabajamos
      </h2>
    </div>

    <!-- brands -->
    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">

      <div
        v-for="b in brands"
        :key="b.name"
        class="border rounded-xl p-6 flex items-center justify-center bg-white dark:bg-neutral-900"
      >
        <img
          :src="b.logo"
          :alt="b.name"
          class="max-h-10 object-contain"
        />
      </div>

    </div>

  </div>

</section>

</template>