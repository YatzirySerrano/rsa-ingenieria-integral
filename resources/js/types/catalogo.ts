/**
 * Tipos del dominio de catálogo (Productos/Servicios/Cotizaciones).
 * Mantén estos tipos alineados con tus Resources de Laravel.
 */

export type Status = 'activo' | 'inactivo'

export type MarcaLite = { id: number; nombre: string }
export type CategoriaLite = { id: number; nombre: string }

export type ProductoMedia = {
    id: number
    tipo: 'imagen' | 'video'
    url: string
    orden: number
    principal: boolean
    status: Status
}

export type Producto = {
    id: number
    sku: string
    nombre: string
    descripcion: string | null
    stock: number
    costo_lista: string
    precio_venta: string
    status: Status
    marca: MarcaLite | null
    categoria: CategoriaLite | null
    medias: ProductoMedia[]
    created_at?: string
    updated_at?: string
}

export type Servicio = {
    id: number
    nombre: string
    descripcion: string | null
    precio: string
    status: Status
    categoria: CategoriaLite | null
    created_at?: string
    updated_at?: string
}

export type CotizacionDetalle = {
    id: number
    tipo: 'PRODUCTO' | 'SERVICIO'
    cantidad: string
    precio_unitario: string
    total_linea: string
    status: Status
    producto: { id: number; sku: string; nombre: string } | null
    servicio: { id: number; nombre: string } | null
}

export type Cotizacion = {
    id: number
    folio: string
    token: string
    estatus: 'BORRADOR' | 'ENVIADA' | 'ACEPTADA' | 'RECHAZADA' | 'CANCELADA'
    email_destino: string | null
    telefono_destino: string | null
    subtotal: string
    total: string
    status: Status
    detalles: CotizacionDetalle[]
    created_at?: string
}
