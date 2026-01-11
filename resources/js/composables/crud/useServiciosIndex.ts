import { ref } from 'vue'
import { router, useForm, usePage } from '@inertiajs/vue3'

import type { Paginated } from '@/types/pagination'
import type { Servicio, Status, CategoriaLite } from '@/types/catalogo'
import type { AppPageProps } from '@/types'

import { useSwal } from './useSwal'

type ServiciosExtraProps = {
  filters: { q: string; status: string }
  servicios: Paginated<Servicio>
  categorias: CategoriaLite[]
}

export function useServiciosIndex() {
  // ✅ page.props ya es reactivo; lo desempaquetamos a constantes “usables en template”
  const page = usePage<AppPageProps & ServiciosExtraProps>()
  const { confirmDelete, toastSuccess, toastError, showInfo } = useSwal()

  // ✅ Props “listas” para template (sin .value)
  const filters = page.props.filters
  const servicios = page.props.servicios
  const categorias = page.props.categorias

  // Filtros
  const q = ref(filters?.q ?? '')
  const status = ref<(Status | 'todos')>((filters?.status as any) ?? 'activo')

  function applyFilters() {
    router.get(
      route('servicios.index'),
      { q: q.value, status: status.value },
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  function resetFilters() {
    q.value = ''
    status.value = 'activo'
    applyFilters()
  }

  // Modal create/edit
  const modalOpen = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const form = useForm({
    categoria_id: null as number | null,
    nombre: '',
    descripcion: '' as string | null,
    precio: 0,
    status: 'activo' as Status,
  })

  function openCreate() {
    isEditing.value = false
    editingId.value = null
    form.reset()
    form.clearErrors()
    form.status = 'activo'
    modalOpen.value = true
  }

  function openEdit(s: Servicio) {
    isEditing.value = true
    editingId.value = s.id
    form.clearErrors()

    form.categoria_id = s.categoria?.id ?? null
    form.nombre = s.nombre
    form.descripcion = s.descripcion ?? ''
    form.precio = Number(s.precio)
    form.status = s.status

    modalOpen.value = true
  }

  function closeModal() {
    modalOpen.value = false
  }

  function submit() {
    if (isEditing.value && editingId.value) {
      form.put(route('servicios.update', editingId.value), {
        preserveScroll: true,
        onSuccess: async () => {
          modalOpen.value = false
          await toastSuccess('Servicio actualizado')
        },
        onError: async () => toastError('Revisa los campos'),
      })
      return
    }

    form.post(route('servicios.store'), {
      preserveScroll: true,
      onSuccess: async () => {
        modalOpen.value = false
        await toastSuccess('Servicio creado')
      },
      onError: async () => toastError('Revisa los campos'),
    })
  }

  async function remove(s: Servicio) {
    const ok = await confirmDelete(s.nombre)
    if (!ok) return

    router.delete(route('servicios.destroy', s.id), {
      preserveScroll: true,
      onSuccess: async () => toastSuccess('Servicio desactivado'),
      onError: async () => toastError('No se pudo desactivar'),
    })
  }

  async function view(s: Servicio) {
    const categoria = s.categoria?.nombre ?? '—'
    const html = `
      <div style="text-align:left">
        <div><b>Nombre:</b> ${s.nombre}</div>
        <div><b>Categoría:</b> ${categoria}</div>
        <div><b>Precio:</b> $${s.precio}</div>
        <div><b>Status:</b> ${s.status}</div>
        <div style="margin-top:8px"><b>Descripción:</b><br/>${s.descripcion ?? '—'}</div>
      </div>
    `
    await showInfo('Detalle de servicio', html)
  }

  return {
    // ✅ ya no existe ui.props.servicios, ahora es ui.servicios
    filters,
    servicios,
    categorias,

    q,
    status,
    applyFilters,
    resetFilters,

    modalOpen,
    isEditing,
    editingId,

    form,
    openCreate,
    openEdit,
    closeModal,
    submit,
    remove,
    view,
  }
}
