import axios from 'axios'
import Swal from 'sweetalert2'
import { computed, reactive, ref, watch, onBeforeUnmount, proxyRefs } from 'vue'
import { router } from '@inertiajs/vue3'

export type Status = 'activo' | 'inactivo'
export type CategoriaLite = { id: number; nombre: string }

export type Servicio = {
  id: number
  categoria_id: number | null
  nombre: string
  descripcion?: string | null
  precio: number
  status: Status
  categoria?: CategoriaLite | null
}

export type ServicioFilters = {
  q: string
  categoria_id: string
  status: string
  per_page?: number | string
}

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

/** SearchSelect a veces manda {id,nombre} y a veces manda el id directo */
function toId(v: any): number | null {
  if (v && typeof v === 'object') {
    const raw = (v as any).id
    const n = Number(raw)
    return Number.isFinite(n) && n > 0 ? n : null
  }
  const n = Number(v)
  return Number.isFinite(n) && n > 0 ? n : null
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

type UseServicioCrudOptions = {
  initialFilters?: Partial<ServicioFilters>
  baseUrl?: string
  autoApply?: boolean
  debounceMs?: number
}

type OpenCtx = { categorias?: CategoriaLite[] }

export function useServicioCrud(opts: UseServicioCrudOptions = {}) {
  const baseUrlRaw = ensureLeadingSlash(opts.baseUrl ?? '/servicios')
  const baseUrl = trimTrailingSlash(baseUrlRaw)

  const filters = reactive<ServicioFilters>({
    q: String(opts.initialFilters?.q ?? ''),
    categoria_id: normalizeAll(opts.initialFilters?.categoria_id ?? ALL),
    status: normalizeAll(opts.initialFilters?.status ?? ALL),
    per_page: opts.initialFilters?.per_page ?? 10,
  })

  const modalOpen = ref(false)
  const modalMode = ref<'create' | 'edit'>('create')
  const modalCategorias = ref<CategoriaLite[]>([])

  const editingId = ref<number | null>(null)

  const form = reactive({
    categoria_id: null as number | null,
    nombre: '',
    descripcion: '' as string,
    precio: 0 as number | string,
  })

  const errors = reactive<Record<string, string>>({})
  const submitting = ref(false)
  const saving = computed(() => submitting.value)

  function resetErrors() {
    Object.keys(errors).forEach((k) => delete errors[k])
  }

  function resetForm() {
    editingId.value = null
    form.categoria_id = null
    form.nombre = ''
    form.descripcion = ''
    form.precio = 0
  }

  function openCreate(ctx?: OpenCtx) {
    resetErrors()
    resetForm()
    modalMode.value = 'create'
    modalCategorias.value = ctx?.categorias ?? []
    modalOpen.value = true
  }

  function openEdit(ctx: OpenCtx | undefined, s: Servicio) {
    resetErrors()
    resetForm()
    modalMode.value = 'edit'
    modalCategorias.value = ctx?.categorias ?? []

    const id = Number((s as any)?.id ?? 0)
    editingId.value = Number.isFinite(id) && id > 0 ? id : null

    // categoria_id puede venir como number, string o dentro de categoria.id
    form.categoria_id = toId((s as any).categoria_id ?? (s as any)?.categoria?.id)
    form.nombre = String(s.nombre ?? '')
    form.descripcion = String(s.descripcion ?? '')
    form.precio = Number(s.precio ?? 0)

    modalOpen.value = true
  }

  function closeModal() {
    modalOpen.value = false
  }

  function buildPayload() {
    const nombre = String(form.nombre ?? '').trim()
    const desc = String(form.descripcion ?? '').trim()

    return {
      categoria_id: form.categoria_id ?? null,
      nombre,
      descripcion: desc ? desc : null, // evita min rules / y respeta nullable
      precio: Number(form.precio ?? 0),
      // status NO se envía: automático (activo al crear / inactivo al delete / activo al reactivate)
    }
  }

  function queryFromFilters(extra?: Record<string, any>) {
    const q: any = {
      q: filters.q || undefined,
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

  const autoApply = opts.autoApply ?? true
  const debounceMs = opts.debounceMs ?? 350
  let t: number | null = null

  if (autoApply) {
    watch(
      filters,
      () => {
        if (t) window.clearTimeout(t)
        t = window.setTimeout(() => applyFilters({ page: 1 }), debounceMs)
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
    return q !== '' || filters.categoria_id !== ALL || filters.status !== ALL
  })

  function resetFilters() {
    filters.q = ''
    filters.categoria_id = ALL
    filters.status = ALL
    const n = Number(filters.per_page ?? 10)
    filters.per_page = Number.isFinite(n) && n > 0 ? n : 10
  }

  function updateUrlOrThrow(): string {
    const id = Number(editingId.value ?? 0)
    if (!Number.isFinite(id) || id <= 0) throw new Error('No llegó el id del servicio para actualizar.')
    return `${baseUrl}/${id}`
  }

  async function submit() {
    resetErrors()
    submitting.value = true
    try {
      if (modalMode.value === 'create') {
        await axios.post(baseUrl, buildPayload(), { headers: { Accept: 'application/json' } })
        await swalOk('Listo', 'Servicio creado.')
      } else {
        const url = updateUrlOrThrow()
        await axios.put(url, buildPayload(), { headers: { Accept: 'application/json' } })
        await swalOk('Listo', 'Servicio actualizado.')
      }

      closeModal()
      applyFilters()
    } catch (e: any) {
      if (e?.response?.status === 422) {
        const bag = e.response.data?.errors ?? {}
        Object.keys(bag).forEach((k) => (errors[k] = String(bag[k]?.[0] ?? bag[k] ?? 'Error')))
        await swalErr('Revisa el formulario', 'Hay campos con error.')
      } else if (e?.response?.status === 405) {
        await swalErr(
          'Ruta/método no disponible',
          'Tu ruta no tiene update (PUT/PATCH). Revisa Route::resource() y que no esté limitado con only().'
        )
      } else {
        await swalErr('Error', e?.response?.data?.message ?? e?.message ?? 'Error')
      }
    } finally {
      submitting.value = false
    }
  }

  async function destroy(s: Servicio): Promise<boolean> {
    try {
      await axios.delete(`${baseUrl}/${s.id}`, { headers: { Accept: 'application/json' } })
      return true
    } catch {
      return false
    }
  }

  async function reactivate(s: Servicio): Promise<boolean> {
    try {
      await axios.patch(`${baseUrl}/${s.id}/reactivate`, null, { headers: { Accept: 'application/json' } })
      return true
    } catch {
      return false
    }
  }

  onBeforeUnmount(() => {})

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
    modalCategorias,

    form,
    errors,
    submitting,
    saving,

    openCreate,
    openEdit,
    closeModal,
    submit,

    destroy,
    reactivate,
  })
}
