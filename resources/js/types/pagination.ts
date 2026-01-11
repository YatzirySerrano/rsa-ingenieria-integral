/**
 * Tipos estándar de paginación (Inertia/Laravel pagination resources).
 */
export type PaginationLink = {
    url: string | null
    label: string
    active: boolean
}

export type PaginationMeta = {
    current_page: number
    last_page: number
    total: number
}

export type Paginated<T> = {
    data: T[]
    links: PaginationLink[]
    meta: PaginationMeta
}
