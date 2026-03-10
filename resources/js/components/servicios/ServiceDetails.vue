<script setup lang="ts">

defineProps<{
  goCotizar: () => void
}>()

</script>

<template>

<section class="mx-auto max-w-7xl px-4 py-14">

<h2 class="text-2xl font-semibold mb-4">
Sistema profesional de videovigilancia
</h2>

<p class="text-gray-600">
Instalamos sistemas CCTV con equipos profesionales,
grabación segura y acceso remoto desde tu celular.
</p>

<button
class="mt-6 bg-blue-600 text-white px-6 h-11 rounded-xl"
@click="goCotizar"
>
Solicitar cotización
</button>

</section>

</template>