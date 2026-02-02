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
  // “Todos” en selector por página usa 0
  initialPerPage?: number | null
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
  const lookupUrl = normalizeBaseUrl(opts.lookupUrl ?? '/admin/usuarios/personas-lookup')

  /* ======================
   * Filters (Inertia)
   * ====================== */
  const filters = reactive<UserFilters>({
    q: opts.initialFilters?.q ?? '',
    rol: opts.initialFilters?.rol ?? ALL,
    status: opts.initialFilters?.status ?? ALL,
    per_page: typeof opts.initialPerPage === 'number' ? opts.initialPerPage : (opts.initialFilters?.per_page ?? null),
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
    router.get(baseUrl, { ...filters }, { preserveScroll: true, replace: true, preserveState: false })
  }

  function changePerPage(v: number) {
    // 0 = Todos
    filters.per_page = v
    // el watch ya dispara router.get con debounce
  }

  /* ======================
   * Modal + Form
   * ====================== */
  const modalOpen = ref(false)
  const mode = ref<'create' | 'edit'>('create')
  const editingId = ref<number | null>(null)
  const busy = ref(false)

  // Personas (para SearchSelect)
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

  function resetPersonaState() {
    personaResults.value = []
    personaLoading.value = false
    selectedPersona.value = null
    form.persona_id = null
  }

  function setSelectedPersona(p: PersonaPick | null) {
    selectedPersona.value = p
    form.persona_id = p?.id ?? null
  }

  /* ======================
   * Personas lookup (cache + abort)
   * - clave: cargar “todas” las disponibles (sin usuario)
   * - el filtrado lo hace SearchSelect en cliente
   * ====================== */
  const cache = new Map<string, PersonaPick[]>()
  let aborter: AbortController | null = null

  async function fetchPersonasAllAvailable() {
    const key = `${mode.value}:${editingId.value ?? ''}:__all__`

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
      // q vacío => backend regresa lista de disponibles
      // IMPORTANTE: aquí pedimos “muchas” para que SearchSelect filtre cliente.
      // (si tu controller todavía limita a 20, sube el cap. Si no, no habrá magia.)
      params.set('limit', '5000')
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
    form.rol = (user.rol ?? 'cliente') as UserRol
    form.status = (user.status ?? 'activo') as UserStatus
    form.password = ''

    // Precargar persona actual si viene
    const p = user.persona?.id
      ? ({
          id: Number(user.persona.id),
          nombre_completo: String(user.persona.nombre_completo ?? ''),
          telefono: (user.persona as any)?.telefono ?? null,
          empresa: (user.persona as any)?.empresa ?? null,
        } as PersonaPick)
      : null

    resetPersonaState()
    if (p?.id) setSelectedPersona(p)

    void fetchPersonasAllAvailable()
  }

  function closeModal() {
    if (busy.value) return
    modalOpen.value = false
  }

  function clearPersonaSelection() {
    setSelectedPersona(null)
  }

  // Con SearchSelect: cuando cambia persona_id, sincroniza selectedPersona
  watch(
    () => form.persona_id,
    (id) => {
      if (!id) {
        selectedPersona.value = null
        return
      }
      const found =
        personaResults.value.find((x) => Number(x.id) === Number(id)) ||
        (selectedPersona.value?.id === Number(id) ? selectedPersona.value : null)

      if (found) {
        selectedPersona.value = found
        // auto-fill name en create o si está vacío
        if (mode.value === 'create' || !form.name.trim()) {
          form.name = found.nombre_completo
        }
      }
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
      void swalNotify('Revisa los campos', 'error')
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
        onError: (e) => {
          errors.form = 'No se pudo guardar. Revisa validaciones del backend.'
          void swalNotify('No se pudo guardar', 'error')
          // si backend devuelve fields, se pintan en el form desde tu página (si ya lo haces),
          // aquí dejamos el mensaje enterprise.
          console.error(e)
        },
        onSuccess: () => {
          void swalNotify(successMsg, 'success')
          closeModal()
        },
      })
      return
    }

    router.post(baseUrl, payload, {
      preserveScroll: true,
      preserveState: false,
      onFinish: done,
      onError: (e) => {
        errors.form = 'No se pudo crear. Revisa validaciones del backend.'
        void swalNotify('No se pudo crear', 'error')
        console.error(e)
      },
      onSuccess: () => {
        void swalNotify(successMsg, 'success')
        closeModal()
      },
    })
  }

  /* ======================
   * Delete => baja lógica
   * ====================== */
  async function deleteUser(user: UserRow) {
    if (user.status !== 'activo') {
      void swalNotify('Este usuario ya está inactivo', 'info')
      return
    }

    const res = await swalConfirm('La persona quedará libre para reasignar.', {
      title: `Desactivar a ${user.name}`,
      confirmText: 'Desactivar',
      cancelText: 'Cancelar',
      icon: 'warning',
    })

    if (!res.isConfirmed) return

    router.delete(`${baseUrl}/${user.id}`, {
      preserveScroll: true,
      preserveState: false,
      onSuccess: () => void swalNotify('Usuario desactivado', 'success'),
      onError: () => void swalErr('No se pudo desactivar. Intenta de nuevo.'),
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
    form,
    errors,

    // personas (SearchSelect)
    personaLoading,
    personaResults,
    selectedPersona,
    clearPersonaSelection,

    // actions
    openCreate,
    openEdit,
    closeModal,
    submit,
    deleteUser,
  }
}