import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import { swalModal, swalConfirm, swalNotify } from '@/lib/swal'

/**
 * Tipos de dominio para Marca.
 * Nota: status se gestiona con baja lógica (destroy => inactivo) y activar (update => activo).
 */
export type MarcaStatus = 'activo' | 'inactivo'

export type Marca = {
  id: number
  nombre: string
  status: MarcaStatus
}

/**
 * Filtros del index (Inertia).
 * - q: búsqueda por nombre
 * - status: activo | inactivo | __all__
 */
export type MarcaFilters = {
  q: string
  status: string
}

/** Valor sentinela para "Todos" en selects. */
const ALL = '__all__'

type UseMarcaCrudOptions = {
  initialFilters?: Partial<MarcaFilters>
  baseUrl?: string
}

function escapeHtml(s: string) {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

/** ícono info inline (sin lucide) */
function infoIconSvg() {
  return `
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" stroke="currentColor" stroke-width="2"/>
      <path d="M12 17v-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      <path d="M12 7.5h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
    </svg>
  `
}

export function useMarcaCrud(options: UseMarcaCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/marcas'

  /* =========================
   * Filtros (debounce)
   * ========================= */
  const filters = reactive<MarcaFilters>({
    q: options.initialFilters?.q ?? '',
    status: options.initialFilters?.status ?? ALL,
  })

  function buildParams() {
    const params: Record<string, string> = {}
    if (filters.q.trim()) params.q = filters.q.trim()
    if (filters.status !== ALL) params.status = filters.status
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
    filters.status = ALL
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

  const hasActiveFilters = computed(() => {
    return Boolean(filters.q.trim()) || filters.status !== ALL
  })

  /* =========================
   * Form (SweetAlert2)
   * ========================= */
  async function openForm(marca?: Marca) {
    const isEdit = Boolean(marca)
    const current = marca
      ? { id: Number(marca.id), nombre: String(marca.nombre ?? '') }
      : null

    const nombreVal = escapeHtml(current?.nombre ?? '')

    const html = `
      <div class="rsa-form">
        <div class="rsa-row">
          <div class="rsa-label-row">
            <label class="rsa-label" for="m_nombre">
              Nombre de la marca
              <span class="rsa-tip">
                <span class="rsa-tip-btn" tabindex="0" aria-label="Información del campo nombre">
                  ${infoIconSvg()}
                </span>
                <span class="rsa-tip-bubble">Usa el nombre comercial (ej. Hikvision, Epcom).</span>
              </span>
            </label>
          </div>

          <input
            id="m_nombre"
            class="swal2-input"
            placeholder="Ej. Hikvision, Epcom, AccessPro…"
            value="${nombreVal}"
            autocomplete="off"
          />
        </div>
      </div>
    `

    const { value } = await swalModal({
      title: isEdit ? 'Editar marca' : 'Nueva marca',
      html,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      didOpen: () => {
        const n = document.getElementById('m_nombre') as HTMLInputElement | null
        n?.focus()
        n?.select()
        n?.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            ;(window as any).Swal?.clickConfirm?.() // fallback si alguien monkeypatchea
          }
        })
      },
      preConfirm: () => {
        const nombre =
          (document.getElementById('m_nombre') as HTMLInputElement | null)?.value?.trim() ?? ''

        if (!nombre) {
          ;(window as any).Swal?.showValidationMessage?.('El nombre es obligatorio.')
          return
        }
        if (nombre.length < 2) {
          ;(window as any).Swal?.showValidationMessage?.('El nombre es demasiado corto.')
          return
        }

        return { nombre, status: 'activo' as const }
      },
    })

    if (!value) return

    if (isEdit && current) {
      router.put(`${baseUrl}/${current.id}`, value, {
        preserveScroll: true,
        onSuccess: () => swalNotify('Marca actualizada', 'success'),
        onError: () => swalNotify('Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, value, {
      preserveScroll: true,
      onSuccess: () => swalNotify('Marca creada', 'success'),
      onError: () => swalNotify('Revisa los campos', 'error'),
    })
  }

  /* =========================
   * Status: baja lógica / activar
   * ========================= */
  async function deactivate(m: Marca) {
    const { isConfirmed } = await swalConfirm(
      `Se dará de baja "${m.nombre}". ¿Estás seguro?`,
      { title: 'Desactivar marca', icon: 'warning', confirmText: 'Desactivar', cancelText: 'Cancelar' }
    )
    if (!isConfirmed) return

    router.delete(`${baseUrl}/${m.id}`, {
      preserveScroll: true,
      onSuccess: () => swalNotify('Marca desactivada', 'success'),
      onError: () => swalNotify('No se pudo desactivar', 'error'),
    })
  }

  async function activate(m: Marca) {
    const { isConfirmed } = await swalConfirm(`Se activará "${m.nombre}".`, {
      title: 'Activar marca',
      icon: 'question',
      confirmText: 'Activar',
      cancelText: 'Cancelar',
    })
    if (!isConfirmed) return

    router.put(
      `${baseUrl}/${m.id}`,
      { nombre: m.nombre, status: 'activo' as const },
      {
        preserveScroll: true,
        onSuccess: () => swalNotify('Marca activada', 'success'),
        onError: () => swalNotify('No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(m: Marca) {
    return m.status === 'activo' ? deactivate(m) : activate(m)
  }

  return {
    ALL,
    filters,
    hasActiveFilters,
    applyFilters,
    resetFilters,

    openForm,
    toggleStatus,
    activate,
    deactivate,
  }
}
