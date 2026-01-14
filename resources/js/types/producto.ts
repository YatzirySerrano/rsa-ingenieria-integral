import type { Status } from './common'

export type ProductoMediaTipo = 'imagen' | 'video'

export type ProductoMedia = {
    id: number
    producto_id: number
    tipo: ProductoMediaTipo
    url: string
    orden: number
    principal: boolean
    status: Status
}

export type Producto = {
    id: number
    marca_id: number
    categoria_id: number
    sku: string
    nombre: string
    descripcion?: string | null
    stock: number
    costo_lista: string
    precio_venta: string
    status: Status
    marca?: { id: number; nombre: string; status?: Status }
    categoria?: { id: number; nombre: string; tipo?: string; status?: Status }
    medias?: ProductoMedia[]
}

export type ProductoPayload = {
    marca_id: number | null
    categoria_id: number | null
    sku: string
    nombre: string
    descripcion?: string | null
    stock: number
    costo_lista: string | number
    precio_venta: string | number
    status: Status
}

export type ProductoMediaPayload = {
    tipo: ProductoMediaTipo
    url: string
    orden: number
    principal: boolean
    status: Status
}
