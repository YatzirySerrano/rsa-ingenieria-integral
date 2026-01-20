// resources/js/composables/crud/usePersonaCrud.ts
import { computed, reactive, ref, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import Swal from 'sweetalert2'

export type PersonaStatus = 'activo' | 'inactivo'

export type Persona = {
  id: number
  usuario_id?: number | null
  nombre: string
  apellido_paterno?: string | null
  apellido_materno?: string | null
  telefono?: string | null
  empresa?: string | null
  rfc?: string | null
  direccion?: string | null
  status: PersonaStatus
  nombre_completo?: string | null
}

export type PersonaFilters = {
  q: string
  status: string // 'activo' | 'inactivo' | '__all__'
}

export const PERSONA_ALL = '__all__'
const DEFAULT_STATUS: PersonaStatus = 'activo'

type UsePersonaCrudOptions = {
  initialFilters?: Partial<PersonaFilters>
  baseUrl?: string
}

export type PersonaForm = {
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  telefono: string
  empresa: string
  rfc: string
  direccion: string
}

export type PersonaFormPayload = {
  nombre: string
  apellido_paterno: string | null
  apellido_materno: string | null
  telefono: string | null
  empresa: string | null
  rfc: string | null
  direccion: string | null
  status: 'activo'
}

export type PersonaFormErrors = Partial<Record<keyof PersonaForm, string>> & {
  form?: string
}

/* =========================
 * SweetAlert helpers
 * ========================= */
let swalStyled = false
function ensureSwalTop() {
  if (swalStyled) return
  const style = document.createElement('style')
  style.innerHTML = `.swal2-container{z-index:20000 !important;}`
  document.head.appendChild(style)
  swalStyled = true
}

function toast(icon: 'success' | 'error' | 'info' | 'warning', title: string) {
  ensureSwalTop()
  return Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: icon === 'error' ? 2600 : 2200,
    timerProgressBar: true,
  })
}

export function usePersonaCrud(options: UsePersonaCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/personas'

  /* =========================
   * Filtros (debounce)
   * ========================= */
  const filters = reactive<PersonaFilters>({
    q: options.initialFilters?.q ?? '',
    // DEFAULT: activo
    status: options.initialFilters?.status ?? DEFAULT_STATUS,
  })

  function buildParams() {
    const params: Record<string, string> = {}
    if (filters.q.trim()) params.q = filters.q.trim()

    // Si está en "Todos" mandamos status=__all__ (para que el backend NO filtre)
    if (filters.status && filters.status !== DEFAULT_STATUS) {
      // Ojo: si vuelve a activo (default), no lo mandamos.
      params.status = filters.status
    }

    return params
  }

  function applyFilters() {
    router.get(baseUrl, buildParams(), {
      preserveScroll: true,
      preserveState: true,
      replace: true,
    })
  }

  function resetFilters() {
    filters.q = ''
    filters.status = DEFAULT_STATUS
    applyFilters()
  }

  let t: number | null = null
  watch(
    () => ({ ...filters }),
    () => {
      if (t) window.clearTimeout(t)
      t = window.setTimeout(() => applyFilters(), 320)
    },
    { deep: true }
  )

  // Activo solo si:
  // - hay q, o
  // - status diferente al default activo (incluye __all__ o inactivo)
  const hasActiveFilters = computed(() => Boolean(filters.q.trim()) || filters.status !== DEFAULT_STATUS)

  /* =========================
   * Modal + Form State
   * ========================= */
  const modalOpen = ref(false)
  const mode = ref<'create' | 'edit'>('create')
  const editingId = ref<number | null>(null)
  const busy = ref(false)

  const form = reactive<PersonaForm>({
    nombre: '',
    apellido_paterno: '',
    apellido_materno: '',
    telefono: '',
    empresa: '',
    rfc: '',
    direccion: '',
  })

  const errors = reactive<PersonaFormErrors>({})

  function clearErrors() {
    Object.keys(errors).forEach((k) => delete (errors as any)[k])
  }

  function setFormFromPersona(p: Persona) {
    form.nombre = String(p.nombre ?? '')
    form.apellido_paterno = String(p.apellido_paterno ?? '')
    form.apellido_materno = String(p.apellido_materno ?? '')
    form.telefono = String(p.telefono ?? '')
    form.empresa = String(p.empresa ?? '')
    form.rfc = String(p.rfc ?? '')
    form.direccion = String(p.direccion ?? '')
  }

  function resetForm() {
    form.nombre = ''
    form.apellido_paterno = ''
    form.apellido_materno = ''
    form.telefono = ''
    form.empresa = ''
    form.rfc = ''
    form.direccion = ''
    clearErrors()
  }

  function openCreate() {
    mode.value = 'create'
    editingId.value = null
    resetForm()
    modalOpen.value = true
  }

  function openEdit(p: Persona) {
    mode.value = 'edit'
    editingId.value = Number(p.id)
    resetForm()
    setFormFromPersona(p)
    modalOpen.value = true
  }

  function closeModal() {
    if (busy.value) return
    modalOpen.value = false
  }

  /* =========================
   * Validación
   * ========================= */
  function normalizeText(v: unknown) {
    return String(v ?? '').trim().replace(/\s+/g, ' ')
  }

  function normalizePhone(v: unknown) {
    return String(v ?? '').replace(/\D+/g, '').trim()
  }

  function normalizeRfc(v: unknown) {
    return String(v ?? '').trim().toUpperCase().replace(/\s+/g, '')
  }

  function isValidPhoneMxDigits(phoneDigits: string) {
    return phoneDigits.length === 0 || phoneDigits.length === 10
  }

  function isValidRfcBasic(rfc: string) {
    if (!rfc) return true
    if (rfc.length < 12 || rfc.length > 18) return false
    return /^[A-Z0-9Ñ&]+$/.test(rfc)
  }

  function validate(): { ok: true; payload: PersonaFormPayload } | { ok: false } {
    clearErrors()

    const nombre = normalizeText(form.nombre)
    const apellido_paterno = normalizeText(form.apellido_paterno)
    const apellido_materno = normalizeText(form.apellido_materno)
    const empresa = normalizeText(form.empresa)
    const direccion = normalizeText(form.direccion)

    const telefonoDigits = normalizePhone(form.telefono)
    const rfc = normalizeRfc(form.rfc)

    if (!nombre) errors.nombre = 'El nombre es obligatorio.'
    else if (nombre.length < 2) errors.nombre = 'El nombre es demasiado corto.'
    else if (nombre.length > 120) errors.nombre = 'Máximo 120 caracteres.'

    if (!apellido_paterno) errors.apellido_paterno = 'El apellido paterno es obligatorio.'
    else if (apellido_paterno.length < 2) errors.apellido_paterno = 'El apellido paterno es demasiado corto.'
    else if (apellido_paterno.length > 120) errors.apellido_paterno = 'Máximo 120 caracteres.'

    if (apellido_materno && apellido_materno.length > 120) errors.apellido_materno = 'Máximo 120 caracteres.'
    if (!isValidPhoneMxDigits(telefonoDigits)) errors.telefono = 'El teléfono debe tener 10 dígitos.'
    if (!isValidRfcBasic(rfc)) errors.rfc = 'RFC inválido.'

    if (!telefonoDigits && !rfc) {
      errors.form = 'Captura al menos Teléfono o RFC para poder guardar.'
    }

    if (empresa && empresa.length > 160) errors.empresa = 'Máximo 160 caracteres.'
    if (direccion && direccion.length > 300) errors.direccion = 'Máximo 300 caracteres.'

    if (Object.keys(errors).length) return { ok: false }

    const payload: PersonaFormPayload = {
      nombre,
      apellido_paterno: apellido_paterno || null,
      apellido_materno: apellido_materno || null,
      telefono: telefonoDigits || null,
      empresa: empresa || null,
      rfc: rfc || null,
      direccion: direccion || null,
      status: 'activo',
    }

    return { ok: true, payload }
  }

  /* =========================
   * Persistencia + Swal feedback
   * ========================= */
  async function submit() {
    if (busy.value) return

    const v = validate()
    if (!v.ok) {
      toast('error', 'Revisa los campos')
      return
    }

    busy.value = true
    const done = () => (busy.value = false)

    if (mode.value === 'edit' && editingId.value) {
      router.put(`${baseUrl}/${editingId.value}`, v.payload, {
        preserveScroll: true,
        onSuccess: () => {
          toast('success', 'Persona actualizada')
          modalOpen.value = false
        },
        onError: () => toast('error', 'No se pudo actualizar'),
        onFinish: done,
      })
      return
    }

    router.post(baseUrl, v.payload, {
      preserveScroll: true,
      onSuccess: () => {
        toast('success', 'Persona creada')
        modalOpen.value = false
      },
      onError: () => toast('error', 'No se pudo crear'),
      onFinish: done,
    })
  }

  /* =========================
   * Eliminar (soft) / Activar
   * ========================= */
  function displayName(p: Persona) {
    const fromResource = String(p.nombre_completo ?? '').trim()
    if (fromResource) return fromResource
    const parts = [p.nombre, p.apellido_paterno ?? '', p.apellido_materno ?? '']
      .map((x) => String(x ?? '').trim())
      .filter(Boolean)
    return parts.join(' ') || `#${p.id}`
  }

  async function confirmDelete(p: Persona) {
    ensureSwalTop()
    const name = displayName(p)

    const res = await Swal.fire({
      icon: 'warning',
      title: 'Confirmar eliminación',
      html: `¿Deseas eliminar a <b>${name}</b>?<br/><span style="font-size:12px;opacity:.8">Podrás activarlo nuevamente después.</span>`,
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    })

    return res.isConfirmed
  }

  async function deactivate(p: Persona) {
    if (busy.value) return

    const ok = await confirmDelete(p)
    if (!ok) return

    busy.value = true
    router.delete(`${baseUrl}/${p.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('success', 'Persona eliminada'),
      onError: () => toast('error', 'No se pudo eliminar'),
      onFinish: () => (busy.value = false),
    })
  }

  function activate(p: Persona) {
    if (busy.value) return
    busy.value = true

    router.put(
      `${baseUrl}/${p.id}`,
      {
        nombre: p.nombre,
        apellido_paterno: p.apellido_paterno ?? null,
        apellido_materno: p.apellido_materno ?? null,
        telefono: p.telefono ?? null,
        empresa: p.empresa ?? null,
        rfc: p.rfc ?? null,
        direccion: p.direccion ?? null,
        status: 'activo' as const,
      },
      {
        preserveScroll: true,
        onSuccess: () => toast('success', 'Persona activada'),
        onError: () => toast('error', 'No se pudo activar'),
        onFinish: () => (busy.value = false),
      }
    )
  }

  function toggleStatus(p: Persona) {
    return p.status === 'activo' ? deactivate(p) : activate(p)
  }

  return {
    ALL: PERSONA_ALL,
    filters,
    hasActiveFilters,
    applyFilters,
    resetFilters,

    modalOpen,
    mode,
    editingId,
    busy,
    form,
    errors,

    openCreate,
    openEdit,
    closeModal,
    submit,

    toggleStatus,
    activate,
    deactivate,

    displayName,
  }
}
