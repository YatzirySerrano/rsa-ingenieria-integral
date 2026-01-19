<script setup lang="ts">
    /*
      ProductoMediaManager.vue
      ------------------------
      - NO Ziggy.
      - Web routes con Inertia router.* (NO API).
      - UI: drag&drop, orden, principal, desactivar.
      - Actualiza UI al momento (optimistic) para no cerrar modal.
    */
    
    import { computed, ref, watch } from 'vue'
    import { router } from '@inertiajs/vue3'
    import Swal from 'sweetalert2'
    
    import type { ProductoMedia } from '@/types/producto'
    import {
      Upload,
      Star,
      Trash2,
      GripVertical,
      EyeOff,
      ArrowUp,
      ArrowDown,
      Loader2,
      Image as ImageIcon,
    } from 'lucide-vue-next'
    
    const props = defineProps<{
      productoId: number
      initialMedias: ProductoMedia[]
    }>()
    
    const emit = defineEmits<{
      (e: 'media-updated'): void
    }>()
    
    /* -----------------------------
       State
    ------------------------------ */
    const medias = ref<ProductoMedia[]>(props.initialMedias || [])
    const isUploading = ref(false)
    const isBusy = ref(false) // para orden/principal/delete
    const draggingIndex = ref<number | null>(null)
    const fileInputRef = ref<HTMLInputElement | null>(null)
    const isDragActive = ref(false)
    
    /*
      Mantener sincronía cuando el padre sí refresca props
    */
    watch(
      () => props.initialMedias,
      (newMedias) => {
        medias.value = (newMedias || []).slice()
      },
      { deep: true }
    )
    
    /* -----------------------------
       Computeds
    ------------------------------ */
    const activeMedias = computed(() =>
      medias.value
        .filter((m) => m.status === 'activo')
        .slice()
        // Orden consistente en UI: principal arriba, luego orden
        .sort((a, b) => {
          if (a.principal !== b.principal) return a.principal ? -1 : 1
          return (a.orden ?? 999999) - (b.orden ?? 999999)
        })
    )
    
    const inactiveCount = computed(() => medias.value.filter((m) => m.status !== 'activo').length)
    
    /* -----------------------------
       Helpers
    ------------------------------ */
    function getImageUrl(media: ProductoMedia): string {
      if (!media?.url) return ''
      if (media.url.startsWith('http')) return media.url
      return `/storage/${media.url.replace(/^storage\//, '')}`
    }
    
    function openPicker(): void {
      if (isUploading.value || isBusy.value) return
      fileInputRef.value?.click()
    }
    
    function toastOk(title: string, text?: string) {
      Swal.fire({
        icon: 'success',
        title,
        text,
        timer: 1400,
        showConfirmButton: false,
      })
    }
    
    function toastErr(title: string, text?: string) {
      Swal.fire({
        icon: 'error',
        title,
        text,
      })
    }
    
    /* -----------------------------
       Upload (este es tu “truco”, intacto)
    ------------------------------ */
    function handleFileSelect(e: Event): void {
      const input = e.target as HTMLInputElement
      if (!input.files || input.files.length === 0) return
      uploadFiles(input.files)
      input.value = ''
    }
    
    function uploadFiles(files: FileList): void {
      const formData = new FormData()
      Array.from(files).forEach((file) => formData.append('files[]', file))
    
      isUploading.value = true
    
      router.post(`/productos/${props.productoId}/media`, formData, {
        preserveScroll: true,
        preserveState: true,
        forceFormData: true,
        onSuccess: () => {
          toastOk('Listo', 'Imágenes subidas correctamente.')
          emit('media-updated') // el padre debe refrescar el producto si quiere
        },
        onError: (errors: any) => {
          // si backend manda errores de validación, acá cae
          const msg =
            (errors && (errors.message || errors.error)) ||
            'No se pudieron subir las imágenes. Revisa formato/tamaño.'
          toastErr('Error', msg)
        },
        onFinish: () => {
          isUploading.value = false
          isDragActive.value = false
        },
      })
    }
    
    /* -----------------------------
       Orden
    ------------------------------ */
    function updateOrderOptimistic(list: ProductoMedia[]) {
      // Aplica orden local sin esperar backend
      const ids = new Set(list.map((m) => m.id))
      medias.value = medias.value.map((m) => {
        if (m.status !== 'activo' || !ids.has(m.id)) return m
        const idx = list.findIndex((x) => x.id === m.id)
        return idx >= 0 ? { ...m, orden: idx + 1 } : m
      })
    }
    
    function updateOrder(): void {
      if (isUploading.value || isBusy.value) return
    
      // ordenes SOLO de activas (ya ordenadas)
      const ordenes = activeMedias.value.map((media, index) => ({
        id: media.id,
        orden: index + 1,
      }))
    
      isBusy.value = true
    
      router.post(
        `/productos/${props.productoId}/media/order`,
        { ordenes },
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            toastOk('OK', 'Orden actualizado.')
            emit('media-updated')
          },
          onError: () => toastErr('Error', 'No se pudo actualizar el orden.'),
          onFinish: () => (isBusy.value = false),
        }
      )
    }
    
    /* -----------------------------
       Principal
    ------------------------------ */
    function setMain(mediaId: number): void {
      if (isUploading.value || isBusy.value) return
      isBusy.value = true
    
      // Optimistic UI: marcamos principal local
      medias.value = medias.value.map((m) => ({ ...m, principal: m.id === mediaId }))
    
      router.post(
        `/productos/${props.productoId}/media/${mediaId}/main`,
        {},
        {
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            toastOk('OK', 'Imagen principal actualizada.')
            emit('media-updated')
          },
          onError: () => {
            toastErr('Error', 'No se pudo establecer la imagen principal.')
            // rollback básico: pedimos refresh al padre
            emit('media-updated')
          },
          onFinish: () => (isBusy.value = false),
        }
      )
    }
    
    /* -----------------------------
       Delete (soft)
    ------------------------------ */
    async function deleteMedia(mediaId: number): Promise<void> {
      if (isUploading.value || isBusy.value) return
    
      const result = await Swal.fire({
        title: 'Desactivar imagen',
        text: 'La imagen se marcará como inactiva.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, desactivar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true,
      })
    
      if (!result.isConfirmed) return
    
      isBusy.value = true
    
      // Optimistic UI: la quitamos del grid de activas sin cerrar modal
      medias.value = medias.value.map((m) =>
        m.id === mediaId ? { ...m, status: 'inactivo', principal: false } : m
      )
    
      router.delete(`/productos/${props.productoId}/media/${mediaId}`, {
        preserveScroll: true,
        preserveState: true,
        onSuccess: () => {
          toastOk('Hecho', 'Imagen desactivada.')
          emit('media-updated')
        },
        onError: () => {
          toastErr('Error', 'No se pudo desactivar la imagen.')
          // rollback: refrescamos desde padre para rehacer estado real
          emit('media-updated')
        },
        onFinish: () => (isBusy.value = false),
      })
    }
    
    /* -----------------------------
       Drag & Drop (solo activas)
    ------------------------------ */
    function onDragStart(index: number): void {
      if (isUploading.value || isBusy.value) return
      draggingIndex.value = index
    }
    
    function onDragOver(event: DragEvent): void {
      event.preventDefault()
    }
    
    function onDrop(index: number): void {
      if (draggingIndex.value === null) return
    
      const list = activeMedias.value.slice()
      const dragged = list[draggingIndex.value]
      if (!dragged) return
    
      list.splice(draggingIndex.value, 1)
      list.splice(index, 0, dragged)
    
      // reconstruir medias: activas en nuevo orden + inactivas
      const inactive = medias.value.filter((m) => m.status !== 'activo')
      medias.value = [...list.map((m, idx) => ({ ...m, orden: idx + 1 })), ...inactive]
    
      draggingIndex.value = null
    
      // Optimistic + persist
      updateOrder()
    }
    
    /* -----------------------------
       Move up/down
    ------------------------------ */
    function moveUp(index: number): void {
      if (index <= 0) return
      const list = activeMedias.value.slice()
      ;[list[index - 1], list[index]] = [list[index], list[index - 1]]
    
      const inactive = medias.value.filter((m) => m.status !== 'activo')
      medias.value = [...list.map((m, idx) => ({ ...m, orden: idx + 1 })), ...inactive]
    
      updateOrder()
    }
    
    function moveDown(index: number): void {
      const list = activeMedias.value.slice()
      if (index >= list.length - 1) return
      ;[list[index], list[index + 1]] = [list[index + 1], list[index]]
    
      const inactive = medias.value.filter((m) => m.status !== 'activo')
      medias.value = [...list.map((m, idx) => ({ ...m, orden: idx + 1 })), ...inactive]
    
      updateOrder()
    }
    
    /* -----------------------------
       Drag & drop upload (zona)
    ------------------------------ */
    function onDropFiles(ev: DragEvent): void {
      ev.preventDefault()
      isDragActive.value = false
      if (isUploading.value || isBusy.value) return
      const files = ev.dataTransfer?.files
      if (!files || files.length === 0) return
      uploadFiles(files)
    }
    
    function onDragEnter(ev: DragEvent): void {
      ev.preventDefault()
      if (isUploading.value || isBusy.value) return
      isDragActive.value = true
    }
    
    function onDragLeave(ev: DragEvent): void {
      ev.preventDefault()
      isDragActive.value = false
    }
    </script>
    
    <template>
      <div class="space-y-6">
        <!-- Zona upload -->
        <div
          class="rounded-2xl border-2 border-dashed p-6 sm:p-8 transition-all"
          :class="isDragActive
            ? 'border-emerald-400 bg-emerald-50/70 dark:bg-emerald-500/10'
            : 'border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/50'"
          @dragenter="onDragEnter"
          @dragover="onDragOver"
          @dragleave="onDragLeave"
          @drop="onDropFiles"
        >
          <input
            ref="fileInputRef"
            type="file"
            class="hidden"
            multiple
            accept="image/*"
            :disabled="isUploading || isBusy"
            @change="handleFileSelect"
          />
    
          <div class="flex flex-col items-center justify-center gap-4 text-center">
            <div
              class="h-14 w-14 sm:h-16 sm:w-16 rounded-full flex items-center justify-center"
              :class="isUploading ? 'bg-slate-200 dark:bg-slate-800' : 'bg-emerald-100 dark:bg-emerald-900/30'"
            >
              <Loader2 v-if="isUploading" class="h-7 w-7 animate-spin text-slate-700 dark:text-slate-300" />
              <Upload v-else class="h-7 w-7 sm:h-8 sm:w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
    
            <div class="space-y-1">
              <p class="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                Arrastra y suelta imágenes aquí
              </p>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                O selecciona archivos desde tu equipo
              </p>
              <p class="text-xs text-slate-500 dark:text-slate-500">
                JPEG, PNG, JPG, GIF, WEBP. Máx 5MB
              </p>
              <p v-if="inactiveCount" class="text-xs text-slate-500 dark:text-slate-400">
                Inactivas: {{ inactiveCount }} (no se muestran)
              </p>
            </div>
    
            <button
              type="button"
              class="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-extrabold text-white
                     bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all active:scale-[0.98]"
              :disabled="isUploading || isBusy"
              @click="openPicker"
            >
              <Upload class="h-4 w-4" />
              <span>{{ isUploading ? 'Subiendo...' : 'Seleccionar imágenes' }}</span>
            </button>
          </div>
        </div>
    
        <!-- Grid activas -->
        <div v-if="activeMedias.length" class="space-y-4">
          <div class="flex items-end justify-between gap-3">
            <h3 class="text-lg font-black text-slate-900 dark:text-slate-100">
              Imágenes activas ({{ activeMedias.length }})
            </h3>
          </div>
    
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <div
              v-for="(media, index) in activeMedias"
              :key="media.id"
              class="relative group overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/40
                     hover:shadow-2xl hover:border-emerald-200 dark:hover:border-emerald-700 transition-all"
              draggable="true"
              @dragstart="onDragStart(index)"
              @dragover="onDragOver"
              @drop="onDrop(index)"
            >
              <div class="aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                <img
                  :src="getImageUrl(media)"
                  :alt="`Imagen ${index + 1}`"
                  class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  @error="(e: any) => { if (e?.target) e.target.style.display = 'none' }"
                />
    
                <div
                  v-if="media.principal"
                  class="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-emerald-500 text-white px-2 py-1 text-xs font-extrabold"
                >
                  <Star class="h-3 w-3" />
                  Principal
                </div>
    
                <div class="absolute top-3 right-3 h-7 w-7 rounded-full bg-slate-900/70 text-white text-xs font-extrabold flex items-center justify-center">
                  {{ index + 1 }}
                </div>
              </div>
    
              <div class="p-3 border-t border-slate-100 dark:border-slate-800">
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-move"
                      title="Arrastrar para reordenar"
                    >
                      <GripVertical class="h-4 w-4" />
                    </button>
    
                    <button
                      v-if="!media.principal"
                      type="button"
                      class="p-1 text-slate-400 hover:text-yellow-500 disabled:opacity-40"
                      :disabled="isUploading || isBusy"
                      title="Establecer como principal"
                      @click="setMain(media.id)"
                    >
                      <Star class="h-4 w-4" />
                    </button>
    
                    <div class="flex items-center gap-1">
                      <button
                        type="button"
                        class="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                        :disabled="index === 0 || isUploading || isBusy"
                        title="Subir"
                        @click="moveUp(index)"
                      >
                        <ArrowUp class="h-4 w-4" />
                      </button>
    
                      <button
                        type="button"
                        class="p-1 text-slate-400 hover:text-emerald-600 disabled:opacity-30"
                        :disabled="index === activeMedias.length - 1 || isUploading || isBusy"
                        title="Bajar"
                        @click="moveDown(index)"
                      >
                        <ArrowDown class="h-4 w-4" />
                      </button>
                    </div>
                  </div>
    
                  <button
                    type="button"
                    class="p-1 text-slate-400 hover:text-rose-500 disabled:opacity-40"
                    :disabled="isUploading || isBusy"
                    title="Desactivar"
                    @click="deleteMedia(media.id)"
                  >
                    <Trash2 class="h-4 w-4" />
                  </button>
                </div>
    
                <div class="mt-2 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
                  <span class="capitalize inline-flex items-center gap-1">
                    <ImageIcon class="h-3.5 w-3.5" />
                    {{ media.tipo }}
                  </span>
                  <span>Orden: {{ media.orden }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Empty -->
        <div v-else class="text-center py-10 sm:py-12">
          <div class="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <EyeOff class="h-8 w-8 sm:h-10 sm:w-10 text-slate-400" />
          </div>
          <p class="text-base sm:text-lg font-extrabold text-slate-700 dark:text-slate-200">
            No hay imágenes activas
          </p>
          <p class="text-sm text-slate-500 dark:text-slate-500">
            Sube imágenes usando el panel superior.
          </p>
        </div>
      </div>
    </template>
    
    <style scoped>
    [draggable="true"] { cursor: grab; }
    [draggable="true"]:active { cursor: grabbing; }
    </style>
    