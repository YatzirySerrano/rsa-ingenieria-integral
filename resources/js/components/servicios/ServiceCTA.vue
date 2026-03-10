<script setup lang="ts">

defineProps<{
  waLink: string
  goCotizar: () => void
}>()

</script>

<template>

<section class="mx-auto max-w-7xl px-4 py-14 text-center">

<h2 class="text-2xl font-semibold mb-6">
Solicita tu cotización
</h2>

<div class="flex gap-4 justify-center">

<button
class="bg-blue-600 text-white px-6 h-11 rounded-xl"
@click="goCotizar"
>
Cotizar ahora
</button>

<a
:href="waLink"
target="_blank"
class="border px-6 h-11 rounded-xl flex items-center"
>
WhatsApp
</a>

</div>

</section>

</template>