import type { Status } from './common'

export type Servicio = {
    id: number
    categoria_id: number
    nombre: string
    descripcion?: string | null
    precio: string
    status: Status
    categoria?: { id: number; nombre: string; tipo?: string; status?: Status }
}

export type ServicioPayload = {
    categoria_id: number | null
    nombre: string
    descripcion?: string | null
    precio: string | number
    status: Status
}
