<script setup lang="ts">
import type { Ref } from 'vue'

/**
 * Modal premium:
 * - Acepta boolean o Ref<boolean> en `open` para evitar errores TS al pasar refs.
 * - Backdrop blur
 * - Responsive: bottom-sheet en móvil, dialog en desktop
 */
const props = defineProps<{
  open: boolean | Ref<boolean>
  title: string
  subtitle?: string
}>()

const emit = defineEmits<{ (e: 'close'): void }>()

function isOpen() {
  return typeof props.open === 'boolean' ? props.open : props.open.value
}
</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="isOpen()"
        class="fixed inset-0 z-[20000] flex items-end sm:items-center justify-center"
        aria-modal="true"
        role="dialog"
      >
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="emit('close')" />

        <Transition name="pop">
          <div
            class="relative w-full sm:max-w-2xl mx-0 sm:mx-6 rounded-t-2xl sm:rounded-2xl
                   bg-white dark:bg-neutral-900 shadow-2xl border border-black/10 dark:border-white/10
                   p-4 sm:p-6"
          >
            <div class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {{ title }}
                </h3>
                <p v-if="subtitle" class="mt-1 text-sm text-slate-600 dark:text-neutral-300">
                  {{ subtitle }}
                </p>
              </div>

              <button
                class="rounded-lg px-2 py-1 text-slate-600 hover:bg-slate-100 dark:text-neutral-300 dark:hover:bg-neutral-800 transition"
                @click="emit('close')"
              >
                Cerrar
              </button>
            </div>

            <div class="mt-4">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity .18s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.pop-enter-active { transition: transform .18s ease, opacity .18s ease; }
.pop-enter-from { transform: translateY(10px) scale(.985); opacity: 0; }
</style>
