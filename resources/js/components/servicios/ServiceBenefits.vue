<script setup lang="ts">

type Benefit = {
  title: string
  text: string
}

defineProps<{
  tabs: Benefit[]
  active: number
  goCotizar: () => void
  goTo: (id: string) => void
}>()

const emit = defineEmits(['update:active'])

function changeTab(i:number){
  emit('update:active', i)
}

</script>

<template>

<section class="mx-auto max-w-7xl px-4 py-14">

<div class="grid lg:grid-cols-12 gap-8">

<div class="lg:col-span-5">

<button
v-for="(t,i) in tabs"
:key="t.title"
class="block w-full border px-4 py-3 rounded-xl mb-2"
@click="changeTab(i)"
>

{{ t.title }}

</button>

</div>

<div class="lg:col-span-7">

<h3 class="font-semibold text-xl">

{{ tabs[active].title }}

</h3>

<p class="mt-4 text-gray-600">

{{ tabs[active].text }}

</p>

</div>

</div>

</section>

</template>