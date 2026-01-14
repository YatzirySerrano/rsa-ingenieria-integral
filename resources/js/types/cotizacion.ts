import type { Status } from './common'

export type CotizacionEstatus = 'BORRADOR' | 'ENVIADA' | 'APROBADA' | 'RECHAZADA' | 'CANCELADA'
export type ItemTipo = 'PRODUCTO' | 'SERVICIO'

export type CotizacionDetalle = {
    id: number
    cotizacion_id: number
    producto_id?: number | null
    servicio_id?: number | null
    cantidad: string
    precio_unitario: string
    total_linea: string
    status: Status
    producto?: { id: number; nombre: string; precio?: string | null }
    servicio?: { id: number; nombre: string; precio?: string | null }
}

export type Cotizacion = {
    id: number
    usuario_id: number
    persona_id?: number | null
    folio: string
    token: string
    estatus: CotizacionEstatus
    email_destino?: string | null
    telefono_destino?: string | null
    subtotal: string
    total: string
    status: Status
    detalles?: CotizacionDetalle[]
}

export type CotizacionPayload = {
    persona_id?: number | null
    estatus: CotizacionEstatus
    email_destino?: string | null
    telefono_destino?: string | null
    status: Status
}

export type CotizacionAddItemPayload = {
    tipo: ItemTipo
    producto_id?: number | null
    servicio_id?: number | null
    cantidad: number
}

export type CotizacionSendPayload = {
    email_destino: string
    telefono_destino?: string | null
}
