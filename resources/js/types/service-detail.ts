export type ServiceDetailCategory = {
  id: number
  nombre: string
  tipo?: string | null
  status?: string | null
}

export type ServiceDetailItem = {
  id: number
  categoria_id?: number | null
  nombre: string
  descripcion?: string | null
  precio?: number | string | null
  status?: string | null
  categoria?: ServiceDetailCategory | null
}