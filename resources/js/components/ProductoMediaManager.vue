<script setup lang="ts">
import axios from 'axios'
import Swal from 'sweetalert2'
import { computed, ref, watch } from 'vue'
import { Button } from '@/components/ui/button'
import type { ProductoMedia } from '@/composables/crud/useProductoCrud'

const props = defineProps<{
  productoId: number
  initialMedias: ProductoMedia[]
}>()

const emit = defineEmits<{
  (e: 'media-updated'): void
}>()

function normalizeStorageUrl(url: string) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  if (url.startsWith('/storage/')) return url
  const clean = url.replace(/^\/+/, '')
  return `/storage/${clean}`
}

const medias = ref<ProductoMedia[]>([])

function sortMedias(arr: ProductoMedia[]) {
  return [...arr].sort((a, b) => Number(a.orden ?? 0) - Number(b.orden ?? 0))
}

watch(
  () => props.initialMedias,
  (v) => {
    medias.value = sortMedias(v ?? [])
  },
  { immediate: true, deep: true },
)

const activeCount = computed(() => medias.value.filter((m) => m.status === 'activo').length)

async function confirm(title: string, text: string) {
  return Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: 'Sí',
    cancelButtonText: 'Cancelar',
    reverseButtons: true,
    heightAuto: false,
  })
}

async function uploadFiles(files: File[]) {
  if (!files.length) return
  const fd = new FormData()
  files.forEach((f) => fd.append('files[]', f))

  await axios.post(`/productos/${props.productoId}/medias`, fd, {
    headers: { Accept: 'application/json' },
  })

  emit('media-updated')
}

async function onPick(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  input.value = ''
  try {
    await uploadFiles(files)
    await Swal.fire({ icon: 'success', title: 'Listo', text: 'Imágenes subidas.', heightAuto: false })
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message ?? err?.message ?? 'Error', heightAuto: false })
  }
}

async function setMain(m: ProductoMedia) {
  try {
    await axios.patch(`/productos/${props.productoId}/medias/${m.id}/main`, null, {
      headers: { Accept: 'application/json' },
    })
    emit('media-updated')
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message ?? err?.message ?? 'Error', heightAuto: false })
  }
}

async function toggleMedia(m: ProductoMedia) {
  const res = await confirm('Confirmar', `¿Cambiar estatus de esta imagen?`)
  if (!res.isConfirmed) return

  try {
    await axios.patch(
      `/productos/${props.productoId}/medias/${m.id}`,
      { status: m.status === 'activo' ? 'inactivo' : 'activo' },
      { headers: { Accept: 'application/json' } },
    )
    emit('media-updated')
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message ?? err?.message ?? 'Error', heightAuto: false })
  }
}

async function destroyMedia(m: ProductoMedia) {
  const res = await confirm('Confirmar', '¿Quitar esta imagen?')
  if (!res.isConfirmed) return

  try {
    await axios.delete(`/productos/${props.productoId}/medias/${m.id}`, {
      headers: { Accept: 'application/json' },
    })
    emit('media-updated')
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message ?? err?.message ?? 'Error', heightAuto: false })
  }
}

async function saveOrder() {
  try {
    const ordenes = medias.value.map((m) => ({ id: m.id, orden: Number(m.orden ?? 0) }))
    await axios.patch(
      `/productos/${props.productoId}/medias/order`,
      { ordenes },
      { headers: { Accept: 'application/json' } },
    )
    emit('media-updated')
    await Swal.fire({ icon: 'success', title: 'Listo', text: 'Orden guardado.', heightAuto: false })
  } catch (err: any) {
    await Swal.fire({ icon: 'error', title: 'Error', text: err?.response?.data?.message ?? err?.message ?? 'Error', heightAuto: false })
  }
}
</script>

<template>
  <div class="rounded-xl border border-slate-200 dark:border-slate-800 p-4">
    <div class="flex items-center justify-between gap-3 mb-3">
      <div>
        <div class="font-extrabold">Imágenes</div>
        <div class="text-xs text-slate-500 dark:text-slate-400">
          Activas: {{ activeCount }} | Total: {{ medias.length }}
        </div>
      </div>

      <div class="flex items-center gap-2">
        <Button type="button" variant="outline" size="sm" @click="saveOrder">Guardar orden</Button>

        <label class="inline-flex">
          <input
            type="file"
            multiple
            accept="image/*"
            class="hidden"
            @change="onPick"
          />
          <span
            class="inline-flex items-center justify-center h-9 px-3 rounded-md text-sm font-semibold border border-slate-200 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900"
          >
            Subir imágenes
          </span>
        </label>
      </div>
    </div>

    <div v-if="!medias.length" class="text-sm text-slate-500 dark:text-slate-400">
      Aún no hay imágenes.
    </div>

    <div v-else class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div
        v-for="m in medias"
        :key="m.id"
        class="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        <div class="relative">
          <img :src="normalizeStorageUrl(m.url)" class="h-28 w-full object-cover" />

          <div class="absolute top-2 left-2 flex gap-2">
            <span
              v-if="m.principal"
              class="text-xs font-extrabold px-2 py-1 rounded-full bg-emerald-600 text-white"
            >
              Principal
            </span>
            <span
              class="text-xs font-extrabold px-2 py-1 rounded-full"
              :class="m.status === 'activo'
                ? 'bg-slate-900/70 text-white'
                : 'bg-rose-600 text-white'"
            >
              {{ m.status }}
            </span>
          </div>
        </div>

        <div class="p-3 space-y-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Orden</span>
            <input
              v-model.number="m.orden"
              type="number"
              class="h-8 w-20 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-2 text-sm"
            />
          </div>

          <div class="flex items-center justify-between gap-2">
            <Button type="button" size="sm" variant="outline" @click="setMain(m)">Hacer principal</Button>
            <Button type="button" size="sm" variant="outline" @click="toggleMedia(m)">
              {{ m.status === 'activo' ? 'Desactivar' : 'Activar' }}
            </Button>
          </div>

          <Button type="button" size="sm" variant="destructive" class="w-full" @click="destroyMedia(m)">
            Quitar
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
