// resources/js/composables/crud/useProductoCrud.ts
// ================================================
// Composable de Productos (negocio y estado, cero UX):
// - Maneja filtros y navegación por Inertia (applyFilters, reset)
// - Maneja modal create/edit (openCreate/openEdit/closeModal)
// - Maneja form + validaciones backend (422)
// - Maneja fotos como File[] + previews tipados (fotoPreviews: Array<{url,name}>)
// - No dispara Swal. La UI decide cómo notificar.

import { reactive, ref, computed, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import axios from 'axios'

export type MarcaLite = { id: number; nombre: string }
export type CategoriaLite = { id: number; nombre: string }

export type ProductoMedia = {
  id: number
  url: string
  status: 'activo' | 'inactivo'
  principal?: boolean
  orden?: number | null
}

export type Producto = {
  id: number
  sku: string
  nombre: string
  descripcion?: string | null
  stock: number
  costo_lista?: number | string | null
  precio_venta?: number | string | null
  status: 'activo' | 'inactivo'
  marca?: MarcaLite | null
  categoria?: CategoriaLite | null
  medias?: ProductoMedia[]
}

type Filters = {
  q: string
  status: string
  marca_id: string
  categoria_id: string
  per_page?: number | string
  page?: number
}

type ModalPayload = { marcas: MarcaLite[]; categorias: CategoriaLite[] }

type FormState = {
  id: number | null
  marca_id: number | null
  categoria_id: number | null
  sku: string
  nombre: string
  descripcion: string
  stock: number | string
  precio_venta: number | string
  costo_lista: number | string
  fotos: File[]
}

type Errors = {
  general?: string
  marca_id?: string
  categoria_id?: string
  sku?: string
  nombre?: string
  descripcion?: string
  stock?: string
  precio_venta?: string
  costo_lista?: string
}

type FotoPreview = { url: string; name: string }

export function useProductoCrud(opts: { initialFilters?: Partial<Filters>; baseUrl: string }) {
    const baseUrl = opts.baseUrl
  const ALL = '__ALL__'

  // =========================
  // Filtros (para la vista)
  // =========================
  const filters = reactive<Filters>({
    q: String(opts.initialFilters?.q ?? ''),
    status: String(opts.initialFilters?.status ?? ALL),
    marca_id: String(opts.initialFilters?.marca_id ?? ALL),
    categoria_id: String(opts.initialFilters?.categoria_id ?? ALL),
    per_page: opts.initialFilters?.per_page !== undefined ? Number(opts.initialFilters?.per_page) : 10,
    page: opts.initialFilters?.page !== undefined ? Number(opts.initialFilters?.page) : 1,
  })

  // Detecta si hay filtros activos (para habilitar botón "Reiniciar")
  const hasActiveFilters = computed(() => {
    const q = (filters.q || '').trim()
    const any =
      !!q ||
      (filters.status && filters.status !== ALL) ||
      (filters.marca_id && filters.marca_id !== ALL) ||
      (filters.categoria_id && filters.categoria_id !== ALL)
    return any
  })

  // Debounce simple para búsqueda (evita visitas por cada tecla)
  let qTimer: number | null = null
  watch(
    () => filters.q,
    () => {
      if (qTimer) window.clearTimeout(qTimer)
      qTimer = window.setTimeout(() => applyFilters(), 350) as any
    }
  )

  // Cuando cambian selects/status aplicamos directo (rápido y consistente)
  watch(
    () => [filters.status, filters.marca_id, filters.categoria_id],
    () => applyFilters()
  )

  // dentro de useProductoCrud
function setPerPage(v: number) {
    filters.per_page = Number(v) // fuerza number, incluye 0
  filters.page = 1             // reset page
  applyFilters()
  }
  
  function applyFilters() {
    const q = (filters.q || '').trim()
  
    const params: Record<string, any> = {}
  
    if (q) params.q = q
    if (filters.status && filters.status !== ALL) params.status = filters.status
    if (filters.marca_id && filters.marca_id !== ALL) params.marca_id = filters.marca_id
    if (filters.categoria_id && filters.categoria_id !== ALL) params.categoria_id = filters.categoria_id
  
    // per_page: permitir 0, 10, 15, 20. NO uses "if(per_page)" porque 0 es falsy.
    if (filters.per_page !== undefined && filters.per_page !== null && filters.per_page !== '') {
      params.per_page = Number(filters.per_page)
    }
  
    // page: solo si existe y es >= 1
    if (filters.page && Number(filters.page) >= 1) {
      params.page = Number(filters.page)
    }
  
    router.get(baseUrl, params, {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    })
  }

  function resetFilters() {
    filters.q = ''
    filters.status = ALL
    filters.marca_id = ALL
    filters.categoria_id = ALL
    filters.page = 1
    applyFilters()
  }

  // =========================
  // Modal create/edit
  // =========================
  const modalOpen = ref(false)
  const modalMode = ref<'create' | 'edit'>('create')

  const modalMarcas = ref<MarcaLite[]>([])
  const modalCategorias = ref<CategoriaLite[]>([])

  const saving = ref(false)
  const errors = reactive<Errors>({})

  // Form tipado (importante para no romper TS en la vista)
  const form = reactive<FormState>({
    id: null,
    marca_id: null,
    categoria_id: null,
    sku: '',
    nombre: '',
    descripcion: '',
    stock: 0,
    precio_venta: 0,
    costo_lista: 0,
    fotos: [],
  })

  // =========================
  // Fotos + previews (TIPADO REAL)
  // =========================
  const fotoPreviews = ref<FotoPreview[]>([])

  function revokePreviews() {
    for (const p of fotoPreviews.value) URL.revokeObjectURL(p.url)
    fotoPreviews.value = []
  }

  function setFotos(fileList: FileList | null) {
    revokePreviews()

    if (!fileList || !fileList.length) {
      form.fotos = []
      return
    }

    // File[] para que el template pueda usar length, slice, etc.
    const files = Array.from(fileList)
    form.fotos = files

    // Previews tipados
    fotoPreviews.value = files.map((f) => ({ url: URL.createObjectURL(f), name: f.name }))
  }

  function clearFotos() {
    form.fotos = []
    revokePreviews()
  }

  function clearErrors() {
    for (const k of Object.keys(errors)) {
      // @ts-ignore
      errors[k] = undefined
    }
  }

  function fillFromProducto(p: Producto) {
    form.id = p.id ?? null
    form.marca_id = (p.marca?.id ?? null) as any
    form.categoria_id = (p.categoria?.id ?? null) as any
    form.sku = String(p.sku ?? '')
    form.nombre = String(p.nombre ?? '')
    form.descripcion = String(p.descripcion ?? '')
    form.stock = (p.stock ?? 0) as any
    form.precio_venta = (p.precio_venta ?? 0) as any
    form.costo_lista = (p.costo_lista ?? 0) as any

    // En edit no arrastramos fotos automáticamente
    clearFotos()
  }

  function openCreate(payload: ModalPayload) {
    // No UX aquí. Solo estado.
    modalMode.value = 'create'
    modalMarcas.value = payload.marcas || []
    modalCategorias.value = payload.categorias || []
    clearErrors()

    form.id = null
    form.marca_id = null
    form.categoria_id = null
    form.sku = ''
    form.nombre = ''
    form.descripcion = ''
    form.stock = 0
    form.precio_venta = 0
    form.costo_lista = 0
    clearFotos()

    modalOpen.value = true
  }

  function openEdit(payload: ModalPayload, p: Producto) {
    // Importante: aquí NO se dispara Swal.
    modalMode.value = 'edit'
    modalMarcas.value = payload.marcas || []
    modalCategorias.value = payload.categorias || []
    clearErrors()

    fillFromProducto(p)
    modalOpen.value = true
  }

  function closeModal() {
    modalOpen.value = false
    saving.value = false
    clearErrors()
    clearFotos()
  }

  // =========================
  // Submit (store / update)
  // =========================
  function toNumber(v: any, fallback = 0) {
    const n = Number(v)
    return Number.isFinite(n) ? n : fallback
  }

  function buildPayload() {
    return {
      marca_id: form.marca_id,
      categoria_id: form.categoria_id,
      sku: (form.sku || '').trim(),
      nombre: (form.nombre || '').trim(),
      descripcion: (form.descripcion || '').trim(),
      stock: toNumber(form.stock, 0),
      precio_venta: toNumber(form.precio_venta, 0),
      costo_lista: toNumber(form.costo_lista, 0),
    }
  }

  function buildFormData() {
    const fd = new FormData()
    const payload = buildPayload()

    Object.entries(payload).forEach(([k, v]) => {
      if (v === null || v === undefined) return
      fd.append(k, String(v))
    })

    // Fotos (si hay) se mandan como fotos[]
    for (const f of form.fotos) fd.append('fotos[]', f)

    // Si tu backend usa PUT para update con multipart, se hace method spoof
    if (modalMode.value === 'edit' && form.id) {
      fd.append('_method', 'PUT')
    }

    return fd
  }

  async function submit() {
    if (saving.value) return

    saving.value = true
    clearErrors()

    try {
      const hasFotos = form.fotos.length > 0

      if (modalMode.value === 'create') {
        if (hasFotos) {
          await axios.post(opts.baseUrl, buildFormData(), {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } else {
          await axios.post(opts.baseUrl, buildPayload())
        }
      } else {
        if (!form.id) throw new Error('Falta id para actualizar')

        if (hasFotos) {
          await axios.post(`${opts.baseUrl}/${form.id}`, buildFormData(), {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
        } else {
          await axios.put(`${opts.baseUrl}/${form.id}`, buildPayload())
        }
      }

      closeModal()
      applyFilters()
    } catch (err: any) {
      // 422: errores de validación
      if (err?.response?.status === 422) {
        const bag = err.response.data?.errors || {}
        for (const [k, v] of Object.entries(bag)) {
          const msg = Array.isArray(v) ? String(v[0] ?? '') : String(v ?? '')
          // @ts-ignore
          errors[k] = msg
        }
        errors.general = err.response.data?.message || 'Revisa los campos.'
      } else {
        errors.general = err?.response?.data?.message || err?.message || 'Error al guardar.'
      }
    } finally {
      saving.value = false
    }
  }

  // =========================
  // Toggle status
  // =========================
  async function toggleStatus(p: Producto): Promise<boolean> {
    try {
      // Ajusta este endpoint si el tuyo se llama distinto.
      // Recomendado: PATCH /productos/{id}/toggle-status
      await axios.patch(`${opts.baseUrl}/${p.id}/toggle-status`)
      applyFilters()
      return true
    } catch {
      return false
    }
  }

  return {
    ALL,

    // filtros
    filters,
    hasActiveFilters,
    applyFilters,
    setPerPage,
    resetFilters,

    // modal
    modalOpen,
    modalMode,
    modalMarcas,
    modalCategorias,

    // form
    form,
    errors,
    saving,

    // fotos
    fotoPreviews,
    setFotos,
    clearFotos,

    // acciones
    openCreate,
    openEdit,
    closeModal,
    submit,
    toggleStatus,
  }
}