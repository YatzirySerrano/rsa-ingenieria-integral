import type { Status } from './common'

export type Marca = {
    id: number
    nombre: string
    status: Status
}

export type MarcaPayload = {
    nombre: string
    status: Status
}
