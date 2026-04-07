export type ProductDetailMedia = {
  id: number
  url: string
  tipo?: 'imagen' | 'video' | string
  principal?: boolean
  orden?: number
  status?: 'activo' | 'inactivo' | string
}

export type ProductDetailItem = {
  id: number
  sku?: string | null
  nombre: string
  descripcion?: string | null
  stock?: number | null
  costo_lista?: number | string | null
  precio_venta?: number | string | null
  image_url?: string | null
  status?: 'activo' | 'inactivo' | string
  marca?: { id: number; nombre: string } | null
  categoria?: { id: number; nombre: string } | null
  medias?: ProductDetailMedia[] | null
}
