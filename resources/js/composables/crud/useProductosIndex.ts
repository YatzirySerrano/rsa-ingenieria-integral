import { computed, ref, watch } from 'vue'
import { router, useForm, usePage } from '@inertiajs/vue3'
import type { AppPageProps } from '@/types'
import type { Paginated } from '@/types/pagination'
import type { Producto, Status, MarcaLite, CategoriaLite, ProductoMedia } from '@/types/catalogo'
import { useSwal } from './useSwal'

/**
 * Props extra esperadas desde Inertia::render('Productos/Index', ...)
 */
type ProductosExtraProps = {
  filters: { q: string; status: string }
  productos: Paginated<Producto> | any // el backend actual puede mandar data "doble"
  marcas: MarcaLite[] | any
  categorias: CategoriaLite[] | any
}

/**
 * Endpoints SIN Ziggy (evita `route is not defined`).
 * Laravel ya tiene exactamente estas rutas en web.php.
 */
const endpoints = {
  index: '/productos',
  store: '/productos',
  update: (id: number) => `/productos/${id}`,
  destroy: (id: number) => `/productos/${id}`,
  mediaStore: (productoId: number) => `/productos/${productoId}/media`,
  mediaDestroy: (productoId: number, mediaId: number) => `/productos/${productoId}/media/${mediaId}`,
}

/**
 * Normaliza un "Paginated" que a veces llega como:
 * - productos.data = [{...}, {...}]
 * o (por el Resource::collection envuelto en 'data'):
 * - productos.data = { data: [{...}, {...}] }
 */
function normalizePaginated(raw: any): Paginated<Producto> {
  const safe = raw ?? {}

  // data puede venir como array o como objeto { data: [...] }
  const data = Array.isArray(safe.data) ? safe.data : Array.isArray(safe.data?.data) ? safe.data.data : []

  // links/meta normalmente vienen bien, pero los defendemos
  const links = Array.isArray(safe.links) ? safe.links : []
  const meta = safe.meta ?? { current_page: 1, last_page: 1, total: 0 }

  return { data, links, meta }
}

/** Normaliza arrays que a veces pueden venir como { data: [...] } */
function normalizeArray<T = any>(raw: any): T[] {
  if (Array.isArray(raw)) return raw
  if (Array.isArray(raw?.data)) return raw.data
  return []
}

export function useProductosIndex() {
  const page = usePage<AppPageProps & Partial<ProductosExtraProps>>()
  const { confirmDelete, toastSuccess, toastError, showInfo } = useSwal()

  /**
   * Computeds normalizados (evitan TS errors + evitan render crashes)
   */
  const filters = computed(() => page.props.filters ?? { q: '', status: 'activo' })
  const productos = computed(() => normalizePaginated((page.props as any).productos))
  const marcas = computed<MarcaLite[]>(() => normalizeArray<MarcaLite>((page.props as any).marcas))
  const categorias = computed<CategoriaLite[]>(() => normalizeArray<CategoriaLite>((page.props as any).categorias))

  /**
   * Filtros locales (sin que se vuelvan [object Object])
   */
  const q = ref<string>(filters.value.q ?? '')
  const status = ref<(Status | 'todos')>((filters.value.status as any) ?? 'activo')

  // Si Inertia cambia props por navegación, sincronizamos inputs
  watch(
    filters,
    (f) => {
      q.value = f?.q ?? ''
      status.value = (f?.status as any) ?? 'activo'
    },
    { immediate: false }
  )

  function applyFilters() {
    router.get(
      endpoints.index,
      { q: q.value, status: status.value },
      { preserveState: true, preserveScroll: true, replace: true }
    )
  }

  function resetFilters() {
    q.value = ''
    status.value = 'activo'
    applyFilters()
  }

  /**
   * Modal Create/Edit
   */
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
    // reset REAL (evita que se quede "Editar")
    isEditing.value = false
    editingId.value = null
    form.reset()
    form.clearErrors()
    form.status = 'activo'
    modalOpen.value = true

    // también reseteamos media para que no "arrastre" del edit anterior
    resetMediaForm()
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
    form.stock = Number(p.stock ?? 0)
    form.costo_lista = Number(p.costo_lista ?? 0)
    form.precio_venta = Number(p.precio_venta ?? 0)
    form.status = p.status

    modalOpen.value = true
    resetMediaForm()
  }

  function closeModal() {
    modalOpen.value = false
  }

  function submit() {
    if (isEditing.value && editingId.value) {
      form.put(endpoints.update(editingId.value), {
        preserveScroll: true,
        onSuccess: async () => {
          modalOpen.value = false
          await toastSuccess('Producto actualizado')
        },
        onError: async () => toastError('Revisa los campos'),
      })
      return
    }

    form.post(endpoints.store, {
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

    router.delete(endpoints.destroy(p.id), {
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

  /**
   * Media (solo habilitar cuando hay producto existente)
   */
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

  const canAddMedia = computed(() => {
    return Boolean(isEditing.value && editingId.value && !mediaForm.processing)
  })

  function addMedia() {
    if (!editingId.value) return
    mediaForm.post(endpoints.mediaStore(editingId.value), {
      preserveScroll: true,
      onSuccess: async () => {
        resetMediaForm()
        await toastSuccess('Media agregada')
      },
      onError: async () => toastError('Revisa URL/tipo'),
    })
  }

  async function removeMedia(media: ProductoMedia) {
    if (!editingId.value) return
    const ok = await confirmDelete(`Media #${media.id}`)
    if (!ok) return

    router.delete(endpoints.mediaDestroy(editingId.value, media.id), {
      preserveScroll: true,
      onSuccess: async () => toastSuccess('Media desactivada'),
      onError: async () => toastError('No se pudo desactivar'),
    })
  }

  return {
    // data
    productos,
    marcas,
    categorias,

    // filtros
    q,
    status,
    applyFilters,
    resetFilters,

    // modal + crud
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

    // media
    mediaForm,
    canAddMedia,
    addMedia,
    removeMedia,
    resetMediaForm,
  }
}
