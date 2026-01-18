<!-- 
  COMPONENTE: ProductoMediaManager.vue
  ====================================
  
  Descripción:
  - Componente para gestionar imágenes de productos
  - Funcionalidades: Subir, eliminar, establecer como principal, reordenar
  - Vista previa de imágenes y organización visual
  
  Autor: [Tu nombre aquí]
  Fecha: [Fecha actual]
  Versión: 1.0
-->

<template>
  <div class="media-manager">
    <!-- Encabezado -->
    <div class="mb-6">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">Imágenes del Producto</h3>
      <p class="text-sm text-gray-500 dark:text-gray-400">
        Sube y organiza las imágenes del producto. Puedes arrastrar las imágenes para cambiar el orden.
      </p>
    </div>

    <!-- Botón para subir imágenes -->
    <div class="mb-4">
      <input
        type="file"
        ref="fileInput"
        class="hidden"
        accept="image/*"
        multiple
        @change="handleFileSelect"
      />
      <Button
        type="button"
        variant="outline"
        class="gap-2 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        @click="$refs.fileInput.click()"
      >
        <Upload class="h-4 w-4" />
        Subir imágenes
      </Button>
      <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Formatos permitidos: JPG, PNG, WebP. Máx. 5MB por imagen.
      </p>
    </div>

    <!-- Grid de imágenes -->
    <div v-if="medias.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <div
        v-for="(media, index) in medias"
        :key="media.id"
        class="relative group"
        draggable="true"
        @dragstart="handleDragStart(index)"
        @dragover.prevent="handleDragOver(index)"
        @drop="handleDrop(index)"
        @dragenter.prevent
        @dragleave.prevent
      >
        <!-- Contenedor de imagen -->
        <div
          class="relative aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 transition-all duration-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10"
        >
          <!-- Imagen -->
          <img
            :src="getImageUrl(media.url)"
            :alt="`Imagen ${index + 1}`"
            class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            @error="handleImageError"
            @click="previewImageModal(media.url)"
          />
          
          <!-- Overlay de acciones -->
          <div
            class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2"
          >
            <!-- Botón para establecer como principal -->
            <Button
              v-if="!media.principal"
              type="button"
              size="sm"
              variant="secondary"
              class="bg-white/90 hover:bg-white transition-all duration-200 hover:scale-110"
              @click.stop="setAsMain(media)"
              title="Establecer como principal"
            >
              <Star class="h-3 w-3" />
            </Button>
            
            <!-- Botón para eliminar -->
            <Button
              type="button"
              size="sm"
              variant="destructive"
              class="bg-red-500/90 hover:bg-red-500 text-white transition-all duration-200 hover:scale-110"
              @click.stop="deleteMedia(media)"
              title="Eliminar imagen"
            >
              <Trash2 class="h-3 w-3" />
            </Button>
          </div>

          <!-- Indicador de imagen principal -->
          <div
            v-if="media.principal"
            class="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-500/30"
          >
            Principal
          </div>

          <!-- Ícono de arrastre -->
          <div
            class="absolute top-2 right-2 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
            title="Arrastrar para reordenar"
          >
            <GripVertical class="h-4 w-4" />
          </div>
          
          <!-- Número de orden -->
          <div
            class="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center"
          >
            {{ media.orden }}
          </div>
        </div>

        <!-- Controles de orden -->
        <div class="mt-2">
          <label class="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
            Orden
          </label>
          <div class="flex items-center gap-2">
            <Button
              v-if="index > 0"
              type="button"
              size="sm"
              variant="outline"
              class="h-6 w-6 p-0"
              @click="moveUp(index)"
              title="Mover arriba"
            >
              ↑
            </Button>
            
            <input
              type="number"
              v-model="media.orden"
              min="1"
              :max="medias.length"
              class="w-full px-2 py-1 text-sm border rounded dark:bg-gray-800 dark:border-gray-700 text-center"
              @change="updateOrder(media)"
            />
            
            <Button
              v-if="index < medias.length - 1"
              type="button"
              size="sm"
              variant="outline"
              class="h-6 w-6 p-0"
              @click="moveDown(index)"
              title="Mover abajo"
            >
              ↓
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado vacío -->
    <div
      v-else
      class="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg transition-all duration-200 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-gray-50 dark:hover:bg-gray-900/50"
    >
      <Image class="h-12 w-12 mx-auto text-gray-400 dark:text-gray-600" />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        No hay imágenes para este producto
      </p>
      <p class="mt-1 text-xs text-gray-400 dark:text-gray-500">
        Haz clic en "Subir imágenes" para agregar algunas
      </p>
    </div>

    <!-- Modal de vista previa -->
    <div
      v-if="previewModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
      @click.self="previewModal = false"
    >
      <div class="relative max-w-4xl max-h-[90vh] w-full">
        <!-- Botón para cerrar -->
        <Button
          type="button"
          variant="secondary"
          size="sm"
          class="absolute top-4 right-4 z-10 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20"
          @click="previewModal = false"
        >
          <X class="h-4 w-4" />
        </Button>
        
        <!-- Contenedor de imagen -->
        <div class="bg-black/50 rounded-xl p-2">
          <img
            :src="getImageUrl(previewImage)"
            class="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        </div>
        
        <!-- Navegación -->
        <div class="flex items-center justify-center mt-4 gap-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="text-white border-white/30 hover:bg-white/10"
            @click="prevImage"
            :disabled="currentPreviewIndex === 0"
          >
            ← Anterior
          </Button>
          
          <span class="text-sm text-white/80">
            {{ currentPreviewIndex + 1 }} / {{ medias.length }}
          </span>
          
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="text-white border-white/30 hover:bg-white/10"
            @click="nextImage"
            :disabled="currentPreviewIndex === medias.length - 1"
          >
            Siguiente →
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { router } from '@inertiajs/vue3'
import { Upload, Trash2, Star, GripVertical, Image, X } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import Swal from 'sweetalert2'

interface ProductoMedia {
  id: number
  producto_id: number
  tipo: string
  url: string
  orden: number
  principal: boolean
  status: string
}

interface Props {
  productoId: number
  initialMedias?: ProductoMedia[]
}

const props = defineProps<Props>()
const emit = defineEmits(['media-updated'])

// ============================================================================
// ESTADOS REACTIVOS
// ============================================================================

const medias = ref<ProductoMedia[]>(props.initialMedias || [])
const fileInput = ref<HTMLInputElement>()
const previewModal = ref(false)
const previewImage = ref('')
const currentPreviewIndex = ref(0)
const draggedItemIndex = ref<number | null>(null)

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

/**
 * Obtiene la URL completa de una imagen
 */
const getImageUrl = (path: string): string => {
  if (path.startsWith('http')) return path
  return `/storage/${path}`
}

/**
 * Maneja errores al cargar imágenes
 */
const handleImageError = (event: Event): void => {
  const img = event.target as HTMLImageElement
  img.src = '/images/placeholder.jpg'
}

// ============================================================================
// FUNCIONES DE DRAG & DROP (SIMPLE)
// ============================================================================

/**
 * Inicia el arrastre de un elemento
 */
const handleDragStart = (index: number): void => {
  draggedItemIndex.value = index
}

/**
 * Maneja el evento dragover
 */
const handleDragOver = (index: number): void => {
  // Solo para permitir el drop
}

/**
 * Maneja el evento drop para reordenar
 */
const handleDrop = (index: number): void => {
  if (draggedItemIndex.value === null || draggedItemIndex.value === index) return
  
  // Mover elemento
  const movedItem = medias.value.splice(draggedItemIndex.value, 1)[0]
  medias.value.splice(index, 0, movedItem)
  
  // Actualizar órdenes
  updateAllOrders()
  
  // Resetear índice arrastrado
  draggedItemIndex.value = null
}

/**
 * Mueve una imagen hacia arriba
 */
const moveUp = (index: number): void => {
  if (index <= 0) return
  
  const temp = medias.value[index]
  medias.value[index] = medias.value[index - 1]
  medias.value[index - 1] = temp
  
  updateAllOrders()
}

/**
 * Mueve una imagen hacia abajo
 */
const moveDown = (index: number): void => {
  if (index >= medias.value.length - 1) return
  
  const temp = medias.value[index]
  medias.value[index] = medias.value[index + 1]
  medias.value[index + 1] = temp
  
  updateAllOrders()
}

/**
 * Actualiza todos los órdenes después de reordenar
 */
const updateAllOrders = async (): Promise<void> => {
  medias.value.forEach((media, index) => {
    media.orden = index + 1
  })
  
  // Enviar al servidor
  await saveNewOrder()
}

// ============================================================================
// FUNCIONES PARA GUARDAR EN SERVIDOR
// ============================================================================

/**
 * Guarda el nuevo orden en el servidor
 */
const saveNewOrder = async (): Promise<void> => {
  try {
    const ordenes = medias.value.map(m => ({ id: m.id, orden: m.orden }))
    
    await router.put(`/productos/${props.productoId}/media/orden`, { ordenes }, {
      preserveScroll: true,
      onSuccess: () => {
        emit('media-updated')
      },
      onError: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el orden de las imágenes',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    })
  } catch (error) {
    console.error('Error saving order:', error)
    Swal.fire({
      title: 'Error',
      text: 'Error al guardar el orden',
      icon: 'error',
      confirmButtonText: 'OK'
    })
  }
}

// ============================================================================
// FUNCIONES DE SUBIDA DE ARCHIVOS
// ============================================================================

/**
 * Maneja la selección de archivos
 */
const handleFileSelect = async (event: Event): Promise<void> => {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const formData = new FormData()
  Array.from(input.files).forEach(file => {
    // Validar tipo de archivo
    if (isValidImageFile(file)) {
      formData.append('files[]', file)
    }
  })

  try {
    await router.post(`/productos/${props.productoId}/media`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        emit('media-updated')
        Swal.fire({
          title: 'Éxito',
          text: 'Imágenes subidas correctamente',
          icon: 'success',
          confirmButtonText: 'OK'
        })
        input.value = ''
      },
      onError: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudieron subir las imágenes',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    })
  } catch (error) {
    console.error('Upload error:', error)
    Swal.fire({
      title: 'Error',
      text: 'Error al subir las imágenes',
      icon: 'error',
      confirmButtonText: 'OK'
    })
  }
}

/**
 * Valida si un archivo es una imagen válida
 */
const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp']
  const maxSize = 5 * 1024 * 1024 // 5MB
  
  if (!validTypes.includes(file.type)) {
    Swal.fire({
      title: 'Tipo no válido',
      text: `El archivo ${file.name} no es una imagen válida`,
      icon: 'warning',
      confirmButtonText: 'OK'
    })
    return false
  }
  
  if (file.size > maxSize) {
    Swal.fire({
      title: 'Archivo muy grande',
      text: `El archivo ${file.name} excede el tamaño máximo de 5MB`,
      icon: 'warning',
      confirmButtonText: 'OK'
    })
    return false
  }
  
  return true
}

// ============================================================================
// FUNCIONES DE GESTIÓN DE IMÁGENES
// ============================================================================

/**
 * Elimina una imagen
 */
const deleteMedia = async (media: ProductoMedia): Promise<void> => {
  const result = await Swal.fire({
    title: '¿Eliminar imagen?',
    text: 'Esta acción no se puede deshacer',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Sí, eliminar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: '#ef4444',
    reverseButtons: true
  })

  if (!result.isConfirmed) return

  try {
    await router.delete(`/productos/${props.productoId}/media/${media.id}`, {
      preserveScroll: true,
      onSuccess: () => {
        // Eliminar localmente
        const index = medias.value.findIndex(m => m.id === media.id)
        if (index !== -1) {
          medias.value.splice(index, 1)
          // Recalcular órdenes
          updateAllOrders()
        }
        emit('media-updated')
        Swal.fire({
          title: 'Eliminada',
          text: 'Imagen eliminada correctamente',
          icon: 'success',
          confirmButtonText: 'OK'
        })
      },
      onError: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar la imagen',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    })
  } catch (error) {
    console.error('Delete error:', error)
    Swal.fire({
      title: 'Error',
      text: 'Error al eliminar la imagen',
      icon: 'error',
      confirmButtonText: 'OK'
    })
  }
}

/**
 * Establece una imagen como principal
 */
const setAsMain = async (media: ProductoMedia): Promise<void> => {
  try {
    await router.put(`/productos/${props.productoId}/media/${media.id}/principal`, {}, {
      preserveScroll: true,
      onSuccess: () => {
        // Actualizar localmente
        medias.value.forEach(m => {
          m.principal = m.id === media.id
        })
        emit('media-updated')
        Swal.fire({
          title: 'Éxito',
          text: 'Imagen principal actualizada',
          icon: 'success',
          confirmButtonText: 'OK'
        })
      },
      onError: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar la imagen principal',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    })
  } catch (error) {
    console.error('Set main error:', error)
    Swal.fire({
      title: 'Error',
      text: 'Error al actualizar la imagen principal',
      icon: 'error',
      confirmButtonText: 'OK'
    })
  }
}

/**
 * Actualiza el orden de una imagen individual
 */
const updateOrder = async (media: ProductoMedia): Promise<void> => {
  // Validar que el orden esté en rango
  if (media.orden < 1) media.orden = 1
  if (media.orden > medias.value.length) media.orden = medias.value.length
  
  // Ordenar array por orden
  medias.value.sort((a, b) => a.orden - b.orden)
  
  try {
    await router.put(`/productos/${props.productoId}/media/${media.id}`, {
      orden: media.orden
    }, {
      preserveScroll: true,
      onSuccess: () => {
        emit('media-updated')
      },
      onError: () => {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo actualizar el orden',
          icon: 'error',
          confirmButtonText: 'OK'
        })
      }
    })
  } catch (error) {
    console.error('Update order error:', error)
    Swal.fire({
      title: 'Error',
      text: 'Error al actualizar el orden',
      icon: 'error',
      confirmButtonText: 'OK'
    })
  }
}

// ============================================================================
// FUNCIONES DE VISTA PREVIA
// ============================================================================

/**
 * Abre el modal de vista previa
 */
const previewImageModal = (url: string): void => {
  const index = medias.value.findIndex(m => m.url === url)
  if (index !== -1) {
    currentPreviewIndex.value = index
    previewImage.value = url
    previewModal.value = true
  }
}

/**
 * Muestra la imagen anterior en el preview
 */
const prevImage = (): void => {
  if (currentPreviewIndex.value > 0) {
    currentPreviewIndex.value--
    previewImage.value = medias.value[currentPreviewIndex.value].url
  }
}

/**
 * Muestra la siguiente imagen en el preview
 */
const nextImage = (): void => {
  if (currentPreviewIndex.value < medias.value.length - 1) {
    currentPreviewIndex.value++
    previewImage.value = medias.value[currentPreviewIndex.value].url
  }
}

// ============================================================================
// CICLO DE VIDA
// ============================================================================

onMounted(() => {
  nextTick(() => {
    // Ordenar imágenes por orden inicial
    medias.value.sort((a, b) => a.orden - b.orden)
  })
})
</script>

<style scoped>
/* Estilos para el efecto de arrastre */
.dragging {
  opacity: 0.5;
  transform: scale(0.95);
}

.drag-over {
  border: 2px dashed #10b981 !important;
  background-color: rgba(16, 185, 129, 0.1) !important;
}

/* Transiciones suaves */
.media-item {
  transition: all 0.2s ease;
}

.media-item:hover {
  transform: translateY(-2px);
}

/* Estilos para scrollbar en modales */
.preview-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(148, 163, 184, 0.3) transparent;
}

.preview-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.preview-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.preview-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.3);
  border-radius: 20px;
}
</style>