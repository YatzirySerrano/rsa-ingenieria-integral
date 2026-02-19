import axios from 'axios'
import Swal from 'sweetalert2'
import { computed, reactive, ref, watch, onBeforeUnmount, proxyRefs } from 'vue'
import { router } from '@inertiajs/vue3'

export type CategoriaTipo = 'PRODUCTO' | 'SERVICIO'
export type Status = 'activo' | 'inactivo'
export type ProductoMediaTipo = 'imagen' | 'video'

export type Marca = { id: number; nombre: string; status: Status }
export type Categoria = { id: number; nombre: string; tipo: CategoriaTipo; status: Status }

export type MarcaLite = Pick<Marca, 'id' | 'nombre'>
export type CategoriaLite = Pick<Categoria, 'id' | 'nombre'>

export type ProductoMedia = {
  id: number
  producto_id: number
  tipo: ProductoMediaTipo
  url: string
  orden: number
  principal: boolean
  status: Status
}

export type Producto = {
  id: number
  marca_id: number | null
  categoria_id: number | null
  sku: string
  nombre: string
  descripcion?: string | null
  stock: number
  costo_lista: number
  precio_venta: number
  status: Status
  marca?: Marca | null
  categoria?: Categoria | null
  medias?: ProductoMedia[]
}

export type ProductoFilters = {
  q: string
  marca_id: string
  categoria_id: string
  status: string
  per_page?: number | string
}

/**
 * IMPORTANTE:
 * Tu backend está usando "__ALL__" (según tu route:list y controller),
 * así que estandarizamos aquí para evitar bugs silenciosos.
 */
export const ALL = '__ALL__' as const

function ensureLeadingSlash(u: string) {
  if (!u) return '/'
  return u.startsWith('/') ? u : `/${u}`
}
function trimTrailingSlash(u: string) {
  return u.replace(/\/+$/, '')
}

function normalizeAll(v: any): string {
  const s = String(v ?? '').trim()
  if (!s) return ALL
  if (s === '__all__' || s === '__ALL__') return ALL
  return s
}

let swalStyled = false
function ensureSwalZ() {
  if (swalStyled) return
  const s = document.createElement('style')
  s.textContent = `.swal2-container{z-index:20000 !important}`
  document.head.appendChild(s)
  swalStyled = true
}

function swalOk(title: string, text?: string) {
  ensureSwalZ()
  return Swal.fire({ icon: 'success', title, text, confirmButtonText: 'OK', heightAuto: false })
}
function swalErr(title: string, text?: string) {
  ensureSwalZ()
  return Swal.fire({ icon: 'error', title, text, confirmButtonText: 'OK', heightAuto: false })
}

type UseProductoCrudOptions = {
  initialFilters?: Partial<ProductoFilters>
  baseUrl?: string
  autoApply?: boolean
  debounceMs?: number
}

type OpenCtx = {
  marcas?: MarcaLite[]
  categorias?: CategoriaLite[]
}

export function useProductoCrud(opts: UseProductoCrudOptions = {}) {
  const baseUrlRaw = ensureLeadingSlash(opts.baseUrl ?? '/productos')
  const baseUrl = trimTrailingSlash(baseUrlRaw)

  const filters = reactive<ProductoFilters>({
    q: String(opts.initialFilters?.q ?? ''),
    marca_id: normalizeAll(opts.initialFilters?.marca_id ?? ALL),
    categoria_id: normalizeAll(opts.initialFilters?.categoria_id ?? ALL),
    status: normalizeAll(opts.initialFilters?.status ?? ALL),
    per_page: opts.initialFilters?.per_page ?? 10,
  })

  const modalOpen = ref(false)
  const modalMode = ref<'create' | 'edit'>('create')

  const modalMarcas = ref<MarcaLite[]>([])
  const modalCategorias = ref<CategoriaLite[]>([])

  // Blindaje: id de edición separado del form (aquí estaba tu bug real)
  const editingId = ref<number | null>(null)

  const form = reactive({
    id: null as number | null,
    marca_id: null as number | null,
    categoria_id: null as number | null,
    sku: '',
    stock: 0 as number | string,
    precio_venta: 0 as number | string,
    costo_lista: 0 as number | string,
    nombre: '',
    descripcion: '',
    status: 'activo' as Status,

    fotos: [] as File[],
    foto_principal: null as File | null,
  })

  const errors = reactive<Record<string, string>>({})
  const submitting = ref(false)
  const saving = computed(() => submitting.value)

  function resetErrors() {
    Object.keys(errors).forEach((k) => delete errors[k])
  }

  // ---- Fotos / previews (nunca undefined) ----
  const fotoPreviews = ref<Array<{ url: string; name: string }>>([])
  let previewUrls: string[] = []

  function clearPreviews() {
    previewUrls.forEach((u) => URL.revokeObjectURL(u))
    previewUrls = []
    fotoPreviews.value = []
  }

  function setFotos(files: FileList | null | undefined) {
    clearPreviews()
    if (!files || files.length === 0) {
      form.fotos = []
      return
    }
    const arr = Array.from(files)
    form.fotos = arr

    const max = 24
    const mapped = arr.slice(0, max).map((f) => {
      const url = URL.createObjectURL(f)
      previewUrls.push(url)
      return { url, name: f.name }
    })
    fotoPreviews.value = mapped
  }

  function clearFotos() {
    form.fotos = []
    form.foto_principal = null
    clearPreviews()
  }

  onBeforeUnmount(() => {
    clearPreviews()
  })

  function resetForm() {
    form.id = null
    editingId.value = null

    form.marca_id = null
    form.categoria_id = null
    form.sku = ''
    form.stock = 0
    form.precio_venta = 0
    form.costo_lista = 0
    form.nombre = ''
    form.descripcion = ''
    form.status = 'activo'
    clearFotos()
  }

  function openCreate(ctx?: OpenCtx) {
    resetErrors()
    resetForm()
    modalMode.value = 'create'
    modalMarcas.value = ctx?.marcas ?? []
    modalCategorias.value = ctx?.categorias ?? []
    modalOpen.value = true
  }

  function fillFromProducto(p: Producto) {
    const id = Number((p as any)?.id ?? 0)
    form.id = Number.isFinite(id) && id > 0 ? id : null
    editingId.value = form.id

    form.marca_id = (p.marca_id ?? null) as any
    form.categoria_id = (p.categoria_id ?? null) as any
    form.sku = p.sku ?? ''
    form.stock = Number(p.stock ?? 0)
    form.precio_venta = Number(p.precio_venta ?? 0)
    form.costo_lista = Number(p.costo_lista ?? 0)
    form.nombre = p.nombre ?? ''
    form.descripcion = p.descripcion ?? ''
    form.status = (p.status ?? 'activo') as Status
    clearFotos()
  }

  function openEdit(ctx: OpenCtx | undefined, p: Producto) {
    resetErrors()
    resetForm()
    modalMode.value = 'edit'
    modalMarcas.value = ctx?.marcas ?? []
    modalCategorias.value = ctx?.categorias ?? []
    fillFromProducto(p)
    modalOpen.value = true
  }

  function closeModal() {
    modalOpen.value = false
  }

  function buildPayload() {
    return {
      marca_id: form.marca_id ?? null,
      categoria_id: form.categoria_id ?? null,
      sku: String(form.sku ?? ''),
      stock: Number(form.stock ?? 0),
      precio_venta: Number(form.precio_venta ?? 0),
      costo_lista: Number(form.costo_lista ?? 0),
      nombre: String(form.nombre ?? ''),
      descripcion: String(form.descripcion ?? ''),
      status: String(form.status ?? 'activo'),
    }
  }

  function buildMultipart(method: 'POST' | 'PUT') {
    const fd = new FormData()
    if (method === 'PUT') fd.append('_method', 'PUT')

    if (form.marca_id) fd.append('marca_id', String(form.marca_id))
    if (form.categoria_id) fd.append('categoria_id', String(form.categoria_id))

    fd.append('sku', String(form.sku || ''))
    fd.append('stock', String(Number(form.stock ?? 0)))
    fd.append('precio_venta', String(Number(form.precio_venta ?? 0)))
    fd.append('costo_lista', String(Number(form.costo_lista ?? 0)))
    fd.append('nombre', String(form.nombre || ''))
    fd.append('descripcion', String(form.descripcion || ''))
    fd.append('status', String(form.status || 'activo'))

    if (form.foto_principal) fd.append('foto_principal', form.foto_principal)
    if (form.fotos?.length) form.fotos.forEach((f) => fd.append('fotos[]', f))

    return fd
  }

  function queryFromFilters(extra?: Record<string, any>) {
    const q: any = {
      q: filters.q || undefined,
      marca_id: filters.marca_id !== ALL ? filters.marca_id : undefined,
      categoria_id: filters.categoria_id !== ALL ? filters.categoria_id : undefined,
      status: filters.status !== ALL ? filters.status : undefined,
      per_page: filters.per_page ? Number(filters.per_page) : undefined,
      ...extra,
    }
    Object.keys(q).forEach((k) => (q[k] === undefined ? delete q[k] : null))
    return q
  }

  function applyFilters(extra?: Record<string, any>) {
    router.get(baseUrl, queryFromFilters(extra), {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    })
  }

  // Auto apply (debounce)
  const autoApply = opts.autoApply ?? true
  const debounceMs = opts.debounceMs ?? 350
  let t: number | null = null

  if (autoApply) {
    watch(
      filters,
      () => {
        if (t) window.clearTimeout(t)
        t = window.setTimeout(() => {
          applyFilters({ page: 1 })
        }, debounceMs)
      },
      { deep: true }
    )
  }

  function setPerPage(n: number) {
    const safe = Number(n)
    filters.per_page = Number.isFinite(safe) && safe > 0 ? safe : 10
  }

  const hasActiveFilters = computed(() => {
    const q = String(filters.q ?? '').trim()
    return q !== '' || filters.marca_id !== ALL || filters.categoria_id !== ALL || filters.status !== ALL
  })

  function resetFilters() {
    filters.q = ''
    filters.marca_id = ALL
    filters.categoria_id = ALL
    filters.status = ALL
    const n = Number(filters.per_page ?? 10)
    filters.per_page = Number.isFinite(n) && n > 0 ? n : 10
  }

  function updateUrlOrThrow(): string {
    const id = Number(editingId.value ?? form.id ?? 0)
    if (!Number.isFinite(id) || id <= 0) {
      throw new Error('No llegó el id del producto para actualizar.')
    }
    return `${baseUrl}/${id}`
  }

  async function submit() {
    resetErrors()
    submitting.value = true
    try {
      const hasFotos = !!form.foto_principal || (form.fotos?.length ?? 0) > 0

      if (modalMode.value === 'create') {
        if (hasFotos) {
          const fd = buildMultipart('POST')
          await axios.post(baseUrl, fd, { headers: { Accept: 'application/json' } })
        } else {
          await axios.post(baseUrl, buildPayload(), { headers: { Accept: 'application/json' } })
        }
        await swalOk('Listo', 'Producto creado.')
      } else {
        const url = updateUrlOrThrow()

        if (hasFotos) {
          const fd = buildMultipart('PUT')
          await axios.post(url, fd, { headers: { Accept: 'application/json' } })
        } else {
          await axios.put(url, buildPayload(), { headers: { Accept: 'application/json' } })
        }
        await swalOk('Listo', 'Producto actualizado.')
      }

      closeModal()
      applyFilters()
    } catch (e: any) {
      if (e?.response?.status === 422) {
        const bag = e.response.data?.errors ?? {}
        Object.keys(bag).forEach((k) => (errors[k] = String(bag[k]?.[0] ?? bag[k] ?? 'Error')))
        await swalErr('Revisa el formulario', 'Hay campos con error.')
      } else {
        await swalErr('Error', e?.response?.data?.message ?? e?.message ?? 'Error')
      }
    } finally {
      submitting.value = false
    }
  }

  async function toggleStatus(p: Producto): Promise<boolean> {
    try {
      await axios.patch(`${baseUrl}/${p.id}/toggle-status`, null, { headers: { Accept: 'application/json' } })
      return true
    } catch {
      return false
    }
  }

  async function destroy(p: Producto): Promise<boolean> {
    try {
      await axios.delete(`${baseUrl}/${p.id}`, { headers: { Accept: 'application/json' } })
      return true
    } catch {
      return false
    }
  }

  return proxyRefs({
    baseUrl,
    ALL,

    filters,
    applyFilters,
    setPerPage,
    resetFilters,
    hasActiveFilters,

    modalOpen,
    modalMode,
    modalMarcas,
    modalCategorias,

    form,
    errors,
    submitting,
    saving,

    fotoPreviews,
    setFotos,
    clearFotos,

    openCreate,
    openEdit,
    closeModal,
    submit,

    toggleStatus,
    destroy,
  })
}
