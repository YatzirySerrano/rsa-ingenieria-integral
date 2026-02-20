import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import { swalConfirm, swalErr, swalNotify, swalLoading, swalClose} from '@/lib/swal'
import axios from 'axios'

export type Cotizacion = {
  id: number
  folio: string
  token: string
  estatus: string
  email_destino?: string | null
  telefono_destino?: string | null
  subtotal: number | string
  total: number | string
  total_calculado?: number | null
  diferencia_total?: number | null
  status: 'activo' | 'inactivo'
}

type Filters = { q: string; estatus: string }
const ALL = '__all__'

function debounce<T extends (...args: any[]) => void>(fn: T, ms = 300) {
  let t: any
  return (...args: Parameters<T>) => {
    clearTimeout(t)
    t = setTimeout(() => fn(...args), ms)
  }
}

function isEmail(s?: string | null) {
  const v = String(s ?? '').trim()
  if (!v) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function cleanPhone(s?: string | null) {
  const raw = String(s ?? '')
  const digits = raw.replace(/\D+/g, '')
  if (!digits) return ''
  if (digits.length === 10) return `52${digits}`
  if (digits.startsWith('52') && digits.length >= 12) return digits
  return digits
}

export function useCotizacionPanel(opts: { initialFilters?: Partial<Filters>; baseUrl: string }) {
  const filters = reactive<Filters>({
    q: String(opts.initialFilters?.q ?? ''),
    estatus: String(opts.initialFilters?.estatus ?? ALL),
  })

  const hasActiveFilters = computed(() => {
    const q = filters.q.trim()
    const e = filters.estatus
    return !!q || (e && e !== ALL)
  })

  function apply() {
    router.get(
      opts.baseUrl,
      {
        q: filters.q.trim() || undefined,
        estatus: filters.estatus === ALL ? undefined : filters.estatus,
      },
      { preserveScroll: true, preserveState: true, replace: true }
    )
  }

  const applyDebounced = debounce(apply, 350)

  watch(
    () => [filters.q, filters.estatus],
    () => applyDebounced()
  )

  function resetFilters() {
    filters.q = ''
    filters.estatus = ALL
    apply()
  }

  // FIX: ENVIADA no es DEVUELTA
  function uiEstatus(c: Pick<Cotizacion, 'estatus'>) {
    const e = String(c.estatus ?? '').toUpperCase()
    if (e === 'BORRADOR') return 'NUEVA'
    if (e === 'EN_REVISION') return 'EN_REVISION'
    if (e === 'DEVUELTA') return 'DEVUELTA'
    if (e === 'ENVIADA') return 'ENVIADA'
    return 'NUEVA'
  }

  function openDetail(c: Pick<Cotizacion, 'id'>) {
    router.visit(`${opts.baseUrl}/${c.id}`)
  }

  function replyFlow(c: Pick<Cotizacion, 'id'>) {
    router.visit(`${opts.baseUrl}/${c.id}?reply=1`)
  }

  // Permite enviar desde EN_REVISION / DEVUELTA / ENVIADA (reenviar) / BORRADOR si es interna
  function canSendEmail(c: Cotizacion) {
    return isEmail(c.email_destino) && c.status === 'activo'
  }

  function canSendWhatsapp(c: Cotizacion) {
    const p = cleanPhone(c.telefono_destino)
    return !!p && c.status === 'activo'
  }

    async function sendEmail(c: Cotizacion) {
    if (!isEmail(c.email_destino)) return swalErr('Falta correo válido.')

    const { isConfirmed } = await swalConfirm(
        `El sistema enviará la cotización ${c.folio} a ${String(c.email_destino).trim()}.`,
        { title: 'Enviar por correo', confirmText: 'Enviar' }
    )
    if (!isConfirmed) return

    // tu helper swalLoading (según tu TS) recibe 1 argumento
    swalLoading('Espere, se está enviando el correo...')

    try {
        const to = String(c.email_destino).trim()

        const { data } = await axios.post(
        `${opts.baseUrl}/${c.id}/send-email`,
        { email: to },
        { headers: { Accept: 'application/json' } }
        )

        // 1) cierra loading
        swalClose()
        // 2) ahora sí muestra éxito (ya no se “mata”)
        swalNotify(`Correo enviado a ${data?.to ?? to}`, 'success')

        // refresca listado sin romper tu UX
        apply()
    } catch (err: any) {
        // cierra loading también en error
        swalClose()
        const msg = err?.response?.data?.message ?? 'No se pudo enviar el correo. Revisa logs.'
        swalErr(msg)
    }
    }

  // WhatsApp sigue siendo “abrir WA” y luego marcar ENVIADA (manual)
  async function sendWhatsapp(c: Cotizacion) {
    const phone = cleanPhone(c.telefono_destino)
    if (!phone) return swalErr('Falta teléfono válido.')

    const { isConfirmed } = await swalConfirm(`Se abrirá WhatsApp para enviar la cotización ${c.folio}.`, {
      title: 'Enviar por WhatsApp',
      confirmText: 'Abrir WhatsApp',
    })
    if (!isConfirmed) return

    const link = `${window.location.origin}/cotizacion/${c.token}`
    const msg = `Hola, te comparto tu cotización ${c.folio}.\n${link}`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')

    router.post(`${opts.baseUrl}/${c.id}/mark-sent`, { channel: 'whatsapp' }, { preserveScroll: true })
    swalNotify('WhatsApp abierto, cotización marcada como ENVIADA', 'success')
  }

  return {
    ALL,
    filters,
    hasActiveFilters,
    resetFilters,
    uiEstatus,
    openDetail,
    replyFlow,
    canSendEmail,
    canSendWhatsapp,
    sendEmail,
    sendWhatsapp,
  }
}
