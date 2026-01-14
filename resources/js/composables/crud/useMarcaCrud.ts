import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

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

/**
 * Valor sentinela para "Todos" en selects.
 */
const ALL = '__all__'

type UseMarcaCrudOptions = {
  initialFilters?: Partial<MarcaFilters>
  baseUrl?: string
}

let swalStyled = false

/**
 * Inyecta estilos premium a SweetAlert2 una sola vez.
 * - Por defecto, tema oscuro (consistente con UI dark).
 * - Fallback claro si el sistema está en light (prefers-color-scheme).
 * - Ajuste de <option> para que no se “pierdan” en dropdown nativo.
 */
function ensureSwalTheme() {
  if (swalStyled) return
  swalStyled = true

  const style = document.createElement('style')
  style.innerHTML = `
    .swal2-container{ z-index: 20000 !important; }
    .swal2-popup{
      background:#0b0c10 !important;
      color:#e4e4e7 !important;
      border:1px solid rgba(0,0,0,.08) !important;
      border-radius:18px !important;
      box-shadow:0 25px 90px rgba(0,0,0,.40) !important;
      padding: 1.25rem 1.25rem 1rem !important;
    }
    .swal2-title{ font-weight: 900 !important; letter-spacing: -0.02em !important; }
    .swal2-html-container{ color: rgba(228,228,231,.85) !important; }

    .swal2-input, .swal2-select{
      background: rgba(255,255,255,.06) !important;
      color:#e4e4e7 !important;
      border:1px solid rgba(255,255,255,.14) !important;
      border-radius: 12px !important;
      box-shadow: none !important;
      height: 42px !important;
    }
    .swal2-input:focus, .swal2-select:focus{
      border-color: rgba(16,185,129,.55) !important;
      box-shadow: 0 0 0 4px rgba(16,185,129,.16) !important;
      outline: none !important;
    }

    .swal2-confirm{
      background:#10b981 !important;
      color:#050608 !important;
      border-radius: 12px !important;
      font-weight: 900 !important;
      padding: 10px 16px !important;
    }
    .swal2-cancel{
      background: rgba(255,255,255,.06) !important;
      color:#e4e4e7 !important;
      border:1px solid rgba(255,255,255,.14) !important;
      border-radius: 12px !important;
      font-weight: 800 !important;
      padding: 10px 16px !important;
    }

    /* Dropdown nativo: fuerza contraste de opciones */
    .swal2-select option{
      background: #0b0c10 !important;
      color: #e4e4e7 !important;
    }

    /* Light mode fallback: si el sistema está en light, SWAL se ve limpio en blanco */
    @media (prefers-color-scheme: light){
      .swal2-popup{
        background:#ffffff !important;
        color:#0f172a !important;
        border:1px solid rgba(2,6,23,.10) !important;
        box-shadow:0 25px 90px rgba(2,6,23,.15) !important;
      }
      .swal2-html-container{ color: rgba(15,23,42,.75) !important; }
      .swal2-input, .swal2-select{
        background:#ffffff !important;
        color:#0f172a !important;
        border:1px solid rgba(2,6,23,.12) !important;
      }
      .swal2-cancel{
        background: rgba(2,6,23,.04) !important;
        color:#0f172a !important;
        border:1px solid rgba(2,6,23,.10) !important;
      }
      .swal2-select option{
        background:#ffffff !important;
        color:#0f172a !important;
      }
    }
  `
  document.head.appendChild(style)
}

export function useMarcaCrud(options: UseMarcaCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/marcas'

  /* =========================
   * Filtros (debounce)
   * =========================
   * Objetivo:
   * - Mantener filtros en URL (Inertia) sin recargar la página
   * - Debounce para evitar peticiones por cada tecla
   */
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
   * =========================
   * Regla de negocio:
   * - Nuevo/Editar NO expone status
   * - Siempre se guarda como "activo"
   * - El cambio de estado es solo por Activar/Desactivar
   */
  async function openForm(marca?: Marca) {
    ensureSwalTheme()

    const isEdit = Boolean(marca)
    const current = marca
      ? { id: Number(marca.id), nombre: String(marca.nombre ?? '') }
      : null

    const { value } = await Swal.fire({
      title: isEdit ? 'Editar marca' : 'Nueva marca',
      html: `
        <div style="text-align:left; margin-top:.25rem;">
          <label style="display:block; font-size:12px; font-weight:800; opacity:.85; margin:0 0 .35rem;">
            Nombre
          </label>
          <input id="m_nombre" class="swal2-input" placeholder="Ej. Hikvision, Epcom, AccessPro…" value="${current?.nombre ?? ''}">
        </div>

        <p style="margin:.75rem 0 0; font-size:12px; opacity:.72;">
          El estado se gestiona desde el listado (Activar/Desactivar).
        </p>
      `,
      didOpen: () => {
        const n = document.getElementById('m_nombre') as HTMLInputElement | null
        n?.focus()
        n?.select()
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      preConfirm: () => {
        const nombre = (document.getElementById('m_nombre') as HTMLInputElement).value.trim()

        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio.')
          return
        }

        // status SIEMPRE activo en form
        return { nombre, status: 'activo' as const }
      },
    })

    if (!value) return

    if (isEdit && current) {
      router.put(`${baseUrl}/${current.id}`, value, {
        preserveScroll: true,
        onSuccess: () => toast('Marca actualizada', 'success'),
        onError: () => toast('Revisa los campos', 'error'),
      })
      return
    }

    router.post(baseUrl, value, {
      preserveScroll: true,
      onSuccess: () => toast('Marca creada', 'success'),
      onError: () => toast('Revisa los campos', 'error'),
    })
  }

  /* =========================
   * Status: baja lógica / activar
   * ========================= */
  async function deactivate(m: Marca) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Desactivar marca',
      text: `Se dará de baja "${m.nombre}" (baja lógica).`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    router.delete(`${baseUrl}/${m.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('Marca desactivada', 'success'),
      onError: () => toast('No se pudo desactivar', 'error'),
    })
  }

  async function activate(m: Marca) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Activar marca',
      text: `Se activará "${m.nombre}".`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })
    if (!isConfirmed) return

    // Payload completo por si tu UpdateRequest exige status/nombre
    router.put(
      `${baseUrl}/${m.id}`,
      { nombre: m.nombre, status: 'activo' as const },
      {
        preserveScroll: true,
        onSuccess: () => toast('Marca activada', 'success'),
        onError: () => toast('No se pudo activar', 'error'),
      }
    )
  }

  function toggleStatus(m: Marca) {
    return m.status === 'activo' ? deactivate(m) : activate(m)
  }

  /* =========================
   * Toast
   * ========================= */
  function toast(title: string, icon: 'success' | 'error' | 'info' | 'warning' = 'info') {
    ensureSwalTheme()
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
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
