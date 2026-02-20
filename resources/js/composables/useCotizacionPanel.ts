import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'

// Ajusta la ruta según donde guardaste tus helpers
import { swalConfirm, swalErr, swalNotify } from '@/lib/swal'

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

  function uiEstatus(c: Pick<Cotizacion, 'estatus'>) {
    const e = String(c.estatus ?? '').toUpperCase()
    if (e === 'BORRADOR') return 'NUEVA'
    if (e === 'EN_REVISION') return 'EN_REVISION'
    if (e === 'DEVUELTA') return 'DEVUELTA'
    if (e === 'ENVIADA') return 'DEVUELTA'
    return 'NUEVA'
  }

  function openDetail(c: Pick<Cotizacion, 'id'>) {
    router.visit(`${opts.baseUrl}/${c.id}`)
  }

  function replyFlow(c: Pick<Cotizacion, 'id'>) {
    // Te manda al show; ahí haces ajustes y respondes
    router.visit(`${opts.baseUrl}/${c.id}?reply=1`)
  }

  function canSendEmail(c: Cotizacion) {
    return isEmail(c.email_destino) && (c.estatus === 'DEVUELTA' || c.estatus === 'ENVIADA')
  }

  function canSendWhatsapp(c: Cotizacion) {
    const p = cleanPhone(c.telefono_destino)
    return !!p && (c.estatus === 'DEVUELTA' || c.estatus === 'ENVIADA')
  }

  async function sendEmail(c: Cotizacion) {
    if (!isEmail(c.email_destino)) return swalErr('Falta correo válido.')
    if (!(c.estatus === 'DEVUELTA' || c.estatus === 'ENVIADA')) {
      return swalErr('Primero responde (marca DEVUELTA) y luego envías.')
    }

    const { isConfirmed } = await swalConfirm(`Se abrirá tu cliente de correo para enviar la cotización ${c.folio}.`, {
      title: 'Enviar por correo',
      confirmText: 'Abrir correo',
    })
    if (!isConfirmed) return

    const link = `${window.location.origin}/cotizacion/${c.token}`
    const subject = `Cotización ${c.folio}`
    const body = `Hola, te comparto tu cotización ${c.folio}.\n\nVer cotización: ${link}\n\nSaludos.`
    window.open(`mailto:${encodeURIComponent(String(c.email_destino))}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')

    router.post(`${opts.baseUrl}/${c.id}/mark-sent`, { channel: 'email' }, { preserveScroll: true })
    swalNotify('Listo, correo abierto', 'success')
  }

  async function sendWhatsapp(c: Cotizacion) {
    const phone = cleanPhone(c.telefono_destino)
    if (!phone) return swalErr('Falta teléfono válido.')
    if (!(c.estatus === 'DEVUELTA' || c.estatus === 'ENVIADA')) {
      return swalErr('Primero responde (marca DEVUELTA) y luego envías.')
    }

    const { isConfirmed } = await swalConfirm(`Se abrirá WhatsApp para enviar la cotización ${c.folio}.`, {
      title: 'Enviar por WhatsApp',
      confirmText: 'Abrir WhatsApp',
    })
    if (!isConfirmed) return

    const link = `${window.location.origin}/cotizacion/${c.token}`
    const msg = `Hola, te comparto tu cotización ${c.folio}.\n${link}`
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank')

    router.post(`${opts.baseUrl}/${c.id}/mark-sent`, { channel: 'whatsapp' }, { preserveScroll: true })
    swalNotify('Listo, WhatsApp abierto', 'success')
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