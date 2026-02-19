// resources/js/composables/crud/useUserCrud.ts
import { computed, reactive, ref, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import { swalConfirm, swalNotify, swalErr } from '@/lib/swal'

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
  per_page?: number | null
}

const ALL = '__all__'

type Options = {
  baseUrl?: string
  lookupUrl?: string
  initialFilters?: Partial<UserFilters>
  initialPerPage?: number | null
}

export type UserForm = {
  persona_id: number | null
  name: string
  email: string
  rol: UserRol
  password: string // solo para reset en edit; en create se genera en backend
}

export type UserFormErrors = Partial<Record<keyof UserForm, string>> & {
  form?: string
}

function normalizeBaseUrl(url: string) {
  let u = (url ?? '').trim()
  if (!u.startsWith('/')) u = '/' + u
  u = u.replace(/\/+$/, '')
  return u
}

function isInertiaValidationErrors(x: unknown): x is Record<string, string> {
  return !!x && typeof x === 'object'
}

export function useUserCrud(opts: Options = {}) {
  const baseUrl = normalizeBaseUrl(opts.baseUrl ?? '/admin/usuarios')
  const lookupUrl = normalizeBaseUrl(opts.lookupUrl ?? '/admin/usuarios/personas-lookup')

  /* ======================
   * Filtros (Inertia)
   * ====================== */
  const filters = reactive<UserFilters>({
    q: opts.initialFilters?.q ?? '',
    rol: opts.initialFilters?.rol ?? ALL,
    status: opts.initialFilters?.status ?? ALL,
    per_page:
      typeof opts.initialPerPage === 'number'
        ? opts.initialPerPage
        : (opts.initialFilters?.per_page ?? null),
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
          preserveState: true,
          replace: true,
          only: ['users', 'filters', 'flash', 'catalogs'],
        }
      )
    }, 420)
  }

  watch(() => [filters.q, filters.rol, filters.status, filters.per_page], debouncedSync)

  const hasFilters = computed(() => {
    const hasText = !!filters.q.trim()
    const hasRol = filters.rol !== ALL
    const hasStatus = filters.status !== ALL
    return hasText || hasRol || hasStatus
  })

  const resetFilters = () => {
    filters.q = ''
    filters.rol = ALL
    filters.status = ALL
    router.get(
      baseUrl,
      { ...filters },
      { preserveScroll: true, preserveState: true, replace: true, only: ['users', 'filters', 'flash', 'catalogs'] }
    )
  }

  function changePerPage(v: number) {
    filters.per_page = v
  }

  /* ======================
   * Modal + Form
   * ====================== */
  const modalOpen = ref(false)
  const mode = ref<'create' | 'edit'>('create')
  const editingId = ref<number | null>(null)
  const busy = ref(false)

  const busyText = computed(() => {
    if (!busy.value) return ''
    return mode.value === 'create' ? 'Enviando correo…' : 'Guardando…'
  })

  // Personas
  const personaLoading = ref(false)
  const personaResults = ref<PersonaPick[]>([])
  const selectedPersona = ref<PersonaPick | null>(null)

  const form = reactive<UserForm>({
    persona_id: null,
    name: '',
    email: '',
    rol: 'vendedor',
    password: '',
  })

  const errors = reactive<UserFormErrors>({})

  function clearErrors() {
    Object.keys(errors).forEach((k) => delete (errors as any)[k])
  }

  function applyBackendErrors(e: unknown) {
    if (!isInertiaValidationErrors(e)) return
    clearErrors()
    for (const [k, v] of Object.entries(e)) {
      ;(errors as any)[k] = String(v)
    }
  }

  function resetPersonaState() {
    personaResults.value = []
    personaLoading.value = false
    selectedPersona.value = null
    form.persona_id = null
  }

  /* ======================
   * Personas lookup
   * ====================== */
  let aborter: AbortController | null = null
  async function fetchPersonasAllAvailable() {
    personaLoading.value = true
    if (aborter) aborter.abort()
    aborter = new AbortController()

    try {
      const params = new URLSearchParams()
      params.set('limit', '5000')

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
      personaResults.value = Array.isArray(json?.data) ? json.data : []
    } catch (e: any) {
      if (e?.name !== 'AbortError') personaResults.value = []
    } finally {
      personaLoading.value = false
    }
  }

  function openCreate() {
    mode.value = 'create'
    editingId.value = null
    modalOpen.value = true

    clearErrors()

    form.persona_id = null
    form.name = ''
    form.email = ''
    form.rol = 'vendedor'
    form.password = ''

    resetPersonaState()
    void fetchPersonasAllAvailable()
  }

  function openEdit(user: UserRow) {
    mode.value = 'edit'
    editingId.value = user.id
    modalOpen.value = true

    clearErrors()

    form.name = user.name ?? ''
    form.email = user.email ?? ''
    form.rol = (user.rol ?? 'vendedor') as UserRol
    form.password = ''

    const p = user.persona?.id
      ? ({
          id: Number(user.persona.id),
          nombre_completo: String(user.persona.nombre_completo ?? ''),
          telefono: (user.persona as any)?.telefono ?? null,
          empresa: (user.persona as any)?.empresa ?? null,
        } as PersonaPick)
      : null

    resetPersonaState()
    selectedPersona.value = p
    form.persona_id = p?.id ?? null
  }

  function closeModal() {
    if (busy.value) return
    modalOpen.value = false
  }

  // Autollenado de name desde persona (solo create)
  watch(
    () => form.persona_id,
    (id) => {
      if (!id) {
        selectedPersona.value = null
        if (mode.value === 'create') form.name = ''
        return
      }

      const found = personaResults.value.find((x) => Number(x.id) === Number(id)) || null
      if (found) {
        selectedPersona.value = found
        if (mode.value === 'create') form.name = found.nombre_completo
      }
    }
  )

  /* ======================
   * Validaciones
   * ====================== */
  function validate(): boolean {
    clearErrors()

    if (mode.value === 'create' && !form.persona_id) errors.persona_id = 'Selecciona una persona.'
    if (!form.email.trim() || !form.email.includes('@')) errors.email = 'Email inválido.'
    if (!form.rol) errors.rol = 'Selecciona un rol.'
    if (mode.value === 'edit' && form.password.trim() && form.password.trim().length < 8) {
      errors.password = 'Password mínimo 8 caracteres.'
    }

    return Object.keys(errors).length === 0
  }

  /* ======================
   * Guardar
   * ====================== */
  function submit() {
    if (busy.value) return
    if (!validate()) {
      void swalNotify('Revisa los campos', 'error')
      return
    }

    busy.value = true
    const done = () => (busy.value = false)

    if (mode.value === 'edit' && editingId.value) {
      const payload: any = {
        persona_id: form.persona_id,
        email: form.email.trim(),
        rol: form.rol,
        password: form.password.trim() ? form.password.trim() : null,
      }

      router.put(`${baseUrl}/${editingId.value}`, payload, {
        preserveScroll: true,
        preserveState: false,
        onFinish: done,
        onError: (e) => {
          applyBackendErrors(e)
          errors.form = errors.form || 'No se pudo guardar. Revisa validaciones del backend.'
          void swalNotify('No se pudo guardar', 'error')
        },
        onSuccess: () => {
          void swalNotify('Usuario actualizado', 'success')
          closeModal()
        },
      })
      return
    }

    // CREATE
    const payload: any = {
      persona_id: form.persona_id,
      email: form.email.trim(),
      rol: form.rol,
    }

    router.post(baseUrl, payload, {
      preserveScroll: true,
      preserveState: false,
      onFinish: done,
      onError: (e) => {
        applyBackendErrors(e)
        errors.form = errors.form || 'No se pudo crear. Revisa validaciones del backend.'
        void swalNotify('No se pudo crear', 'error')
      },
      onSuccess: () => {
        void swalNotify('Usuario creado', 'success')
        closeModal()
      },
    })
  }

  /* ======================
   * Eliminar / Activar
   * ====================== */
  async function toggleUser(user: UserRow) {
    if (user.status === 'activo') {
      const res = await swalConfirm('Esto es una eliminación. El usuario no podrá entrar.', {
        title: `Eliminar a ${user.name}`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        icon: 'warning',
      })
      if (!res.isConfirmed) return

      router.delete(`${baseUrl}/${user.id}`, {
        preserveScroll: true,
        preserveState: false,
        onSuccess: () => void swalNotify('Usuario eliminado', 'success'),
        onError: () => void swalErr('No se pudo eliminar. Intenta de nuevo.'),
      })
      return
    }

    const res = await swalConfirm('El usuario podrá volver a entrar al sistema.', {
      title: `Activar a ${user.name}`,
      confirmText: 'Activar',
      cancelText: 'Cancelar',
      icon: 'question',
    })
    if (!res.isConfirmed) return

    router.patch(`${baseUrl}/${user.id}/activar`, {}, {
      preserveScroll: true,
      preserveState: false,
      onSuccess: () => void swalNotify('Usuario activado', 'success'),
      onError: () => void swalErr('No se pudo activar. Intenta de nuevo.'),
    })
  }

  return {
    // filters
    filters,
    hasFilters,
    resetFilters,
    changePerPage,

    // modal / form
    modalOpen,
    mode,
    editingId,
    busy,
    busyText,
    form,
    errors,

    // personas
    personaLoading,
    personaResults,
    selectedPersona,

    // actions
    openCreate,
    openEdit,
    closeModal,
    submit,
    toggleUser,
  }
}
