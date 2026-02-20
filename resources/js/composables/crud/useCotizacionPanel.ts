import { computed, reactive, watch } from 'vue'
import { router } from '@inertiajs/vue3'
import { swalConfirm, swalNotify } from '@/lib/swal'

export type Cotizacion = {
  id: number
  folio: string
  token?: string
  estatus: string
  email_destino?: string | null
  telefono_destino?: string | null
  subtotal: number | string
  total: number | string
  total_calculado?: number | string | null
  diferencia_total?: number | string | null
  ready_to_send?: boolean
  status: 'activo' | 'inactivo'
}

type Filters = { q: string; estatus: string }

const ALL = '__all__'

export function useCotizacionPanel(opts: { initialFilters?: Partial<Filters>; baseUrl: string }) {
  const filters = reactive<Filters>({
    q: opts.initialFilters?.q ?? '',
    estatus: opts.initialFilters?.estatus ?? ALL,
  })

  const hasActiveFilters = computed(() => {
    return Boolean(filters.q.trim()) || (filters.estatus && filters.estatus !== ALL)
  })

  function uiEstatus(c: Pick<Cotizacion, 'estatus'>) {
    if (c.estatus === 'BORRADOR') return 'NUEVA'
    if (c.estatus === 'EN_REVISION') return 'EN_REVISION'
    if (c.estatus === 'DEVUELTA' || c.estatus === 'ENVIADA') return 'DEVUELTA'
    return 'NUEVA'
  }

  function applyFilters() {
    const q = filters.q.trim()
    router.get(
      opts.baseUrl,
      {
        q: q || undefined,
        estatus: filters.estatus !== ALL ? filters.estatus : undefined,
      },
      {
        preserveState: true,
        replace: true,
        preserveScroll: true,
      }
    )
  }

  let t: any = null
  watch(
    () => [filters.q, filters.estatus],
    () => {
      clearTimeout(t)
      t = setTimeout(applyFilters, 350)
    }
  )

  function resetFilters() {
    filters.q = ''
    filters.estatus = ALL
    applyFilters()
  }

  function openDetail(c: Cotizacion) {
    router.get(`${opts.baseUrl}/${c.id}`, {}, { preserveScroll: true })
  }

  function replyFlow(c: Cotizacion) {
    router.get(`${opts.baseUrl}/${c.id}`, { focus: 'reply' }, { preserveScroll: true })
  }

  function canSendEmail(c: Cotizacion) {
    const email = String(c.email_destino ?? '').trim()
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    return okEmail && Boolean(c.ready_to_send)
  }

  function canSendWhatsapp(c: Cotizacion) {
    const tel = String(c.telefono_destino ?? '').replace(/\D+/g, '')
    return tel.length >= 10 && Boolean(c.ready_to_send)
  }

  function buildEmailBody(c: Cotizacion) {
    return [
      `Cotización: ${c.folio}`,
      `Total: ${Number(c.total ?? 0).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}`,
      '',
      'Si desea que la ajustemos (cantidades/alcance), responda a este mensaje.',
    ].join('\n')
  }

  async function sendEmail(c: Cotizacion) {
    if (!canSendEmail(c)) return

    const to = String(c.email_destino ?? '').trim()
    const subject = `Cotización ${c.folio}`
    const body = buildEmailBody(c)

    const url = new URL('https://mail.google.com/mail/')
    url.searchParams.set('view', 'cm')
    url.searchParams.set('fs', '1')
    url.searchParams.set('to', to)
    url.searchParams.set('su', subject)
    url.searchParams.set('body', body)

    window.open(url.toString(), '_blank', 'noopener,noreferrer')

    router.post(`${opts.baseUrl}/${c.id}/mark-sent`, { channel: 'email' }, {
      preserveScroll: true,
      onSuccess: () => swalNotify('Marcada como enviada (email)', 'success'),
    })
  }

  async function sendWhatsapp(c: Cotizacion) {
    if (!canSendWhatsapp(c)) return

    const tel = String(c.telefono_destino ?? '').replace(/\D+/g, '')
    const text = buildEmailBody(c)
    const url = new URL(`https://wa.me/${tel}`)
    url.searchParams.set('text', text)

    window.open(url.toString(), '_blank', 'noopener,noreferrer')

    router.post(`${opts.baseUrl}/${c.id}/mark-sent`, { channel: 'whatsapp' }, {
      preserveScroll: true,
      onSuccess: () => swalNotify('Marcada como enviada (WhatsApp)', 'success'),
    })
  }

  async function destroyCotizacion(c: Cotizacion) {
    const r = await swalConfirm('Se dará de baja (status=inactivo).', {
      title: 'Eliminar cotización',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar',
      icon: 'warning',
    })
    if (!r.isConfirmed) return

    router.delete(`${opts.baseUrl}/${c.id}`, {
      preserveScroll: true,
      onSuccess: () => swalNotify('Eliminada (baja lógica)', 'success'),
    })
  }

  return {
    ALL,
    filters,
    hasActiveFilters,

    uiEstatus,
    resetFilters,
    openDetail,
    replyFlow,

    canSendEmail,
    canSendWhatsapp,
    sendEmail,
    sendWhatsapp,

    destroyCotizacion,
  }
}