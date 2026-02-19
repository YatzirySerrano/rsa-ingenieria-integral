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

export type MarcaLite = { id: number; nombre: string; status?: Status }
export type CategoriaLite = { id: number; nombre: string; tipo?: string; status?: Status }

export type Producto = {
  id: number
  marca_id: number | null
  categoria_id: number | null
  sku: string
  nombre: string
  descripcion?: string | null
  stock: number
  costo_lista: number | string
  precio_venta: number | string
  status: Status
  marca?: MarcaLite | null
  categoria?: CategoriaLite | null
  medias?: ProductoMedia[]
}

export type ProductoPayload = {
  marca_id: number | null
  categoria_id: number | null
  sku: string
  nombre: string
  descripcion?: string | null
  stock: number
  costo_lista: number | string
  precio_venta: number | string
  status: Status
}

export type ProductoMediaPayload = {
  tipo: ProductoMediaTipo
  url: string
  orden: number
  principal: boolean
  status: Status
}
