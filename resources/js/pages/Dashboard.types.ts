export type Role = 'admin' | 'vendedor'

export type StatusCount = {
    estatus: string
    total: number
}

export type SeriesPoint = {
    ym: string
    label: string
    total: number
    revenue: number
}

export type LatestQuote = {
    id: number
    folio: string
    estatus: string
    total: number
    created_at: string | null
    cliente: string
    vendedor: string | null
}

export type DashboardProps = {
    role: Role
    kpis: {
        cotizaciones_total: number
        monto_total: number
    }
    byStatus: StatusCount[]
    series: SeriesPoint[]
    latest: LatestQuote[]
    admin: null | {
        productos_activos: number
        servicios_activos: number
        personas_activas: number
        vendedores_activos: number
    }
}