<script setup lang="ts">
    import { onBeforeUnmount, onMounted, watch } from 'vue'
    import { X } from 'lucide-vue-next'
    
    const props = defineProps<{
      open: boolean
    }>()
    
    const emit = defineEmits<{
      (e: 'close'): void
    }>()
    
    function onKeydown(e: KeyboardEvent) {
      if (!props.open) return
      if (e.key === 'Escape') emit('close')
    }
    
    // Nota interna: lock scroll mientras esté abierto (UX premium)
    watch(
      () => props.open,
      (v) => {
        if (v) document.documentElement.classList.add('overflow-hidden')
        else document.documentElement.classList.remove('overflow-hidden')
      },
      { immediate: true }
    )
    
    onMounted(() => window.addEventListener('keydown', onKeydown))
    onBeforeUnmount(() => {
      window.removeEventListener('keydown', onKeydown)
      document.documentElement.classList.remove('overflow-hidden')
    })
    
    function onOverlayClick() {
      emit('close')
    }
    
    function stop(e: MouseEvent) {
      e.stopPropagation()
    }
    </script>
    
    <template>
      <Teleport to="body">
        <div v-show="open" class="fixed inset-0 z-[80]">
          <!-- Overlay -->
          <div
            class="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            @click="onOverlayClick"
          />
    
          <!-- Dialog wrapper -->
          <div class="relative flex min-h-full items-center justify-center p-4">
            <!-- Panel -->
            <div
              class="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl
                     dark:border-slate-800 dark:bg-slate-950"
              @click="stop"
              role="dialog"
              aria-modal="true"
            >
              <!-- Header -->
              <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
                <div class="text-base font-semibold text-slate-900 dark:text-slate-100">
                  <slot name="title" />
                </div>
    
                <button
                  type="button"
                  class="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600
                         transition hover:bg-slate-50 hover:text-slate-900
                         dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900/60 dark:hover:text-slate-100"
                  @click="emit('close')"
                  aria-label="Cerrar"
                >
                  <X class="h-4 w-4" />
                </button>
              </div>
    
              <!-- Body -->
              <div class="px-5 py-4">
                <slot name="content" />
              </div>
    
              <!-- Footer -->
              <div class="border-t border-slate-200 px-5 py-4 dark:border-slate-800">
                <slot name="footer" />
              </div>
            </div>
          </div>
        </div>
      </Teleport>
    </template>
    