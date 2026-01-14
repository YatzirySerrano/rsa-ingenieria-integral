import type { Status } from './common'

export type Persona = {
    id: number
    usuario_id?: number | null
    nombre: string
    apellido_paterno?: string | null
    apellido_materno?: string | null
    telefono?: string | null
    empresa?: string | null
    rfc?: string | null
    direccion?: string | null
    nombre_completo?: string
    status: Status
}

export type PersonaPayload = {
    usuario_id?: number | null
    nombre: string
    apellido_paterno?: string | null
    apellido_materno?: string | null
    telefono?: string | null
    empresa?: string | null
    rfc?: string | null
    direccion?: string | null
    status: Status
}
