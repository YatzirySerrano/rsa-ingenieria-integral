import { computed, type ComputedRef } from 'vue'
import { router } from '@inertiajs/vue3'
import { swalConfirm, swalErr, swalLoading, swalClose } from '@/lib/swal'

export type Detalle = {
  id: number
  producto_id?: number | null
  servicio_id?: number | null
  cantidad: number | string
  precio_unitario: number | string
  total_linea: number | string
  status: 'activo' | 'inactivo'
  producto?: { id: number; sku?: string | null; nombre: string } | null
  servicio?: { id: number; nombre: string } | null
}

export type Cotizacion = {
  id: number
  folio: string
  token: string
  estatus: string
  email_destino?: string | null
  telefono_destino?: string | null
  subtotal: number | string
  total: number | string
  status: 'activo' | 'inactivo'
  detalles?: Detalle[]
}

type Options = {
  baseUrl: string
  cotizacion: ComputedRef<Cotizacion>
}

function toNumber(v: any) {
  const n = typeof v === 'string' ? Number(v) : Number(v ?? 0)
  return Number.isFinite(n) ? n : 0
}

export function useCotizacionCart({ baseUrl, cotizacion }: Options) {
  const detallesActivos = computed(() => (cotizacion.value.detalles ?? []).filter((d) => d.status === 'activo'))

  function money(v: any) {
    return toNumber(v).toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
  }

  function itemLabel(d: Detalle) {
    if (d.producto) return `${d.producto.sku ? d.producto.sku + ' · ' : ''}${d.producto.nombre}`
    if (d.servicio) return d.servicio.nombre
    if (d.producto_id) return `Producto #${d.producto_id}`
    if (d.servicio_id) return `Servicio #${d.servicio_id}`
    return 'Ítem'
  }

  function addItem(payload: { tipo: 'PRODUCTO' | 'SERVICIO'; producto_id?: number | null; servicio_id?: number | null; cantidad?: number }) {
    router.post(
      `${baseUrl}/${cotizacion.value.id}/items`,
      {
        tipo: payload.tipo,
        producto_id: payload.tipo === 'PRODUCTO' ? payload.producto_id : null,
        servicio_id: payload.tipo === 'SERVICIO' ? payload.servicio_id : null,
        cantidad: payload.cantidad ?? 1,
      },
      {
        preserveScroll: true,
        onError: () => swalErr('No se pudo agregar el ítem.'),
      }
    )
  }

  function updateCantidad(detalleId: number, cantidad: number) {
    router.put(
      `${baseUrl}/detalles/${detalleId}`,
      { cantidad },
      {
        preserveScroll: true,
        onError: () => swalErr('No se pudo actualizar la cantidad.'),
      }
    )
  }

  async function removeDetalle(d: Detalle) {
    const { isConfirmed } = await swalConfirm('', {
      title: 'Quitar ítem',
      confirmText: 'Quitar',
      cancelText: 'Cancelar',
    })
    if (!isConfirmed) return

    router.delete(`${baseUrl}/detalles/${d.id}`, {
      preserveScroll: true,
      onError: () => swalErr('No se pudo quitar el ítem.'),
    })
  }

  async function markSent() {
    const { isConfirmed } = await swalConfirm('', {
      title: 'Marcar como ENVIADA',
      confirmText: 'Marcar ENVIADA',
      cancelText: 'Cancelar',
    })
    if (!isConfirmed) return

    swalLoading('Actualizando...')
    router.post(
      `${baseUrl}/${cotizacion.value.id}/mark-sent`,
      {},
      {
        preserveScroll: true,
        onFinish: () => swalClose(),
        onError: () => swalErr('No se pudo marcar como ENVIADA.'),
      }
    )
  }

  async function reply(payload: { email_destino?: string | null; telefono_destino?: string | null }) {
    const { isConfirmed } = await swalConfirm('', {
      title: 'Marcar DEVUELTA',
      confirmText: 'Marcar DEVUELTA',
      cancelText: 'Cancelar',
    })
    if (!isConfirmed) return

    swalLoading('Actualizando...')
    router.post(
      `${baseUrl}/${cotizacion.value.id}/reply`,
      {
        email_destino: payload.email_destino || null,
        telefono_destino: payload.telefono_destino || null,
      },
      {
        preserveScroll: true,
        onFinish: () => swalClose(),
        onError: () => swalErr('No se pudo marcar DEVUELTA.'),
      }
    )
  }

  return {
    detallesActivos,
    money,
    itemLabel,
    addItem,
    updateCantidad,
    removeDetalle,
    markSent,
    reply,
  }
}
