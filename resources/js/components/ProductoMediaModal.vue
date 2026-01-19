<script setup lang="ts">
    /**
     * ProductoMediaModal.vue
     * ----------------------
     * Modal “premium” para administrar imágenes del producto.
     * - No conoce nada de filtros ni CRUD: solo abre/cierra y delega gestión a ProductoMediaManager.
     * - Evita mezclar UI compleja dentro del Index (mantenibilidad).
     *
     * Uso:
     * <ProductoMediaModal
     *   :open="showMediaModal"
     *   :producto="selectedProductForMedia"
     *   @close="closeMediaModal"
     *   @media-updated="onMediaUpdated"
     * />
     */
    
    import { computed } from 'vue'
    import { Button } from '@/components/ui/button'
    import { X, Image as ImageIcon } from 'lucide-vue-next'
    import ProductoMediaManager from '@/components/ProductoMediaManager.vue'
    import type { Producto } from '@/composables/crud/useProductoCrud'
    
    const props = defineProps<{
      open: boolean
      producto: Producto | null
    }>()
    
    const emit = defineEmits<{
      (e: 'close'): void
      (e: 'media-updated'): void
    }>()
    
    const canRender = computed(() => props.open && !!props.producto)
    
    function close() {
      emit('close')
    }
    
    function onMediaUpdated() {
      emit('media-updated')
    }
    </script>
    
    <template>
      <div v-if="canRender" class="fixed inset-0 z-50">
        <!-- Backdrop -->
        <button
          type="button"
          class="absolute inset-0 w-full h-full bg-black/60 backdrop-blur-sm"
          aria-label="Cerrar modal"
          @click="close"
        />
    
        <!-- Dialog -->
        <div class="relative h-full w-full flex items-center justify-center p-3 sm:p-4 lg:p-6">
          <div
            class="w-full max-w-6xl max-h-[92vh] overflow-hidden rounded-2xl lg:rounded-3xl border border-slate-200/70 dark:border-white/10 bg-white/95 dark:bg-zinc-950/70 shadow-2xl shadow-black/30"
            role="dialog"
            aria-modal="true"
            @click.stop
          >
            <!-- Header -->
            <div
              class="flex items-start sm:items-center justify-between gap-4 p-4 sm:p-6 border-b border-slate-200/70 dark:border-white/10 bg-gradient-to-r from-slate-50 to-white dark:from-zinc-900 dark:to-zinc-950"
            >
              <div class="min-w-0">
                <div class="flex items-center gap-2">
                  <div
                    class="h-10 w-10 rounded-2xl bg-emerald-600/10 dark:bg-emerald-500/10 flex items-center justify-center"
                  >
                    <ImageIcon class="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
    
                  <div class="min-w-0">
                    <h3 class="text-lg sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-zinc-100 truncate">
                      Gestión de Imágenes
                    </h3>
                    <p class="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 truncate">
                      {{ props.producto?.nombre }} · <span class="font-bold">{{ props.producto?.sku }}</span>
                    </p>
                  </div>
                </div>
              </div>
    
              <Button
                type="button"
                variant="ghost"
                size="sm"
                class="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-white/10"
                @click="close"
                title="Cerrar"
              >
                <X class="h-5 w-5" />
              </Button>
            </div>
    
            <!-- Body -->
            <div class="p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-160px)] modal-scrollbar">
              <ProductoMediaManager
                :producto-id="props.producto!.id"
                :initial-medias="props.producto!.medias || []"
                @media-updated="onMediaUpdated"
              />
            </div>
    
            <!-- Footer -->
            <div class="p-4 sm:p-6 border-t border-slate-200/70 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
              <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p class="text-sm text-slate-500 dark:text-zinc-400">
                  Tip: el orden y la principal se guardan al momento.
                </p>
                <Button type="button" variant="outline" @click="close">
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
    
    <style scoped>
    .modal-scrollbar {
      scrollbar-width: thin;
      scrollbar-color: rgba(148, 163, 184, 0.35) transparent;
    }
    .modal-scrollbar::-webkit-scrollbar {
      width: 8px;
    }
    .modal-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .modal-scrollbar::-webkit-scrollbar-thumb {
      background-color: rgba(148, 163, 184, 0.35);
      border-radius: 999px;
    }
    </style>
    