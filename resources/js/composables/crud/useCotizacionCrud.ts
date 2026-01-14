import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

/**
 * useCotizacionCrud (Cotizaciones/Index)
 * ------------------------------------
 * Pensado para UI de usuario final (no técnica):
 * - Filtros simples: buscar (folio/email/teléfono), estatus (ENVIADA/RECIBIDA/DEVUELTA), estado (activo/inactivo)
 * - "Nueva cotización" = carrito (modal) -> crea cotización y manda al workspace /cotizaciones/{id}/edit
 * - Activar/Desactivar = baja lógica (status activo/inactivo)
 *
 * Nota: El estatus que vive en BD puede ser distinto; aquí lo "traducimos" a etiquetas user-facing.
 */

export type CotizacionStatus = 'activo' | 'inactivo'

/**
 * Lo que recibimos del backend (según tu controlador actual):
 * meta.estatuses: ['BORRADOR','ENVIADA','APROBADA','RECHAZADA','CANCELADA']
 *
 * Pero el usuario final quiere:
 * - ENVIADA
 * - RECIBIDA
 * - DEVUELTA (cuando aplique: el cliente revisa su correo)
 *
 * Para no romper backend hoy, mapeamos cualquier valor desconocido a un "estado de UI".
 */
export type UiEstatus = 'ENVIADA' | 'RECIBIDA' | 'DEVUELTA' | 'BORRADOR'

export type Cotizacion = {
  id: number
  folio: string
  token?: string | null
  estatus: string
  email_destino?: string | null
  telefono_destino?: string | null
  subtotal: number | string
  total: number | string
  status: CotizacionStatus

  // Si tu Resource los incluye o los agregas después:
  persona?: any
  usuario?: any
  created_at?: string | null
}

export type CotizacionFilters = {
  q: string
  estatus: string
  status: string
}

const ALL = '__all__'

type UseCotizacionCrudOptions = {
  initialFilters?: Partial<CotizacionFilters>
  baseUrl?: string
}

let swalStyled = false

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
      padding: 1.15rem 1.15rem 1rem !important;
    }
    .swal2-title{ font-weight: 900 !important; letter-spacing: -0.02em !important; }
    .swal2-html-container{ color: rgba(228,228,231,.85) !important; }

    .swal2-input, .swal2-select, .swal2-textarea{
      background: rgba(255,255,255,.06) !important;
      color:#e4e4e7 !important;
      border:1px solid rgba(255,255,255,.14) !important;
      border-radius: 12px !important;
      box-shadow: none !important;
      height: 42px !important;
    }
    .swal2-textarea{
      height:auto !important;
      min-height: 88px !important;
      padding-top: 10px !important;
    }
    .swal2-input:focus, .swal2-select:focus, .swal2-textarea:focus{
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

    .swal2-select option{
      background:#0b0c10 !important;
      color:#e4e4e7 !important;
    }

    /* Light mode fallback */
    @media (prefers-color-scheme: light){
      .swal2-popup{
        background:#ffffff !important;
        color:#0f172a !important;
        border:1px solid rgba(2,6,23,.10) !important;
        box-shadow:0 25px 90px rgba(2,6,23,.15) !important;
      }
      .swal2-html-container{ color: rgba(15,23,42,.75) !important; }
      .swal2-input, .swal2-select, .swal2-textarea{
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

/**
 * Convierte el estatus real (backend) a etiqueta user-facing.
 * Ajusta aquí si cambias tu enum real en BD.
 */
function toUiEstatus(raw: string): UiEstatus {
  const v = String(raw ?? '').toUpperCase().trim()

  // Si algún día guardas DEVUELTA directamente, cae aquí:
  if (v === 'DEVUELTA') return 'DEVUELTA'

  // Tu backend hoy maneja ENVIADA como tal:
  if (v === 'ENVIADA') return 'ENVIADA'

  // Cuando confirmes "recibida" (o equivalente) en backend:
  if (v === 'RECIBIDA') return 'RECIBIDA'

  // Para que usuario final no vea “APROBADA/RECHAZADA/CANCELADA”,
  // lo bajamos a “RECIBIDA”/“DEVUELTA” según tu política.
  // Por default, todo lo no mapeado cae a BORRADOR.
  if (v === 'APROBADA') return 'RECIBIDA'
  if (v === 'RECHAZADA') return 'DEVUELTA'
  if (v === 'CANCELADA') return 'DEVUELTA'
  if (v === 'BORRADOR') return 'BORRADOR'

  return 'BORRADOR'
}

export function useCotizacionCrud(options: UseCotizacionCrudOptions = {}) {
  const baseUrl = options.baseUrl ?? '/cotizaciones'

  /* =========================
   * Filtros (debounce)
   * ========================= */
  const filters = reactive<CotizacionFilters>({
    q: options.initialFilters?.q ?? '',
    estatus: options.initialFilters?.estatus ?? ALL,
    status: options.initialFilters?.status ?? ALL,
  })

  function buildParams() {
    const params: Record<string, string> = {}
    if (filters.q.trim()) params.q = filters.q.trim()
    if (filters.estatus !== ALL) params.estatus = filters.estatus
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
    filters.estatus = ALL
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
    return Boolean(filters.q.trim()) || filters.estatus !== ALL || filters.status !== ALL
  })

  /* =========================
   * Navegación a “carrito” (workspace edit)
   * ========================= */
  function goEdit(c: Cotizacion) {
    router.get(`${baseUrl}/${c.id}/edit`, {}, { preserveScroll: true })
  }

  /**
   * Nueva cotización (carrito):
   * - No existe Create.vue => NO navegamos.
   * - Creamos la cotización en backend por POST /cotizaciones
   * - El backend redirige a /cotizaciones/{id}/edit (tu store ya lo hace)
   *
   * Campos:
   * - email_destino / telefono_destino: datos del cliente (opcional)
   * - estatus: BORRADOR (backend)
   * - status: activo
   *
   * Nota: si CotizacionStoreRequest exige persona_id/usuario_id, ajusta.
   */
  async function startCart() {
    ensureSwalTheme()

    const { value } = await Swal.fire({
      title: 'Nueva cotización',
      html: `
        <div style="text-align:left; margin-top:.25rem;">
          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            Correo (opcional)
          </label>
          <input id="cot_email" class="swal2-input" placeholder="cliente@correo.com">
        </div>

        <div style="text-align:left; margin-top:.75rem;">
          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            Teléfono (opcional)
          </label>
          <input id="cot_tel" class="swal2-input" placeholder="Ej. 7771234567">
        </div>

        <div style="text-align:left; margin-top:.75rem;">
          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            Nota (opcional)
          </label>
          <textarea id="cot_nota" class="swal2-textarea" placeholder="Ej. Necesito instalación + 2 cámaras…"></textarea>
        </div>

        <div style="margin-top:.75rem; font-size:12px; opacity:.85; text-align:left;">
          Se abrirá tu carrito para agregar productos/servicios.
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Abrir carrito',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      didOpen: () => {
        const e = document.getElementById('cot_email') as HTMLInputElement | null
        e?.focus()
      },
      preConfirm: () => {
        const email = (document.getElementById('cot_email') as HTMLInputElement).value.trim()
        const telefono = (document.getElementById('cot_tel') as HTMLInputElement).value.trim()
        const nota = (document.getElementById('cot_nota') as HTMLTextAreaElement).value.trim()

        // Validaciones suaves (usuario final)
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          Swal.showValidationMessage('Correo inválido.')
          return
        }

        return { email_destino: email || null, telefono_destino: telefono || null, nota: nota || null }
      },
    })

    if (!value) return

    // Creamos cotización -> el backend te redirige a edit.
    // Si tu CotizacionStoreRequest NO tiene "nota", no la mandes.
    router.post(
        baseUrl,
        {
          email_destino: value.email_destino,
          telefono_destino: value.telefono_destino,
          estatus: 'BORRADOR',
          status: 'activo',
        },
        {
          preserveScroll: true,
          onSuccess: () => toast('Carrito listo', 'success'),
      
          // Inertia te pasa los errores de validación aquí (422)
          onError: (errors) => {
            const list = Object.entries(errors ?? {})
              .map(([k, v]) => `• ${k}: ${String(v)}`)
              .join('<br>')
      
            Swal.fire({
              icon: 'error',
              title: 'No se pudo crear',
              html: list || 'El servidor rechazó la solicitud (revisa validaciones).',
              confirmButtonText: 'Entendido',
            })
          },
      
          // Si es 500 o excepción, esto a veces sí se dispara
          onFinish: () => {
            // Nada
          },
        }
      )      
  }

  /* =========================
   * Baja lógica / activar
   * ========================= */
  async function deactivate(c: Cotizacion) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Desactivar',
      text: `La cotización "${c.folio}" quedará inactiva.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Desactivar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })

    if (!isConfirmed) return

    router.delete(`${baseUrl}/${c.id}`, {
      preserveScroll: true,
      onSuccess: () => toast('Cotización desactivada', 'success'),
      onError: () => toast('No se pudo desactivar', 'error'),
    })
  }

  /**
   * Activar:
   * Tu backend no tiene endpoint dedicado para activar.
   * Mandamos PUT al update con status=activo.
   *
   * Si tu UpdateRequest exige otros campos, inclúyelos en tu Resource y aquí.
   */
  async function activate(c: Cotizacion) {
    ensureSwalTheme()

    const { isConfirmed } = await Swal.fire({
      title: 'Activar',
      text: `La cotización "${c.folio}" volverá a estar activa.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Activar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })

    if (!isConfirmed) return

    router.put(
      `${baseUrl}/${c.id}`,
      {
        folio: c.folio,
        token: c.token ?? null,
        estatus: c.estatus,
        email_destino: c.email_destino ?? null,
        telefono_destino: c.telefono_destino ?? null,
        subtotal: c.subtotal as any,
        total: c.total as any,
        status: 'activo' as const,
      },
      {
        preserveScroll: true,
        onSuccess: () => toast('Cotización activada', 'success'),
        onError: () => toast('No se pudo activar (UpdateRequest)', 'error'),
      }
    )
  }

  function toggleStatus(c: Cotizacion) {
    return c.status === 'activo' ? deactivate(c) : activate(c)
  }

  /* =========================
   * UI helpers (estatus user-facing)
   * ========================= */
  function uiEstatus(c: Cotizacion): UiEstatus {
    return toUiEstatus(c.estatus)
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

    startCart,
    goEdit,

    uiEstatus,
    toggleStatus,
    activate,
    deactivate,
  }
}
