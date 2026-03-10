<script setup lang="ts">

type Step = {
  n: string
  title: string
  text: string
}

defineProps<{
  steps: Step[]
  goCotizar: () => void
}>()

</script>

<template>

<section id="pasos" class="mx-auto max-w-7xl px-4 py-14">

<div class="grid md:grid-cols-3 lg:grid-cols-5 gap-6">

<div
v-for="s in steps"
:key="s.n"
class="border rounded-xl p-6"
>

<div class="text-xl font-bold">
{{ s.n }}
</div>

<div class="font-semibold">
{{ s.title }}
</div>

<p class="text-sm text-gray-600">
{{ s.text }}
</p>

</div>

</div>

</section>

</template>