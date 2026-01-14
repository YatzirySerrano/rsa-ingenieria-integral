import type { Status } from './common'

export type Usuario = {
    id: number
    name: string
    email: string
    role?: string | null
    status?: Status
}

export type UsuarioPayload = {
    name: string
    email: string
    role?: string | null
    status?: Status
}
