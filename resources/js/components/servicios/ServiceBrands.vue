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

<section class="mx-auto max-w-7xl px-4 py-14">

<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">

<div
v-for="b in brands"
:key="b.name"
class="border rounded-xl p-6 flex items-center justify-center"
>

<img
:src="b.logo"
:alt="b.name"
class="max-h-10 object-contain"
/>

</div>

</div>

</section>

</template>