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

export function useUserCrud(opts: Options = {}) {
  const baseUrl = normalizeBaseUrl(opts.baseUrl ?? '/admin/usuarios')
  const lookupUrl = normalizeBaseUrl(opts.lookupUrl ?? '/admin/usuarios/personas-lookup')

  /* ======================
   * Filtros (Inertia)
   *
   * PROBLEMA QUE TENÍAS:
   * - preserveState: false => Inertia re-monta la página
   * - al escribir 1 letra, se dispara navegación y pierdes foco / se “traba” el input
   *
   * SOLUCIÓN:
   * - preserveState: true
   * - only: ['users','filters'] para que no re-renderice de más
   * - debounce un poquito más amable
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
          preserveState: true, // clave para que no “mate” tu input al escribir
          replace: true,
          only: ['users', 'filters'], // solo refresca lo que cambia con filtros
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
    router.get(baseUrl, { ...filters }, { preserveScroll: true, preserveState: true, replace: true, only: ['users', 'filters'] })
  }

  function changePerPage(v: number) {
    // 0 = “Todos” (lo convertimos en backend a 100000)
    filters.per_page = v
  }

  /* ======================
   * Modal + Form
   * ====================== */
  const modalOpen = ref(false)
  const mode = ref<'create' | 'edit'>('create')
  const editingId = ref<number | null>(null)
  const busy = ref(false)

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

  function resetPersonaState() {
    personaResults.value = []
    personaLoading.value = false
    selectedPersona.value = null
    form.persona_id = null
  }

  /* ======================
   * Personas lookup
   *
   * Requisito:
   * - Si no escribo nada: mostrar TODAS las activas sin usuario
   * - Si escribo 2+ letras: filtrar
   *
   * Yo aquí las cargo “de golpe” (limit alto) para que SearchSelect filtre sin pegarle al server cada tecla.
   * Si prefieres server-side, se ajusta SearchSelect para emitir query y aquí llamamos con q.
   * ====================== */
  let aborter: AbortController | null = null
  async function fetchPersonasAllAvailable() {
    personaLoading.value = true
    if (aborter) aborter.abort()
    aborter = new AbortController()

    try {
      const params = new URLSearchParams()
      params.set('limit', '5000') // “todas” (hasta 5000)
      // q vacío => controller regresa todas las disponibles

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
    form.password = '' // no se usa en create, backend la genera

    resetPersonaState()
    void fetchPersonasAllAvailable()
  }

  function openEdit(user: UserRow) {
    mode.value = 'edit'
    editingId.value = user.id
    modalOpen.value = true

    clearErrors()

    form.email = user.email ?? ''
    form.rol = (user.rol ?? 'vendedor') as UserRol
    form.password = '' // opcional para reset

    // En edit la persona es fija, la muestro pero NO dejo cambiarla
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

    // Importante: aquí NO necesito cargar todas, porque en edit no se cambia.
    // Si quieres que el componente muestre el texto, con selectedPersona basta.
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
        form.name = ''
        return
      }

      const found = personaResults.value.find((x) => Number(x.id) === Number(id)) || null
      if (found) {
        selectedPersona.value = found
        if (mode.value === 'create') {
          // Nombre se fuerza a persona (y en el input va disabled)
          form.name = found.nombre_completo
        }
      }
    }
  )

  /* ======================
   * Validaciones
   * ====================== */
  function validate(): boolean {
    clearErrors()

    // persona solo obligatoria al crear
    if (mode.value === 'create' && !form.persona_id) errors.persona_id = 'Selecciona una persona.'
    if (!form.email.trim() || !form.email.includes('@')) errors.email = 'Email inválido.'
    if (!form.rol) errors.rol = 'Selecciona un rol.'

    // password solo en edit si quieren reset (mín 8)
    if (mode.value === 'edit' && form.password.trim() && form.password.trim().length < 8) {
      errors.password = 'Password mínimo 8 caracteres.'
    }

    return Object.keys(errors).length === 0
  }

  /* ======================
   * Guardar
   *
   * Create:
   * - NO mando password (la genera backend)
   * - NO mando status (backend controla)
   * - name lo ignoro en backend igual (se arma por persona), pero lo mando solo para UI si quieres.
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
        persona_id: form.persona_id, // backend valida que no cambie
        email: form.email.trim(),
        rol: form.rol,
        password: form.password.trim() ? form.password.trim() : null,
      }

      router.put(`${baseUrl}/${editingId.value}`, payload, {
        preserveScroll: true,
        preserveState: false,
        onFinish: done,
        onError: () => {
          errors.form = 'No se pudo guardar. Revisa validaciones del backend.'
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
      // name y password NO son necesarios (backend manda la verdad),
      // pero no estorban si llegan.
    }

    router.post(baseUrl, payload, {
      preserveScroll: true,
      preserveState: false,
      onFinish: done,
      onError: () => {
        errors.form = 'No se pudo crear. Revisa validaciones del backend.'
        void swalNotify('No se pudo crear', 'error')
      },
      onSuccess: () => {
        void swalNotify('Usuario creado', 'success')
        closeModal()
      },
    })
  }

  /* ======================
   * Eliminar / Activar (lógico)
   *
   * - Antes: DELETE solo desactivaba y además soltaba persona (eso ya NO).
   * - Ahora:
   *   * Activo  -> “Eliminar” (DELETE)
   *   * Inactivo -> “Activar” (PATCH /activar)
   * ====================== */
  async function toggleUser(user: UserRow) {
    if (user.status === 'activo') {
      const res = await swalConfirm('Esto es una eliminación lógica. El usuario no podrá entrar.', {
        title: `Eliminar a ${user.name}`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        icon: 'warning',
      })
      if (!res.isConfirmed) return

      router.delete(`${baseUrl}/${user.id}`, {
        preserveScroll: true,
        preserveState: false,
        onSuccess: () => void swalNotify('Usuario eliminado (lógico)', 'success'),
        onError: () => void swalErr('No se pudo eliminar. Intenta de nuevo.'),
      })
      return
    }

    // Activar
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