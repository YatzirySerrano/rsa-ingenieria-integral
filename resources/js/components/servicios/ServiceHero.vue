<script setup lang="ts">
type HeroHighlight = {
  title: string
  text: string
}

defineProps<{
  image: string
  waLink: string
  goCotizar: () => void
  goTo: (id: string) => void
  badge: string
  title: string
  description: string
  applications: string[]
  highlights: HeroHighlight[]
  bottomText: string
}>()
</script>

<template>
  <section class="relative overflow-hidden">
    <img
      :src="image"
      class="absolute inset-0 h-full w-full object-cover"
    />

    <div class="absolute inset-0 bg-black/50"></div>

    <div class="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-white"></div>

    <div class="relative mx-auto max-w-7xl px-4 py-24">
      <div class="grid items-center gap-10 lg:grid-cols-2">
        <!-- LEFT -->
        <div class="space-y-6 text-white" data-reveal>
          <div class="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-sm backdrop-blur">
            {{ badge }}
          </div>

          <h1 class="text-5xl font-bold leading-tight whitespace-pre-line">
            {{ title }}
          </h1>

          <p class="max-w-xl text-white/80">
            {{ description }}
          </p>

          <div class="flex flex-wrap gap-4">
            <button
              class="h-11 rounded-xl bg-blue-900 px-6 text-white transition hover:bg-blue-900"
              @click="goCotizar"
            >
              Solicitar cotización
            </button>

            <button
              class="h-11 rounded-xl border border-white/40 px-6 text-white transition hover:bg-white/10"
              @click="goTo('detalles')"
            >
              Saber más
            </button>

            <a
              :href="waLink"
              target="_blank"
              rel="noopener noreferrer"
              class="flex h-11 items-center rounded-xl border border-white/40 px-6 text-white transition hover:bg-white/10"
            >
              WhatsApp
            </a>
          </div>

          <p class="text-sm text-white/70">
            Aplicaciones:
            <template v-for="(item, index) in applications" :key="item">
              <strong>{{ item }}</strong>
              <span v-if="index !== applications.length - 1"> · </span>
            </template>
          </p>
        </div>

        <!-- RIGHT -->
        <div class="grid grid-cols-2 gap-4" data-reveal>
          <div
            v-for="(item, index) in highlights.slice(0, 4)"
            :key="`${item.title}-${index}`"
            class="glass-card"
          >
            <div class="icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="3" stroke-width="2" />
                <path stroke-width="2" d="M8 12h8" />
              </svg>
            </div>

            <div class="font-semibold">
              {{ item.title }}
            </div>

            <p class="text-sm text-white/70">
              {{ item.text }}
            </p>
          </div>

          <div class="glass-card col-span-2 text-center">
            {{ bottomText }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.glass-card {
  padding: 1.25rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.18);
  color: white;
  display: flex;
  flex-direction: column;
  gap: .35rem;
}

.icon {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: .35rem;
}

.icon svg {
  width: 18px;
  height: 18px;
  color: white;
}

/* reveal animation */
[data-reveal] {
  opacity: 0;
  transform: translateY(40px);
  transition: all .9s ease;
}

[data-reveal].is-in {
  opacity: 1;
  transform: none;
}
</style>