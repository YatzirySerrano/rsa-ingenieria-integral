export type Status = 'activo' | 'inactivo'

export type Paginated<T> = {
    data: T[]
    links?: any
    meta?: any
}

export type Option = {
    id: number
    nombre: string
}

export type Flash = {
    success?: string
    error?: string
}

export type FiltersBase = {
    q?: string
    status?: Status | ''
}
