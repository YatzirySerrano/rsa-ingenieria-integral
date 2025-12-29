<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import NavbarPublic from '@/components/NavbarPublic.vue'
import FooterPublic from '@/components/FooterPublic.vue'
import { RSA_PUBLIC } from '@/config/rsaPublic'

const showTop = ref(false)

function updateShowTop() {
  showTop.value = window.scrollY > 600
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function goTo(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const headerOffset = 84
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset
  window.scrollTo({ top, behavior: 'smooth' })
}

onMounted(() => {
  updateShowTop()
  window.addEventListener('scroll', updateShowTop, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', updateShowTop)
})
</script>

<template>
  <div class="min-h-screen bg-white text-slate-950 dark:bg-neutral-950 dark:text-white">
    <NavbarPublic :links="RSA_PUBLIC.links" :on-nav="goTo" />

    <main>
      <slot />
    </main>

    <FooterPublic :links="RSA_PUBLIC.links" :on-nav="goTo" :wa-link="RSA_PUBLIC.waLink" :logo-src="RSA_PUBLIC.logoSrc" />

    <!-- WhatsApp flotante (original / único) -->
    <a
      :href="RSA_PUBLIC.waLink"
      target="_blank"
      rel="noopener noreferrer"
      class="fixed bottom-5 right-5 z-[60] inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]/40"
      aria-label="WhatsApp"
      title="WhatsApp"
    >
      <svg viewBox="0 0 32 32" class="h-6 w-6 fill-white" aria-hidden="true">
        <path
          d="M19.11 17.17c-.27-.13-1.6-.79-1.85-.88-.25-.09-.43-.13-.61.13-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.13-1.16-.43-2.21-1.37-.82-.73-1.37-1.64-1.53-1.91-.16-.27-.02-.42.12-.55.12-.12.27-.32.41-.48.13-.16.18-.27.27-.45.09-.18.04-.34-.02-.48-.07-.13-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27s.98 2.63 1.12 2.81c.13.18 1.93 2.95 4.68 4.14.65.28 1.16.45 1.56.58.65.21 1.24.18 1.71.11.52-.08 1.6-.65 1.83-1.27.23-.62.23-1.15.16-1.27-.07-.12-.25-.2-.52-.34ZM16.02 5.33c-5.89 0-10.67 4.78-10.67 10.67 0 1.88.49 3.7 1.43 5.3L5.2 26.67l5.55-1.46c1.53.83 3.25 1.27 5.27 1.27 5.89 0 10.67-4.78 10.67-10.67S21.91 5.33 16.02 5.33Zm0 19.33c-1.8 0-3.49-.5-4.94-1.38l-.35-.21-3.29.86.88-3.2-.23-.33a8.6 8.6 0 0 1-1.42-4.7c0-4.75 3.86-8.6 8.6-8.6 4.75 0 8.6 3.86 8.6 8.6 0 4.75-3.86 8.6-8.6 8.6Z"
        />
      </svg>
    </a>

    <!-- Subir (único) -->
    <button
      v-show="showTop"
      type="button"
      @click="scrollToTop"
      class="fixed bottom-5 left-5 z-[60] inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 dark:border-neutral-800 dark:bg-neutral-950"
      aria-label="Subir"
      title="Subir"
    >
      <svg viewBox="0 0 24 24" class="h-5 w-5 fill-slate-900 dark:fill-white" aria-hidden="true">
        <path d="M12 5l7 7-1.41 1.41L13 8.83V20h-2V8.83L6.41 13.41 5 12l7-7z" />
      </svg>
    </button>
  </div>
</template>
