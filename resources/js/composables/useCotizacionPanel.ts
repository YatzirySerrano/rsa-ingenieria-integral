import Swal from 'sweetalert2'
import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

export type Cotizacion = {
  id: number
  folio: string
  estatus: string // ENVIADA / EN_REVISION / DEVUELTA ... (lo que tengas en BD)
  email_destino?: string | null
  telefono_destino?: string | null
  subtotal: number | string
  total: number | string

  // Campos opcionales (recomendados para control)
  total_calculado?: number | string | null
  diferencia_total?: number | string | null

  // Respuesta del staff (opcional)
  respuesta_resumen?: string | null
  descuento_monto?: number | string | null
  total_final?: number | string | null

  created_at?: string | null
}

export type CotizacionFilters = {
  q: string
  estatus: string
}

const ALL = '__all__'

type UseCotizacionPanelOptions = {
  initialFilters?: Partial<CotizacionFilters>
  baseUrl?: string
}

type UiEstatus = 'NUEVA' | 'EN_REVISION' | 'DEVUELTA'

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
      border:1px solid rgba(255,255,255,.10) !important;
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
      min-height: 92px !important;
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
    }
  `
  document.head.appendChild(style)
}

function isValidEmail(v?: string | null) {
  const s = String(v ?? '').trim()
  if (!s) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)
}

function isValidPhoneMX(v?: string | null) {
  const s = String(v ?? '').replace(/\D/g, '')
  return s.length >= 10
}

function n(v: any) {
  const x = typeof v === 'string' ? Number(v) : Number(v ?? 0)
  return Number.isNaN(x) ? 0 : x
}

function toUiEstatus(raw: string): UiEstatus {
  const v = String(raw ?? '').toUpperCase().trim()

  // Ajusta a tus enums reales:
  if (v === 'ENVIADA' || v === 'NUEVA') return 'NUEVA'
  if (v === 'EN_REVISION' || v === 'REVISION' || v === 'RECIBIDA') return 'EN_REVISION'
  if (v === 'DEVUELTA' || v === 'RESPONDIDA') return 'DEVUELTA'

  // Default: si llega algo raro, trátalo como “en revisión”
  return 'EN_REVISION'
}

export function useCotizacionPanel(options: UseCotizacionPanelOptions = {}) {
  const baseUrl = options.baseUrl ?? '/panel/cotizaciones'

  const filters = reactive<CotizacionFilters>({
    q: options.initialFilters?.q ?? '',
    estatus: options.initialFilters?.estatus ?? ALL,
  })

  function buildParams() {
    const params: Record<string, string> = {}
    if (filters.q.trim()) params.q = filters.q.trim()
    if (filters.estatus !== ALL) params.estatus = filters.estatus
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
    return Boolean(filters.q.trim()) || filters.estatus !== ALL
  })

  function uiEstatus(c: Cotizacion): UiEstatus {
    return toUiEstatus(c.estatus)
  }

  function openDetail(c: Cotizacion) {
    router.get(`${baseUrl}/${c.id}`, {}, { preserveScroll: true })
  }

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

  /**
   * Reply flow:
   * - Captura descuento (opcional) y un resumen corto para el cliente
   * - Guarda en backend y marca como DEVUELTA (o el estatus que uses)
   *
   * Endpoints sugeridos:
   * PUT /panel/cotizaciones/{id}/reply
   * payload: { descuento_monto, resumen, total_final }
   */
  async function replyFlow(c: Cotizacion) {
    ensureSwalTheme()

    const totalCliente = n(c.total)
    const totalCalculado = c.total_calculado != null ? n(c.total_calculado) : totalCliente
    const base = totalCalculado || totalCliente

    const { value } = await Swal.fire({
      title: `Responder cotización ${c.folio}`,
      html: `
        <div style="text-align:left; margin-top:.25rem;">
          <div style="font-size:12px; opacity:.85; margin-bottom:.6rem;">
            Total cliente: <b>$${totalCliente.toFixed(2)}</b>
            &nbsp;|&nbsp;
            Total sistema: <b>$${base.toFixed(2)}</b>
          </div>

          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:0 0 .35rem;">
            Descuento (opcional, monto)
          </label>
          <input id="cot_desc" class="swal2-input" placeholder="Ej. 250" inputmode="decimal">

          <label style="display:block; font-size:12px; font-weight:900; opacity:.85; margin:.75rem 0 .35rem;">
            Resumen para el cliente (corto y claro)
          </label>
          <textarea id="cot_resumen" class="swal2-textarea" placeholder="Ej. Cotización lista. Incluye instalación y garantía de 12 meses."></textarea>

          <div style="margin-top:.75rem; font-size:12px; opacity:.85;">
            Se marcará como <b>DEVUELTA</b> y quedará lista para enviar por WhatsApp o Gmail.
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar respuesta',
      cancelButtonText: 'Cancelar',
      focusConfirm: false,
      didOpen: () => {
        const r = document.getElementById('cot_resumen') as HTMLTextAreaElement | null
        r?.focus()
      },
      preConfirm: () => {
        const descRaw = (document.getElementById('cot_desc') as HTMLInputElement).value.trim()
        const resumen = (document.getElementById('cot_resumen') as HTMLTextAreaElement).value.trim()

        const descuento = descRaw ? Number(descRaw) : 0
        if (Number.isNaN(descuento) || descuento < 0) {
          Swal.showValidationMessage('El descuento debe ser un número válido (>= 0).')
          return
        }

        if (!resumen) {
          Swal.showValidationMessage('Escribe un resumen corto para el cliente.')
          return
        }

        const totalFinal = Math.max(0, base - descuento)

        return {
          descuento_monto: descuento || 0,
          resumen,
          total_final: totalFinal,
        }
      },
    })

    if (!value) return

    router.put(
      `${baseUrl}/${c.id}/reply`,
      {
        descuento_monto: value.descuento_monto,
        respuesta_resumen: value.resumen,
        total_final: value.total_final,
      },
      {
        preserveScroll: true,
        onSuccess: () => toast('Respuesta guardada', 'success'),
        onError: (errors) => {
          const list = Object.entries(errors ?? {})
            .map(([k, v]) => `• ${k}: ${String(v)}`)
            .join('<br>')
          Swal.fire({
            icon: 'error',
            title: 'No se pudo guardar',
            html: list || 'El servidor rechazó la solicitud.',
            confirmButtonText: 'Entendido',
          })
        },
      }
    )
  }

  /**
   * Envío por Gmail
   * Endpoint sugerido:
   * POST /panel/cotizaciones/{id}/send-email
   */
  async function sendEmail(c: Cotizacion) {
    ensureSwalTheme()

    if (!isValidEmail(c.email_destino ?? null)) {
      toast('Correo inválido o vacío', 'warning')
      return
    }

    const { isConfirmed } = await Swal.fire({
      title: 'Enviar por correo',
      text: `Se enviará la respuesta al correo: ${String(c.email_destino).trim()}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })

    if (!isConfirmed) return

    router.post(
      `${baseUrl}/${c.id}/send-email`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast('Correo enviado', 'success'),
        onError: () => toast('No se pudo enviar el correo', 'error'),
      }
    )
  }

  /**
   * Envío por WhatsApp
   * Endpoint sugerido:
   * POST /panel/cotizaciones/{id}/send-whatsapp
   *
   * Nota: si lo vas a integrar con Whaticket, aquí solo dispara backend.
   */
  async function sendWhatsapp(c: Cotizacion) {
    ensureSwalTheme()

    if (!isValidPhoneMX(c.telefono_destino ?? null)) {
      toast('Teléfono inválido o vacío', 'warning')
      return
    }

    const { isConfirmed } = await Swal.fire({
      title: 'Enviar por WhatsApp',
      text: `Se enviará la respuesta al número: ${String(c.telefono_destino).trim()}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Enviar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
    })

    if (!isConfirmed) return

    router.post(
      `${baseUrl}/${c.id}/send-whatsapp`,
      {},
      {
        preserveScroll: true,
        onSuccess: () => toast('WhatsApp disparado', 'success'),
        onError: () => toast('No se pudo enviar por WhatsApp', 'error'),
      }
    )
  }

  function canSendEmail(c: Cotizacion) {
    // Regla de negocio:
    // Para enviar, idealmente ya existe respuesta guardada.
    // Si quieres permitir envío aunque no haya respuesta, quita el check de respuesta_resumen.
    return isValidEmail(c.email_destino ?? null) && Boolean(String(c.respuesta_resumen ?? '').trim())
  }

  function canSendWhatsapp(c: Cotizacion) {
    return isValidPhoneMX(c.telefono_destino ?? null) && Boolean(String(c.respuesta_resumen ?? '').trim())
  }

  return {
    ALL,
    filters,
    hasActiveFilters,
    applyFilters,
    resetFilters,

    uiEstatus,
    openDetail,

    replyFlow,
    sendEmail,
    sendWhatsapp,
    canSendEmail,
    canSendWhatsapp,
  }
}
