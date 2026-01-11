import { computed, ref } from 'vue'
import { router, useForm, usePage } from '@inertiajs/vue3'
import type { Paginated } from '@/types/pagination'
import type { Producto, Status, MarcaLite, CategoriaLite, ProductoMedia } from '@/types/catalogo'
import type { AppPageProps } from '@/types'
import { useSwal } from './useSwal'

type ProductosExtraProps = {
  filters: { q: string; status: string }
  productos: Paginated<Producto>
  marcas: MarcaLite[]
  categorias: CategoriaLite[]
}

export function useProductosIndex() {
  const page = usePage<AppPageProps & ProductosExtraProps>()
  const { confirmDelete, toastSuccess, toastError, showInfo } = useSwal()

  const props = computed(() => page.props)

  // filtros
  const q = ref(props.value.filters?.q ?? '')
  const status = ref<(Status | 'todos')>((props.value.filters?.status as any) ?? 'activo')

  function applyFilters() {
    router.get(
      route('productos.index'),
      { q: q.value, status: status.value },
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  function resetFilters() {
    q.value = ''
    status.value = 'activo'
    applyFilters()
  }

  // modal create/edit
  const modalOpen = ref(false)
  const isEditing = ref(false)
  const editingId = ref<number | null>(null)

  const form = useForm({
    marca_id: null as number | null,
    categoria_id: null as number | null,
    sku: '',
    nombre: '',
    descripcion: '' as string | null,
    stock: 0,
    costo_lista: 0,
    precio_venta: 0,
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

  function openEdit(p: Producto) {
    isEditing.value = true
    editingId.value = p.id
    form.clearErrors()
    form.marca_id = p.marca?.id ?? null
    form.categoria_id = p.categoria?.id ?? null
    form.sku = p.sku
    form.nombre = p.nombre
    form.descripcion = p.descripcion ?? ''
    form.stock = p.stock
    form.costo_lista = Number(p.costo_lista)
    form.precio_venta = Number(p.precio_venta)
    form.status = p.status
    modalOpen.value = true
  }

  function closeModal() {
    modalOpen.value = false
  }

  function submit() {
    if (isEditing.value && editingId.value) {
      form.put(route('productos.update', editingId.value), {
        preserveScroll: true,
        onSuccess: async () => {
          modalOpen.value = false
          await toastSuccess('Producto actualizado')
        },
        onError: async () => toastError('Revisa los campos'),
      })
      return
    }

    form.post(route('productos.store'), {
      preserveScroll: true,
      onSuccess: async () => {
        modalOpen.value = false
        await toastSuccess('Producto creado')
      },
      onError: async () => toastError('Revisa los campos'),
    })
  }

  async function remove(p: Producto) {
    const ok = await confirmDelete(`${p.sku} — ${p.nombre}`)
    if (!ok) return

    router.delete(route('productos.destroy', p.id), {
      preserveScroll: true,
      onSuccess: async () => toastSuccess('Producto desactivado'),
      onError: async () => toastError('No se pudo desactivar'),
    })
  }

  async function view(p: Producto) {
    const marca = p.marca?.nombre ?? '—'
    const categoria = p.categoria?.nombre ?? '—'
    const html = `
      <div style="text-align:left">
        <div><b>SKU:</b> ${p.sku}</div>
        <div><b>Nombre:</b> ${p.nombre}</div>
        <div><b>Marca:</b> ${marca}</div>
        <div><b>Categoría:</b> ${categoria}</div>
        <div><b>Stock:</b> ${p.stock}</div>
        <div><b>Costo lista:</b> $${p.costo_lista}</div>
        <div><b>Precio venta:</b> $${p.precio_venta}</div>
        <div><b>Status:</b> ${p.status}</div>
        <div style="margin-top:8px"><b>Descripción:</b><br/>${p.descripcion ?? '—'}</div>
      </div>
    `
    await showInfo('Detalle de producto', html)
  }

  // Media
  const mediaForm = useForm({
    tipo: 'imagen' as 'imagen' | 'video',
    url: '',
    orden: 1,
    principal: false,
    status: 'activo' as Status,
  })

  function resetMediaForm() {
    mediaForm.reset()
    mediaForm.clearErrors()
    mediaForm.tipo = 'imagen'
    mediaForm.orden = 1
    mediaForm.principal = false
    mediaForm.status = 'activo'
  }

  function addMedia(productoId: number) {
    mediaForm.post(route('productos.media.store', productoId), {
      preserveScroll: true,
      onSuccess: async () => {
        resetMediaForm()
        await toastSuccess('Media agregada')
      },
      onError: async () => toastError('Revisa URL/tipo'),
    })
  }

  async function removeMedia(productoId: number, media: ProductoMedia) {
    const ok = await confirmDelete(`Media #${media.id}`)
    if (!ok) return

    router.delete(route('productos.media.destroy', { producto: productoId, media: media.id }), {
      preserveScroll: true,
      onSuccess: async () => toastSuccess('Media desactivada'),
      onError: async () => toastError('No se pudo desactivar'),
    })
  }

  return {
    props,
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

    mediaForm,
    addMedia,
    removeMedia,
    resetMediaForm,
  }
}
