import type { Status } from './common'

export type CategoriaTipo = 'PRODUCTO' | 'SERVICIO'

export type Categoria = {
    id: number
    nombre: string
    tipo: CategoriaTipo
    status: Status
}

export type CategoriaPayload = {
    nombre: string
    tipo: CategoriaTipo
    status: Status
}
