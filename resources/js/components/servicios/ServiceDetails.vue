<script setup lang="ts">
type IncludeItem = {
  title: string
  text: string
}

type ResultCard = {
  title: string
  text: string
}

defineProps<{
  goCotizar: () => void
  sectionText: string
  includes: IncludeItem[]
  resultTitle: string
  resultText: string
  resultCards: ResultCard[]
}>()

const goMarcas = () => {
  const el = document.getElementById('marcas')
  if (!el) return

  window.scrollTo({
    top: el.offsetTop - 90,
    behavior: 'smooth'
  })
}
</script>

<template>
  <section id="detalles" class="mx-auto max-w-7xl px-4 py-16">
    <div class="grid items-start gap-10 lg:grid-cols-2">
      <!-- LEFT -->
      <div>
        <h2 class="mb-2 text-3xl font-semibold text-gray-900">
          Qué incluye
        </h2>

        <p class="mb-8 text-gray-500">
          {{ sectionText }}
        </p>

        <div class="space-y-5">
          <div
            v-for="(item, index) in includes"
            :key="`${item.title}-${index}`"
            class="rounded-2xl border bg-white p-5 shadow-sm"
          >
            <h3 class="font-semibold text-gray-900">
              {{ item.title }}
            </h3>

            <p class="mt-1 text-sm text-gray-500">
              {{ item.text }}
            </p>
          </div>
        </div>
      </div>

      <!-- RIGHT -->
      <div class="rounded-3xl bg-gray-50 p-8 shadow-sm">
        <h3 class="mb-3 text-xl font-semibold text-gray-900">
          {{ resultTitle }}
        </h3>

        <p class="mb-8 text-gray-600">
          {{ resultText }}
        </p>

        <div class="mb-8 grid gap-4 sm:grid-cols-2">
          <div
            v-for="(card, index) in resultCards"
            :key="`${card.title}-${index}`"
            class="rounded-2xl border bg-white p-4"
          >
            <h4 class="mb-1 text-sm font-semibold text-gray-900">
              {{ card.title }}
            </h4>

            <p class="text-sm text-gray-500">
              {{ card.text }}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            class="h-11 rounded-xl bg-blue-900 px-6 font-medium text-white transition hover:bg-blue-900"
            @click="goCotizar"
          >
            Solicitar cotización
          </button>

          <button
            class="h-11 rounded-xl border px-6 text-gray-700 transition hover:bg-gray-100"
            @click="goMarcas"
          >
            Ver marcas
          </button>
        </div>
      </div>
    </div>
  </section>
</template>