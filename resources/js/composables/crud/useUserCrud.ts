// resources/js/composables/crud/useUserCrud.ts
import Swal from 'sweetalert2'
import { computed, reactive, ref, watch } from 'vue'
import { router } from '@inertiajs/vue3'

export type UserRol = 'admin' | 'vendedor' | 'cliente'
export type UserStatus = 'activo' | 'inactivo'

export type PersonaPick = {
  id: number
  usuario_id?: number | null
  nombre_completo: string
  telefono?: string | null
  empresa?: string | null
  rfc?: string | null
  direccion?: string | null
  status?: string | null
}

export type PersonaLite = {
  id?: number
  nombre_completo?: string
  telefono?: string
  empresa?: string
}

export type UserRow = {
  id: number
  name: string
  email: string
  rol: UserRol
  status: UserStatus
  persona?: (PersonaLite & { id?: number }) | null
}

export type UserFilters = {
  q: string
  rol: string
  status: string
}

const ALL = '__all__'

type Options = {
  baseUrl?: string
  lookupUrl?: string
  initialFilters?: Partial<UserFilters>
}

export type UserForm = {
  persona_id: number | null
  name: string
  email: string
  rol: UserRol
  status: UserStatus
  password: string
}

export type UserFormErrors = Partial<Record<keyof UserForm, string>> & {
  form?: string
}

let swalStyled = false
function ensureSwalZIndex() {
  if (swalStyled) return
  const style = document.createElement('style')
  style.innerHTML = `.swal2-container{z-index:20000!important;}`
  document.head.appendChild(style)
  swalStyled = true
}

function toast(title: string, icon: 'success' | 'error' | 'info' | 'warning' = 'info') {
  ensureSwalZIndex()
  void Swal.fire({
    toast: true,
    position: 'top-end',
    icon,
    title,
    showConfirmButton: false,
    timer: 2200,
    timerProgressBar: true,
  })
}

function escapeHtml(s: string) {
  return (s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function normalizeBaseUrl(url: string) {
  let u = (url ?? '').trim()
  if (!u.startsWith('/')) u = '/' + u
  u = u.replace(/\/+$/, '')
  return u
}

export function useUserCrud(opts: Options = {}) {
  const baseUrl = normalizeBaseUrl(opts.baseUrl ?? '/admin/usuarios')
  const lookupUrl = normalizeBaseUrl(opts.lookupUrl ?? '/admin/users/personas-lookup')

  /* ======================
   * Filters (Inertia)
   * ====================== */
  const filters = reactive<UserFilters>({
    q: opts.initialFilters?.q ?? '',
    rol: opts.initialFilters?.rol ?? ALL,
    status: opts.initialFilters?.status ?? ALL,
  })

  let t: number | null = null
  const debouncedSync = () => {
    if (t) window.clearTimeout(t)
    t = window.setTimeout(() => {
      router.get(
        baseUrl,
        { ...filters },
        {
          preserveScroll: true,
          replace: true,
          preserveState: false,
        }
      )
    }, 260)
  }
  watch(() => [filters.q, filters.rol, filters.status], debouncedSync)

  const hasFilters = computed(() => !!filters.q.trim() || filters.rol !== ALL || filters.status !== ALL)

  const resetFilters = () => {
    filters.q = ''
    filters.rol = ALL
    filters.status = ALL
    router.get(baseUrl, { ...filters }, { preserveScroll: true, replace: true, preserveState: false })
  }

  /* ======================
   * Modal + Form
   * ====================== */
  const modalOpen = ref(false)
  const mode = ref<'create' | 'edit'>('create')
  const editingId = ref<number | null>(null)
  const busy = ref(false)

  // Persona picker UI state
  const pickerOpen = ref(false)

  const personaQuery = ref<string>('') // string SIEMPRE
  const personaLoading = ref(false)
  const personaResults = ref<PersonaPick[]>([])
  const selectedPersona = ref<PersonaPick | null>(null)

  const form = reactive<UserForm>({
    persona_id: null,
    name: '',
    email: '',
    rol: 'cliente',
    status: 'activo',
    password: '',
  })

  const errors = reactive<UserFormErrors>({})

  function clearErrors() {
    Object.keys(errors).forEach((k) => delete (errors as any)[k])
  }

  function resetPicker() {
    pickerOpen.value = false
    personaQuery.value = ''
    personaResults.value = []
    personaLoading.value = false
    selectedPersona.value = null
    form.persona_id = null
  }

  function setSelectedPersona(p: PersonaPick | null) {
    selectedPersona.value = p
    form.persona_id = p?.id ?? null
    personaQuery.value = p?.nombre_completo ?? ''
    personaResults.value = []
    pickerOpen.value = false
  }

  /* ======================
   * Personas lookup (cache + abort)
   * ====================== */
  const cache = new Map<string, PersonaPick[]>()
  let aborter: AbortController | null = null

  async function searchPersonas(qRaw: string) {
    const q = String(qRaw ?? '').trim()
    const key = `${mode.value}:${editingId.value ?? ''}:${q}`

    if (cache.has(key)) {
      personaResults.value = cache.get(key) ?? []
      personaLoading.value = false
      return
    }

    personaLoading.value = true

    if (aborter) aborter.abort()
    aborter = new AbortController()

    try {
      const params = new URLSearchParams()
      // VACÍO => backend regresa lista limitada
      if (q.length) params.set('q', q)
      params.set('limit', '10')
      if (mode.value === 'edit' && editingId.value) params.set('user_id', String(editingId.value))

      const res = await fetch(`${lookupUrl}?${params.toString()}`, {
        headers: { 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
        signal: aborter.signal,
      })

      if (!res.ok) {
        personaResults.value = []
        return
      }

      const json = (await res.json()) as { data?: PersonaPick[] }
      const data = Array.isArray(json?.data) ? json.data : []
      cache.set(key, data)
      personaResults.value = data
    } catch (e: any) {
      if (e?.name !== 'AbortError') personaResults.value = []
    } finally {
      personaLoading.value = false
    }
  }

  function openPicker() {
    if (selectedPersona.value) return
    pickerOpen.value = true
    // si está vacío, trae lista
    if (!personaLoading.value) void searchPersonas(personaQuery.value)
  }

  function closePickerSoon() {
    // delay para permitir click en +
    window.setTimeout(() => {
      pickerOpen.value = false
    }, 120)
  }

  function openCreate() {
    mode.value = 'create'
    editingId.value = null
    modalOpen.value = true

    clearErrors()

    form.persona_id = null
    form.name = ''
    form.email = ''
    form.rol = 'cliente'
    form.status = 'activo'
    form.password = ''

    resetPicker()
    pickerOpen.value = true
    void searchPersonas('')
  }

  function openEdit(user: UserRow) {
    mode.value = 'edit'
    editingId.value = user.id
    modalOpen.value = true

    clearErrors()

    form.name = user.name ?? ''
    form.email = user.email ?? ''
    form.rol = (user.rol ?? 'cliente') as UserRol
    form.status = (user.status ?? 'activo') as UserStatus
    form.password = ''

    // ✅ Precargar persona actual (si viene con id)
    const p = user.persona?.id
      ? ({
          id: Number(user.persona.id),
          nombre_completo: String(user.persona.nombre_completo ?? ''),
          telefono: (user.persona as any)?.telefono ?? null,
          empresa: (user.persona as any)?.empresa ?? null,
        } as PersonaPick)
      : null

    if (p?.id) {
      setSelectedPersona(p)
    } else {
      resetPicker()
      pickerOpen.value = true
      void searchPersonas('')
    }
  }

  function closeModal() {
    if (busy.value) return
    modalOpen.value = false
    pickerOpen.value = false
  }

  function selectPersona(p: PersonaPick) {
    setSelectedPersona(p)

    if (mode.value === 'create' || !form.name.trim()) {
      form.name = p.nombre_completo
    }
  }

  function clearPersonaSelection() {
    setSelectedPersona(null)
    pickerOpen.value = true
    void searchPersonas('')
  }

  let personaTimer: number | null = null
  watch(
    () => personaQuery.value,
    (v) => {
      const q = String(v ?? '').trim()
      if (personaTimer) window.clearTimeout(personaTimer)

      // si hay seleccionada y no cambió, no busques
      if (selectedPersona.value && q === selectedPersona.value.nombre_completo) return

      personaTimer = window.setTimeout(() => {
        if (!pickerOpen.value) pickerOpen.value = true

        if (q.length === 0) {
          void searchPersonas('')
          return
        }
        if (q.length < 2) {
          personaResults.value = []
          personaLoading.value = false
          return
        }
        void searchPersonas(q)
      }, 180)
    }
  )

  /* ======================
   * Validations
   * ====================== */
  function validate(): boolean {
    clearErrors()

    if (!form.persona_id) errors.persona_id = 'Selecciona una persona.'
    if (!form.name.trim()) errors.name = 'El nombre es obligatorio.'
    if (!form.email.trim() || !form.email.includes('@')) errors.email = 'Email inválido.'
    if (!form.rol) errors.rol = 'Selecciona un rol.'
    if (!form.status) errors.status = 'Selecciona un status.'

    if (mode.value === 'create') {
      if (!form.password.trim() || form.password.trim().length < 8) errors.password = 'Password mínimo 8 caracteres.'
    } else {
      if (form.password.trim() && form.password.trim().length < 8) errors.password = 'Password mínimo 8 caracteres.'
    }

    return Object.keys(errors).length === 0
  }

  /* ======================
   * Submit
   * ====================== */
  function submit() {
    if (busy.value) return
    if (!validate()) {
      toast('Revisa los campos', 'error')
      return
    }

    busy.value = true
    const done = () => (busy.value = false)

    const payload: any = {
      persona_id: form.persona_id,
      name: form.name.trim(),
      email: form.email.trim(),
      rol: form.rol,
      status: form.status,
      password: mode.value === 'create' ? form.password.trim() : (form.password.trim() ? form.password.trim() : null),
    }

    const successMsg = mode.value === 'edit' ? 'Usuario actualizado' : 'Usuario creado'

    if (mode.value === 'edit' && editingId.value) {
      router.put(`${baseUrl}/${editingId.value}`, payload, {
        preserveScroll: true,
        preserveState: false,
        onFinish: done,
        onError: () => {
          errors.form = 'No se pudo guardar. Revisa validaciones del backend.'
          toast('No se pudo guardar', 'error')
        },
        onSuccess: () => {
          toast(successMsg, 'success')
          closeModal()
        },
      })
      return
    }

    router.post(baseUrl, payload, {
      preserveScroll: true,
      preserveState: false,
      onFinish: done,
      onError: () => {
        errors.form = 'No se pudo crear. Revisa validaciones del backend.'
        toast('No se pudo crear', 'error')
      },
      onSuccess: () => {
        toast(successMsg, 'success')
        closeModal()
      },
    })
  }

  /* ======================
   * Delete => baja lógica
   * ====================== */
  async function deleteUser(user: UserRow) {
    ensureSwalZIndex()

    const res = await Swal.fire({
      title: user.status === 'activo' ? 'Desactivar usuario' : 'Usuario ya inactivo',
      html:
        user.status === 'activo'
          ? `Vas a desactivar a <b>${escapeHtml(user.name)}</b> (${escapeHtml(user.email)}).<br/>La persona quedará libre para reasignar.`
          : `Este usuario ya está inactivo.`,
      icon: user.status === 'activo' ? 'warning' : 'info',
      showCancelButton: user.status === 'activo',
      confirmButtonText: user.status === 'activo' ? 'Desactivar' : 'OK',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    })

    if (user.status !== 'activo') return
    if (!res.isConfirmed) return

    router.delete(`${baseUrl}/${user.id}`, {
      preserveScroll: true,
      preserveState: false,
      onSuccess: () => toast('Usuario desactivado', 'success'),
      onError: () => toast('No se pudo desactivar', 'error'),
    })
  }

  return {
    // filters
    filters,
    hasFilters,
    resetFilters,

    // modal / form
    modalOpen,
    mode,
    editingId,
    busy,
    form,
    errors,

    // persona lookup
    personaQuery,
    personaLoading,
    personaResults,
    selectedPersona,
    pickerOpen,
    openPicker,
    closePickerSoon,
    selectPersona,
    clearPersonaSelection,

    // actions
    openCreate,
    openEdit,
    closeModal,
    submit,
    deleteUser,
  }
}
